/**
 * POST /api/search
 *
 * Hybrid semantic fashion search engine for ÉCLAT.
 *
 * Search priority (first success wins):
 *   1. Vector search  — FastAPI + ChromaDB + sentence-transformers (PRIMARY)
 *   2. Gemini AI      — existing LLM-based ranking (if vector low-confidence / down)
 *   3. TypeScript NL  — deterministic tag-based fallback (if Gemini fails)
 *
 * Response shape is IDENTICAL to the original route — frontend unchanged.
 */

import { NextRequest, NextResponse } from "next/server";
import { ECLAT_CATALOG } from "@/lib/mock/catalog";
import { naturalLanguageSearch } from "@/lib/search";
import { vectorSearch, isConfident, type VectorSearchResponse } from "@/lib/vectorSearch";
import { createAdminClient } from "@/lib/supabase/server";

// ── Fetch live products from Supabase (admin-added products) ──────────────────
// Returns products with their pre-generated visual_description.
// Falls back to empty array silently if DB is unavailable.
async function fetchDbProducts(): Promise<{ id: string; title: string; category: string; tags: string[]; visual_description: string | null; image_urls: string[]; sizes: string[]; stock_quantity: number; rating: number; review_count: number; price: number; original_price: number | null }[]> {
  try {
    const admin = await createAdminClient();
    const { data } = await admin
      .from("products")
      .select("id, title, category, tags, visual_description, image_urls, sizes, stock_quantity, rating, review_count, price, original_price")
      .gt("stock_quantity", 0);
    return data ?? [];
  } catch {
    return [];
  }
}

// ── Size extraction helper (unchanged from original) ──────────────────────────
const SIZE_PATTERNS: { pattern: RegExp; size: string }[] = [
  { pattern: /\bextra\s*small\b|\bxs\b/i, size: "XS" },
  { pattern: /\bsmall\b|\bs\b(?!\w)/i,    size: "S" },
  { pattern: /\bmedium\b|\bm\b(?!\w)/i,   size: "M" },
  { pattern: /\blarge\b|\bl\b(?!\w)/i,    size: "L" },
  { pattern: /\bextra\s*large\b|\bxl\b/i, size: "XL" },
  { pattern: /\bxxl\b|\b2xl\b/i,          size: "XXL" },
  { pattern: /\bone\s*size\b/i,           size: "ONE SIZE" },
];

function extractSizes(query: string): string[] {
  const found: string[] = [];
  for (const { pattern, size } of SIZE_PATTERNS) {
    if (pattern.test(query) && !found.includes(size)) found.push(size);
  }
  return found;
}

// ── Map vector result IDs back to full Product objects ────────────────────────
function hydrateVectorResults(
  vectorResp: VectorSearchResponse,
  allSizes: string[]
) {
  let results = vectorResp.results
    .map((r) => ECLAT_CATALOG.find((p) => p.id === r.product_id))
    .filter(Boolean) as (typeof ECLAT_CATALOG)[number][];

  // Apply size sort on top of re-ranking (size-matched float first)
  if (allSizes.length > 0) {
    results = results.sort((a, b) => {
      const aHas = a.sizes?.some((s) => allSizes.includes(s)) ? 1 : 0;
      const bHas = b.sizes?.some((s) => allSizes.includes(s)) ? 1 : 0;
      return bHas - aHas;
    });
  }

  // Build aiTags from detected signals
  const aiTags: string[] = [
    ...(vectorResp.detected_occasion ? [vectorResp.detected_occasion] : []),
    ...vectorResp.detected_colors.slice(0, 2),
  ].slice(0, 5);

  return { results, aiTags };
}

