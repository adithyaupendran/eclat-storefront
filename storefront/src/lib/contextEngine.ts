/**
 * Context Engine — ÉCLAT Edition
 *
 * Takes the merged ContextState and produces a StorefrontPayload that tells
 * the ÉCLAT storefront which products to feature.
 *
 * THE RULE: Only `featuredProductIds` and `nudgeMessage` change.
 * The ÉCLAT design system (monochromatic, Noto Serif, 0px radius) never
 * changes — it is fixed. The context engine only reorders product recommendations.
 *
 * Decision tree (evaluated top-to-bottom, first match wins):
 *   Behavioral overrides  (hesitation, dwell category) are checked first.
 *   Environmental signals (weather, time) are checked second.
 *   Default seasonal lineup is the fallback.
 */

import type { ContextState, StorefrontPayload } from "@/lib/types";
import { PRODUCT_CATALOG } from "@/lib/mock/catalog";

// ─── Fixed ÉCLAT theme (never changes) ───────────────────────────────────────
const ECLAT_THEME: StorefrontPayload["tailwindThemeClasses"] = {
  background: "bg-[#f9f9f9]",
  surface: "bg-white",
  primary: "bg-black",
  primaryHover: "hover:bg-[#3b3b3b]",
  text: "text-[#1b1b1b]",
  subtext: "text-[#474747]",
  accent: "text-black",
  border: "border-[#c6c6c6]/15",
  badge: "bg-[#eeeeee] text-[#1b1b1b]",
};

// ─── Product ID pools by intent ───────────────────────────────────────────────
const OUTERWEAR = ["eclat_coat_01", "eclat_coat_03", "eclat_coat_02"];
const SEPARATES = ["eclat_sep_02", "eclat_sep_01", "eclat_sep_03"];
const EVENING   = ["eclat_foot_01", "eclat_acc_02", "eclat_sep_02"];
const EVERYDAY  = ["eclat_sep_01", "eclat_sep_03", "eclat_set_01"];
const ACCESSORIES = ["eclat_acc_01", "eclat_acc_02", "eclat_foot_01"];
const DEFAULT   = ["eclat_coat_01", "eclat_sep_02", "eclat_acc_01"];

// ─── Helper: get category of a product by id ──────────────────────────────────
function getCategory(id: string): string | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id)?.category;
}

// ─── Helper: dominant dwelled category ───────────────────────────────────────
function dominantDwelledCategory(ctx: ContextState): string | null {
  const cats = ctx.behavioral.dwelledProducts
    .map((id) => getCategory(id))
    .filter(Boolean) as string[];
  if (cats.length === 0) return null;
  // Most frequent category wins
  const freq: Record<string, number> = {};
  for (const c of cats) freq[c] = (freq[c] ?? 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

// ─── Helper: hesitated product categories ────────────────────────────────────
function hesitatedCategories(ctx: ContextState): string[] {
  return [
    ...new Set(
      ctx.behavioral.hesitatedOnPrice
        .map((id) => getCategory(id))
        .filter(Boolean) as string[]
    ),
  ];
}

// ─── Signal checkers ──────────────────────────────────────────────────────────
function isHeavyRain(ctx: ContextState): boolean {
  return ctx.environmental.weather.condition === "heavy_rain";
}
function isRaining(ctx: ContextState): boolean {
  return (
    ctx.environmental.weather.condition === "heavy_rain" ||
    ctx.environmental.weather.condition === "light_rain"
  );
}
function isNight(ctx: ContextState): boolean {
  return (
    ctx.environmental.time.timeOfDay === "night" ||
    ctx.environmental.time.timeOfDay === "dawn"
  );
}
function isDeepScroller(ctx: ContextState): boolean {
  return ctx.behavioral.scrollDepthPercent > 65;
}
function hasHesitatedOnHighValue(ctx: ContextState): boolean {
  // High-value = accessories or outerwear (the most expensive ÉCLAT categories)
  const cats = hesitatedCategories(ctx);
  return cats.includes("accessories") || cats.includes("outerwear");
}

// ─── Core generator ───────────────────────────────────────────────────────────
export function generateStorefront(ctx: ContextState): StorefrontPayload {

  // ══ Priority 1: Behavioral — what the user is interacting with ══════════════

  // 1a. User dwelled on outerwear → show more outerwear
  if (dominantDwelledCategory(ctx) === "outerwear") {
    return make(OUTERWEAR, "Rare in stock. Reserved for those who dwell.");
  }

  // 1b. User dwelled on separates → show separates collection
  if (dominantDwelledCategory(ctx) === "separates") {
    return make(SEPARATES, null);
  }

  // 1c. User dwelled on accessories → show full accessories lineup
  if (dominantDwelledCategory(ctx) === "accessories") {
    return make(ACCESSORIES, null);
  }

  // 1d. User hesitated on price of accessories/outerwear (looked, didn't click)
  //     → surface mid-range separates to lower the barrier to first purchase
  if (hasHesitatedOnHighValue(ctx)) {
    return make(
      ["eclat_set_01", "eclat_sep_01", "eclat_sep_03"],
      "Some things grow in value. Others simply last."
    );
  }

  // 1e. Deep scroller with dwell history → resurface dwelled items first
  if (isDeepScroller(ctx) && ctx.behavioral.dwelledProducts.length > 0) {
    const dwelled = ctx.behavioral.dwelledProducts.filter((id) =>
      id.startsWith("eclat_")
    );
    const rest = DEFAULT.filter((id) => !dwelled.includes(id));
    return make([...dwelled, ...rest].slice(0, 3), null);
  }

  // ══ Priority 2: Environmental — weather + time of day ══════════════════════

  // 2a. Heavy rain → outerwear is the clear answer
  if (isHeavyRain(ctx)) {
    return make(OUTERWEAR, null);
  }

  // 2b. Any rain → outerwear first, mixed fallback
  if (isRaining(ctx)) {
    return make(
      ["eclat_coat_01", "eclat_sep_02", "eclat_coat_03"],
      null
    );
  }

  // 2c. Night browsing → evening/occasion wear
  if (isNight(ctx)) {
    return make(EVENING, null);
  }

  // ══ Priority 3: Default seasonal lineup ════════════════════════════════════
  return make(DEFAULT, null);
}

// ─── Factory helper ───────────────────────────────────────────────────────────
function make(
  featuredProductIds: string[],
  nudgeMessage: string | null
): StorefrontPayload {
  return {
    heroHeadline: "Issue No. 04 — L'Essence",
    heroSubtext:
      "Quiet elegance in monochrome. A collection defined by what is removed.",
    ctaLabel: "SHOP THE LOOK",
    colorScheme: "neutral",
    tailwindThemeClasses: ECLAT_THEME,
    featuredProductIds,
    nudgeMessage,
  };
}

// ─── Context merger ───────────────────────────────────────────────────────────
export function mergeContext(
  environmental: ContextState["environmental"],
  historical: ContextState["historical"],
  behavioral: ContextState["behavioral"]
): ContextState {
  return { environmental, historical, behavioral };
}
