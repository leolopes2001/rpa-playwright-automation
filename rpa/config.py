from dotenv import load_dotenv
import os

load_dotenv()

TARGET_URL = os.getenv("TARGET_URL", "https://exemplo.com")
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"
TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "30000"))
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./downloads")
ARTIFACTS_DIR = os.getenv("ARTIFACTS_DIR", "./artifacts")
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
WORKER_ID = os.getenv("WORKER_ID", "rpa-worker-1")
WORKER_CONCURRENCY = int(os.getenv("WORKER_CONCURRENCY", "2"))
MAX_ATTEMPTS = int(os.getenv("MAX_ATTEMPTS", "3"))
JOB_TIMEOUT_SECONDS = int(os.getenv("JOB_TIMEOUT_SECONDS", "120"))
