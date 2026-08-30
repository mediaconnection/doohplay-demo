# STATUS_PROJETO.md — DOOHPLAY (doohplay-demo)

_Última atualização: 2026-08-30_

## Visão geral

DOOHPLAY é uma plataforma de transparência e auditoria para publicidade DOOH (Digital Out-Of-Home). Cada impressão de anúncio passa por um pipeline de prova criptográfica: eventos são gravados em um ledger imutável, agrupados em blocos com Merkle tree, assinados com RSA e ancorados na blockchain Polygon. Anunciantes e auditores podem verificar publicamente qualquer impressão via hash.

## Stack técnica

- **Front-end / API**: Next.js (App Router), TypeScript, Tailwind
- **Banco de dados**: PostgreSQL via `pg.Pool` (queries SQL diretas), Prisma (só o model `PdfCertification`), Supabase (auth/realtime)
- **Fila**: Redis + BullMQ (`event-queue`, job `write-event`), worker separado (`npm run worker`)
- **Blockchain**: contrato `DOOHPLAYAnchor` (Solidity/Hardhat) na Polygon, ancorando Merkle roots
- **Assinatura digital**: RSA-SHA256 (`keys/private.pem`, não versionado) + certificado A1 (`.pfx`)

## Repositório

- **Remote**: `origin` → `https://github.com/mediaconnection/doohplay-demo.git`
- **Branch**: `master`, sincronizado com `origin/master`
- **Arquivos não rastreados** (untracked, pendentes de decisão sobre commit):
  - `DOOHPLAY_Etapa1_Isolamento_Entregas.docx`
  - `DOOHPLAY_Plano_Separacao_Fronts.docx`
  - `crypto/CLAUDE.md`
  - `crypto/DOOHPLAY_Etapa1_PR_Template.md`
  - `crypto/pull_request_template.md`
  - `pull_request_template.md`

## ⚠️ Achado de segurança crítico — certificado A1 exposto no Git

- `certificado-a1.pfx` (raiz) está **rastreado pelo git**, commitado em `89a5ad9` ("feat: player enterprise, install page, motor financeiro, onboarding").
- `keys/certificado-a1-final.pfx` e `keys/certificado-a1-node.pfx` também estão **rastreados**, commitados em `0aaf5d3` ("feat: DOOHPLAY dashboard-web standalone").
- O `.gitignore` cobre `keys/private.pem` e `*.key`/`*.crt`, mas **não cobre `*.pfx`** — brecha que permitiu esses commits.
- Um `.pfx` é um contêiner PKCS#12 que normalmente contém a chave privada do certificado A1. Se este repositório já foi enviado ao GitHub (`origin`), a chave privada pode estar exposta lá também — remover os arquivos agora **não apaga o histórico**.
- **Achado técnico adicional**: o conteúdo do arquivo não é o binário PKCS#12 puro, e sim **texto Base64** (inicia com `MIIlEAIBAz...`) salvo com terminadores de linha CRLF. Isso foi confirmado decodificando o arquivo (`base64 -d` → DER válido, tag ASN.1 `30 82 25 10` correta).
- **Certificado extraído e confirmado (2026-08-24)** — é um certificado **real e atualmente válido**, não um placeholder de teste:
  - **Titular (subject)**: `C=BR, O=ICP-Brasil, ST=SP, L=Sao Paulo, OU=VideoConferencia, OU=55797018000158, OU=Secretaria da Receita Federal do Brasil - RFB, OU=RFB e-CNPJ A1, CN=GILSON NASCIMENTO PIMENTEL AGENCIA DE PUBLICIDADE:40794652000160`
  - **Emissor (issuer)**: `C=BR, O=ICP-Brasil, OU=Secretaria da Receita Federal do Brasil - RFB, CN=AC Certisign RFB G5`
  - **Validade**: `notBefore=Feb 3 21:43:52 2026 GMT` até `notAfter=Feb 3 21:43:52 2027 GMT` (válido no momento desta análise, ~5 meses restantes)
  - É um e-CNPJ A1 do CNPJ `40.794.652/0001-60`, com validade jurídica para assinatura digital.

### Resolvido em 2026-08-24
- ✅ `.gitignore` atualizado (`*.pfx`, `*.p12`) — commitado e no `origin/master`.
- ✅ Histórico completo reescrito com `git filter-repo` (rodado via WSL, o filter-repo trava no Windows nativo por causa de um path legado com barra invertida em `app/api/studio/studio/ai-generate\route.ts`) — os 3 arquivos `.pfx` removidos de **todos** os commits, em **todas as branches** (`master`, `feature/dtv-ready-mvp`, `figma-ui`).
- ✅ Force-push das 3 branches feito pelo usuário diretamente no terminal (bloqueado no fluxo automatizado pelo classificador de segurança do Claude Code — ação intencional).
- ✅ Confirmado no `origin/master` pós-push: nenhuma referência a `certificado-a1.pfx` ou `keys/certificado-a1-*.pfx` em lugar nenhum do histórico.
- ⚠️ **Durante o processo, um Personal Access Token do GitHub foi colado por engano no chat/transcript** (deveria ter sido digitado só no terminal). Foi orientado a revogá-lo imediatamente e gerar um novo — **confirmar que isso foi feito**.

