import { describe, it, expect } from "vitest";
import { tallySeverities } from "./severity-tally";

describe("tallySeverities", () => {
  it("counts each severity and ignores unknown ones", () => {
    expect(
      tallySeverities([
        { severity: "CRITICAL" },
        { severity: "CRITICAL" },
        { severity: "WARNING" },
        { severity: "SUGGESTION" },
        { severity: "INFO" },
      ]),
    ).toEqual({ critical: 2, warning: 1, suggestion: 1 });
  });

  it("returns zeros for no findings", () => {
    expect(tallySeverities([])).toEqual({ critical: 0, warning: 0, suggestion: 0 });
  });
});
