/**
 * Historical Layer - Mock Data
 *
 * Simulates what would normally come from a user profile database or
 * a vector store query that fetches the customer's enriched history.
 *
 * In production this would be fetched server-side using the session token
 * before the page renders, so the storefront is personalised from the
 * very first paint.
 */

export type DesignPreference = "dark" | "light" | "system";
export type MinimalismLevel = "maximalist" | "balanced" | "minimalist";

export interface PastPurchase {
  productId: string;
  name: string;
  category: string;
  pricePaid: number;          // INR
  purchasedAt: string;        // ISO date
  rating: number | null;      // 1-5 or null if not rated
}

export interface UserSegment {
  tier: "bronze" | "silver" | "gold" | "platinum";
  priceConscious: boolean;     // true = show deals/offers prominently
  adventurous: boolean;        // true = willing to try new/unfamiliar products
}

export interface HistoricalPayload {
  userId: string;
  name: string;
  email: string;
  lifetimeValue: number;       // total spend in INR
  totalOrders: number;
  segment: UserSegment;
  pastPurchases: PastPurchase[];
  /** Top-3 categories by purchase frequency */
  preferredCategories: string[];
  designPreference: DesignPreference;
  minimalismLevel: MinimalismLevel;
  /** ISO timestamp of last login */
  lastActiveAt: string;
}

/**
 * getMockUserProfile()
 *
 * Returns a rich mock user profile that skews toward:
 * - Outdoor/adventure gear purchases (makes rain-gear upsells relevant)
 * - Tech accessories (expands cross-sell surface)
 * - Gold tier, moderate price consciousness (responds to value messaging)
 * - Minimalist dark-mode preference (informs Tailwind theme direction)
 */
export function getMockUserProfile(): HistoricalPayload {
  return {
    userId: "usr_8f3a2d9c",
    name: "Arjun Shetty",
    email: "arjun.shetty@example.in",
    lifetimeValue: 47_850,
    totalOrders: 14,

    segment: {
      tier: "gold",
      priceConscious: true,
      adventurous: false,
    },

    pastPurchases: [
      {
        productId: "prd_001",
        name: "Wildcraft Trekking Backpack 55L",
        category: "outdoor_gear",
        pricePaid: 3_499,
        purchasedAt: "2025-09-12T10:30:00Z",
        rating: 5,
      },
      {
        productId: "prd_002",
        name: "Decathlon Waterproof Jacket",
        category: "outdoor_gear",
        pricePaid: 2_299,
        purchasedAt: "2025-08-05T14:20:00Z",
        rating: 4,
      },
      {
        productId: "prd_003",
        name: "Sony WH-1000XM5 Headphones",
        category: "tech_accessories",
        pricePaid: 26_990,
        purchasedAt: "2025-07-20T09:00:00Z",
        rating: 5,
      },
      {
        productId: "prd_004",
        name: "Anker 65W GaN Charger",
        category: "tech_accessories",
        pricePaid: 2_799,
        purchasedAt: "2025-06-15T11:45:00Z",
        rating: 4,
      },
      {
        productId: "prd_005",
        name: "Columbia Omni-Shield Trail Shoes",
        category: "outdoor_gear",
        pricePaid: 5_499,
        purchasedAt: "2025-05-02T16:10:00Z",
        rating: null,
      },
      {
        productId: "prd_006",
        name: "Peak Design Travel Tripod",
        category: "tech_accessories",
        pricePaid: 6_199,
        purchasedAt: "2025-03-28T13:00:00Z",
        rating: 5,
      },
    ],

    preferredCategories: ["outdoor_gear", "tech_accessories", "travel"],

    designPreference: "dark",
    minimalismLevel: "minimalist",

    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  };
}

/**
 * FUTURE: Replace mock with real DB call
 *
 * export async function getUserProfile(userId: string): Promise<HistoricalPayload> {
 *   const row = await db.query.users.findFirst({
 *     where: eq(users.id, userId),
 *     with: { purchases: true },
 *   });
 *   return transformDbRow(row);
 * }
 */
