"""
main.py
FastAPI application entry point with CORS and health endpoint.
Added in: Step 1
"""
# Step 1: Implementation added in step-01-scaffold.md
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Survival RAG AI Service", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"status": "ok", "step": 1, "message": "Scaffold only"}