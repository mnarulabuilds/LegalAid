import type { AiJudgePort, JudgeContext } from "./ai-port";
import { HeuristicJudge } from "./heuristic-judge";

const SYSTEM = `You are an AI judicial officer on LegalAid, a platform that AUGMENTS human courts.
You never claim to replace judges. You are fair, calm, Socratic, and jurisdiction-aware.
You ask for evidence, cite general legal principles, and refuse to help with crime or evasion of law.
Keep responses under 180 words unless issuing a ruling.`;

export class OpenAiJudge implements AiJudgePort {
  constructor(
    private readonly apiKey: string,
    private readonly fallback: AiJudgePort = new HeuristicJudge(),
  ) {}

  private async complete(prompt: string) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error("openai_failed");
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("empty");
    return text;
  }

  async respond(context: JudgeContext) {
    try {
      return await this.complete(
        `Jurisdiction ${context.jurisdiction}, category ${context.category}, language ${context.language}.
Case: ${context.title}
Facts: ${context.description}
Prayer: ${context.reliefSought}
Transcript: ${context.transcript.map((t) => `${t.speaker}: ${t.content}`).join("\n")}
Latest from ${context.speaker}: ${context.latestArgument}
Reply as the bench, in the user's language.`,
      );
    } catch {
      return this.fallback.respond(context);
    }
  }

  async rule(context: JudgeContext) {
    try {
      return await this.complete(
        `Issue an ADVISORY ruling (not a court decree) for ${context.title} in ${context.jurisdiction}.
Facts: ${context.description}. Prayer: ${context.reliefSought}.
Transcript: ${context.transcript.map((t) => `${t.speaker}: ${t.content}`).join("\n")}
Language: ${context.language}. Include findings, issues, and next steps before a human court.`,
      );
    } catch {
      return this.fallback.rule(context);
    }
  }

  async answerDoubt(input: {
    question: string;
    jurisdiction: string;
    category: string;
    language: string;
  }) {
    try {
      return await this.complete(
        `Answer this legal information question for jurisdiction ${input.jurisdiction}, category ${input.category}, language ${input.language}.
Question: ${input.question}
Disclaim that this is not a substitute for a licensed lawyer.`,
      );
    } catch {
      return this.fallback.answerDoubt(input);
    }
  }

  async explainLaw(input: {
    title: string;
    citation: string;
    body: string;
    question: string;
    jurisdiction: string;
    language: string;
  }) {
    try {
      return await this.complete(
        `Explain this legal text in ${input.language} for a non-lawyer in ${input.jurisdiction}.
Title: ${input.title}
Citation: ${input.citation}
Text: ${input.body}
User question: ${input.question || "Explain purpose, rights, limits, and how courts apply it."}
Stay faithful to the text. Note if amendments may have changed it. Not legal advice.`,
      );
    } catch {
      return this.fallback.explainLaw(input);
    }
  }
}

export function createAiJudge(): AiJudgePort {
  const key = process.env.OPENAI_API_KEY;
  if (key && key.length > 10) return new OpenAiJudge(key);
  return new HeuristicJudge();
}
