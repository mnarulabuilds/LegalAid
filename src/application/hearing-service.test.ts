import { describe, expect, it, vi } from "vitest";
import { HearingService } from "./hearing-service";
import { ForbiddenError } from "@/domain/errors";
import type { AiJudgePort } from "@/infrastructure/ai/ai-port";
import type { SubscriptionService } from "./subscription-service";

const judge: AiJudgePort = {
  respond: vi.fn(async () => "Bench reply"),
  rule: vi.fn(async () => "Ruling"),
  answerDoubt: vi.fn(),
  explainLaw: vi.fn(),
};

const subscriptions = {
  assertFeature: vi.fn(async () => ({ plan: "PRO" as const, limits: {}, usage: {}, isPro: true })),
} as unknown as SubscriptionService;

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    hearing: {
      findMany: vi.fn(async () => []),
      findUnique: vi.fn(async () => ({
        id: "h1",
        caseId: "case1",
        title: "Hearing",
        status: "IN_SESSION",
        messages: [],
        parties: [],
        ruling: null,
        case: { plaintiffId: "c1", assignedLawyerId: null, title: "Matter", jurisdiction: "IN", category: "CIVIL", description: "d", reliefSought: "r" },
      })),
      create: vi.fn(async (args) => ({ id: "h-new", ...args.data })),
      update: vi.fn(async (args) => ({ id: args.where.id, ...args.data })),
    },
    hearingMessage: { create: vi.fn(async () => ({})) },
    case: {
      findUnique: vi.fn(async () => ({ id: "case1", plaintiffId: "c1", assignedLawyerId: null, title: "Matter", jurisdiction: "IN" })),
      update: vi.fn(async () => ({})),
    },
  },
}));

const citizen = { id: "c1", email: "c@test", name: "Citizen", role: "CITIZEN" as const, countryCode: "IN", language: "en" };
const stranger = { id: "x1", email: "x@test", name: "X", role: "CITIZEN" as const, countryCode: "IN", language: "en" };

describe("HearingService", () => {
  const service = new HearingService(judge, subscriptions);

  it("opens hearing for plaintiff", async () => {
    const hearing = await service.open(citizen, "case1");
    expect(hearing.id).toBe("h-new");
  });

  it("forbids strangers", async () => {
    await expect(service.get(stranger, "h1")).rejects.toBeInstanceOf(ForbiddenError);
  });
});