- ✅ **Certificado A1 revogado junto à Certisign em 2026-08-24.** Novo certificado solicitado, com liberação prevista para 2026-08-25.
- ✅ **Personal Access Token do GitHub** (exposto por engano no chat durante o force-push) **revogado e substituído por um novo**, confirmado em 2026-08-24.
- ✅ **Nenhum PR aberto** no repositório (confirmado via API pública do GitHub em 2026-08-24) — nada quebrou com a reescrita do histórico.

- ✅ **Novo certificado A1 emitido em 2026-08-25** (substituindo o revogado).

### Ainda pendente
1. Instalar o novo certificado A1 no pipeline de assinatura (`keys/`, variáveis de ambiente relevantes) e validar uma assinatura de teste ponta a ponta.
2. Avisar qualquer colaborador com clone do repositório: os hashes de commit de `master`, `feature/dtv-ready-mvp` e `figma-ui` mudaram todos — precisam re-clonar ou rodar `git reset --hard origin/<branch>` (nunca `git pull` normal, vai gerar conflito gigante). Rascunho de aviso disponível no histórico da sessão de 2026-08-24.

## ⚠️ Achado — pipeline de prova via `evidence`/`buildBlock.ts` nunca foi usado em produção (2026-08-26)

Investigação completa (código + banco real via Supabase MCP + logs/config reais do Render via Render MCP) confirmou que o pipeline descrito originalmente no `CLAUDE.md` (`GET /api/cron/proof-pipeline` → `runProofPipeline.ts` → `buildBlock.ts` → tabela `evidence`) **nunca rodou de verdade em produção**. O pipeline real é outro, completamente separado.

**1) Código morto mantido e marcado como `@deprecated`** (sem remoção, só documentação):
- `lib/proof/ledger/buildBlock.ts` — lê pendências da tabela `evidence`, que só recebeu 35 linhas na vida toda, parada desde 2026-06-01.
- `lib/proof/scheduler/runProofPipeline.ts` — orquestra `buildBlock()` + `generateCertificatesForBlock()` (essa segunda parte também dependia do stub `signPkcs7`, já corrigido separadamente, mas a tabela `impressions.block_height` nunca é preenchida por nenhum código, então nunca teria dados de qualquer forma).
- `app/api/protocol/evidence/route.ts` — única rota que já escreveu na tabela `evidence`; parada desde 2026-06-01.

Cada um desses 3 arquivos agora tem um comentário `@deprecated` no topo explicando o motivo e apontando pro pipeline real.

**2) Confirmado: não existe cron chamando `/api/cron/proof-pipeline`.** Verificado em duas fontes independentes:
- `render.yaml` (versionado): só define os crons `monthly-report` e `trial-warning` — nenhum aponta pra essa rota.
- Conta real do Render (via API, não só o arquivo versionado): existe apenas **1 cron job configurado** (`doohplay-monthly-report`), e ele chama `/api/reports/whatsapp`, não `/api/cron/proof-pipeline`.
- Logs do serviço web (`doohplay-demo`) não têm **nenhuma requisição registrada** pra `/api/cron/proof-pipeline` — a rota nunca foi chamada, nem manualmente.

**O pipeline real de produção**: `runProofChainAggregator()` em `lib/proof/aggregator/proofChainAggregator.ts`, agendado a cada 5 minutos dentro de `worker.ts` (serviço `doohplay-workers` no Render, via `scheduleAggregatorJob()`). Esse sim processou eventos reais de `event_chain` e criou blocos/certificações/ancoragens de verdade (1.491+ blocos, 10.026+ certificações) — mas está parado desde 2026-07-24 por um problema separado: o Redis (Upstash) está retornando `ERR Your database has been temporarily rate-limited` toda vez que o worker tenta agendar o job repetido, confirmado nos logs do `doohplay-workers`.

**3) Nota — melhoria futura: auto-deploy amplo do `doohplay-workers`.** O serviço `doohplay-workers` (que roda `worker.ts`) tem `autoDeploy` ligado pra **qualquer commit em `master`**, não só mudanças relacionadas ao worker/pipeline de prova. Confirmado nos logs: ele reiniciou 4 vezes num único dia (2026-08-26) só por causa de commits de UI do dashboard, sem nenhuma relação com o worker. Cada reinício tenta reagendar o job do agregador e esbarra no rate-limit do Upstash. Vale considerar, como melhoria futura: restringir o auto-deploy desse serviço a mudanças em caminhos relevantes (`worker.ts`, `lib/proof/`, `lib/queue/`), ou migrar pra deploy manual/controlado, reduzindo reinícios desnecessários e a chance de bater no rate-limit do Redis repetidamente.

## ⚠️→✅ Achado crítico — todo cliente Studio compartilha a mesma playlist (2026-08-28; causa raiz corrigida em 2026-08-27)

Descoberto durante o design da correção de segurança do `SchedulerEditor.tsx` (varredura de tabelas acessadas via chave anônima do Supabase). É um bug **ativo**, não teórico — afeta qualquer cliente usando o Scheduler Editor do Studio agora.

**Causa raiz** — dois problemas empilhados em `app/studio/[code]/page.tsx` e `app/api/studio/auth/route.ts`:

1. `GET /api/studio/auth` busca o cliente assim:
   ```sql
   SELECT id, name, business_type, primary_color FROM studio_clients WHERE code = $1 AND active = true LIMIT 1
   ```
   **Não seleciona `playlist_id`**, embora a coluna exista de verdade em `studio_clients` (confirmado via schema real).

