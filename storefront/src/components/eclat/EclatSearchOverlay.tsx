"use client";
/**
 * EclatSearchOverlay — AI-powered natural language search.
 *
 * Primary: POST /api/search → Gemini extracts style intent → ranked results
 * Fallback: deterministic naturalLanguageSearch() if API fails/times out
 *
 * Features:
 *  - Free-form NL input ("I'm feeling something gothic", "suggest a silk evening piece")
 *  - Gemini interprets mood/vibe/aesthetic → maps to product tags
 *  - Size extraction + memory: "size M coat" → remembers M, surfaces M items first
 *  - AI-extracted tag pills shown below search bar
 *  - Loading skeleton while Gemini processes
 *  - Persists sizePreferences to Zustand behavioral store
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { naturalLanguageSearch, type SearchResult } from "@/lib/search";
import { type Product } from "@/lib/mock/catalog";
import { EclatProductCard } from "@/components/eclat/EclatProductCard";
import { useStorefrontStore, useBehavioralSignals } from "@/store/storefrontStore";

const EXAMPLE_QUERIES = [
  "I'm feeling something gothic",
  "something elegant for an evening out",
  "dramatic structured coat for the rain",
  "fluid and romantic, size S",
  "architectural statement piece",
  "everyday minimal separates, size M",
  "bold avant-garde outerwear",
];

interface EclatSearchOverlayProps {
  onClose: () => void;
}

type SearchMode = "idle" | "loading" | "done";

export function EclatSearchOverlay({ onClose }: EclatSearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("idle");
  const [results, setResults] = useState<Product[]>([]);
  const [legacyResults, setLegacyResults] = useState<SearchResult[]>([]);
  const [interpretedAs, setInterpretedAs] = useState<string>("");
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const signals = useBehavioralSignals();
  const updateBehavioral = useStorefrontStore((s) => s.updateBehavioral);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setMode("loading");
    setAiTags([]);
    setUsedFallback(false);
    setDidYouMean(null);

    let aiSucceeded = false;

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim(), sizePreferences: signals.sizePreferences }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
        setInterpretedAs(data.interpretedAs ?? `Results for: "${q}"`);
        setAiTags(data.aiTags ?? []);
        setDidYouMean(data.didYouMean ?? null);

        // Persist sizes
        if ((data.extractedSizes ?? []).length > 0) {
          const merged = [...new Set([...signals.sizePreferences, ...data.extractedSizes])];
          updateBehavioral({ sizePreferences: merged, lastSearchQuery: q.trim() });
        } else {
          updateBehavioral({ lastSearchQuery: q.trim() });
        }

        aiSucceeded = true;
      }
    } catch {
      aiSucceeded = false;
    }

    // Fallback to deterministic search
    if (!aiSucceeded) {
      const output = naturalLanguageSearch(q.trim(), signals.sizePreferences);
      setLegacyResults(output.results);
      setResults(output.results.map((r) => r.product));
      setInterpretedAs(output.interpretedAs);
      setUsedFallback(true);

      if (output.extractedSizes.length > 0) {
        const merged = [...new Set([...signals.sizePreferences, ...output.extractedSizes])];
        updateBehavioral({ sizePreferences: merged, lastSearchQuery: q.trim() });
      } else {
        updateBehavioral({ lastSearchQuery: q.trim() });
      }
    }

    setMode("done");
  }, [signals.sizePreferences, updateBehavioral]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const hasSearched = mode === "loading" || mode === "done";

  return (
    <div
      className="fixed inset-0 z-[60] eclat-surface overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 eclat-nav border-b border-[rgba(0,0,0,0.06)] z-10"
        style={{ padding: "0 2rem" }}
      >
        <div className="max-w-screen-xl mx-auto h-14 flex items-center gap-6">
          <Link
            href="/"
            onClick={onClose}
            className="shrink-0 hover:text-gray-500 transition-colors"
            style={{
              fontFamily: "var(--font-noto-serif)",
              fontSize: "1.125rem",
              color: "var(--eclat-on-surface)",
            }}
          >
            ÉCLAT
          </Link>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe a mood, material, occasion — anything..."
              className="flex-1 bg-transparent outline-none"
              disabled={mode === "loading"}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.9375rem",
                color: "var(--eclat-on-surface)",
                borderBottom: "1px solid var(--eclat-on-surface)",
                paddingBottom: "4px",
                caretColor: "var(--eclat-on-surface)",
                opacity: mode === "loading" ? 0.5 : 1,
              }}
            />
            <button
              type="submit"
              disabled={mode === "loading"}
              className="eclat-btn-primary ml-6 shrink-0"
              style={{ padding: "0.5rem 1.5rem", opacity: mode === "loading" ? 0.5 : 1 }}
            >
              {mode === "loading" ? "..." : "SEARCH"}
            </button>
          </form>

          <button
            onClick={onClose}
            className="eclat-label shrink-0 hover:text-black transition-colors"
          >
            CLOSE ×
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-8 py-12">

        {/* ── Size memory indicator ──────────────────────────────────── */}
        {signals.sizePreferences.length > 0 && (
          <div className="mb-8 flex items-center gap-3">
            <span className="eclat-label">Remembered sizes:</span>
            {signals.sizePreferences.map((s) => (
              <span key={s} className="eclat-label eclat-surface-container px-3 py-1">{s}</span>
            ))}
            <button className="eclat-btn-text" onClick={() => updateBehavioral({ sizePreferences: [] })}>
              clear
            </button>
          </div>
        )}

        {/* ── Pre-search: example queries ───────────────────────────── */}
        {!hasSearched && (
          <div>
            <p className="eclat-label mb-2" style={{ color: "var(--eclat-variant)" }}>
              Powered by Gemini AI — try natural language:
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); runSearch(q); }}
                  className="eclat-btn-secondary text-left"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.8125rem",
                    padding: "0.75rem 1.25rem",
                    letterSpacing: "0.02rem",
                    textTransform: "none",
                  }}
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────────────── */}
        {mode === "loading" && (
          <div>
            <p className="eclat-label mb-8" style={{ color: "var(--eclat-variant)" }}>
              Finding you the best fit...
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e8e8e8]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="eclat-surface-white" style={{ height: i === 0 ? 480 : 320 }}>
                  <div className="w-full h-full shimmer" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Post-search: results ──────────────────────────────────── */}
        {mode === "done" && (
          <>
            {/* AI tag pills */}
            {aiTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="eclat-label" style={{ color: "var(--eclat-variant)", alignSelf: "center" }}>
                  AI understood:
                </span>
                {aiTags.map((tag) => (
                  <span
                    key={tag}
                    className="eclat-label px-3 py-1"
                    style={{
                      background: "var(--eclat-black)",
                      color: "var(--eclat-on-black)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Fallback notice */}
            {usedFallback && (
              <p className="eclat-label mb-4" style={{ color: "var(--eclat-variant)" }}>
                AI unavailable — using built-in semantic search
              </p>
            )}

            {/* Interpretation */}
            <p
              className="mb-10 pb-6"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.8125rem",
                color: "var(--eclat-variant)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {interpretedAs}
            </p>

            {/* Did You Mean chip */}
            {didYouMean && (
              <div
                className="mb-6 flex items-center gap-3"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--eclat-variant)" }}>Did you mean:</span>
                <button
                  id="did-you-mean-btn"
                  onClick={() => {
                    setQuery(didYouMean);
                    setDidYouMean(null);
                    runSearch(didYouMean);
                  }}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.8125rem",
                    letterSpacing: "0.03em",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    cursor: "pointer",
                    color: "var(--eclat-on-surface)",
                    fontStyle: "italic",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  &ldquo;{didYouMean}&rdquo;
                </button>
                <button
                  onClick={() => setDidYouMean(null)}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.75rem",
                    color: "var(--eclat-variant)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    opacity: 0.6,
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {results.length === 0 ? (
              <div className="py-16 text-center">
                <p style={{ fontFamily: "var(--font-noto-serif)", fontSize: "1.5rem", fontStyle: "italic" }}>
                  Nothing matched.
                </p>
                <p className="eclat-body mt-2">Try describing a mood, material, or occasion.</p>
              </div>
            ) : (
              <>
                <p className="eclat-label mb-8">{results.length} pieces found</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#e8e8e8]">
                  {results.map((product, i) => {
                    // For fallback results, check size match from legacyResults
                    const legacy = legacyResults.find((r) => r.product.id === product.id);
                    const sizeMatch = legacy?.sizeMatch ??
                      (signals.sizePreferences.length > 0 &&
                        (product.sizes?.some((s) => signals.sizePreferences.includes(s)) ?? false));

                    return (
                      <div
                        key={product.id}
                        className={`eclat-surface-white eclat-fade-in ${i % 2 === 1 ? "md:mt-16" : ""}`}
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        <EclatProductCard product={product} size={i === 0 ? "tall" : "normal"} rank={i} />
                        {sizeMatch && (
                          <div className="px-5 pb-4">
                            <span className="eclat-label eclat-surface-container px-2 py-1">
                              ✓ Your size available
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
