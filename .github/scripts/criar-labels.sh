#!/usr/bin/env bash
set -euo pipefail

while IFS='|' read -r nome cor descricao; do
  gh label create "$nome" --color "$cor" --description "$descricao" --force
done <<'LABELS'
falha:sut|d73a4a|Falha reproduzida no sistema sob teste (SUT).
falha:tas|e5534b|Falha ou defeito na automação de testes (TAS).
falha:ambiente|c9302c|Falha causada pelo runner, rede ou dependência do ambiente.
falha:esperada|b60205|Falha de teste após uma mudança intencional no sistema.
prioridade:alta|b60205|Bloqueia a main ou o smoke; corrigir em até 1 dia útil.
prioridade:media|fbca04|Afeta a regressão; corrigir em até 3 dias úteis.
prioridade:baixa|0e8a16|Sem impacto imediato; tratar na próxima revisão periódica.
flaky|fbca04|Teste instável que passa e falha sem mudança de código.
mobile|1d76db|Falha ou manutenção relacionada à suíte mobile.
LABELS
