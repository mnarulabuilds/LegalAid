import { describe, expect, it } from "vitest";
import { rankLegalInstruments, type SearchableInstrument } from "./legal-index";

const sample: SearchableInstrument = {
  id: "1",
  kind: "CONSTITUTION",
  title: "Constitution of India",
  citation: "Constitution of India, 1950",
  articleRef: "Article 14",
  summary: "Equality before law",
  body: "The State shall not deny to any person equality before the law.",
  topics: "equality,constitution",
  tags: "india",
  jurisdiction: "IN",
  locale: "en",
  enactedYear: 1950,
  status: "IN_FORCE",
  source: "seed",
  parentId: null,
};

describe("rankLegalInstruments", () => {
  it("ranks title matches highly", () => {
    const hits = rankLegalInstruments([sample], { query: "equality constitution", jurisdiction: "IN", locale: "en" });
    expect(hits[0]?.title).toContain("Constitution");
    expect(hits[0]?.score).toBeGreaterThan(20);
  });

  it("filters by jurisdiction", () => {
    const hits = rankLegalInstruments([sample], { query: "equality", jurisdiction: "US" });
    expect(hits.length).toBe(0);
  });

  it("browses corpus without a query", () => {
    const hits = rankLegalInstruments([sample], { query: "", jurisdiction: "IN" });
    expect(hits.length).toBe(1);
    expect(hits[0]?.snippet).toContain("Equality");
  });
});
