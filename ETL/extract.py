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
            "timezone": "America/Recife",
        }

        response = requests.get(self.base_url, params=params, timeout=30)
        response.raise_for_status()

        payload = response.json()
        payload["_cidade"] = self.CIDADE
        payload["_data_inicio"] = data_inicio
        payload["_data_fim"] = data_fim

        print(
            f"Dados extraídos com sucesso da Open-Meteo "
            f"(Recife, {data_inicio} -> {data_fim})!"
        )
        return payload

    def extract_collection_from_mongo(self, db_name: str, collection_name: str) -> list[dict]:
        collection = self.client[db_name][collection_name]
        documentos = list(collection.find())

        print(f"Dados lidos com sucesso da coleção '{collection_name}'!")
        return documentos
