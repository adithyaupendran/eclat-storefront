"use client";

/**
 * ProductCard — glassmorphism product card with live behavioral states.
 *
 * States:
 *  - idle:       default glass card
 *  - dwelled:    blue ring + subtle glow (user lingered > 2s)
 *  - hesitated:  amber pulse on price (user hovered price > 5s without clicking)
 *
 * Reads event handlers from BehaviorContext (set by StorefrontProvider).
 * Reads dwell/hesitate state from Zustand store.
 */

import { useBehavioralSignals } from "@/store/storefrontStore";
import { useBehaviorActions } from "@/context/BehaviorContext";
import { useStorefrontPayload } from "@/store/storefrontStore";
import type { Product } from "@/lib/mock/catalog";

// ── Category gradient placeholders ───────────────────────────────────────────
const CATEGORY_GRADIENTS: Record<string, string> = {
  outdoor_gear:
    "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 70%, #1e3a5f 100%)",
  tech_accessories:
    "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #1e3a5f 100%)",
  travel:
    "linear-gradient(135deg, #78350f 0%, #92400e 40%, #b45309 70%, #1e3a5f 100%)",
};

const CATEGORY_ICONS: Record<string, string> = {
  outdoor_gear: "⛺",
  tech_accessories: "💻",
  travel: "🧳",
};

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { getProductProps, getPriceProps } = useBehaviorActions();
  const signals = useBehavioralSignals();
  const payload = useStorefrontPayload();

  const isDwelled = signals.dwelledProducts.includes(product.id);
  const isHesitated = signals.hesitatedOnPrice.includes(product.id);
  const tokens = payload?.tailwindThemeClasses;

  const discountPct = product.originalPriceINR
    ? Math.round(
        ((product.originalPriceINR - product.priceINR) /
          product.originalPriceINR) *
          100
      )
    : null;

  const gradient =
    CATEGORY_GRADIENTS[product.category] ?? CATEGORY_GRADIENTS.outdoor_gear;
  const categoryIcon = CATEGORY_ICONS[product.category] ?? "📦";

  return (
    <article
      {...getProductProps(product.id)}
      className={`
        group relative flex flex-col rounded-2xl overflow-hidden
        glass transition-all duration-500 cursor-pointer
        ${isDwelled
          ? "ring-2 ring-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.2)] -translate-y-1 animate-dwell-ring"
          : "hover:ring-1 hover:ring-slate-600/50 hover:-translate-y-0.5 hover:shadow-xl"
        }
      `}
      role="article"
      aria-label={product.name}
    >
      {/* ── Product image placeholder ──────────────────────────────────── */}
      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{ background: gradient }}
      >
        {/* Category icon */}
        <span className="text-5xl opacity-30 select-none">{categoryIcon}</span>

        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {discountPct && discountPct > 0 && (
            <span className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-md">
              -{discountPct}%
            </span>
          )}
          {featured && (
            <span
              className={`px-2 py-1 rounded-lg text-xs font-bold shadow-md ${
                tokens?.badge ?? "bg-blue-900 text-blue-300"
              }`}
            >
              Featured
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 glass px-2 py-1 rounded-lg">
          <span className="text-amber-400 text-xs">★</span>
          <span className="text-white text-xs font-semibold">{product.rating}</span>
          <span className="text-slate-400 text-xs">({product.reviewCount})</span>
        </div>

        {/* Stock warning */}
        {product.stock <= 20 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 glass px-2 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-xs">Only {product.stock} left</span>
          </div>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Brand + category */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
            {product.brand}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {product.category.replace("_", " ")}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-slate-100 text-base leading-snug group-hover:text-white transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 flex-1">
          {product.shortDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ── Price row ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-800">
          {/* Price — trigger hesitation tracking on hover */}
          <div
            {...getPriceProps(product.id)}
            className={`
              flex items-baseline gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 cursor-default
              ${isHesitated
                ? "bg-amber-950/60 ring-1 ring-amber-500/50 animate-amber-throb"
                : "bg-slate-800/60 hover:bg-slate-800"
              }
            `}
          >
            <span
              className={`font-bold text-lg ${
                isHesitated ? "text-amber-300" : "text-emerald-400"
              }`}
            >
              ₹{product.priceINR.toLocaleString("en-IN")}
            </span>
            {product.originalPriceINR && (
              <span className="line-through text-slate-600 text-sm">
                ₹{product.originalPriceINR.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            className={`
              px-4 py-2 rounded-xl text-sm font-semibold text-white
              transition-all duration-300 hover:scale-105 active:scale-95
              ${tokens?.primary ?? "bg-blue-600"}
              ${tokens?.primaryHover ?? "hover:bg-blue-500"}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            Add →
          </button>
        </div>

        {/* Hesitation nudge */}
        {isHesitated && (
          <p className="text-xs text-amber-400/80 text-center animate-hero-fade-up">
            ⚡ Price drops end tonight — only {product.stock} in stock
          </p>
        )}

        {/* Dwell state indicator */}
        {isDwelled && !isHesitated && (
          <p className="text-xs text-blue-400/70 text-center animate-hero-fade-up">
            👁️ You&apos;ve been looking at this one
          </p>
        )}
      </div>
    </article>
  );
}
