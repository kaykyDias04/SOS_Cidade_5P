# Evidências finais — Gestão dos Testes

> Registro histórico da validação anterior à publicação. Consulte a seção Correção local das duas falhas unit-api — PR #25, ao final, para os resultados posteriores.


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

## Correção local das duas falhas unit-api — PR #25

Investigação em 18/11/2026, a partir dos logs completos dos dois jobs. Base publicada: `7af1ed259151678ea950d0abb4fd08b3804211c5`, branch `feat/gestao-dos-testes`. Nenhum novo staging, commit, push, merge, PR ou alteração remota foi realizado nesta correção.

### Erro original e comparação das execuções

| Evento | Execução / job | Etapa / comando | Erro e resultado |
| --- | --- | --- | --- |
| pull_request | [#47 / 135183901165](https://github.com/kaykyDias04/SOS_Cidade_5P/actions/runs/44412449915/job/135183901165?pr=25), 47 s | Testes unitários (backend), `npm run test:unit:backend` → `node scripts/test-management/run.cjs backend` | `backend/jest.config.js:17`, `SyntaxError: Unexpected string`, exit code 1 |
| push | [#46 / 135183503222](https://github.com/kaykyDias04/SOS_Cidade_5P/actions/runs/44412338299/job/135183503222?pr=25), 39 s | Mesma etapa e comando | Mesmo arquivo, linha, erro e exit code 1 |

O commit publicado contém `reporters: [docs` na linha 16, seguido de `'default',` na linha 17. O token extra `docs` torna o array inválido e o parser aponta a string seguinte. A cópia local validada antes da publicação continha `reporters: [`; portanto, a validação local anterior não comprovava o conteúdo efetivamente publicado. A divergência ocorreu no conteúdo enviado ao editor web; os logs não permitem determinar o gesto de edição que inseriu o texto.

O job de push executou o commit da branch; o job de PR executou o merge de teste `e45dc80627d03ab867b41cbfaec26862317bf368`, incorporando `7af1ed2` à base `a30043a`. Ambos contêm o mesmo arquivo inválido. As diferenças de duração, cache e ref de checkout não alteram a causa.

### Classificação e revisão da configuração

- **Configuração Jest / sintaxe JavaScript:** causa comprovada. O erro ocorre antes de carregar os reporters ou executar os 26 testes do backend; não é reprovação de assertion.
- **Dependências:** `npm ci --prefix backend` e `npm ci --prefix e2e` concluíram nos dois jobs. Prisma Client foi gerado. Avisos de depreciação e cinco vulnerabilidades moderadas existem, mas não causaram essa falha; não foram ocultados nem corrigidos fora do escopo.
- **GitHub Actions:** o workflow foi aceito e executou seus passos. Node 24, lockfiles, permissões e comandos não apresentaram defeito causal. Nenhum workflow foi modificado.
- **Linux/Windows:** Ubuntu 24.04.5, Node v24.22.2 e npm 11.19.1 no CI; Windows x64, Node v24.22.1 e npm 12.2.1 localmente. A mesma falha foi reproduzida localmente com `node --check backend/jest.config.js` e `npm run test:unit:backend`, ambos com código 1 antes da correção. Não depende de separadores de caminho ou da versão de patch do Node. Não foi executada validação Linux local: a única distribuição WSL listada é `docker-desktop`; ela não foi iniciada ou alterada, e Docker não foi instalado.
- **Reporters e gestão:** os seis autotestes, frontend 8/8, API 54/54, quarentena vazia e geração/upload dos relatórios passaram nos dois jobs. O reporter do backend não chegou a carregar por causa da sintaxe. O wrapper propagou código 1 corretamente. A API possui mensagens `console.error` de casos negativos esperados; seu resumo confirma 54 aprovações, sem falha de teste.

Foram revisados `package.json`, `backend/jest.config.js`, `tests/jest.config.js`, `unit-api.yml` e scripts de execução/reporting/contexto. Os caminhos usam `path.join`/`path.resolve` e URLs de arquivo para ESM. Os mesmos scripts de gestão, frontend e API já executaram no Linux nos logs consultados. Reporters gravam em diretórios criados pelo executor; não há erro de permissão observado.

### Alteração mínima e arquivos para revisão

1. `backend/jest.config.js`: remover somente `docs` de `reporters: [docs`, mantendo todos os reporters, seleção de testes e opções existentes.
2. `docs/testes/evidencias-validacao.md`: preservar o histórico e acrescentar este diagnóstico, resultados e limites.

A correção está em um worktree local separado, `work/SOS_Cidade_5P-revisao-pr25`, na branch local `feat/gestao-dos-testes`, com HEAD ainda em `7af1ed2`. O checkout anterior e sua árvore de trabalho foram preservados. Não há arquivos no staging. Não foram alterados testes, assertions, regras de negócio, lockfiles, workflow E2E ou critérios de qualidade.

### Validação após a correção

| Comando/verificação | Resultado observado |
| --- | --- |
| npm ci --prefix backend | 490 pacotes; Prisma Client 5.22.0 gerado; lockfile preservado |
| npm ci --prefix e2e | 3 pacotes; apenas runner para autotestes sintéticos, sem E2E da aplicação |
| npm run test:management:validate | Código 0; inventário de 95 testes, 0 em quarentena |
| npm run test:management:selftest | Código 0; 6/6 aprovados, 0 falhas/ignorados |
| npm run test:unit | Código 0; frontend 8/8 e backend 26/26 |
| npm run test:api | Código 0; API 54/54; total unitários/API = 88 |
| npm run test:review | Código 0; Markdown/JSON gerados, 21 achados para revisão humana |
| node --check | 14 arquivos JS/CJS/MJS da implementação verificados, incluindo ambas as configurações Jest |
| YAML | Os quatro workflows novos/modificados da implementação foram carregados com js-yaml sem erro |
| Artifacts locais | resultados/unit-frontend.xml, resultados/unit-backend.xml e resultados/api.xml gerados e não vazios; JSON/logs por tentativa em resultados/gestao/normal/ |
| Quality gate | Autotestes isolados confirmam falha normal = código 1 nos três frameworks, falha inicial preservada após retry e ausência de execução esperada = código 1 |
| git diff --check | Código 0 |

Jest local 29.7.0; Playwright local 1.64.1. O código executado corrigido tem sourceDigest `19848a6a33308a19690d50a37b9cf60cafe62583cc20be5b452b4374b3fa062f`. A reprodução anterior com erro foi mantida em resultados/gestao e separada por digest; não foi apagada nem convertida em aprovação. Por isso o relatório inclui também uma ocorrência histórica de erro de runner, além dos 88 testes aprovados no contexto corrigido.

Os 21 achados não são 21 testes reprovados: incluem sete E2E sem evidência **local compatível com este contexto** e sinais para revisão humana. A evidência remota do smoke abaixo é reportada separadamente; não foi importada como execução local nem usada para aprovar os outros quatro cenários.

Logs completos consultados e validações estão em `outputs/`, fora do repositório: `unit-api-pr25-job-completo.log`, `unit-api-push-job-completo.log`, `e2e-smoke-pr25-job-completo.log`, `pr25-reproducao-antes.log`, `pr25-test-*.log`, `pr25-sintaxe-workflows.log` e `pr25-validacao-resultados.json`. Não incluir esses logs, caches, node_modules ou segredos no commit.

### E2E smoke: leitura da execução remota existente

[Job 135183900886](https://github.com/kaykyDias04/SOS_Cidade_5P/actions/runs/44412449914/job/135183900886?pr=25), no merge de teste `e45dc80` que contém `7af1ed2`: **3 executados, 3 aprovados, 0 reprovados; nenhuma retentativa registrada**. O log registra `Running 3 tests using 1 worker` e `3 passed (6.4s)`:

1. Cidadão se cadastra, registra denúncia e a encontra em Minhas Denúncias.
2. Gestor faz login e acessa o Dashboard Interativo.
3. Denunciante não consegue acessar a rota do gestor.

Artifacts publicados: [gestao-quarentena / 14477532560](https://github.com/kaykyDias04/SOS_Cidade_5P/actions/runs/44412449914/artifacts/14477532560) e [resultados-testes / 14477692402](https://github.com/kaykyDias04/SOS_Cidade_5P/actions/runs/44412449914/artifacts/14477692402). O workflow preservado inclui resultados, logs da stack e relatório HTML Playwright. Não houve execução E2E real nesta investigação. O resultado aprovado refere-se à versão anterior; uma futura alteração do PR terá seus próprios checks.

### Pendências e conclusão limitada

A causa das duas falhas foi identificada, reproduzida e corrigida localmente. **Os dois checks unit-api remotos continuam falhos no commit 7af1ed2; não existe ainda execução do Actions validando esta correção.** Após revisão e autorização do usuário, um novo commit e push na mesma branch poderão atualizar o PR #25; somente a nova execução de push e pull_request confirmará o resultado no Ubuntu. Não reexecutar o commit antigo como se contivesse a correção. Manter sem merge até os checks exigidos e a validação E2E pelo responsável. Nenhum teste foi desativado e nenhum continue-on-error foi acrescentado; o existente segue restrito à quarentena.

Source Control local aberto no VS Code. Limite da interface: o editor está em Restricted Mode e informa que os provedores de controle de versão estão desabilitados. A confiança da pasta e as configurações de segurança não foram alteradas. A revisão também está disponível no diff exportado e neste documento; a lista real foi conferida com `git status --short` e o staging está vazio.
