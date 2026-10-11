# Aplicação do plano de governança v3 — 11/10/2026

Registro do que foi aplicado de `DOOHPLAY_Governanca_Agentes_Plano_v3.md`, do
que ficou de fora e do que ainda não foi verificado. Etiquetas conforme a seção
4 do plano.

## Aplicado

### Passo 1 — Restrições técnicas

- **FATO:** criado `.claude/settings.json` (versionado) com regras de negar,
  perguntar e liberar. Cobre Supabase, Render, navegador, git e shell (Bash e
  PowerShell).
- **FATO:** as 16 ferramentas negadas do Render e do Supabase deixaram de
  aparecer na sessão em que a regra foi aplicada. É a evidência de que o
  bloqueio por nome de ferramenta funciona.
- **FATO:** removidas dos `settings.local.json` as liberações persistentes de
  push, `git *`, SQL de produção, `prisma`, `curl`, `node`, leitura livre de
  arquivo, encerramento de processo e os comandos `psql` com senha em texto:
  15 entradas em `dashboard-web-prod` (139 → 124), 17 em `dashboard-web`
  (147 → 130) e 15 em `dashboard-web\doohplay-demo` (139 → 124). Cópia dos
  três arquivos originais em
  `C:\Users\Streaming-Radio\Documents\DOOHPLAY-backups\2026-10-11_settings-local\`.
- **FATO:** `settings.local.json` saiu do controle de versão e entrou no
  `.gitignore`. O histórico do git ainda guarda as versões antigas, com senhas
  de banco **local** em texto (não são credenciais de produção).
- **FATO:** o mesmo `settings.json` foi copiado para `C:\DOOHPLAY\dashboard-web`
  (fora do git de lá), porque regras de uma pasta não valem para sessão aberta
  em outra.

O que cada regra consegue está na tabela 5.1 do plano (BLOQUEIO, FILTRO ou
PROCEDIMENTO). Resumo do que **não** é bloqueio:

- **FILTRO:** push, comandos destrutivos e leitura de `.env` pelo shell são
  reconhecidos pelo texto do comando. A documentação do Claude Code confirma
  que `git push *` não pega `git -C <pasta> push`; por isso existe também
  `git * push *`. Outra forma de escrever o comando pode escapar.
- **PROCEDIMENTO:** contagem antes de SQL destrutivo, não enviar mensagem a
  cliente, não executar cobrança, revisor não editar código, designer e
  produto escreverem só nas próprias pastas.

### Passo 2 — revisor-agent

- **FATO:** criado `.claude/agents/revisor-agent.md` (Read, Grep, Glob, Bash;
  sem Edit e sem Write) e `MODELO_PEDIDO_DE_REVISAO.md`.

### Passo 5 — produto-agent e ajuste dos cinco

- **FATO:** criado `produto-agent.md`.
- **FATO:** `financeiro-agent` renomeado para `finops-agent`, sem `execute_sql`
  e sem `get_cost` (este não existe entre as ferramentas conectadas).
  Cobrança de clientes saiu do escopo dele.
- **FATO:** `arquiteto`, `codigo`, `docs-produto` e `designer` atualizados:
  Documento-Mestre do repositório como fonte, os dois clientes, etiquetas de
  informação, e as regras da seção 8. No `codigo-agent`, a regra de branch foi
  trocada por "commit local permitido; push só com confirmação".

### Passo 6 — Normalização de testes

- **FATO:** a regra da seção 5.5 foi registrada no `CLAUDE.md` e no
  `codigo-agent`. Nenhum teste precisou mudar: os 146 testes usam dados
  simulados.

## Não aplicado, de propósito

- **Passo 3 (remover `?secret=`):** é mudança de código em cerca de 40 rotas,
  com revisão pelo `revisor-agent`. Agentes novos só carregam ao abrir uma
  sessão, e a sessão desta aplicação foi aberta em outra pasta. Fica para uma
  sessão nova aberta em `C:\DOOHPLAY\dashboard-web-prod`.
- **Passo 4 (troca do `ADMIN_SECRET`):** é do fundador, no painel do Render.
  Não depende do Passo 3.
- **Configuração de usuário** (`C:\Users\Streaming-Radio\.claude\settings.json`):
  não foi alterada. **PROPOR:** repetir lá o bloco de negar/perguntar, para
  valer em qualquer pasta.
- **Agentes de gatilho** (qa, seguranca, financeiro-negocio, operacoes-player):
  não criados; entram quando a condição acontecer.

## Não verificado

- **FATO (testado em 11/10/2026):** `git push --dry-run` abriu a caixa de
  confirmação nas duas ferramentas, PowerShell e Bash (confirmado pelo
  fundador). O teste rodou numa sessão aberta em `C:\DOOHPLAY\dashboard-web`,
  ou seja, exercitou a cópia idêntica do arquivo; falta repetir numa sessão
  aberta em `dashboard-web-prod`.
- **FATO:** brecha encontrada e corrigida no mesmo dia: `git * push *` não
  pegava `git -C <pasta> push` sem argumentos. Acrescentado `git * push`.
  Esta forma não foi exercitada.
- **HIPÓTESE:** os demais padrões de shell (`Remove-Item *`, `git reset *`,
  `prisma db push *` etc.) seguem a sintaxe documentada, mas não foram
  exercitados.
- **Não testado, de propósito:** o deny do Render. Se a regra falhasse, o
  teste dispararia um deploy real. A conferência é pela lista do
  `/permissions`; como evidência indireta, as ferramentas negadas deixaram de
  aparecer na sessão.
- **HIPÓTESE:** a regra `mcp__claude-in-chrome` em "perguntar" cobre todas as
  ferramentas do navegador. Não testada.
- **DÚVIDA:** plano atual do Supabase (pago ou Free). Registrada no
  `finops-agent`.

## Pendências

- Unificar as cópias dos agentes: `dashboard-web\.claude\agents\` ainda tem 3
  agentes na versão de agosto, e `dashboard-web\doohplay-demo` tem os 5 de
  setembro. A fonte é `dashboard-web-prod\.claude\agents\`.
- Abrir as sessões do Claude Code em `C:\DOOHPLAY\dashboard-web-prod`.
- Versões 1 e 2 do plano: não encontradas em arquivo.
- Fora do mínimo: hook que leia o texto do SQL e barre `DROP`, `DELETE` e
  `TRUNCATE` transformaria a linha "SQL destrutivo" em bloqueio de verdade.
