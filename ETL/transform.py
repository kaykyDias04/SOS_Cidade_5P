import pandas as pd


class Transform:
    VALORES_AUSENTES: list[str] = [
        "",
        "-",
        "N/A",
        "n/a",
        "NA",
        "...",
        "null",
        "None",
        "nan",
        "NaN",
    ]

    def __init__(self) -> None:
        self.colunas_renomeadas: dict[str, str] = {
            "temperature_2m_max": "temp_max_c",
            "temperature_2m_min": "temp_min_c",
            "temperature_2m_mean": "temp_media_c",
            "precipitation_sum": "precipitacao_mm",
            "wind_speed_10m_max": "vento_max_kmh",
        }

    @staticmethod
    def selecionar_carga_mais_recente(data: dict | list[dict]) -> dict:
        """Seleciona apenas o documento com a data_extracao mais recente.

        Args:
            data: um único documento bruto ou uma lista de documentos brutos
                vindos da camada bronze (MongoDB).

        Returns:
            O documento bruto da carga mais recente.

        Raises:
            ValueError: se a lista de documentos estiver vazia.
        """
        if isinstance(data, dict):
            return data

        if not data:
            raise ValueError("Lista de documentos da camada bronze está vazia.")

        com_data = [doc for doc in data if doc.get("data_extracao")]
        if com_data:
            return max(com_data, key=lambda doc: str(doc["data_extracao"]))
        return data[-1]

    def transform_clima(self, data: dict | list[dict]) -> pd.DataFrame:
        """Transforma a carga bruta mais recente da Open-Meteo em DataFrame diário.

        - Se receber uma lista de cargas do MongoDB, filtra apenas a carga
          com maior `data_extracao`.
        - Converte todas as listas paralelas de `daily` em linhas do DataFrame
          (sem índices fixos como `[0]` que descartem registros).
        - Trata representações de dado ausente (`null`/None, vazio, "-",
          "N/A", "..." etc.) mantendo-os como nulos (`NaN`/`None` -> `NULL`
          no banco relacional), nunca convertendo para zero (`0`).
        - Compara a quantidade de registros da camada bronze com o total
          transformado para garantir que tudo o que a fonte entregou chegue
          ao destino.

        Args:
            data: documento bruto (ou lista de documentos) retornado por
                Extract, contendo a chave "daily".

        Returns:
            DataFrame com uma linha por dia, pronto para carga no NeonDB.

        Raises:
            ValueError: se "daily" estiver ausente, sem "time", ou se houver
                divergência de quantidade de registros.
        """
        documento = self.selecionar_carga_mais_recente(data)
        daily = documento.get("daily", {})

        if not daily or "time" not in daily:
            raise ValueError(
                "Dado bruto inválido: chave 'daily' ausente ou sem campo 'time'."
            )

        qtd_bronze = len(daily["time"])

        df = pd.DataFrame(daily)

        # Substitui marcadores textuais de dado ausente por None (nunca por zero)
        df = df.replace(self.VALORES_AUSENTES, None)

        df["time"] = pd.to_datetime(df["time"], errors="coerce").dt.date
        df = df.rename(columns={"time": "data"})

        df = df.rename(
            columns={k: v for k, v in self.colunas_renomeadas.items() if k in df.columns}
        )

        # Garante tipagem numérica preservando ausentes como NaN/NULL (sem fillna(0))
        for col_numerica in self.colunas_renomeadas.values():
            if col_numerica in df.columns:
                df[col_numerica] = pd.to_numeric(df[col_numerica], errors="coerce")

        df["cidade"] = documento.get("_cidade", "recife")
        df["data_extracao"] = documento.get("data_extracao")

        df = df.reset_index(drop=True)

        qtd_final = len(df)
        if qtd_bronze != qtd_final:
            raise ValueError(
                f"Perda de registros detectada na transformação: "
                f"camada bronze tinha {qtd_bronze} itens, mas o DataFrame final tem {qtd_final}."
            )

        nulos_por_coluna = (
            df[[c for c in self.colunas_renomeadas.values() if c in df.columns]]
            .isna()
            .sum()
            .to_dict()
        )
        print(
            f"Dados transformados com sucesso! "
            f"Conferência Bronze -> Transformado: {qtd_bronze} -> {qtd_final} registros diários "
            f"(data_extracao={documento.get('data_extracao')}, nulos={nulos_por_coluna})."
        )
        return df
