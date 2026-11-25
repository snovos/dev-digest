"use client";

import { useTranslations } from "next-intl";
import { Icon, SEV, type Severity } from "@devdigest/ui";
import type { SeverityTally } from "@/lib/severity-tally";

const ORDER: { key: keyof SeverityTally; sev: Severity }[] = [
  { key: "critical", sev: "CRITICAL" },
  { key: "warning", sev: "WARNING" },
  { key: "suggestion", sev: "SUGGESTION" },
];

/**
 * Single-select severity filter for one run's findings. Shows a pill for each
 * severity present; the active pill is pressed. Clicking the active pill clears
 * the filter (onChange(null)).
 */
export function SeverityFilterPills({
  counts,
  active,
  onChange,
}: {
  counts: SeverityTally;
  active: Severity | null;
  onChange: (sev: Severity | null) => void;
}) {
  const t = useTranslations("prReview");
  const shown = ORDER.filter(({ key }) => counts[key] > 0);
  if (shown.length === 0) return null;

  return (
    <div role="group" aria-label={t("findings.countsLabel")} style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      {shown.map(({ key, sev }) => {
        const on = active === sev;
        const color = SEV[sev].c;
        const I = Icon[SEV[sev].icon];
        return (
          <button
            key={sev}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : sev)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 999,
              border: `1px solid ${color}`,
              background: on ? SEV[sev].bg : "transparent",
              color,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            <I size={13} />
            <span className="tnum">{counts[key]}</span>
            {t(`severity.${sev}`)}
          </button>
        );
      })}
    </div>
  );
}
