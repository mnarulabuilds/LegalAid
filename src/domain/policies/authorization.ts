import type { Role } from "../catalog";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  countryCode: string;
  language: string;
};

export function canManageCase(user: SessionUser, plaintiffId: string, assignedLawyerId?: string | null) {
  if (user.role === "ADMIN") return true;
  if (user.id === plaintiffId) return true;
  if (assignedLawyerId && user.id === assignedLawyerId) return true;
  return false;
}

export function canActAsCounsel(user: SessionUser) {
  return user.role === "LAWYER" || user.role === "ADMIN";
}

export function canVerifyLawyers(user: SessionUser) {
  return user.role === "ADMIN";
}

export function nextCaseStatus(current: string, actor: Role): string | null {
  const transitions: Record<string, Partial<Record<Role, string>>> = {
    DRAFT: { CITIZEN: "FILED", ADMIN: "FILED" },
    FILED: { LAWYER: "UNDER_REVIEW", ADMIN: "UNDER_REVIEW" },
    UNDER_REVIEW: { LAWYER: "MEDIATION", ADMIN: "MEDIATION" },
    MEDIATION: { LAWYER: "HEARING", ADMIN: "HEARING", CITIZEN: "HEARING" },
    HEARING: { LAWYER: "RESOLVED", ADMIN: "RESOLVED" },
    RESOLVED: { ADMIN: "CLOSED", CITIZEN: "CLOSED", LAWYER: "CLOSED" },
  };
  return transitions[current]?.[actor] ?? (actor === "ADMIN" ? "CLOSED" : null);
}
