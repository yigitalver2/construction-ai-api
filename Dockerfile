# Backend (FastAPI + SAM3) image for a Hugging Face Docker Space.
# Boots with the mock detector so the Space works immediately; flip
# DETECTOR_BACKEND=sam3 (+ add the LoRA checkpoint + HF_TOKEN) to go live.
FROM python:3.11-slim

# System libraries needed by Pillow / torch at runtime, and git to fetch SAM3.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git libglib2.0-0 libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces run the container as uid 1000.
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH
WORKDIR /app

# SAM3 inference code. The trained LoRA adapter itself ships inside this repo
# at app/adapter/ (small, ~8MB) and is loaded on top of the facebook/sam3 base.
RUN git clone --depth 1 https://github.com/AI-Object-Dedection/sam3.git /app/SAM3

# Python dependencies.
COPY --chown=user requirements.txt requirements-sam3.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir torch torchvision \
    && pip install --no-cache-dir -r requirements-sam3.txt

# Backend application code.
COPY --chown=user . /app

# Defaults. Override these in the Space "Settings -> Variables and secrets".
ENV DETECTOR_BACKEND=mock \
    DATABASE_URL=sqlite:///./app.db \
    UPLOAD_DIR=/app/uploads \
    SAM3_REPO_PATH=/app/SAM3 \
    SAM3_MODEL_NAME=facebook/sam3 \
    DEBUG=false

EXPOSE 7860
# Apply DB migrations (creates tables on a fresh DB, adds new columns on an
# existing one) before starting the server, so schema is always up to date.
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 7860"]
