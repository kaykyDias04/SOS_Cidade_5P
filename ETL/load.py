import os
from pathlib import Path
import sqlite3

import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv()


class Load:
    def __init__(self) -> None:
        self.mongo_uri = os.getenv("MONGODB_URI")
        self.client = MongoClient(self.mongo_uri, server_api=ServerApi("1"))

    def close(self) -> None:
        """Encerra a conexão com o MongoDB."""
        self.client.close()

    def load_mongo(self, data: dict, db_name: str, collection_name: str) -> None:
        collection = self.client[db_name][collection_name]
        collection.insert_one(data)

        print(f"Dados inseridos com sucesso na coleção '{collection_name}'!")

    def load_sqlite(
        self,
        df: pd.DataFrame,
        nome_banco: str = "clima.db",
        nome_tabela: str = "clima_historico",
    ) -> None:
        conn = sqlite3.connect(nome_banco)
        df.to_sql(nome_tabela, conn, if_exists="replace", index=False)
        conn.close()

        print(
            f"Dados salvos com sucesso na tabela '{nome_tabela}' "
            f"do banco '{nome_banco}'!"
        )
