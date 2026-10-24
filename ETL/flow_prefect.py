import sys
from pathlib import Path

import pandas as pd
from prefect import flow, get_run_logger, task

etl_dir = Path(__file__).resolve().parent
if str(etl_dir) not in sys.path:
    sys.path.insert(0, str(etl_dir))
if str(etl_dir.parent) not in sys.path:
    sys.path.insert(0, str(etl_dir.parent))

try:
    from ETL.extract import Extract
    from ETL.load import Load
    from ETL.transform import Transform
except ModuleNotFoundError:
    from extract import Extract
    from load import Load
    from transform import Transform


DATA_INICIO = "2024-01-01"
DATA_FIM = "2024-01-31"
MONGO_DB = "OpenMeteo"
MONGO_COLECAO = "ClimaBrasil"


@task(name="extrair_api_open_meteo", retries=2, retry_delay_seconds=10)
def extrair_api(data_inicio: str, data_fim: str) -> dict:
    """Busca o clima diário histórico de Recife na API Open-Meteo.

    Args:
        data_inicio: data inicial do período, no formato "YYYY-MM-DD".
        data_fim: data final do período, no formato "YYYY-MM-DD".

    Returns:
        O JSON bruto retornado pela API.
    """
    ext = Extract()
    try:
        data = ext.clima_historico(data_inicio=data_inicio, data_fim=data_fim)
    finally:
        ext.close()
    get_run_logger().info("API Open-Meteo: dados extraídos (%s -> %s).", data_inicio, data_fim)
    return data


@task(name="carregar_mongodb_atlas")
def carregar_mongo(data: dict, db_name: str, collection_name: str) -> None:
    """Grava o JSON bruto da API em uma coleção do MongoDB Atlas.

    Args:
        data: documento bruto retornado pela API.
        db_name: nome do banco de dados.
        collection_name: nome da coleção de destino.
    """
    ld = Load()
    try:
        ld.load_mongo(data, db_name, collection_name)
    finally:
        ld.close()
    get_run_logger().info("MongoDB Atlas: documento inserido em '%s'.", collection_name)


@task(name="extrair_mongodb_atlas")
def extrair_mongo(db_name: str, collection_name: str) -> dict:
    """Relê do MongoDB Atlas o documento bruto mais recente da coleção.

    Args:
        db_name: nome do banco de dados.
        collection_name: nome da coleção a ser lida.

    Returns:
        O último documento da coleção.
    """
    ext = Extract()
    try:
        documentos = ext.extract_collection_from_mongo(db_name, collection_name)
    finally:
        ext.close()
    get_run_logger().info("MongoDB Atlas: %d documento(s) lido(s).", len(documentos))
    return documentos[-1]


@task(name="transformar_clima")
def transformar(documento: dict) -> pd.DataFrame:
    """Transforma o documento bruto em um DataFrame diário.

    Args:
        documento: documento bruto lido do MongoDB.

    Returns:
        DataFrame com uma linha por dia, pronto para carga.
    """
    df = Transform().transform_clima(documento)
    get_run_logger().info("Transformação: %d registros diários.", len(df))
    return df


@task(name="carregar_neondb")
def carregar_neon(df: pd.DataFrame) -> None:
    """Grava o DataFrame transformado no NeonDB (PostgreSQL).

    Args:
        df: DataFrame já transformado.
    """
    ld = Load()
    try:
        ld.load_neon(df=df)
    finally:
        ld.close()
    get_run_logger().info("NeonDB: %d registros gravados.", len(df))


@flow(name="pipeline-clima-recife", log_prints=True)
def pipeline_clima(
    data_inicio: str = DATA_INICIO,
    data_fim: str = DATA_FIM,
    db_name: str = MONGO_DB,
    collection_name: str = MONGO_COLECAO,
) -> None:
    """Orquestra a ETL: API -> MongoDB Atlas -> transformação -> NeonDB.

    A ordem é garantida pelas dependências de dados: cada task recebe o
    resultado da anterior (a carga no Mongo é aguardada antes da releitura).

    Args:
        data_inicio: data inicial do período, no formato "YYYY-MM-DD".
        data_fim: data final do período, no formato "YYYY-MM-DD".
        db_name: banco do MongoDB onde o bruto é guardado.
        collection_name: coleção do MongoDB onde o bruto é guardado.
    """
    bruto = extrair_api(data_inicio, data_fim)
    carga_mongo = carregar_mongo(bruto, db_name, collection_name)
    documento = extrair_mongo(db_name, collection_name, wait_for=[carga_mongo])
    df = transformar(documento)
    carregar_neon(df)


if __name__ == "__main__":
    pipeline_clima()
