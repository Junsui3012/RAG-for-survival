"""
config.py
Central configuration using pydantic-settings. Every value reads from environment variables automatically.
Added in: Step 1
"""
# Step 1: Implementation added in step-01-scaffold.md
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # LLM provider selection
    llm_provider: str = Field("gemini", description="gemini | ollama | anthropic")
    google_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"
    anthropic_api_key: str = ""
    # Paths
    chroma_persist_dir: str = "/app/chroma_db"
    pdf_path: str = "/app/data/pdfs/survival.pdf"
    extracted_images_dir: str = "/app/data/extracted_images"
    # Embedding model (local, free)
    embedding_model: str = "all-MiniLM-L6-v2"
    chroma_collection: str = "survival_chunks"
    # RAG parameters
    chunk_size: int = 800
    chunk_overlap: int = 100
    retrieval_top_k: int = 6
    # Rate limits
    chat_rate_per_minute: int = 12
    chat_rate_per_day: int = 100

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()