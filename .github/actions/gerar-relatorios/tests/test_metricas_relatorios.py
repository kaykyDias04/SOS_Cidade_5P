import importlib.util
import json
import os
import pathlib
import tempfile
import unittest
from unittest.mock import patch


ROOT = pathlib.Path(__file__).resolve().parents[4]
SCRIPT = ROOT / ".github" / "actions" / "gerar-relatorios" / "metricas_relatorios.py"
FIXTURES = pathlib.Path(__file__).parent / "fixtures"

spec = importlib.util.spec_from_file_location("metricas_relatorios", SCRIPT)
metricas = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metricas)


class ColetarMetricasXmlTests(unittest.TestCase):
    def test_suíte_verde_preserva_contagem_e_tempo(self):
        resultado = metricas.coletar_metricas_xml(FIXTURES / "green")

        self.assertEqual(resultado["total"], 2)
        self.assertEqual(resultado["passaram"], 2)
        self.assertEqual(resultado["falharam"], 0)
        self.assertEqual(resultado["suites"]["unit-mobile"]["tempo"], 0.05)

    def test_suíte_com_falha_conta_detalhe_da_falha(self):
        resultado = metricas.coletar_metricas_xml(FIXTURES / "failure")

        self.assertEqual(resultado["total"], 2)
        self.assertEqual(resultado["passaram"], 1)
        self.assertEqual(resultado["falharam"], 1)
        self.assertEqual(resultado["falhas_detalhes"][0]["suite"], "e2e-mobile-web")
        self.assertEqual(resultado["falhas_detalhes"][0]["teste"], "MS-02 registra denúncia")

    def test_pasta_vazia_nao_gera_exceção(self):
        with tempfile.TemporaryDirectory() as pasta:
            resultado = metricas.coletar_metricas_xml(pasta)

        self.assertEqual(resultado["total"], 0)
        self.assertEqual(resultado["passaram"], 0)
        self.assertEqual(resultado["falharam"], 0)
        self.assertEqual(resultado["taxa_geral"], 0.0)

    def test_limites_de_tempo_das_suites_mobile(self):
        self.assertEqual(metricas.LIMITES_TEMPO["unit-mobile"], 60.0)
        self.assertEqual(metricas.LIMITES_TEMPO["e2e-mobile-web"], 300.0)


