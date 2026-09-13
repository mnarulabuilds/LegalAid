import type { InstrumentKind } from "@/domain/catalog";

export type SearchableInstrument = {
  id: string;
  kind: InstrumentKind | string;
  title: string;
  citation: string;
  articleRef: string | null;
  summary: string;
  body: string;
  topics: string;
  tags: string;
  jurisdiction: string;
  locale: string;
  enactedYear: number | null;
  status: string;
  source: string;
  parentId: string | null;
};

export type RankedHit = SearchableInstrument & {
  score: number;
  snippet: string;
  matchedOn: string[];
};

function tokenize(q: string) {
  return q
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

function haystack(item: SearchableInstrument) {
  return {
    title: item.title.toLowerCase(),
    citation: item.citation.toLowerCase(),
    article: (item.articleRef ?? "").toLowerCase(),
    summary: item.summary.toLowerCase(),
    body: item.body.toLowerCase(),
    topics: item.topics.toLowerCase(),
    tags: item.tags.toLowerCase(),
    kind: String(item.kind).toLowerCase(),
  };
}

function snippetFrom(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  let idx = -1;
  for (const term of terms) {
    idx = lower.indexOf(term);
    if (idx >= 0) break;
  }
  if (idx < 0) return text.slice(0, 220).trim();
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + 160);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

export function rankLegalInstruments(
  corpus: SearchableInstrument[],
  input: {
    query: string;
    jurisdiction?: string;
    locale?: string;
    kind?: string;
  },
): RankedHit[] {
  const terms = tokenize(input.query);
  const kindHint = detectKindHint(input.query);

  return corpus
    .filter((item) => {
      if (input.kind && item.kind !== input.kind) return false;
      if (input.jurisdiction && item.jurisdiction !== input.jurisdiction && item.jurisdiction !== "INTL") {
        return false;
      }
      return true;
    })
    .map((item) => {
      const h = haystack(item);
      const matchedOn: string[] = [];
      let score = 0;

      if (input.jurisdiction && item.jurisdiction === input.jurisdiction) {
        score += 24;
        matchedOn.push("jurisdiction");
      } else if (item.jurisdiction === "INTL") {
        score += 4;
      }

      if (input.locale && item.locale === input.locale) {
        score += 16;
        matchedOn.push("locale");
      } else if (item.locale === "en") {
        score += 4;
      }

      if (kindHint && item.kind === kindHint) {
        score += 18;
        matchedOn.push("kind");
      }

      if (item.status === "IN_FORCE") score += 3;

      if (terms.length === 0) {
        return {
          ...item,
          score,
          snippet: item.summary.slice(0, 220),
          matchedOn,
        };
      }

      for (const term of terms) {
        if (h.title.includes(term)) {
          score += 22;
          matchedOn.push("title");
        }
        if (h.citation.includes(term) || h.article.includes(term)) {
          score += 18;
          matchedOn.push("citation");
        }
        if (h.topics.includes(term) || h.tags.includes(term)) {
          score += 12;
          matchedOn.push("topics");
        }
        if (h.summary.includes(term)) {
          score += 8;
          matchedOn.push("summary");
        }
        if (h.body.includes(term)) {
          score += 5;
          matchedOn.push("text");
        }
        if (h.kind.includes(term)) score += 6;
      }

      const uniqueMatches = [...new Set(matchedOn)];
      return {
        ...item,
        score,
        snippet: snippetFrom(`${item.summary} ${item.body}`, terms),
        matchedOn: uniqueMatches,
      };
    })
    .filter((hit) => (terms.length === 0 ? true : hit.score >= 8 || hit.matchedOn.includes("title") || hit.matchedOn.includes("text") || hit.matchedOn.includes("summary")))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}

function detectKindHint(query: string): InstrumentKind | null {
  const q = query.toLowerCase();
  if (/constitution|संविधान|constitución|grundgesetz|constitutionnel/.test(q)) return "CONSTITUTION";
  if (/amendment|संशोधन|enmienda|amendement/.test(q)) return "AMENDMENT";
  if (/act|statute|code|कानून|ley|gesetz|loi/.test(q)) return "STATUTE";
  if (/treaty|convention|covenant/.test(q)) return "TREATY";
  return null;
}
