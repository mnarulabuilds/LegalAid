import { describe, expect, it, vi } from "vitest";
import { KnowledgeService } from "./knowledge-service";
import type { AiJudgePort } from "@/infrastructure/ai/ai-port";
import type { SubscriptionService } from "./subscription-service";

const judge: AiJudgePort = {
  respond: vi.fn(),
  rule: vi.fn(),
  answerDoubt: vi.fn(async () => "Answer text"),
  explainLaw: vi.fn(async () => "Explanation"),
};

const subscriptions = {
  assertFeature: vi.fn(async () => ({ plan: "PRO" as const, limits: {}, usage: {}, isPro: true })),
  recordUsage: vi.fn(async () => {}),
} as unknown as SubscriptionService;

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    legalInstrument: {
      findMany: vi.fn(async () => [
        {
          id: "i1",
          kind: "STATUTE",
          title: "Test Act",
          citation: "Act 1",
          articleRef: null,
          summary: "summary",
          body: "body text about equality",
          topics: "equality",
          tags: "test",
          jurisdiction: "IN",
          locale: "en",
          enactedYear: 2000,
          status: "IN_FORCE",
          source: "seed",
          parentId: null,
        },
      ]),
      findUnique: vi.fn(async () => ({
        id: "i1",
        title: "Test Act",
        citation: "Act 1",
        summary: "summary",
        body: "body",
        jurisdiction: "IN",
      })),
    },
    doubt: {
      create: vi.fn(async (args) => ({ id: "d1", ...args.data })),
      findMany: vi.fn(async () => []),
    },
  },
}));

const user = { id: "u1", email: "u@test", name: "U", role: "CITIZEN" as const, countryCode: "IN", language: "en" };

describe("KnowledgeService", () => {
  const service = new KnowledgeService(judge, subscriptions);

  it("searches and ranks instruments", async () => {
    const hits = await service.search({ query: "equality", jurisdiction: "IN" });
    expect(hits.length).toBeGreaterThan(0);
  });

  it("stores doubt answers", async () => {
    const doubt = await service.ask(user, "What are my rights?", "CIVIL");
    expect(doubt.id).toBe("d1");
  });
});
