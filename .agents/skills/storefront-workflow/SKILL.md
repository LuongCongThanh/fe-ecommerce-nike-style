---
name: storefront-workflow
description: Use Matt Pocock skills in an interactive storefront chat to prepare a ticket, clarify business rules, validate an assumption, split a spec, choose a test seam, or evaluate agent-run.
disable-model-invocation: true
argument-hint: '[ticket path or question]'
---

# Storefront workflow

Use this skill in an interactive chat. Read `AGENTS.md` and resolve any ticket reference to its existing `spec.md` under `docs/plan/tasks/`. For tracker writes, read `docs/agents/issue-tracker.md` for schema/lifecycle/report ownership and `docs/plan/README.md` only for index navigation. For a domain discussion, read the relevant parts of `GLOSSARY.md` and `docs/adr/` when present.

Choose the skill that answers the current request. Invoke it if the tool supports nested skill calls. In Codex, read the selected skill and any relevant companion files when a nested call is unavailable. Prefer the Matt Pocock version. In Claude Code, use `mattpocock-skills:<name>` for the published skills, including `mattpocock-skills:prototype` because the repo also has a project skill named `prototype`. Use `software-factory` directly. If a selected skill is unavailable, identify it and continue with the relevant repository guidance.

| Request                                                 | Skill              | Result                                                                                                                                                                                                |
| ------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clarify unclear business behavior                       | `grill-with-docs`  | Use `grilling` and `domain-modeling` to settle the open decisions. Record agreed vocabulary in the glossary and behavior in the ticket's acceptance criteria when editing it is in scope.             |
| Verify an API or contract assumption                    | `research`         | Check the contract and other primary sources. Keep the finding and source with the ticket when writing is in scope.                                                                                   |
| Test a UI or state-model idea                           | `prototype`        | Build a disposable example for the question. For storefront UI, also follow `fashion-storefront-ui-director`. Capture the conclusion for the ticket. Branch or commit only when separately requested. |
| Capture an agreed feature                               | `to-spec`          | Use the local spec format and its acceptance criteria. Update the existing ticket if one already owns the work.                                                                                       |
| Break an agreed feature into several deliverable slices | `to-tickets`       | Review the proposed slices and real blocking edges with the user, then write the agreed Markdown tickets.                                                                                             |
| Choose an interface or test seam                        | `codebase-design`  | Identify the callers, interface and test seam. Pass the decision to the existing `plan-task` step when it is time to plan.                                                                            |
| Evaluate or redesign how tickets reach PRs              | `software-factory` | Map the trigger, ticket tracker, orchestrator, runner, checks, human handoff and duplicate-run protection. Cite the repository code for current behavior.                                             |

For `to-spec` and `to-tickets`, publish to the local Markdown tracker. Set new tickets to `todo`, record `blocked-by` by folder name, and add them to the table in `docs/plan/README.md`. The user moves tickets to `ready-for-agent`. Existing tickets retain their status during spec edits.

End with the result of the selected skill and the next unresolved decision or workflow step. When an eligible ticket is ready for implementation, follow the existing `plan-task` and implementation entry points in `AGENTS.md`.
