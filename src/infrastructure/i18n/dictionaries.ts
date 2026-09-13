import type { LanguageCode } from "@/domain/catalog";

type Dict = {
  appName: string;
  tagline: string;
  signIn: string;
  register: string;
  dashboard: string;
  cases: string;
  lawyers: string;
  hearings: string;
  library: string;
  doubts: string;
  settings: string;
  country: string;
  language: string;
  searchLaws: string;
  searchPlaceholder: string;
  constitution: string;
  amendments: string;
  statutes: string;
  explain: string;
  disclaimer: string;
};

export const dictionaries: Record<LanguageCode, Dict> = {
  en: {
    appName: "LegalAid",
    tagline: "Augment the courts. Do not replace them.",
    signIn: "Sign in",
    register: "Create account",
    dashboard: "Chambers",
    cases: "Matters",
    lawyers: "Counsel",
    hearings: "AI courtroom",
    library: "Laws & constitution",
    doubts: "Ask a doubt",
    settings: "Locale",
    country: "Country",
    language: "Language",
    searchLaws: "Search the law",
    searchPlaceholder: "Try “article 21”, “equal protection”, “amendment”, “wages”…",
    constitution: "Constitution",
    amendments: "Amendments",
    statutes: "Statutes",
    explain: "Explain in plain language",
    disclaimer: "Educational information. Not a substitute for a court of record or licensed counsel.",
  },
  hi: {
    appName: "LegalAid",
    tagline: "न्यायालय की सहायता, स्थान नहीं।",
    signIn: "प्रवेश",
    register: "खाता बनाएँ",
    dashboard: "चैंबर्स",
    cases: "मामले",
    lawyers: "अधिवक्ता",
    hearings: "एआई न्यायालय",
    library: "विधि और संविधान",
    doubts: "प्रश्न पूछें",
    settings: "स्थान और भाषा",
    country: "देश",
    language: "भाषा",
    searchLaws: "विधि खोजें",
    searchPlaceholder: "जैसे “अनुच्छेद 21”, “समानता”, “संशोधन”…",
    constitution: "संविधान",
    amendments: "संशोधन",
    statutes: "अधिनियम",
    explain: "सरल भाषा में समझाएँ",
    disclaimer: "शैक्षिक जानकारी। यह न्यायालय या अधिवक्ता का विकल्प नहीं है।",
  },
  es: {
    appName: "LegalAid",
    tagline: "Augmenta los tribunales. No los sustituye.",
    signIn: "Entrar",
    register: "Crear cuenta",
    dashboard: "Despacho",
    cases: "Asuntos",
    lawyers: "Abogacía",
    hearings: "Sala de IA",
    library: "Leyes y constitución",
    doubts: "Consultas",
    settings: "Locale",
    country: "País",
    language: "Idioma",
    searchLaws: "Buscar el derecho",
    searchPlaceholder: "Pruebe “igualdad”, “enmienda”, “despido”…",
    constitution: "Constitución",
    amendments: "Enmiendas",
    statutes: "Leyes",
    explain: "Explicar en lenguaje sencillo",
    disclaimer: "Información educativa. No sustituye a un tribunal ni a un abogado colegiado.",
  },
  fr: {
    appName: "LegalAid",
    tagline: "Augmenter les juridictions, ne pas les remplacer.",
    signIn: "Connexion",
    register: "Créer un compte",
    dashboard: "Cabinet",
    cases: "Affaires",
    lawyers: "Avocats",
    hearings: "Audience IA",
    library: "Lois et constitution",
    doubts: "Questions",
    settings: "Locale",
    country: "Pays",
    language: "Langue",
    searchLaws: "Rechercher le droit",
    searchPlaceholder: "Essayez « dignité », « amendement », « contrat »…",
    constitution: "Constitution",
    amendments: "Amendements",
    statutes: "Lois",
    explain: "Expliquer en langage simple",
    disclaimer: "Information pédagogique. Ne remplace ni le juge ni l’avocat.",
  },
  de: {
    appName: "LegalAid",
    tagline: "Gerichte unterstützen — nicht ersetzen.",
    signIn: "Anmelden",
    register: "Konto anlegen",
    dashboard: "Kanzlei",
    cases: "Verfahren",
    lawyers: "Anwaltschaft",
    hearings: "KI-Verhandlung",
    library: "Gesetze & Grundgesetz",
    doubts: "Fragen",
    settings: "Locale",
    country: "Land",
    language: "Sprache",
    searchLaws: "Recht durchsuchen",
    searchPlaceholder: "z. B. „Menschenwürde“, „Änderung“, „Kündigung“…",
    constitution: "Verfassung",
    amendments: "Änderungen",
    statutes: "Gesetze",
    explain: "In einfacher Sprache erklären",
    disclaimer: "Bildungshinweis. Kein Ersatz für Gericht oder Anwalt.",
  },
};

export function t(lang: string) {
  return dictionaries[(lang as LanguageCode) in dictionaries ? (lang as LanguageCode) : "en"];
}
