import os
from pathlib import Path

from dotenv import load_dotenv

_ETL_DIR = Path(__file__).resolve().parent
_ROOT_DIR = _ETL_DIR.parent

load_dotenv(_ETL_DIR / ".env")
load_dotenv(_ROOT_DIR / ".env")
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

_raw_neon_url = os.getenv("NEON_DATABASE_URL")
if _raw_neon_url and _raw_neon_url.startswith("postgres://"):
    NEON_DATABASE_URL = _raw_neon_url.replace("postgres://", "postgresql://", 1)
else:
    NEON_DATABASE_URL = _raw_neon_url

MONGO_DB = os.getenv("MONGO_DB", "OpenMeteo")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "ClimaBrasil")
NEON_TABLE = os.getenv("NEON_TABLE", "clima_historico")
