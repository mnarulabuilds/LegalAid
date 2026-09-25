import { describe, expect, it } from "vitest";
import { DomainError, ForbiddenError, SubscriptionRequiredError, UnauthorizedError } from "./errors";

describe("domain errors", () => {
  it("carries http status codes", () => {
    expect(new UnauthorizedError().status).toBe(401);
    expect(new ForbiddenError().status).toBe(403);
    expect(new SubscriptionRequiredError("upgrade").status).toBe(402);
    expect(new DomainError("bad", "BAD", 409).code).toBe("BAD");
  });
});
