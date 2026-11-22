/**
 * RunHistory — the badge must reflect the review OUTCOME, not the run lifecycle.
 * Regression guard for the "green ✓ done on a run that found 5 blockers" bug:
 * a settled run is colored/labelled by its denormalized blocker/finding counts,
 * and shows the review score ring.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { RunSummary } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";
import { RunHistory } from "./RunHistory";
import type { ReviewRecord } from "@devdigest/shared";
import type { Severity } from "@devdigest/ui";

afterEach(cleanup);

function run(o: Partial<RunSummary>): RunSummary {
  return {
    run_id: "run-1",
    agent_id: "a1",
    agent_name: "Security Reviewer",
    provider: "openrouter",
    model: "deepseek/deepseek-v4-flash",
    status: "done",
    error: null,
    duration_ms: 1000,
    tokens_in: 100,
    tokens_out: 50,
    findings_count: 0,
    grounding: "0/0 passed",
    ran_at: "2026-06-11T18:44:34.000Z",
    score: null,
    blockers: null,
    cost_usd: null,
    ...o,
  };
}

function renderRuns(
  runs: RunSummary[],
  reviews: ReviewRecord[] = [],
  onOpenFindings?: (runId: string, severity: Severity) => void,
) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <RunHistory runs={runs} reviews={reviews} onOpenTrace={() => {}} onOpenFindings={onOpenFindings} />
    </NextIntlClientProvider>,
  );
}

describe("RunHistory — outcome badge", () => {
  it("a done run WITH blockers reads 'rejected' (never green 'done') + shows the score ring", () => {
    renderRuns([run({ status: "done", findings_count: 5, blockers: 5, score: 0 })]);
    expect(screen.getByText("rejected")).toBeInTheDocument();
    expect(screen.queryByText("done")).not.toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument(); // CircularScore renders the number
    expect(screen.getByText(/5 blockers/)).toBeInTheDocument();
  });

  it("a clean done run reads 'approved'", () => {
    renderRuns([run({ status: "done", findings_count: 0, blockers: 0, score: 95 })]);
    expect(screen.getByText("approved")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
  });

  it("a done run with non-blocking findings reads 'reviewed'", () => {
    renderRuns([run({ status: "done", findings_count: 3, blockers: 0, score: 72 })]);
    expect(screen.getByText("reviewed")).toBeInTheDocument();
    expect(screen.queryByText(/blockers/)).not.toBeInTheDocument();
  });

  it("a failed run reads 'error'", () => {
    renderRuns([run({ status: "failed", error: "boom", score: null, blockers: null })]);
    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("a running run reads 'running'", () => {
    renderRuns([run({ status: "running", score: null, blockers: null })]);
    expect(screen.getByText("running")).toBeInTheDocument();
  });
});

describe("RunHistory — tokens and cost", () => {
  it("shows total tokens and the adaptive cost for a priced done run", () => {
    renderRuns([
      run({ status: "done", tokens_in: 8000, tokens_out: 1119, cost_usd: 0.0013, score: 38, blockers: 0 }),
    ]);
    expect(screen.getByText(/9,119 tok · \$0\.0013/)).toBeInTheDocument();
  });

  it("shows '-' (never $0.00) when a done run has no cost", () => {
    renderRuns([run({ status: "done", cost_usd: null, score: 90, blockers: 0 })]);
    expect(screen.getByText(/tok · -$/)).toBeInTheDocument();
    expect(screen.queryByText(/\$0\.00/)).not.toBeInTheDocument();
  });

  it("shows '-' for a failed run, which has no usage", () => {
    renderRuns([run({ status: "failed", error: "boom", cost_usd: null, score: null, blockers: null })]);
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});

function review(runId: string, severities: string[]): ReviewRecord {
  return {
    id: `rev-${runId}`,
    run_id: runId,
    findings: severities.map((severity, i) => ({
      id: `${runId}-${i}`,
      severity,
      category: "bug",
      title: `t${i}`,
      file: "a.ts",
      start_line: 1,
      end_line: 1,
      rationale: "",
      confidence: 0.9,
    })),
  } as unknown as ReviewRecord;
}

describe("RunHistory — findings counters", () => {
  it("shows a counter per severity instead of the old findings text", () => {
    renderRuns(
      [run({ run_id: "run-1", status: "done", score: 38, blockers: 2 })],
      [review("run-1", ["CRITICAL", "CRITICAL", "WARNING", "SUGGESTION"])],
      () => {},
    );
    expect(screen.getByRole("button", { name: /2 Critical/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1 Warning/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1 Suggestion/ })).toBeInTheDocument();
    expect(screen.queryByText(/finding\(s\)/)).not.toBeInTheDocument();
  });

  it("clicking a counter reports the run and the clicked severity", () => {
    const onOpen = vi.fn();
    renderRuns(
      [run({ run_id: "run-1", status: "done", score: 38, blockers: 2 })],
      [review("run-1", ["CRITICAL", "WARNING"])],
      onOpen,
    );
    fireEvent.click(screen.getByRole("button", { name: /1 Warning/ }));
    expect(onOpen).toHaveBeenCalledWith("run-1", "WARNING");
  });

  it("a done run with no review shows a dash, not zero counters", () => {
    renderRuns([run({ run_id: "run-9", status: "done", score: null, blockers: null })]);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });
});
