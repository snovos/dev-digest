# Findings counters

**Route:** `/repos/:repoId/pulls`, `/repos/:repoId/pulls/:number`
**Status:** accepted

## Goal
A reviewer sees at a glance how many findings each agent run and each pull request
has, by severity, and can open the findings from there.

## Behavior
- **PR list:** a Findings column (between Status and Cost) shows counters for the PR's
  latest review: critical, warning, suggestion. Each counter has its severity icon and
  color. A PR with no review shows `—`. A reviewed PR with no findings shows "No findings".
- **PR details, Agent runs card:** each finished run shows the same counters in place of
  the old "N findings · M blockers" text. Clicking a counter opens the findings modal on
  that severity.
- **Findings modal:** title "N findings". Tabs: All, Critical, Warning, Suggestion. The
  tab for the clicked severity is selected first. Tabs with zero findings are disabled.
  Rows show severity, title, category, file:line, confidence and a two-line rationale.
  The modal lists every finding of the run.
- A run that failed, was cancelled, or is still running shows `-` instead of counters.
- Severity icons and colors: critical = red alert, warning = amber triangle,
  suggestion = blue lightbulb.

## Acceptance criteria
- [ ] Given a run with 2 critical, 2 warning and 1 suggestion finding, when the card renders, then three counters show 2, 2 and 1, each with its severity icon and color.
- [ ] Given a run with no findings in one severity, when the card renders, then that severity has no counter.
- [ ] Given a counter click, when the modal opens, then the matching tab is selected and the modal lists all findings of that run.
- [ ] Given the modal's Warning tab, when selected, then only warning findings are listed.
- [ ] Given a severity with zero findings in the modal, when the modal opens, then its tab is disabled.
- [ ] Given a run with no review, when the card renders, then it shows `-`.
- [ ] Given a PR with a latest review, when the list renders, then the Findings column shows that review's counters.
- [ ] Given a PR with no review, when the list renders, then the Findings column shows `—`.
- [ ] Given a run that finishes while the page is open, when it completes, then its counters appear without a reload.

## Out of scope
- Accepting or dismissing findings from the modal.
- Filtering the PR list by severity.
- An INFO severity (not part of the review contract).
- Recalculating counts from the agent's gate (blockers) setting.