2. `app/studio/[code]/page.tsx` (linha ~267) faz:
   ```ts
   const playlistId = client.playlist_id ?? "bbbbbbbb-0001-0001-0001-000000000001"
   ```
   Como `client.playlist_id` nunca vem preenchido (rota acima não busca essa coluna), **todo cliente, sempre, cai no fallback fixo**. Resultado: todos os clientes que usam o Scheduler Editor hoje leem e escrevem na mesma playlist compartilhada (`playlist_items`/`schedule_rules` com `playlist_id = 'bbbbbbbb-0001-0001-0001-000000000001'`) — mistura de conteúdo entre clientes, na tabela que decide o que toca em qual tela.

**Achado relacionado, mesma investigação**: `/api/studio/auth` **não tem autenticação real** — só verifica se o `code` existe como cliente ativo (`WHERE code = $1 AND active = true`). Sem senha, sem OTP, sem sessão. Saber o código de um cliente já dá acesso total ao editor Studio dele. Mais fraco que o fluxo `/dashboard/local/[code]` (que usa OTP via WhatsApp, `CLIENT_SESSION_COOKIE`).

### Resolvido em 2026-08-28 (parcial)
- ✅ Varredura completa de tabelas acessadas via `NEXT_PUBLIC_SUPABASE_ANON_KEY` — achou 6 tabelas expostas (`playlist_items`, `schedule_rules`, `playback_logs`, `digital_certifications`, `evidences`, `financial_invoices`).
- ✅ 4 delas (`financial_invoices`, `digital_certifications` ×2 usos, `evidences`) trocadas de `supabase` (anon) pra `supabaseServer` (service_role) — commit `e5e5e12`, em produção.
- ✅ Escrita de `playlist_items`/`schedule_rules` movida do `SchedulerEditor.tsx` (client-side, chave anon) pra `app/api/studio/schedule-rule/route.ts` (server-side), com checagem de posse (`playlist_item.playlist_id` precisa bater com `studio_clients.playlist_id` do `code` informado) — commit `6587852`, em produção. **Isso não corrige o bug do playlist_id compartilhado nem a falta de autenticação** — só impede escrita direta via chave anônima sem passar pela checagem de posse.

### Resolvido em 2026-08-27 — causa raiz do playlist compartilhado
- ✅ **Investigado antes de corrigir**: `SELECT playlist_id FROM studio_clients` mostrou só 2 clientes reais — `BARBE332` (`playlist_id = daaa595c-4616-4e8f-988b-02a0b696c9b2`) e `LEMEL186` (`playlist_id = null`). E `playlist_items` só tem **5 linhas no total**, todas de 2026-06-03/04 (dado de teste antigo), todas sob o placeholder compartilhado (`bbbbbbbb-0001-0001-0001-000000000001`) — **zero linhas** sob o `playlist_id` real do BARBE332.
- ✅ **Achado que reduz a gravidade do bug**: `playlist_items`/`schedule_rules` (a tabela por trás do Scheduler) é **órfã** — o próprio código já documentava isso em `app/api/studio/publish/route.ts` ("a versão antiga escrevia em `playlist_items`, tabela órfã que `app/player/page.tsx`, o player real, nunca lê"). O conteúdo que realmente toca na tela do BARBE332 vem de um pipeline totalmente separado (`/api/client/playlist/[code]`, sistema unificado `CampaignMedia`/`playlist_schedule`). Ou seja: o bug do playlist compartilhado é real no banco, mas **nunca teve impacto visível em nenhuma tela real** — a aba "Grade de programação" do Studio não está conectada ao player de produção.
- ✅ `GET /api/studio/auth` corrigido pra selecionar `playlist_id` (`app/api/studio/auth/route.ts`) — commit pendente nesta atualização. Efeito confirmado como seguro pros 2 clientes reais: BARBE332 passa a usar seu `playlist_id` real (sem risco de perda, já que tinha 0 linhas lá); LEMEL186 continua no mesmo fallback compartilhado de hoje, sem mudança de comportamento (seu `playlist_id` é `null` no banco).

### Ainda pendente
1. **Autenticação real pro fluxo Studio** — hoje é só o `code`, igual ao "achado" do middleware do `/dashboard/local/[code]` que corrigimos antes, mas aqui nunca existiu proteção nenhuma pra remover (não é regressão, é lacuna original). Considerar reaproveitar o mesmo sistema de OTP via WhatsApp já usado em `/dashboard/local/[code]`.
2. **Decidir se vale criar um `playlist_id` próprio pra clientes sem um hoje** (ex.: `LEMEL186`) — não é urgente dado que a tabela é órfã e não afeta playout real, mas fica em aberto pra quando/se o Scheduler for conectado ao pipeline real algum dia.

## ✅ Correção — RLS/RPC do dashboard interno e escritas via chave anônima (2026-08-27)

Continuação da varredura de segurança da chave anônima do Supabase (seção anterior, achado do playlist compartilhado do Studio). Duas frentes corrigidas nesta sessão.

### 1) Escritas via chave anônima movidas para acesso privilegiado (5 pontos)

