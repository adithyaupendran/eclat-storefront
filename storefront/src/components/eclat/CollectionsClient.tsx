'use client'

import { useState } from "react";
import { EclatProductCard } from "@/components/eclat/EclatProductCard";
import { type Product } from "@/lib/mock/catalog";

const FILTERS = ["All", "Outerwear", "Separates", "Footwear", "Accessories", "Sets"];

export function CollectionsClient({ products }: { products: Product[] }) {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? products
      : products.filter((p) => p.category.toLowerCase() === active.toLowerCase());

  return (
    <>
      {/* Filter bar */}
      <div className="sticky z-30 eclat-nav border-b border-[rgba(0,0,0,0.06)]" style={{ top: "56px" }}>
        <div className="max-w-screen-xl mx-auto px-8 flex gap-8 overflow-x-auto py-4 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="eclat-label shrink-0 transition-colors"
              style={{
                color: active === f ? "var(--eclat-black)" : "var(--eclat-variant)",
                borderBottom: active === f ? "1px solid var(--eclat-black)" : "none",
                paddingBottom: "2px",
              }}
            >
              {f}
            </button>
          ))}
          <span className="eclat-label ml-auto shrink-0" style={{ color: "var(--eclat-variant)" }}>
            {filtered.length} PIECES
          </span>
        </div>
      </div>

      {/* Product grid */}
      <section className="eclat-surface" style={{ paddingTop: "var(--space-section)", paddingBottom: "var(--space-section)" }}>
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e8e8e8]">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                className={`eclat-surface-white eclat-reveal ${i % 2 === 1 ? "md:mt-20" : ""}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <EclatProductCard product={product} size={i === 0 ? "tall" : "normal"} />
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-32 text-center">
              <p className="eclat-label">No pieces in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
