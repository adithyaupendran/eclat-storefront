"use client";

/**
 * BehaviorContext
 *
 * Exposes product-level behavior tracker props to any component in the tree
 * without prop drilling. Populated by StorefrontProvider.
 */

import { createContext, useContext } from "react";
import type { BehaviorTrackerReturn } from "@/hooks/useBehaviorTracker";

type BehaviorContextValue = Pick<
  BehaviorTrackerReturn,
  "getProductProps" | "getPriceProps"
>;

export const BehaviorContext = createContext<BehaviorContextValue | null>(null);

export function useBehaviorActions(): BehaviorContextValue {
  const ctx = useContext(BehaviorContext);
  // Graceful fallback — never throws, just no-ops (safe for SSR)
  if (!ctx) {
    return {
      getProductProps: () => ({
        onMouseEnter: () => {},
        onMouseLeave: () => {},
        onFocus: () => {},
        onBlur: () => {},
      }),
      getPriceProps: () => ({
        onMouseEnter: () => {},
        onMouseLeave: () => {},
        onClick: () => {},
      }),
    };
  }
  return ctx;
}
