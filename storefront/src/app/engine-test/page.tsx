"use client";

/**
 * /engine-test
 *
 * Renders the StorefrontPayload that the context engine produces for the
 * current live context (Mangaluru heavy rain + Arjun's profile).
 * Also lets you toggle scenario overrides to test other branches.
 * Delete before production.
 */

import { useStorefrontStore, useStorefrontPayload } from "@/store/storefrontStore";
import { useBehavioralSignals } from "@/store/storefrontStore";

export default function EngineTestPage() {
  const payload = useStorefrontPayload();
  const signals = useBehavioralSignals();
  const updateBehavioral = useStorefrontStore((s) => s.updateBehavioral);

  if (!payload) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-mono">
        <p>Initialising store…</p>
      </main>
    );
  }

  const tokens = payload.tailwindThemeClasses;

  // ── Scenario override buttons ────────────────────────────────────────────
  const scenarios: { label: string; patch: Partial<typeof signals> }[] = [
    {
      label: "😐 Default",
      patch: {
        isHesitating: false,
        hesitatedOnPrice: [],
        dwelledProducts: [],
        scrollDepthPercent: 0,
      },
    },
    {
      label: "💸 Hesitating on price",
      patch: { isHesitating: true, hesitatedOnPrice: ["prd_r001"] },
    },
    {
      label: "👁️ High dwell (outdoor)",
      patch: {
        isHesitating: false,
        hesitatedOnPrice: [],
        dwelledProducts: ["prd_r001", "prd_r002"],
      },
    },
    {
      label: "📜 Deep scroller",
      patch: {
        scrollDepthPercent: 75,
        dwelledProducts: [],
        hesitatedOnPrice: [],
        isHesitating: false,
      },
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-mono p-8">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="border-b border-slate-700 pb-6">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
            Step 3 · Context Engine Test
          </p>
          <h1 className="text-2xl font-bold text-white">
            generateStorefront() output
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Live payload from Zustand store. Toggle scenario overrides below.
          </p>
        </div>

        {/* Scenario toggle */}
        <section>
          <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Override Behavioral Signals
          </h2>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((s) => (
              <button
                key={s.label}
                onClick={() => updateBehavioral(s.patch)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700 hover:border-slate-500"
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Live payload */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-2">
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
              🎯 Generated Storefront Payload
            </h2>
            <div className="space-y-3">
              <Field label="colorScheme" value={payload.colorScheme} />
              <Field label="heroHeadline" value={payload.heroHeadline} highlight />
              <Field label="heroSubtext" value={payload.heroSubtext} />
              <Field label="ctaLabel" value={payload.ctaLabel} />
              <Field
                label="featuredProductIds"
                value={payload.featuredProductIds.join(", ")}
              />
              <Field
                label="nudgeMessage"
                value={payload.nudgeMessage ?? "null"}
              />
            </div>
          </div>

          {/* Theme tokens */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-4">
              🎨 Tailwind Theme Tokens
            </h2>
            <div className="space-y-2">
              {Object.entries(tokens).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b border-slate-800 last:border-0">
                  <span className="text-slate-500">{k}</span>
                  <code className="text-slate-300">{v}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Live behavioral signals */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-4">
              📡 Current Behavioral Signals
            </h2>
            <div className="space-y-2">
              <SigRow label="scrollDepthPercent" value={`${signals.scrollDepthPercent}%`} />
              <SigRow label="pageTimeSeconds" value={`${signals.pageTimeSeconds}s`} />
              <SigRow label="isHesitating" value={String(signals.isHesitating)} hot={signals.isHesitating} />
              <SigRow
                label="dwelledProducts"
                value={signals.dwelledProducts.join(", ") || "none"}
                hot={signals.dwelledProducts.length > 0}
              />
              <SigRow
                label="hesitatedOnPrice"
                value={signals.hesitatedOnPrice.join(", ") || "none"}
                hot={signals.hesitatedOnPrice.length > 0}
              />
            </div>
          </div>

        </section>

        {/* Visual theme preview */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Visual Theme Preview
          </h2>
          <div className={`rounded-xl p-8 transition-all duration-700 ${tokens.background}`}>
            <div className={`inline-block px-3 py-1 rounded-full text-xs mb-4 ${tokens.badge}`}>
              {payload.colorScheme}
            </div>
            <h3 className={`text-3xl font-bold mb-3 ${tokens.text}`}>
              {payload.heroHeadline}
            </h3>
            <p className={`text-sm mb-6 max-w-lg ${tokens.subtext}`}>
              {payload.heroSubtext}
            </p>
            <button
              className={`px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all ${tokens.primary} ${tokens.primaryHover}`}
            >
              {payload.ctaLabel}
            </button>
            {payload.nudgeMessage && (
              <p className={`mt-4 text-xs ${tokens.accent}`}>
                {payload.nudgeMessage}
              </p>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 py-2 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-xs shrink-0">{label}</span>
      <span
        className={`text-xs text-right ${highlight ? "text-emerald-300 font-semibold" : "text-slate-300"}`}
      >
        {value}
      </span>
    </div>
  );
}

function SigRow({
  label,
  value,
  hot,
}: {
  label: string;
  value: string;
  hot?: boolean;
}) {
  return (
    <div className="flex justify-between text-xs py-1 border-b border-slate-800 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className={hot ? "text-amber-400 font-semibold" : "text-slate-300"}>
        {value}
      </span>
    </div>
  );
}
