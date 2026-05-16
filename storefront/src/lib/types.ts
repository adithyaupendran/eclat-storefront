/**
 * Central type definitions for the Context-Aware Generative Storefront.
 *
 * These types flow through every layer:
 *   Environmental → Historical → Behavioral → ContextEngine → GenerativeUI
 */

// ─── Re-export layer types ────────────────────────────────────────────────────
export type {
  EnvironmentalPayload,
  WeatherCondition,
  TimeOfDay,
} from "@/lib/mock/environmental";

export type {
  HistoricalPayload,
  PastPurchase,
  UserSegment,
  DesignPreference,
  MinimalismLevel,
} from "@/lib/mock/historical";

// ─── Behavioral Layer (defined here, implemented in the hook) ─────────────────
export interface BehavioralSignal {
  scrollDepthPercent: number;          // 0-100
  /** Product IDs the user has hovered/focused for > dwellThresholdMs */
  dwelledProducts: string[];
  /** Product IDs where the user hesitated over the price (> 5 s) */
  hesitatedOnPrice: string[];
  /** Seconds spent on the current page */
  pageTimeSeconds: number;
  /** True when user is moving mouse in slow, indecisive patterns */
  isHesitating: boolean;
  /** Sizes the user has mentioned in natural language searches — remembered across sessions */
  sizePreferences: string[];           // e.g. ['M', 'L']
  /** The last natural language query submitted — drives the search results overlay */
  lastSearchQuery: string;
}

// ─── Merged Context State ─────────────────────────────────────────────────────
export interface ContextState {
  environmental: import("@/lib/mock/environmental").EnvironmentalPayload;
  historical: import("@/lib/mock/historical").HistoricalPayload;
  behavioral: BehavioralSignal;
}

// ─── Generative Storefront Output ────────────────────────────────────────────
export type TailwindColorScheme =
  | "monsoon"   // slate/blue, muted — rainy weather
  | "sunny"     // amber/orange, warm — clear weather
  | "night"     // indigo/violet, deep — late night
  | "dawn"      // rose/peach — early hours
  | "neutral";  // default

export interface StorefrontPayload {
  /** Large hero headline — the main emotional hook */
  heroHeadline: string;
  /** Supporting copy beneath the headline */
  heroSubtext: string;
  /** CTA button label */
  ctaLabel: string;
  /** Colour scheme identifier — drives Tailwind class switching */
  colorScheme: TailwindColorScheme;
  /**
   * Tailwind classes for key design tokens.
   * Applied to the root layout wrapper so every component inherits them.
   */
  tailwindThemeClasses: {
    background: string;
    surface: string;
    primary: string;
    primaryHover: string;
    text: string;
    subtext: string;
    accent: string;
    border: string;
    badge: string;
  };
  /** Featured product IDs to surface in the hero section */
  featuredProductIds: string[];
  /** Optional urgency/social proof nudge */
  nudgeMessage: string | null;
}
