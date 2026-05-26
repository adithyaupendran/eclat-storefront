"""
Embedding wrapper — loads all-MiniLM-L6-v2 once, caches result in memory.

The model is ~90MB and takes ~2s to load. After warmup it encodes
a single query in ~5ms on CPU.
"""

import threading
from typing import Optional

from sentence_transformers import SentenceTransformer

from app.config import settings


class Embedder:
    _instance: Optional["Embedder"] = None
    _lock = threading.Lock()

    def __init__(self):
        self._model: Optional[SentenceTransformer] = None

    @classmethod
    def get(cls) -> "Embedder":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def warmup(self):
        """Load model into memory. Called once at startup."""
        if self._model is None:
            print(f"  Loading embedding model: {settings.embedding_model}")
            self._model = SentenceTransformer(settings.embedding_model)
            # Warm up with a dummy call so first real query isn't slow
            self._model.encode(["warmup"], show_progress_bar=False)

    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            self.warmup()
        return self._model

    def embed(self, text: str) -> list[float]:
        """Embed a single text string. Returns a float list."""
        vec = self.model.encode([text], show_progress_bar=False, normalize_embeddings=True)
        return vec[0].tolist()

    def embed_batch(self, texts: list[str], batch_size: int = 64) -> list[list[float]]:
        """Embed multiple texts efficiently. Used during indexing."""
        vecs = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            normalize_embeddings=True,
        )
        return [v.tolist() for v in vecs]


# Singleton instance
embedder = Embedder.get()
