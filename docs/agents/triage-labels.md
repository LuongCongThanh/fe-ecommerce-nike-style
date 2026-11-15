# Triage Labels

The skills speak in terms of five canonical triage roles. This repo has no labels: a role is a value of the `status` field in a task's `spec.md` frontmatter (see `docs/agents/issue-tracker.md`). The full status set and its lifecycle are in `docs/plan/README.md`.

| Role in mattpocock/skills | `status` value in our tasks | Meaning                                                            |
| ------------------------- | --------------------------- | ------------------------------------------------------------------ |
| `needs-triage`            | `todo`                      | Human still has to evaluate and specify the task                   |
| `needs-info`              | `needs-info`                | Waiting on a human answer (set by the script when the agent stops) |
| `ready-for-agent`         | `ready-for-agent`           | Fully specified, every `blocked-by` is done, an agent may take it  |
| `ready-for-human`         | `ready-for-human`           | The agent stopped after 2 resumes; a human implements it           |
| `wontfix`                 | no status                   | Not actioned: delete the task folder and say why in the PR/commit  |

Statuses with no canonical role: `in-progress` (agent is running), `blocked` (waiting on a dependency or an external decision), `review` (PR open), `done` (merged).

## Who sets what

- Human: `todo`, `ready-for-agent`, `done`.
- `agent-run` script: `in-progress`, `needs-info`, `blocked`, `ready-for-human`, `review`.
- The agent itself never edits `status`.

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), set the corresponding `status` value from this table.
