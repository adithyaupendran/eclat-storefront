"use client";

/**
 * useBehaviorTracker
 *
 * Behavioral Layer hook. Tracks real-time user signals and feeds them into
 * the ContextEngine so the storefront can adapt copy + theme live.
 *
 * Signals tracked:
 *  - scrollDepthPercent    → how far down the page the user reached (0-100)
 *  - dwelledProducts       → product IDs where cursor lingered > DWELL_MS
 *  - hesitatedOnPrice      → product IDs where cursor sat on price > HESITATE_MS without clicking
 *  - pageTimeSeconds       → total seconds on this page
 *  - isHesitating          → true when mouse movement is slow + indecisive (velocity < threshold)
 *
 * Usage:
 *   const signals = useBehaviorTracker();
 *
 * To register a product card:
 *   <div {...signals.getProductProps("prd_r001")}>
 *
 * To register a price element:
 *   <span {...signals.getPriceProps("prd_r001")}>
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { BehavioralSignal } from "@/lib/types";

// ─── Tuneable constants ───────────────────────────────────────────────────────
const DWELL_MS = 2_000;          // ms on product card before counting as "dwelled"
const HESITATE_MS = 5_000;       // ms on price element before counting as "hesitated"
const SCROLL_DEBOUNCE_MS = 150;  // debounce scroll events
const MOUSE_DEBOUNCE_MS = 80;    // debounce mousemove events
const HESITATION_VELOCITY = 6;   // px/s — below this = "slow, indecisive" movement
const HESITATION_WINDOW = 800;   // ms window to measure velocity over

// ─── Internal helpers ─────────────────────────────────────────────────────────
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export interface BehaviorTrackerReturn extends BehavioralSignal {
  /** Spread onto a product card container element */
  getProductProps: (productId: string) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  /** Spread onto the price element inside a product card */
  getPriceProps: (productId: string) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
  };
}

export function useBehaviorTracker(): BehaviorTrackerReturn {
  // ── State ──────────────────────────────────────────────────────────────────
  const [scrollDepthPercent, setScrollDepthPercent] = useState(0);
  const [dwelledProducts, setDwelledProducts] = useState<string[]>([]);
  const [hesitatedOnPrice, setHesitatedOnPrice] = useState<string[]>([]);
  const [pageTimeSeconds, setPageTimeSeconds] = useState(0);
  const [isHesitating, setIsHesitating] = useState(false);

  // ── Refs (mutable, no re-render) ───────────────────────────────────────────
  const dwellTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const priceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const priceClicked = useRef<Set<string>>(new Set());
  const pageStartTime = useRef(Date.now());
  const pageTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Mouse velocity tracking
  const lastMousePos = useRef({ x: 0, y: 0, t: Date.now() });
  const velocityHistory = useRef<number[]>([]);

  // ── Scroll tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = debounce(() => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) return;
      const pct = Math.round((scrolled / total) * 100);
      setScrollDepthPercent((prev) => Math.max(prev, pct)); // only ever increases
    }, SCROLL_DEBOUNCE_MS);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Page time tracking ─────────────────────────────────────────────────────
  useEffect(() => {
    pageTimerRef.current = setInterval(() => {
      setPageTimeSeconds(Math.floor((Date.now() - pageStartTime.current) / 1000));
    }, 1_000);
    return () => clearInterval(pageTimerRef.current);
  }, []);

  // ── Mouse velocity (hesitation detection) ─────────────────────────────────
  useEffect(() => {
    const rawMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const dt = (now - lastMousePos.current.t) / 1000; // seconds
      if (dt === 0) return;

      const velocity = Math.sqrt(dx * dx + dy * dy) / dt; // px/s
      lastMousePos.current = { x: e.clientX, y: e.clientY, t: now };

      // Rolling window: keep last N velocity readings
      velocityHistory.current.push(velocity);
      if (velocityHistory.current.length > 10) velocityHistory.current.shift();

      // Hesitating = recent average velocity below threshold
      const avg =
        velocityHistory.current.reduce((a, b) => a + b, 0) /
        velocityHistory.current.length;

      // Only flag hesitation after enough data points collected
      if (velocityHistory.current.length >= 5) {
        setIsHesitating(avg < HESITATION_VELOCITY);
      }
    };
    let mouseMoveTimer: ReturnType<typeof setTimeout>;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseMoveTimer);
      mouseMoveTimer = setTimeout(() => rawMouseMove(e), MOUSE_DEBOUNCE_MS);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Reset hesitation flag after the velocity window expires
    const resetTimer = setInterval(() => {
      if (velocityHistory.current.length === 0) setIsHesitating(false);
    }, HESITATION_WINDOW);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(resetTimer);
    };
  }, []);

  // ── Cleanup all timers on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      dwellTimers.current.forEach(clearTimeout);
      priceTimers.current.forEach(clearTimeout);
    };
  }, []);

  // ── Product card props ─────────────────────────────────────────────────────
  const getProductProps = useCallback(
    (productId: string) => {
      const startDwell = () => {
        if (dwellTimers.current.has(productId)) return; // already timing
        const timer = setTimeout(() => {
          setDwelledProducts((prev) =>
            prev.includes(productId) ? prev : [...prev, productId]
          );
          dwellTimers.current.delete(productId);
        }, DWELL_MS);
        dwellTimers.current.set(productId, timer);
      };

      const cancelDwell = () => {
        const timer = dwellTimers.current.get(productId);
        if (timer) {
          clearTimeout(timer);
          dwellTimers.current.delete(productId);
        }
      };

      return {
        onMouseEnter: startDwell,
        onMouseLeave: cancelDwell,
        onFocus: startDwell,
        onBlur: cancelDwell,
      };
    },
    []
  );

  // ── Price element props ────────────────────────────────────────────────────
  const getPriceProps = useCallback(
    (productId: string) => {
      const startHesitate = () => {
        // Don't re-time if already clicked or already hesitated
        if (
          priceClicked.current.has(productId) ||
          priceTimers.current.has(productId)
        )
          return;

        const timer = setTimeout(() => {
          // Only flag if user never clicked the price/CTA
          if (!priceClicked.current.has(productId)) {
            setHesitatedOnPrice((prev) =>
              prev.includes(productId) ? prev : [...prev, productId]
            );
          }
          priceTimers.current.delete(productId);
        }, HESITATE_MS);

        priceTimers.current.set(productId, timer);
      };

      const cancelHesitate = () => {
        const timer = priceTimers.current.get(productId);
        if (timer) {
          clearTimeout(timer);
          priceTimers.current.delete(productId);
        }
      };

      const onClick = () => {
        priceClicked.current.add(productId);
        cancelHesitate();
        // Remove from hesitated list if they eventually clicked
        setHesitatedOnPrice((prev) => prev.filter((id) => id !== productId));
      };

      return {
        onMouseEnter: startHesitate,
        onMouseLeave: cancelHesitate,
        onClick,
      };
    },
    []
  );

  return {
    scrollDepthPercent,
    dwelledProducts,
    hesitatedOnPrice,
    pageTimeSeconds,
    isHesitating,
    sizePreferences: [],     // managed by EclatSearchOverlay via Zustand directly
    lastSearchQuery: "",     // managed by EclatSearchOverlay via Zustand directly
    getProductProps,
    getPriceProps,
  };
}
