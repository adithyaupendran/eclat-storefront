import { getEnvironmentalContext } from "@/lib/mock/environmental";
import { getMockUserProfile } from "@/lib/mock/historical";
import { PRODUCT_CATALOG } from "@/lib/mock/catalog";

/**
 * Step 1 Preview Page
 *
 * A simple server component that renders the raw mock data so we can
 * visually confirm both layers are returning the correct payload before
 * we wire up the context engine in Step 3.
 *
 * Accessible at: http://localhost:3000/preview
 */
export default function PreviewPage() {
  const env = getEnvironmentalContext();
  const user = getMockUserProfile();

  const weatherEmoji: Record<string, string> = {
    heavy_rain: "🌧️",
    light_rain: "🌦️",
    sunny: "☀️",
    cloudy: "☁️",
    hot: "🥵",
    cold: "🥶",
    snow: "❄️",
  };

  const tierColor: Record<string, string> = {
    bronze: "text-amber-600",
    silver: "text-slate-400",
    gold: "text-yellow-400",
    platinum: "text-cyan-300",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-mono p-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="border-b border-slate-700 pb-6">
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-1">
            Step 1 · Data Layer Preview
          </p>
          <h1 className="text-3xl font-bold text-white">
            Context-Aware Generative Storefront
          </h1>
          <p className="text-slate-400 mt-2">
            Both mock data layers are live. This page is rendered on the server —
            no client JS needed to see personalised data.
          </p>
        </div>

        {/* ── Environmental Layer ────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4">
            🌍 Environmental Layer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <Card title="Location">
              <Row label="City" value={`${env.location.city}, ${env.location.country}`} />
              <Row label="Coordinates" value={`${env.location.lat}° N, ${env.location.lon}° E`} />
              <Row label="Timezone" value={env.location.timezone} />
            </Card>

            {/* Weather */}
            <Card title="Weather">
              <Row
                label="Condition"
                value={`${weatherEmoji[env.weather.condition]} ${env.weather.condition.replace("_", " ")}`}
              />
              <Row label="Temperature" value={`${env.weather.temperatureCelsius}°C`} />
              <Row label="Humidity" value={`${env.weather.humidity}%`} />
              <Row label="Wind" value={`${env.weather.windSpeedKmh} km/h`} />
              <Row
                label="Outdoor?"
                value={env.weather.isOutdoor ? "✅ Yes" : "❌ No — stay in"}
              />
            </Card>

            {/* Time */}
            <Card title="Time Context">
              <Row label="Time of Day" value={env.time.timeOfDay} />
              <Row label="Day" value={env.time.dayOfWeek} />
              <Row label="Weekend?" value={env.time.isWeekend ? "Yes" : "No"} />
            </Card>

            {/* Scenario */}
            <Card title="Scenario Description" className="md:col-span-1">
              <p className="text-slate-300 text-sm leading-relaxed">
                {env.weather.description}
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-blue-900 text-blue-300 text-xs font-semibold">
                Trigger: Rain Theme + WFH / Waterproof Upsell
              </div>
            </Card>
          </div>
        </section>

        {/* ── Historical Layer ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
            👤 Historical Layer (User Profile)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity */}
            <Card title="Identity">
              <Row label="Name" value={user.name} />
              <Row label="User ID" value={user.userId} />
              <Row label="Email" value={user.email} />
              <Row
                label="Tier"
                value={
                  <span className={`font-bold ${tierColor[user.segment.tier]}`}>
                    {user.segment.tier.toUpperCase()}
                  </span>
                }
              />
            </Card>

            {/* Value & Behaviour */}
            <Card title="Value & Behaviour">
              <Row
                label="Lifetime Value"
                value={`₹${user.lifetimeValue.toLocaleString("en-IN")}`}
              />
              <Row label="Total Orders" value={user.totalOrders.toString()} />
              <Row label="Price Conscious" value={user.segment.priceConscious ? "Yes" : "No"} />
              <Row label="Adventurous" value={user.segment.adventurous ? "Yes" : "No"} />
            </Card>

            {/* Design Prefs */}
            <Card title="Design Preferences">
              <Row label="Mode" value={user.designPreference} />
              <Row label="Minimalism" value={user.minimalismLevel} />
              <Row
                label="Categories"
                value={user.preferredCategories.join(" · ")}
              />
            </Card>

            {/* Recent Purchases */}
            <Card title="Recent Purchases">
              <ul className="space-y-1">
                {user.pastPurchases.slice(0, 4).map((p) => (
                  <li key={p.productId} className="flex justify-between text-sm">
                    <span className="text-slate-300 truncate pr-2">{p.name}</span>
                    <span className="text-slate-500 shrink-0">
                      ₹{p.pricePaid.toLocaleString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* ── Product Catalog ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-4">
            📦 Mock Product Catalog ({PRODUCT_CATALOG.length} products)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRODUCT_CATALOG.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-slate-500">{product.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {product.category}
                  </span>
                </div>
                <p className="font-semibold text-white text-sm">{product.name}</p>
                <p className="text-slate-500 text-xs mt-1">{product.brand}</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-emerald-400 font-bold">
                    ₹{product.priceINR.toLocaleString("en-IN")}
                  </span>
                  {product.originalPriceINR && (
                    <span className="line-through text-slate-600 text-xs">
                      ₹{product.originalPriceINR.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="border-t border-slate-800 pt-6 text-slate-600 text-xs">
          Step 1 complete. Next: <code className="text-slate-400">useBehaviorTracker</code> hook →
          Context Engine → Generative UI.
        </div>
      </div>
    </main>
  );
}

/* ── Tiny inline components (server-side, zero client JS) ────────────────── */

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900 p-5 ${className}`}
    >
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-start gap-2 py-1 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-xs shrink-0">{label}</span>
      <span className="text-slate-200 text-xs text-right">{value}</span>
    </div>
  );
}
