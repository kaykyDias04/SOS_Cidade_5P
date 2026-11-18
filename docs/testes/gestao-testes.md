# Gestão dos testes

Complemento da [política de manutenção](../tas.md) e do [plano de testes](../../plano-de-testes-equipe8.md). Abrange Jest 29 (backend e API), `node:test` no frontend e Playwright no E2E. Não muda regras de negócio, não remove testes e não substitui os checks obrigatórios.

## 1. Identificar e tratar instabilidade

O autor do push faz a triagem; na regressão agendada, o triador da semana. Prazo: um dia útil. Marcos responde pela automação e João Pedro pela pipeline, conforme `docs/tas.md`. Os nomes devem ser confirmados no rodízio semanal.

1. Guardar SHA, nome/ID, arquivo, erros, duração e todas as tentativas. Baixar `resultados-testes` e, quando houver, `gestao-quarentena` no Actions.
2. Reproduzir sem alterar código/dados. `npm run test:diagnostic -- api diagnostic` repete a suíte três vezes. Também aceita `backend`, `frontend` ou `e2e` (este exige stack). Cada rodada usa um novo processo; estado persistido no banco precisa de massa isolada.
3. Uma falha isolada é **investigação**, não flaky. Falhar em todas as amostras é **falha reproduzível**; passar e falhar produz **suspeita intermitente**, sem alterar tags automaticamente. Erros do runner/carregamento são candidatos a ambiente; timeout sozinho não distingue produto de infraestrutura.
4. Comparar com histórico da mesma revisão e ambiente. Histórico entre SHAs diferentes sinaliza investigação, mas não comprova intermitência. Reproduzir no mesmo SHA antes da decisão.
5. Investigar timing, corrida, massa compartilhada, rede externa, seleção posicional de elementos, relógio real e exceções ignoradas. Preferir `expect(...).toBeVisible()`, espera por resposta/condição e dados únicos. Não acrescentar esperas fixas nem enfraquecer asserts.
6. Corrigir a causa e reexecutar. Se houver defeito do produto, mantê-lo visível e bloqueante. A dúvida é tratada como defeito do produto até esclarecimento.

O wrapper retorna código 1 se **qualquer** tentativa falhar, mesmo que outra passe. O relatório mantém `single-failure-investigate`, `reproducible-failure`, `intermittent-suspect`, `environment-investigation`, `stable-observed` ou `not-executed`. Essas categorias são sinais para triagem, não diagnósticos definitivos.

### Achados da inspeção inicial

| Evidência no código | Risco | Ação |
| --- | --- | --- |
| `denunciante-fluxo-completo.spec.ts` usa `describe.serial` e conta criada no primeiro caso | Casos seguintes dependem do cadastro; rodadas precisam repetir a jornada inteira | Preservar execução serial e massa isolada; não colocar apenas um dependente em quarentena |
| E-mails E2E usam `Date.now()` | Colisões entre processos ou ambientes concorrentes são possíveis | Revisar caso haja evidência; nenhuma colisão foi reproduzida nesta entrega |
| Há `.catch(() => {})` ao fechar modal na jornada modular | Erro pode ficar sem contexto | Revisar oráculo e fechamento quando a stack estiver disponível; não declarar defeito comprovado |
| API usa mock Prisma/Redis reiniciado por `beforeEach` | Não demonstra integração real com serviços | Preservar E2E contra stack real |
| `forceExit` era usado na configuração de API | Poderia ocultar handles abertos | Removido após executar os 54 casos com `--detectOpenHandles --forceExit=false` e encerramento natural, sem handle reportado |

Nenhum teste de produção foi classificado como flaky ou removido. O registro inicial de quarentena é vazio.

## 2. Quarentena automatizada

Convenção: adicionar `@flaky` como palavra ao **título literal de um teste individual**, incluindo ID estável. Jest usa `testNamePattern`, Playwright usa `grep`/`grepInvert`, e `node:test` usa filtros de nome. Não marcar um `describe`; não usar tag em comentários como mecanismo de seleção. Não usar `test.skip` para quarentena. Testes serialmente dependentes devem primeiro ser isolados.

