dev: docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
prod: docker compose up --build
down: docker compose down -v
logs: docker compose logs -f
ingest: docker compose exec ai-service python -c "from rag.pdf_ingestor import run_ingest; run_ingest()"
shell-ai: docker compose exec ai-service bash
shell-db: docker compose exec mongo mongosh survivalrag