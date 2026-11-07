import sys
from pathlib import Path

import pandas as pd
import streamlit as st
from sqlalchemy import create_engine, text

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ETL import config  # noqa: E402


st.set_page_config(
    page_title="Dashboard Climático - Recife (S.O.S Cidade)",
    page_icon="🌦️",
    layout="wide",
)


@st.cache_data(ttl=120)
def carregar_dados_neon() -> pd.DataFrame:
    """Lê a tabela final `clima_historico` do NeonDB usando a conexão de `config.py`."""
    if not config.NEON_DATABASE_URL:
        raise ValueError(
            "Variável NEON_DATABASE_URL não definida. Configure o arquivo .env na raiz ou em ETL/.env."
        )

    engine = create_engine(config.NEON_DATABASE_URL)
    try:
        query = text(f'SELECT * FROM "{config.NEON_TABLE}" ORDER BY data ASC')
        with engine.connect() as conn:
            df = pd.read_sql(query, conn)
    finally:
        engine.dispose()

    df["data"] = pd.to_datetime(df["data"])
    return df


def main() -> None:
    st.title("🌦️ Monitoramento Climático de Recife — S.O.S Cidade")
    st.markdown(
        "Painel analítico conectado ao **NeonDB (PostgreSQL)** alimentado pela pipeline "
        "orquestrada com **Prefect** (`API Open-Meteo → MongoDB Atlas → Transformação → NeonDB`)."
    )

    try:
        df = carregar_dados_neon()
    except Exception as exc:
        st.error(
            f"Não foi possível carregar a tabela `{config.NEON_TABLE}` do NeonDB: {exc}"
        )
        st.info(
            "Verifique se a variável `NEON_DATABASE_URL` está configurada no `.env` "
            "e se a pipeline (`python ETL/flow_prefect.py` ou `python ETL/run_etl.py`) já foi executada."
        )
        return

    if df.empty:
        st.warning("A tabela no NeonDB está vazia. Execute a pipeline ETL primeiro.")
        return

    # ---------------- Barra Lateral: Filtros ----------------
    st.sidebar.header("🔎 Filtros")

    data_min = df["data"].min().date()
    data_max = df["data"].max().date()

    intervalo_datas = st.sidebar.date_input(
        "Período de análise",
        value=(data_min, data_max),
        min_value=data_min,
        max_value=data_max,
    )

    if isinstance(intervalo_datas, tuple) and len(intervalo_datas) == 2:
        inicio_filtro, fim_filtro = intervalo_datas
    else:
        inicio_filtro = fim_filtro = (
            intervalo_datas[0] if isinstance(intervalo_datas, tuple) else intervalo_datas
        )

    condicao_chuva = st.sidebar.selectbox(
        "Condição de precipitação",
        options=[
            "Todos os dias",
            "Apenas dias com chuva (> 0 mm)",
            "Apenas dias sem chuva (0 mm)",
        ],
    )

    temp_min_global = float(df["temp_media_c"].dropna().min()) if df["temp_media_c"].notna().any() else 20.0
    temp_max_global = float(df["temp_media_c"].dropna().max()) if df["temp_media_c"].notna().any() else 35.0

    if temp_min_global < temp_max_global:
        faixa_temp = st.sidebar.slider(
            "Faixa de temperatura média (°C)",
            min_value=round(temp_min_global - 0.5, 1),
            max_value=round(temp_max_global + 0.5, 1),
            value=(round(temp_min_global - 0.5, 1), round(temp_max_global + 0.5, 1)),
            step=0.1,
        )
    else:
        faixa_temp = (temp_min_global, temp_max_global)

    # Aplicação dos filtros
    df_filtrado = df[
        (df["data"].dt.date >= inicio_filtro) & (df["data"].dt.date <= fim_filtro)
    ].copy()

    if condicao_chuva == "Apenas dias com chuva (> 0 mm)":
        df_filtrado = df_filtrado[df_filtrado["precipitacao_mm"] > 0]
    elif condicao_chuva == "Apenas dias sem chuva (0 mm)":
        df_filtrado = df_filtrado[df_filtrado["precipitacao_mm"] == 0]

    df_filtrado = df_filtrado[
        df_filtrado["temp_media_c"].isna()
        | (
            (df_filtrado["temp_media_c"] >= faixa_temp[0])
            & (df_filtrado["temp_media_c"] <= faixa_temp[1])
        )
    ]

    if "data_extracao" in df.columns and df["data_extracao"].notna().any():
        ultima_extracao = str(df["data_extracao"].dropna().iloc[-1])
        st.sidebar.caption(f"Última carga (`data_extracao`): `{ultima_extracao}`")
    st.sidebar.caption(f"Total de registros no NeonDB: **{len(df)}**")

    if df_filtrado.empty:
        st.warning("Nenhum registro encontrado para os filtros selecionados.")
        return

    # ---------------- Indicadores (st.metric) ----------------
    st.subheader("📊 Indicadores do Período Selecionado")
    col1, col2, col3, col4 = st.columns(4)

    temp_media_periodo = df_filtrado["temp_media_c"].mean()
    temp_max_periodo = df_filtrado["temp_max_c"].max()
    precip_total = df_filtrado["precipitacao_mm"].sum()
    dias_com_chuva = int((df_filtrado["precipitacao_mm"] > 0).sum())
    vento_max = df_filtrado["vento_max_kmh"].max()

    col1.metric(
        label="Temperatura Média",
        value=f"{temp_media_periodo:.1f} °C" if pd.notna(temp_media_periodo) else "N/D",
        delta=f"{len(df_filtrado)} dias filtrados",
        delta_color="off",
    )
    col2.metric(
        label="Temperatura Máxima",
        value=f"{temp_max_periodo:.1f} °C" if pd.notna(temp_max_periodo) else "N/D",
        delta=(
            f"+{(temp_max_periodo - temp_media_periodo):.1f} °C vs média"
            if pd.notna(temp_max_periodo) and pd.notna(temp_media_periodo)
            else None
        ),
    )
    col3.metric(
        label="Precipitação Acumulada",
        value=f"{precip_total:.1f} mm" if pd.notna(precip_total) else "N/D",
        delta=f"{dias_com_chuva} dia(s) com chuva",
        delta_color="off",
    )
    col4.metric(
        label="Vento Máximo",
        value=f"{vento_max:.1f} km/h" if pd.notna(vento_max) else "N/D",
    )

    st.divider()

    # ---------------- Gráficos ----------------
    aba_temp, aba_chuva = st.columns(2)

    with aba_temp:
        st.subheader("🌡️ Evolução Diária das Temperaturas (°C)")
        df_chart_temp = df_filtrado.set_index("data")[
            ["temp_max_c", "temp_media_c", "temp_min_c"]
        ].rename(
            columns={
                "temp_max_c": "Máxima (°C)",
                "temp_media_c": "Média (°C)",
                "temp_min_c": "Mínima (°C)",
            }
        )
        st.line_chart(df_chart_temp)

    with aba_chuva:
        st.subheader("🌧️ Precipitação Diária Acumulada (mm)")
        df_chart_chuva = df_filtrado.set_index("data")[["precipitacao_mm"]].rename(
            columns={"precipitacao_mm": "Precipitação (mm)"}
        )
        st.bar_chart(df_chart_chuva)

    st.divider()

    # ---------------- Tabela de Dados ----------------
    st.subheader("📋 Dados da Tabela Final (`clima_historico` no NeonDB)")
    df_exibicao = df_filtrado.copy()
    df_exibicao["data"] = df_exibicao["data"].dt.strftime("%Y-%m-%d")
    st.dataframe(df_exibicao, use_container_width=True, hide_index=True)


if __name__ == "__main__":
    main()

