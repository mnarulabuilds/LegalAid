export const ROLES = ["CITIZEN", "LAWYER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const CASE_STATUSES = [
  "DRAFT",
  "FILED",
  "UNDER_REVIEW",
  "MEDIATION",
  "HEARING",
  "RESOLVED",
  "CLOSED",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_CATEGORIES = [
  "FAMILY",
  "PROPERTY",
  "EMPLOYMENT",
  "CONSUMER",
  "CRIMINAL",
  "CONTRACT",
  "CIVIL",
  "IMMIGRATION",
  "CORPORATE",
  "INTELLECTUAL_PROPERTY",
] as const;
export type CaseCategory = (typeof CASE_CATEGORIES)[number];

export const COUNTRIES = [
  { code: "IN", name: "India", locale: "en-IN", legalSystem: "Common law + constitution" },
  { code: "US", name: "United States", locale: "en-US", legalSystem: "Common law (federal + state)" },
  { code: "GB", name: "United Kingdom", locale: "en-GB", legalSystem: "Common law" },
  { code: "CA", name: "Canada", locale: "en-CA", legalSystem: "Common law / civil (Quebec)" },
  { code: "AU", name: "Australia", locale: "en-AU", legalSystem: "Common law" },
  { code: "SG", name: "Singapore", locale: "en-SG", legalSystem: "Common law" },
  { code: "AE", name: "United Arab Emirates", locale: "en-AE", legalSystem: "Civil + Sharia hybrid" },
  { code: "DE", name: "Germany", locale: "de-DE", legalSystem: "Civil law" },
  { code: "FR", name: "France", locale: "fr-FR", legalSystem: "Civil law" },
  { code: "ZA", name: "South Africa", locale: "en-ZA", legalSystem: "Mixed (Roman-Dutch + common law)" },
] as const;

export const LANGUAGES = [
  { code: "en", label: "English", speech: "en-US" },
  { code: "hi", label: "हिन्दी", speech: "hi-IN" },
  { code: "es", label: "Español", speech: "es-ES" },
  { code: "fr", label: "Français", speech: "fr-FR" },
  { code: "de", label: "Deutsch", speech: "de-DE" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const INSTRUMENT_KINDS = [
  "CONSTITUTION",
  "AMENDMENT",
  "STATUTE",
  "REGULATION",
  "TREATY",
  "CASE_NOTE",
  "PRIMER",
] as const;
export type InstrumentKind = (typeof INSTRUMENT_KINDS)[number];

export const INSTRUMENT_KIND_LABELS: Record<InstrumentKind, string> = {
  CONSTITUTION: "Constitution",
  AMENDMENT: "Amendment",
  STATUTE: "Statute / Act",
  REGULATION: "Regulation",
  TREATY: "Treaty",
  CASE_NOTE: "Leading case",
  PRIMER: "Plain-language primer",
};
