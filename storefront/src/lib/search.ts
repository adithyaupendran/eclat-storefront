/**
 * Natural Language Search Engine — ÉCLAT Edition
 *
 * Parses free-form queries like:
 *   "I'm feeling something gothic"
 *   "suggest me a warm coat for the rain"
 *   "something in size M, elegant evening wear"
 *
 * No LLM required — uses a deterministic semantic tag map.
 * Fast, offline, zero latency.
 *
 * Returns:
 *   - scored product matches (sorted best-first)
 *   - any sizes extracted from the query (for the behavioral store)
 *
 * Size memory:
 *   Extracted sizes are returned so the caller can persist them in
 *   BehavioralSignal.sizePreferences. On subsequent queries (even without
 *   size mention), remembered sizes are used to float size-matched items.
 */

import { ECLAT_CATALOG, type Product } from "@/lib/mock/catalog";

// ─── Semantic tag map: mood/attribute → product tags ─────────────────────────
const SEMANTIC_MAP: Record<string, string[]> = {
  // Moods & aesthetics
  gothic:       ["structured", "statement", "outerwear", "accessories", "outerwear"],
  dark:         ["structured", "statement", "outerwear", "accessories"],
  moody:        ["structured", "statement", "outerwear"],
  dramatic:     ["structured", "statement", "outerwear", "footwear"],
  elegant:      ["luxury", "silk", "evening", "formal"],
  minimal:      ["minimal", "everyday", "wfh", "cotton"],
  classic:      ["classic", "archival", "structured"],
  bold:         ["statement", "structured", "footwear"],
  romantic:     ["silk", "evening", "luxury"],
  editorial:    ["statement", "structured", "luxury"],
  avant:        ["structured", "statement", "outerwear"],
  garde:        ["structured", "statement"],
  architectural: ["structured", "outerwear", "footwear"],
  sculptural:   ["structured", "outerwear", "accessories"],
  raw:          ["structured", "outerwear", "archival"],

  // Occasions & use
  evening:      ["evening", "night", "formal", "silk"],
  night:        ["night", "evening", "formal"],
  office:       ["minimal", "everyday", "separates"],
  work:         ["minimal", "everyday", "wfh", "separates"],
  weekend:      ["minimal", "everyday", "cotton"],
  party:        ["evening", "night", "formal", "statement"],
  date:         ["evening", "silk", "luxury", "footwear"],
  formal:       ["formal", "evening", "luxury"],
  casual:       ["everyday", "minimal", "cotton", "wfh"],
  outdoor:      ["rain", "cold", "outerwear"],
  travel:       ["everyday", "minimal", "sets"],
  winter:       ["winter", "wool", "outerwear", "cold"],
  rain:         ["rain", "cold", "outerwear"],
  cold:         ["cold", "winter", "wool", "outerwear"],
  warm:         ["winter", "wool", "outerwear"],

  // Garment types
  coat:         ["outerwear"],
  jacket:       ["outerwear"],
  trench:       ["outerwear", "archival"],
  blazer:       ["outerwear", "structured"],
  top:          ["separates"],
  blouse:       ["separates", "silk"],
  shirt:        ["separates"],
  trouser:      ["separates", "minimal"],
  pants:        ["separates", "minimal"],
  dress:        ["separates", "evening"],
  shoes:        ["footwear"],
  heels:        ["footwear", "evening"],
  bag:          ["accessories"],
  clutch:       ["accessories", "evening"],
  accessories:  ["accessories"],
  set:          ["sets"],

  // Texture / material
  silk:         ["silk", "luxury"],
  wool:         ["wool", "winter"],
  leather:      ["leather", "accessories"],
  canvas:       ["canvas", "structured"],
  cotton:       ["cotton", "minimal", "everyday"],

  // Style descriptors
  luxury:       ["luxury"],
  premium:      ["luxury"],
  investment:   ["luxury", "outerwear", "accessories"],
  statement:    ["statement"],
  effortless:   ["minimal", "silk", "everyday"],
  structured:   ["structured", "outerwear"],
  fluid:        ["silk", "separates"],
  oversized:    ["outerwear", "wool"],
  fitted:       ["separates", "structured"],
  layering:     ["sets", "everyday"],
  monochrome:   ["minimal", "structured"],
};

