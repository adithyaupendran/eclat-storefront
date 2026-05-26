"""
POST /embed-products — index a list of products into ChromaDB

Accepts the product list directly (for local catalog seeding).
Protected by shared secret.
"""

from fastapi import APIRouter, HTTPException

from app.models import EmbedRequest, EmbedResponse
from app.embedder import embedder
from app.chroma_client import chroma
from app.config import settings

router = APIRouter(tags=["admin"])


def build_searchable_text(product: dict) -> str:
    """
    Convert a product dict into rich semantic text for embedding.

    Format:
      {name}. {category}. {tags}. {description}. {semantic vibe}. {semantic aesthetic}.
    """
    parts: list[str] = []

    name = product.get("name", "")
    if name:
        parts.append(name)

    category = product.get("category", "")
    if category:
        parts.append(category.replace("_", " "))

    tags = product.get("tags", [])
    if tags:
        parts.append(" ".join(tags))

    description = product.get("shortDescription") or product.get("description", "")
    if description:
        parts.append(description)

    semantic = product.get("semantic") or {}
    for key in ("style", "vibe", "aesthetic", "colorEmotion"):
        vals = semantic.get(key, [])
        if vals:
            parts.append(" ".join(vals))

    return ". ".join(parts)


@router.post("/embed-products", response_model=EmbedResponse)
async def embed_products(req: EmbedRequest):
    if req.secret != settings.vector_search_secret:
        raise HTTPException(status_code=401, detail="Invalid secret")

    if not req.products:
        raise HTTPException(status_code=400, detail="No products provided")

    # Build searchable texts
    enriched = []
    for product in req.products:
        product["searchable_text"] = build_searchable_text(product)
        # Normalise field names
        product.setdefault("stock", product.get("stock", 0))
        product.setdefault("price", product.get("priceINR", 0))
        product.setdefault("review_count", product.get("reviewCount", 0))
        product.setdefault("rating", product.get("rating", 0))
        product.setdefault("sizes", product.get("sizes", []))
        product.setdefault("tags", product.get("tags", []))
        product.setdefault("color", "")
        product.setdefault("aesthetic", " ".join((product.get("semantic") or {}).get("aesthetic", [])))
        product.setdefault("gender", "unisex")
        enriched.append(product)

    # Batch embed
    texts = [p["searchable_text"] for p in enriched]
    embeddings = embedder.embed_batch(texts)

    # Upsert into ChromaDB
    chroma.upsert_products(enriched, embeddings)

    print(f"[embed-products] Indexed {len(enriched)} products")
    return EmbedResponse(indexed=len(enriched), collection=settings.chroma_collection)
