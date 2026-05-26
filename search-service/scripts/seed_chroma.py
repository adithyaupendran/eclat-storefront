"""
scripts/seed_chroma.py
──────────────────────
One-shot script: export catalog → embed → index into ChromaDB.

Run from search-service/ after installing requirements:
    python scripts/seed_chroma.py

Optional flags:
    --source catalog    (default) use local catalog_export.json
    --source supabase   fetch live from Supabase
    --wipe              delete existing collection before indexing
"""

import sys
import argparse
import json
import time
from pathlib import Path

# Allow imports from parent directory
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.embedder import embedder
from app.chroma_client import chroma
from app.routes.embed import build_searchable_text
from scripts.export_catalog import CATALOG


def seed_from_catalog(products: list[dict]) -> int:
    """Embed and index products. Returns count of indexed products."""
    enriched = []
    for p in products:
        product = dict(p)  # copy
        product["searchable_text"] = build_searchable_text(product)
        product["price"]        = product.get("priceINR", 0)
        product["review_count"] = product.get("reviewCount", 0)
        product["stock"]        = product.get("stock", 0)
        product["rating"]       = product.get("rating", 0)
        product["sizes"]        = product.get("sizes", [])
        product["tags"]         = product.get("tags", [])
        product["color"]        = ""
        semantic = product.get("semantic") or {}
        product["aesthetic"]    = " ".join(semantic.get("aesthetic", []))
        product["gender"]       = "unisex"
        enriched.append(product)

    print(f"  Embedding {len(enriched)} products (model: {settings.embedding_model})...")
    t0 = time.perf_counter()
    texts = [p["searchable_text"] for p in enriched]
    embeddings = embedder.embed_batch(texts)
    elapsed = time.perf_counter() - t0
    print(f"  ✅ Embedded in {elapsed:.1f}s")

    print("  Upserting into ChromaDB...")
    chroma.upsert_products(enriched, embeddings)
    return len(enriched)


def main():
    parser = argparse.ArgumentParser(description="Seed ChromaDB with ÉCLAT products")
    parser.add_argument("--source", choices=["catalog", "supabase"], default="catalog")
    parser.add_argument("--wipe", action="store_true", help="Wipe existing collection first")
    args = parser.parse_args()

    print("[ECLAT] ChromaDB Seeder")
    print(f"   Collection : {settings.chroma_collection}")
    print(f"   Data path  : {settings.chroma_data_path}")
    print(f"   Source     : {args.source}")
    print()

    if args.wipe:
        print("[WIPE] Wiping existing collection...")
        chroma.delete_all()
        print("   Done.")

    existing = chroma.count()
    if existing > 0 and not args.wipe:
        print(f"[INFO] Collection already has {existing} products.")
        answer = input("   Re-index anyway? [y/N] ").strip().lower()
        if answer != "y":
            print("   Aborted.")
            return

    # Warmup embedder
    print("[LOAD] Loading embedding model...")
    embedder.warmup()

    # Get products
    if args.source == "catalog":
        # Export first (in case catalog_export.json is stale)
        from scripts.export_catalog import main as export_main
        export_main()
        catalog_path = Path(__file__).parent / "catalog_export.json"
        with open(catalog_path, "r", encoding="utf-8") as f:
            products = json.load(f)
    else:
        print("Fetching from Supabase...")
        from supabase import create_client
        client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        resp = client.table("products").select("*").execute()
        products = resp.data or []

    print(f"[FOUND] {len(products)} products to index")
    count = seed_from_catalog(products)

    print()
    print(f"[DONE] {count} products indexed in ChromaDB.")
    print(f"   Total in collection: {chroma.count()}")
    print()
    print("Start service:  python -m uvicorn main:app --reload")
    print('Test: curl -X POST http://localhost:8000/search -H "Content-Type: application/json" -d \'{"query": "warm outfit for dinner"}\'')


if __name__ == "__main__":
    main()
