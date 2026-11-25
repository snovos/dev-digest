import { describe, it, expect } from 'vitest';
import { countFindingsByPr } from '../src/modules/pulls/findings-counts.js';

describe('countFindingsByPr', () => {
  it('counts only findings of each PR\'s latest review', () => {
    const latest = new Map([['pr1', 'rev-new']]);
    const rows = [
      { prId: 'pr1', reviewId: 'rev-new', severity: 'CRITICAL' },
      { prId: 'pr1', reviewId: 'rev-new', severity: 'CRITICAL' },
      { prId: 'pr1', reviewId: 'rev-new', severity: 'WARNING' },
      { prId: 'pr1', reviewId: 'rev-old', severity: 'SUGGESTION' }, // older review: ignored
    ];
    expect(countFindingsByPr(rows, latest).get('pr1')).toEqual({ critical: 2, warning: 1, suggestion: 0 });
  });

  it('returns zeros for a reviewed PR with no findings', () => {
    const latest = new Map([['pr2', 'rev-x']]);
    expect(countFindingsByPr([], latest).get('pr2')).toEqual({ critical: 0, warning: 0, suggestion: 0 });
  });

  it('omits PRs that have no latest review', () => {
    expect(countFindingsByPr([], new Map()).has('pr3')).toBe(false);
  });
});
