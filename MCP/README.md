# Servidor MCP: Clima + Gemini

Servidor MCP (FastMCP) conectado ao banco Neon/PostgreSQL. A conexão `NEON_DATABASE_URL` é lida de `ETL/.env`; a chave do Gemini é lida de `MCP/.env`.

## Como rodar (PowerShell)

```powershell
cd MCP
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Configure GEMINI_API_KEY em .env; preserve NEON_DATABASE_URL em ../ETL/.env.
python cliente_teste.py  # teste pelo terminal
fastmcp dev inspector servidor.py  # interface visual
```

## Ferramentas

`listar_tabelas`, `descrever_tabela`, `executar_select`, `contar_linhas` (Ex. 1) e `perguntar_ao_banco`.

`perguntar_ao_banco` também requer acesso habilitado à Gemini API. As demais ferramentas consultam o Neon diretamente.
No prompt do `cliente_teste.py`, digite `listar tabelas` para consultar sem chamar o Gemini.
Digite `descrever tabelas` para listar as colunas e os tipos de todas as tabelas sem chamar o Gemini.
Digite `contar linhas` para mostrar a quantidade de linhas de cada tabela sem chamar o Gemini.

## Exercícios

1. `contar_linhas` em `servidor.py`, validando o nome da tabela contra a lista real.
2. `GEMINI_MODEL` lido do `.env` em `servidor.py`, padrão `gemini-2.5-flash`.
3. `BancoComLimite(BancoNeon)` limita os resultados de `consultar` a 10 linhas.

## Conectar no Claude Desktop / VS Code

```json
{
  "mcpServers": {
    "clima-gemini": {
      "command": "C:\\caminho\\do\\repo\\MCP\\.venv\\Scripts\\python.exe",
      "args": ["C:\\caminho\\do\\repo\\MCP\\servidor.py"]
    }
  }
}
```
