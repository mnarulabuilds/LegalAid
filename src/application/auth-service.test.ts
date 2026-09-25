import { describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth-service";
import { DomainError } from "@/domain/errors";

vi.mock("@/infrastructure/auth/session", () => ({
  setSessionCookie: vi.fn(async () => {}),
  clearSessionCookie: vi.fn(async () => {}),
}));

vi.mock("@/infrastructure/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email === "exists@test") return { id: "1", email: "exists@test", passwordHash: "x", name: "E", role: "CITIZEN", countryCode: "IN", language: "en" };
        if (where.email === "user@test") return { id: "2", email: "user@test", passwordHash: "$2a$10$abcdefghijklmnopqrstuv", name: "U", role: "CITIZEN", countryCode: "IN", language: "en" };
        return null;
      }),
      create: vi.fn(async (args) => ({ id: "new", ...args.data })),
      update: vi.fn(async (args) => ({ id: args.where.id, email: "u@test", name: "U", role: "CITIZEN", countryCode: "IN", language: "en" })),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async () => "hashed"),
    compare: vi.fn(async () => false),
  },
}));

describe("AuthService", () => {
  const service = new AuthService();

  it("rejects duplicate registration", async () => {
    await expect(
      service.register({
        email: "exists@test",
        password: "password1",
        name: "Test User",
        countryCode: "IN",
        language: "en",
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("rejects invalid login", async () => {
    await expect(service.login("missing@test", "password1")).rejects.toBeInstanceOf(DomainError);
  });

  it("always creates public accounts as citizens", async () => {
    const session = await service.register({
      email: "new@test",
      password: "password1",
      name: "Test User",
      countryCode: "IN",
      language: "en",
    });
    expect(session.role).toBe("CITIZEN");
  });
});
