FROM python:3.11-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && playwright install --with-deps chromium
COPY . .
RUN mkdir -p /artifacts /app/downloads && useradd --create-home worker && chown -R worker:worker /app /artifacts /ms-playwright
USER worker
CMD ["python", "worker.py"]
