import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")