class MobileMetricsTests(unittest.TestCase):
    def test_backlog_conta_itens_concluidos_e_total(self):
        with tempfile.TemporaryDirectory() as pasta:
            backlog = pathlib.Path(pasta) / "backlog.md"
            backlog.write_text(
                "| ID | Item | Status |\n"
                "| --- | --- | --- |\n"
                "| MS-01 | Gestor | ✅ |\n"
                "| ME-01 | Login | 🔲 |\n"
                "| Notes | Não é item do backlog | ✅ |\n",
                encoding="utf-8",
            )

            resultado = metricas.coletar_cobertura_mobile(backlog)

        self.assertEqual(resultado["total"], 2)
        self.assertEqual(resultado["automatizados"], 1)
        self.assertEqual(resultado["taxa"], 50.0)

    def test_conta_instaveis_registrados_e_em_quarentena(self):
        with tempfile.TemporaryDirectory() as pasta:
            raiz = pathlib.Path(pasta)
            (raiz / "resultados").mkdir()
            (raiz / "resultados-quarentena").mkdir()
            (raiz / "resultados" / "flaky-e2e.json").write_text(
                json.dumps([{"titulo": "A"}, {"titulo": "B"}]),
                encoding="utf-8",
            )
            (raiz / "resultados-quarentena" / "flaky-mobile.json").write_text(
                json.dumps([{"titulo": "C"}]),
                encoding="utf-8",
            )

            resultado = metricas.coletar_metricas_flaky(raiz)

        self.assertEqual(resultado["registrados"], 2)
        self.assertEqual(resultado["quarentena"], 1)
        self.assertEqual(resultado["arquivos_invalidos"], [])

    def test_json_instavel_vazio_ou_invalido_nao_gera_excecao(self):
        with tempfile.TemporaryDirectory() as pasta:
            raiz = pathlib.Path(pasta)
            (raiz / "resultados").mkdir()
            (raiz / "resultados-quarentena").mkdir()
            (raiz / "resultados" / "flaky-invalido.json").write_text("{", encoding="utf-8")

            resultado = metricas.coletar_metricas_flaky(raiz)

        self.assertEqual(resultado["registrados"], 0)
        self.assertEqual(resultado["quarentena"], 0)
        self.assertEqual(len(resultado["arquivos_invalidos"]), 1)

    def test_relatorios_incluem_mobile_e_toleram_xml_ausente(self):
        mobile = {"total": 3, "automatizados": 1, "taxa": 33.3, "pendentes": ["MS-02", "MS-03"]}
        flaky = {"registrados": 2, "quarentena": 1, "arquivos_invalidos": []}
        backlog = {"total": 11, "automatizados": 10, "taxa": 90.9, "pendentes": []}
        pipeline = {"total_runs": 7, "sucessos": 7, "taxa": 100.0, "dias": 7}
        com_mobile = metricas.coletar_metricas_xml(FIXTURES / "baseline")
        sem_mobile = metricas.coletar_metricas_xml(FIXTURES / "empty")

        with tempfile.TemporaryDirectory() as pasta:
            raiz = pathlib.Path(pasta)
            tecnico = raiz / "tecnico.html"
            negocio = raiz / "negocio.html"
            tecnico_vazio = raiz / "tecnico-vazio.html"
            negocio_vazio = raiz / "negocio-vazio.html"
            summary = raiz / "summary.md"

            semaforo = metricas.calcular_semaforo(com_mobile, backlog, pipeline)
            metricas.gerar_relatorio_tecnico_html(
                com_mobile, backlog, pipeline, semaforo, str(tecnico), mobile, flaky
            )
            metricas.gerar_relatorio_negocio_html(
                com_mobile, backlog, pipeline, semaforo, str(negocio), mobile, flaky
            )
            metricas.gerar_relatorio_tecnico_html(
                sem_mobile, backlog, pipeline, semaforo, str(tecnico_vazio), mobile, flaky
            )
            metricas.gerar_relatorio_negocio_html(
                sem_mobile, backlog, pipeline, semaforo, str(negocio_vazio), mobile, flaky
            )
            with patch.dict(os.environ, {"GITHUB_STEP_SUMMARY": str(summary)}):
                metricas.publicar_github_summary(
                    com_mobile, backlog, pipeline, semaforo, mobile, flaky
                )

            html_tecnico = tecnico.read_text(encoding="utf-8")
            html_negocio = negocio.read_text(encoding="utf-8")
            html_tecnico_vazio = tecnico_vazio.read_text(encoding="utf-8")
            html_negocio_vazio = negocio_vazio.read_text(encoding="utf-8")
            resumo = summary.read_text(encoding="utf-8")

        self.assertIn("unit-mobile", html_tecnico)
        self.assertIn("e2e-mobile-web", html_tecnico)
        self.assertIn("Falhas mobile nesta execução: <strong>1</strong>", html_tecnico)
        self.assertIn("Testes instáveis registrados: <strong>2</strong>", html_tecnico)
        self.assertIn("Fluxos protegidos no backlog", html_negocio)
        self.assertIn("os testes atuais são unitários", html_negocio)
        self.assertIn("Nenhuma suíte mobile foi executada", html_tecnico_vazio)
        self.assertIn("Nenhuma suíte mobile foi executada", html_negocio_vazio)
        self.assertIn("Qualidade Mobile", resumo)
        self.assertIn("Instáveis registrados / em quarentena | 2 / 1", resumo)


if __name__ == "__main__":
    unittest.main()
