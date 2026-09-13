import type { AiJudgePort, JudgeContext } from "./ai-port";

function langPrefix(language: string) {
  if (language === "hi") return "न्यायिक टिप्पणी: ";
  if (language === "es") return "Observación del tribunal: ";
  if (language === "fr") return "Observation du tribunal : ";
  if (language === "de") return "Gerichtliche Feststellung: ";
  return "Bench note: ";
}

export class HeuristicJudge implements AiJudgePort {
  async respond(context: JudgeContext): Promise<string> {
    const prefix = langPrefix(context.language);
    const last = context.latestArgument.toLowerCase();
    const askedEvidence = /evidence|exhibit|document|proof|witness/.test(last);
    const askedRemedy = /compensation|injunction|damages|relief|order/.test(last);
    const hostile = /always|never|liar|fraud|criminal/.test(last);

    if (hostile) {
      return `${prefix}Counsel and parties will address the bench with restraint. Characterizations are not proof. Confine submissions to facts, applicable ${context.jurisdiction} law, and the pleaded ${context.category.toLowerCase()} issues in “${context.title}”.`;
    }
    if (askedEvidence) {
      return `${prefix}The court will receive documentary and oral evidence. Identify each exhibit, its provenance, and the fact it is offered to prove. The opposing side may object on relevance and authenticity.`;
    }
    if (askedRemedy) {
      return `${prefix}Relief must follow the cause of action. The pleaded prayer is: ${context.reliefSought}. Address proportionality, alternative remedies, and whether interim protection is necessary before a final order.`;
    }
    if (context.transcript.length < 2) {
      return `${prefix}Hearing is open on ${context.title} (${context.category}, ${context.jurisdiction}). Plaintiff will outline facts. Defendant will reply. This tribunal augments, and does not replace, the competent court of record.`;
    }
    return `${prefix}The bench has noted the submission. Next: (1) the disputed facts, (2) the governing rule in ${context.jurisdiction}, (3) how that rule applies, (4) the precise order sought. Keep argument to those four points.`;
  }

  async rule(context: JudgeContext): Promise<string> {
    const prefix = langPrefix(context.language);
    return `${prefix}PROVISIONAL DETERMINATION (advisory, not a decree of a court of record).\n\nMatter: ${context.title}\nJurisdiction: ${context.jurisdiction} · Category: ${context.category}\nPrayer: ${context.reliefSought}\n\nFindings (on the record as presented):\n1. The dispute is justiciable and within the selected jurisdiction for platform assistance.\n2. Parties have been heard. Gaps in evidence, if any, go to weight, not automatically to dismissal.\n3. Applicable principles of ${context.category.toLowerCase()} law should be applied proportionately.\n\nRecommended next steps:\n• Preserve documents and correspondence.\n• Consider mediation before contested trial.\n• Engage licensed counsel for filings before the competent forum.\n\nThis AI hearing is an aid to preparation and access to justice. Final determination rests with human judges and the legal system of ${context.jurisdiction}.`;
  }

  async answerDoubt(input: {
    question: string;
    jurisdiction: string;
    category: string;
    language: string;
  }): Promise<string> {
    const prefix =
      input.language === "hi"
        ? "सामान्य जानकारी (यह कानूनी सलाह नहीं है): "
        : "General information (not legal advice): ";
    return `${prefix}For a ${input.category.toLowerCase()} question in ${input.jurisdiction}: start with the facts, the limitation period, the competent forum, and the documents you already hold. Your question — “${input.question}” — typically turns on (a) standing, (b) the legal duty alleged, (c) breach, and (d) remedy. LegalAid can draft a case file, recommend a specialist lawyer, or open an AI hearing so you can test arguments. A licensed advocate should review anything you file in court.`;
  }

  async explainLaw(input: {
    title: string;
    citation: string;
    body: string;
    question: string;
    jurisdiction: string;
    language: string;
  }): Promise<string> {
    const prefix =
      input.language === "hi"
        ? "सरल भाषा में (यह कानूनी सलाह नहीं है): "
        : input.language === "es"
          ? "En lenguaje sencillo (no es asesoría legal): "
          : input.language === "fr"
            ? "En langage simple (ceci n’est pas un conseil juridique) : "
            : input.language === "de"
              ? "In einfacher Sprache (keine Rechtsberatung): "
              : "In plain language (not legal advice): ";
    const ask = input.question.trim()
      ? ` Your question: ${input.question}`
      : " What does this provision do, who it protects, and how a court usually reads it?";
    return `${prefix}${input.title} (${input.citation}, ${input.jurisdiction}). ${input.body.slice(0, 320)} ${ask} Read it as: purpose → protected persons → duty or right → limits/exceptions → typical remedy. Amendments and later statutes may qualify the original text. Confirm the in-force version before relying on it in court.`;
  }
}
