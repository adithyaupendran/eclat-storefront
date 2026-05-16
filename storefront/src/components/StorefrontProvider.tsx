"use client";

import { useEffect, useRef } from "react";
import { useStorefrontStore } from "@/store/storefrontStore";
import { useBehaviorTracker } from "@/hooks/useBehaviorTracker";
import { BehaviorContext } from "@/context/BehaviorContext";
import type { EnvironmentalPayload } from "@/lib/mock/environmental";
import type { HistoricalPayload } from "@/lib/mock/historical";

interface StorefrontProviderProps {
  env: EnvironmentalPayload;
  historical: HistoricalPayload;
  children: React.ReactNode;
}

export function StorefrontProvider({
  env,
  historical,
  children,
}: StorefrontProviderProps) {
  const init = useStorefrontStore((s) => s.init);
  const updateBehavioral = useStorefrontStore((s) => s.updateBehavioral);
  const initialized = useRef(false);

  // ── Hydrate store once on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!initialized.current) {
      init(env, historical);
      initialized.current = true;
    }
  }, [env, historical, init]);

  // ── Run the behavior tracker hook ────────────────────────────────────────
  const tracker = useBehaviorTracker();
  const prevSignals = useRef(tracker);

  // Diff + push only changed signals to Zustand (avoids re-gen spam)
  useEffect(() => {
    const prev = prevSignals.current;
    const patch: Parameters<typeof updateBehavioral>[0] = {};
    let changed = false;

    if (tracker.scrollDepthPercent !== prev.scrollDepthPercent) {
      patch.scrollDepthPercent = tracker.scrollDepthPercent;
      changed = true;
    }
    if (tracker.pageTimeSeconds !== prev.pageTimeSeconds) {
      patch.pageTimeSeconds = tracker.pageTimeSeconds;
      changed = true;
    }
    if (tracker.isHesitating !== prev.isHesitating) {
      patch.isHesitating = tracker.isHesitating;
      changed = true;
    }
    if (
      JSON.stringify(tracker.dwelledProducts) !==
      JSON.stringify(prev.dwelledProducts)
    ) {
      patch.dwelledProducts = tracker.dwelledProducts;
      changed = true;
    }
    if (
      JSON.stringify(tracker.hesitatedOnPrice) !==
      JSON.stringify(prev.hesitatedOnPrice)
    ) {
      patch.hesitatedOnPrice = tracker.hesitatedOnPrice;
      changed = true;
    }

    if (changed) {
      updateBehavioral(patch);
      prevSignals.current = tracker;
    }
  }, [tracker, updateBehavioral]);

  return (
    <BehaviorContext.Provider
      value={{
        getProductProps: tracker.getProductProps,
        getPriceProps: tracker.getPriceProps,
      }}
    >
      {children}
    </BehaviorContext.Provider>
  );
}
