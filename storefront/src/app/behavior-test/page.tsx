"use client";

/**
 * /behavior-test
 *
 * Live debug page for useBehaviorTracker.
 * Hover product cards, hover prices, scroll — watch signals update in real time.
 * Delete this route before production.
 */

import { useBehaviorTracker } from "@/hooks/useBehaviorTracker";

const DEMO_PRODUCTS = [
  { id: "prd_r001", name: "StormShield Monsoon Jacket", price: "₹3,799" },
  { id: "prd_r002", name: "AquaGuard Trekking Shoes", price: "₹5,199" },
  { id: "prd_t001", name: "UltraBook Laptop Stand", price: "₹1,899" },
];

export default function BehaviorTestPage() {
  const signals = useBehaviorTracker();

  const signalRows: { label: string; value: string; hot?: boolean }[] = [
    {
      label: "scrollDepthPercent",
      value: `${signals.scrollDepthPercent}%`,
      hot: signals.scrollDepthPercent > 50,
    },
    {
      label: "pageTimeSeconds",
      value: `${signals.pageTimeSeconds}s`,
    },
    {
      label: "isHesitating",
      value: signals.isHesitating ? "YES 🐢" : "no",
      hot: signals.isHesitating,
    },
    {
      label: "dwelledProducts",
      value:
        signals.dwelledProducts.length > 0
          ? signals.dwelledProducts.join(", ")
          : "none",
      hot: signals.dwelledProducts.length > 0,
    },
    {
      label: "hesitatedOnPrice",
      value:
        signals.hesitatedOnPrice.length > 0
          ? signals.hesitatedOnPrice.join(", ")
          : "none",
      hot: signals.hesitatedOnPrice.length > 0,
    },
  ];

  return (
    <main className="min-h-[200vh] bg-slate-950 text-slate-100 p-8 font-mono">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="border-b border-slate-700 pb-6">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">
            Step 2 · Behavioral Layer Test
          </p>
          <h1 className="text-2xl font-bold text-white">useBehaviorTracker</h1>
          <p className="text-slate-400 text-sm mt-1">
            Hover cards (2s dwell) · Hover prices (5s hesitate) · Scroll · Move mouse slow
          </p>
        </div>

        {/* Live signals */}
        <section>
          <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
            📡 Live Signals
          </h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800 overflow-hidden">
            {signalRows.map((row) => (
              <div
                key={row.label}
                className={`flex justify-between items-center px-5 py-3 transition-colors duration-300 ${
                  row.hot ? "bg-indigo-950/60" : ""
                }`}
              >
                <span className="text-slate-500 text-sm">{row.label}</span>
                <span
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    row.hot ? "text-indigo-300" : "text-slate-300"
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Demo product cards */}
        <section>
          <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
            🛍️ Demo Product Cards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEMO_PRODUCTS.map((p) => {
              const isDwelled = signals.dwelledProducts.includes(p.id);
              const isHesitated = signals.hesitatedOnPrice.includes(p.id);
              return (
                <div
                  key={p.id}
                  {...signals.getProductProps(p.id)}
                  className={`rounded-xl border p-5 cursor-pointer transition-all duration-300 select-none ${
                    isDwelled
                      ? "border-indigo-500 bg-indigo-950/40"
                      : "border-slate-800 bg-slate-900 hover:border-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-slate-600">{p.id}</span>
                    {isDwelled && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300">
                        dwelled ✓
                      </span>
                    )}
                  </div>

                  <p className="text-white font-semibold text-sm mb-4">{p.name}</p>

                  {/* Price — hover for 5s to trigger hesitation */}
                  <div
                    {...signals.getPriceProps(p.id)}
                    className={`inline-block px-3 py-1.5 rounded-lg cursor-pointer transition-colors duration-300 ${
                      isHesitated
                        ? "bg-amber-900/60 text-amber-300 ring-1 ring-amber-500"
                        : "bg-slate-800 text-emerald-400 hover:bg-slate-700"
                    }`}
                  >
                    <span className="font-bold text-sm">{p.price}</span>
                    {isHesitated && (
                      <span className="ml-2 text-xs text-amber-400">hesitated ⚠️</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Scroll depth guide */}
        <section>
          <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-4">
            📜 Scroll Depth Test
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Page intentionally tall (200vh). Scroll to the bottom to see depth hit 100%.
          </p>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${signals.scrollDepthPercent}%` }}
            />
          </div>
          <p className="text-slate-600 text-xs mt-2 text-right">
            {signals.scrollDepthPercent}%
          </p>
        </section>

        {/* Raw signal dump */}
        <section>
          <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">
            Raw JSON
          </h2>
          <pre className="rounded-xl bg-slate-900 border border-slate-800 p-5 text-xs text-slate-400 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(
              {
                scrollDepthPercent: signals.scrollDepthPercent,
                pageTimeSeconds: signals.pageTimeSeconds,
                isHesitating: signals.isHesitating,
                dwelledProducts: signals.dwelledProducts,
                hesitatedOnPrice: signals.hesitatedOnPrice,
              },
              null,
              2
            )}
          </pre>
        </section>

        {/* Bottom spacer for scroll testing */}
        <div className="h-64 flex items-end pb-8">
          <p className="text-slate-700 text-xs">
            — scroll bottom reached — depth should be 100%
          </p>
        </div>
      </div>
    </main>
  );
}
