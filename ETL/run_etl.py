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


def main() -> None:
    ext = Extract()
    ld = Load()
    transformer = Transform()

    print("Etapa 1: Extração da API Open-Meteo!")
    data = ext.clima_historico(
        data_inicio="2024-01-01",
        data_fim="2024-01-31",
    )
    ld.load_mongo(data, "OpenMeteo", "ClimaBrasil")

    print("\nEtapa 2: Releitura do MongoDB e transformação!")
    documentos = ext.extract_collection_from_mongo("OpenMeteo", "ClimaBrasil")
    df = transformer.transform_clima(documentos[-1])

    print("\nEtapa 3: Salvando no SQLite!")
    ld.load_sqlite(df=df)

    ext.close()
    ld.close()

    print("\nPipeline concluído com sucesso!")
    print(df.head())


if __name__ == "__main__":
    main()
