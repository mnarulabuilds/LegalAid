import { describe, expect, it, vi } from "vitest";
import { LawyerService } from "./lawyer-service";
import { DomainError } from "@/domain/errors";

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    lawyerProfile: {
      findMany: vi.fn(async () => [
        {
          id: "p1",
          userId: "u1",
          specialties: "EMPLOYMENT,CIVIL",
          jurisdictions: "IN",
          languagesSpoken: "en",
          wins: 5,
          losses: 1,
          settlements: 2,
          rating: 4.5,
          yearsExperience: 8,
          verified: true,
          hourlyRateUsd: 100,
          bio: "bio",
          firmName: null,
          barNumber: "BAR",
          user: { name: "Lawyer", countryCode: "IN" },
          reviews: [],
        },
      ]),
      findUnique: vi.fn(async () => ({
        id: "p1",
        userId: "u1",
        specialties: "EMPLOYMENT,CIVIL",
        jurisdictions: "IN",
        languagesSpoken: "en",
        wins: 5,
        losses: 1,
        settlements: 2,
        rating: 4.5,
        yearsExperience: 8,
        verified: true,
        hourlyRateUsd: 100,
        bio: "bio",
        firmName: null,
        barNumber: "BAR",
        user: { name: "Lawyer", countryCode: "IN" },
        reviews: [{ id: "r1", rating: 5, comment: "Great", createdAt: new Date(), author: { name: "Client" } }],
      })),
      update: vi.fn(),
      upsert: vi.fn(async (args) => args.create),
    },
    lawyerReview: {
      create: vi.fn(async () => ({ id: "r1" })),
      aggregate: vi.fn(async () => ({ _avg: { rating: 4.6 } })),
    },
  },
}));

const citizen = { id: "c1", email: "c@test", name: "C", role: "CITIZEN" as const, countryCode: "IN", language: "en" };

describe("LawyerService", () => {
  const service = new LawyerService();

  it("lists lawyers with stats", async () => {
    const rows = await service.list();
    expect(rows[0]?.specialties).toContain("EMPLOYMENT");
    expect(rows[0]?.stats.total).toBe(8);
  });

  it("rejects invalid ratings", async () => {
    await expect(service.review(citizen, "p1", 0, "bad")).rejects.toBeInstanceOf(DomainError);
  });

  it("returns safe public reviews without account credentials", async () => {
    const lawyer = await service.get("p1");
    expect(lawyer.reviews[0]?.author.name).toBe("Client");
    expect(lawyer).not.toHaveProperty("passwordHash");
  });
});
