import asyncio

from fastmcp import Client
from fastmcp.exceptions import ToolError

from servidor import mcp


async def main() -> int:
    # Conecta direto no objeto do servidor (em memória)
    async with Client(mcp) as cliente:
        ferramentas = await cliente.list_tools()
        print("Ferramentas disponíveis:")
        for ferramenta in ferramentas:
            print(f"  - {ferramenta.name}: {ferramenta.description}")

        tabelas = await cliente.call_tool("listar_tabelas", {})
        print("\nTabelas:", tabelas.data)

        # Exercício 1
        total = await cliente.call_tool("contar_linhas", {"tabela": "clima_historico"})
        print("Linhas em clima_historico:", total.data)

        pergunta = input(
            "\nPergunte ao Gemini ou digite 'listar tabelas', 'descrever tabelas' "
            "ou 'contar linhas' "
            "para consultar direto (Enter para sair): "
        ).strip()
        comando = pergunta.casefold().replace("_", " ")
        if comando == "listar tabelas":
            tabelas = await cliente.call_tool("listar_tabelas", {})
            print("\nTabelas:", tabelas.data)
        elif comando == "contar linhas":
            tabelas = await cliente.call_tool("listar_tabelas", {})
            for tabela in tabelas.data:
                total = await cliente.call_tool(
                    "contar_linhas", {"tabela": tabela}
                )
                print(f"Linhas em {tabela}: {total.data}")
        elif comando == "descrever tabelas":
            tabelas = await cliente.call_tool("listar_tabelas", {})
            for tabela in tabelas.data:
                colunas = await cliente.call_tool(
                    "descrever_tabela", {"tabela": tabela}
                )
                print(f"\n{tabela}:")
                for coluna in colunas.data:
                    print(f"  - {coluna['coluna']}: {coluna['tipo']}")
        elif pergunta:
            try:
                resultado = await cliente.call_tool(
                    "perguntar_ao_banco", {"pergunta": pergunta}
                )
            except ToolError as erro:
                print(f"\nFalha ao consultar o Gemini: {erro}")
                return 1
            print("\nSQL gerado:", resultado.data["sql"])
            print("Resposta:", resultado.data["resposta"])
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
