from dotenv import load_dotenv
import os

load_dotenv()

TARGET_URL = os.getenv("TARGET_URL", "https://exemplo.com")
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"
TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "30000"))
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./downloads")
