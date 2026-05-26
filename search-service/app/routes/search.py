"""
POST /search — main hybrid vector search endpoint
"""

import time

from fastapi import APIRouter, HTTPException

from app.models import SearchRequest, SearchResponse
from app.embedder import embedder
from app.chroma_client import chroma
from app.intent import extract_intent
from app.ranker import rerank
from app.config import settings

router = APIRouter(tags=["search"])


@router.post("/search", response_model=SearchResponse)
async def search(req: SearchRequest):
    start = time.perf_counter()

    # Guard: nothing indexed yet
    if chroma.count() == 0:
        raise HTTPException(
            status_code=503,
            detail="ChromaDB is empty. Run POST /embed-products or POST /reindex first.",
        )

    # ── 1. Intent extraction ──────────────────────────────────────────────────
    intent = extract_intent(req.query, req.size_preferences)

    # ── 2. Embed enriched query ───────────────────────────────────────────────
    embedding = embedder.embed(intent.enriched_query)

    # ── 3. Vector search (retrieve top 15 candidates) ────────────────────────
    n_candidates = min(15, chroma.count())
    raw_results = chroma.query(embedding, n_results=n_candidates)

    # ── 4. Re-rank ────────────────────────────────────────────────────────────
    ranked = rerank(
        chroma_result=raw_results,
        requested_sizes=intent.sizes,
        viewed_categories=req.viewed_categories,
        purchased_categories=req.purchased_categories,
        top_n=req.limit,
        query=req.query,
        detected_colors=intent.colors,
        detected_aesthetics=intent.aesthetics,
        detected_occasion=intent.occasion,
    )

    # ── 5. Confidence = highest semantic score in results ─────────────────────
    confidence = ranked[0].semantic_score if ranked else 0.0

    # ── 6. Human-readable interpretation ─────────────────────────────────────
    parts: list[str] = []
    if intent.occasion:
        parts.append(intent.occasion)
    if intent.aesthetics:
        parts.extend(intent.aesthetics[:2])
    if intent.colors:
        parts.extend(intent.colors[:2])

    interpreted_as = (
        f"Showing {intent.occasion or 'fashion'} pieces"
        + (f" with {', '.join(intent.aesthetics[:2])} aesthetic" if intent.aesthetics else "")
        + (f" in {', '.join(intent.colors[:2])}" if intent.colors else "")
        + (f" · Sizes: {', '.join(intent.sizes)}" if intent.sizes else "")
    )

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    print(f"[search] query='{req.query}' → {len(ranked)} results in {elapsed_ms}ms (confidence={confidence:.2f})")

    return SearchResponse(
        query=req.query,
        detected_sizes=intent.sizes,
        detected_colors=intent.colors,
        detected_occasion=intent.occasion,
        results=ranked,
        confidence=confidence,
        source="vector",
        interpreted_as=interpreted_as,
    )
