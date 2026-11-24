# Quality gate

## Eventos e suítes

| Evento | Workflow e job (nome exato do check) | Testes executados |
|---|---|---|
| Todo `push`, em qualquer branch | `unit-api.yml` - `unit-api` | Unitários frontend, backend e mobile; testes de API |
| Pull request direcionado à `main` | `unit-api.yml` - `unit-api`; `e2e-smoke.yml` - `e2e-smoke` | Unitários frontend, backend e mobile; testes de API; os três fluxos E2E `@smoke` |
| Diariamente às 06:00 UTC (03:00 em Brasília) | `regressao-completa.yml` - `regressao-completa` | Unitários, API, E2E completo e execução separada da quarentena `@flaky` |
| Manual, por **Run workflow** | `regressao-completa.yml` - `regressao-completa` | A mesma regressão completa |
| Futuro: PR para `main`, depois de habilitar o workflow | `mobile-smoke.yml` - `mobile-smoke` | Smoke mobile-web |

O workflow `mobile-smoke.yml` não existe neste checkout. Portanto, `mobile-smoke`
ainda não é um check executado nem pode ser selecionado na proteção da branch.
A suíte só deve ser adicionada como check obrigatório depois de o workflow/job
existir e completar 10 execuções verdes consecutivas.

## Checks obrigatórios na `main`

Configure estes checks pelo **nome do job**, exatamente como aparece no GitHub:

- `unit-api`
- `e2e-smoke`
- Mais tarde, `mobile-smoke`, somente após o workflow existir e passar 10 execuções consecutivas.

`regressao-completa` é uma verificação diária/manual, não um check necessário em
cada PR. Assim, a proteção de merge permanece rápida, enquanto a regressão ampla
detecta problemas de integração que os testes rápidos ou os três fluxos smoke não
cobrem.

`unit-api` roda em todo push para dar feedback contínuo e também em PRs para que
a proteção verifique a versão proposta. `e2e-smoke` roda em PRs para validar três
jornadas reais antes do merge, sem impor o custo e o tempo da suíte E2E completa.
Os workflows não têm filtros `paths`.

## Configuração manual da proteção da branch

Essa configuração é feita no GitHub; não é versionada nem pode ser alterada por
estes arquivos:

1. Abra **Settings → Branches** (ou **Settings → Rules → Rulesets**, conforme a interface do repositório).
2. Crie ou edite a regra/ruleset que corresponde à branch `main`.
3. Ative **Require a pull request before merging**.
4. Ative **Require status checks to pass before merging** e selecione `unit-api`
   e `e2e-smoke`. Se a busca não listar um check, execute o workflow ao menos uma
   vez e atualize a página.
5. Ative **Require branches to be up to date before merging** (strict checks).
6. Bloqueie force pushes para `main`.
7. Depois de o workflow mobile estar implementado e de haver 10 execuções verdes
   consecutivas, edite a regra e inclua também `mobile-smoke`.
8. Salve a regra/ruleset e confirme que se aplica à branch `main`.

## Como provar que o merge é bloqueado

Faça a demonstração em uma branch temporária e em um PR de teste, nunca
introduzindo o defeito na `main`:

1. Crie uma branch a partir da `main` e faça uma alteração temporária em um teste
   unitário para que uma asserção falhe deliberadamente.
2. Abra um PR dessa branch para `main` e aguarde o workflow `unit-api` terminar
   com falha.
3. Mostre no PR que o merge está bloqueado e que `unit-api` é o check obrigatório
   que falhou.
4. Tire uma captura de tela com o estado do PR e o check com falha visíveis e
   anexe-a à entrega para o professor.
5. Feche o PR de demonstração e descarte a branch temporária, ou reverta a
   alteração de teste antes de qualquer merge.

## Armadilha dos filtros de caminhos

Não adicione filtros `paths`/`paths-ignore` aos workflows que fornecem checks
obrigatórios. Se um filtro impedir o workflow de iniciar, o GitHub não recebe um
resultado de sucesso: o check obrigatório fica pendente e o PR pode permanecer
bloqueado. Os workflows atuais não usam esses filtros.
