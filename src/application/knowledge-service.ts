import { prisma } from "@/infrastructure/db/prisma";
import { NotFoundError } from "@/domain/errors";
import type { SessionUser } from "@/domain/policies/authorization";
import type { AiJudgePort } from "@/infrastructure/ai/ai-port";
import { rankLegalInstruments, type SearchableInstrument } from "@/domain/search/legal-index";

export class KnowledgeService {
  constructor(private readonly judge: AiJudgePort) {}

  async search(input: {
    query: string;
    jurisdiction?: string;
    locale?: string;
    kind?: string;
  }) {
    const where: {
      jurisdiction?: { in: string[] };
    } = {};
    if (input.jurisdiction) {
      where.jurisdiction = { in: [input.jurisdiction, "INTL"] };
    }
    const corpus = (await prisma.legalInstrument.findMany({
      where: Object.keys(where).length ? where : undefined,
    })) as SearchableInstrument[];
    return rankLegalInstruments(corpus, input);
  }

  async list(filters: { jurisdiction?: string; locale?: string; kind?: string }) {
    return prisma.legalInstrument.findMany({
      where: {
        ...(filters.jurisdiction ? { jurisdiction: { in: [filters.jurisdiction, "INTL"] } } : {}),
        ...(filters.locale ? { locale: filters.locale } : {}),
        ...(filters.kind ? { kind: filters.kind as never } : {}),
      },
      include: { children: true, parent: true },
      orderBy: [{ kind: "asc" }, { enactedYear: "asc" }, { title: "asc" }],
    });
  }

  async get(id: string) {
    const item = await prisma.legalInstrument.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
    if (!item) throw new NotFoundError("Legal instrument");
    return item;
  }

  async explain(user: SessionUser, id: string, question: string) {
    const item = await this.get(id);
    return this.judge.explainLaw({
      title: item.title,
      citation: item.citation,
      body: `${item.summary}\n\n${item.body}`,
      question,
      jurisdiction: item.jurisdiction,
      language: user.language,
    });
  }

  async ask(user: SessionUser, question: string, category: string) {
    const related = await this.search({
      query: question,
      jurisdiction: user.countryCode,
      locale: user.language,
    });
    const citations = related
      .slice(0, 4)
      .map((h) => `${h.title} (${h.citation})`)
      .join("; ");
    const raw = await this.judge.answerDoubt({
      question: citations
        ? `${question}\n\nConsider these sources: ${citations}`
        : question,
      jurisdiction: user.countryCode,
      category,
      language: user.language,
    });
    const answer = citations
      ? `${raw}\n\nSources consulted: ${citations}.`
      : raw;
    return prisma.doubt.create({
      data: {
        userId: user.id,
        question,
        answer,
        jurisdiction: user.countryCode,
        category,
      },
    });
  }

  async myDoubts(userId: string) {
    return prisma.doubt.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }
}