Antes de editar a tag, o responsável por QA e outro integrante revisam a evidência de execuções repetidas e descartam defeito reproduzível. A aprovação registra aceitação temporária do risco; nunca é concedida pelo script. Testes em `criticalIds` e arquivos em `criticalFiles` são rejeitados pelo validador: manter ativos e corrigir a causa.

Criar uma entrada em `scripts/test-management/quarantine.json` no mesmo conjunto de alterações da tag. Exemplo **ilustrativo**, não cadastrado em produção:

```json
{
  "id": "CT-DEMO-01",
  "file": "tests/exemplo.test.ts",
  "title": "CT-DEMO-01: exemplo isolado @flaky",
  "reason": "Variação de timing confirmada após investigação",
  "owner": "Nome do integrante responsável",
  "approvedBy": "Outro integrante que revisou as evidências",
  "since": "2026-11-18",
  "evidence": "Link da issue e de tentativas no mesmo SHA",
  "exitCondition": "Corrigir causa e comprovar 10 execuções consecutivas sem falha"
}
```

`npm run test:management:validate` usa a AST TypeScript para conferir os títulos literais, tag/registro em ambos os sentidos, metadados obrigatórios, duplicidades e proteção dos casos críticos. Títulos dinâmicos e `test.each` não fazem parte desta convenção: adaptar primeiro para IDs/títulos literais auditáveis. O validador não verifica se a aprovação escrita no JSON é autêntica; isso cabe à revisão humana.

### Tentativas e relatórios

| Suíte | Execução normal | Quarentena |
| --- | --- | --- |
| Jest backend/API | Sem retry; exclui `@flaky` | Reexecuta a suíte filtrada em novos processos, 1 + `QUARANTINE_RETRIES` vezes |
| `node:test` frontend | Sem retry; exclui `@flaky` | Repete a suíte filtrada em novos processos, preservando todas as tentativas |
| Playwright | Sem retry; exclui `@flaky`, inclusive smoke | Retry nativo por teste: falha inicial e tentativas seguintes registradas pelo reporter |

O padrão é 2 novas tentativas; faixa aceita: 0 a 20. Jest e frontend repetem todos os casos em quarentena, mesmo se já passaram, para observar estabilidade. Falhas normais nunca são toleradas. A execução local da quarentena também retorna falha ao detectar qualquer tentativa falha; somente a etapa **Testes em quarentena (falhas isoladas)** dos workflows tem `continue-on-error: true`.

- Normais: JSON e logs em `resultados/gestao/<modo>/<suíte>/<execução>/`. Cada `summary.json` inclui SHA, horário, tentativa, ID quando disponível, nome, arquivo, status, duração e erro.
- JUnit normal mantém os contratos anteriores `resultados/unit-frontend.xml`, `unit-backend.xml`, `api.xml`, `e2e.xml`. Rodadas de diagnóstico sobrescrevem o JUnit de conveniência; os JSON/logs de **cada** rodada permanecem.
- Quarentena: JSON, logs e JUnit em `relatorios/quarentena/`, separados dos XML normais para não contaminar métricas e issues de falha da suíte principal.
- E2E: HTML, screenshots, vídeo e traces de falhas; na quarentena ficam dentro da pasta da tentativa. O relatório HTML normal continua em `e2e/playwright-report/`.
- Quarentena vazia: gera resumo explícito, sem inventar testes executados.
- Antes de aceitar uma execução de quarentena, o wrapper cruza inventário e `quarantine.json` para obter todos os casos esperados da suíte. Em cada rodada, exige resultado da tentativa inicial com ID, arquivo e título correspondentes. Caso ausente, ignorado ou sem status válido gera código 1 e aparece em `attempts[].quarantineEvidence.missing`; o resumo conserva `expectedTests`. Uma suíte que retorna 0 sem executar os casos esperados não aprova a quarentena. Falhas iniciais continuam preservadas após retry.
- Autovalidação sintética: `relatorios/selftest/`; nunca contabilizada como resultado do produto ou no relatório semanal.

Não usar `jest.retryTimes` nos testes normais: um sucesso posterior não pode esconder a falha inicial. Ler sempre o resumo completo em vez de apenas a última linha verde do framework.

