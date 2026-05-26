/**
 * analyze-images.mjs
 * One-time script: reads every ÉCLAT product image → asks Gemini Vision
 * to describe what it actually sees → prints output to paste into catalog.ts
 *
 * Run from storefront/ directory:
 *   node scripts/analyze-images.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read GEMINI_API_KEY from .env.local
const envPath = path.join(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const keyMatch = envContent.match(/^GEMINI_API_KEY=(.+)$/m);
if (!keyMatch) {
  console.error("❌ GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}
const GEMINI_API_KEY = keyMatch[1].trim();

// Use flash-lite — highest free RPM (30/min) and lowest token cost
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"];

const PRODUCTS = [
  { id: "eclat_coat_01",  image: "eclat/Post by @zegalba · 1 image.jpg" },
  { id: "eclat_coat_02",  image: "eclat/H&M Just Dropped a $150 Version of Hailey Bieber's $6K Designer Coat.jpg" },
  { id: "eclat_coat_03",  image: "eclat/WhatsApp Image 2026-05-16 at 2.07.49 AM.jpeg" },
  { id: "eclat_sep_01",   image: "eclat/Fashion Strappy Sweater Tank __ fashion product phorography.jpg" },
  { id: "eclat_sep_02",   image: "eclat/Cucculelli Shaheen Fashion Collections For Women _ Moda Operandi.jpg" },
  { id: "eclat_sep_03",   image: "eclat/WhatsApp Image 2026-05-16 at 2.01.39 AM.jpeg" },
  { id: "eclat_foot_01",  image: "eclat/WhatsApp Image 2026-05-16 at 1.44.40 AM.jpeg" },
  { id: "eclat_acc_01",   image: "eclat/WhatsApp Image 2026-05-16 at 1.58.32 AM.jpeg" },
  { id: "eclat_acc_02",   image: "eclat/professional-model-sitting-floor-fashionable-dress-makeup-hairstyle-pretty-face-white-sheet-is-waving-magazine-cover.jpg" },
  { id: "eclat_set_01",   image: "eclat/807481408158586231.jpg" },
];

const PROMPT = `You are a fashion visual analyst. Look at this product image carefully.

Return ONLY a JSON object — no markdown, no extra text:
{
  "garmentType": "e.g. coat, top, blouse, trousers, heels, waistcoat, dress, skirt, set",
  "hasSleeves": true or false,
  "sleeveType": "none/sleeveless/short/long/bishop/cap — or null if not a top",
  "neckline": "cowl/V-neck/square/halter/off-shoulder/strapless/high-neck/one-shoulder — or null",
  "silhouette": "e.g. oversized, fitted, wide-leg, floor-length, mini, midi, structured, draped",
  "primaryColor": "main color visible",
  "keyDetails": ["up to 4 specific visible design features"]
}`;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function analyzeImage(id, imagePath) {
  const fullPath = path.join(__dirname, "../public", imagePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`  ⚠️  Not found: ${fullPath}`);
    return null;
  }

  const base64 = fs.readFileSync(fullPath).toString("base64");
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : "image/jpeg";

  const body = {
    contents: [{
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: mimeType, data: base64 } }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 400 }
  };

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      console.warn(`    ⏳ 429 on ${model}, waiting 15s...`);
      await sleep(15000);
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      console.error(`    ❌ ${model} error: ${res.status}`);
      continue;
    }

    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      console.error(`    ❌ JSON parse failed for ${id}:`, cleaned.slice(0, 100));
      return null;
    }
  }
  return null;
}

async function main() {
  console.log("🔍 Analyzing ÉCLAT product images with Gemini Vision...\n");
  const results = {};

  for (let i = 0; i < PRODUCTS.length; i++) {
    const { id, image } = PRODUCTS[i];
    process.stdout.write(`  [${i+1}/${PRODUCTS.length}] ${id}...`);
    const desc = await analyzeImage(id, image);
    if (desc) {
      results[id] = desc;
      console.log(` ✅`);
    } else {
      console.log(` ❌ skipped`);
    }
    // 3s gap between calls to stay under 20 RPM
    if (i < PRODUCTS.length - 1) await sleep(3000);
  }

  console.log("\n\n════════════════════════════════════════════════════════");
  console.log("✅ VISUAL DESCRIPTIONS — paste into catalog.ts");
  console.log("════════════════════════════════════════════════════════\n");

  for (const [id, d] of Object.entries(results)) {
    const parts = [d.garmentType];
    if (d.hasSleeves === false || d.sleeveType === "none" || d.sleeveType === "sleeveless") {
      parts.push("sleeveless");
    } else if (d.sleeveType && d.sleeveType !== "null") {
      parts.push(`${d.sleeveType} sleeves`);
    }
    if (d.neckline && d.neckline !== "null") parts.push(`${d.neckline} neckline`);
    if (d.silhouette) parts.push(`${d.silhouette} silhouette`);
    if (d.primaryColor) parts.push(d.primaryColor);
    if (d.keyDetails?.length) parts.push(...d.keyDetails.slice(0, 3));

    console.log(`  // ${id}`);
    console.log(`  visualDescription: "${parts.join(", ")}",`);
    console.log();
  }
}

main().catch(console.error);
