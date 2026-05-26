"""
Re-ranking layer — applies weighted scoring on top of raw vector similarity.

ChromaDB returns cosine *distance* (0 = identical, 2 = opposite).
We convert to similarity = 1 - distance/2  →  range [0, 1].

Final score formula:
    final_score =
        0.45 * semantic_similarity
      + 0.25 * size_match_boost
      + 0.15 * in_stock_boost
      + 0.10 * user_preference_boost
      + 0.05 * trending_boost

Weights can be tuned via constants below.
"""

import math
import re
from dataclasses import dataclass, field

from app.models import SearchResultItem


# ── Weights (must sum to 1.0) ─────────────────────────────────────────────────
W_SEMANTIC   = 0.45
W_SIZE       = 0.25
W_STOCK      = 0.15
W_USER_PREF  = 0.10
W_TRENDING   = 0.05


@dataclass
class CandidateProduct:
    """Parsed result from a ChromaDB query row."""
    product_id: str
    distance: float        # ChromaDB cosine distance [0, 2]
    metadata: dict
    document: str


def _cosine_distance_to_similarity(distance: float) -> float:
    """Convert ChromaDB cosine distance to similarity score [0, 1]."""
    # ChromaDB cosine distance = 1 - cosine_similarity when vectors are normalized
    return max(0.0, min(1.0, 1.0 - distance))


def _has_keyword_match(
    metadata: dict,
    query: str,
    colors: list[str] | None = None,
    aesthetics: list[str] | None = None,
    occasion: str | None = None,
) -> bool:
    """Check if any word in the query or detected intent matches product tags, name, or category."""
    query_words = [w.lower().strip() for w in re.split(r"[^\w\-]+", query) if w.strip()]
    
    # Merge with detected attributes to cover corrected typos
    match_candidates = set(query_words)
    if colors:
        match_candidates.update(c.lower() for c in colors)
    if aesthetics:
        match_candidates.update(a.lower() for a in aesthetics)
    if occasion:
        match_candidates.add(occasion.lower())

    if not match_candidates:
        return False

    tags = [t.lower().strip() for t in metadata.get("tags", "").split(",") if t.strip()]
    name_words = [w.lower().strip() for w in re.split(r"[^\w\-]+", metadata.get("name", "")) if w.strip()]
    category = metadata.get("category", "").lower().replace("_", "-")

    for qw in match_candidates:
        if len(qw) <= 2 and qw not in ("s", "m", "l", "xl", "xs"):
            continue
        if qw in tags:
            return True
        if qw in name_words:
            return True
        for tag in tags:
            if qw in tag.split("-") or qw in tag.split("_"):
                return True
        if qw == category or qw in category.split("-"):
            return True
    return False


def _size_boost(metadata: dict, requested_sizes: list[str]) -> float:
    """1.0 if any requested size is available, else 0.0."""
    if not requested_sizes:
        return 0.5   # neutral when user hasn't specified size
    product_sizes = [s.strip() for s in metadata.get("sizes", "").split(",") if s.strip()]
    if not product_sizes:
        return 0.5   # product has no size info — neutral
    return 1.0 if any(s in product_sizes for s in requested_sizes) else 0.0


def _stock_boost(metadata: dict) -> float:
    """Boosts in-stock products. Low stock gets partial boost."""
    stock = int(metadata.get("stock", 0))
    if stock == 0:
        return 0.0
    if stock <= 5:
        return 0.6   # low stock — slight penalty to avoid over-promoting
    return 1.0


def _user_preference_boost(
    metadata: dict,
    viewed_categories: list[str],
    purchased_categories: list[str],
) -> float:
    """
    Simple category affinity. Purchased > viewed.
    Returns [0, 1].
    """
    category = metadata.get("category", "")
    if category in purchased_categories:
        return 1.0
    if category in viewed_categories:
        return 0.6
    return 0.0


def _trending_boost(metadata: dict) -> float:
    """
    Normalised popularity signal: rating * log10(reviewCount + 1).
    Normalised to [0, 1] against a theoretical max of 5 * log10(10001) ≈ 20.
    """
    rating = float(metadata.get("rating", 0))
    reviews = int(metadata.get("review_count", 0))
    raw = rating * math.log10(reviews + 1)
    MAX_RAW = 5.0 * math.log10(10_001)
    return min(1.0, raw / MAX_RAW)


def _build_reasons(
    semantic: float,
    size_b: float,
    stock_b: float,
    user_b: float,
    trend_b: float,
    requested_sizes: list[str],
) -> list[str]:
    reasons = []
    if semantic >= 0.65:
        reasons.append("strong-semantic-match")
    elif semantic >= 0.45:
        reasons.append("semantic-match")
    if requested_sizes and size_b == 1.0:
        reasons.append("size-match")
    if stock_b == 1.0:
        reasons.append("in-stock")
    elif stock_b == 0.0:
        reasons.append("low-stock")
    if user_b >= 0.6:
        reasons.append("matches-your-style")
    if trend_b >= 0.5:
        reasons.append("trending")
    return reasons or ["relevant"]


def rerank(
    chroma_result: dict,
    requested_sizes: list[str],
    viewed_categories: list[str] | None = None,
    purchased_categories: list[str] | None = None,
    top_n: int = 8,
    query: str = "",
    detected_colors: list[str] | None = None,
    detected_aesthetics: list[str] | None = None,
    detected_occasion: str | None = None,
) -> list[SearchResultItem]:
    """
    Takes raw ChromaDB query result and returns re-ranked SearchResultItems.

    chroma_result structure:
      {
        "ids": [[...]], "distances": [[...]], "metadatas": [[...]], "documents": [[...]]
      }
    """
    viewed_categories = viewed_categories or []
    purchased_categories = purchased_categories or []

    ids       = chroma_result["ids"][0]
    distances = chroma_result["distances"][0]
    metadatas = chroma_result["metadatas"][0]

    scored: list[tuple[float, float, list[str], str]] = []  # (final_score, semantic, reasons, id)

    for product_id, distance, metadata in zip(ids, distances, metadatas):
        semantic = _cosine_distance_to_similarity(distance)
        if query and _has_keyword_match(
            metadata,
            query,
            colors=detected_colors,
            aesthetics=detected_aesthetics,
            occasion=detected_occasion
        ):
            semantic = max(semantic, 0.75)

        size_b   = _size_boost(metadata, requested_sizes)
        stock_b  = _stock_boost(metadata)
        user_b   = _user_preference_boost(metadata, viewed_categories, purchased_categories)
        trend_b  = _trending_boost(metadata)

        final = (
            W_SEMANTIC  * semantic
          + W_SIZE      * size_b
          + W_STOCK     * stock_b
          + W_USER_PREF * user_b
          + W_TRENDING  * trend_b
        )

        reasons = _build_reasons(semantic, size_b, stock_b, user_b, trend_b, requested_sizes)
        scored.append((final, semantic, reasons, product_id))

    # Sort descending by final score
    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        SearchResultItem(
            product_id=pid,
            score=round(final, 4),
            semantic_score=round(semantic, 4),
            reasons=reasons,
        )
        for final, semantic, reasons, pid in scored[:top_n]
    ]

