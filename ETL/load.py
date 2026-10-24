import sqlite3

import pandas as pd
from pymongo import MongoClient
from sqlalchemy import create_engine
from pymongo.server_api import ServerApi

try:
    from ETL import config
except ModuleNotFoundError:
    import config


class Load:
    def __init__(self) -> None:
        self.mongo_uri = config.MONGODB_URI
        self.neon_url = config.NEON_DATABASE_URL
        self.client = MongoClient(self.mongo_uri, server_api=ServerApi("1"))

    def close(self) -> None:
        """Encerra a conexão com o MongoDB."""
        self.client.close()

    def load_mongo(self, data: dict, db_name: str, collection_name: str) -> None:
        """Insere o resultado bruto da API em uma coleção do MongoDB.

        Args:
            data: documento bruto (dicionário) a ser inserido.
            db_name: nome do banco de dados.
            collection_name: nome da coleção de destino.
        """
        collection = self.client[db_name][collection_name]
        collection.insert_one(data)

        print(f"Dados inseridos com sucesso na coleção '{collection_name}'!")

    def load_neon(
        self,
        df: pd.DataFrame,
        nome_tabela: str = "clima_historico",
    ) -> None:
        """Salva o DataFrame transformado em uma tabela do NeonDB (PostgreSQL).

        A conexão usa a variável NEON_DATABASE_URL do .env. A tabela é
        recriada a cada execução (if_exists="replace").

        Args:
            df: DataFrame já transformado.
            nome_tabela: nome da tabela de destino no NeonDB.

        Raises:
            ValueError: se NEON_DATABASE_URL não estiver definida.
        """
        if not self.neon_url:
            raise ValueError("Variável NEON_DATABASE_URL não definida no .env.")

        engine = create_engine(self.neon_url)
        try:
            df.to_sql(nome_tabela, engine, if_exists="replace", index=False)
        finally:
            engine.dispose()

        print(f"Dados salvos com sucesso na tabela '{nome_tabela}' do NeonDB!")

    def load_sqlite(
        self,
        df: pd.DataFrame,
        nome_banco: str = "clima.db",
        nome_tabela: str = "clima_historico",
    ) -> None:
        """Salva o DataFrame transformado em uma tabela SQLite.

        A tabela é recriada a cada execução (if_exists="replace").

        Args:
            df: DataFrame já transformado.
            nome_banco: caminho do arquivo SQLite.
            nome_tabela: nome da tabela de destino.
        """
        conn =sqlite3.connect(nome_banco)
        df.to_sql(nome_tabela, conn, if_exists="replace", index=False)
        conn.close()

        print(
            f"Dados salvos com sucesso na tabela '{nome_tabela}' "
            f"do banco '{nome_banco}'!"
        )
