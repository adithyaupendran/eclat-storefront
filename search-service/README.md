# ÉCLAT Vector Search Service

Python FastAPI microservice providing production-grade hybrid semantic search for the ÉCLAT storefront.

## Architecture

```
User Query
    ↓
POST /api/search  (Next.js — route.ts)
    ↓
TIER 1: POST /search  ←── FastAPI (this service) ← PRIMARY
    ├── Intent extraction  (size / color / occasion)
    ├── Query enrichment   (append signals before embedding)
    ├── Embedding          (all-MiniLM-L6-v2 · 384-dim)
    ├── ChromaDB search    (cosine similarity · top 15)
    └── Re-ranking         (semantic × 0.45 + size × 0.25 + stock × 0.15 + pref × 0.10 + trend × 0.05)
    ↓ (if confidence < 0.40 or service down)
TIER 2: Gemini AI  ← FALLBACK
    ↓ (if Gemini fails)
TIER 3: TypeScript NL search  ← SAFETY NET
```

## Requirements

- Python 3.10+
- ~90MB disk for the embedding model (downloaded automatically on first run)
- ~500MB RAM for embedding model

## Quick Start

```powershell
# From the search-service/ directory
.\setup.ps1
```

This will:
1. Create a `.venv` virtual environment
2. Install all dependencies
3. Copy `.env.example` → `.env`
4. Download the embedding model and seed ChromaDB

Then start the service:

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

## Manual Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Configure env
copy .env.example .env
# Edit .env if needed

# Seed ChromaDB (downloads model on first run — ~2 min)
python scripts/seed_chroma.py --source catalog --wipe

# Start server
python -m uvicorn main:app --reload --port 8000
```

## API Endpoints

### `POST /search`

Main search endpoint.

```json
// Request
{
  "query": "warm outfit for dinner",
  "size_preferences": ["M"],
  "limit": 8,
  "viewed_categories": [],
  "purchased_categories": []
}

// Response
{
  "query": "warm outfit for dinner",
  "detected_sizes": ["M"],
  "detected_colors": [],
  "detected_occasion": "evening",
  "results": [
    {
      "product_id": "eclat_coat_02",
      "score": 0.8741,
      "semantic_score": 0.7823,
      "reasons": ["strong-semantic-match", "size-match", "in-stock"]
    }
  ],
  "confidence": 0.7823,
  "source": "vector",
  "interpreted_as": "Showing evening pieces with elegant aesthetic · Sizes: M"
}
```

### `POST /embed-products`

Index a batch of products into ChromaDB.

```json
{
  "secret": "eclat_search_secret_2026",
  "products": [ ... ]
}
```

### `POST /reindex`

Full reindex — wipes ChromaDB and re-embeds from source.

```json
{
  "secret": "eclat_search_secret_2026",
  "source": "catalog"   // or "supabase"
}
```

### `GET /health`

```json
{ "status": "ok", "indexed_products": 16, "model": "all-MiniLM-L6-v2" }
```

## Re-ranking Weights

| Signal             | Weight |
|--------------------|--------|
| Semantic similarity| 0.45   |
| Size match         | 0.25   |
| In-stock boost     | 0.15   |
| User preference    | 0.10   |
| Trending           | 0.05   |

Tune in `app/ranker.py`.

## Disabling Vector Search

Set `VECTOR_SEARCH_URL=` (empty) in `storefront/.env.local`.  
The Next.js route will fall back to Gemini → TypeScript automatically.

## Adding New Products

After adding products to `catalog.ts`:

1. Update `scripts/export_catalog.py` to mirror the new entries
2. Run `python scripts/seed_chroma.py --source catalog --wipe`

Or call `POST /reindex` with the admin secret.
