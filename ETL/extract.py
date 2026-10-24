import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv()


class Extract:
    LATITUDE: float = -8.0476
    LONGITUDE: float = -34.8770
    CIDADE: str = "recife"

    VARIAVEIS_DIARIAS: dict[str, str] = {
        "temperature_2m_max": "Temperatura máxima a 2 m (°C)",
        "temperature_2m_min": "Temperatura mínima a 2 m (°C)",
        "temperature_2m_mean": "Temperatura média a 2 m (°C)",
        "precipitation_sum": "Precipitação acumulada (mm)",
        "wind_speed_10m_max": "Velocidade máxima do vento a 10 m (km/h)",
    }

    def __init__(self) -> None:
        self.base_url = "https://archive-api.open-meteo.com/v1/archive"
        self.timezone = "America/Recife"
        self.timeout = 30
        self.mongo_uri = os.getenv("MONGODB_URI")
        self.client = MongoClient(self.mongo_uri, server_api=ServerApi("1"))

    def close(self) -> None:
        """Encerra a conexão com o MongoDB."""
        self.client.close()

    def clima_historico(
        self,
        data_inicio: str,
        data_fim: str,
        variaveis: list[str] | None = None,
    ) -> dict:
        """Busca na Open-Meteo o clima diário histórico de Recife.

        Args:
            data_inicio: data inicial do período, no formato "YYYY-MM-DD".
            data_fim: data final do período, no formato "YYYY-MM-DD".
            variaveis: chaves de VARIAVEIS_DIARIAS a consultar. Se None,
                todas são consultadas.

        Returns:
            O JSON bruto da API, acrescido das chaves "_cidade",
            "_data_inicio" e "_data_fim".

        Raises:
            ValueError: se alguma variável não existir em VARIAVEIS_DIARIAS.
            requests.HTTPError: se a API responder com erro.
        """
        if variaveis is None:
            variaveis = list(self.VARIAVEIS_DIARIAS.keys())

        variaveis_invalidas = [v for v in variaveis if v not in self.VARIAVEIS_DIARIAS]
        if variaveis_invalidas:
            raise ValueError(
                f"Variável(is) inválida(s): {variaveis_invalidas}. "
                f"Opções disponíveis: {list(self.VARIAVEIS_DIARIAS.keys())}"
            )

        params = {
            "latitude": self.LATITUDE,
            "longitude": self.LONGITUDE,
            "start_date": data_inicio,
            "end_date": data_fim,
            "daily": ",".join(variaveis),
            "timezone": self.timezone,
        }

        response = requests.get(self.base_url, params=params, timeout=self.timeout)
        response.raise_for_status()

        payload = response.json()
        payload["_cidade"] = self.CIDADE
        payload["_data_inicio"] = data_inicio
        payload["_data_fim"] = data_fim

        print(
            f"Dados extraídos com sucesso da Open-Meteo "
            f"({self.CIDADE}, {data_inicio} -> {data_fim})!"
        )
        return payload

    def extract_collection_from_mongo(self, db_name: str, collection_name: str) -> list[dict]:
        """Lê todos os documentos de uma coleção do MongoDB.

        Args:
            db_name: nome do banco de dados.
            collection_name: nome da coleção a ser lida.

        Returns:
            Lista de documentos (dicionários) da coleção.
        """
        collection = self.client[db_name][collection_name]
        documentos = list(collection.find())

        print(f"Dados lidos com sucesso da coleção '{collection_name}'!")
        return documentos
