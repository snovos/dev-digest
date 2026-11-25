import { rollupSeverities, type SeverityCounts } from './status.js';

/**
 * Per-PR findings counts by severity, for the PR list's Findings column.
 *
 * Only findings belonging to each PR's LATEST review count — the same review
 * whose score the list shows — so the counters and the score describe one review.
 * A PR with no latest review is absent from the result (the route renders `null`).
 */
export function countFindingsByPr(
  findingRows: { prId: string; reviewId: string; severity: string }[],
  latestReviewIdByPr: Map<string, string>,
): Map<string, SeverityCounts> {
  const severitiesByPr = new Map<string, { severity: string }[]>();
  for (const f of findingRows) {
    if (latestReviewIdByPr.get(f.prId) !== f.reviewId) continue;
    const list = severitiesByPr.get(f.prId) ?? [];
    list.push({ severity: f.severity });
    severitiesByPr.set(f.prId, list);
  }
  const out = new Map<string, SeverityCounts>();
  for (const prId of latestReviewIdByPr.keys()) {
    out.set(prId, rollupSeverities(severitiesByPr.get(prId) ?? []));
  }
  return out;
}
