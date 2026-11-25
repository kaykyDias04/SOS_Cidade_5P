# Guia de integração para SOS_Cidade_5P

Este guia orienta a responsável pelo repositório do copy a propor as mudanças no projeto de Kayky sem sobrescrever o trabalho que já está na `main`.

Para uma proposta mais detalhada de PRs e commits separados, consulte [mobile/COMMITS-PARA-KAYKY.md](COMMITS-PARA-KAYKY.md).

## De onde trazer as mudanças

As referências verificadas em 24/11/2026 são:

- Destino: [kaykyDias04/SOS_Cidade_5P](https://github.com/kaykyDias04/SOS_Cidade_5P), `main` no commit `57e7de0`.
- Origem completa da refatoração: [EllySantiago/SOS_Escola_5P.-copy](https://github.com/EllySantiago/SOS_Escola_5P.-copy), branch `refatoracao-07-labels-relatorios` no commit `e15af38`.
- Origem focada na suíte mobile: branch `suite-de-testes-mobile` no commit `1232f27`.

O `main` do copy está no commit `19ebc53` e não contém necessariamente os commits mais novos das branches de trabalho. Escolha **uma** branch de origem conforme o escopo; não faça merge das duas sem comparar os commits para evitar duplicar mudanças.

## Procedimento recomendado

Use um clone limpo do repositório de destino. No PowerShell:

```powershell
git clone https://github.com/kaykyDias04/SOS_Cidade_5P.git
Set-Location SOS_Cidade_5P
git switch main
git pull --ff-only origin main
git status --short
git remote add copy https://github.com/EllySantiago/SOS_Escola_5P.-copy.git
git fetch copy
git switch -c feat/integrar-refatoracoes-copy
git merge --no-ff --no-commit copy/refatoracao-07-labels-relatorios
```

Se o clone já tiver um remote chamado `copy`, confira-o com `git remote -v` e atualize-o com `git remote set-url copy https://github.com/EllySantiago/SOS_Escola_5P.-copy.git` em vez de adicionar outro.

Se a entrega for **somente** a suíte mobile, substitua a última referência do merge por `copy/suite-de-testes-mobile`. Não integre os dois branches por padrão.

## Antes de commitar

1. Resolva conflitos mantendo as mudanças mais recentes da `main` de Kayky. Em particular, preserve a máquina de estados de denúncias e os testes da PR #28; não permita que uma denúncia finalizada volte para um estado anterior.
2. Revise migrations, seed, consentimento e os formulários web. Não copie diretórios inteiros sobre o destino sem revisar o diff.
3. Confira o que será enviado:

   ```powershell
   git status --short
   git diff --check
   git diff --stat
   ```

4. Execute a suíte mobile e, se possível, as suítes integradas na raiz:

   ```powershell
   npm ci
   npm run test:unit:mobile
   npm run test:unit
   npm run test:api
   npm run test:e2e:smoke
   ```

   Os testes de API e E2E precisam dos serviços locais conforme a documentação do projeto. Se algum teste falhar, registre a falha; não a oculte nem remova o teste para concluir a integração.

5. Se a validação estiver adequada, registre e publique a branch:

   ```powershell
   git add -A
   git commit -m "feat: integra refatoracoes do app copy"
   git push -u origin feat/integrar-refatoracoes-copy
   ```

6. Abra um pull request de `feat/integrar-refatoracoes-copy` para `kaykyDias04/SOS_Cidade_5P:main`, descreva os conflitos resolvidos e anexe os resultados dos testes. Não faça push direto nem force push em `main`.

Se o Git indicar históricos sem ancestral comum, pare e peça revisão: não use `--allow-unrelated-histories` como atalho. A pasta de trabalho analisada para este documento não tem `.git`; os comandos devem ser executados em um clone real.

## O que está coberto nos testes mobile

Os 7 testes Jest exercitam validação de dados, conversão de erros HTTP, cliente HTTP, cache, armazenamento seguro, sessão e store de denúncias. Para rodar apenas essa suíte, `npm run test:unit:mobile` na raiz delega para `mobile`.

Essa cobertura é unitária. Os fluxos de interface nativa, smoke/E2E em emulador e workflow mobile continuam pendentes conforme o [backlog de testes mobile](testes/backlog-testes-mobile.md). Não interprete o sucesso do Jest como validação dos fluxos Android/iOS.

Para o resumo simples do que mudou em cada área, veja [docs/comparativo-kayky-copy.md](../docs/comparativo-kayky-copy.md).
