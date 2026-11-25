/**
 * Tally finding severities for counters. Keys match the server's per-PR counts
 * (`critical` / `warning` / `suggestion`), so one shape serves runs and PRs.
 */
export interface SeverityTally {
  critical: number;
  warning: number;
  suggestion: number;
}

export function tallySeverities(findings: { severity: string }[]): SeverityTally {
  const t: SeverityTally = { critical: 0, warning: 0, suggestion: 0 };
  for (const f of findings) {
    if (f.severity === "CRITICAL") t.critical += 1;
    else if (f.severity === "WARNING") t.warning += 1;
    else if (f.severity === "SUGGESTION") t.suggestion += 1;
  }
  return t;
}
