"use client";
/**
 * EclatHero — Full-bleed editorial hero section.
 * Dark photography placeholder with large Noto Serif headline overlaid.
 * Static design — no content changes (per user requirement).
 * Context engine does NOT alter the hero copy; only products change below.
 */

export function EclatHero() {
  return (
    <section className="relative w-full" style={{ height: "92vh", minHeight: "560px" }}>
      {/* ── Real hero image ──────────────────────────────────────────────── */}
      <img
        src="/eclat/malicki-m-beser-PKMvkg7vnUo-unsplash.jpg"
        alt="ÉCLAT Collection 004 — The Winter Anthology"
        className="absolute inset-0 w-full h-full object-cover object-top z-[1]"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {/* Gradient fallback (also visible behind semi-transparent images) */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #1a1a1a 0%, #2d2b28 30%, #3f3b36 70%, #1a1a1a 100%)" }}
        aria-hidden="true"
      />


      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-20 z-[2]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
        aria-hidden="true"
      />

      {/* Dark gradient scrim for text legibility */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.20) 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Editorial season label ───────────────────────────────────────── */}
      <div className="absolute top-8 left-8 z-[4]">
        <span
          className="text-[#1b1b1b]/80"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.6875rem",
            letterSpacing: "0.15rem",
            textTransform: "uppercase",
          }}
        >
          Collection 004 / L'Essence
        </span>
      </div>

      {/* ── Headline content (bottom-left aligned, editorial style) ──────── */}
      <div className="absolute bottom-12 left-8 right-8 md:left-16 md:right-16 max-w-2xl z-[4]">
        <h1
          className="text-white mb-6 eclat-reveal"
          style={{
            fontFamily: "var(--font-noto-serif)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: 1.05,
            fontWeight: 400,
          }}
        >
          The Winter
          <br />
          <em>Anthology</em>
        </h1>

        <p
          className="text-[#e2e2e2]/70 mb-8 max-w-sm"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          }}
        >
          Quiet elegance in monochrome. A collection defined by what is removed.
        </p>

        <button className="eclat-btn-primary">
          SHOP THE LOOK
        </button>
      </div>

      {/* ── Issue number top-right ───────────────────────────────────────── */}
      <div
        className="absolute top-8 right-8 text-[#e2e2e2]/50 z-[4]"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "0.6875rem",
          letterSpacing: "0.1rem",
        }}
      >
        No. 04
      </div>
    </section>
  );
}
