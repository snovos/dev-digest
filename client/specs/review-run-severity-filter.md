# Review run severity filter

**Route:** `/repos/:repoId/pulls/:number` (review runs section)
**Status:** accepted

## Goal
A reviewer narrows one agent run's findings to one severity with a single click.

## Behavior
- Each review run's findings toolbar shows a pill for every severity present in that run,
  with the severity icon, the count and the label (for example "1 Critical", "4 Warning").
- Clicking a pill shows only that run's findings of that severity. The pill is shown as active.
- Clicking the active pill again clears the filter and shows all findings.
- The filter works together with "Hide low confidence": both apply.
- The filter is independent per run. Changing it in one run leaves the others unchanged.
- The pills always count every severity present in the run, even while a filter is active.
- If a finding action (accept or dismiss) leaves the active severity with no findings, the
  filter clears.

## Acceptance criteria
- [ ] Given a run with 1 critical and 4 warning findings, when the panel renders, then pills "1 Critical" and "4 Warning" show with their icons, and no suggestion pill appears.
- [ ] Given a pill click, when the filter applies, then only findings of that severity are listed and that pill is pressed.
- [ ] Given an active pill, when it is clicked again, then the filter clears and all findings are listed.
- [ ] Given "Hide low confidence" is on and a severity filter is active, when the list renders, then only findings of that severity at or above the confidence threshold are listed.
- [ ] Given two runs on the page, when a filter is set in one, then the other run's list is unchanged.
- [ ] Given a filter that matches no findings, when the list renders, then the "No findings match" state shows.

## Out of scope
- Selecting several severities at once.
- Keeping the filter after a page reload.
- Filtering the Agent runs card or the PR list.