// ── Local spell-checker (zero API calls, instant) ────────────────────────────
// Levenshtein distance against curated fashion vocabulary.
// Catches common typos like "relegant"→"elegant", "soemthing"→"something".
const FASHION_VOCAB = [
  // Common words
  "something","anything","looking","wearing","want","need","find","show","like","feel",
  // Occasions
  "evening","night","day","casual","formal","party","wedding","work","office","date",
  "beach","festival","summer","winter","autumn","spring","rain","cold","warm",
  // Styles & aesthetics
  "elegant","elegance","gothic","minimal","minimalist","bold","dramatic","romantic",
  "edgy","classic","vintage","modern","avant-garde","sculptural","architectural",
  "structured","fluid","flowing","draped","oversized","fitted","tailored",
  "dark","light","moody","ethereal","ethereal","whimsical","effortless",
  "luxurious","luxury","opulent","chic","sophisticated","refined","understated",
  // Garment types
  "coat","jacket","blazer","trench","dress","gown","top","blouse","shirt","tshirt",
  "trousers","pants","skirt","shorts","waistcoat","vest","cardigan","sweater",
  "boots","heels","shoes","sandals","sneakers","loafers","mules",
  "bag","purse","clutch","accessory","jewellery","necklace","earrings",
  // Materials
  "silk","satin","velvet","leather","wool","cashmere","cotton","linen","denim",
  "sequin","sequined","lace","chiffon","organza","tulle","mesh","sheer",
  // Colors
  "black","white","grey","gray","navy","beige","cream","camel","brown","tan",
  "red","burgundy","wine","pink","blush","rose","gold","silver","bronze",
  "green","emerald","olive","blue","cobalt","purple","lavender","orange","yellow",
  // Descriptors
  "statement","editorial","avant","garde","feminine","masculine","gender","neutral",
  "sensual","sexy","seductive","powerful","fierce","bold","quiet","soft",
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function localSpellCheck(query: string): string | null {
  const words = query.trim().toLowerCase().split(/\s+/);
  const corrected = words.map((word) => {
    if (word.length < 4) return word; // skip short words
    if (FASHION_VOCAB.includes(word)) return word; // already correct

    // Find closest vocab word within edit distance threshold
    let best = word, bestDist = Infinity;
    for (const vocab of FASHION_VOCAB) {
      if (Math.abs(vocab.length - word.length) > 3) continue; // skip unlikely candidates
      const dist = levenshtein(word, vocab);
      const threshold = word.length <= 6 ? 1 : 2; // stricter for short words
      if (dist < bestDist && dist <= threshold) {
        bestDist = dist;
        best = vocab;
      }
    }
    return best;
  });

  const result = corrected.join(" ");
  return result.toLowerCase() !== query.toLowerCase() ? result : null;
}


// ── Gemini search ──────────────────────────────────────────────────────────────
async function geminiSearch(
  query: string,
  allSizes: string[]
): Promise<{ results: (typeof ECLAT_CATALOG)[number][]; interpretedAs: string; aiTags: string[]; didYouMean: string | null }> {

  // Merge static catalog + live Supabase products into one list for Gemini
  const dbProducts = await fetchDbProducts();

  // Map static catalog products — include visualDescription for accurate visual matching
  const staticForLLM = ECLAT_CATALOG.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    tags: p.tags,
    semantic: p.semantic,
    visualDescription: p.visualDescription ?? null,
  }));

  // Map DB products — include visual_description generated at save time
  const dbForLLM = dbProducts.map((p) => ({
    id: p.id,
    name: p.title,
    category: p.category,
    tags: p.tags ?? [],
    visualDescription: p.visual_description ?? null,
  }));

  const allProductsForLLM = [...staticForLLM, ...dbForLLM];

  const prompt = `You are a world-class semantic fashion recommendation engine for the luxury brand ÉCLAT.
A user is searching with the following query: "${query}"

Your task:
1. Translate pop culture references, celebrity icons, or abstract concepts into concrete fashion attributes (e.g., "Matrix" → "minimalist, black, structured, leather"; "90s supermodel" → "slip dress, minimalism, elegant").
2. Check if the query contains any typos. If so, provide the corrected query string.
3. Review the provided catalog. Each product has a "visualDescription" field — this is the primary source of truth for visual attributes like sleeves, neckline, silhouette, colour, and material.
4. Select the best matching products that semantically AND visually fit the user's intent.
5. Rank up to 6 product IDs from the catalog.

Here is the ÉCLAT catalog (JSON):
${JSON.stringify(allProductsForLLM)}

Return ONLY valid JSON (no markdown block, no extra text):
{
  "spellingCorrection": "corrected query string, or null if no typos",
  "mood": "Short phrase describing the extracted mood",
  "palette": ["list", "of", "colors"],
  "style": ["list", "of", "styles"],
  "aesthetic": ["list", "of", "aesthetics"],
  "interpretedAs": "Short sentence explaining what you understood the user's vibe to be. Do NOT mention IDs here.",
  "rankedProductIds": ["id_1", "id_2", "id_3"]
}`;

  // Model rotation — tried in order on 429.
  // gemini-2.5-flash-lite: 30 RPM free (best)
  // gemini-2.5-flash:      15 RPM free
  // gemini-2.0-flash:      15 RPM free (separate quota bucket)
  const GEMINI_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];

  const makeBody = () => JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
  });

  let apiRes: Response | null = null;
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: makeBody(),
    });
    if (r.status !== 429) { apiRes = r; break; }
    console.warn(`[geminiSearch] ${model} → 429, trying next model`);
  }

  if (!apiRes || !apiRes.ok) throw new Error(`Gemini ${apiRes?.status ?? "no-response"}`);

  const apiJson = await apiRes.json();
  const rawText: string = apiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  let aiData: Record<string, unknown> = {};
  try {
    aiData = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini JSON:", cleaned);
    aiData = { mood: query, interpretedAs: query, rankedProductIds: [] };
  }

  const interpretedAs = aiData.interpretedAs
    ? `${aiData.interpretedAs}${allSizes.length > 0 ? ` · Sizes remembered: ${allSizes.join(", ")}` : ""}`
    : `Interpreted vibe for: "${query}"`;

  const aiTags = [
    ...(aiData.mood ? [aiData.mood as string] : []),
    ...((aiData.aesthetic as string[]) || []),
    ...((aiData.style as string[]) || []),
    ...((aiData.palette as string[]) || []),
  ];

  // Extract spelling correction — only return if meaningfully different from query
  const rawCorrection = (aiData.spellingCorrection as string | null) ?? null;
  const didYouMean: string | null =
    rawCorrection &&
    rawCorrection.toLowerCase().trim() !== query.toLowerCase().trim()
      ? rawCorrection.trim()
      : null;

  // Hydrate results: check static catalog first, then DB products
  let results: (typeof ECLAT_CATALOG)[number][] = [];
  if (aiData.rankedProductIds && Array.isArray(aiData.rankedProductIds)) {
    for (const id of aiData.rankedProductIds as string[]) {
      // Try static catalog first
      const staticProduct = ECLAT_CATALOG.find((p) => p.id === id);
      if (staticProduct) { results.push(staticProduct); continue; }

      // Fall back to DB product — adapt to Product shape for rendering
      const dbProduct = dbProducts.find((p) => p.id === id);
      if (dbProduct) {
        results.push({
          id: dbProduct.id,
          name: dbProduct.title,
          brand: "ÉCLAT",
          category: dbProduct.category,
          priceINR: dbProduct.price,
          originalPriceINR: dbProduct.original_price ?? null,
          imageUrl: dbProduct.image_urls[0] ?? "",
          imageUrls: dbProduct.image_urls,
          shortDescription: "",
          tags: dbProduct.tags ?? [],
          sizes: dbProduct.sizes ?? [],
          stock: dbProduct.stock_quantity,
          rating: dbProduct.rating ?? 0,
          reviewCount: dbProduct.review_count ?? 0,
          visualDescription: dbProduct.visual_description ?? undefined,
        });
      }
    }
  }

  if (allSizes.length > 0) {
    results = results.sort((a, b) => {
      const aHas = a.sizes?.some((s) => allSizes.includes(s)) ? 1 : 0;
      const bHas = b.sizes?.some((s) => allSizes.includes(s)) ? 1 : 0;
      return bHas - aHas;
    });
  }

  if (results.length === 0) results = ECLAT_CATALOG.slice(0, 4);

  return { results, interpretedAs: interpretedAs as string, aiTags: aiTags.slice(0, 5), didYouMean };
}

