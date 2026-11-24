---
name: plan-task
description: Turn a storefront task's spec.md into plan.md (steps, branch, test seams, risks) before any code. Use in the plan phase of agent-run, or when asked to plan docs/plan/tasks/<NN>-*. Returns need_info with questions when the spec is ambiguous and blocked/needs_approval when the plan needs guarded files or commands.
---

# Plan a task

Input: the task directory (`AGENT_TASK_DIR`, e.g. `docs/plan/tasks/03-product-card`). Output: one file, `<task dir>/plan.md`. Write nothing else. Under Claude Code automation, the planner has no Bash access. In interactive Codex, use read-only commands when needed to inspect files.

## 1. Read

- `docs/agents/issue-tracker.md`: canonical field meanings/lifecycle; `docs/agents/runner.md`: automation and guard contract.
- `spec.md`: frontmatter (`kind`, `blocked-by`, `approved`), Problem Statement, Solution, Acceptance criteria.
- `AGENTS.md`, `docs/agents/code-conventions.md`, and the `.claude/rules/` files whose path scope matches the files you expect to touch.
- `.claude/agent-guard.json`: `denyPaths`, `askPaths`, `allowCommands`. `approved:` in the spec frontmatter unlocks paths/commands for this run.
- The code: use the `explorer` agent for wide searches; read only what you need.

## 2. Decide whether to stop

- **Ambiguous spec** (situation 5): a missing decision that changes user-visible behaviour, data shape, or scope, and you cannot answer it from the spec, rules, or code. Do not write plan.md. Return `need_info` with concrete, answerable `questions` (one per ambiguity, with your proposed default when you have one). Not ambiguity: naming, file placement, or choices the rules already settle.
- **Needs approval** (situation 6): the work requires editing a deny/ask path or running a command outside `allowCommands`, and `approved:` does not cover it. Return `blocked` with `reason` starting `needs_approval:` followed by the exact paths/commands. If the rest of the plan is sound you may still write plan.md first.

## 3. Write plan.md

Same format as `be-demo` plans, in Vietnamese like the other docs under `docs/plan/`:

```markdown
# Plan <NN>: <tiêu đề lấy từ spec>

Branch: `<type>/<NN>-<slug>` (từ `dev`). <một dòng: một PR, có breaking change không>

## Phạm vi

File/thư mục sẽ tạo hoặc sửa (đường dẫn thật, đã kiểm tra tồn tại), và những gì cố ý không làm.

## Seams kiểm thử

Các điểm kiểm thử đã chốt cho `tdd` (hàm/component/hook nào, mức nào, mock gì). Agent triển khai không hỏi lại người.

## Các bước

1. [ ] <bước nhỏ, một vertical slice, kèm file chính và test đi cùng>
2. [ ] ...
       N. [ ] Chạy gate: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.

## Rủi ro

- <rủi ro, file nhạy cảm, điều cần người duyệt>
```

Rules for the plan:

- Map every acceptance criterion to at least one step and one test seam.
- Use the branch name from `spec.md` if present; otherwise `<type>/<NN>-<slug>` where the slug names the feature.
- If `kind: ui`, add a step that applies `fashion-storefront-ui-director` and lists the states to check (loading, empty, error, responsive).
- Reuse existing components, hooks, schemas and utilities; name them.
- Keep it short: steps are for the implementer, not prose.

## 4. Return

Final answer is only JSON: `{"result":"ok","reason":"..."}`, or `need_info` with `questions`, or `blocked` as above.
