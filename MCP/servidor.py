import os
from pathlib import Path

from dotenv import dotenv_values, load_dotenv
from fastmcp import FastMCP

from assistente import AssistenteGemini
from banco import BancoComLimite

PASTA = Path(__file__).resolve().parent

# 1) Lê a chave do Gemini no .env do MCP e a conexão Neon no .env do ETL.
#    O caminho é fixo ao lado deste arquivo: o app de IA pode iniciar o servidor de qualquer pasta.
load_dotenv(PASTA / ".env")
config_etl = dotenv_values(PASTA.parent / "ETL" / ".env")

# 2) Cria os objetos que fazem o trabalho de verdade
neon_database_url = os.getenv("NEON_DATABASE_URL") or config_etl.get("NEON_DATABASE_URL")
banco = BancoComLimite(neon_database_url)

gemini = AssistenteGemini(
    os.getenv("GEMINI_API_KEY"),
    os.getenv("GEMINI_MODEL") or "gemini-2.5-flash",
)

# 3) Cria o servidor MCP
mcp = FastMCP("Servidor Clima + Gemini")


# 4) Cada função com @mcp.tool vira uma ferramenta disponível para a IA.
#    A docstring é a descrição que a IA lê para saber quando usar a ferramenta.
@mcp.tool
def listar_tabelas() -> list[str]:
    """Lista as tabelas existentes no banco de dados."""
    return banco.listar_tabelas()


@mcp.tool
def descrever_tabela(tabela: str) -> list[dict]:
    """Mostra as colunas e os tipos de uma tabela."""
    return banco.descrever_tabela(tabela)


@mcp.tool
def executar_select(sql: str) -> list[dict]:
    """Executa um comando SELECT no banco e devolve as linhas (no máximo 10)."""
    return banco.consultar(sql)


@mcp.tool
def contar_linhas(tabela: str) -> int:
    """Conta quantas linhas uma tabela possui."""
    return banco.contar_linhas(tabela)


@mcp.tool
def perguntar_ao_banco(pergunta: str) -> dict:
    """Responde uma pergunta em português: o Gemini gera o SQL, o banco executa e o Gemini explica."""
    sql = gemini.gerar_sql(pergunta, banco.esquema_completo())
    dados = banco.consultar(sql)
    resposta = gemini.explicar_resultado(pergunta, dados)
    return {"sql": sql, "dados": dados, "resposta": resposta}


if __name__ == "__main__":
    mcp.run()  # padrão: transporte stdio
