import { prisma } from "@/infrastructure/db/prisma";
import { ForbiddenError, NotFoundError } from "@/domain/errors";
import { canManageCase, type SessionUser } from "@/domain/policies/authorization";
import type { AiJudgePort } from "@/infrastructure/ai/ai-port";
import type { SubscriptionService } from "@/application/subscription-service";

const safeUser = {
  id: true,
  email: true,
  name: true,
  role: true,
  countryCode: true,
  language: true,
} as const;

export class HearingService {
  constructor(
    private readonly judge: AiJudgePort,
    private readonly subscriptions: SubscriptionService,
  ) {}

  async list(user: SessionUser) {
    return prisma.hearing.findMany({
      where:
        user.role === "ADMIN"
          ? undefined
          : {
              OR: [{ case: { plaintiffId: user.id } }, { case: { assignedLawyerId: user.id } }, { parties: { some: { userId: user.id } } }],
            },
      include: { case: true, messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  async get(user: SessionUser, id: string) {
    const hearing = await prisma.hearing.findUnique({
      where: { id },
      include: {
        case: { include: { plaintiff: { select: safeUser }, assignedLawyer: { select: safeUser } } },
        messages: { orderBy: { createdAt: "asc" } },
        parties: { include: { user: { select: safeUser } } },
      },
    });
    if (!hearing) throw new NotFoundError("Hearing");
    const allowed =
      canManageCase(user, hearing.case.plaintiffId, hearing.case.assignedLawyerId) ||
      hearing.parties.some((p) => p.userId === user.id);
    if (!allowed) throw new ForbiddenError();
    return hearing;
  }

  async open(user: SessionUser, caseId: string, title?: string) {
    const matter = await prisma.case.findUnique({ where: { id: caseId } });
    if (!matter) throw new NotFoundError("Case");
    if (!canManageCase(user, matter.plaintiffId, matter.assignedLawyerId)) throw new ForbiddenError();
    if (user.role === "CITIZEN") {
      await this.subscriptions.assertFeature(user, "OPEN_HEARING");
    }
    const hearing = await prisma.hearing.create({
      data: {
        caseId,
        title: title || `AI hearing — ${matter.title}`,
        status: "IN_SESSION",
        parties: { create: { userId: user.id, side: "PLAINTIFF" } },
        messages: {
          create: {
            speakerType: "SYSTEM",
            speakerName: "Registrar",
            content: `Session opened. This AI bench will hear arguments in ${matter.jurisdiction}. It assists preparation; it is not a court of record.`,
          },
        },
      },
    });
    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: "HEARING",
        timeline: { create: { actor: user.name, message: "AI courtroom hearing commenced." } },
      },
    });
    return hearing;
  }

  async speak(user: SessionUser, hearingId: string, content: string) {
    const hearing = await this.get(user, hearingId);
    const speakerType =
      user.role === "LAWYER" ? "COUNSEL" : user.id === hearing.case.plaintiffId ? "CITIZEN" : "OPPOSING";
    await prisma.hearingMessage.create({
      data: {
        hearingId,
        userId: user.id,
        speakerType,
        speakerName: user.name,
        content,
      },
    });
    const transcript = [...hearing.messages, { speakerName: user.name, content }].map((m) => ({
      speaker: "speakerName" in m ? m.speakerName : user.name,
      content: m.content,
    }));
    const reply = await this.judge.respond({
      jurisdiction: hearing.case.jurisdiction,
      category: hearing.case.category,
      title: hearing.case.title,
      description: hearing.case.description,
      reliefSought: hearing.case.reliefSought,
      language: user.language,
      transcript,
      latestArgument: content,
      speaker: user.name,
    });
    await prisma.hearingMessage.create({
      data: {
        hearingId,
        speakerType: "JUDGE",
        speakerName: "AI Judge",
        content: reply,
      },
    });
    return this.get(user, hearingId);
  }

  async conclude(user: SessionUser, hearingId: string) {
    const hearing = await this.get(user, hearingId);
    const ruling = await this.judge.rule({
      jurisdiction: hearing.case.jurisdiction,
      category: hearing.case.category,
      title: hearing.case.title,
      description: hearing.case.description,
      reliefSought: hearing.case.reliefSought,
      language: user.language,
      transcript: hearing.messages.map((m) => ({ speaker: m.speakerName, content: m.content })),
      latestArgument: hearing.messages.at(-1)?.content ?? "",
      speaker: "bench",
    });
    await prisma.hearingMessage.create({
      data: {
        hearingId,
        speakerType: "JUDGE",
        speakerName: "AI Judge",
        content: ruling,
      },
    });
    await prisma.hearing.update({
      where: { id: hearingId },
      data: { status: "CONCLUDED", ruling },
    });
    await prisma.case.update({
      where: { id: hearing.caseId },
      data: {
        status: "RESOLVED",
        timeline: { create: { actor: "AI Judge", message: "Advisory ruling issued. Matter marked resolved on-platform." } },
      },
    });
    return this.get(user, hearingId);
  }
}
