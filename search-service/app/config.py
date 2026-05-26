"""
Configuration — loads from .env
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Auth
    vector_search_secret: str = "eclat_search_secret_2026"

    # Supabase (for reindex route)
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # ChromaDB
    chroma_data_path: str = "./chroma_data"
    chroma_collection: str = "eclat_products"

    # Embedding model
    embedding_model: str = "all-MiniLM-L6-v2"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Search quality
    confidence_threshold: float = 0.40

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
