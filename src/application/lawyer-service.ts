import { prisma } from "@/infrastructure/db/prisma";
import { DomainError, ForbiddenError, NotFoundError } from "@/domain/errors";
import { canVerifyLawyers, type SessionUser } from "@/domain/policies/authorization";
import { outcomeStats, recommendLawyers } from "@/domain/recommendation/lawyer-matcher";

function split(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapLawyer(row: {
  id: string;
  userId: string;
  specialties: string;
  jurisdictions: string;
  languagesSpoken: string;
  wins: number;
  losses: number;
  settlements: number;
  rating: number;
  yearsExperience: number;
  verified: boolean;
  hourlyRateUsd: number;
  bio: string;
  firmName: string | null;
  barNumber: string;
  user: { name: string; countryCode: string };
}) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.user.name,
    specialties: split(row.specialties),
    jurisdictions: split(row.jurisdictions),
    languagesSpoken: split(row.languagesSpoken),
    wins: row.wins,
    losses: row.losses,
    settlements: row.settlements,
    rating: row.rating,
    yearsExperience: row.yearsExperience,
    verified: row.verified,
    hourlyRateUsd: row.hourlyRateUsd,
    bio: row.bio,
    firmName: row.firmName,
    barNumber: row.barNumber,
  };
}

export class LawyerService {
  async list() {
    const rows = await prisma.lawyerProfile.findMany({
      select: {
        id: true,
        userId: true,
        specialties: true,
        jurisdictions: true,
        languagesSpoken: true,
        wins: true,
        losses: true,
        settlements: true,
        rating: true,
        yearsExperience: true,
        verified: true,
        hourlyRateUsd: true,
        bio: true,
        firmName: true,
        barNumber: true,
        user: { select: { name: true, countryCode: true } },
        reviews: { select: { id: true } },
      },
      orderBy: { rating: "desc" },
    });
    return rows.map((row) => ({
      ...mapLawyer(row),
      stats: outcomeStats(row.wins, row.losses, row.settlements),
      reviewCount: row.reviews.length,
    }));
  }

  async recommend(query: { category: string; jurisdiction: string; language?: string }) {
    const rows = await prisma.lawyerProfile.findMany({ include: { user: true } });
    return recommendLawyers(rows.map(mapLawyer), query);
  }

  async get(id: string) {
    const row = await prisma.lawyerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        specialties: true,
        jurisdictions: true,
        languagesSpoken: true,
        wins: true,
        losses: true,
        settlements: true,
        rating: true,
        yearsExperience: true,
        verified: true,
        hourlyRateUsd: true,
        bio: true,
        firmName: true,
        barNumber: true,
        user: { select: { name: true, countryCode: true } },
        reviews: {
          select: { id: true, rating: true, comment: true, createdAt: true, author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!row) throw new NotFoundError("Lawyer");
    return {
      ...mapLawyer(row),
      stats: outcomeStats(row.wins, row.losses, row.settlements),
      reviews: row.reviews,
    };
  }

  async upsertOwn(
    user: SessionUser,
    input: {
      barNumber: string;
      firmName?: string;
      bio: string;
      specialties: string;
      yearsExperience: number;
      hourlyRateUsd: number;
      languagesSpoken: string;
      jurisdictions: string;
    },
  ) {
    if (user.role !== "LAWYER" && user.role !== "ADMIN") throw new ForbiddenError();
    return prisma.lawyerProfile.upsert({
      where: { userId: user.id },
      update: input,
      create: { ...input, userId: user.id },
    });
  }

  async verify(admin: SessionUser, profileId: string, verified: boolean) {
    if (!canVerifyLawyers(admin)) throw new ForbiddenError();
    return prisma.lawyerProfile.update({ where: { id: profileId }, data: { verified } });
  }

  async review(user: SessionUser, lawyerId: string, rating: number, comment: string) {
    if (rating < 1 || rating > 5) throw new DomainError("Rating must be 1–5", "BAD_RATING");
    const created = await prisma.lawyerReview.create({
      data: { lawyerId, authorId: user.id, rating, comment },
    });
    const agg = await prisma.lawyerReview.aggregate({
      where: { lawyerId },
      _avg: { rating: true },
    });
    await prisma.lawyerProfile.update({
      where: { id: lawyerId },
      data: { rating: agg._avg.rating ?? rating },
    });
    return created;
  }
}
