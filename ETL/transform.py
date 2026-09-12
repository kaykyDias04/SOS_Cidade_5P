import pandas as pd


class Transform:
    def __init__(self) -> None:
        pass

    def transform_clima(self, data: dict) -> pd.DataFrame:
        daily = data.get("daily", {})

        if not daily or "time" not in daily:
            raise ValueError(
                "Dado bruto inválido: chave 'daily' ausente ou sem campo 'time'."
            )

        df = pd.DataFrame(daily)

        df["time"] = pd.to_datetime(df["time"]).dt.date
        df = df.rename(columns={"time": "data"})

        renomear = {
            "temperature_2m_max": "temp_max_c",
            "temperature_2m_min": "temp_min_c",
            "temperature_2m_mean": "temp_media_c",
            "precipitation_sum": "precipitacao_mm",
            "wind_speed_10m_max": "vento_max_kmh",
            "uv_index_max": "uv_index_max",
        }
        df = df.rename(columns={k: v for k, v in renomear.items() if k in df.columns})

        df["cidade"] = data.get("_cidade", "")

        df = df.reset_index(drop=True)

        print(f"Dados transformados com sucesso! ({len(df)} registros diários)")
        return df
