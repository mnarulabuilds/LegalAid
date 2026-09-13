export type ScoredLawyer = {
  id: string;
  userId: string;
  name: string;
  specialties: string[];
  jurisdictions: string[];
  wins: number;
  losses: number;
  settlements: number;
  rating: number;
  yearsExperience: number;
  verified: boolean;
  hourlyRateUsd: number;
  languagesSpoken: string[];
  bio: string;
  firmName: string | null;
  barNumber: string;
  score: number;
  reasons: string[];
};

type Candidate = Omit<ScoredLawyer, "score" | "reasons">;

export function recommendLawyers(
  candidates: Candidate[],
  query: { category: string; jurisdiction: string; language?: string },
): ScoredLawyer[] {
  return candidates
    .map((lawyer) => {
      const reasons: string[] = [];
      let score = lawyer.rating * 8;
      const specialtyHit = lawyer.specialties.includes(query.category);
      if (specialtyHit) {
        score += 28;
        reasons.push("Specializes in this matter");
      }
      if (lawyer.jurisdictions.includes(query.jurisdiction)) {
        score += 18;
        reasons.push("Licensed in your jurisdiction");
      }
      if (query.language && lawyer.languagesSpoken.includes(query.language)) {
        score += 8;
        reasons.push("Speaks your language");
      }
      const total = lawyer.wins + lawyer.losses + lawyer.settlements;
      const winRate = total === 0 ? 0.5 : (lawyer.wins + lawyer.settlements * 0.6) / total;
      score += winRate * 20;
      if (winRate >= 0.7 && total >= 8) reasons.push("Strong outcome record");
      if (lawyer.verified) {
        score += 10;
        reasons.push("Verified by LegalAid");
      }
      score += Math.min(lawyer.yearsExperience, 20) * 0.6;
      return { ...lawyer, score: Math.round(score * 10) / 10, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export function outcomeStats(wins: number, losses: number, settlements: number) {
  const total = wins + losses + settlements;
  return {
    total,
    winRate: total === 0 ? 0 : Math.round((wins / total) * 100),
    resolutionRate: total === 0 ? 0 : Math.round(((wins + settlements) / total) * 100),
  };
}
