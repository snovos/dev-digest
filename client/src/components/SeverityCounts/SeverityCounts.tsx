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
 * Per-severity finding counters, styled as in the design mock: the severity icon
 * and a larger count in the severity color, with a dotted underline in that color.
 * Only severities with findings are shown. When `onSelect` is given each counter
 * is a button that reports the severity (opens the findings modal).
 *
 * `counts` null means "no review" → a dash; all zero → `emptyLabel`.
 */
export function SeverityCounts({
  counts,
  onSelect,
  emptyLabel,
}: {
  counts: SeverityTally | null | undefined;
  onSelect?: (sev: Severity) => void;
  emptyLabel: string;
}) {
  const t = useTranslations("prReview");
  if (!counts) return <span style={{ color: "var(--text-muted)" }}>—</span>;

  const shown = ORDER.filter(({ key }) => counts[key] > 0);
  if (shown.length === 0) return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{emptyLabel}</span>;

  return (
    <div role="group" aria-label={t("findings.countsLabel")} style={{ display: "inline-flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      {shown.map(({ key, sev }) => {
        const n = counts[key];
        const color = SEV[sev].c;
        const label = `${n} ${t(`severity.${sev}`)}`;
        const I = Icon[SEV[sev].icon];
        const body = (
          <>
            <I size={14} />
            <span className="tnum" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>
              {n}
            </span>
          </>
        );
        const common: React.CSSProperties = {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color,
          borderBottom: `1px dotted ${color}`,
          paddingBottom: 2,
          font: "inherit",
        };
        if (!onSelect) {
          return (
            <span key={sev} aria-label={label} title={label} style={common}>
              {body}
            </span>
          );
        }
        return (
          <button
            key={sev}
            type="button"
            aria-label={`${label} — ${t("findings.open")}`}
            title={label}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(sev);
            }}
            style={{ ...common, background: "none", border: "none", borderBottom: `1px dotted ${color}`, padding: "0 0 2px", cursor: "pointer" }}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}
