# Evidências finais — Gestão dos Testes

Finalização em 18/11/2026. Base Git: a30043aac47b0e3cf3c9f7827f2c9ccef075d67c. Árvore executada: 19848a6a33308a19690d50a37b9cf60cafe62583cc20be5b452b4374b3fa062f. Ambiente: Node v24.22.1, Jest 29.7.0, win32/x64. Fingerprint do ambiente: 572fbb5fcb4d8ad1375c086ad41b6a7957b0978af213caf4b3b8f821bbc83af2.

**Escopo acordado:** somente gestão dos testes, unitários/API e verificações estáticas. E2E real, Docker/WSL e validação remota após publicação são responsabilidade de outro integrante. Nenhum E2E real foi executado nesta finalização. Nenhum staging, commit, push, merge ou PR foi feito.

## Resultados executados

| Comando/verificação | Resultado real |
| --- | --- |
| npm run test:management:validate | Aprovado: 95 testes inventariados, registro vazio, críticos ativos/protegidos |
| npm run test:management:selftest | 6 verificações aprovadas, 0 reprovadas |
| npm run test:unit | 8 frontend + 26 backend aprovados |
| npm run test:api | 54 aprovados; encerramento natural sem forceExit |
| npm run test:review | Markdown/JSON gerados, 21 achados para revisão humana |
| Sintaxe JS | Os 12 scripts CJS/MJS de gestão passaram em node --check |
| YAML/contratos dos workflows | 5 YAML válidos; três jobs originais, gatilhos, serviços e permissões preservados |
| git diff --check | Aprovado, sem erro de whitespace |
| E2E reais (7 cenários) | Não executados; responsabilidade do integrante designado |
| Workflows novos/alterados no GitHub | Não publicados nem executados; validação remota pendente |

Logs finais locais, fora do Git: ../final-validate.log, ../gestao-final-selftest.log, ../final-unit.log, ../final-api.log, ../final-review.log, ../final-static.log, ../final-diffcheck.log. Cópias estão na entrega em outputs/evidencias-finais/. JSON por tentativa e logs permanecem em resultados/gestao/normal/.

## Correções comprovadas

1. Histórico agrupado por SHA, digest da árvore e ambiente; falha antiga seguida de sucesso em código corrigido não vira flaky. Dados legados sem contexto não aprovam cobertura atual.
2. Cobertura crítica exige contexto atual e evidência de até 24 h. A execução mais recente do caso precisa passar sem qualquer falha anterior naquela execução; runner sem relatório ou erro de carregamento do arquivo invalida essa evidência.
3. Política protege 85 casos funcionais, inclusive os 7 E2E e toda a jornada modular. O relatório confirma 78 casos protegidos com evidência atual e mantém 7 E2E pendentes. Os demais 10 casos da suíte unitária/API também passaram, totalizando 88.
4. Saída de quarentena exige SHA corrigido, digest, ambiente, data da correção e 10 execuções distintas consecutivas sem falha inicial, mais aprovação humana. Retry bem-sucedido não é estabilidade.
5. MaxListenersExceededWarning foi corrigido com um consumidor único do stream de eventos. Os mesmos resultados continuam em console, JSON e JUnit; nenhum aviso foi suprimido.
6. forceExit removido após a investigação com --detectOpenHandles --forceExit=false: 54 casos passaram e o processo encerrou com código 0, sem relatório de handles abertos. A execução final também encerrou naturalmente.
7. Os quatro registros antigos sem relatório estão separados em historicalRunnerErrors, com hora e caminho originais, fora dos achados atuais do produto. Eram erros de sintaxe nas primeiras configurações Jest, corrigidos antes das execuções válidas.
8. Reporters mantêm suporte a caminhos Windows por file://; metadados de aprovação não criam autorreferência no digest.
9. README do E2E corrigido: o seed existe e o cadastro público não cria GESTOR. Comandos e responsabilidades estão na seção de passagem ao outro integrante.

## Quarentena e gate

A revisão final acrescentou conferência obrigatória dos casos esperados: inventário e quarantine.json são cruzados por ID, arquivo e título; cada rodada exige resultado válido da tentativa inicial. Ausentes, ignorados ou sem resultado válido geram código 1 e attempts[].quarantineEvidence.missing. O teste sintético deixa somente outro caso aprovado ser selecionado e comprova que a ausência do @flaky esperado reprova o wrapper. A quarentena vazia real continua válida e o gate normal permanece intacto.

Os relatórios distinguem no-recent-evidence de failed, execution-error, not-executed e disabled. Os 7 E2E atuais constam como falta de evidência recente, sem serem declarados reprovados. Auditoria Git confirmou os 18 arquivos novos fora das regras de ignore e nenhum log/cache/node_modules/.env no conjunto de entrega.

Registro real vazio: nenhum teste do produto foi rotulado flaky ou excluído. Evidência sintética final: relatorios/selftest/sos-management-selftest-mUis7g/. Os casos isolados verificam os três frameworks, seleção separada, falha normal bloqueante, falha inicial preservada após sucesso, separação de SHA/ambiente, cobertura recente e critérios de saída. São demonstrações do mecanismo, não aprovação de E2E da aplicação.

continue-on-error permanece somente na etapa Testes em quarentena (falhas isoladas). Jobs principais e testes normais continuam bloqueantes. Artifacts normais: resultados-testes; gestão/quarentena: gestao-quarentena; revisão semanal: revisao-testes, segunda às 09:00 de Brasília e manual por sprint.

## Histórico preservado e limites

As primeiras execuções de implementação tiveram erro de geração dos arquivos Jest e dois problemas de autovalidação no Windows (URL ESM e contexto node:test herdado). Foram corrigidos; os logs antigos não foram apagados nem usados como aprovações. A tentativa anterior de preparar builds E2E encontrou ENOSPC e falha de inicialização Docker/WSL; esse trabalho foi retirado do escopo final pelo usuário. Não foram incluídos auxiliares de instalação/preparação de máquina na proposta final.

A consulta somente de leitura ao GitHub encontrou a regressão anterior [#31](https://github.com/kaykyDias04/SOS_Cidade_5P/actions/runs/44329270636), na base a30043a, com artifacts resultados-testes/relatorios-qualidade e resumo histórico de 95/95. Também foram observados unit-api [#44](https://github.com/kaykyDias04/SOS_Cidade_5P/actions/runs/44302977101) e smoke [#18](https://github.com/kaykyDias04/SOS_Cidade_5P/actions/runs/44300615473). Esses resultados são da versão remota anterior, sem os workflows locais novos, e não aprovam o código atual.

Os 21 achados atuais são 7 E2E sem execução local e 14 sinais para revisão humana (rastreabilidade incompleta, duplicação candidata, idade e padrões de código). Não foram inventadas HU para testes técnicos nem tratados esses sinais como defeitos confirmados.

## Passagem ao responsável pelos E2E

Seguir a seção **Pendências para o responsável pelos testes E2E** em gestao-testes.md: ambiente isolado, migrations/seed, serviços, smoke/completo, modo headed opcional, JSON/JUnit/HTML e screenshots/traces em falhas. Os 3 smoke são subconjunto dos 7 cenários. A suíte atual não comprova mudança de status pelo gestor via tela; não ampliar a alegação de cobertura. Validar remotamente os quatro workflows apenas após publicação autorizada, guardando os links e artifacts.

Mensagem sugerida, não executada: feat(testing): finaliza gestão de testes, quarentena e revisão por contexto.
