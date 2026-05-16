"use client";
/**
 * /wishlist — ÉCLAT Wishlist
 * Wishlist items shown in editorial list format with sidebar editorial copy.
 * Items hardcoded to showcase the design. In production: read from user store.
 */

import { EclatNav } from "@/components/eclat/EclatNav";
import { EclatFooter } from "@/components/eclat/EclatFooter";
import { ECLAT_CATALOG } from "@/lib/mock/catalog";
import { EclatProductCard } from "@/components/eclat/EclatProductCard";

// Mock wishlist — first 4 ÉCLAT products
const WISHLIST_IDS = ["eclat_coat_01", "eclat_sep_02", "eclat_foot_01", "eclat_acc_02"];

export default function WishlistPage() {
  const items = WISHLIST_IDS
    .map((id) => ECLAT_CATALOG.find((p) => p.id === id))
    .filter(Boolean) as typeof ECLAT_CATALOG;

  return (
    <>
      <EclatNav />
      <main className="pt-14">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <section
          className="eclat-surface-low"
          style={{ padding: "var(--space-section) 2rem 4rem" }}
        >
          <div className="max-w-screen-xl mx-auto md:grid md:grid-cols-2 gap-16 items-end">
            <div>
              <p className="eclat-label mb-4">The Wishlist</p>
              <h1
                style={{
                  fontFamily: "var(--font-noto-serif)",
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  color: "var(--eclat-on-surface)",
                }}
              >
                A curated selection
                <br />
                of <em>desired pieces.</em>
              </h1>
            </div>
            <p className="eclat-body mt-6 md:mt-0 max-w-xs">
              Items in your wishlist are not reserved, but they are ready for your next move.
            </p>
          </div>
        </section>

        {/* ── Wishlist items ─────────────────────────────────────────────── */}
        <section
          className="eclat-surface"
          style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}
        >
          <div className="max-w-screen-xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e8e8e8]">
              {items.map((product) => (
                <div key={product.id} className="eclat-surface-white">
                  <EclatProductCard product={product} size="normal" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sidebar editorial copy ────────────────────────────────────── */}
        <section
          className="eclat-surface-dark"
          style={{ padding: "var(--space-section) 2rem" }}
        >
          <div className="max-w-screen-xl mx-auto md:grid md:grid-cols-2 gap-16 items-center">
            <blockquote
              style={{
                fontFamily: "var(--font-noto-serif)",
                fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                fontStyle: "italic",
                lineHeight: 1.5,
                color: "var(--eclat-on-black)",
                fontWeight: 400,
              }}
            >
              &ldquo;Experience the intersection of architectural precision and wearable art. Curated for the discerning eye.&rdquo;
            </blockquote>
            <div className="mt-8 md:mt-0 flex flex-col gap-4">
              {["The Story", "Sustainability", "Shipping & Returns"].map((l) => (
                <button key={l} className="eclat-btn-text text-[#e2e2e2] text-left">
                  {l} →
                </button>
              ))}
            </div>
          </div>
        </section>

        <EclatFooter />
      </main>
    </>
  );
}
