"use client";

/**
 * Zustand store — StorefrontStore
 *
 * Holds the live ContextState and the derived StorefrontPayload.
 * The client layout initialises it once from server-passed props;
 * the useBehaviorTracker hook updates it on every significant signal change.
 *
 * Components read from this store — they never call generateStorefront() directly.
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { ContextState, StorefrontPayload, BehavioralSignal } from "@/lib/types";
import { mergeContext, generateStorefront } from "@/lib/contextEngine";
import type { EnvironmentalPayload } from "@/lib/mock/environmental";
import type { HistoricalPayload } from "@/lib/mock/historical";

// ─── Initial / zero-state behavioral signal ──────────────────────────────────
export const EMPTY_BEHAVIORAL: BehavioralSignal = {
  scrollDepthPercent: 0,
  dwelledProducts: [],
  hesitatedOnPrice: [],
  pageTimeSeconds: 0,
  isHesitating: false,
  sizePreferences: [],
  lastSearchQuery: "",
};

// ─── Store shape ──────────────────────────────────────────────────────────────
interface StorefrontState {
  // Raw layer data
  environmental: EnvironmentalPayload | null;
  historical: HistoricalPayload | null;
  behavioral: BehavioralSignal;

  // Derived output (null until both env + historical are loaded)
  storefrontPayload: StorefrontPayload | null;

  // Actions
  /** Called once from the server-initialised client layout */
  init: (env: EnvironmentalPayload, hist: HistoricalPayload) => void;
  /** Called by the behavior tracker whenever a signal changes */
  updateBehavioral: (patch: Partial<BehavioralSignal>) => void;
  /** Force a full re-generation (e.g. after A/B test flag flip) */
  regenerate: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStorefrontStore = create<StorefrontState>()(
  subscribeWithSelector((set, get) => ({
    environmental: null,
    historical: null,
    behavioral: EMPTY_BEHAVIORAL,
    storefrontPayload: null,

    init(env, hist) {
      const behavioral = get().behavioral;
      const ctx: ContextState = mergeContext(env, hist, behavioral);
      set({
        environmental: env,
        historical: hist,
        storefrontPayload: generateStorefront(ctx),
      });
    },

    updateBehavioral(patch) {
      const next = { ...get().behavioral, ...patch };
      const { environmental, historical } = get();
      if (!environmental || !historical) {
        set({ behavioral: next });
        return;
      }
      const ctx: ContextState = mergeContext(environmental, historical, next);
      set({
        behavioral: next,
        storefrontPayload: generateStorefront(ctx),
      });
    },

    regenerate() {
      const { environmental, historical, behavioral } = get();
      if (!environmental || !historical) return;
      const ctx: ContextState = mergeContext(environmental, historical, behavioral);
      set({ storefrontPayload: generateStorefront(ctx) });
    },
  }))
);

// ─── Selector hooks (prevents unnecessary re-renders) ────────────────────────
export const useStorefrontPayload = () =>
  useStorefrontStore((s) => s.storefrontPayload);

export const useThemeClasses = () =>
  useStorefrontStore((s) => s.storefrontPayload?.tailwindThemeClasses ?? null);

export const useBehavioralSignals = () =>
  useStorefrontStore((s) => s.behavioral);
