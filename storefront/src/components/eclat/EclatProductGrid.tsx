"use client";
/**
 * EclatProductGrid — the core context-aware product section.
 * Accepts products from the server (DB) via props.
 */

import { useStorefrontPayload } from "@/store/storefrontStore";
import { EclatProductCard } from "@/components/eclat/EclatProductCard";
import { type Product } from "@/lib/mock/catalog";

interface Props {
  products: Product[]
}

export function EclatProductGrid({ products }: Props) {
  const payload = useStorefrontPayload();

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (!payload) {
    return (
      <section className="max-w-screen-xl mx-auto px-8" style={{ paddingTop: "var(--space-section)" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#eeeeee]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-[480px] eclat-surface-white" />
          ))}
        </div>
      </section>
    );
  }

  // ── Split catalog ─────────────────────────────────────────────────────────
  const featuredProducts = payload.featuredProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  // Fall back to first 3 products if no featured matches (e.g. new products)
  const featured = featuredProducts.length >= 2
    ? featuredProducts
    : products.slice(0, 3);

  const featuredIds = new Set(featured.map(p => p.id));
  const remainingProducts = products.filter((p) => !featuredIds.has(p.id));

  const featuredKey = featured.map(p => p.id).join("|");

  return (
    <div>
      {/* ── Section: Recommended (context-driven) ─────────────────────── */}
      <section
        className="eclat-surface-low"
        style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}
      >
        <div className="max-w-screen-xl mx-auto px-8">
          {/* Section label */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eclat-label mb-2">Recommended</p>
              <h2
                style={{
                  fontFamily: "var(--font-noto-serif)",
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  fontWeight: 400,
                  color: "var(--eclat-on-surface)",
                }}
              >
                Curated for this moment.
              </h2>
            </div>
            <p className="eclat-label hidden md:block" style={{ color: "rgba(0,0,0,0.25)" }}>
              Updates as you browse
            </p>
          </div>

          {/* Featured grid — 1 tall + 2 stacked */}
          <div
            key={featuredKey}
            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e8e8e8] eclat-fade-in"
          >
            {/* Hero card (tall) */}
            {featured[0] && (
              <div className="eclat-surface-white">
                <EclatProductCard product={featured[0]} size="tall" rank={0} />
              </div>
            )}

            {/* Two stacked normal cards */}
            <div className="grid grid-rows-2 gap-px bg-[#e8e8e8]">
              {featured.slice(1, 3).map((product, i) => (
                <div key={product.id} className="eclat-surface-white">
                  <EclatProductCard product={product} size="normal" rank={i + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Full Collection (stable, not reordered) ──────────── */}
      <section
        className="eclat-surface"
        style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}
      >
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eclat-label mb-2">Collection 004</p>
              <h2
                style={{
                  fontFamily: "var(--font-noto-serif)",
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  fontWeight: 400,
                  color: "var(--eclat-on-surface)",
                }}
              >
                L'Essence — Full Archive
              </h2>
            </div>
            <p className="eclat-label hidden md:block">
              {products.length} pieces
            </p>
          </div>

          {/* Asymmetric 2-column stagger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
            {remainingProducts.map((product, i) => (
              <div
                key={product.id}
                className={`w-full eclat-surface-white eclat-reveal ${
                  i % 2 === 1 ? "md:mt-16 md:border-l border-[#e8e8e8]" : ""
                }`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <EclatProductCard
                  product={product}
                  size={i === 0 ? "tall" : "normal"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