### Saída da quarentena

Corrigir a causa e cadastrar `exitVerification` na entrada: `commit` (SHA completo de 40 caracteres), `sourceDigest`, `environmentKey` e `fixedAt` (instante ISO da correção). Os fingerprints são copiados de uma execução corrigida e confirmados na revisão. O relatório só aponta candidato após **10 execuções distintas consecutivas**, posteriores à correção, com o mesmo SHA, código executável e ambiente, todas iniciadas com sucesso e sem qualquer tentativa falha. Uma execução com três tentativas bem-sucedidas conta como uma amostra; sucesso apenas no retry não conta. Execução sem resultado do caso interrompe a sequência. Troca de SHA ou ambiente exige uma nova série.

QA e outro integrante verificam a causa e aprovam a retirada de **tag e registro juntos**. Reexecutar a suíte normal, que volta a bloquear a pipeline. Nenhum script retira testes automaticamente, nem autentica a identidade escrita no campo de aprovação.

### Revisão atual, ambiente e auditoria

Os resumos novos registram SHA, `sourceDigest` e `environmentKey`. O digest considera arquivos de código, testes, configs, dependências e workflows, normalizando finais de linha Windows/Linux. Documentação, artefatos ignorados e metadados de aprovação de `quarantine.json` não entram no hash; as tags nos próprios testes entram. Isso permite distinguir alterações locais ainda sem commit e evita autorreferência ao cadastrar `exitVerification`.

O ambiente registra plataforma, arquitetura, versão do Node e dos frameworks, mais `TEST_ENVIRONMENT_ID` quando fornecido. O perfil deve identificar a infraestrutura de teste e suas versões, sem segredos. Não misturar ambientes diferentes para alegar estabilidade. O revisor continua responsável por confirmar equivalência dos serviços e dados; o nome do perfil não prova isso sozinho.

Métricas são agrupadas por SHA + digest + ambiente. Falha no código antigo e sucesso após correção aparecem em grupos distintos, sem virar falso flaky. Cobertura crítica exige a execução mais recente do caso no código e ambiente atuais, dentro de **24 horas**, sem falha em nenhuma tentativa. Sucesso antigo, legado sem fingerprint, caso desativado ou sucesso apenas após retry não comprova cobertura atual. O limite está em `evidenceMaxAgeHours`.

Os quatro registros antigos sem relatório são preservados em `historicalRunnerErrors`, com horário e caminho da evidência, separados dos problemas atuais. Referem-se às primeiras configurações Jest com erro de sintaxe já corrigidas, documentadas nas evidências. Não são novos defeitos do produto. Evidências legadas sem contexto conhecido ficam isoladas por execução e não aprovam cobertura nem saída de quarentena.

O frontend agora usa um único consumidor de `TestsStream`, que produz console, JSON e JUnit. Isso corrige `MaxListenersExceededWarning` causado pela combinação anterior de três reporters, sem alterar limites de listeners ou esconder warnings. O uso de URL `file://` mantém compatibilidade do reporter ESM com Windows.

Na cobertura, `no-recent-evidence` indica ausência de evidência recente compatível e não reprovação. `failed` exige resultado real de falha; `execution-error` identifica erro do runner/carregamento; `not-executed` identifica caso sem execução válida; `disabled` sinaliza desativação. Os achados Markdown e o campo JSON `evidenceStatus` mantêm essa distinção.

## 3. Revisão periódica

Revisão semanal: segunda-feira às 09:00 de Brasília (12:00 UTC). Revisão completa: no encerramento de cada sprint, execução manual de `revisao-testes` escolhendo `sprint`. A equipe informa as datas da sprint; não se presume uma duração fixa. A automação coleta os mesmos dados nas duas; a revisão de sprint também exige análise humana integral de cobertura e vigência dos requisitos.

Os limiares estão em `scripts/test-management/policy.json` e podem ser alterados por revisão:

