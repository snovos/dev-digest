/**
 * RunFindingsModal — opens on the clicked severity, filters by tab, and
 * disables tabs that have no findings.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";
import { RunFindingsModal } from "./RunFindingsModal";

afterEach(cleanup);

function finding(o: Partial<FindingRecord>): FindingRecord {
  return {
    id: "f",
    review_id: "rev-1",
    severity: "CRITICAL",
    category: "security",
    title: "Hardcoded key",
    file: "src/config.ts",
    start_line: 12,
    end_line: 12,
    rationale: "Literal secret in source.",
    suggestion: null,
    confidence: 0.98,
    accepted_at: null,
    dismissed_at: null,
    ...o,
  } as FindingRecord;
}

const FINDINGS = [
  finding({ id: "a", severity: "CRITICAL", title: "Hardcoded key" }),
  finding({ id: "b", severity: "CRITICAL", title: "Webhook SSRF" }),
  finding({ id: "c", severity: "WARNING", title: "N+1 query" }),
];

function renderModal(initialSeverity: "CRITICAL" | "WARNING" | "SUGGESTION" | null, findings = FINDINGS) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <RunFindingsModal findings={findings} initialSeverity={initialSeverity} onClose={() => {}} />
    </NextIntlClientProvider>,
  );
}

describe("RunFindingsModal", () => {
  it("pre-selects the clicked severity and lists only its findings", () => {
    renderModal("CRITICAL");
    expect(screen.getByRole("tab", { name: /Critical/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Hardcoded key")).toBeInTheDocument();
    expect(screen.queryByText("N+1 query")).not.toBeInTheDocument();
  });

  it("switching to All lists every finding of the run", () => {
    renderModal("CRITICAL");
    fireEvent.click(screen.getByRole("tab", { name: /All/ }));
    expect(screen.getByText("N+1 query")).toBeInTheDocument();
    expect(screen.getByText("Webhook SSRF")).toBeInTheDocument();
  });

  it("disables a severity tab that has no findings", () => {
    renderModal("CRITICAL");
    expect(screen.getByRole("tab", { name: /Suggestion/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Warning/ })).toBeEnabled();
  });

  it("falls back to All when the initial severity has no findings", () => {
    renderModal("SUGGESTION");
    expect(screen.getByRole("tab", { name: /All/ })).toHaveAttribute("aria-selected", "true");
  });
});
