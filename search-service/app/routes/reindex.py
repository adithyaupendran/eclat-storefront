"""
POST /reindex — wipe ChromaDB and re-embed from Supabase or local catalog

Protected by shared secret.
"""

import json
import os
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.models import ReindexRequest, ReindexResponse
from app.routes.embed import embed_products, EmbedRequest
from app.chroma_client import chroma
from app.config import settings

router = APIRouter(tags=["admin"])


async def _fetch_from_supabase() -> list[dict]:
    """Fetch products from Supabase products table."""
    try:
        from supabase import create_client
        client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        response = client.table("products").select("*").execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase fetch failed: {e}")


def _fetch_from_local_catalog() -> list[dict]:
    """
    Load products from the exported local catalog JSON.
    Run scripts/export_catalog.py first to generate it.
    """
    catalog_path = Path(__file__).parent.parent.parent / "scripts" / "catalog_export.json"
    if not catalog_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Local catalog not found at {catalog_path}. Run scripts/export_catalog.py first.",
        )
    with open(catalog_path, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/reindex", response_model=ReindexResponse)
async def reindex(req: ReindexRequest):
    if req.secret != settings.vector_search_secret:
        raise HTTPException(status_code=401, detail="Invalid secret")

    print(f"[reindex] Starting full reindex from source='{req.source}'")

    # 1. Fetch products
    if req.source == "supabase":
        products = await _fetch_from_supabase()
    else:
        products = _fetch_from_local_catalog()

    if not products:
        raise HTTPException(status_code=404, detail="No products found to index")

    # 2. Wipe existing collection
    print(f"[reindex] Wiping {chroma.count()} existing entries")
    chroma.delete_all()

    # 3. Re-embed and insert
    embed_req = EmbedRequest(products=products, secret=req.secret)
    result = await embed_products(embed_req)

    print(f"[reindex] Done — {result.indexed} products indexed")
    return ReindexResponse(indexed=result.indexed, source=req.source, collection=result.collection)
