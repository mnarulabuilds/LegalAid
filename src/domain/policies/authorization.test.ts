import { describe, expect, it } from "vitest";
import { canActAsCounsel, canManageCase, canVerifyLawyers, canViewCase, nextCaseStatus } from "./authorization";

const citizen = { id: "c1", email: "c@test", name: "Citizen", role: "CITIZEN" as const, countryCode: "IN", language: "en" };
const lawyer = { id: "l1", email: "l@test", name: "Lawyer", role: "LAWYER" as const, countryCode: "IN", language: "en" };
const admin = { id: "a1", email: "a@test", name: "Admin", role: "ADMIN" as const, countryCode: "IN", language: "en" };
const other = { id: "x1", email: "x@test", name: "Other", role: "CITIZEN" as const, countryCode: "IN", language: "en" };

describe("canManageCase", () => {
  it("allows plaintiff and assigned counsel", () => {
    expect(canManageCase(citizen, "c1", "l1")).toBe(true);
    expect(canManageCase(lawyer, "c1", "l1")).toBe(true);
    expect(canManageCase(admin, "c1", null)).toBe(true);
    expect(canManageCase(other, "c1", "l1")).toBe(false);
  });
});

describe("canViewCase", () => {
  it("allows marketplace browse for unassigned matters", () => {
    expect(canViewCase(lawyer, { plaintiffId: "c1", assignedLawyerId: null })).toBe(true);
    expect(canViewCase(other, { plaintiffId: "c1", assignedLawyerId: "l1" })).toBe(false);
    expect(canViewCase(lawyer, { plaintiffId: "c1", assignedLawyerId: "l2" })).toBe(false);
  });
});

describe("nextCaseStatus", () => {
  it("advances filed matters for lawyers", () => {
    expect(nextCaseStatus("FILED", "LAWYER")).toBe("UNDER_REVIEW");
    expect(nextCaseStatus("FILED", "CITIZEN")).toBeNull();
    expect(nextCaseStatus("RESOLVED", "ADMIN")).toBe("CLOSED");
  });
});

describe("role helpers", () => {
  it("checks counsel and verification privileges", () => {
    expect(canActAsCounsel(lawyer)).toBe(true);
    expect(canActAsCounsel(citizen)).toBe(false);
    expect(canVerifyLawyers(admin)).toBe(true);
    expect(canVerifyLawyers(lawyer)).toBe(false);
  });
});
