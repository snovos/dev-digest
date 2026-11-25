import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";

vi.mock("../../../../../../../lib/hooks/reviews", () => ({
  useFindingAction: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { FindingsPanel } from "./FindingsPanel";

afterEach(cleanup);

const FINDINGS: FindingRecord[] = [
  {
    id: "f1",
    severity: "CRITICAL",
    category: "security",
    title: "Hardcoded secret",
    file: "src/config.ts",
    start_line: 11,
    end_line: 11,
    rationale: "A secret is committed.",
    suggestion: null,
    confidence: 0.95,
    kind: "finding",
    trifecta_components: null,
    evidence: null,
    review_id: "r1",
    accepted_at: null,
    dismissed_at: null,
  },
];

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("FindingsPanel (smoke)", () => {
  it("renders the toolbar + a finding card", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    expect(screen.getByText("Hide low confidence")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", () => {
    renderWithIntl(<FindingsPanel findings={[]} prId="pr1" />);
    expect(screen.getByText("No findings match")).toBeInTheDocument();
  });
});

const MIXED: FindingRecord[] = [
  { ...FINDINGS[0]!, id: "c1", severity: "CRITICAL", title: "Critical one" },
  { ...FINDINGS[0]!, id: "w1", severity: "WARNING", title: "Warning one" },
  { ...FINDINGS[0]!, id: "w2", severity: "WARNING", title: "Warning two" },
];

describe("FindingsPanel — severity filter", () => {
  it("narrows the list to the clicked severity and marks the pill active", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(screen.getByRole("button", { name: /2 Warning/ }));
    expect(screen.getByRole("button", { name: /2 Warning/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Warning one")).toBeInTheDocument();
    expect(screen.queryByText("Critical one")).not.toBeInTheDocument();
  });

  it("clicking the active pill again shows all findings", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    const pill = screen.getByRole("button", { name: /2 Warning/ });
    fireEvent.click(pill);
    fireEvent.click(pill);
    expect(screen.getByText("Critical one")).toBeInTheDocument();
    expect(screen.getByText("Warning two")).toBeInTheDocument();
  });

  it("keeps the pills showing every severity while a filter is active", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    fireEvent.click(screen.getByRole("button", { name: /2 Warning/ }));
    expect(screen.getByRole("button", { name: /1 Critical/ })).toBeInTheDocument();
  });

  it("the filter is local to one panel", () => {
    renderWithIntl(
      <>
        <FindingsPanel findings={MIXED} prId="pr1" />
        <FindingsPanel findings={[{ ...FINDINGS[0]!, id: "o1", title: "Other run finding" }]} prId="pr1" />
      </>,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /1 Critical/ })[0]!);
    expect(screen.queryByText("Warning one")).not.toBeInTheDocument();
    expect(screen.getByText("Other run finding")).toBeInTheDocument();
  });

  it("combines with hide-low-confidence", () => {
    const withLow: FindingRecord[] = [
      { ...FINDINGS[0]!, id: "w-hi", severity: "WARNING", title: "Sure warning", confidence: 0.9 },
      { ...FINDINGS[0]!, id: "w-lo", severity: "WARNING", title: "Doubtful warning", confidence: 0.2 },
    ];
    renderWithIntl(<FindingsPanel findings={withLow} prId="pr1" />);
    fireEvent.click(screen.getByRole("button", { name: /2 Warning/ }));
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("Sure warning")).toBeInTheDocument();
    expect(screen.queryByText("Doubtful warning")).not.toBeInTheDocument();
  });
});
