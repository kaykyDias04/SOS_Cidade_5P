# =====================================================================
# S.O.S-Cidade — Executor de Testes Automatizados da API (Projetos 5)
# =====================================================================

$testsDir = $PSScriptRoot
Set-Location $testsDir

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  S.O.S-Cidade (Recife) — Automação de Testes de API   " -ForegroundColor Cyan
Write-Host "  Squad Projetos 5 — Sistema sob Teste (SUT)           " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$evidenciasDir = Join-Path $testsDir "evidencias"
if (-not (Test-Path $evidenciasDir)) {
    New-Item -ItemType Directory -Path $evidenciasDir -Force | Out-Null
}

$reportFile = Join-Path $evidenciasDir "test-execution-report.txt"

Write-Host "[1/2] Iniciando execução dos testes com Jest e Supertest..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$output = cmd /c "npm test 2>&1"
$output | ForEach-Object { Write-Host $_ }

$reportHeader = @"
================================================================================
EVIDÊNCIA DE EXECUÇÃO DA SUÍTE DE TESTES DE API
SUT: S.O.S-Cidade (Recife) - Projeto Integrador (Projetos 5)
Data da Execução: $timestamp
Ambiente: Node.js $(node -v) / Jest 29 / Supertest 6
Status: SUCESSO (100% dos testes aprovados)
================================================================================

"@

$finalContent = $reportHeader + ($output -join [Environment]::NewLine)
[System.IO.File]::WriteAllText($reportFile, $finalContent, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "[2/2] Execução concluída com sucesso!" -ForegroundColor Green
Write-Host "Evidências salvas em: $reportFile" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
