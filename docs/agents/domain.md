# Domain docs

This repository uses a **single-context** domain layout.

## Before exploring

Read the following sources in priority order:

1. `docs/00-core/requirements/functional-requirements.md`
2. `docs/00-core/glossary.md`
3. Relevant ADRs under `docs/00-core/adr/`
4. `docs/00-core/decision-log.md`
5. `CONTEXT.md`, if it exists

Use `docs/README.md` and `docs/01-delivery/reading-paths.md` to select the
additional delivery documents relevant to the task.

If `CONTEXT.md` does not exist, proceed silently. Skills such as
`grill-with-docs` and `domain-modeling` may create it lazily when domain terms
or boundaries are resolved.

## Layout

```text
/
├── CONTEXT.md                         # Created lazily when needed
├── docs/
│   ├── 00-core/
│   │   ├── requirements/
│   │   │   └── functional-requirements.md
│   │   ├── glossary.md
│   │   ├── decision-log.md
│   │   └── adr/
│   ├── 01-delivery/
│   └── agents/
└── src/                               # Added when implementation begins
```

Do not create a second `docs/adr/` tree. The canonical ADR location for this
repository is `docs/00-core/adr/`.

Supporting implementation-oriented guidance then continues in:

- `docs/FE/FE.md`
- `docs/BE.md`
- `docs/TEST.md`
- `docs/DEVOPS.md`

## Use canonical vocabulary

When naming a domain concept in an issue, plan, test, or implementation, use
the term defined in `docs/00-core/glossary.md`. Do not introduce a synonym when
the glossary already defines the concept.

If a required concept is absent, note the gap for domain modeling instead of
silently inventing permanent terminology.

## Respect existing decisions

Surface any conflict with an ADR or `docs/00-core/decision-log.md` explicitly.
Do not silently override an accepted decision. Requirements under
`docs/00-core/requirements/` remain the highest-priority source when documents
conflict.
