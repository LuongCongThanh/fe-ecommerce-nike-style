# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Repo layout for this project

This repo is configured as a **single-context** project.

There is not yet a root `CONTEXT.md` or `CONTEXT-MAP.md`. Until one is created, the shared domain source for this repo is the documentation set under `docs/`, with the highest-priority domain and architecture decisions in:

- `docs/README.md`
- `docs/00-core/requirements/functional-requirements.md`
- `docs/00-core/glossary.md`
- `docs/00-core/adr/`
- `docs/00-core/decision-log.md`

Supporting implementation-oriented guidance then continues in:

- `docs/FE/FE.md`
- `docs/BE.md`
- `docs/TEST.md`
- `docs/DEVOPS.md`

## Before exploring, read these

- `docs/README.md` for the reading order and precedence rules
- `docs/00-core/requirements/functional-requirements.md` for system behavior
- `docs/00-core/glossary.md` for domain language
- `docs/00-core/adr/` for architectural decisions relevant to the current topic
- `docs/00-core/decision-log.md` when a topic depends on recently closed choices

If a future `CONTEXT.md` is added at the repo root, prefer it as the single-context glossary entrypoint. If a future `CONTEXT-MAP.md` is added, treat that as a layout migration to multi-context.

## Use the glossary's vocabulary

When naming a domain concept in output, use the term defined in `docs/00-core/glossary.md`. Avoid inventing synonyms if the glossary already defines the preferred term.

If a concept needed for current work is missing, note that as a glossary gap instead of silently creating new domain language.

## Flag ADR conflicts

If a proposal or plan contradicts an ADR in `docs/00-core/adr/`, call it out explicitly rather than silently overriding it.
