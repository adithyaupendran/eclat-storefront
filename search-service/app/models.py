"""
Pydantic request / response models
"""

from typing import Optional
from pydantic import BaseModel, Field


# ── Inbound ───────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    size_preferences: list[str] = Field(default_factory=list)
    user_id: Optional[str] = None
    limit: int = Field(default=8, ge=1, le=20)
    # Optional history for personalization
    viewed_categories: list[str] = Field(default_factory=list)
    purchased_categories: list[str] = Field(default_factory=list)


class EmbedRequest(BaseModel):
    products: list[dict]
    secret: str


class ReindexRequest(BaseModel):
    secret: str
    source: str = "supabase"   # "supabase" | "catalog"


# ── Outbound ──────────────────────────────────────────────────────────────────

class SearchResultItem(BaseModel):
    product_id: str
    score: float
    semantic_score: float
    reasons: list[str]          # ["semantic", "size-match", "in-stock", "trending"]


class SearchResponse(BaseModel):
    query: str
    detected_sizes: list[str]
    detected_colors: list[str]
    detected_occasion: Optional[str]
    results: list[SearchResultItem]
    confidence: float           # highest semantic score in results (0-1)
    source: str = "vector"      # "vector" | "fallback"
    interpreted_as: str


class EmbedResponse(BaseModel):
    indexed: int
    collection: str


class ReindexResponse(BaseModel):
    indexed: int
    source: str
    collection: str
