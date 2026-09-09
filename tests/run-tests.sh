#!/usr/bin/env bash
# =====================================================================
# S.O.S-Cidade — Executor de Testes Automatizados da API (Projetos 5)
# =====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

mkdir -p evidencias

REPORT_FILE="evidencias/test-execution-report.txt"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

echo "========================================================"
echo "  S.O.S-Cidade (Recife) — Automação de Testes de API   "
echo "  Squad Projetos 5 — Sistema sob Teste (SUT)           "
echo "========================================================"
echo ""
echo "[1/2] Executando testes automatizados com Jest e Supertest..."

HEADER="================================================================================
EVIDÊNCIA DE EXECUÇÃO DA SUÍTE DE TESTES DE API
SUT: S.O.S-Cidade (Recife) - Projeto Integrador (Projetos 5)
Data da Execução: $TIMESTAMP
Ambiente: Node.js $(node -v) / Jest 29 / Supertest 6
================================================================================
"

echo "$HEADER" > "$REPORT_FILE"

node ../backend/node_modules/jest/bin/jest.js --config jest.config.js --runInBand --verbose 2>&1 | tee -a "$REPORT_FILE"

echo ""
echo "[2/2] Suíte de testes concluída com sucesso!"
echo "Evidências salvas em: $REPORT_FILE"
echo "========================================================"
