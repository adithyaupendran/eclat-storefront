"use client";
/**
 * EclatProductCard — editorial product card.
 *
 * Uses real product images from /eclat/ folder.
 * Falls back to CSS gradient placeholder if image fails to load.
 *
 * Visual states (all within ÉCLAT monochrome):
 *  - idle:      white card on f9f9f9 background
 *  - dwelled:   card shifts to surface-low (#f3f3f3)
 *  - hesitated: price text pulses monochromatic
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { useBehaviorActions } from "@/context/BehaviorContext";
import { useBehavioralSignals } from "@/store/storefrontStore";
import { useCartStore } from "@/store/cartStore";
import { addToCart } from "@/actions/cart";
import type { Product } from "@/lib/mock/catalog";

// ── Gradient fallback per category ────────────────────────────────────────────
const FALLBACK_CLASS: Record<string, string> = {
  outerwear: "eclat-img-outerwear",
  separates: "eclat-img-separates",
  footwear: "eclat-img-footwear",
  accessories: "eclat-img-accessories",
  sets: "eclat-img-sets",
};

interface EclatProductCardProps {
  product: Product;
  size?: "tall" | "normal";
  rank?: number;
}

export function EclatProductCard({
  product,
  size = "normal",
  rank,
}: EclatProductCardProps) {
  const { getProductProps, getPriceProps } = useBehaviorActions();
  const signals = useBehavioralSignals();
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const incrementCart = useCartStore((s) => s.incrementCart);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const size = product.sizes?.[0] ?? null;
    startTransition(async () => {
      const result = await addToCart(product.id, size, 1);
      if (!result.error) incrementCart(1);
    });
  };

  const isDwelled = signals.dwelledProducts.includes(product.id);
  const isHesitated = signals.hesitatedOnPrice.includes(product.id);
  const fallback = FALLBACK_CLASS[product.category] ?? "eclat-img-default";
  const imgHeight = size === "tall" ? "h-[420px]" : "h-[280px]";

  const discountPct = product.originalPriceINR
    ? Math.round(((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100)
    : null;

  return (
    <Link
      href={`/products/${product.id}`}
      {...getProductProps(product.id)}
      className={`w-full group cursor-pointer transition-colors duration-500 block ${isDwelled ? "eclat-dwell" : "eclat-surface-white"
        }`}
    >
      {/* ── Image area ───────────────────────────────────────────────── */}
      <div className={`relative w-full ${imgHeight} overflow-hidden`}>
        {/* Real image (with gradient fallback on error) */}
        {!imgError ? (
          <img
            src={encodeURI(product.imageUrl)}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain p-4 mix-blend-multiply"
            style={{ objectPosition: product.imagePosition ?? "center center" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full ${fallback}`} />
        )}

        {/* Overlays */}

        <span className="absolute top-4 right-4 eclat-label" style={{ color: "rgba(173, 173, 173, 1)" }}>
          {product.category}
        </span>
        {(discountPct ?? 0) > 0 && (
          <span className="absolute bottom-4 left-4 z-10 eclat-label bg-black px-2 py-1 font-bold" style={{ color: "var(--eclat-white, white)" }}>
            −{discountPct}%
          </span>
        )}
        {product.stock <= 8 && (
          <span className="absolute bottom-4 right-4 eclat-label" style={{ color: "rgba(255, 255, 255, 1)" }}>
            {product.stock} left
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-500" aria-hidden="true" />
      </div>

      {/* ── Card body ────────────────────────────────────────────────── */}
      <div className="p-5">
        <p className="eclat-label mb-1">{product.brand}</p>
        <h3
          className="mb-3 group-hover:opacity-70 transition-opacity"
          style={{
            fontFamily: "var(--font-noto-serif)",
            fontSize: "1rem",
            fontWeight: 400,
            lineHeight: 1.35,
            color: "var(--eclat-on-surface)",
          }}
        >
          {product.name}
        </h3>
        <p className="eclat-body mb-4 line-clamp-2">{product.shortDescription}</p>

        {/* Price row */}
        <div {...getPriceProps(product.id)} className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span
              className={`font-medium ${isHesitated ? "eclat-price-hesitate" : ""}`}
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", color: "var(--eclat-on-surface)" }}
            >
              ₹{product.priceINR.toLocaleString("en-IN")}
            </span>
            {product.originalPriceINR && (
              <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem", color: "var(--eclat-variant)", textDecoration: "line-through" }}>
                ₹{product.originalPriceINR.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button
            className={`eclat-btn-text ${isPending ? 'opacity-40' : ''}`}
            onClick={handleAdd}
            disabled={isPending}
          >
            {isPending ? '...' : 'ADD'}
          </button>
        </div>

        {isDwelled && (
          <p className="mt-3 eclat-label" style={{ color: "rgba(0,0,0,0.35)" }}>
            You&apos;ve been here a while.
          </p>
        )}
      </div>
    </Link>
  );
}