// ─── Sizes to detect ─────────────────────────────────────────────────────────
const SIZE_PATTERNS: { pattern: RegExp; size: string }[] = [
  { pattern: /\bextra\s*small\b|\bxs\b/i,   size: "XS" },
  { pattern: /\bsmall\b|\bs\b(?!\w)/i,       size: "S" },
  { pattern: /\bmedium\b|\bm\b(?!\w)/i,      size: "M" },
  { pattern: /\blarge\b|\bl\b(?!\w)/i,       size: "L" },
  { pattern: /\bextra\s*large\b|\bxl\b/i,    size: "XL" },
  { pattern: /\bxxl\b|\b2xl\b/i,             size: "XXL" },
  { pattern: /\bone\s*size\b/i,              size: "ONE SIZE" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SearchResult {
  product: Product;
  score: number;          // 0–1, higher = better match
  matchedTags: string[];  // which semantic tags matched
  sizeMatch: boolean;     // true if user's remembered size is in product.sizes
}

export interface NLSearchOutput {
  results: SearchResult[];
  extractedSizes: string[];   // sizes found in this query (caller should persist)
  interpretedAs: string;      // human-readable explanation of what we understood
}

// ─── Main search function ─────────────────────────────────────────────────────
export function naturalLanguageSearch(
  query: string,
  /** Sizes already remembered from past searches */
  rememberedSizes: string[] = []
): NLSearchOutput {
  const lower = query.toLowerCase();
  const words = lower.split(/\W+/).filter(Boolean);

  // ── 1. Extract sizes from this query ───────────────────────────────────────
  const extractedSizes: string[] = [];
  for (const { pattern, size } of SIZE_PATTERNS) {
    if (pattern.test(lower) && !extractedSizes.includes(size)) {
      extractedSizes.push(size);
    }
  }
  const allKnownSizes = [...new Set([...rememberedSizes, ...extractedSizes])];

  // ── 2. Map query words to semantic tags ────────────────────────────────────
  const tagScores: Record<string, number> = {};
  const interpretedWords: string[] = [];

  for (const word of words) {
    const tags = SEMANTIC_MAP[word];
    if (tags) {
      interpretedWords.push(word);
      for (const tag of tags) {
        tagScores[tag] = (tagScores[tag] ?? 0) + 1;
      }
    }
  }

  // ── 3. Score each ÉCLAT product ───────────────────────────────────────────
  const scored: SearchResult[] = ECLAT_CATALOG.map((product) => {
    const matchedTags: string[] = [];
    let rawScore = 0;

    for (const tag of product.tags) {
      const tagScore = tagScores[tag] ?? 0;
      if (tagScore > 0) {
        matchedTags.push(tag);
        rawScore += tagScore;
      }
    }

    // Size match boost: if any remembered size is in product.sizes
    const sizeMatch = allKnownSizes.length > 0 && product.sizes
      ? product.sizes.some((s) => allKnownSizes.includes(s))
      : false;

    // Size match floats the product up
    const boost = sizeMatch ? 2 : 0;
    const totalTags = product.tags.length || 1;
    const score = Math.min(1, (rawScore + boost) / (totalTags + 2));

    return { product, score, matchedTags, sizeMatch };
  });

  // ── 4. Sort: size-matched first, then by score, then alphabetically ────────
  const results = scored
    .filter((r) => r.score > 0)
    .sort((a, b) => {
      // Size match always floats first
      if (a.sizeMatch && !b.sizeMatch) return -1;
      if (!a.sizeMatch && b.sizeMatch) return 1;
      return b.score - a.score;
    });

  // ── 5. Build human-readable interpretation ────────────────────────────────
  const interpretedAs =
    interpretedWords.length > 0
      ? `Showing pieces matched to: ${interpretedWords.join(", ")}${
          allKnownSizes.length > 0 ? ` · Preferred sizes: ${allKnownSizes.join(", ")}` : ""
        }`
      : allKnownSizes.length > 0
      ? `Showing all pieces · Preferred sizes: ${allKnownSizes.join(", ")}`
      : "Showing the full collection";

  // If nothing matched semantically, return all products sorted by size match
  if (results.length === 0) {
    const fallback = ECLAT_CATALOG.map((product) => {
      const sizeMatch = allKnownSizes.length > 0 && product.sizes
        ? product.sizes.some((s) => allKnownSizes.includes(s))
        : false;
      return { product, score: sizeMatch ? 0.5 : 0.1, matchedTags: [], sizeMatch };
    }).sort((a, b) => Number(b.sizeMatch) - Number(a.sizeMatch));
    return { results: fallback, extractedSizes, interpretedAs: interpretedAs + " (no specific matches — showing all)" };
  }

  return { results, extractedSizes, interpretedAs };
}
