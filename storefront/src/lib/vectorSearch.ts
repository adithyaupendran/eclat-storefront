/**
 * vectorSearch.ts — TypeScript client for the FastAPI vector search service
 *
 * Wraps POST http://localhost:8000/search with:
 *   - 450ms hard timeout (falls back gracefully if service is down)
 *   - Typed request/response
 *   - Automatic null on any error (caller handles fallback)
 */

const VECTOR_SEARCH_URL = process.env.VECTOR_SEARCH_URL ?? "";
const VECTOR_SEARCH_SECRET = process.env.VECTOR_SEARCH_SECRET ?? "";
const TIMEOUT_MS = 450;
const CONFIDENCE_THRESHOLD = 0.30;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VectorSearchResultItem {
  product_id: string;
  score: number;
  semantic_score: number;
  reasons: string[];
}

export interface VectorSearchResponse {
  query: string;
  detected_sizes: string[];
  detected_colors: string[];
  detected_occasion: string | null;
  results: VectorSearchResultItem[];
  confidence: number;
  source: "vector" | "fallback";
  interpreted_as: string;
}

export interface VectorSearchRequest {
  query: string;
  size_preferences?: string[];
  user_id?: string;
  limit?: number;
  viewed_categories?: string[];
  purchased_categories?: string[];
}

// ── Client ────────────────────────────────────────────────────────────────────

/**
 * Call the FastAPI vector search service.
 *
 * Returns null if:
 *   - VECTOR_SEARCH_URL is not configured
 *   - Service is unreachable or times out
 *   - Any network / parse error
 *
 * The caller (route.ts) must handle null by falling back to Gemini/TypeScript.
 */
export async function vectorSearch(
  req: VectorSearchRequest
): Promise<VectorSearchResponse | null> {
  if (!VECTOR_SEARCH_URL) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${VECTOR_SEARCH_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Search-Secret": VECTOR_SEARCH_SECRET,
      },
      body: JSON.stringify({
        query: req.query,
        size_preferences: req.size_preferences ?? [],
        user_id: req.user_id,
        limit: req.limit ?? 8,
        viewed_categories: req.viewed_categories ?? [],
        purchased_categories: req.purchased_categories ?? [],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`[vectorSearch] Service returned ${res.status}`);
      return null;
    }

    const data: VectorSearchResponse = await res.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("[vectorSearch] Timeout — falling back to Gemini");
    } else {
      console.warn("[vectorSearch] Error:", err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Returns true if the vector search result has enough confidence
 * to be used directly without falling back.
 */
export function isConfident(result: VectorSearchResponse): boolean {
  return result.confidence >= CONFIDENCE_THRESHOLD && result.results.length > 0;
}