- `financial_invoices` (leitura de PDF de fatura, `app/api/invoices/[invoice_id]/pdf/route.ts`, não tinha nenhuma checagem de sessão) — de `supabase` (anon) pra `supabaseServer` (service_role) — commit `e5e5e12`
- `digital_certifications` (insert, `services/persistEvent.ts` + `src/services/persistEvent.ts`) — anon → service_role — commit `e5e5e12`
- `digital_certifications` (update, `services/finalizeCertification.ts` + `src/services/finalizeCertification.ts`) — anon → service_role — commit `e5e5e12`
- `evidences` (`reports/registerEvidence.ts`, select+insert) — anon → service_role — commit `e5e5e12`
- `playlist_items`/`schedule_rules` (escrita do Scheduler Editor do Studio) — antes gravava direto do navegador com a chave anon, sem nenhuma checagem de posse; movida pra `app/api/studio/schedule-rule/route.ts` (server-side, `supabaseServer`), que confirma que o item pertence ao `playlist_id` do `code` informado antes de gravar — commit `6587852`

Leituras que continuam via anon, avaliadas e mantidas conscientemente: `digital_certifications` (SELECT filtrado por `is_public=true`), `playlist_items`/`schedule_rules` (leitura do próprio Scheduler Editor), `playback_logs` (somente leitura, classificado como baixo risco).

### 2) Bypass de RLS via `SECURITY DEFINER` nas funções RPC do dashboard interno

Achado novo desta sessão: as 3 funções RPC usadas pelo dashboard interno (`app/dashboard/components/Kpis.tsx`, `CampaignsChart.tsx`, `PlayersChart.tsx`) — `dashboard_kpis`, `dashboard_executions_by_campaign`, `dashboard_executions_by_player` — eram `SECURITY DEFINER`, ou seja, rodavam como o dono da função e **ignoravam RLS por completo**, mesmo sendo chamadas com a chave anônima do navegador via `.rpc()`. Isso expunha KPIs e execuções de **toda a plataforma** (todos os tenants), não só do cliente logado. `dashboard_executions_over_time` (usada por `ExecutionsChart.tsx`) já era `SECURITY INVOKER` — não fazia parte do problema.

Investigação adicional feita **antes** de qualquer mudança: a tabela `players` tinha a política de RLS `"Players read only"`, papel `anon`, comando `SELECT`, condição `true` — totalmente aberta. A tabela tem uma coluna `auth_token`, então essa política expunha esse dado pra qualquer chamada anônima direta em `players`, independente das 3 funções acima. Confirmado por investigação de código (zero ocorrências de `.from("players")` e zero ocorrências de `auth_token` em todo o repositório, nas 3 rotas reais que um player físico chama — `activate`, `pairing/confirm`, `heartbeat` — todas usando `pg.Pool` direto via `lib/db.ts` ou `@/core/audit/eventChainRepository`) que **nenhum player físico real depende dessa política** — a autenticação de dispositivo nunca passa pelo PostgREST/Supabase, só por Postgres direto com credencial do próprio app.

**Aplicado em produção (banco Supabase `DOOHPLAY`, projeto `mdlbajgnntjwhycouzit`) em 2026-08-27:**
1. `dashboard_kpis`, `dashboard_executions_by_campaign`, `dashboard_executions_by_player`: `SECURITY DEFINER` → `SECURITY INVOKER` (mesma lógica SQL, agora respeitando RLS de `campaigns`/`players`/`play_logs_certified`)
2. `DROP POLICY "Players read only" ON public.players;` — removida a política aberta pra `anon`, incluindo a exposição de `auth_token`. Permanecem `no direct access` (deny-all pra `public`) e `player_can_read_own_data` (`auth.uid() = id`)
3. `ALTER TABLE public.play_logs_certified ENABLE ROW LEVEL SECURITY;` — tabela nunca tinha RLS habilitado; agora habilitado sem nenhuma política pública (só `service_role` e o dono da tabela têm acesso)

**Efeito colateral conhecido e aceito:** o gráfico "Execuções por Player" (`PlayersChart.tsx`, dashboard interno `/dashboard`) chama `dashboard_executions_by_player` via `.rpc()` com a chave anônima. Como a função agora respeita RLS e não existe sessão real de usuário autenticado nesse painel hoje, o `JOIN` com `players` retorna vazio — o gráfico passa a mostrar "Sem dados no período". `Kpis.tsx` e `CampaignsChart.tsx` sofrem o mesmo efeito, pela mesma razão (RLS de `campaigns`/`play_logs_certified` bloqueando `anon` sem sessão). **Nenhuma tela de cliente final é afetada** — em particular `/dashboard/local/[code]` (usada pelo BARBE332) busca esses mesmos dados via `pool.query()` direto no servidor, nunca via Supabase/anon, então continua funcionando normalmente.

### Pendência que fica em aberto
Autenticação real pro dashboard interno (`/dashboard`) — hoje ele roda inteiramente com a chave anônima do navegador, sem sessão. As 3 funções corrigidas deixam de vazar dado de outros tenants, mas também deixam de mostrar qualquer dado nesses 3 widgets até existir sessão autenticada de verdade nesse painel.

## ✅ Assistente IA (AIAssistant) portado do Figma Make — em produção (2026-08-29)

