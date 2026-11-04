"""Lista em Markdown os testes que falharam, lendo os JUnit XML de uma pasta.

Uso: python3 falhas.py <pasta-dos-xml>
Imprime a seção "Testes que falharam" usada no corpo da issue de falha.
"""

import os
import pathlib
import sys
import xml.etree.ElementTree as ET

LIMITE_FALHAS = 20
LIMITE_MENSAGEM = 200


def limpar(texto):
    """Uma linha só, sem crase (quebraria a formatação do Markdown) e com tamanho limitado."""
    linha = (texto or "").strip().splitlines()[0] if (texto or "").strip() else "sem mensagem"
    linha = linha.replace("`", "'")
    if len(linha) > LIMITE_MENSAGEM:
        linha = linha[: LIMITE_MENSAGEM - 3] + "..."
    return linha


def caminho_relativo(caminho):
    """O node --test grava o caminho absoluto do runner; corta até a raiz do repositório."""
    raiz = os.environ.get("GITHUB_WORKSPACE", "")
    if raiz and caminho.startswith(raiz):
        return caminho[len(raiz):].lstrip("/")
    return caminho


def main(pasta):
    arquivos = sorted(pathlib.Path(pasta).glob("*.xml"))
    if not arquivos:
        print("### Testes que falharam\n")
        print(
            "Nenhum resultado de teste foi gerado: a falha aconteceu antes dos testes "
            "(instalação de dependências ou subida da stack). Veja os logs da execução."
        )
        return

    total = 0
    falhas = []
    for arquivo in arquivos:
        try:
            raiz = ET.parse(arquivo).getroot()
        except ET.ParseError:
            falhas.append((arquivo.stem, "(arquivo XML corrompido)", "", "não foi possível ler o arquivo"))
            continue
        for caso in raiz.iter("testcase"):
            total += 1
            erro = caso.find("failure")
            if erro is None:
                erro = caso.find("error")
            if erro is None:
                continue
            arquivo_teste = caminho_relativo(caso.get("file") or caso.get("classname") or "")
            mensagem = erro.get("message") or erro.text
            falhas.append((arquivo.stem, limpar(caso.get("name")), arquivo_teste, limpar(mensagem)))

    print(f"### Testes que falharam ({len(falhas)} de {total})\n")
    if not falhas:
        print(
            "Nenhum teste falhou nos resultados: a falha foi em outro passo do job. "
            "Veja a execução para saber qual."
        )
        return

    for suite, nome, arquivo_teste, mensagem in falhas[:LIMITE_FALHAS]:
        onde = f" (`{arquivo_teste}`)" if arquivo_teste else ""
        print(f"- **{suite}** · `{nome}`{onde}: {mensagem}")
    if len(falhas) > LIMITE_FALHAS:
        print(f"\nE mais {len(falhas) - LIMITE_FALHAS} falhas. A lista completa está nos XML do artefato.")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "resultados")
