"""
ÉCLAT Vector Search Service
FastAPI microservice — main entrypoint
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.embedder import embedder
from app.chroma_client import chroma
from app.routes import search, embed, reindex


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: warm up the embedding model and ChromaDB connection."""
    print("⚡ ÉCLAT Search Service — warming up...")
    embedder.warmup()
    print(f"✅ Embedder ready: {settings.embedding_model}")
    count = chroma.count()
    print(f"✅ ChromaDB ready — {count} products indexed")
    yield
    print("🛑 ÉCLAT Search Service — shutting down")


app = FastAPI(
    title="ÉCLAT Vector Search",
    description="Hybrid semantic fashion search — embeddings + ChromaDB + re-ranking",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(embed.router)
app.include_router(reindex.router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "indexed_products": chroma.count(),
        "model": settings.embedding_model,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
