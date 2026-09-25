import { describe, expect, it } from "vitest";
import { limitsForPlan, PLAN_CATALOG } from "./plans";

describe("plans", () => {
  it("defines free limits", () => {
    expect(PLAN_CATALOG.FREE.monthlyUsd).toBe(0);
    expect(limitsForPlan("FREE").maxOpenCases).toBe(1);
  });

  it("defines pro as unlimited", () => {
    expect(limitsForPlan("PRO").maxOpenCases).toBeNull();
  });
});
