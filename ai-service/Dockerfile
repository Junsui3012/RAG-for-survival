# ══════════════════════════════════════════════════════════════════════════════
#  Stage 1 — base
#  Shared by both the production ("prod") and development (compose override)
#  targets. Building the heavy Python deps once and reusing them in both
#  targets saves significant build time.
# ══════════════════════════════════════════════════════════════════════════════
FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files (they serve no purpose inside a
# container — the interpreter caches them in memory on first import anyway,
# and they add noise to the image layers).
ENV PYTHONDONTWRITEBYTECODE=1

# Force stdout/stderr to be unbuffered so log lines appear in `docker logs`
# immediately rather than being held in a buffer until a flush threshold.
ENV PYTHONUNBUFFERED=1

# Disable pip's version-check noise and the local cache that would bloat
# image layers without benefiting a one-shot install.
ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# ── System libraries ──────────────────────────────────────────────────────────
# WHY these three packages?
#
# libgl1-mesa-glx — OpenGL shared library.
#   PyMuPDF (fitz) and OpenCV both link against libGL at import time.
#   Without it, `import fitz` raises: "libGL.so.1: cannot open shared object".
#
# libglib2.0-0 — GLib runtime (GObject, GIO, GThread).
#   OpenCV's highgui module and PIL's TIFF codec depend on GLib's threading
#   primitives. Absent on slim images; must be installed explicitly.
#
# libgomp1 — GNU OpenMP runtime.
#   PyTorch and sentence-transformers use OpenMP for CPU parallelism
#   (matrix multiply, tokenisation). Without it, import succeeds but
#   performance degrades silently and some ops raise "libgomp not found".
#
# wget — used by the HEALTHCHECK in the prod stage (slim has no curl/wget).
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgl1-mesa-glx \
        libglib2.0-0 \
        libgomp1 \
        wget \
    && rm -rf /var/lib/apt/lists/*
# `rm -rf /var/lib/apt/lists/*` deletes the package index cache so it
# doesn't persist in the image layer (~50 MB saving).

# ── PyTorch CPU-only — installed as its own RUN layer ─────────────────────────
# WHY a separate RUN?
#   torch==2.4.0+cpu is ≈ 800 MB. Isolating it in its own layer means
#   rebuilds caused by changes to requirements.txt do NOT re-download torch —
#   the torch layer is pulled from cache as long as this RUN is unchanged.
#
# WHY +cpu wheels and --index-url?
#   PyPI hosts only the CUDA-enabled torch builds (≈ 2.5 GB each).
#   The +cpu suffix selects CPU-only wheels hosted on PyTorch's own index.
#   Without --index-url pip falls back to PyPI and either fails (no +cpu build
#   there) or installs a multi-GB CUDA build, blowing past the 3 GB target.
RUN pip install \
        torch==2.4.0+cpu \
        torchvision==0.19.0+cpu \
        --index-url https://download.pytorch.org/whl/cpu

# ── Remaining Python dependencies ─────────────────────────────────────────────
COPY requirements.txt .

# Strip the torch/torchvision lines from requirements.txt before passing it
# to pip — they are already installed above from the correct index.
# If pip sees them again it will try PyPI (wrong index) and either error or
# install the CUDA build on top of the CPU one.
RUN grep -Ev "^torch(vision)?[>=!]" requirements.txt > /tmp/req_notorch.txt \
    && pip install -r /tmp/req_notorch.txt \
    && rm /tmp/req_notorch.txt

# ── Non-root user ─────────────────────────────────────────────────────────────
# -m creates a home directory so tools that write to ~ (HuggingFace cache,
# sentence-transformers model cache) don't fail with "permission denied".
RUN useradd -m -u 1001 pyuser

COPY . .

# Set ownership AFTER all COPY instructions are complete.
RUN chown -R pyuser:pyuser /app

USER pyuser


# ══════════════════════════════════════════════════════════════════════════════
#  Stage 2 — prod
#  Thin layer on top of base that adds the runtime config.
#  The dev override in docker-compose.dev.yml targets "base" directly and adds
#  --reload and bind-mounts, so base must be self-sufficient.
# ══════════════════════════════════════════════════════════════════════════════
FROM base AS prod

EXPOSE 8000

# start_period=60s: sentence-transformers downloads model weights on first
# start if not cached; ChromaDB initialises its HNSW index. The container
# is healthy only after all of this is complete, so a 60 s grace period
# prevents Compose from cycling the backend before ai-service is ready.
HEALTHCHECK --interval=20s --timeout=10s --retries=3 --start-period=60s \
    CMD wget -qO- http://localhost:8000/health || exit 1

# WHY --workers 1?
# PyTorch models are loaded into process memory at startup. With multiple
# workers, each forked worker would inherit the parent's file descriptors
# but NOT its Python objects — each would need to reload the model from disk,
# multiplying memory usage N×.
# More critically, some torch operations (especially those using shared CUDA
# contexts or CPU thread pools) are NOT fork-safe. Forking after import torch
# can cause silent deadlocks or incorrect results.
# 1 worker + async FastAPI is correct for CPU inference workloads; concurrency
# is achieved via Python's asyncio, not via OS-level forking.
CMD ["uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1"]