Referência: protótipo em Figma Make (`https://www.figma.com/make/OcDF3c06993PmtipjqzDWL/DOOHPLAY`), 4 componentes candidatos a "agente de IA" analisados nesta sessão: `AIAssistant.tsx`, `AICopilot.tsx`, `AICreativeLab.tsx`, `AIRevenueCenter.tsx`. Todos os 4, no protótipo, eram 100% mockados — respostas de dicionário local por palavra-chave, sem chamada de IA real, apesar do "Powered by Gemini" na UI.

### 1) `AIAssistant` — portado e funcionando de verdade

Nova aba "Assistente IA" em `app/dashboard/local/[code]` (mesmo dashboard do BARBE332), commit `77091cf`:

- **Aba Insights** (`GET /api/client/assistant/insights`): 5 cards candidatos, todos vindos de SQL determinístico sobre dado real — ganhos vs mês anterior (`client_payouts`), assinatura em atraso (`financial_subscriptions.status = 'OVERDUE'`), cota de IA quase no limite (`ai_generation_log`), exibições abaixo da média da rede (`display_events`), tela offline (`players.last_ping`). Sem IA nenhuma nessa aba — e sem número inventado: card só aparece se houver dado real por trás. Testado em produção com cliente de teste (`TESTEIA01`, criado e removido depois, sem tocar BARBE332): retornou corretamente só o card de "tela offline" (único dado real aplicável a um cliente sem player vinculado).
- **Aba Chat** (`POST /api/client/assistant/message`): IA de verdade via Anthropic (mesmo padrão server-side de `ai-generate`), autenticado pela sessão real de cliente (`doohplay_client_session`). Testado em produção com sessão real (login via OTP inserido diretamente em `otp_tokens` pra teste, depois removido) — respondeu corretamente.
- Cota de chat separada da cota de geração de criativo: coluna `feature` nova em `ai_generation_log` (migração `sql/phase18_ai_assistant_chat.sql`, aplicada em produção), `PLAN_AI_CHAT_LIMITS` em `lib/asaas.ts` (30/100/ilimitado por plano) — sem isso, conversar com o assistente consumiria a cota de criativos do Studio.

### 2) Achado e resolvido — crédito da Anthropic esgotado (bloqueava feature já existente)

Antes de implementar o chat, testamos `/api/studio/ai-generate` (feature já existente, usada pela aba "IA" do Studio) contra produção e encontramos: `ANTHROPIC_API_KEY` configurada e válida, mas a conta Anthropic **sem crédito** (`"Your credit balance is too low to access the Anthropic API"`, erro 400 real, confirmado via log do Render). Ou seja: **a geração de criativo por IA do Studio já estava quebrada em produção pra qualquer cliente real**, antes mesmo de existir o Assistente IA novo — achado não relacionado à tarefa original.

Resolvido em 2026-08-29: `ANTHROPIC_API_KEY` recarregada/atualizada no Render + deploy manual. Confirmado por teste real em produção: `/api/studio/ai-generate` voltou a gerar copy + imagem com sucesso (200 OK), e o chat do Assistente IA novo funcionou de ponta a ponta na primeira tentativa.

### 3) Outros 3 candidatos do Figma Make — pendentes

- **`AICreativeLab`** (gerador de criativo multi-conceito/multi-formato): ✅ **portado em 2026-08-30** — ver seção dedicada abaixo. `app/api/client/generate-creative` (fluxo Puppeteer/template do dashboard normal, usado pelo modal "Enviar conteúdo") não foi alterado, continua fora do escopo dessa mudança.
- **`AIRevenueCenter`** (dashboard de oportunidades de receita, previsão financeira, anunciantes recomendados): ✅ **portado em 2026-08-30** — ver seção dedicada abaixo.
- **`AICopilot`** ("Gemini DOOH Copilot", chat genérico de planejamento de mídia/budget/CPM regional): **não portado — decisão estratégica (2026-08-30), não técnica.** Investigação dedicada (2026-08-30) confirmou que, diferente do `AICreativeLab` e do `AIRevenueCenter` (que só precisavam de dado real por trás de cards já existentes), esse protótipo pressupõe um **perfil de usuário que não existe hoje em nenhum dos dois lados**:
  - Lado vendedor (operador de múltiplas telas): `app/agencia/[code]` + `app/api/agency/[code]` é código real e funcional — agrega MRR, exibições e status online/offline de vários `studio_clients` sob uma agência — mas tem só **1 fixture de demonstração** no banco (`agencies.code = 'AGDEMO1'`, ligada a `BARBE332`), nenhuma agência paga de verdade.
  - Lado comprador (anunciante com orçamento de mídia): tabela `Advertiser` tem **0 linhas** — nenhum anunciante cadastrado no produto hoje.
  - Mesmo que `/agencia` ganhasse clientes reais amanhã, ele resolve um problema diferente do que o `AICopilot` propõe: monitoramento de frota de telas (status/MRR/exibições), não planejamento de mídia com CPM/orçamento por região e formato.

  Recomendação: revisitar só quando/se existir demanda real de agência ou anunciante pagante no produto — não é um caso de "falta ligar no dado real", é um caso de "o público-alvo ainda não existe".

### 4) Nota — subagentes do Claude Code (`.claude/agents/`) — RESOLVIDO (2026-08-30)

