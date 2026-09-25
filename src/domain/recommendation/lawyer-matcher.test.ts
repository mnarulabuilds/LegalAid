import { describe, expect, it } from "vitest";
import { outcomeStats, recommendLawyers } from "./lawyer-matcher";

const base = {
  id: "1",
  userId: "u1",
  name: "Test",
  specialties: ["EMPLOYMENT"],
  jurisdictions: ["IN"],
  wins: 10,
  losses: 2,
  settlements: 5,
  rating: 4.5,
  yearsExperience: 10,
  verified: true,
  hourlyRateUsd: 100,
  languagesSpoken: ["en"],
  bio: "bio",
  firmName: null,
  barNumber: "BAR",
};

describe("recommendLawyers", () => {
  it("ranks specialty and jurisdiction matches higher", () => {
    const ranked = recommendLawyers([base], { category: "EMPLOYMENT", jurisdiction: "IN", language: "en" });
    expect(ranked[0]?.score).toBeGreaterThan(50);
    expect(ranked[0]?.reasons.length).toBeGreaterThan(0);
  });
});

describe("outcomeStats", () => {
  it("computes win and resolution rates", () => {
    expect(outcomeStats(0, 0, 0).total).toBe(0);
    expect(outcomeStats(8, 2, 0).winRate).toBe(80);
  });
});