| Critério | Padrão | Responsável e ação |
| --- | --- | --- |
| Frequência de falhas | ≥ 5%, mínimo 3 observações | Triador: investigar em 1 dia útil; casos críticos têm prioridade alta |
| Instabilidade | Passou e falhou no histórico disponível | Marcos/QA: reproduzir no mesmo SHA, identificar causa antes de quarentena |
| Duração | Média > 1.000 ms ou máximo > 10.000 ms | Dono da suíte: otimizar setup, dados e espera por condição |
| Duplicação | ≥ 8 linhas normalizadas iguais em arquivos diferentes | Dono da suíte: avaliar helper; heurística não prova redundância de cobertura |
| Rastreabilidade | Arquivo sem referência no mapa de HU/CA | QA: completar referência ou explicitar pressuposto/detalhe técnico |
| Sem manutenção recente | Última alteração há > 90 dias | Dono do requisito: confirmar vigência; idade não autoriza remoção |
| Quarentena longa | ≥ 14 dias | QA e responsável: priorizar causa e reavaliar risco aceito |
| Cobertura crítica | ID ausente/desativado ou sem evidência da revisão/ambiente atuais em até 24 h; última execução do caso com falha | QA: executar/restaurar cobertura; presença de arquivo e sucesso antigo não bastam |
| Obsoleto | Requisito retirado ou cobertura equivalente demonstrada | Product owner + QA: decisão humana com checklist de remoção |

`npm run test:review` gera `relatorios/gestao/review.md` e `review.json` com inventário, média/máximo, frequência, categorias, rastreabilidade, achados e ações propostas. `traceability.json` referencia as seções 4.5/8.2 do plano por arquivo: não inventa vínculo de HU para criptografia, protocolo, cache ou contrato técnico. Dashboard/mapa continuam sujeitos à verificação manual prevista no plano; a transição inválida R2-CT-53 a 55 continua pendente de regra no backend.

O workflow busca até 10 execuções concluídas por workflow na branch padrão com GitHub CLI e `actions: read`. Baixa somente os artefatos de resultados e gestão ainda retidos. Não executa código dos artefatos. PRs não entram no histórico automático. `history-availability.json` registra artefatos indisponíveis; ausência de dados não significa estabilidade. Workflows anteriores a esta implementação só têm JUnit e não fornecem JSON por tentativa: não serão convertidos em evidências inventadas. Retenção de resultados: 30 dias; relatório semanal: 90 dias.

### Modelo de relatório humano

```text
Tipo: semanal / sprint; período; data; responsável; revisor:
SHAs/execuções e links dos artefatos; amostras indisponíveis:
Falhas reproduzíveis, ambiente e suspeitas intermitentes (IDs/arquivos):
Média/máximo; duplicação; rastreabilidade/HU/CA; testes obsoletos:
Quarentena (idade, dono, causa, risco aceito e plano de saída):
Cobertura dos fluxos críticos e validações manuais pendentes:
Ação por achado: correção / otimização / manutenção / proposta de remoção:
Responsável, issue, prioridade, prazo e evidência para encerrar:
Decisões e aprovações humanas (nomes/data/justificativa):
```

## 4. Política de remoção

Nenhuma remoção existente foi executada nesta entrega. Não remover teste que está falhando para tornar o CI verde. Critérios elegíveis: requisito formalmente retirado, implementação extinta ou redundância comprovada com cobertura equivalente. Teste antigo, lento ou em quarentena não é automaticamente removível.

Protegidos: autenticação/sessão, autorização, criptografia/privacidade, cadastro, registro, acompanhamento e alteração de denúncias; IDs e arquivos enumerados na política, além de qualquer caso classificado como crítico pela equipe. **Todos os 7 E2E estão protegidos**, incluindo os 4 de `denunciante-fluxo-completo.spec.ts`. `criticalTests` conserva os títulos esperados, impedindo que a presença de um arquivo com um caso excluído seja suficiente para passar na validação. Desativação herdada de `describe.skip`/`only` também é detectada. Quarentena em grupo serial é recusada: corrigir primeiro o isolamento.

Para retirar ou substituir um protegido, demonstrar cobertura equivalente ativa e obter aprovação explícita do usuário/dono do requisito e revisão de outro integrante **antes** da exclusão. O validador bloqueia ausência/desativação dos casos protegidos; uma alteração da própria lista protegida precisa da mesma revisão. O relatório não executa remoções e não substitui revisão de código.

