#!/usr/bin/env bash
# Moves the pinned API contract (be-demo tags openapi-v*) to the newest tag and opens a PR into dev.
# Run by .github/workflows/contract-bump.yml. Try it locally without pushing:
#   DRY_RUN=1 scripts/contract-bump.sh
#
# The backend bumps the minor number for a breaking change and the patch number otherwise
# (ADR 0002 in the fashion-store workspace repository):
#   patch -> the PR squash-merges itself once every CI check is green.
#   minor -> the PR gets the breaking-contract label and waits for a person to fix the callers.
#
# Environment:
#   GH_TOKEN       token that opens and merges the PR (a PAT, so CI runs on the PR and on dev)
#   ACTIONS_TOKEN  token that reads check status and creates the label (the workflow's GITHUB_TOKEN);
#                  defaults to GH_TOKEN
set -euo pipefail
cd "$(dirname "$0")/.."

BACKEND_REPO=LuongCongThanh/be-demo
PIN_FILE=scripts/gen-api.mjs
GENERATED=src/integrations/backend/generated/openapi.ts
LABEL=breaking-contract
BRANCH_PREFIX=chore/contract-
DRY_RUN=${DRY_RUN:-}
ACTIONS_TOKEN=${ACTIONS_TOKEN:-${GH_TOKEN:-}}

current=$(grep -oP 'releases/download/openapi-v\K[0-9]+\.[0-9]+\.[0-9]+' "$PIN_FILE")
latest=$(
  gh api --paginate "repos/$BACKEND_REPO/git/matching-refs/tags/openapi-v" --jq '.[].ref' |
    sed 's|^refs/tags/openapi-v||' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1
)

if [[ -z "$latest" || "$(printf '%s\n' "$current" "$latest" | sort -V | tail -n 1)" == "$current" ]]; then
  echo "API contract is up to date: openapi-v$current"
  exit 0
fi
tag=openapi-v$latest

# The backend pushes the tag first and publishes the release (with openapi.json) right after.
if ! gh release view "$tag" --repo "$BACKEND_REPO" --json assets --jq '.assets[].name' | grep -qx openapi.json; then
  echo "Release $tag has no openapi.json yet, retrying on the next run"
  exit 0
fi

# One contract PR at a time: a newer tag waits until the previous PR (usually a breaking one) merges.
pending=$(gh pr list --base dev --state open --json number,headRefName \
  --jq "[.[] | select(.headRefName | startswith(\"$BRANCH_PREFIX\")) | .number] | first // empty")
if [[ -n "$pending" ]]; then
  echo "Waiting for PR #$pending before moving to $tag"
  exit 0
fi

IFS=. read -r cur_major cur_minor _ <<<"$current"
IFS=. read -r new_major new_minor _ <<<"$latest"
breaking=
kind=patch
if [[ "$cur_major" != "$new_major" || "$cur_minor" != "$new_minor" ]]; then
  breaking=1
  kind="breaking change"
fi

branch="${BRANCH_PREFIX}$tag"
echo "Moving openapi-v$current -> $tag ($kind)"
git switch --quiet -C "$branch"
sed -i "s|releases/download/openapi-v$current/|releases/download/$tag/|" "$PIN_FILE"
sed -i "s|be-demo/openapi-v$current/openapi.json|be-demo/$tag/openapi.json|" docs/api-integration.md
[[ -d node_modules ]] || pnpm install --frozen-lockfile
pnpm --silent gen:api

title="chore(api-sdk): bump the API contract to $tag"
compare="https://github.com/$BACKEND_REPO/compare/openapi-v$current...$tag"
if [[ -n "$breaking" ]]; then
  result="Minor bump, có Breaking Change: \`$GENERATED\` đổi, code dùng các type đó có thể không còn typecheck."
  gap="Có Breaking Change. Sửa caller theo type mới ngay trên nhánh này, rồi merge bằng tay."
  attention="Đọc diff \`$GENERATED\` và các endpoint bị đổi trong [so sánh tag]($compare)."
