"""
ChromaDB client — persistent vector store for ÉCLAT products.

Collection stores:
  - embeddings: float vectors (384-dim for all-MiniLM-L6-v2)
  - documents: rich searchable text for each product
  - metadatas: id, category, sizes, stock, tags, color, aesthetic, gender, price
"""

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings


class ChromaClient:
    def __init__(self):
        self._client = chromadb.PersistentClient(
            path=settings.chroma_data_path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._collection = self._client.get_or_create_collection(
            name=settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )

    @property
    def collection(self):
        return self._collection

    def count(self) -> int:
        return self._collection.count()

    def upsert_products(self, products: list[dict], embeddings: list[list[float]]):
        """
        Upsert products into ChromaDB.

        products: list of dicts with keys:
          id, searchable_text, category, sizes, stock, tags, color, aesthetic, gender, price
        embeddings: parallel list of float vectors
        """
        ids = [p["id"] for p in products]
        documents = [p["searchable_text"] for p in products]
        metadatas = [
            {
                "id": p["id"],
                "name": p.get("name", ""),
                "category": p.get("category", ""),
                "sizes": ",".join(p.get("sizes", [])),
                "stock": int(p.get("stock", 0)),
                "tags": ",".join(p.get("tags", [])),
                "color": p.get("color", ""),
                "aesthetic": p.get("aesthetic", ""),
                "gender": p.get("gender", "unisex"),
                "price": float(p.get("price", 0)),
                "rating": float(p.get("rating", 0)),
                "review_count": int(p.get("review_count", 0)),
            }
            for p in products
        ]

        self._collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

    def query(
        self,
        embedding: list[float],
        n_results: int = 15,
        where: dict | None = None,
    ) -> dict:
        """
        Search ChromaDB. Returns raw chromadb result dict:
          { ids, distances, metadatas, documents }
        """
        kwargs: dict = {
            "query_embeddings": [embedding],
            "n_results": min(n_results, self.count() or 1),
            "include": ["distances", "metadatas", "documents"],
        }
        if where:
            kwargs["where"] = where

        return self._collection.query(**kwargs)

    def delete_all(self):
        """Wipe collection — used before full reindex."""
        self._client.delete_collection(settings.chroma_collection)
        self._collection = self._client.get_or_create_collection(
            name=settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )


# Singleton
chroma = ChromaClient()
