import { describe, expect, it } from "vitest";
import { buildEntitlements, featureAllowed, upgradeMessage } from "./entitlements";

describe("entitlements", () => {
  const freeUsage = {
    openCases: 1,
    hearingsThisMonth: 1,
    doubtsThisMonth: 3,
    libraryExplainsThisMonth: 0,
  };

  it("blocks free tier when at limits", () => {
    const ent = buildEntitlements("FREE", freeUsage);
    expect(featureAllowed(ent, "CREATE_CASE")).toBe(false);
    expect(featureAllowed(ent, "OPEN_HEARING")).toBe(false);
    expect(featureAllowed(ent, "ASK_DOUBT")).toBe(false);
    expect(featureAllowed(ent, "EXPLAIN_INSTRUMENT")).toBe(false);
    expect(featureAllowed(ent, "EXPORT_PREP_PACKET")).toBe(false);
  });

  it("allows pro tier unlimited features", () => {
    const ent = buildEntitlements("PRO", freeUsage);
    expect(featureAllowed(ent, "CREATE_CASE")).toBe(true);
    expect(featureAllowed(ent, "EXPORT_PREP_PACKET")).toBe(true);
  });

  it("returns upgrade copy", () => {
    expect(upgradeMessage("CREATE_CASE")).toMatch(/Pro/i);
    expect(upgradeMessage("OPEN_HEARING")).toMatch(/hearing/i);
    expect(upgradeMessage("ASK_DOUBT")).toMatch(/doubts/i);
    expect(upgradeMessage("EXPLAIN_INSTRUMENT")).toMatch(/Pro/i);
    expect(upgradeMessage("EXPORT_PREP_PACKET")).toMatch(/Pro/i);
  });

  it("rejects unknown features", () => {
    const ent = buildEntitlements("FREE", freeUsage);
    expect(featureAllowed(ent, "UNKNOWN" as never)).toBe(false);
  });
});
