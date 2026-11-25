import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/en/prReview.json";
import { SeverityCounts } from "./SeverityCounts";

afterEach(cleanup);

function renderCounts(ui: React.ReactElement) {
  return render(<NextIntlClientProvider locale="en" messages={{ prReview: messages }}>{ui}</NextIntlClientProvider>);
}

describe("SeverityCounts", () => {
  it("shows only severities that have findings, with their counts", () => {
    renderCounts(<SeverityCounts counts={{ critical: 2, warning: 0, suggestion: 1 }} emptyLabel="None" />);
    expect(screen.getByLabelText("2 Critical")).toBeInTheDocument();
    expect(screen.getByLabelText("1 Suggestion")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Warning/)).not.toBeInTheDocument();
  });

  it("renders a dash when there is no review (null counts)", () => {
    renderCounts(<SeverityCounts counts={null} emptyLabel="None" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the empty label when reviewed with zero findings", () => {
    renderCounts(<SeverityCounts counts={{ critical: 0, warning: 0, suggestion: 0 }} emptyLabel="No findings" />);
    expect(screen.getByText("No findings")).toBeInTheDocument();
  });

  it("makes each counter a button that reports its severity, without bubbling the click", () => {
    const onSelect = vi.fn();
    const onRowClick = vi.fn();
    renderCounts(
      <div onClick={onRowClick}>
        <SeverityCounts counts={{ critical: 1, warning: 1, suggestion: 0 }} onSelect={onSelect} emptyLabel="None" />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: /1 Warning/ }));
    expect(onSelect).toHaveBeenCalledWith("WARNING");
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