### Checklist obrigatório da solicitação

- [ ] Solicitante, data, issue e justificativa técnica; IDs, arquivos e HU/CA afetados.
- [ ] Requisito obsoleto comprovado ou comparação de asserts/cenários da cobertura equivalente.
- [ ] Nível de teste, fluxos e combinações que deixam de ser verificados.
- [ ] Riscos residuais, probabilidade/impacto, mitigação e pessoa que aceita cada risco.
- [ ] Cobertura que permanece: IDs/arquivos, execução verde e links das evidências.
- [ ] Revisão por outro integrante (nome/data), distinto do solicitante.
- [ ] Aprovação explícita do usuário/dono do requisito; para críticos, participação de QA.
- [ ] Plano, mapa de rastreabilidade e registro de quarentena atualizados junto da alteração.
- [ ] Validar suíte normal, smoke, regressão aplicável e `git diff --check` após aprovação.
- [ ] Guardar referência do diff/commit futuro e plano de restauração.

Restauração: o aprovador registra a revisão anterior, os arquivos e o motivo. Reintroduzir os casos a partir dessa referência em uma alteração revisável, restaurar mapa HU/CA e executar as suítes aplicáveis; não reescrever o histórico remoto nem restaurar snapshots de banco. Se a remoção ainda não foi commitada, recuperar somente os trechos aprovados do diff para não sobrescrever trabalho de terceiros.

Modelo: `Solicitante | Aprovador | Data | Testes/HU/CA | Motivo | Evidência equivalente | Riscos aceitos | Quem assume | Cobertura restante | Decisão`. Uma solicitação sem aprovação permanece pendente; nenhum script apaga testes.

## 5. Execução local e pipeline

Node 24, Git no PATH. Instalação: `npm ci --prefix backend` (inclui Prisma) e `npm ci --prefix e2e`. O frontend unitário usa módulos nativos e não precisa do build Next.js. Para E2E real, seguir `e2e/README.md` e `.github/actions/subir-stack/action.yml`, instalar Chromium, subir PostgreSQL/Redis isolados, migrations, seed, API em 8000 e frontend em 3000. Nunca apontar a suíte a banco de produção.

```bash
npm run test:management:validate
npm run test:unit
npm run test:api
npm run test:e2e:smoke
npm run test:e2e
npm run test:quarantine -- frontend backend api e2e
npm run test:diagnostic -- api diagnostic
npm run test:management:selftest
npm run test:review
git diff --check
```

PowerShell: `$env:QUARANTINE_RETRIES='3'`; Bash: `QUARANTINE_RETRIES=3 npm run test:quarantine`. Para diagnóstico: `DIAGNOSTIC_RUNS` (2 a 20). Esses controles não habilitam retry na suíte normal. A variável de repositório `QUARANTINE_RETRIES` controla só a etapa de quarentena do CI.

Os jobs e nomes `unit-api`, `e2e-smoke`, `regressao-completa` permanecem. Os comandos normais validam o registro antes de rodar, falham em qualquer erro e preservam seus JUnit. `unit-api` também executa a autovalidação sintética dos três frameworks, sem navegador ou banco. Depois das suítes normais, a quarentena roda separadamente; seus erros são tolerados apenas naquela etapa. Mesmo se testes falharem, a revisão e o upload usam `!cancelled()`. Issues automáticas e métricas existentes continuam recebendo somente os resultados normais.

`revisao-testes` é um workflow adicional, semanal/manual, sem escrita no repositório ou abertura de issues. O agendamento e a coleta remota só podem ser comprovados após aprovação, commit e execução no GitHub; nesta entrega nada foi publicado. Regras de proteção remotas não foram alteradas.

Referências dos mecanismos: [configuração Jest 29.7](https://jestjs.io/docs/29.7/configuration) e [configuração Playwright](https://playwright.dev/docs/test-configuration). Evidências da validação local serão registradas em `evidencias-validacao.md`; não confundir demonstrações sintéticas com E2E real aprovado.