else
  result="Patch bump, không có Breaking Change. PR tự squash merge khi mọi check CI xanh."
  gap="Không"
  attention="Không"
fi

body=$(mktemp)
trap 'rm -f "$body"' EXIT
cat >"$body" <<EOF
# 🏷️ Type

- [ ] ✨ Feature
- [ ] 🐛 Bug
- [ ] ♻️ Refactor
- [ ] ⚡ Perf
- [ ] 🧪 Test
- [x] 🧹 Chore
- [ ] 📚 Docs

## 📌 Summary

**Làm gì:** Nâng API contract từ \`openapi-v$current\` lên \`$tag\` và sinh lại \`$GENERATED\`.

**Vì sao:** Backend vừa phát hành \`$tag\`. Workflow \`contract-bump.yml\` mở PR này tự động.

**Giải pháp:** Đổi \`PINNED\` trong \`$PIN_FILE\` (và pin ghi trong \`docs/api-integration.md\`) rồi chạy \`pnpm gen:api\`.

**Kết quả:** $result

**Module:** api-sdk

**📋 Task:** Không

## 📋 Changes

- \`$PIN_FILE\`, \`docs/api-integration.md\` → pin trỏ tới \`$tag\`.
- \`$GENERATED\` → sinh lại bằng \`pnpm gen:api\` ([so sánh tag]($compare)).

## 🔌 API / Migration / Cấu hình

- **Endpoint:** Theo [so sánh tag]($compare); đã chạy \`pnpm gen:api\`.
- **Migration:** Không
- **Biến môi trường, npm script:** Không

## 🧪 Cách kiểm

- **Tự động:** Các job CI của PR (docs, lint, OpenAPI contract, typecheck, unit tests, build).
- **Kiểm tay:** Không

## ⚠️ Gap và lưu ý

- **Chưa làm:** $gap
- **Gap / rủi ro:** Không
- **Quyết định tạm:** Không
- **Ticket mới:** Không
- **Reviewer cần chú ý:** $attention
- **Sau khi merge:** Không

## ✅ Checklist

- [ ] Đã cập nhật tài liệu và kiểm thử liên quan.
- [ ] CI xanh trước khi merge.
- [ ] Kiểm tra trình duyệt với backend thật nếu cần cho lần phát hành.

## 💬 Notes

Mở bởi \`scripts/contract-bump.sh\`. Diff chỉ gồm pin và file sinh tự động; CI là bước kiểm duy nhất.
EOF
BODY=$(cat "$body") bash scripts/check-pr-body.sh

git add "$PIN_FILE" docs/api-integration.md "$GENERATED"
git -c user.name='github-actions[bot]' -c user.email='41898282+github-actions[bot]@users.noreply.github.com' \
  commit --quiet -m "$title"

if [[ -n "$DRY_RUN" ]]; then
  git --no-pager show --stat HEAD
  echo "DRY_RUN: stopping before push. PR body:"
  cat "$body"
  exit 0
fi

git push --quiet origin "$branch"
labels=()
if [[ -n "$breaking" ]]; then
  GH_TOKEN=$ACTIONS_TOKEN gh label create "$LABEL" --force --color D93F0B \
    --description 'API contract minor bump: callers need fixing'
  labels=(--label "$LABEL")
fi
url=$(gh pr create --base dev --head "$branch" --title "$title" --body-file "$body" "${labels[@]}")
echo "Opened $url"
[[ -z "$breaking" ]] || exit 0

# Patch: wait for CI, then squash merge. Checks take a few seconds to appear on a new PR.
for _ in $(seq 20); do
  GH_TOKEN=$ACTIONS_TOKEN gh pr checks "$url" >/dev/null 2>&1 && break || sleep 15
done
if GH_TOKEN=$ACTIONS_TOKEN gh pr checks "$url" --watch --interval 30 --fail-fast >/dev/null; then
  gh pr merge "$url" --squash
  echo "Merged $url"
else
  gh pr comment "$url" --body 'CI không xanh nên PR này không tự merge. Sửa trên nhánh này rồi merge bằng tay.'
  exit 1
fi
