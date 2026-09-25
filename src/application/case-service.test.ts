import { beforeEach, describe, expect, it, vi } from "vitest";
import { CaseService } from "./case-service";
import { ForbiddenError } from "@/domain/errors";
import type { SubscriptionService } from "./subscription-service";

const subscriptions = {
  assertFeature: vi.fn(async () => ({
    plan: "PRO" as const,
    limits: {},
    usage: {},
    isPro: true,
  })),
} as unknown as SubscriptionService;

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    case: {
      findMany: vi.fn(async () => []),
      findUnique: vi.fn(async () => ({
        id: "case1",
        plaintiffId: "c1",
        assignedLawyerId: null,
        status: "FILED",
        plaintiff: {},
        assignedLawyer: null,
        hearings: [],
        timeline: [],
      })),
      create: vi.fn(async (args) => ({ id: "new", ...args.data })),
      update: vi.fn(async (args) => ({ id: args.where.id, status: "UNDER_REVIEW" })),
    },
    user: {
      findUnique: vi.fn(async () => ({ id: "l1", role: "LAWYER", name: "Lawyer" })),
    },
  },
}));

const citizen = { id: "c1", email: "c@test", name: "Citizen", role: "CITIZEN" as const, countryCode: "IN", language: "en" };
const stranger = { id: "x1", email: "x@test", name: "X", role: "CITIZEN" as const, countryCode: "IN", language: "en" };

describe("CaseService", () => {
  const service = new CaseService(subscriptions);

  beforeEach(() => vi.clearAllMocks());

  it("lists citizen cases", async () => {
    const rows = await service.list(citizen);
    expect(rows).toEqual([]);
  });

  it("allows plaintiff to view case", async () => {
    const matter = await service.get(citizen, "case1");
    expect(matter.id).toBe("case1");
  });

  it("forbids unrelated citizens", async () => {
    await expect(service.get(stranger, "case1")).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("creates case after subscription check", async () => {
    const created = await service.create(citizen, {
      title: "Test matter title",
      description: "A long enough description for validation rules.",
      category: "CIVIL",
      opposingParty: "Acme",
      reliefSought: "Injunction and damages sought.",
    });
    expect(created.id).toBe("new");
    expect(subscriptions.assertFeature).toHaveBeenCalled();
  });
});
