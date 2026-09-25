export const SUBSCRIPTION_PLANS = ["FREE", "PRO"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = ["NONE", "ACTIVE", "PAST_DUE", "CANCELED", "TRIALING"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export type PlanLimits = {
  maxOpenCases: number | null;
  maxHearingsPerMonth: number | null;
  maxDoubtsPerMonth: number | null;
  libraryExplainPerMonth: number | null;
  prepPacketExport: boolean;
};

export const PLAN_CATALOG: Record<
  SubscriptionPlan,
  { name: string; monthlyUsd: number; limits: PlanLimits; description: string }
> = {
  FREE: {
    name: "Chambers Free",
    monthlyUsd: 0,
    description: "One matter, limited AI rehearsal, and library search.",
    limits: {
      maxOpenCases: 1,
      maxHearingsPerMonth: 1,
      maxDoubtsPerMonth: 3,
      libraryExplainPerMonth: 0,
      prepPacketExport: false,
    },
  },
  PRO: {
    name: "Chambers Pro",
    monthlyUsd: 29,
    description: "Unlimited matters, AI courtroom, cited explanations, and prep exports.",
    limits: {
      maxOpenCases: null,
      maxHearingsPerMonth: null,
      maxDoubtsPerMonth: null,
      libraryExplainPerMonth: null,
      prepPacketExport: true,
    },
  },
};

export function limitsForPlan(plan: SubscriptionPlan): PlanLimits {
  return PLAN_CATALOG[plan].limits;
}
