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
  gothic:       ["structured", "statement", "outerwear", "accessories"],
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
  // NOTE: "cold" and "warm" are intentionally OMITTED here.
  // They are context-sensitive: as weather words they map to outerwear,
  // but as aesthetic words ("want to feel cold", "look warm") they should not.
  // They are handled dynamically in naturalLanguageSearch() below.

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

  // Cool/icy/fresh aesthetic — NOT outerwear, but sleek minimal looks
  cool:         ["minimal", "structured", "separates"],
  icy:          ["minimal", "silk", "separates"],
  crisp:        ["minimal", "structured", "separates"],
  fresh:        ["minimal", "everyday", "separates"],
  chill:        ["minimal", "casual", "separates"],

  // Coverage / layering intent
  cover:        ["outerwear", "sets"],
  covering:     ["outerwear", "sets"],
  covered:      ["outerwear", "sets"],
  coverage:     ["outerwear", "sets"],
  layer:        ["outerwear", "sets"],
  layered:      ["sets", "outerwear"],

  // Flashy / understated antonym pair
  // Map "flashy" so we can NEGATE it ("not so flashy" → exclude statement/sequin)
  flashy:       ["statement", "evening", "party", "bold"],
  shiny:        ["statement", "evening", "party"],
  sparkly:      ["statement", "evening", "party"],
  glittery:     ["statement", "evening", "party"],
  revealing:    ["evening", "night", "sexy", "sensual"],

  // Understated / minimal opposites
  understated:  ["minimal", "everyday", "cotton"],
  simple:       ["minimal", "everyday", "cotton"],
  quiet:        ["minimal", "everyday"],
  subtle:       ["minimal", "everyday", "silk"],
  toned:        ["minimal", "structured"],
  muted:        ["minimal", "everyday"],
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

  // ── 2. Parse query for negation and positive visual keywords ────────────────────
  const tagScores: Record<string, number> = {};
  const interpretedWords: string[] = [];

  // Detect negation patterns before processing keywords
  // Patterns: "no [word]", "not [word]", "not so [word]", "without [word]", "don't want [word]"
  const negatedWords = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === 'no' || w === 'not' || w === 'without' || w === 'dont' || w === 'avoid') {
      // "not so X" → negate X
      if (words[i + 1] === 'so' || words[i + 1] === 'too' || words[i + 1] === 'that') {
        if (words[i + 2]) negatedWords.add(words[i + 2]);
      } else if (words[i + 1]) {
        negatedWords.add(words[i + 1]);
        // Also catch "not a [word]" or "no [word]s"
        if (words[i + 2] && !['a','an','the','i','to','and'].includes(words[i + 2])) {
          negatedWords.add(words[i + 2].replace(/s$/, '')); // de-pluralise
        }
      }
    }
  }

  // Detect aesthetic vs weather intent for cold/warm
  const aestheticModifiers = /\b(feel|feeling|look|looking|seem|vibe|aesthetic|appear|want to be|want to feel)\b/;
  const weatherModifiers   = /\b(weather|outside|for the|coat|jacket|outerwear|winter|season|temperature)\b/;
  const isAestheticCold = aestheticModifiers.test(lower) && !weatherModifiers.test(lower);

  for (const word of words) {
    // Skip negated words — handled separately below
    if (negatedWords.has(word)) continue;

    // Skip "cold" / "warm" when used aesthetically — map to cool/sleek instead
    if ((word === "cold" || word === "warm") && isAestheticCold) {
      if (word === "cold") {
        interpretedWords.push(word);
        for (const tag of ["minimal", "structured", "separates", "silk"]) {
          tagScores[tag] = (tagScores[tag] ?? 0) + 1;
        }
      }
      if (word === "warm") {
        interpretedWords.push(word);
        for (const tag of ["silk", "luxury", "evening", "separates"]) {
          tagScores[tag] = (tagScores[tag] ?? 0) + 1;
        }
      }
      continue;
    }

    const tags = SEMANTIC_MAP[word];
    if (tags) {
      interpretedWords.push(word);
      for (const tag of tags) {
        tagScores[tag] = (tagScores[tag] ?? 0) + 1;
      }
    }
  }

  // For negated words: if they map to a semantic antonym, ADD those instead
  // e.g. "not flashy" → negates [statement,evening,party] → boosts [minimal,everyday]
  const ANTONYMS: Record<string, string[]> = {
    flashy:    ["minimal", "everyday", "cotton"],
    shiny:     ["minimal", "everyday"],
    sparkly:   ["minimal", "everyday"],
    revealing: ["outerwear", "sets", "minimal"],
    crop:      ["outerwear", "sets", "silk"],
    tight:     ["minimal", "relaxed", "everyday"],
    formal:    ["minimal", "everyday", "casual"],
    casual:    ["formal", "evening", "luxury"],
    dark:      ["minimal", "silk", "everyday"],
    heavy:     ["silk", "minimal", "separates"],
  };

  // Collect negated tags (to exclude products) and positive antonym tags (to boost)
  const excludedTags = new Set<string>();
  for (const negWord of negatedWords) {
    const negatableTags = SEMANTIC_MAP[negWord];
    if (negatableTags) {
      for (const t of negatableTags) excludedTags.add(t);
    }
    const antonymTags = ANTONYMS[negWord];
    if (antonymTags) {
      interpretedWords.push(`not ${negWord}`);
      for (const t of antonymTags) tagScores[t] = (tagScores[t] ?? 0) + 2;
    }
  }

  // Visual negation: words that should exclude based on visualDescription text
  // e.g. "no crop" → exclude products whose visualDescription contains "crop"
  const visualExcludeTerms: string[] = [];
  const visualRequireTerms: string[] = [];
  for (const negWord of negatedWords) {
    if (['crop', 'sleeve', 'mini', 'maxi', 'sheer', 'mesh'].includes(negWord)) {
      visualExcludeTerms.push(negWord);
    }
  }
  // Positive visual requirements: "sleeve" in query (not negated) → require sleeves
  if (words.includes('sleeve') && !negatedWords.has('sleeve')) visualRequireTerms.push('sleeve');
  if (words.includes('sleeved') && !negatedWords.has('sleeved')) visualRequireTerms.push('sleeve');
  if (words.includes('sleeveless')) visualRequireTerms.push('sleeveless');


  // ── 3. Score each ÉCLAT product ───────────────────────────────────────
  const scored: SearchResult[] = ECLAT_CATALOG.map((product) => {
    const matchedTags: string[] = [];
    let rawScore = 0;

    // Skip products that have excluded tags (negation)
    const hasExcludedTag = product.tags.some(t => excludedTags.has(t));

    // Visual exclusion: skip products whose visualDescription contains negated visual terms
    const vd = (product.visualDescription ?? "").toLowerCase();
    const failsVisualExclude = visualExcludeTerms.some(term => vd.includes(term));

    // Visual requirement: if user wants sleeves, require visualDescription to mention sleeves
    const failsVisualRequire = visualRequireTerms.some(term => {
      if (term === 'sleeve') return !(vd.includes('sleeve') && !vd.includes('sleeveless') && !vd.includes('no sleeve'));
      if (term === 'sleeveless') return !vd.includes('sleeveless') && !vd.includes('no sleeve');
      return false;
    });

    if (hasExcludedTag || failsVisualExclude || failsVisualRequire) {
      return { product, score: 0, matchedTags: [], sizeMatch: false };
    }

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
