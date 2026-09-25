import type { PlanLimits, SubscriptionPlan } from "./plans";
import { limitsForPlan } from "./plans";

export type UsageSnapshot = {
  openCases: number;
  hearingsThisMonth: number;
  doubtsThisMonth: number;
  libraryExplainsThisMonth: number;
};

export type Entitlements = {
  plan: SubscriptionPlan;
  limits: PlanLimits;
  usage: UsageSnapshot;
  isPro: boolean;
};

export type SubscriptionFeature =
  | "CREATE_CASE"
  | "OPEN_HEARING"
  | "ASK_DOUBT"
  | "EXPLAIN_INSTRUMENT"
  | "EXPORT_PREP_PACKET";

export function buildEntitlements(plan: SubscriptionPlan, usage: UsageSnapshot): Entitlements {
  const limits = limitsForPlan(plan);
  return {
    plan,
    limits,
    usage,
    isPro: plan === "PRO",
  };
}

export function featureAllowed(entitlements: Entitlements, feature: SubscriptionFeature): boolean {
  const { limits, usage } = entitlements;
  switch (feature) {
    case "CREATE_CASE":
      return limits.maxOpenCases === null || usage.openCases < limits.maxOpenCases;
    case "OPEN_HEARING":
      return limits.maxHearingsPerMonth === null || usage.hearingsThisMonth < limits.maxHearingsPerMonth;
    case "ASK_DOUBT":
      return limits.maxDoubtsPerMonth === null || usage.doubtsThisMonth < limits.maxDoubtsPerMonth;
    case "EXPLAIN_INSTRUMENT":
      return (
        limits.libraryExplainPerMonth === null ||
        usage.libraryExplainsThisMonth < limits.libraryExplainPerMonth
      );
    case "EXPORT_PREP_PACKET":
      return limits.prepPacketExport;
    default:
      return false;
  }
}

export function upgradeMessage(feature: SubscriptionFeature): string {
  switch (feature) {
    case "CREATE_CASE":
      return "Free plan allows one open matter. Upgrade to Chambers Pro for unlimited filings.";
    case "OPEN_HEARING":
      return "Free plan includes one AI hearing per month. Upgrade to Chambers Pro for unlimited rehearsal.";
    case "ASK_DOUBT":
      return "Free plan includes three doubts per month. Upgrade to Chambers Pro for unlimited triage.";
    case "EXPLAIN_INSTRUMENT":
      return "Instrument explanations are a Pro feature. Upgrade to Chambers Pro for cited plain-language analysis.";
    case "EXPORT_PREP_PACKET":
      return "Prep packet exports require Chambers Pro.";
    default:
      return "This feature requires Chambers Pro.";
  }
}