Existem 3 subagentes definidos em `.claude/agents/` (`arquiteto-agent`, `codigo-agent`, `docs-produto-agent`), criados em 2026-08-16. Em 2026-08-28, uma tentativa de invocar `arquiteto-agent` via Agent tool falhou (`"Agent type 'arquiteto-agent' not found"`), levantando suspeita de bug de versão/formato do Claude Code.

**Causa raiz identificada em 2026-08-30**: a falha de 28/08 não era bug de formato nem de versão — a sessão do Claude Code estava rodando na pasta errada (home do usuário, não a raiz do projeto), então o scanner de `.claude/agents/` nunca chegou a olhar o diretório correto do repo.

**Teste de confirmação (2026-08-30)**: rodado `claude --debug` a partir da pasta correta do projeto. Log de debug da sessão confirma o watcher armado sobre `...doohplay-demo\.claude\agents` e nenhum `[WARN]`/`[ERROR]` relacionado a agentes. Os 3 agentes foram invocados com prompts de sanidade (somente leitura) e todos responderam corretamente, identificando papel, respeitando a separação `app/`×`src/` e reportando as tools esperadas (`arquiteto-agent`: Read/Grep/Glob; `codigo-agent`: Read/Edit/Write/Bash/Grep/Glob; `docs-produto-agent`: Read/Write/Grep/Glob).

**Pendência fechada.** Os 3 subagentes de projeto funcionam normalmente, desde que o Claude Code seja iniciado a partir da raiz do repo.

## ✅ AI Creative Lab (AICreativeLab) portado do Figma Make — em produção (2026-08-30)

Fecha a pendência registrada na seção anterior (item 3, 2026-08-29): `POST /api/studio/ai-generate` evoluiu de "1 geração por vez" pra 3 conceitos simultâneos (bold/minimal/vibrant), cada um com copy (headline/subline/cta) + imagem própria — como o protótipo `AICreativeLab.tsx` do Figma Make propunha, mas sem replicar o 9x de custo que uma leitura ingênua do protótipo sugeriria (ver decisões abaixo). Commit `dcdb7aa`.

**Decisões do plano aprovado antes de implementar:**
- 1 imagem por conceito, não por formato — os 3 formatos (16:9/9:16/1:1) são só crop/aspect-ratio do mesmo preview no frontend. Confirmado lendo o próprio `AICreativeLab.tsx` do Figma: trocar de formato lá também não gera nada novo, só redimensiona o mesmo card. Mantém o custo em ~3x o de antes, não 9x.
- Cota: cada conceito consome 1 linha de `ai_generation_log` (3 por clique) — `PLAN_AI_GENERATION_LIMITS` (10/40/ilimitado) não mudou de valor, só passou a valer em "conceitos" em vez de "cliques", preservando o teto de custo em $ que já existia. Clique inteiro é negado se sobrar menos de 3 na cota do mês (sem geração parcial).
- Geração de imagem roda em background: `generateBackgroundImagesBatch` (já existia em `lib/imageGeneration.ts`, nunca tinha chamador) agora processa os 3 prompts em sequência; `POST /api/studio/ai-generate` devolve um `jobId` na hora, e o novo `GET /api/studio/ai-generate/status` faz polling de progresso real (`generating_copy` → `generating_image` 1/3, 2/3, 3/3 → `done`).

**Achado corrigido antes do deploy**: a primeira versão guardava o progresso do job em Redis (`lib/redis.ts`), a mesma instância (Upstash) usada por `lib/queue/workers/alertWorker.ts` — que está com rate-limit desde 2026-07-24 (ver seção acima sobre o pipeline de prova parado). Testado na prática: com esse Redis inacessível, `setJobStatus` não falha rápido, **trava pra sempre** (`maxRetriesPerRequest: null` no cliente compartilhado, retry infinito). Corrigido pra um `Map` em memória (`lib/aiCreativeJobs.ts`) — seguro hoje porque `doohplay-demo` roda numa instância só (`numInstances: 1`, confirmado via API do Render); precisa voltar a ser um store compartilhado se o serviço escalar horizontalmente.

**Testado em produção de ponta a ponta (2026-08-30, cliente de teste `TESTEIA01`, sem tocar `BARBE332`)**:
- Deploy: commit `dcdb7aa` → Render `live` em ~3min (build → pre-deploy → update).
- `POST /api/studio/ai-generate` → `200 { ok: true, jobId }`, sem travar.
- Polling em `GET .../ai-generate/status`: `generating_copy` → `generating_image` (2/3) → (3/3) → `done`, ~28s no total.
- Resultado: 3 conceitos completos (bold/minimal/vibrant), headline/subline/cta distintos por estilo, `image_url` de cada um verificado direto no R2 (`media.doohplay.com.br`, HTTP 200, `image/jpeg` real, 692KB–1,07MB).
- Cota: `GET /api/client/plan-usage/TESTEIA01` foi de 1 → 4 usos (3 gravados nesse clique), confirmando 1 linha por conceito.

Aba "IA" do Studio (`app/studio/[code]/page.tsx`) reescrita: grid de 3 cards de conceito (clicável, aplica no form/preview), seletor de formato, barra de progresso real via polling.

## ✅ AI Revenue Center (AIRevenueCenter) portado do Figma Make — em produção (2026-08-30)

