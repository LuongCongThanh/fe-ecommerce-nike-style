# Issue tracker: local Markdown tasks

Tasks for this repo are local Markdown files committed in the repo. There are no GitHub Issues and the `gh issue` commands are not used. GitHub is only used for pull requests and their review. Format and lifecycle are defined in `docs/plan/README.md`.

## Conventions

- **Location**: `docs/plan/tasks/<NN>-<kebab-name>/spec.md`. `NN` is the work order; the name is short kebab-case English.
- **Other files in the task folder**: `plan.md` (steps, branch, risks, written before code), `report.md` (written by the implementer before returning `ok`; the retro appends "Đề xuất cho môi trường"), `metric.md` (before/after numbers; the token table is filled by script).
- **Frontmatter** of `spec.md`:

  ```yaml
  ---
  status: ready-for-agent # todo | ready-for-agent | in-progress | needs-info | blocked | ready-for-human | review | done
  blocked-by: [] # task folder names, e.g. [03-product-card]
  pr: # PR number once opened, e.g. #86
  kind: ui # ui | logic | refactor | docs
  approved: false # human sign-off on the spec/plan
  retro-turns: # turns used by the retro (agent-run fills it)
  ---
  ```

- **Body headings**: `# Spec <NN>: <title>`, a `Branch:` line, `## Problem Statement`, `## Solution`, `## Acceptance criteria`.
- **Create a task**: make the folder with the next free `NN`, write `spec.md` with `status: todo`, add a row to the table in `docs/plan/README.md`.
- **Read a task**: read `spec.md` (and `plan.md`/`report.md` if present). A bare `#42` in a PR refers to a pull request, not a task; tasks are referenced by folder name.
- **List tasks**: the table in `docs/plan/README.md`, or `grep -H '^status:' docs/plan/tasks/*/spec.md`.
- **Find work for an agent**: `status: ready-for-agent` and every folder in `blocked-by` has `status: done`.
- **Comment on a task**: append under a `## Comments` heading at the end of `spec.md`, one dated entry each. Do not rewrite earlier entries.
- **Change state**: edit `status` in the frontmatter and update the README table row in the same commit. Who may set which value is in `docs/agents/triage-labels.md`; the `agent-run` script sets the agent-owned values.
- **Close**: `status: done` (set by a human after the PR is merged), with `pr` filled in.

## Pull requests as a triage surface

**PRs as a request surface: no.** PRs are reviewed, not triaged into tasks.

## When a skill says "publish to the issue tracker"

Create a task folder and `spec.md` as above (`status: todo`).

## When a skill says "fetch the relevant ticket"

Read `docs/plan/tasks/<NN>-<name>/spec.md`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single Markdown file with **child** tasks.

- **Map**: `docs/plan/tasks/<NN>-<effort>/spec.md` with `kind: docs`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: a normal task folder whose `spec.md` begins with `Part of <NN>-<effort>`. Type goes in the body as `Type: research|prototype|grilling|task`.
- **Blocking**: the `blocked-by` frontmatter list. A ticket is unblocked when every blocker has `status: done`.
- **Frontier query**: children of the map with `status: todo` or `ready-for-agent` and no unfinished blocker; first in map order wins.
- **Claim**: set `status: in-progress`, the session's first write.
- **Resolve**: append the answer under `## Comments`, set `status: done`, then add a pointer to the map's Decisions-so-far.
