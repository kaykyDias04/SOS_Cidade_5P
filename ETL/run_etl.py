import sys
from pathlib import Path

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


def main() -> None:
    """Executa o pipeline: API Open-Meteo -> MongoDB Atlas -> pandas -> NeonDB."""
    ext = Extract()
    ld = Load()
    transformer = Transform()

    print("Etapa 1: Extração da API Open-Meteo!")
    data = ext.clima_historico(
        data_inicio=DATA_INICIO,
        data_fim=DATA_FIM,
    )
    ld.load_mongo(data, MONGO_DB, MONGO_COLECAO)

    print("\nEtapa 2: Releitura do MongoDB e transformação!")
    documentos = ext.extract_collection_from_mongo(MONGO_DB, MONGO_COLECAO)
    df = transformer.transform_clima(documentos[-1])

    print("\nEtapa 3: Salvando no NeonDB!")
    ld.load_neon(df=df)

    ext.close()
    ld.close()

    print("\nPipeline concluído com sucesso!")
    print(df.head())


if __name__ == "__main__":
    main()
