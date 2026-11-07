import sys
from pathlib import Path

etl_dir = Path(__file__).resolve().parent
if str(etl_dir) not in sys.path:
    sys.path.insert(0, str(etl_dir))
if str(etl_dir.parent) not in sys.path:
    sys.path.insert(0, str(etl_dir.parent))

try:
    from ETL import config
    from ETL.extract import Extract
    from ETL.load import Load
    from ETL.transform import Transform
except ModuleNotFoundError:
    import config
    from extract import Extract
    from load import Load
    from transform import Transform


DATA_INICIO = "2024-01-01"
DATA_FIM = "2024-01-31"
MONGO_DB = config.MONGO_DB
MONGO_COLECAO = config.MONGO_COLLECTION


def main() -> None:
    """Executa o pipeline: API Open-Meteo -> MongoDB Atlas -> pandas -> NeonDB."""
    ext = Extract()
    ld = Load()
    transformer = Transform()

    print("Etapa 1: Extração da API Open-Meteo e carga na camada Bronze (MongoDB Atlas)!")
    data = ext.clima_historico(
        data_inicio=DATA_INICIO,
        data_fim=DATA_FIM,
    )
    ld.load_mongo(data, MONGO_DB, MONGO_COLECAO)

    print("\nEtapa 2: Leitura apenas da carga mais recente (por data_extracao) e Transformação!")
    documento_recente = ext.extract_latest_from_mongo(MONGO_DB, MONGO_COLECAO)
    df = transformer.transform_clima(documento_recente)

    print("\nEtapa 3: Salvando no NeonDB e conferindo volumetria Bronze vs Destino!")
    total_neon = ld.load_neon(df=df)
    qtd_bronze = len(documento_recente.get("daily", {}).get("time", []))
    print(f"Comparativo final: Camada Bronze = {qtd_bronze} | Tabela NeonDB = {total_neon}")

    ext.close()
    ld.close()

    print("\nPipeline concluído com sucesso!")
    print(df.head())


if __name__ == "__main__":
    main()
