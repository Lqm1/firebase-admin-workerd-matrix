# Issue tracker: GitHub

Issues and specs for this repo live in GitHub Issues at `Lqm1/firebase-admin-workerd-matrix`. Use `gh` from this repo.

## Conventions

- Create an issue with `gh issue create`.
- Read an issue and its discussion with `gh issue view <number> --comments`.
- List open issues with `gh issue list --state open`; add label and state filters as needed.
- Comment with `gh issue comment <number> --body-file <file>`.
- Add or remove labels with `gh issue edit <number> --add-label <label>` or `--remove-label <label>`.
- Close an issue with `gh issue close <number> --comment <message>`.
- When a skill says "publish to the issue tracker," create a GitHub issue. When it says "fetch the relevant ticket," read the GitHub issue and its comments.

## Pull requests as a triage surface

**PRs as a request surface: no.** Set this to `yes` if external PRs should enter the triage queue.

## Wayfinding operations

The map is a GitHub issue labelled `wayfinder:map`. Child tickets are GitHub issues labelled `wayfinder:<type>`, where type is `research`, `prototype`, `grilling`, or `task`.

- Link child tickets as GitHub sub-issues. If sub-issues are unavailable, list them in the map's task list and put `Part of #<map>` in each child body.
- Record blockers with GitHub issue dependencies. If dependencies are unavailable, put `Blocked by: #<n>, #<n>` in the child body.
- To find the next ticket, inspect the map's open children in map order and skip assigned tickets or tickets with open blockers.
- Claim a ticket with `gh issue edit <number> --add-assignee @me` before working on it.
- Resolve a ticket by commenting with the answer, closing it, and adding a summary and link to the map's Decisions-so-far section.
