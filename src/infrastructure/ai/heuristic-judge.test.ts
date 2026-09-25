import { describe, expect, it } from "vitest";
import { HeuristicJudge } from "./heuristic-judge";

const ctx = {
  jurisdiction: "IN",
  category: "EMPLOYMENT",
  title: "Wage dispute",
  description: "Employer withheld wages",
  reliefSought: "Payment of dues",
  language: "en",
  transcript: [{ speaker: "Clerk", content: "Court is open" }],
  latestArgument: "We seek compensation and evidence on record",
  speaker: "Party",
};

describe("HeuristicJudge", () => {
  const judge = new HeuristicJudge();

  it("responds with bench language", async () => {
    const text = await judge.respond(ctx);
    expect(text).toMatch(/Bench note/i);
  });

  it("issues advisory ruling", async () => {
    const text = await judge.rule(ctx);
    expect(text).toMatch(/PROVISIONAL DETERMINATION/i);
  });

  it("answers doubts with disclaimer", async () => {
    const text = await judge.answerDoubt({
      question: "Can employer withhold pay?",
      jurisdiction: "IN",
      category: "EMPLOYMENT",
      language: "en",
    });
    expect(text).toMatch(/not legal advice/i);
  });

  it("handles evidence and hostile submissions", async () => {
    const evidence = await judge.respond({ ...ctx, latestArgument: "We submit documentary evidence and witness proof." });
    expect(evidence).toMatch(/evidence/i);
    const remedy = await judge.respond({ ...ctx, latestArgument: "We seek compensation and injunctive relief." });
    expect(remedy).toMatch(/Relief must follow/i);
    const hostile = await judge.respond({ ...ctx, latestArgument: "They are liars and criminals." });
    expect(hostile).toMatch(/restraint/i);
    const opening = await judge.respond({ ...ctx, transcript: [], latestArgument: "May it please the court, we appear for the plaintiff." });
    expect(opening).toMatch(/Hearing is open/i);
  });

  it("explains law in hindi", async () => {
    const text = await judge.explainLaw({
      title: "Article 21",
      citation: "Art 21",
      body: "Protection of life and liberty.",
      question: "What does this mean?",
      jurisdiction: "IN",
      language: "hi",
    });
    expect(text).toMatch(/सरल भाषा/i);
  });

  it("supports localized prefixes and the general response path", async () => {
    for (const language of ["es", "fr", "de", "pt"]) {
      const text = await judge.respond({ ...ctx, language, latestArgument: "The disputed facts are on the record.", transcript: [{ speaker: "Party", content: "Opening" }, { speaker: "Opposing", content: "Reply" }] });
      expect(text).toMatch(/submission|disputed facts/i);
    }
  });

  it("supports Hindi doubt answers and empty law questions", async () => {
    const doubt = await judge.answerDoubt({ question: "What is the limit?", jurisdiction: "IN", category: "CIVIL", language: "hi" });
    expect(doubt).toMatch(/कानूनी सलाह/);
    const explanation = await judge.explainLaw({ title: "Act", citation: "s. 1", body: "A provision.", question: "", jurisdiction: "IN", language: "en" });
    expect(explanation).toMatch(/What does this provision do/);
  });
});
