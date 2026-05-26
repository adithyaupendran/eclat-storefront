FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Pre-download the sentence-transformers model at build time
# (cached in Docker image — no cold-start download)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Seed ChromaDB from the catalog JSON at build time
# (data baked into image — survives restarts, resets on redeploy)
RUN python scripts/seed_chroma.py --source catalog --wipe

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
