from datetime import datetime, timezone
import sqlite3

import pandas as pd
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from sqlalchemy import create_engine, text

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

    def load_mongo(
        self,
        data: dict,
        db_name: str = config.MONGO_DB,
        collection_name: str = config.MONGO_COLLECTION,
    ) -> None:
        """Insere o resultado bruto da API em uma coleção do MongoDB sem apagar cargas anteriores.

        Garante que o documento bruto possua o campo `data_extracao`.

        Args:
            data: documento bruto (dicionário) a ser inserido.
            db_name: nome do banco de dados.
            collection_name: nome da coleção de destino.
        """
        if not data.get("data_extracao"):
            data["data_extracao"] = datetime.now(timezone.utc).isoformat()

        collection = self.client[db_name][collection_name]
        # Usa cópia rasa para evitar que o ObjectId mutável afete referências externas
        collection.insert_one(dict(data))

        print(
            f"Dados inseridos com sucesso na coleção '{collection_name}' "
            f"(data_extracao={data['data_extracao']})!"
        )

    def load_neon(
        self,
        df: pd.DataFrame,
        nome_tabela: str = config.NEON_TABLE,
    ) -> int:
        """Salva o DataFrame transformado em uma tabela do NeonDB (PostgreSQL).

        A conexão usa a variável NEON_DATABASE_URL de `config.py`. Ao final,
        confere a quantidade de registros gravados na tabela final em relação
        ao DataFrame recebido.

        Args:
            df: DataFrame já transformado.
            nome_tabela: nome da tabela de destino no NeonDB.

        Returns:
            Quantidade de registros confirmados na tabela final do NeonDB.

        Raises:
            ValueError: se NEON_DATABASE_URL não estiver definida ou se a
                contagem na tabela final divergir do DataFrame.
        """
        if not self.neon_url:
            raise ValueError("Variável NEON_DATABASE_URL não definida no .env.")

        engine = create_engine(self.neon_url)
        try:
            df.to_sql(nome_tabela, engine, if_exists="replace", index=False)
            with engine.connect() as conn:
                total_tabela = int(
                    conn.execute(text(f'SELECT COUNT(*) FROM "{nome_tabela}"')).scalar_one()
                )
        finally:
            engine.dispose()

        if total_tabela != len(df):
            raise ValueError(
                f"Divergência na carga do NeonDB: DataFrame tinha {len(df)} linhas, "
                f"mas a tabela '{nome_tabela}' ficou com {total_tabela}."
            )

        print(
            f"Dados salvos com sucesso na tabela '{nome_tabela}' do NeonDB! "
            f"(Conferência final: {len(df)} enviados -> {total_tabela} gravados no destino)"
        )
        return total_tabela

    def load_sqlite(
        self,
        df: pd.DataFrame,
        nome_banco: str = "clima.db",
        nome_tabela: str = config.NEON_TABLE,
    ) -> None:
        """Salva o DataFrame transformado em uma tabela SQLite.

        A tabela é recriada a cada execução (if_exists="replace").

        Args:
            df: DataFrame já transformado.
            nome_banco: caminho do arquivo SQLite.
            nome_tabela: nome da tabela de destino.
        """
        conn = sqlite3.connect(nome_banco)
        df.to_sql(nome_tabela, conn, if_exists="replace", index=False)
        conn.close()

        print(
            f"Dados salvos com sucesso na tabela '{nome_tabela}' "
            f"do banco '{nome_banco}'!"
        )