// ── Main Route ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = body.query ?? "";
    const sizePreferences: string[] = body.sizePreferences ?? [];

    if (!query.trim()) {
      return NextResponse.json({
        results: [],
        interpretedAs: "No query",
        aiTags: [],
        extractedSizes: [],
        source: "none",
      });
    }

    const extractedSizes = extractSizes(query);
    const allSizes = [...new Set([...sizePreferences, ...extractedSizes])];

    // ════════════════════════════════════════════════════════════════════
    // TIER 1 — Vector search + instant local spell-check (no extra latency)
    // ════════════════════════════════════════════════════════════════════
    const didYouMeanFromSpell = localSpellCheck(query);
    const vectorResp = await vectorSearch({ query, size_preferences: allSizes, limit: 8 });

    // ── TIER 1: High-confidence vector ───────────────────────────────────────
    if (vectorResp && isConfident(vectorResp)) {
      const { results, aiTags } = hydrateVectorResults(vectorResp, allSizes);
      const interpretedAs =
        vectorResp.interpreted_as +
        (allSizes.length > 0 ? ` · Sizes: ${allSizes.join(", ")}` : "");
      console.log(`[/api/search] source=vector confidence=${vectorResp.confidence.toFixed(2)} results=${results.length}`);
      return NextResponse.json({
        results, extractedSizes, interpretedAs, aiTags,
        didYouMean: didYouMeanFromSpell, source: "vector", confidence: vectorResp.confidence,
      });
    }

    // ── TIER 2: Gemini AI ─────────────────────────────────────────────────────
    // If Gemini fails (e.g. rate-limit), fall back to low-confidence vector
    // results rather than the "show all" TypeScript fallback.
    try {
      const { results, interpretedAs, aiTags, didYouMean } = await geminiSearch(query, allSizes);
      console.log(`[/api/search] source=gemini results=${results.length}`);
      return NextResponse.json({
        results, extractedSizes, interpretedAs, aiTags,
        didYouMean: didYouMean ?? didYouMeanFromSpell ?? null, source: "gemini",
      });
    } catch (geminiErr) {
      console.warn("[/api/search] Gemini failed — using low-confidence vector if available:", geminiErr instanceof Error ? geminiErr.message : geminiErr);

      // Use low-confidence vector results if available (better than "show all")
      if (vectorResp && vectorResp.results.length > 0) {
        const { results, aiTags } = hydrateVectorResults(vectorResp, allSizes);
        const interpretedAs =
          vectorResp.interpreted_as +
          (allSizes.length > 0 ? ` · Sizes: ${allSizes.join(", ")}` : "");
        console.log(`[/api/search] source=vector-fallback confidence=${vectorResp.confidence.toFixed(2)} results=${results.length}`);
        return NextResponse.json({
          results, extractedSizes, interpretedAs, aiTags,
          didYouMean: didYouMeanFromSpell, source: "vector", confidence: vectorResp.confidence,
        });
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // TIER 3 — TypeScript deterministic NL search (never fails)
    // ════════════════════════════════════════════════════════════════════
    const nlResult = naturalLanguageSearch(query, allSizes);
    const nlProducts = nlResult.results.map((r) => r.product);

    // Safety net: if the TS search also returns nothing (e.g. highly abstract
    // query like "something michael jackson would wear"), show top catalog items
    // so the user always sees products rather than an empty state.
    const finalProducts = nlProducts.length > 0 ? nlProducts : ECLAT_CATALOG.slice(0, 4);
    const finalInterpretedAs = nlProducts.length > 0
      ? nlResult.interpretedAs
      : `Showing featured pieces — try a more specific query like "dark structured coat" or "sleeveless evening top".`;

    console.log(`[/api/search] source=typescript results=${finalProducts.length}`);

    return NextResponse.json({
      results: finalProducts,
      extractedSizes,
      interpretedAs: finalInterpretedAs,
      aiTags: [],
      didYouMean: didYouMeanFromSpell ?? null,
      source: "typescript",
    });

  } catch (err) {
    console.error("[/api/search] Unhandled error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
