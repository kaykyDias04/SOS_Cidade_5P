import pandas as pd


class Transform:
    def __init__(self) -> None:
        self.colunas_renomeadas: dict[str, str] = {
            "temperature_2m_max": "temp_max_c",
            "temperature_2m_min": "temp_min_c",
            "temperature_2m_mean": "temp_media_c",
            "precipitation_sum": "precipitacao_mm",
            "wind_speed_10m_max": "vento_max_kmh",
        }

    def transform_clima(self, data: dict) -> pd.DataFrame:
        """Transforma o JSON bruto da Open-Meteo em um DataFrame diário.

        Converte o campo "time" para data (coluna "data"), renomeia as
        variáveis para nomes em português com unidade e adiciona a coluna
        "cidade".

        Args:
            data: documento bruto retornado por Extract.clima_historico
                (ou lido do MongoDB), contendo a chave "daily".

        Returns:
            DataFrame com uma linha por dia, pronto para carga.

        Raises:
            ValueError: se "daily" estiver ausente ou sem o campo "time".
        """
        daily = data.get("daily", {})

        if not daily or "time" not in daily:
            raise ValueError(
                "Dado bruto inválido: chave 'daily' ausente ou sem campo 'time'."
            )

        df = pd.DataFrame(daily)

        df["time"] = pd.to_datetime(df["time"]).dt.date
        df = df.rename(columns={"time": "data"})

        df = df.rename(columns=self.colunas_renomeadas)

        df["cidade"] = data.get("_cidade", "")

        df = df.reset_index(drop=True)

        print(f"Dados transformados com sucesso! ({len(df)} registros diários)")
        return df
