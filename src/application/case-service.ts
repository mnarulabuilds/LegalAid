import { prisma } from "@/infrastructure/db/prisma";
import { ForbiddenError, NotFoundError } from "@/domain/errors";
import { canManageCase, canViewCase, nextCaseStatus, type SessionUser } from "@/domain/policies/authorization";
import type { CaseCategory } from "@/domain/catalog";
import type { SubscriptionService } from "@/application/subscription-service";

const safeUser = {
  id: true,
  email: true,
  name: true,
  role: true,
  countryCode: true,
  language: true,
} as const;

export class CaseService {
  constructor(private readonly subscriptions: SubscriptionService) {}
  async list(user: SessionUser) {
    if (user.role === "ADMIN") {
      return prisma.case.findMany({
        include: { plaintiff: { select: safeUser }, assignedLawyer: { select: safeUser }, hearings: true },
        orderBy: { updatedAt: "desc" },
      });
    }
    if (user.role === "LAWYER") {
      return prisma.case.findMany({
        where: {
          OR: [{ plaintiffId: user.id }, { assignedLawyerId: user.id }, { assignedLawyerId: null }],
        },
        include: { plaintiff: { select: safeUser }, assignedLawyer: { select: safeUser }, hearings: true },
        orderBy: { updatedAt: "desc" },
      });
    }
    return prisma.case.findMany({
      where: { plaintiffId: user.id },
      include: { plaintiff: { select: safeUser }, assignedLawyer: { select: safeUser }, hearings: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  async get(user: SessionUser, id: string) {
    const matter = await prisma.case.findUnique({
      where: { id },
      include: {
        plaintiff: { select: safeUser },
        assignedLawyer: { select: { ...safeUser, lawyerProfile: true } },
        hearings: { include: { messages: { include: { user: { select: safeUser } } } } },
        timeline: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!matter) throw new NotFoundError("Case");
    if (!canViewCase(user, matter)) {
      throw new ForbiddenError();
    }
    return matter;
  }

  async create(
    user: SessionUser,
    input: {
      title: string;
      description: string;
      category: CaseCategory;
      opposingParty: string;
      reliefSought: string;
    },
  ) {
    if (user.role === "CITIZEN") {
      await this.subscriptions.assertFeature(user, "CREATE_CASE");
    }
    return prisma.case.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        opposingParty: input.opposingParty,
        reliefSought: input.reliefSought,
        jurisdiction: user.countryCode,
        plaintiffId: user.id,
        timeline: {
          create: { actor: user.name, message: "Matter filed on LegalAid." },
        },
      },
    });
  }

  async advance(user: SessionUser, id: string) {
    const matter = await this.get(user, id);
    const next = nextCaseStatus(matter.status, user.role);
    if (!next) throw new ForbiddenError("This status cannot be advanced by your role");
    return prisma.case.update({
      where: { id },
      data: {
        status: next as never,
        timeline: {
          create: { actor: user.name, message: `Status moved to ${next.replaceAll("_", " ")}.` },
        },
      },
    });
  }

  async assignLawyer(user: SessionUser, caseId: string, lawyerUserId: string) {
    const matter = await this.get(user, caseId);
    if (user.role === "CITIZEN" && matter.plaintiffId !== user.id) throw new ForbiddenError();
    const lawyer = await prisma.user.findUnique({ where: { id: lawyerUserId } });
    if (!lawyer || lawyer.role !== "LAWYER") throw new NotFoundError("Lawyer");
    return prisma.case.update({
      where: { id: caseId },
      data: {
        assignedLawyerId: lawyerUserId,
        status: matter.status === "FILED" ? "UNDER_REVIEW" : matter.status,
        timeline: {
          create: { actor: user.name, message: `Counsel ${lawyer.name} engaged on the matter.` },
        },
      },
    });
  }
}
