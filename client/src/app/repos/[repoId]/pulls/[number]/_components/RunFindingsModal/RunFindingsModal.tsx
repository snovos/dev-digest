"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Modal,
  SeverityBadge,
  CategoryTag,
  ConfidenceNum,
  type Severity,
} from "@devdigest/ui";
import type { FindingRecord } from "@devdigest/shared";
import { tallySeverities } from "@/lib/severity-tally";
import { lineLabel } from "../FindingCard/helpers";

type Tab = Severity | "ALL";
const TABS: Tab[] = ["ALL", "CRITICAL", "WARNING", "SUGGESTION"];

/**
 * Findings of ONE agent run, opened from a severity counter on the Agent runs
 * card. Lists every finding; the tab for the clicked severity is pre-selected.
 * Tabs with zero findings are disabled.
 */
export function RunFindingsModal({
  findings,
  initialSeverity,
  onClose,
}: {
  findings: FindingRecord[];
  initialSeverity: Severity | null;
  onClose: () => void;
}) {
  const t = useTranslations("prReview");
  const tally = tallySeverities(findings);
  const countOf = (tab: Tab): number =>
    tab === "ALL"
      ? findings.length
      : tab === "CRITICAL"
        ? tally.critical
        : tab === "WARNING"
          ? tally.warning
          : tally.suggestion;

  const [tab, setTab] = React.useState<Tab>(
    initialSeverity && countOf(initialSeverity) > 0 ? initialSeverity : "ALL",
  );
  const visible =
    tab === "ALL" ? findings : findings.filter((f) => f.severity === tab);

  return (
    <Modal
      width={760}
      title={t("findings.modalTitle", { count: findings.length })}
      onClose={onClose}
    >
      <div style={{ padding: "16px 24px 20px" }}>
        <div
          role="tablist"
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((tb) => {
            const n = countOf(tb);
            const selected = tab === tb;
            return (
              <button
                key={tb}
                type="button"
                role="tab"
                aria-selected={selected}
                disabled={n === 0}
                onClick={() => setTab(tb)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                  background: selected ? "var(--accent-bg)" : "transparent",
                  color: n === 0 ? "var(--text-faint)" : "var(--text-primary)",
                  fontSize: 12,
                  cursor: n === 0 ? "not-allowed" : "pointer",
                }}
              >
                {tb === "ALL" ? t("findings.tabAll") : t(`severity.${tb}`)}{" "}
                <span className="tnum">{n}</span>
              </button>
            );
          })}
        </div>

        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {visible.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {t("findings.empty")}
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {visible.map((f) => (
                <li
                  key={f.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <SeverityBadge severity={f.severity as Severity} compact />
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {f.title}
                    </span>
                    <CategoryTag category={f.category} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 4,
                    }}
                  >
                    <span className="mono" style={{ color: "var(--accent)" }}>
                      {f.file}:{lineLabel(f)}
                    </span>
                    <ConfidenceNum value={f.confidence} />
                  </div>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {f.rationale}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
