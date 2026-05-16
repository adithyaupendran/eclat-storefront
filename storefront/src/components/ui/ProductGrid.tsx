"use client";

/**
 * ProductGrid — renders the featured products from StorefrontPayload.
 *
 * Reads featuredProductIds from the store, looks them up in PRODUCT_CATALOG,
 * and renders ProductCards. Shows all remaining catalog items below as
 * "More Products" in a secondary grid.
 */

import { useStorefrontPayload } from "@/store/storefrontStore";
import { ProductCard } from "@/components/ui/ProductCard";
import { PRODUCT_CATALOG } from "@/lib/mock/catalog";

function SectionHeading({
  label,
  title,
  accent,
}: {
  label: string;
  title: string;
  accent: string;
}) {
  return (
    <div className="mb-10">
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] mb-2 ${accent}`}>
        {label}
      </p>
      <h2 className="text-3xl font-bold text-white">{title}</h2>
    </div>
  );
}

export function ProductGrid() {
  const payload = useStorefrontPayload();

  if (!payload) {
    return (
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl h-96 shimmer" />
          ))}
        </div>
      </section>
    );
  }

  const tokens = payload.tailwindThemeClasses;

  // Featured products (from context engine)
  const featuredProducts = payload.featuredProductIds
    .map((id) => PRODUCT_CATALOG.find((p) => p.id === id))
    .filter(Boolean) as typeof PRODUCT_CATALOG;

  // Remaining catalog (exclude featured)
  const remainingProducts = PRODUCT_CATALOG.filter(
    (p) => !payload.featuredProductIds.includes(p.id)
  );

  const sectionLabel =
    payload.colorScheme === "monsoon" ? "Context-Matched Selection" :
    payload.colorScheme === "night" ? "Tonight's Picks" :
    payload.colorScheme === "sunny" ? "Outdoor Essentials" : "Curated For You";

  const sectionTitle =
    payload.colorScheme === "monsoon" ? "Built for this weather." :
    payload.colorScheme === "night" ? "Late-night essentials." :
    payload.colorScheme === "sunny" ? "Gear up for the outdoors." : "Hand-picked for you.";

  return (
    <section
      className={`py-24 px-6 transition-colors duration-700 ${tokens.background}`}
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Featured section ───────────────────────────────────────────── */}
        <SectionHeading
          label={sectionLabel}
          title={sectionTitle}
          accent={tokens.accent}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {featuredProducts.map((product, i) => (
            <div
              key={product.id}
              className="animate-hero-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <ProductCard product={product} featured />
            </div>
          ))}
        </div>

        {/* ── Divider ────────────────────────────────────────────────────── */}
        <div className={`border-t ${tokens.border} mb-20`} />

        {/* ── More products ──────────────────────────────────────────────── */}
        <SectionHeading
          label="Full Catalog"
          title="More to explore."
          accent={tokens.subtext}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {remainingProducts.map((product, i) => (
            <div
              key={product.id}
              className="animate-hero-fade-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* ── Context debug bar ──────────────────────────────────────────── */}
        <div
          className={`mt-20 rounded-2xl glass border ${tokens.border} p-5 text-xs`}
        >
          <p className={`font-semibold mb-2 ${tokens.accent}`}>
            🧠 Active Context Scenario
          </p>
          <p className={tokens.subtext}>
            <strong className={tokens.text}>Scheme:</strong>{" "}
            {payload.colorScheme} ·{" "}
            <strong className={tokens.text}>Headline:</strong>{" "}
            &ldquo;{payload.heroHeadline}&rdquo;
          </p>
          {payload.nudgeMessage && (
            <p className={`mt-1 ${tokens.subtext}`}>
              <strong className={tokens.text}>Nudge:</strong>{" "}
              {payload.nudgeMessage}
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