Evolui a página órfã `app/dashboard/local/[code]/ai-revenue/page.tsx` (existia desde antes, mas sem nenhum link apontando pra ela em lugar nenhum do app) pra estrutura de 4 abas do protótipo (Visão Geral, Oportunidades, Anunciantes Recomendados, Previsão Financeira). Commit `501503c`.

**Regra seguida em toda aba, sem exceção**: todo bloco que mistura ou é 100% número ilustrativo carrega badge `⭐ Simulação` + frase explícita; todo bloco com dado real carrega `● Dado real da sua tela`, sem badge. Nunca os dois misturados no mesmo card — cards que teriam parte real e parte fictícia (ex: "Receita Perdida" do protótipo) foram separados em blocos visuais distintos.

**5 queries SQL novas** (`app/dashboard/local/[code]/ai-revenue/page.tsx`), alimentando os únicos itens do protótipo com dado real disponível hoje:
1. Histórico de repasses por mês (`client_payouts`, últimos 6 meses) — Visão Geral + eixo real da Previsão Financeira.
2. Downtime real do mês (`alerts` WHERE `type = 'PLAYER_OFFLINE'`, soma de `resolved_at - created_at`) — componente real da Visão Geral.
3. Exibições reais por dia da semana (`display_events`, últimos 30 dias) — aba Oportunidades.
4. Contagem de anunciantes com campanha ativa (`COUNT(DISTINCT "advertiserCode") FROM "Campaign" WHERE status = 'active'`) — abertura da aba Anunciantes Recomendados.
5. Status online/offline atual (`players.last_ping`) — Visão Geral.

`lib/cpmEstimate.ts` (novo) extrai o cálculo de CPM por faixa de volume de `app/marketplace/filters.tsx` (antes duplicado ali e em `page.tsx`, esse segundo morto/nunca chamado) — usado pra estimar receita real de um anunciante adicional a partir do volume real de exibições da tela, dentro dos cards ilustrativos de categoria da aba Anunciantes.

**Achado relevante pra decisões futuras de agência/anunciante** (o mesmo que fechou a investigação do `AICopilot`, ver acima): a query 4 rodou contra dado real de produção e retornou **0 anunciantes com campanha ativa na rede** — confirma que não só a tabela `Advertiser` está vazia (0 linhas), como também não existe hoje nenhuma `Campaign` ativa vinculada a um anunciante de verdade. A aba Anunciantes Recomendados mostra esse `0` real, sem maquiar.

**Testado em produção (2026-08-30)**:
- `TESTEIA01` → HTTP 404, esperado e não é bug: esse código nunca existiu em `studio_clients` (só é usado em `ai_generation_log`/`financial_subscriptions` pros testes do AI Creative Lab) — a página exige um registro em `studio_clients` pra renderizar.
- `BARBE332` → HTTP 200. Confirmado por `curl` + consulta direta no Postgres (Supabase): bloco real mostrou `Exibições (30 dias): 4.203` (bate exato com `display_events`), `Repasse deste mês: "Nenhum repasse solicitado ainda"` (real — `client_payouts` tem 0 linhas pra `BARBE332` e pra `LEMEL186`, os únicos 2 clientes reais hoje), `Status da tela: 🔴 Offline` (reflete `last_ping` real no momento do teste) com `0h offline este mês` (real — nenhum alerta `PLAYER_OFFLINE` logado esse mês, sinal diferente do status ao vivo). Zero erros de aplicação nos logs do Render desde o deploy.
- Na hora do teste automatizado, só a aba "Visão Geral" foi confirmada via HTTP fetch (é a única que já vem renderizada no HTML inicial; as outras 3 trocam de conteúdo client-side, via estado local em `ai-revenue-client.tsx`) — a extensão do Chrome não estava conectada nesta sessão pra clicar nas outras abas.
- **Confirmação visual completa feita depois pelo usuário direto no navegador**, com prints das 4 abas (Visão Geral, Oportunidades, Anunciantes Recomendados, Previsão Financeira): todas renderizando corretamente, badges "Dado real" e "Simulação" aplicados como esperado em cada bloco, nenhum nome de anunciante real exposto.

Também adiciona a entrada "Receita com IA" no `NAV` de `app/dashboard/local/[code]/dashboard-client.tsx` (fechando a órfandade da rota) e faz `onNav` navegar de verdade pra essa rota em vez de tratar como aba interna do dashboard.

## 🔧 Autenticação do /dashboard interno — implementado, aguardando aprovação pra commit (2026-08-30)

Fecha a pendência registrada na seção "Correção — RLS/RPC do dashboard interno" (2026-08-27): `/dashboard` (painel interno de operação — Kpis, ExecutionsChart, CampaignsChart, PlayersChart, WatchdogCard, SlaChart) rodava sem nenhuma autenticação, e duas rotas vazavam dado real pra qualquer um sem credencial (`GET /api/events/offline`, `GET /api/reports/dashboard`).

Reaproveitada a infraestrutura já existente pro `/admin` — tabela `admin_users` (`super_admin`/`operador`), NextAuth `CredentialsProvider` (`lib/auth-options.ts`), tela `/admin/login`:

