# Issue tracker: GitHub

Issues and PRDs for this repository live as GitHub issues in
`LuongCongThanh/fe-ecommerce-nike-style`. Use the `gh` CLI for operations.

## Conventions

- **Create an issue:** `gh issue create --title "..." --body "..."`
- **Read an issue:** `gh issue view <number> --comments`
- **List issues:** use `gh issue list` with appropriate `--label`, `--state`, and
  `--json` filters.
- **Comment on an issue:** `gh issue comment <number> --body "..."`
- **Apply or remove labels:** use `gh issue edit <number> --add-label "..."`
  or `--remove-label "..."`.
- **Close an issue:** `gh issue close <number> --comment "..."`

Infer the repository from `git remote -v`; `gh` does this automatically when
run inside this clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

Do not include pull requests in the queue processed by the `triage` skill.
Pull requests may still be inspected when an issue or implementation task
explicitly references one.

## Skill instructions

- When a skill says **publish to the issue tracker**, create a GitHub issue.
- When a skill says **fetch the relevant ticket**, run
  `gh issue view <number> --comments` and include its labels.
- Before creating or changing remote issues, confirm that `gh` is authenticated
  for the repository.
