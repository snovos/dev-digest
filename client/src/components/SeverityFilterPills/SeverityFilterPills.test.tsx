import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/en/prReview.json";
import { SeverityFilterPills } from "./SeverityFilterPills";

afterEach(cleanup);

function renderPills(ui: React.ReactElement) {
  return render(<NextIntlClientProvider locale="en" messages={{ prReview: messages }}>{ui}</NextIntlClientProvider>);
}

describe("SeverityFilterPills", () => {
  it("shows a pill only for severities that are present", () => {
    renderPills(<SeverityFilterPills counts={{ critical: 1, warning: 4, suggestion: 0 }} active={null} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /1 Critical/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /4 Warning/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Suggestion/ })).not.toBeInTheDocument();
  });

  it("marks the active pill as pressed", () => {
    renderPills(<SeverityFilterPills counts={{ critical: 1, warning: 4, suggestion: 0 }} active="WARNING" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /4 Warning/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /1 Critical/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("selects a severity when an inactive pill is clicked", () => {
    const onChange = vi.fn();
    renderPills(<SeverityFilterPills counts={{ critical: 1, warning: 4, suggestion: 0 }} active={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /1 Critical/ }));
    expect(onChange).toHaveBeenCalledWith("CRITICAL");
  });

  it("clears the filter when the active pill is clicked again", () => {
    const onChange = vi.fn();
    renderPills(<SeverityFilterPills counts={{ critical: 1, warning: 4, suggestion: 0 }} active="CRITICAL" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /1 Critical/ }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
