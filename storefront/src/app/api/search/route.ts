/**
 * POST /api/search
 *
 * AI-powered semantic fashion recommendation engine.
 * Uses Gemini to directly rank products based on the user's mood and the product's semantic metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { ECLAT_CATALOG } from "@/lib/mock/catalog";

// ── Size extraction helper ─────────────────────────────────────────────────
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

// ── Main Route ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = body.query ?? "";
    const sizePreferences: string[] = body.sizePreferences ?? [];

    if (!query.trim()) {
      return NextResponse.json({ results: [], interpretedAs: "No query", aiTags: [], extractedSizes: [] });
    }

    const extractedSizes = extractSizes(query);
    const allSizes = [...new Set([...sizePreferences, ...extractedSizes])];

    // Prepare catalog data for the LLM
    // We only send relevant fields to save tokens and focus the AI on semantics
    const catalogForLLM = ECLAT_CATALOG.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      tags: p.tags,
      semantic: p.semantic
    }));

    // 1. LLM extracts mood and RANKS products
    const prompt = `You are a world-class semantic fashion recommendation engine for the luxury brand ÉCLAT.
A user is searching with the following query: "${query}"

Your task:
1. Interpret the user's exact mood, vibe, and fashion intent.
2. Review the provided catalog.
3. Select the best matching products that semantically fit the user's mood. Understand synonyms (e.g. "revealing" -> "sensual", "daring", "skin-baring"; "happy" -> "bright", "playful").
4. Rank up to 6 product IDs from the catalog that best match this intent. 

Here is the ÉCLAT catalog (JSON):
${JSON.stringify(catalogForLLM)}

Return ONLY valid JSON (no markdown block, no extra text):
{
  "mood": "Short phrase describing the extracted mood",
  "palette": ["list", "of", "colors"],
  "style": ["list", "of", "styles"],
  "aesthetic": ["list", "of", "aesthetics"],
  "interpretedAs": "Short sentence explaining what you understood the user's vibe to be. Do NOT mention IDs here.",
  "rankedProductIds": ["id_1", "id_2", "id_3"]
}`;

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const apiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    });

    if (!apiRes.ok) throw new Error(`Gemini ${apiRes.status}`);

    const apiJson = await apiRes.json();
    const rawText: string = apiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let aiData: any = {};
    try {
      aiData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", cleaned);
      aiData = { mood: query, interpretedAs: query, rankedProductIds: [] };
    }

    const interpretedAs = aiData.interpretedAs
      ? `${aiData.interpretedAs}${allSizes.length > 0 ? ` · Sizes remembered: ${allSizes.join(", ")}` : ""}`
      : `Interpreted vibe for: "${query}"`;

    const aiTags = [
      ...(aiData.mood ? [aiData.mood] : []),
      ...(aiData.aesthetic || []),
      ...(aiData.style || []),
      ...(aiData.palette || [])
    ];

    // 2. Map ranked IDs back to actual products
    let results = [];
    if (aiData.rankedProductIds && Array.isArray(aiData.rankedProductIds)) {
      for (const id of aiData.rankedProductIds) {
        const product = ECLAT_CATALOG.find(p => p.id === id);
        if (product) results.push(product);
      }
    }

    // 3. Size filtering boost: Move items that match the size preference to the very top
    if (allSizes.length > 0) {
      results.sort((a, b) => {
        const aHasSize = a.sizes?.some(s => allSizes.includes(s)) ? 1 : 0;
        const bHasSize = b.sizes?.some(s => allSizes.includes(s)) ? 1 : 0;
        return bHasSize - aHasSize; // Descending order
      });
    }

    // Fallback if the LLM didn't return any IDs (safety net)
    if (results.length === 0) {
      results = ECLAT_CATALOG.slice(0, 4);
    }

    return NextResponse.json({
      results,
      extractedSizes,
      interpretedAs,
      aiTags: aiTags.slice(0, 5), // show top 5 extracted attributes as pills
    });
  } catch (err) {
    console.error("[/api/search] Error:", err);
    return NextResponse.json({ error: "AI search failed" }, { status: 500 });
  }
}
