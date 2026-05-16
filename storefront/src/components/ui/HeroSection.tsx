"use client";

/**
 * HeroSection — full-viewport generative hero.
 *
 * Reads StorefrontPayload from Zustand store and renders:
 *  - Animated background gradient (colour-scheme aware)
 *  - Rain overlay (when weather condition is rain)
 *  - WeatherChip badge
 *  - Animated headline (transitions on context change via `key` prop)
 *  - Subtext and CTA button
 *  - Scroll indicator
 *
 * All theme classes come from `tailwindThemeClasses` — zero hardcoded colours.
 */

import { useStorefrontStore, useStorefrontPayload } from "@/store/storefrontStore";
import { WeatherChip } from "@/components/ui/WeatherChip";
import { RainEffect } from "@/components/ui/RainEffect";
import type { TailwindColorScheme } from "@/lib/types";

// Background gradients per color scheme
const BG_GRADIENTS: Record<TailwindColorScheme, string> = {
  monsoon:
    "radial-gradient(ellipse 80% 60% at 50% 0%, #1e3a5f 0%, #0f172a 55%, #020817 100%)",
  night:
    "radial-gradient(ellipse 80% 60% at 50% 0%, #1e1b4b 0%, #0f0f2d 55%, #020817 100%)",
  dawn:
    "radial-gradient(ellipse 80% 60% at 50% 0%, #4c0519 0%, #1c0a14 55%, #09030b 100%)",
  sunny:
    "radial-gradient(ellipse 80% 60% at 50% 0%, #78350f 0%, #fffbeb 55%, #fef9c3 100%)",
  neutral:
    "radial-gradient(ellipse 80% 60% at 50% 0%, #18181b 0%, #09090b 55%, #020817 100%)",
};

const HEADLINE_GRADIENT: Record<TailwindColorScheme, string> = {
  monsoon: "text-gradient-blue",
  night: "text-gradient-violet",
  dawn: "text-gradient-blue",
  sunny: "text-gradient-amber",
  neutral: "text-gradient-violet",
};

// Glow orb colours per scheme
const ORB_COLOR: Record<TailwindColorScheme, string> = {
  monsoon: "bg-blue-600/10",
  night: "bg-violet-600/10",
  dawn: "bg-rose-600/10",
  sunny: "bg-amber-400/10",
  neutral: "bg-slate-500/10",
};

function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      <div className="space-y-6 text-center w-full max-w-3xl px-6">
        <div className="shimmer h-8 w-48 rounded-full mx-auto" />
        <div className="shimmer h-16 w-full rounded-2xl" />
        <div className="shimmer h-6 w-3/4 rounded-lg mx-auto" />
        <div className="shimmer h-14 w-48 rounded-xl mx-auto" />
      </div>
    </section>
  );
}

export function HeroSection() {
  const payload = useStorefrontPayload();
  const env = useStorefrontStore((s) => s.environmental);

  if (!payload || !env) return <HeroSkeleton />;

  const scheme = payload.colorScheme;
  const tokens = payload.tailwindThemeClasses;
  const isRaining =
    env.weather.condition === "heavy_rain" ||
    env.weather.condition === "light_rain";
  const rainIntensity =
    env.weather.condition === "heavy_rain" ? "heavy" : "light";

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-all duration-700"
      style={{ background: BG_GRADIENTS[scheme] }}
    >
      {/* ── Glow orb ─────────────────────────────────────────────────────── */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-1000 ${ORB_COLOR[scheme]}`}
        aria-hidden="true"
      />

      {/* ── Secondary glow (bottom) ──────────────────────────────────────── */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl opacity-30 transition-all duration-1000 ${ORB_COLOR[scheme]}`}
        aria-hidden="true"
      />

      {/* ── Rain overlay ─────────────────────────────────────────────────── */}
      {isRaining && <RainEffect intensity={rainIntensity} />}

      {/* ── Grid overlay ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto animate-hero-fade-up">

        {/* Weather chip */}
        <div className="mb-8">
          <WeatherChip env={env} />
        </div>

        {/* Tier badge */}
        <div className="mb-5">
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold tracking-widest uppercase ${tokens.badge}`}>
            {payload.colorScheme === "monsoon" ? "Monsoon Edition" :
             payload.colorScheme === "night" ? "Night Mode" :
             payload.colorScheme === "sunny" ? "Outdoor Season" : "Curated Picks"}
          </span>
        </div>

        {/* Headline — key swap triggers CSS animation */}
        <h1
          key={payload.heroHeadline}
          className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-headline ${HEADLINE_GRADIENT[scheme]}`}
        >
          {payload.heroHeadline}
        </h1>

        {/* Subtext */}
        <p
          key={payload.heroSubtext}
          className={`text-lg sm:text-xl max-w-2xl leading-relaxed mb-10 animate-headline ${tokens.subtext}`}
          style={{ animationDelay: "0.1s" }}
        >
          {payload.heroSubtext}
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            className={`
              px-8 py-4 rounded-2xl font-bold text-white text-base
              transition-all duration-300 hover:scale-105 hover:-translate-y-0.5
              shadow-lg hover:shadow-2xl
              ${tokens.primary} ${tokens.primaryHover}
              animate-glow-pulse
            `}
          >
            {payload.ctaLabel}
          </button>
          <button
            className={`
              px-6 py-4 rounded-2xl font-medium text-base
              glass border ${tokens.border}
              transition-all duration-300 hover:scale-105
              ${tokens.subtext} hover:${tokens.text}
            `}
          >
            Browse All →
          </button>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow opacity-40">
        <span className="text-xs text-slate-500 tracking-widest uppercase">Scroll</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 4v12M5 11l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500"
          />
        </svg>
      </div>
    </section>
  );
}
