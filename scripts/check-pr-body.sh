#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
template="$root/.github/PULL_REQUEST_TEMPLATE.md"
status=0

while IFS= read -r heading; do
  if ! grep -Fxq "$heading" <<< "${BODY//$'\r'/}"; then
    echo "::error::Missing section: $heading"
    status=1
  fi
done < <(grep -E '^#{1,3} ' "$template")

ticked=$(grep -Ec '^- \[[xX]\] (✨ Feature|🐛 Bug|♻️ Refactor|⚡ Perf|🧪 Test|🧹 Chore|📚 Docs)[[:space:]]*$' <<< "${BODY//$'\r'/}" || true)
if [[ "$ticked" != 1 ]]; then
  echo "::error::Select exactly one PR Type"
  status=1
fi

exit "$status"
