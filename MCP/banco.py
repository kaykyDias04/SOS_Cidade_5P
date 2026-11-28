import re
from contextlib import closing

import psycopg2
from psycopg2 import sql


class BancoNeon:
    """Acesso somente leitura ao banco PostgreSQL no Neon."""

    def __init__(self, database_url, schema="public"):
        self.database_url = database_url
        self.schema = schema

    def _conectar(self):
        if not self.database_url:
            raise RuntimeError(
                "Configure NEON_DATABASE_URL em ETL/.env ou MCP/.env."
            )

        conexao = psycopg2.connect(self.database_url, connect_timeout=15)
        conexao.set_session(readonly=True)
        return conexao

    @staticmethod
    def _validar_select(consulta):
        consulta_sem_ponto_e_virgula = consulta.strip().removesuffix(";").strip()
        if (
            not re.match(r"^(SELECT|WITH)\b", consulta_sem_ponto_e_virgula, re.IGNORECASE)
            or ";" in consulta_sem_ponto_e_virgula
        ):
            raise ValueError("Somente uma consulta SELECT pode ser executada.")
        return consulta_sem_ponto_e_virgula

    def consultar(self, consulta):
        """Executa uma consulta somente leitura e devolve no máximo as linhas da consulta."""
        consulta = self._validar_select(consulta)
        with closing(self._conectar()) as conexao:
            with conexao.cursor() as cursor:
                cursor.execute(consulta)
                colunas = [coluna[0] for coluna in cursor.description]
                linhas = cursor.fetchall()
        return [dict(zip(colunas, linha)) for linha in linhas]

    def listar_tabelas(self):
        """Retorna as tabelas da schema configurada."""
        consulta = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = %s AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """
        with closing(self._conectar()) as conexao:
            with conexao.cursor() as cursor:
                cursor.execute(consulta, (self.schema,))
                return [linha[0] for linha in cursor.fetchall()]

    def descrever_tabela(self, tabela):
        """Retorna as colunas e os tipos de uma tabela existente."""
        if tabela not in self.listar_tabelas():
            raise ValueError(f"Tabela '{tabela}' não existe na schema '{self.schema}'.")

        consulta = """
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s
            ORDER BY ordinal_position
        """
        with closing(self._conectar()) as conexao:
            with conexao.cursor() as cursor:
                cursor.execute(consulta, (self.schema, tabela))
                return [
                    {"coluna": coluna, "tipo": tipo}
                    for coluna, tipo in cursor.fetchall()
                ]

    def contar_linhas(self, tabela):
        """Conta as linhas de uma tabela existente sem interpolar identificadores."""
        if tabela not in self.listar_tabelas():
            raise ValueError(f"Tabela '{tabela}' não existe na schema '{self.schema}'.")

        consulta = sql.SQL("SELECT COUNT(*) AS total FROM {}.{}").format(
            sql.Identifier(self.schema),
            sql.Identifier(tabela),
        )
        with closing(self._conectar()) as conexao:
            with conexao.cursor() as cursor:
                cursor.execute(consulta)
                return cursor.fetchone()[0]

    def esquema_completo(self):
        """Monta um texto com todas as tabelas e colunas (usado pelo Gemini)."""
        texto = ""
        for tabela in self.listar_tabelas():
            colunas = self.descrever_tabela(tabela)
            lista = ", ".join(f"{c['coluna']} ({c['tipo']})" for c in colunas)
            texto += f"- {tabela}: {lista}\n"
        return texto


class BancoComLimite(BancoNeon):
    """BancoNeon que devolve no máximo `limite` linhas por consulta."""

    def __init__(self, database_url, limite=10, schema="public"):
        super().__init__(database_url, schema)
        self.limite = limite

    def consultar(self, consulta):
        linhas = super().consultar(consulta)
        return linhas[: self.limite]