- `middleware.ts`: `/dashboard/:path*` entrou no matcher; `authorized()` exige sessão NextAuth pra `/dashboard/*`, com exceção explícita pra `/dashboard/local/*` (sessão própria de cliente, `CLIENT_SESSION_COOKIE` — preservada de propósito pra não repetir o bug de 2026-08-27 que bloqueou esse fluxo).
- Checagem de sessão (`getServerSession(authOptions)`, mesmo padrão de `app/api/admin/stats`) adicionada em: `/api/events/offline`, `/api/reports/dashboard`, `/api/events/players/check-offline` (achado extra — mutação acionada pelo botão "Forçar verificação" do Watchdog, também estava aberta), e as 4 rotas de SLA (`sla-daily`, `sla-history`, `sla-real-history`, `sla-real-monthly`).
- `WatchdogCard.tsx` corrigido (bug pré-existente, não relacionado a auth): chamava `/api/players/status` e `/api/players/sla-real-daily`, nenhuma das duas existia (404 sempre, `Promise.all` falhava, card sempre mostrava erro fixo). Criada `app/api/players/status/route.ts` (conta online/offline/total direto de `public.players` via `pg.Pool`, autenticada) e trocado `sla-real-daily` por `sla-daily` (lendo `summary.averageSla`).
- Nível de acesso: qualquer usuário ativo de `admin_users` (`super_admin` ou `operador`) — dashboard é dado operacional, não financeiro, mesma régua já usada em `app/api/admin/stats/route.ts` (só a seção de Assinaturas é restrita a `super_admin`).
- Login: reaproveita `/admin/login` (já é `pages.signIn` global do NextAuth) — sem tela nova.

`tsc --noEmit` limpo nos 10 arquivos tocados (86 erros pré-existentes no repo, todos fora do escopo desta mudança, nenhum nos arquivos tocados). **Ainda não commitado** — implementado e revisado nesta sessão, aguardando aprovação explícita do usuário antes do commit.

### Pendência separada, descoberta durante essa investigação: os 4 widgets via `supabase.rpc(...)` continuam quebrados, mesmo com operador logado

`Kpis.tsx`, `ExecutionsChart.tsx`, `CampaignsChart.tsx`, `PlayersChart.tsx` chamam `supabase.rpc("dashboard_kpis"/"dashboard_executions_over_time"/"dashboard_executions_by_campaign"/"dashboard_executions_by_player", ...)` direto do browser com a chave anônima do Supabase. Confirmado ao vivo no banco (`mdlbajgnntjwhycouzit`) que isso **não é resolvido** pela autenticação NextAuth implementada acima, por dois motivos independentes:

1. **RLS bloqueia a chave anon permanentemente**: `play_logs_certified` tem RLS habilitado e **zero policies** (`select * from pg_policies where tablename='play_logs_certified'` retorna vazio) — RLS ligado sem nenhuma policy pública é deny-all pra qualquer role que não seja o dono da tabela/`service_role`. A sessão NextAuth que agora protege `/dashboard` é um sistema totalmente separado da sessão do Supabase (`auth.uid()`) — logar no `/admin/login` não muda em nada o que a chave anon do browser consegue ler. Ou seja, esses 4 widgets ficam vazios pra sempre nesse desenho, com ou sem operador logado.
2. **Mesmo corrigindo o RLS, `dashboard_kpis` não serviria pro Watchdog**: `active_players` no RPC é `COUNT(DISTINCT player_id) FROM play_logs_certified WHERE started_at BETWEEN start_date AND end_date` — ou seja, "players que tocaram algo no período", não "players online agora". São conceitos diferentes (um player pode ter tocado de manhã e estar offline agora; ou estar online sem ter tocado nada ainda). Por isso a rota `/api/players/status` (criada nesta sessão, item acima) foi mantida como fonte de online/offline do Watchdog em vez de tentar derivar de `dashboard_kpis` — decisão confirmada com o usuário.

**Recomendação**: migrar essas 4 RPCs pra rotas server-side com `pg.Pool` privilegiado, no mesmo padrão de `/api/players/status` (que já contorna exatamente esse problema pra online/offline), em vez de tentar consertar via RLS/policy — evita reabrir uma tabela sensível (`play_logs_certified`, dado de auditoria/prova) pra leitura via chave anon, e reaproveita o padrão de autenticação já implementado.

## Arquitetura (resumo)

- **Pipeline de prova (real)**: `runProofChainAggregator()` em `lib/proof/aggregator/proofChainAggregator.ts`, agendado a cada 5 min via `worker.ts` (serviço `doohplay-workers`) → assina eventos pendentes de `event_chain` → Merkle tree → `event_blocks` → ancora na Polygon → TSA → `certifications`. Ver achado acima sobre o pipeline morto (`evidence`/`buildBlock.ts`/`runProofPipeline.ts`) que não deve ser confundido com este.
- **Portal de verificação pública**: `/verify/[hash]`.
- **Ad server**: `POST /api/adserver/play`, `POST /api/adserver/impression`.
- **Trust graph & alertas**: detecção de fraude por relacionamento entre telas/campanhas/anunciantes/operadores; motor de políticas de alerta.
- **Dashboard**: `/dashboard`, filtros de período, componentes com `SafeBlock`.

## Próximos passos em aberto

- Decidir sobre os arquivos `.docx` e templates de PR não rastreados (commitar ou descartar).
- Resolver a exposição do certificado A1 (ver seção de segurança acima).
- Nenhum teste automatizado existe no projeto atualmente (`CLAUDE.md`: "There are no automated tests in this codebase").
