# STATUS_PROJETO.md — DOOHPLAY (doohplay-demo)

_Última atualização: 2026-09-03_

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
- **Arquivos não rastreados**: nenhum. **Confirmado em 2026-09-03** (`git status --short`, `git ls-files`, `git log --all`) que a lista antiga aqui estava desatualizada — `DOOHPLAY_Etapa1_Isolamento_Entregas.docx` e `DOOHPLAY_Plano_Separacao_Fronts.docx` já estão commitados e sincronizados com o `origin` (planos internos de arquitetura, ~12-14 KB cada, sem dado sensível — mesmo nível de informação já público no `CLAUDE.md`); o template de PR real está em `.github/pull_request_template.md`, também já commitado. Os outros 4 caminhos que constavam aqui (`crypto/CLAUDE.md`, `crypto/DOOHPLAY_Etapa1_PR_Template.md`, `crypto/pull_request_template.md`, `pull_request_template.md` na raiz) **nunca existiram neste repositório** — `git log --all` não retorna nenhum commit pra nenhum dos 4, em nenhuma branch.

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

- ✅ **Novo certificado A1 instalado e validado ponta a ponta em produção (2026-09-02).** `CERT_PFX_PATH`/`CERT_PFX_PASSWORD` confirmados configurados no Render (`/etc/secrets/certificado-a1.pfx`, 12.657 bytes) e uma assinatura de teste real via `signCanonicalPayloadWithPfx()` (`lib/crypto/signature/adapters/pfxSigner.ts`) rodou com sucesso — RSA-SHA256, certificado válido até 03/02/2027 (não é mais o antigo revogado). Validação feita por uma rota de diagnóstico temporária (`app/api/admin/diagnostico-pfx/route.ts`, nunca expôs senha/chave privada/PEM completo), removida logo em seguida (commit `f0d07fe`) por não ser parte do produto.

- ✅ **Aviso a colaboradores sobre hashes reescritos: confirmado como desnecessário.** Fundador solo, sem colaborador com clone antigo do repositório pendente de re-clonar.

### Ainda pendente
Nenhum item em aberto nesta seção.

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

**3) ✅ Resolvido (2026-09-03) — auto-deploy amplo do `doohplay-workers` restringido.** O serviço tinha `autoDeploy` ligado pra **qualquer commit em `master`**, não só mudanças relacionadas ao worker/pipeline de prova. Confirmado nos logs: reiniciou pelo menos 4 vezes em ~13h só em 03/09/2026, e em 4 de 4 reinicializações checadas, `scheduleAggregatorJob()` falhou com `ERR Your database has been temporarily rate-limited` — inclusive na *leitura* (`getRepeatableJobs()`), não só na escrita, o que significa que o fix de idempotência de 27/08 (só escreve se o job repetido ainda não existir) não é suficiente sozinho: cada restart continuava tentando e batendo no rate-limit de novo. Como cada commit em `master` (inclusive documentação, UI de dashboard, qualquer coisa em `app/`/`src/`) disparava um restart do worker, a própria atividade normal do repositório realimentava o ciclo continuamente.

**Corrigido via Build Filters do Render** (`Settings → Build & Deploy → Build Filters`, `Included Paths`, configuração manual no painel — não gerenciado pelo `render.yaml`, esse serviço foi criado direto no painel):
```
worker.ts
lib/**
core/**
```
Escopo deliberadamente amplo (`lib/**` inteiro, não só `lib/proof/`/`lib/queue/`) — investigação encontrou dependências diretas do worker espalhadas por pelo menos mais 8 subpastas de `lib/` (`lib/redis.ts`, `lib/domain/`, `lib/crypto/`, `lib/blockchain/`, `lib/tsa/`, `lib/observability/`, `lib/merkle.ts`, `lib/config/`, `lib/integrations/`, `lib/ledger/`) — uma lista mais restrita já tinha ficado incompleta numa única checagem, risco preferido explicitamente: restart ocasional desnecessário em vez de worker rodando código desatualizado sem ninguém perceber.

**Não resolve o rate-limit do Upstash em si** — só para de realimentá-lo a cada commit não relacionado. Consolidar as 14 conexões Redis distintas do código, ou fazer upgrade do plano Upstash, seguem como decisões separadas, agora sem a pressão de estarem sendo ativamente agravadas por qualquer push no repositório.

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

## ✅ Autenticação do /dashboard interno — em produção (2026-08-30)

Fecha a pendência registrada na seção "Correção — RLS/RPC do dashboard interno" (2026-08-27): `/dashboard` (painel interno de operação — Kpis, ExecutionsChart, CampaignsChart, PlayersChart, WatchdogCard, SlaChart) rodava sem nenhuma autenticação, e duas rotas vazavam dado real pra qualquer um sem credencial (`GET /api/events/offline`, `GET /api/reports/dashboard`).

Reaproveitada a infraestrutura já existente pro `/admin` — tabela `admin_users` (`super_admin`/`operador`), NextAuth `CredentialsProvider` (`lib/auth-options.ts`), tela `/admin/login`:

- `middleware.ts`: `/dashboard/:path*` entrou no matcher; `authorized()` exige sessão NextAuth pra `/dashboard/*`, com exceção explícita pra `/dashboard/local/*` (sessão própria de cliente, `CLIENT_SESSION_COOKIE` — preservada de propósito pra não repetir o bug de 2026-08-27 que bloqueou esse fluxo).
- Checagem de sessão (`getServerSession(authOptions)`, mesmo padrão de `app/api/admin/stats`) adicionada em: `/api/events/offline`, `/api/reports/dashboard`, `/api/events/players/check-offline` (achado extra — mutação acionada pelo botão "Forçar verificação" do Watchdog, também estava aberta), e as 4 rotas de SLA (`sla-daily`, `sla-history`, `sla-real-history`, `sla-real-monthly`).
- `WatchdogCard.tsx` corrigido (bug pré-existente, não relacionado a auth): chamava `/api/players/status` e `/api/players/sla-real-daily`, nenhuma das duas existia (404 sempre, `Promise.all` falhava, card sempre mostrava erro fixo). Criada `app/api/players/status/route.ts` (conta online/offline/total direto de `public.players` via `pg.Pool`, autenticada) e trocado `sla-real-daily` por `sla-daily` (lendo `summary.averageSla`).
- Nível de acesso: qualquer usuário ativo de `admin_users` (`super_admin` ou `operador`) — dashboard é dado operacional, não financeiro, mesma régua já usada em `app/api/admin/stats/route.ts` (só a seção de Assinaturas é restrita a `super_admin`).
- Login: reaproveita `/admin/login` (já é `pages.signIn` global do NextAuth) — sem tela nova.

`tsc --noEmit` limpo nos 10 arquivos tocados (86 erros pré-existentes no repo, todos fora do escopo desta mudança, nenhum nos arquivos tocados). Commit `1a251d4`, deploy `dep-daabosk9v7es73e8usug` confirmado `live` no serviço `doohplay-demo` (não confundir com `doohplay-workers`, serviço separado) — `curl https://doohplay.com.br/dashboard` sem sessão confirmado retornando `307 → /admin/login?callbackUrl=%2Fdashboard` em produção real.

### Achado pós-deploy: rotas órfãs tinham nomes de coluna que nunca existiram (2026-08-30)

Depois do deploy, com um operador logado de verdade, o `WatchdogCard` continuou mostrando "Falha ao carregar dados do Watchdog" — não por causa de cookie/sessão (confirmado: `WatchdogCard.tsx` usa `fetch()` sem `credentials` customizado, e o padrão do browser pra same-origin já envia cookie; a prova definitiva é que os logs do Render mostravam **500**, não 401 — se o cookie não tivesse chegado, a checagem de sessão teria barrado antes com 401). A causa real, vista direto nos logs de aplicação do Render (`doohplay-demo`): as rotas nunca tinham sido exercitadas de verdade (eram order, chamadas só depois do fix do Watchdog nesta sessão) e usavam nomes de coluna que **nunca existiram** no schema real:

- `app/api/players/status/route.ts` (rota nova desta sessão) e `app/api/events/offline/route.ts` (pré-existente, órfã) — ambas filtravam por `players.status`, `players.ip_address`, `players.version`. Nenhuma dessas colunas existe em `public.players` (schema real confirmado via Supabase: `id, name, location, device_type, screen_orientation, resolution_width, resolution_height, is_active, auth_token, created_at, description, player_code, last_ping, paired, paired_at, platform, tenant_id, device_fingerprint, latitude, longitude`). Corrigido pra usar `last_ping > NOW() - INTERVAL '5 minutes'` como critério de online/offline — mesmo padrão já usado (e funcionando) no AI Revenue Center (`app/dashboard/local/[code]/ai-revenue/page.tsx`) — e `platform`/`device_type`/`name` no lugar de `version`/`ip_address` (que não têm equivalente real na tabela).
- `app/api/players/sla-daily/route.ts`, `sla-real-monthly/route.ts` e `lib/sla.ts` (compartilhado por `sla-history`/`sla-real-history`, todas pré-existentes, só ganharam checagem de auth nesta sessão) — filtravam `event_chain.device_id`, coluna que também nunca existiu (`event_chain` real: `id, event_id, event_type, source_table, source_id, occurred_at, payload, ...` — é o ledger do motor de prova, ver `docs/api-contract.md`/CLAUDE.md). Corrigido pra `source_table = 'players' AND source_id::text = $1`.

As 3 queries corrigidas foram validadas rodando direto no Postgres de produção (Supabase, só leitura) antes do commit — todas executam sem erro contra dado real.

### Pendência separada: SLA-por-heartbeat não tem dado real pra `players` (2026-08-30)

A correção acima para de quebrar com 500, mas não resolve a métrica em si: `event_chain` tem só **3 linhas** no total com `event_type = 'PLAYER_HEARTBEAT'`, e as 3 têm `source_table = 'screens'` — nenhuma referencia `players`. Ou seja, `sla-daily`/`sla-real-monthly`/`sla-history`/`sla-real-history` vão rodar sem erro mas devolver `0%`/sem dado pra praticamente qualquer player, porque a fonte de heartbeat que essas rotas foram desenhadas pra ler nunca foi alimentada pra esse schema — não é regressão desta sessão, é lacuna original (rotas escritas mas nunca conectadas a um pipeline real de heartbeat de `players`). Sinal de "online agora" (via `last_ping`, corrigido acima) funciona normalmente; só o histórico/SLA acumulado por heartbeat é que fica sem dado real até existir um pipeline que grave heartbeats de `players` em `event_chain` (ou até a métrica ser recalculada a partir de outra fonte, ex. amostragem periódica de `last_ping`).

### ⚠️→✅ Pendência descoberta durante a investigação, resolvida em seguida: os 4 widgets via `supabase.rpc(...)` continuavam quebrados, mesmo com operador logado

`Kpis.tsx`, `ExecutionsChart.tsx`, `CampaignsChart.tsx`, `PlayersChart.tsx` chamam `supabase.rpc("dashboard_kpis"/"dashboard_executions_over_time"/"dashboard_executions_by_campaign"/"dashboard_executions_by_player", ...)` direto do browser com a chave anônima do Supabase. Confirmado ao vivo no banco (`mdlbajgnntjwhycouzit`) que isso **não é resolvido** pela autenticação NextAuth implementada acima, por dois motivos independentes:

1. **RLS bloqueia a chave anon permanentemente**: `play_logs_certified` tem RLS habilitado e **zero policies** (`select * from pg_policies where tablename='play_logs_certified'` retorna vazio) — RLS ligado sem nenhuma policy pública é deny-all pra qualquer role que não seja o dono da tabela/`service_role`. A sessão NextAuth que agora protege `/dashboard` é um sistema totalmente separado da sessão do Supabase (`auth.uid()`) — logar no `/admin/login` não muda em nada o que a chave anon do browser consegue ler. Ou seja, esses 4 widgets ficam vazios pra sempre nesse desenho, com ou sem operador logado.
2. **Mesmo corrigindo o RLS, `dashboard_kpis` não serviria pro Watchdog**: `active_players` no RPC é `COUNT(DISTINCT player_id) FROM play_logs_certified WHERE started_at BETWEEN start_date AND end_date` — ou seja, "players que tocaram algo no período", não "players online agora". São conceitos diferentes (um player pode ter tocado de manhã e estar offline agora; ou estar online sem ter tocado nada ainda). Por isso a rota `/api/players/status` (criada nesta sessão, item acima) foi mantida como fonte de online/offline do Watchdog em vez de tentar derivar de `dashboard_kpis` — decisão confirmada com o usuário.

**Recomendação (aplicada ainda em 2026-08-30)**: migrar essas 4 RPCs pra rotas server-side com `pg.Pool` privilegiado, no mesmo padrão de `/api/players/status` (que já contorna exatamente esse problema pra online/offline), em vez de tentar consertar via RLS/policy — evita reabrir uma tabela sensível (`play_logs_certified`, dado de auditoria/prova) pra leitura via chave anon, e reaproveita o padrão de autenticação já implementado.

**Resolvido**: criadas 4 rotas novas — `app/api/dashboard/kpis`, `executions-over-time`, `executions-by-campaign`, `executions-by-player` — cada uma protegida por `getServerSession(authOptions)` (mesmo padrão de sempre; não fica coberta pelo matcher de `middleware.ts` porque `/api/dashboard/*` não é `/dashboard/*`) e chamando a função SQL já existente direto via `pool.query("SELECT * FROM dashboard_x($1, $2)", [start, end])` — zero reescrita de lógica de negócio, só troca de transporte (Supabase RPC do browser → `pg.Pool` do servidor). `Kpis.tsx`, `ExecutionsChart.tsx`, `CampaignsChart.tsx`, `PlayersChart.tsx` trocaram `supabase.rpc(...)` por `fetch("/api/dashboard/...")`, mantendo o mesmo formato de dado e o mesmo JSX. As 4 funções foram validadas rodando direto no Postgres de produção antes do commit — executam sem erro (o período testado retornou vazio/zerado, esperado dado o volume real baixo de `play_logs_certified` já registrado em outros achados desta sessão, não indica bug). `tsc --noEmit` limpo nos 8 arquivos tocados. Commit `580bfcf`, deploy `dep-daadhbf10e5c73bp3r20` confirmado `live`.

**Testado em produção após o deploy (2026-08-30) — confirmado: migração funciona, sem bug de código.** Verifiquei nos logs do Render que as 4 rotas são chamadas normalmente (`kpis` e `executions-over-time` a cada ~10-15s via `useAutoRefresh`; `executions-by-campaign`/`executions-by-player` só 1-2x por carregamento, comportamento pré-existente — esses dois nunca tiveram `useAutoRefresh`, nem no código original com `supabase.rpc`) e sempre retornam `200`. Rodei as 4 funções direto no Postgres com os parâmetros exatos vistos nos logs: `dashboard_kpis` devolve `{total_executions:0, active_players:0, total_seconds:0, active_campaigns:0}`, as outras 3 devolvem `[]` — dado real, zero de verdade, mesmo padrão de baixo volume em `play_logs_certified` já documentado nesta sessão (ver "Pendência separada: SLA-por-heartbeat" acima). Reli os 4 componentes por completo: `useEffect` dispara corretamente no mount e nas trocas de `startDate`/`endDate`, a flag `mounted` está certa, `setLoading(false)`/`finally` sempre executam. Cada um trata o caso vazio como desenhado — `Kpis.tsx` mostra `KpiCard` com `value=0` (um "0" real, não card em branco); os 3 gráficos mostram a mensagem explícita "Sem dados no período". O "vazio" percebido é reflexo fiel da falta de dado real em produção, não falha da migração.

### Fix — hydration mismatch (React error #418) em `/dashboard`, achado pré-existente descoberto durante o teste (2026-08-30)

Durante o teste em produção da migração acima, o usuário reportou `Uncaught Error: Minified React error #418` no console de `/dashboard`. Investigação isolou a causa em `app/dashboard/page.tsx` (não nos 4 widgets migrados, nem em `app/dashboard/utils/period.ts`): `getPeriodRange(period)` era chamado direto no corpo do componente, em toda renderização — servidor e cliente. Como a função usa `new Date()`, o timestamp calculado no servidor difere do calculado no cliente alguns milissegundos depois, e o texto `{start} → {end}` no cabeçalho da página batia de frente na reconciliação de hidratação. Confirmado com a definição oficial do erro (react.dev/errors/418): *"Hydration failed because the server rendered %s didn't match the client"* — uma das causas listadas é exatamente formatação de data que difere entre servidor e cliente.

**Achado importante**: o bug é anterior a esta sessão inteira e não tem relação com a migração dos widgets — só foi notado agora porque essa foi provavelmente a primeira vez que alguém abriu o DevTools numa carga real e logada de `/dashboard` (antes da correção de autenticação, a página era pública e não usada; antes da migração, os widgets sempre ficavam vazios por RLS, sem motivo pra ninguém investigar o console).

**Corrigido** (commit `162905e`, deploy `dep-daadr6jncjis73a0a550`, `live`): o cálculo de `getPeriodRange` foi movido pra dentro de um `useEffect` — o estado `range` começa em `null` nos dois lados (determinístico, sem `Date`/`window`/I-O envolvido na primeira renderização), mostrando o placeholder "Carregando período..." já existente na primeira passada real, e só é populado com o valor de verdade depois do mount, no cliente. `period.ts` não precisou de nenhuma mudança — só o *quando* `getPeriodRange` é chamado mudou. Não mexe no `Suspense`/boundary nem no warning do Recharts `width(-1)/height(-1)` (provável sintoma secundário do mesmo mismatch, não causa independente) — fora do escopo pedido.

### ❌ Hipótese do Redis derrubada — causa raiz real encontrada: os 4 RPCs do dashboard consultam a tabela errada (2026-08-31)

A hipótese registrada nesta seção (widgets vazios por causa do Redis/pipeline de prova parado desde 24/07) foi investigada a fundo e **está descartada**, com evidência direta:

**1) Sem trigger no Postgres**: `information_schema.triggers` pra `play_logs_certified` retorna vazio.

**2) Sem Edge Function que escreva nela**: o projeto Supabase tem 11 Edge Functions ativas (fora deste repo). Verificadas as 3 mais plausíveis pelo nome — nenhuma toca `play_logs_certified`: `proof-of-play` (nome enganoso — na prática lê a view `player_status` e grava alertas de offline em `alerts_log`), `legal-proof` (só leitura pública de `digital_certifications`), `player-heartbeat` (apesar de 14 versões publicadas, ainda é o boilerplate padrão do Supabase, "Hello Functions!" — nunca implementado de verdade).

**3) A tabela já estava morta muito antes do Redis virar problema**: `play_logs_certified` tem só **2 linhas no total**, ambas de **2026-01-24 22:26–22:28** (`campaign_id: 11111111-1111-1111-1111-111111111111` — placeholder óbvio de teste manual). Isso é quase **6 meses antes** do Redis começar a dar `rate-limited` (24/07/2026, ver achado acima). A correlação temporal simplesmente não existe — a tabela nunca teve um pipeline real de escrita, com ou sem Redis funcionando.

**4) A causa raiz real**: o dado de execução de verdade não é gravado em `play_logs_certified` — é gravado em **`display_events`**, confirmada com **578.408 linhas**, de 2025-07-08 até **2026-08-26** (5 dias atrás no momento da investigação — dado vivo, contínuo, não relacionado a nenhum pipeline parado). Quem grava lá é `POST /api/player/event` (`app/api/player/event/route.ts`) — a rota real de proof-of-play, **documentada em `docs/api-contract.md`** como implementada pelo backend web e **consumida pelo player web e pelo app Android nativo**. Essa rota grava em `display_events` e também em `event_chain` (via `appendToProofChain`, alimentando o ProofChain real) — nunca em `play_logs_certified`.

**É o mesmo padrão de bug já documentado no topo do próprio `app/api/player/event/route.ts`**: o comentário ali registra que em 16/07/2026 o motor de ProofChain "nunca recebia dado real, porque lia de `event_chain`, e o player de verdade só gravava em `display_events` (tabelas e rotas diferentes, nunca ligadas)" — e aquela rota foi o ponto de conexão que resolveu isso pro `event_chain`. Ninguém nunca fez o mesmo pra `play_logs_certified`: ela foi desenhada (schema com `signature`/`integrity_hash`/`playback_hash`, claramente pensada como ledger certificado) mas nunca conectada a nenhum fluxo de escrita real — os 4 RPCs do dashboard (`dashboard_kpis`, `dashboard_executions_over_time`, `dashboard_executions_by_campaign`, `dashboard_executions_by_player`) foram escritos consultando essa tabela órfã em vez de `display_events`, onde o dado de verdade sempre esteve.

**Próximo passo (não implementado ainda)**: migrar os 4 RPCs (ou reescrever as 4 rotas server-side criadas nesta sessão) pra consultar `display_events` em vez de `play_logs_certified` — precisa mapear as colunas equivalentes (`display_events` usa `player_id`/`media_id`/`played_at`/`duration`, não necessariamente os mesmos nomes que `play_logs_certified` usa pra `campaign_id`/`started_at`/`duration_seconds`) e decidir se os 4 RPCs SQL são alterados no banco ou se a lógica é reescrita direto nas rotas Next.js.

## 📋 Levantamento — Etapa 2 do `DOOHPLAY_Plano_Separacao_Fronts.docx` (2026-08-30)

A Etapa 2 ("Separação Lógica", 3–6 semanas) do plano propõe 4 itens: (1) extrair o motor de prova pra um package interno (`packages/proof-engine`), (2) produto comercial consumir a prova só via API interna bem definida, (3) unificar o acesso ao banco de dados (eliminar a convivência desorganizada de `pg.Pool` + Supabase + Prisma), (4) criar testes de contrato entre os dois fronts. Levantamento do estado atual feito nesta sessão, sem implementar nada — cada achado abaixo é insumo pra decidir como atacar a etapa depois.

### Achado 1 — árvore duplicada e morta: `src/lib/proof/` + `src/components/proof|trust/`

Existem árvores paralelas com os **mesmos nomes de arquivo** do motor de prova vivo em `lib/proof/` (raiz) e dos componentes vivos em `components/proof/`/`components/trust/` (raiz), mas **inalcançáveis em runtime**: `next.config.ts` define alias de webpack explícito (`"@/lib": path.resolve(__dirname, "lib")`, `"@/components/proof"` e `"@/components/trust"` apontando pra raiz) que sobrescreve, em runtime, a resolução mais genérica e ambígua que o `tsconfig.json` sozinho sugeriria (`"@/*": ["./*", "./src/*"]`). Nenhuma das 12 rotas de `app/api/**` que usam o motor de prova, nem o `worker.ts`, importam essas versões de `src/` — todo import de `@/lib/proof/...` ou `@/components/proof|trust/...` cai sempre na raiz.

**Marcado nesta sessão** (mesmo padrão `@deprecated` já usado em `lib/proof/ledger/buildBlock.ts`/`lib/proof/scheduler/runProofPipeline.ts`, achado de 2026-08-26): comentário `@deprecated` no topo de `src/components/proof/{ProofStatus,ProofTimeline}.tsx` e `src/components/trust/{TrustGraph,TrustGraphCanvas,TrustGraphContainer,TrustGraphSidebar,TrustGraphToolbar,TrustGraphViewport}.tsx` (8 arquivos); `README.md` em `src/lib/proof/` e `src/lib/proof/validators/` (12 arquivos cobertos, README em vez de comentário por arquivo dado o volume). Só documentação — nenhuma lógica mudou, nenhum arquivo removido.

### Achado 2 — "unificar acesso a banco" é maior do que o CLAUDE.md documenta

O CLAUDE.md descreve 3 clientes de banco (`pg.Pool` via `lib/db.ts`, Supabase JS, Prisma só pro model `PdfCertification`). O levantamento real encontrou bem mais pontos de instanciação independentes:

- **2 `pg.Pool`**: o oficial em `lib/db.ts` (`src/lib/db.ts` é só um re-export de 2 linhas dele, não duplica) + um segundo, paralelo, criado inline em `app/api/verify/[hash]/route.ts:167` (`if (!_pool) _pool = new Pool({ connectionString: process.env.DATABASE_URL })`), sem reusar `lib/db.ts`.
- **2 `PrismaClient`**: `lib/prisma.ts` (raiz) e `src/lib/prisma.ts` — dois clients pro mesmo schema, não um só como o CLAUDE.md sugere.
- **~15+ instanciações de client Supabase**, sem um factory único reusado: 7 módulos "singleton" redundantes entre raiz e `src/` (`lib/supabase.ts`, `lib/supabaseAdmin.ts`, `lib/supabaseServer.ts`, `src/lib/supabase.ts`, `src/lib/supabaseServer.ts`, `supabase/client.ts`, `src/supabase/client.ts`), mais `lib/proof/adapters/supabase.ts` (instancia o próprio client ali dentro), mais 9 rotas de API com client inline (`app/api/documents/[entity_type]/[entity_id]/pdf`, `app/api/invoices/[invoice_id]/signed-pdf`, `app/api/reports/revoke`, `app/api/events/display`, `app/api/proof/export`, `app/api/proof/audit`, `app/api/proof/verify-chain`, `app/api/proof/merkle/batch`, `app/admin/reports/page.tsx`), mais 3 scripts standalone (`scripts/anchorMerkleRoot.ts`, `scripts/generateDailyMerkle.ts`, `scripts/generate-proof-events.ts`).
- **Nota de correção**: `lib/proof/adapters/supabase.ts` instancia um client com a chave `SUPABASE_SERVICE_ROLE_KEY` direto no arquivo (`process.env.SUPABASE_SERVICE_ROLE_KEY!`) — é a chave privilegiada (bypassa RLS), lida de variável de ambiente, **não é um valor hardcoded no código**. O achado real não é vazamento de segredo, é a instanciação ad-hoc: mais um ponto que abre sessão com a chave mais poderosa do banco, fora de qualquer client factory compartilhado, sem checagem centralizada de quem usa esse client pra quê.

### Status: Etapa 2 inteira fica como pendência maior, sem sub-tarefa fechada além da marcação de código morto

Esta sessão resolveu só o Achado 1 (marcação da árvore morta). Os outros 3 itens da Etapa 2 — extrair `packages/proof-engine`, criar API interna real entre os fronts, unificar de fato os ~19+ pontos de acesso a banco em poucos clients oficiais, e testes de contrato — **não foram iniciados**. Ficam para sessões futuras, provavelmente quebrados em sub-partes menores dado o volume (a extração de package sozinha mexe em ~70 arquivos de `lib/proof/`; a unificação de banco mexe em ~19 pontos de instanciação espalhados por `app/`, `lib/`, `src/lib/`, `scripts/`).

## ✅ Migração dos 4 widgets do dashboard concluída e confirmada com dado real (2026-08-31)

Fecha o ciclo aberto na seção "❌ Hipótese do Redis derrubada" (2026-08-31, acima): as 4 funções SQL (`dashboard_kpis`, `dashboard_executions_over_time`, `dashboard_executions_by_campaign`, `dashboard_executions_by_player`) foram reescritas via `apply_migration` no Supabase (`CREATE OR REPLACE FUNCTION`, mesma assinatura e nome — nenhum código das rotas `app/api/dashboard/*` precisou mudar) trocando `FROM play_logs_certified` → `FROM display_events`, `started_at` → `played_at`, `duration_seconds` → `duration`, e adicionando `WHERE player_id IS NOT NULL` (exclui as ~3 linhas legadas de `app/api/events/display/route.ts`, rota diferente que grava `duration` fixo em 10 sem `player_id`).

**Testado direto no banco com os últimos 30 dias reais, antes de qualquer commit**: `dashboard_kpis` → `{total_executions: 56973, active_players: 2, total_seconds: 634665, active_campaigns: 0}`; `dashboard_executions_over_time` → série horária real e plausível; `dashboard_executions_by_player` → (depois do Gap 2 corrigido, ver abaixo) `LeMelo Café & Confeitaria: 52.770` e `Barbearia Zimermam: 4.203` — dado real, nomeado, pela primeira vez desde que o dashboard interno existe.

### Gap 2 corrigido: `players.name` nunca era escrito em nenhum ponto do fluxo de pareamento

Rastreado o ciclo de vida completo do player: nem `app/api/player/activate/route.ts` (criação) nem `app/api/admin/players/link/route.ts` (pareamento) jamais escreviam `players.name` — campo puro NULL desde sempre, não regressão. `app/api/admin/players/link/route.ts` já buscava `studio_clients.name` na mesma query que resolve o `code` (usado só na resposta JSON) — reaproveitado, sem custo de query extra:

```ts
await pool.query(
  `UPDATE players SET paired = true, paired_at = NOW(), player_code = $1, name = $2 WHERE id = $3`,
  [clientCode, client.rows[0].name, player_id]
)
```

Rodado o backfill pros players já pareados antes desse fix (`apply_migration`, `backfill_players_name_from_studio_clients`):
```sql
UPDATE players p SET name = sc.name
FROM studio_clients sc
WHERE sc.code = p.player_code AND p.paired = true AND p.name IS NULL;
```
Confirmado: **4 de 5 players pareados passaram a ter nome** (o 5º tem `player_code` que não bate com nenhum `studio_clients.code` — pareamento órfão, fora de escopo deste fix). Os 2 players ativos (que geram execuções reais) agora mostram `"Barbearia Zimermam"` (`BARBE332`) e `"LeMelo Café & Confeitaria"` (`LEMEL186`) em vez de `NULL`.

### Gap 1 — pendência definitiva: `campaign_id` não é recuperável retroativamente

Investigação exaustiva (ver achados anteriores): `app/api/player/event/route.ts` nunca recebe nem escreve `campaign_id` no `INSERT INTO display_events`, mesmo a coluna existindo na tabela. Metade do volume de eventos vem de `institutional_media` (sem `campaign_id` por design — conteúdo institucional, não campanha paga, não é bug). A outra metade referencia `media_id`s que **não batem com nenhuma linha em nenhuma das ~130 tabelas do schema `public` com coluna `id uuid`** (busca exaustiva via bloco PL/pgSQL, testado contra todas de uma vez) — e `display_events` não tem nenhuma foreign key declarada em `media_id` (nem em `player_id`/`campaign_id`) que indique um destino pretendido. Não há como derivar `campaign_id` desses IDs com o dado disponível hoje.

**Fica como pendência definitiva, não como "investigar mais depois"**: só é resolvível dali pra frente, mudando o contrato de `POST /api/player/event` (`docs/api-contract.md`) pra o player (web + Android nativo) passar `campaign_id` explicitamente no payload do evento — exige coordenação com a frente Android, não é fix só de backend. `dashboard_executions_by_campaign` continua retornando `[]` até essa mudança de contrato acontecer.

## ⚠️→✅ `POST /api/reports/verify` — fix mínimo aplicado (2026-09-01); funcionalidade real de certificação de PDF continua pendente

**Diferente das outras pendências desta seção (que são arquiteturais/de organização de código), esta é uma funcionalidade comercial real quebrada em produção agora, pra qualquer usuário que tentar usar.**

Achado durante a limpeza da duplicata `services/pdf/pdfCertification.ts` (ver seção abaixo): ao tentar validar `getPdfCertificationByHash` com dado real antes de documentar a remoção como segura, descobri que a tabela `PdfCertification` (o model Prisma usado por essa função) **não existe no banco de produção**:

```sql
select table_name from information_schema.tables where table_schema='public' and lower(table_name) = 'pdfcertification';
-- []
select table_name from information_schema.tables where table_schema='public' and lower(table_name) = '_prisma_migrations';
-- []
```

**Não existe nem a tabela `_prisma_migrations`** — ou seja, o Prisma **nunca rodou uma migration real** contra esse banco (o mesmo banco que `pg.Pool`/`display_events`/`event_chain`/etc. usam a sessão inteira — confirmado repetidamente com dado real, não é um banco diferente). As únicas tabelas de certificação que existem de fato são `digital_certifications`, `certifications`, `v_proof_certifications` — schema diferente (snake_case), usado por outros caminhos de código (`lib/proof/adapters/db.ts`, `lib/proof/adapters/supabase.ts`), não relacionado ao model Prisma `PdfCertification`.

**Impacto real**: `POST /api/reports/verify` (`app/api/reports/verify/route.ts`) — endpoint que recebe upload de PDF, recalcula o hash SHA-256 e busca a certificação registrada pra validar a assinatura — **sempre falha** pra qualquer PDF real. `db.pdfCertification.findUnique(...)` lança erro de "tabela não existe", cai no `catch` da rota, e devolve `{ error: "Erro interno na verificação" }` com `500`. `storePdfCertification` (função irmã, sem nenhum chamador no repo hoje) também falharia do mesmo jeito se algum dia for usada.

**Não é causado nem relacionado à limpeza de duplicata desta sessão** — o arquivo vivo (`src/services/pdf/pdfCertification.ts`) não foi tocado, só sua cópia morta e inalcançável foi removida. O bug é anterior, só foi descoberto agora ao tentar testar com dado real.

**Fica registrado como pendência crítica separada, não resolvida nesta sessão**: precisa decidir se roda a migration do Prisma (`npx prisma db push` ou `migrate deploy`) pra criar a tabela de verdade, ou se abandona esse caminho e reescreve `getPdfCertificationByHash`/`storePdfCertification` pra usar uma das tabelas de certificação que já existem e têm dado real (`digital_certifications`/`certifications`) — decisão de produto, não só técnica, já que envolve escolher qual schema de certificação é o "de verdade" daqui pra frente.

### ✅ Atualização (2026-09-01) — fix mínimo aplicado e testado em produção

**O que foi feito**: `app/api/reports/verify/route.ts` agora isola a consulta de certificação (`getPdfCertificationByHash`) num `try/catch` próprio. Durante a implementação, achado adicional: o `import("@/services/pdf/pdfCertification")` estava **fora** do `try` da rota — e como esse módulo importa `@/lib/prisma`, e o client Prisma nunca inicializou de verdade em produção (`Error: @prisma/client did not initialize yet`), o próprio `import` já lançava a exceção, antes de qualquer `try/catch` (nem o novo, nem o genérico que já existia) rodar. Isso fazia a rota estourar um **500 vazio de infraestrutura** (sem corpo JSON nenhum), pior do que o `{error: "Erro interno na verificação"}` originalmente documentado acima. Corrigido movendo o import pra dentro do novo `try/catch`.

**Testado direto contra produção** (`curl` em `https://doohplay.com.br/api/reports/verify`, commits `2dd1f64` e `7630d98`, ambos deployados e confirmados `live`):
- Upload de arquivo real → antes: `500` vazio. Agora: `503` com `{"valid":false,"available":false,"reason":"Verificação de PDF indisponível no momento"}`.
- `POST` vazio (sem `Content-Type` multipart válido) → `500` com `{"error":"Erro interno na verificação"}` — esse é o `catch` genérico já existente, não relacionado a este fix; a rota responde rápido, sem travar/timeout.

**Isso NÃO restaura a funcionalidade real de certificação de PDF.** É só um fix de honestidade de erro: parou de devolver um 500 vazio/opaco e passou a devolver um sinal claro de "verificação indisponível". Investigação mais funda (feita antes deste fix, ver conversa da sessão) mostrou que mesmo apontando a rota pra `digital_certifications` ou `certifications` não adiantaria — nenhuma das duas tem dado real de certificação de PDF hoje: `digital_certifications` é escrita por código de demonstração/scaffold com valores placeholder literais (`signed_hash: "SIGNATURE_PENDING"`), e a função que substituiria isso pela assinatura real (`finalizeCertification`) tem zero chamadores; `certifications` é escrita pelo pipeline real (`proofChainAggregator.ts`), mas só pra hash de evento/impressão, não de PDF. `POST /api/reports/generate` (que gera o PDF) também nunca persiste a certificação — a única tentativa de gravação usa um model Prisma `pericial_logs` que **não existe** no `prisma/schema.prisma`.

**Pendência real, registrada como próximo passo se a funcionalidade for retomada** ("opção 1" que não foi escolhida agora): rodar a migration Prisma pra criar `PdfCertification` de verdade (schema já pronto — `pdfHash`/`signature`/`algorithm`/`createdAt`, e `storePdfCertification`/`getPdfCertificationByHash` já escritos corretamente) **e** conectar a chamada que falta em `app/api/reports/generate/route.ts` pra assinar (RSA, chave já existe em `keys/private.pem`) e gravar a certificação depois de gerar o PDF. Sem isso, o endpoint de verificação continua honesto, mas nunca vai encontrar uma certificação de verdade pra nenhum PDF.

### ✅ Atualização (2026-09-02) — Opção 1 completa: migration rodada, leitura restaurada; geração real de PDF continua bloqueada por bug de terceiros

**Feito e confirmado em produção, com prova técnica (não só ausência de erro):**

1. **Tabela `PdfCertification` criada** via `CREATE TABLE IF NOT EXISTS` (mesmo SQL do `prisma/migrations/20260517000000_init_pdf_certification/migration.sql`, aplicado direto no Postgres de produção). Confirmado depois via `information_schema.columns`/`pg_indexes`: as 12 colunas e os 2 índices (`_pkey`, `_pdfHash_key` único) existem exatamente como o schema Prisma espera.
2. **Causa raiz separada encontrada e corrigida**: mesmo com a tabela criada, `/api/reports/verify` continuava devolvendo `503` — o Prisma Client nunca inicializava de verdade em produção (`Error: @prisma/client did not initialize yet`, confirmado nos logs do Render). Causa: o `buildCommand` do serviço no Render nunca rodava `prisma generate` (só o `postinstall`, que cuidava só do Puppeteer). Corrigido em duas partes: (a) `postinstall` passou a rodar `prisma generate && npx puppeteer browsers install chrome`; (b) `prisma` (o CLI) precisou ser movido de `devDependencies` pra `dependencies` — confirmado que o `npm install` desse ambiente do Render não instala `devDependencies` (um primeiro deploy com `prisma` só em `devDependencies` falhou com `sh: 1: prisma: not found`).
3. **Confirmado, com teste real de assinatura**: `signCanonicalPayloadWithPfx()`/certificado A1 (ver seção acima) segue funcionando; separadamente, `verifySignature.node.ts` tinha um bug real de formato — assinava o hash decodificado de hex (`Buffer.from(hash, "hex")`) mas verificava a string UTF-8 direto (sem decodificar) — corrigido pra decodificar hex antes de verificar, batendo com `signHash()`.
4. **`app/api/reports/generate/route.ts` agora assina e persiste a certificação** (`signHash` + `storePdfCertification`) depois de gerar o PDF, com um campo `certified` explícito na resposta (best-effort, não derruba a geração se a assinatura/persistência falhar) — antes disso, o hash era calculado mas nunca assinado nem gravado em lugar nenhum.
5. **Resultado confirmado em produção**: `POST /api/reports/verify` com upload de arquivo real → `200 {"valid":false,"reason":"PDF não certificado ou hash desconhecido"}` (antes: `503`). O caminho de leitura (tabela + Prisma Client + query real) funciona de ponta a ponta.

**Bloqueio novo, real, e não resolvido — fora do escopo original desta tarefa:**

`POST /api/reports/generate` (a rota que gera o PDF em si) **nunca funcionou pra nenhum payload real nesta rota, nem antes de qualquer mudança de hoje** — primeira vez que foi testada com dado real nesta investigação. Sempre falha com `Minified React error #31` ("Objects are not valid as a React child") vindo de dentro do reconciler do `@react-pdf/renderer` (`node_modules/@react-pdf/reconciler/lib/reconciler-23.js`), ao renderizar `reports/DashboardReport.tsx`. **Quatro hipóteses testadas e descartadas, cada uma com teste real, não suposição:**

1. `react-is` em major diferente do `react`/`react-dom` (19.x vs 18.x) — corrigido e deployado (`044cf0d`, mantido no código por ser correto por si só), erro idêntico persistiu.
2. Cache de build do Render restaurando `node_modules` antigo — deploy com `clearCache: true`, erro idêntico persistiu.
3. `@react-pdf/renderer` sendo empacotado pelo webpack do Next em vez de tratado como pacote externo — testado localmente adicionando a `serverExternalPackages`, erro idêntico persistiu, revertido (nunca commitado).
4. Runtime automático de JSX incompatível com o reconciler — `DashboardReport.tsx` reescrito localmente sem nenhum JSX (só `React.createElement` puro), erro idêntico persistiu, revertido (nunca commitado).

Stack trace real (capturado localmente, servidor dev) confirma que `element.type`/`props` do componente externo estão corretos — o erro acontece dentro do work-loop interno do reconciler, sugerindo uma incompatibilidade mais profunda entre a versão instalada (`@react-pdf/renderer` 4.5.1 / `@react-pdf/reconciler` 2.0.0) e este ambiente, possivelmente um bug da própria biblioteca. **Decisão explícita**: não investigar mais por hoje. Próxima hipótese não testada, se retomado: downgrade do `@react-pdf/renderer` pra uma versão mais antiga conhecida como estável.

**Efeito prático**: como nenhum PDF real é gerado, nenhuma certificação real é criada ainda, e o teste ponta a ponta completo (gerar → assinar → verificar com sucesso) continua bloqueado — mas por um bug de biblioteca de terceiros na geração do PDF, não por nada relacionado a `PdfCertification`/Prisma/certificado A1, que já estão confirmados funcionando.

## ✅→⚠️ `POST /api/reports/generate` desbloqueado (Puppeteer no lugar do `@react-pdf/renderer`); novo achado separado na verificação de assinatura (2026-09-03)

Retomando o bloqueio acima. Investigação de 5ª hipótese (downgrade de versão) pedida antes de qualquer implementação:

**Changelog/issues públicas checadas primeiro**: encontrados relatos do mesmo erro exato ("Minified React error #31", `object with keys {$$typeof, type, key, props, _owner, _store}`) especificamente em **Next.js 15** ([issue #2994](https://github.com/diegomura/react-pdf/issues/2994), [#2940](https://github.com/diegomura/react-pdf/issues/2940), ambas sem fix documentado); página oficial de compatibilidade só cobre um bug anterior a Next 14.1.1 (workaround já testado nesta investigação, hipótese 3 acima, sem efeito).

**Teste empírico decisivo**: um repro isolado (`React.createElement(DashboardReport, body)` + `renderToBuffer`, fora do Next.js, via script `tsx`) funcionou perfeitamente com a versão instalada (4.5.1/reconciler 2.0.0) — PDF real gerado, sem erro. Rodando o mesmo código **dentro do servidor Next.js 15 real** (`npm run dev` + `curl`), o erro reproduziu exatamente. Testadas 3 versões do `@react-pdf/renderer` nesse mesmo servidor: **4.5.1 (atual), 4.9.0 (mais recente disponível) e 3.4.5 (downgrade) — as três falham idêntico dentro do Next, nenhuma falha fora dele.** Conclusão: o bug não está em nenhuma versão específica da lib — é uma interação entre este Next.js 15.1.11 e qualquer reconciler React customizado que a biblioteca usa.

**Decisão**: trocar a engine de geração, não a versão da lib. Testado localmente que Puppeteer HTML→PDF (`page.pdf()`) funciona sem erro no mesmo servidor Next.js onde o `@react-pdf/renderer` falhava — 2 rodadas, payloads diferentes, sem instabilidade.

**Implementado** (commit `ef26cd1`, deploy `live`): `reports/buildDashboardReportHtml.ts` (função pura, mesmo padrão de template HTML de `lib/publishMedia.ts`) + `reports/renderReportPdfBuffer.ts` (mesmo check de instalação do Chrome já usado em `publishMedia.ts`, crítico no Render). Só a geração do buffer mudou em `app/api/reports/generate/route.ts` — hash/QR/assinatura/persistência/idempotência/`pericial_logs` continuam idênticos, operando sobre o buffer resultante. `reports/DashboardReport.tsx` **não foi removido** — `app/api/reports/dashboard/route.ts` (rota separada, hardcoded/scaffold, fora do escopo, usa `renderToStream`) ainda depende dele e provavelmente tem o mesmo bug, não testado/corrigido aqui.

**Limite testado e documentado**: saída do Puppeteer não é byte-determinística (mesmo HTML gerado 3x produziu 3 hashes SHA-256 diferentes, mesmo tamanho de arquivo — provavelmente `/CreationDate` do Chrome). Não é regressão: `@react-pdf/renderer`/`pdfkit` também embutem timestamp por padrão. Sem risco prático hoje porque a rota nunca persiste nem devolve os bytes do PDF, só o hash de uma geração — mas fica documentado no código como pendência de design pra quando/se existir "baixar o PDF certificado" (precisa cachear os bytes exatos da certificação, nunca regenerar sob demanda).

`tsc --noEmit`: baseline sobe de 62 pra 63 — 1 erro novo, mesmo padrão `"networkidle0"` já tolerado hoje em `lib/publishMedia.ts` e `app/api/client/generate-creative/route.ts` (falha de tipos do `@types/puppeteer`, não de runtime).

### Teste real de ponta a ponta em produção — hash bate certinho; assinatura não

Pedido explícito: não considerar fechado sem ver `POST /api/reports/verify` encontrando de verdade a certificação gerada. Como o Puppeteer não é determinístico (achado acima), chamar `generate` duas vezes não produz bytes que batem com uma certificação já criada — precisava dos bytes exatos da mesma chamada que gravou a certificação. Rota temporária (`app/api/zztmp-verify-loop`, mesma lógica exata de `generate/route.ts`, só devolvendo os bytes também) deployada, testada, e removida em seguida (commits `9428ee8`/`9f38092`):

1. `POST` na rota temporária → `certified: true`, `pdfHash` real, bytes do PDF capturados.
2. Esses bytes exatos reenviados pra `POST /api/reports/verify` real → **`certificationId`/`certifiedAt` reais retornados** — confirma que o hash recalculado a partir do arquivo bate certinho com o que foi persistido na geração. Isso responde diretamente a preocupação de que engines diferentes pudessem produzir hashes que não batem — não é o caso, o hash é só SHA-256 sobre os bytes, agnóstico de qual engine os produziu.
3. Mas a resposta veio `"valid": false` — a verificação de assinatura RSA falhou. **Achado novo, separado, não resolvido**: é a primeira vez que o loop completo (gerar → assinar → persistir → verificar) roda de ponta a ponta em produção — nunca tinha chegado até aqui antes, sempre bloqueado pelo bug do `@react-pdf/renderer`.

**✅ Confirmado (2026-09-03), via rota de diagnóstico temporária** (`app/api/zztmp-key-diag`, deployada, testada, removida em seguida — commits `5e46bf5`/`ae3937d`; nunca expôs a chave em si, só hashes SHA-256 pra comparação):

```json
{"hasSecretFile": true, "hasPrivatePemEnv": true, "resolvedFrom": "/etc/secrets/private.pem", "keysMatch": false}
```

`/etc/secrets/private.pem` **existe** em produção neste serviço (provavelmente sobra de outra finalidade — `/etc/secrets/` aqui também guarda `certificado-a1.pfx`, achado de sessão anterior). `PRIVATE_PEM` **também está configurada**. `signHash()` (`src/services/pdf/pdfSigner.ts`) seguia sua ordem de prioridade e usava `/etc/secrets/private.pem` — nunca chegava a usar `PRIVATE_PEM`. A chave pública derivada de `/etc/secrets/private.pem` **não bate** com `keys/public.pem`.

**Fix aplicado** (commit `92edaee`): reordenada a prioridade em `signHash()` pra checar `PRIVATE_PEM` primeiro, com base na suposição (do commit `f699314`, 31/05/2026, *"fix: public.pem correto correspondente ao `PRIVATE_PEM` do doohplay-demo"*) de que essa era a chave certa.

### ❌ Correção (mesmo dia) — o fix de prioridade não resolveu; a suposição sobre `PRIVATE_PEM` estava errada/desatualizada

Refeito o teste completo generate→verify depois do deploy do fix — **`valid:false` persistiu**. Reconfirmado via nova rodada de diagnóstico (mesma rota temporária, deployada e removida de novo — commits `f711bfe`/`1f7b7ca`): `resolvedFrom` agora mostra `"PRIVATE_PEM (env var)"` de fato (o fix de prioridade funciona corretamente, sem erro de formato ao decodificar a chave) — mas `keysMatch` continua `false`. A chave pública derivada de `PRIVATE_PEM` (`dfa63db4...`) **também não bate** com `keys/public.pem` (`125c333e...`).

**Conclusão real**: nenhuma das duas chaves conhecidas (`/etc/secrets/private.pem`, `PRIVATE_PEM`) corresponde a `keys/public.pem` hoje. A suposição de que o commit `f699314` (maio/2026) ainda refletia o par de chaves correto não se sustentou — ou `PRIVATE_PEM` foi rotacionada depois sem atualizar `keys/public.pem`, ou a correção de maio nunca foi completa. O fix de prioridade em `signHash()` continua correto por si só (`PRIVATE_PEM` é a fonte de verdade *pretendida*, não deveria perder pra um Secret File por acidente) — mas não resolveu o `valid:false` sozinho, porque o problema real é mais fundo: **não se sabe hoje qual chave privada, se alguma das disponíveis, corresponde à pública versionada.**

**Decisão pendente do usuário**: gerar um par de chaves novo e sincronizado (privada em `PRIVATE_PEM`, pública commitada em `keys/public.pem`) é provavelmente o caminho mais seguro daqui — tentar adivinhar/testar mais candidatas de chave não é produtivo sem uma fonte confiável de qual é a correta.

## ✅ Etapa 2 — sub-parte 1 concluída: consolidação de `pg.Pool` e `PrismaClient` duplicados (2026-08-31)

Primeira sub-parte da unificação de acesso a banco (`DOOHPLAY_Plano_Separacao_Fronts.docx`, Etapa 2, item 3), planejada por `arquiteto-agent` e executada nesta sessão. Supabase (~15 instanciações) fica deliberadamente fora de escopo — sub-parte futura separada.

- **`pg.Pool`**: `app/api/verify/[hash]/route.ts` tinha um `new Pool(...)` inline, sem nenhum timeout configurado, duplicando `lib/db.ts` (o oficial, com `connectionTimeoutMillis`/`query_timeout`/`statement_timeout`/`idleTimeoutMillis`). Trocado pelo `pool` compartilhado de `@/lib/db` — zero mudança de lógica de query, só a origem da conexão (a rota já engolia qualquer erro de query num `try/catch` com fallback via Supabase). Testado com hash real de produção antes e depois do deploy — resposta idêntica (`event_id` e `merkle_root` resolvidos corretamente pela camada `merkle` do motor de prova).
- **`PrismaClient`**: `src/lib/prisma.ts` e `lib/prisma.ts` (raiz) eram idênticos byte a byte. Confirmado que o alias de webpack explícito em `next.config.ts` (`"@/lib": path.resolve(__dirname, "lib")`) sempre resolve `@/lib/prisma` pra raiz — `src/lib/prisma.ts` tinha **zero consumidor real**, era código morto não documentado. Removido. `CLAUDE.md` corrigido (tabela de Database Layer + seção Path Aliases, que tinha a regra "prefer `src/`" invertida pro caso de `@/lib`).
- **Achado colateral resolvido também**: `services/pdf/pdfCertification.ts` (raiz) vs `src/services/pdf/pdfCertification.ts` — mesmo padrão, também idênticos byte a byte, mas desta vez na **direção oposta**: `@/services` aponta pra `src/services` no `next.config.ts`, então é a cópia da **raiz** que era morta (zero consumidor; o único consumidor real, `app/api/reports/verify/route.ts`, importa via `@/services/pdf/pdfCertification`, que resolve pra `src/`). Removida. `tsc --noEmit` limpo nos dois casos, nenhum consumidor oculto surgiu.
- **Lição registrada no `CLAUDE.md`**: os dois casos resolvem em direções opostas (`@/lib` → raiz vence; `@/services` → `src/` vence) — nunca assumir qual lado está vivo sem checar `next.config.ts` primeiro.

Próximos passos desta etapa (não iniciados): extrair `packages/proof-engine`, criar API interna real entre os fronts, sub-parte 2 da unificação de banco (~15 instanciações Supabase), testes de contrato.

## ⚠️ Achado — dado sintético de teste misturado no histórico de `display_events`/`proof_chain` (2026-08-31)

Descoberto ao investigar por que "Proofs Registrados" aparecia maior que "Execuções" no novo widget de Central de Controle (achado separado, ver seção acima sobre o pipeline processar backlog em lote — não é a causa desta contaminação, são dois achados distintos surgidos na mesma investigação).

`scripts/generate-proof-events.ts` é um script standalone que gera dado **100% sintético** — `campaign_id`, `player_id`, `location_id` todos via `crypto.randomUUID()`, sem relação com nenhum registro real — e insere direto em `display_events` e `proof_chain` (não em `event_chain`/`certifications`, tabelas diferentes). Confirmado que rodou pelo menos uma vez, em **10-11/03/2026**:
- `proof_chain`: 1.003 linhas, todas datadas de `2026-03-10 15:14` a `2026-03-11 15:34` — bate com `generateEvents(1000)` chamado no fim do script.
- `display_events`: **5.593 linhas** com `player_id` que não corresponde a nenhum registro real em `players` (confirmado via `LEFT JOIN players` retornando `NULL`), datadas de `2026-03-10` a `2026-07-21`.

**Não afeta os números atuais**: todas as 5.593 linhas órfãs são anteriores à janela de 30 dias usada pelos widgets do dashboard e da Central de Controle (confirmado: zero delas caem nos últimos 30 dias) — não contaminam nenhum KPI mostrado hoje. Mas ficam misturadas no total histórico/all-time de `display_events` (578.408 linhas totais, ~1% são esse dado sintético) — vale saber que existe antes de usar qualquer métrica all-time dessa tabela no futuro, e considerar limpar essas 5.593 linhas (e as 1.003 de `proof_chain`) numa sessão futura, já que não representam nenhum evento real.

## 📋 Decisão registrada — editor de canvas livre (ferramentas do TVScreenDesigner) NÃO iniciado, por escolha consciente (2026-08-31)

Durante o planejamento de trazer o visual/chrome do protótipo `TVScreenDesigner.tsx` (Figma Make, "TV Studio") pro Studio real (`app/studio/[code]/page.tsx`), veio à tona a paleta de ferramentas flutuante do protótipo (Select/Hand/Text/Shape/Image) — no Figma ela é só um seletor visual sem lógica de edição por trás, mas sugere um editor de canvas livre (arrastar/redimensionar/empilhar elementos individuais numa composição). Registrando aqui, como decisão consciente, que isso **não está iniciado e não faz parte de nenhum plano em andamento**, porque não é um port visual pequeno — é uma feature nova do zero, com pré-requisitos reais:

1. **Motor de composição por camadas** — novo, do zero. Hoje o editor real não tem noção de "camadas": cada anúncio é uma peça única renderizada por `AdPreview` a partir de um template fixo + campos de formulário (`headline`/`subline`/`cta`/`phone`/imagem de fundo). Não existe um modelo de dado de elementos independentes (texto, forma, imagem) posicionáveis livremente.
2. **Schema novo no banco** — pra salvar/carregar composições arbitrárias (posição, tamanho, z-index, estilo por elemento), algo que não existe em nenhuma tabela hoje (`studio_clients`, `client_screens` etc. não têm esse formato).
3. **Mudança no player** — tanto o player web quanto o **app Android nativo** (fora deste repositório, front separado) precisariam aprender a renderizar composições arbitrárias em vez de só os templates fixos que conhecem hoje. Isso exigiria mudança de contrato (ver `docs/api-contract.md`) e coordenação direta com a frente Android — o mesmo tipo de risco de divergência que já causou o incidente de 25/06/2026 (categorias erradas e vazamento de conteúdo entre clientes) quando um front mexeu em algo compartilhado sem coordenar com o outro.

**Escopo estimado**: várias semanas, não um port de UI. **Decisão**: não fazer agora. No lugar, a iniciativa em andamento é o reskin visual "honesto" do Studio real — trazer cores/ícones/espaçamento estilo NOC do protótipo para os elementos que **já são reais** (zoom do preview, galeria de templates, cor de marca do cliente, abas existentes), sem adicionar nenhum dado fictício (sem contador de audiência, receita ao vivo ou ticker de hashes — todos `Math.random()`/`setInterval` no protótipo, todos excluídos deliberadamente) e sem prometer capacidade de edição livre que o produto não tem. Se o editor de canvas livre for retomado no futuro, precisa de uma decisão e planejamento próprios, não uma continuação informal deste reskin.

## ✅ Investigação — "Erro de conexão" no login de LEMEL186 e heartbeat de players (2026-09-01/02)

Investigação em três frentes, todas concluídas sem necessidade de correção de código. Registrando aqui pra não repetir a mesma investigação nem a mesma confusão de nomenclatura no futuro.

### Confusão de nomenclatura resolvida: `LANCH525` não é "código errado" — é um `player_code` órfão, sem relação com `LEMEL186`

Uma pendência antiga citava "confirmar pareamento de `DHP-B07BDB`" e, separadamente, uma tentativa de investigação buscou o cliente `LANCH525` em `studio_clients` sem achar nada. As duas coisas são a mesma confusão: `DHP-XXXXXX` é um código de ativação **derivado on-the-fly** do `player.id` (6 primeiros caracteres hex do UUID, sem hífens, maiúsculo — ver `app/api/player/activate/route.ts`, `app/api/client/screens/purchase/route.ts`), não um valor salvo em coluna nenhuma. `DHP-B07BDB` corresponde ao player `b07bdb30-6d2c-4b5d-8e7d-d47591bbb9de`, cujo `player_code` é **`LANCH525`** — um valor real na tabela `players`, só que **não existe como `studio_clients.code`** (por isso a busca por cliente não achava nada — código certo, tabela/namespace errado pra buscar). Esse player está **órfão**: `paired=true`, mas sem nenhuma linha em `studio_clients` apontando pra ele (nem por `code`, nem por `player_id`), parado desde 2026-07-18 (45+ dias). Não tem nenhuma relação com o cliente real `LEMEL186` — são dois códigos parecidos por coincidência (`LANCH525` vs `LEMEL186`), em tabelas/contextos diferentes.

### Login OTP de LEMEL186 — "Erro de conexão. Tenta de novo."

Investigado com log real de produção (Render) no momento do incidente: 5 tentativas de `POST /api/client/auth/request-otp` (a rota real usada pela tela, **não** `/api/auth/otp/send` — achado à parte, ver abaixo), todas `200 OK` em 32-127ms, sem nenhum erro no servidor nem no envio de WhatsApp em segundo plano. O texto de erro vem do `catch` do `fetch()` no navegador (`client-login-gate.tsx`), que só aparece quando a requisição nunca recebe resposta HTTP — ou seja, é falha de rede do lado do cliente/estabelecimento, não bug de servidor. Sem correlação com deploy (o deploy mais próximo terminou 30+ min antes do incidente) nem com o middleware (que não roda nessas rotas desde 26/08).

**Achado à parte, útil pra próxima investigação de auth**: os fixes de timeout documentados em 17/07/2026 (`lib/whatsapp.ts`, `app/api/auth/otp/send/route.ts`) continuam ativos, mas essa **não é a rota que o login do cliente realmente usa**. A rota real (`app/api/client/auth/request-otp/route.ts`) é diferente, também usa `sendWhatsApp` de `lib/whatsapp.ts` (herda o timeout), e além disso dispara o envio em modo fire-and-forget (sem `await`) — a resposta ao navegador não depende do resultado do WhatsApp, então um timeout da Evolution API não consegue causar esse erro específico nessa rota.

### Heartbeat de players — escopo checado por completo, sem incidente de infraestrutura

Investigação ampla pedida porque um heartbeat parado (LEMEL186 sem `last_ping` desde 2026-08-24) levantou a hipótese de falha de infraestrutura mais ampla. Checado com consulta completa: **só existem 2 `studio_clients` ativos na base inteira** (`BARBE332`, `LEMEL186`) — não há terceiro cliente pagante que pudesse estar afetado silenciosamente. A tabela `players` tem 7 linhas no total; os 5 registros parados (`LANCH525`/`DHP-B07BDB`, 2 duplicatas órfãs de `BARBE332`, e 2 players de teste óbvios — um com UUID de seed `cccccccc-0001-...` e um chamado `TV01`) têm datas de parada **individuais e escalonadas** (45/49/51/64/88 dias, sem nenhum horário coincidente) — padrão de causas individuais/dado de teste abandonado, não de uma falha central (que pararia vários players no mesmo instante). Depois que o dono religou fisicamente os dois aparelhos, `BARBE332` e `LEMEL186` voltaram a pingar no ritmo histórico normal (~20-30s), confirmado em checagens repetidas.

**Nenhuma correção de código foi necessária ou proposta em nenhuma das três frentes.** Escopo desta investigação inteira: leitura/consulta em `app/`, nenhuma mudança em `src/`.

## Arquitetura (resumo)

- **Pipeline de prova (real)**: `runProofChainAggregator()` em `lib/proof/aggregator/proofChainAggregator.ts`, agendado a cada 5 min via `worker.ts` (serviço `doohplay-workers`) → assina eventos pendentes de `event_chain` → Merkle tree → `event_blocks` → ancora na Polygon → TSA → `certifications`. Ver achado acima sobre o pipeline morto (`evidence`/`buildBlock.ts`/`runProofPipeline.ts`) que não deve ser confundido com este.
- **Portal de verificação pública**: `/verify/[hash]`.
- **Ad server**: `POST /api/adserver/play`, `POST /api/adserver/impression`.
- **Trust graph & alertas**: detecção de fraude por relacionamento entre telas/campanhas/anunciantes/operadores; motor de políticas de alerta.
- **Dashboard**: `/dashboard`, filtros de período, componentes com `SafeBlock`.

## ✅ Investigação — causa raiz real dos timeouts de conexão (`Query read timeout`/`Connection terminated`) em `player/event`, `player/heartbeat`, `playlist GET` (2026-09-02)

Pendência antiga (registrada em 17/07/2026 em documento externo, sem anexo nesta sessão) apontava `lib/db.ts` sem `connectionTimeoutMillis`/`statement_timeout` como causa. **Investigação direto na fonte revelou que essa premissa estava desatualizada**: os timeouts já foram adicionados no commit `4ecccb8` (20/07/2026) — `connectionTimeoutMillis: 8000`, `query_timeout: 10000`, `statement_timeout: 10000`, `idleTimeoutMillis: 30000`. Front confirmado: `lib/db.ts` é compartilhado entre `app/` e `src/` (`src/lib/db.ts` é só um re-export do arquivo raiz; 14 arquivos em `src/` dependem dele).

**Causa raiz real, confirmada com dado ao vivo do banco de produção** (`pg_stat_activity`, `pg_locks`, `pg_indexes`, `EXPLAIN ANALYZE`): `event_chain` é uma tabela **particionada por data**, mas nenhuma partição foi criada desde 04/2026 — todo evento dos últimos ~5 meses caiu na partição `event_chain_default` (87 mil+ linhas, 218 MB, só cresce). A query em `appendToProofChain()` (`app/api/player/event/route.ts`) fazia `SELECT event_hash FROM event_chain ORDER BY id DESC LIMIT 1`, mas **nenhum dos 13 índices da tabela cobre a coluna `id`** — só `created_at`, `event_hash`, `chain_index`, etc. Sem índice em `id`, a query forçava varredura sequencial + sort completo a cada evento real de player. Sob concorrência, isso esgotava o pool de conexões e derrubava até queries completamente não relacionadas (confirmado: cheguei a ver 8 execuções simultâneas dessa mesma query presas entre 6 e 84 segundos, e minhas próprias consultas de diagnóstico via Supabase MCP também começaram a falhar com o mesmo erro).

**Fix aplicado** (commit `65d8661`, deployado): trocado `ORDER BY id DESC` por `ORDER BY created_at DESC` — usa o índice já existente (`idx_event_chain_created_at`), monotonicamente equivalente pra achar a linha mais recente. `EXPLAIN ANALYZE` confirmou o plano mudando de sequential scan pra Index Scan em cada partição.

### ❌ Correção (2026-09-02, mesmo dia) — "recuperação" relatada antes estava incompleta; o fix NÃO resolveu o sintoma sozinho

**Checagem original, incompleta**: logo após o deploy do fix, observei uma janela de ~10 chamadas seguidas de `/api/player/event` todas `200`/rápidas (191-360ms) e reportei isso como "sistema recuperado". Essa amostra era pequena demais e a janela foi só um alívio temporário, não uma resolução.

**Checagem real, mais ampla, feita depois** (`Connection terminated`/`Query read timeout`, desde `17:17:04` — exato momento do deploy do fix — até `17:33:03`): os erros **continuaram** depois do deploy, em múltiplas ocorrências, e — achado decisivo — **em `playlist GET` e `[heartbeat]`, que não tocam `event_chain` e não foram afetados pelo fix**. Ou seja, a contenção não é (só) a query específica que corrigi — é algo mais amplo na instância do Postgres, afetando várias rotas ao mesmo tempo, ainda ativo depois do fix.

**O que isso significa pro fix aplicado**: a correção do plano de execução (`ORDER BY created_at` em vez de `id`, usando índice) continua sendo real e correta — verificada via `EXPLAIN ANALYZE`, plano mudou de sequential scan pra Index Scan. Isso não está em questão. O que estava errado foi a conclusão de que isso **resolveu o sintoma observado em produção** — não resolveu, pelo menos não sozinho, porque a causa da contenção mais ampla (afetando rotas que nem tocam `event_chain`) continua sem explicação completa.

**Achado estrutural separado, maior, ainda não resolvido**: falta manutenção de partições de `event_chain` desde 04/2026 (nenhum job cria as partições mensais seguintes) — isso continua verdadeiro e é uma causa de fundo real, mas não explica sozinho por que `playlist GET`/`heartbeat` também timeout. A causa da contenção mais ampla na instância do Postgres (recursos? outro processo concorrente? algo do lado do Supabase?) segue **não diagnosticada**. Registrado como pendência própria abaixo, com escopo revisado.

## ✅ Investigação — causa raiz da contenção ampla no Postgres: instância subdimensionada (`work_mem` de ~2MB) (2026-09-02)

Continuação da investigação acima. Confirmado direto no banco (`pg_stat_database`, `pg_stat_statements`, `current_setting`): a instância tem `work_mem: 2184 kB` (~2,1 MB), `shared_buffers: 224 MB`, `effective_cache_size: 384 MB` — consistente com o tier de computação mais básico do Supabase. Cache hit ratio está ótimo (99,92%, não é falta de memória de cache) — o problema é `work_mem` minúsculo: qualquer query que precise ordenar/agregar mais que ~2MB de dado (a maioria de queries analíticas reais) transborda pra disco (temp files). `pg_stat_database` mostra **~981 GB acumulados** em `temp_bytes` na vida do banco.

**Dois maiores consumidores identificados**:
1. **`dashboard_kpis($1,$2)`** (código nosso) — 4.587 chamadas, ~3,1 GB em temp files no total. A função (`COUNT(DISTINCT player_id)`, `COUNT(DISTINCT campaign_id)` sobre `display_events`, 583 mil linhas) já usa o índice certo em `played_at` (`idx_display_events_played_at`) — o gargalo não é índice faltando, é o `work_mem` estourando no `COUNT(DISTINCT)`.
2. Uma query interna do **próprio Supabase Studio** (não é código nosso — comentário na query confirma `-- source: dashboard`, é a página "Database Functions" do painel) — 1.656 chamadas, ~14,7 GB em temp files. Não é algo que dá pra mitigar via código; é tráfego gerado por navegar no painel do Supabase. Investigado e descartado como algo acionável aqui.

**Mitigação aplicada** (commit `d597005`, deployado `2026-09-02 20:13:13`): `app/dashboard/components/Kpis.tsx` chamava `dashboard_kpis` a cada 10s via `useAutoRefresh` — reduzido pra 30s no código. Reduz a frequência de chamadas em 3x, sem custo, sem mudança perceptível (KPIs agregados não precisam atualizar a cada 10s). **Não resolve o `work_mem` pequeno em si** — só reduz a exposição a ele.

### ❌ Correção (mesmo dia) — verificação com dado real revelou duas coisas que eu tinha presumido errado

Pedido explícito de confirmar com checagem real, não suposição, revelou:

1. **Não dá pra atribuir a melhora dos timeouts a nenhuma das duas correções de hoje.** Log real: o episódio agudo de contenção (`Connection terminated`/`Query read timeout` em `player/event`, `heartbeat`, `playlist GET`) foi de `17:17` até `17:36:33` — e **não ocorreu nenhuma vez desde então** (confirmado em janelas de log até `20:17`). Ou seja, o episódio se resolveu sozinho **~2h30 antes** do deploy do fix de KPIs (`20:13:13`), e horas depois do fix de `event_chain` (`17:17:04`) já estar no ar sem impedir o próprio episódio. Não há base pra dizer que qualquer uma das duas correções causou essa melhora — os dados não sustentam essa causalidade.
2. **O intervalo de 30s ainda não foi confirmado com tráfego real.** `pg_stat_statements` mostra `dashboard_kpis` com exatamente o mesmo número de chamadas de antes do deploy (`calls: 4587`, sem nenhuma chamada nova) — ninguém abriu o `/dashboard` com esse widget montado desde então. O código está correto (mudança revisada, uma linha), mas confirmação com tráfego real depende de alguém acessar o dashboard; não foi observado ainda.

**O que continua válido, com evidência real**: `work_mem` de ~2MB é real e confirmado (`current_setting`); `dashboard_kpis` como maior consumidor de `temp_bytes` do código da aplicação é real e confirmado (~3,1GB de `temp_blks_written` acumulados); a mitigação (30s) está deployada e correta no código. O que **não** é sustentado pela evidência: qualquer alegação de que essas mudanças "resolveram" o episódio de contenção observado hoje — esse episódio já tinha passado sozinho antes de qualquer uma delas entrar em produção.

**Decisão pendente, do usuário, não técnica**: aumentar o tier de computação do Supabase (custo/billing) resolveria o `work_mem` na raiz. Registrada como pendência separada abaixo — sem urgência adicional dos dados de hoje, já que o episódio agudo não se repetiu, mas a causa estrutural (`work_mem` pequeno) continua presente e pode voltar a se manifestar sob carga.

### ⚠️ Investigação relacionada — erro "Erro de conexão" no login de cliente via OTP, não é regressão (2026-09-05)

Reportado um erro real no `client-login-gate.tsx` ("Erro de conexão. Tenta de novo.") no passo de pedir OTP via WhatsApp. Investigado com dado real, não suposição, apesar de já termos investigado mensagem idêntica duas vezes antes nesta mesma sessão:

- **Logs reais do Render** pra `POST /api/client/auth/request-otp` nos minutos do incidente: **100% `200 OK`**, `33ms`–`186ms` de resposta, incluindo um cluster de 5 tentativas seguidas do mesmo IP em ~30s (consistente com o usuário tentando de novo após o erro). Nenhum `500`, nenhum timeout.
- `lib/whatsapp.ts` e a rota não são alterados desde o fix de 17/07/2026 (`4c1e896`) — sem regressão de código. A rota nem espera o envio do WhatsApp terminar antes de responder (fire-and-forget), então nem um travamento do `lib/whatsapp.ts` bloquearia a resposta HTTP.
- Chamada real, ao vivo, feita durante a investigação: `200 OK`, `0.58s` (round-trip completo).

**Conclusão**: não é o mesmo tipo de causa das duas vezes anteriores reaparecendo por regressão — os dados não sustentam isso. Hipótese mais plausível, não confirmada com certeza (sem o timestamp exato do usuário): a sessão teve **mais de 30 deploys em produção** no dia (cada commit, mesmo só de documentação, dispara deploy automático) — um `catch()` de `fetch()` no navegador pega interrupções breves de conexão durante troca de instância de deploy, sem gerar nenhum log de erro no servidor.

### ⚠️ Tentativa de upgrade do tier Supabase (Free → Pro) — plano da organização mudou, tamanho de computação NÃO mudou (2026-09-05)

Antes do upgrade, verificado se o tier Free já estava no limite de conexões simultâneas (pergunta do usuário, motivada pelo erro de OTP acima): `max_connections: 60`, só `13` conexões abertas e `1` ativa no momento da checagem — longe do limite. `get_advisors` (performance) não aponta nada sobre conexão/CPU/memória. **Não foi possível checar logs históricos do Postgres** (`query_logs`/`postgres_logs`) — a ferramenta retornou `"Backend error"` em 3 tentativas seguidas, incluindo uma consulta trivial sem filtro (`SELECT count(*) FROM postgres_logs`) — instabilidade da ferramenta, não da query. Métrica de uso de CPU/quota de compute não é exposta via SQL — só no painel do Supabase (Reports → Database), fora do alcance do MCP.

**Upgrade decidido e aplicado pelo usuário** (organização → Settings → Billing → Pro; depois Project Settings → Compute and Disk → escolher tamanho — nenhum dos dois é possível via ferramenta MCP, confirmado checando a lista completa de tools do Supabase disponíveis: `create_project`/`create_branch` só têm `confirm_cost` pra criar recursos novos, não pra alterar o compute de um projeto existente).

**Resultado, confirmado com dado real, 4 checagens ao longo da conversa**:
- `get_organization` confirma `plan: "pro"` — **o upgrade da organização aconteceu de verdade**.
- `get_project` sempre retornou `status: "ACTIVE_HEALTHY"` — nunca um estado transitório de resize.
- `current_setting('work_mem'|'shared_buffers'|'effective_cache_size'|'max_connections')` — **idêntico ao Free em todas as 4 medições** (`2184kB`/`224MB`/`384MB`/`60`), mesmo após duas confirmações do usuário de que o tamanho de computação foi selecionado e salvo no painel.
- `list_projects` confirma que só existe **1 projeto** na organização (`mdlbajgnntjwhycouzit`) — descarta a hipótese de o resize ter sido aplicado no projeto errado.

**Pendência real, não resolvida**: o plano de billing mudou, mas o tamanho de computação do banco não refletiu isso em nenhuma medição. **Recomendado abrir chamado com o suporte do Supabase** (`status.supabase.com` pra checar incidente primeiro) — não é algo que se resolve só re-checando via SQL a partir daqui. Retomar a confirmação de `work_mem`/`shared_buffers` assim que o suporte (ou uma nova tentativa no painel) confirmar a mudança de verdade.

## ✅ Correção — causa raiz real do rate-limit persistente do Upstash: retry sem backoff do BullMQ (2026-09-03)

Continuação da investigação do rate-limit do Upstash (ver achado do Build Filters acima). Pedido explícito de investigar a origem do retry antes de decidir entre consolidar conexões ou upgrade de plano — achado mudou a prioridade das duas opções.

**Causa raiz, confirmada lendo o código-fonte real do `bullmq` instalado** (`node_modules/bullmq/dist/cjs/classes/worker.js` e `utils/index.js`), não documentação genérica: dentro de `waitForJob()`, quando o comando falha com um erro que não é de conexão (`isNotConnectionError`), o BullMQ espera só **100ms fixos** (`DELAY_TIME_1 = 100`, constante interna, sem opção pública do `Worker` que sobrescreva) antes de tentar de novo. Com 5 workers (`event`, `proof`, `aggregator`, `risk`, `alert`) fazendo isso ao mesmo tempo, isso virou uma rajada contínua — medido direto nos logs: **30+ `ReplyError` em 3,6 segundos**, com `bull:proofchain-aggregator:*` e `bull:event-queue:*` intercalados na mesma rajada. Isso nunca dava tempo da janela de rate-limit do próprio Upstash se recuperar sozinha — provavelmente por isso o bloqueio parecia permanente.

**Mapeamento de criticidade real por fila** (investigado antes de decidir tetos de backoff): `event-queue` e `alerts` **não têm nenhum produtor real** (só scripts de teste) — filas mortas, rodando à toa. `proofchain-aggregator` só tem o próprio agendamento interno (5 em 5 min). `risk-queue` (`app/api/events/route.ts`) e `proof-queue` (`app/api/verify/[hash]/route.ts`) têm tráfego público real, mesmo que assíncrono.

**Fix aplicado** (commit `c43d162`): `lib/queue/rateLimitCircuitBreaker.ts` — detecta especificamente o erro do Upstash (`ReplyError` + mensagem "rate-limit", não qualquer erro de Redis) e força `worker.pause()` com backoff exponencial (base 30s, dobra a cada tentativa) em vez de deixar o BullMQ martelar. Confirmado no código-fonte que `pause()` interrompe `waitForJob()` no ponto exato do loop de 100ms (`if (this.paused) return Infinity`) e espera jobs em andamento terminarem antes de pausar — sem risco de perda/duplicação. Tetos diferenciados: 10min pras 3 filas sem tráfego real, 2min pras 2 com tráfego real (não acumular backlog demais).

**Confirmado ao vivo, com evidência real, depois do deploy**: os 5 workers detectaram o rate-limit no boot e escalaram o backoff corretamente (30s → 60s → 120s, tentativa por tentativa, por worker, independente). Verificação específica: durante uma janela de pausa de 120s do `proofWorker` (`15:04:43` a `15:06:43`), **zero linha de log relacionada a `proofWorker`/`proof-queue`** apareceu — e **zero `ReplyError` de qualquer worker** no sistema inteiro nesse mesmo intervalo. Confirma que a pausa realmente interrompe as tentativas, não só loga a intenção.

**Achado à parte, sobre o processo de deploy**: um clique em "Manual Deploy → Deploy latest commit" no painel do Render não registrou nenhum deploy novo (confirmado esperando ~10 minutos, checando `list_deploys` e logs repetidamente — nada mudou). Disparar o mesmo deploy via API (`trigger_deploy` do MCP) funcionou imediatamente. Causa não identificada (possível glitch de UI do painel) — vale ter em mente que o botão do painel nem sempre é confiável; a API é o fallback que funcionou.

**Não resolvido, propositalmente fora de escopo**: falhas do lado *produtor* — rotas de `app/` (processo `doohplay-demo`, separado do worker) que fazem `await queue.add(...)` antes de responder. Achado específico: `app/api/verify/[hash]/route.ts` devolve `500` cru pro usuário público se essa chamada falhar por rate-limit — deveria degradar com mais graça (ex: "verificação temporariamente indisponível"). Registrado como próxima investigação, pedida explicitamente pelo usuário.

## ✅ Templates guiados no Studio — implementado e validado em produção, com 2 bugs pré-existentes achados e corrigidos no caminho (2026-09-03)

Prioridade real de negócio mais antiga do backlog: geração livre por texto no Studio era difícil demais pra dono de loja não-familiarizado com IA (feedback direto de prospect). Implementado em 4 etapas, cada uma commitada, deployada e validada separadamente antes da próxima — plano completo aprovado antes de codar, incluindo investigação prévia obrigatória de por que os 3 templates visuais existentes não renderizavam diferente entre si (achado: já tinha sido corrigido na Fase 44, 21/08/2026 — pendência do backlog estava desatualizada) e de como `app/api/studio/ai-generate`/`lib/imageGeneration.ts` recebem input hoje (achado: só texto livre, sem estrutura de campos escondida — pipeline de geração real reaproveitável sem mudança).

**Etapa 0 — fix de pré-requisito**: `STUDIO_TEMPLATES` (`lib/studioTemplates.ts`) é indexado por chaves em inglês (`barber`/`food`/...), mas o `business_type` real salvo em `studio_clients` é em português (`"Barbearia"`/`"Lanchonete"`/...) — mesma classe de bug de idioma já corrigida uma vez em `app/api/studio/ai-generate` (12/07/2026), não replicada aqui. Confirmado em produção: os 2 únicos clientes ativos (`BARBE332`, `LEMEL186`) caíam sempre no fallback `.barber` por acidente, não por decisão — o cliente `Lanchonete` via/publicava templates de barbearia. Corrigido com `mapBusinessTypeToTemplateSegment()`, mapeamento explícito e documentado (cobertura parcial: `STUDIO_TEMPLATES` tem 8 segmentos, o dropdown de `/cadastro` tem 10 — categorias sem template dedicado caem em `barber` de propósito, não por bug).

**Etapas 1-4**: dados dos 6 templates guiados por objetivo (`lib/guidedTemplates.ts` — Promoção/Desconto, Produto/Serviço Novo, Horário/Feriado, Evento/Data Comemorativa, Depoimento/Prova Social, Institucional Simples; só Horário/Feriado tem campo de seleção fixa + obrigatoriedade condicional, os outros 5 são texto livre) → galeria + formulário na aba nova "Guiado" do Studio → prévia grátis (`buildGuidedPreviewCopy`, função pura sem `fetch`, garantindo por construção que não consome cota de IA) → geração real reaproveitando 100% do pipeline existente (`/api/studio/ai-generate`, mesmo grid de 3 conceitos, mesmo polling, mesma cota em `ai_generation_log` — só troca a origem do prompt via `buildGuidedPrompt`) → publicação via `handlePublish` já existente.

**Validado em produção com evidência real em cada etapa** (Puppeteer, já que a extensão Chrome não estava conectada nesta sessão): campo condicional "Detalhe do horário" confirmado aparecendo só com "Horário especial" selecionado (screenshot + checagem de DOM); prévia grátis confirmada com zero requisições de rede disparadas; geração real confirmada com cota real de `LEMEL186` indo de 0→3 em `ai_generation_log`, 3 imagens reais geradas.

### Achado sério no caminho, fora do escopo original: `publishToRealPlaylist` não tinha auto-criação de `Campaign`

Testando a publicação real (último passo do fluxo), a publicação falhou pra `LEMEL186` com `"Nenhuma campanha ativa encontrada pra este cliente"`. Investigação mostrou que **isso não é bug dos templates guiados** — `BARBE332`, o cliente real pagante, também tem **zero linhas em `"Campaign"`**, então qualquer publicação pelo Studio (Editor clássico, aba IA, ou os novos templates guiados) estava quebrada em produção pra ambos os clientes reais, hoje. Causa raiz: `app/api/client/generate-creative/route.ts` (rota separada, usada pelo modal "Enviar conteúdo" do dashboard) já tinha uma função `ensureCampaign()` que auto-cria `Advertiser`+`Campaign` se não existir — mas `lib/publishMedia.ts` (`publishToRealPlaylist`, usada por `app/api/studio/publish/route.ts`, ou seja todo o Studio) nunca teve essa lógica, só fazia `SELECT` e lançava erro. Mesmo padrão de "duas implementações divergentes" já visto várias vezes nesta sessão (`PdfCertification`, `signHash`, `buildHtml`).

**Corrigido** (não em `generate-creative/route.ts`, que não foi tocado — já testado, funcionando em produção): `ensureCampaign()` reimplementada em `lib/publishMedia.ts`, self-contained (só `pool`+`code`, busca o nome do cliente sozinha em `studio_clients`), chamada por `publishToRealPlaylist()` no lugar do `SELECT`-que-falha antigo.

**Testado em produção, ponta a ponta, com os dois clientes reais**: `LEMEL186` e `BARBE332` — ambos publicaram com sucesso depois do fix (`Campaign` "Promoções da Loja" auto-criada, `CampaignMedia` real inserida, URL real no R2). **Conteúdo de teste removido imediatamente da tela real da Barbearia Zimermam** depois da confirmação — apagado nas 4 tabelas que compõem o caminho real de exibição (`CampaignMedia`, `playlist_schedule`, e a fundação unificada `creative_assets_v2`/`placements_v2`, que é o que o player provavelmente lê de fato), confirmado por `COUNT(*) = 0` nas 4 depois da limpeza. A `Campaign` "Promoções da Loja" em si foi mantida — é infraestrutura legítima criada pelo fix, não conteúdo de teste, útil pra publicações futuras reais.

## ✅ Resolvido de verdade — assinatura de PDF (`valid:false`), causa raiz real encontrada (2026-09-03/04)

Fecha a pendência registrada acima ("Pendência real, mais funda do que parecia"). A conclusão anterior — "não se sabe qual chave privada é a correta" — **estava errada**, corrigida aqui com o mesmo padrão de honestidade já usado nesta sessão pra outras conclusões precipitadas.

**O par de chaves sempre esteve correto.** Confirmado por comparação byte a byte: a chave pública derivada de `PRIVATE_PEM`, mais uma quebra de linha (diferença de formatação entre o export do Node e o arquivo em disco), bate **exatamente** com `keys/public.pem` commitado. O `keysMatch:false` de duas rodadas de diagnóstico anteriores foi **falso alarme do próprio método de comparação** (hash SHA-256 de bytes crus é sensível a 1 byte de quebra de linha a mais — o conteúdo da chave era idêntico o tempo todo).

**Causa raiz real, encontrada isolando cada variável possível** (par efêmero gerado na hora pra confirmar que o ambiente Node/OpenSSL funciona; chave derivada em memória pra descartar problema de leitura de arquivo; sem banco de dados no meio):

1. **`crypto.createSign().sign(chave, "base64")` passando a chave como STRING PEM crua produz assinatura que não verifica corretamente neste ambiente de produção** — mesma chave, mesmo hash, funciona perfeitamente se a chave for pré-parseada com `crypto.createPrivateKey()`/`createPublicKey()` antes (`KeyObject` em vez de string) ou usando a API one-shot (`crypto.sign`/`crypto.verify`). Não é RSA-PSS (`asymmetricKeyType: "rsa"`, expoente 65537, 2048 bits — nada incomum). Corrigido em `src/services/pdf/pdfSigner.ts` e `src/services/pdf/verifySignature.node.ts` (commit `4c2386c`).

2. **Achado ainda mais surpreendente**: mesmo com o fix acima aplicado e deployado, `valid:false` persistiu. Investigação revelou uma **cópia duplicada** de ambos os arquivos em `services/pdf/` (raiz), com dois bugs que a versão em `src/` já não tinha — `verify.update(hash)` sem decodificar hex (o bug antigo, "corrigido" em 02/09 só na cópia de `src/`) e `signHash()` nem verificava `PRIVATE_PEM`. Por algum motivo não totalmente esclarecido (o alias `@/services/pdf/...` deveria resolver só pra `src/services/pdf/` conforme `next.config.ts`, mas na prática algo ainda alcançava a cópia da raiz), essa cópia morta continuava afetando o resultado real. Corrigida por segurança, sincronizada com a mesma lógica de `src/` (commit `d9e3b53`) — elimina a ambiguidade em vez de decifrar a resolução exata do bundler.

**Teste real de ponta a ponta, em produção, confirmado**: gerar → assinar → persistir (`certified:true`) → reenviar o PDF exato pro `/api/reports/verify` → **`{"valid":true,"algorithm":"RSA-SHA256","certifiedAt":"...","certificationId":"..."}`**. Pela primeira vez desde que esse pipeline existe, o ciclo completo de certificação funciona de ponta a ponta em produção real.

**Nota pra investigações futuras neste mesmo padrão**: as duas cópias duplicadas de código (`services/pdf/` raiz vs `src/services/pdf/`) já eram um padrão conhecido nesta sessão (`PdfCertification`, `buildHtml`, `generateReportPdf.ts`, etc.) — mas esta foi a primeira vez que uma cópia teoricamente "morta" (inalcançável pelo alias documentado) se mostrou capaz de afetar o comportamento real em produção. Vale desconfiar dessas duplicatas mesmo quando o alias parece descartá-las, e testar com evidência real em vez de confiar só na leitura do `next.config.ts`.

## 🔴 Achado crítico — instância Evolution API (WhatsApp) desconectada, bloqueia entrega real de OTP (2026-09-05)

Durante a investigação do erro "Erro de conexão" no login de cliente via OTP (`LEMEL186`), checado o estado da instância Evolution API self-hosted (VPS Hostinger) via `GET /instance/connectionState/{instance}` (rota de diagnóstico temporária, leitura pura, zero mensagem disparada, apikey nunca exposta — deployada e removida na mesma investigação).

**Resultado, confirmado em `2026-09-05T02:00Z` (aprox.)**: `{"instance":{"instanceName":"doohplay","state":"close"}}` — **sessão desconectada**.

**Impacto real**: nenhum código OTP está sendo entregue de verdade via WhatsApp agora, pra **nenhum cliente**, não só `LEMEL186`. `POST /api/client/auth/request-otp` continua respondendo `200` normalmente (o envio é fire-and-forget, não bloqueia a resposta HTTP) — ou seja, a tela do cliente avança pro passo "digite o código" mesmo sem nenhuma mensagem real chegar no WhatsApp. Login de cliente via OTP está efetivamente quebrado em produção até a instância ser reconectada.

**Não explica, sozinho, a mensagem "Erro de conexão"** — essa vem do `catch()` do `fetch()` no navegador (client-side), e a rota real responde `200` de qualquer forma, com ou sem WhatsApp conectado. As duas causas são independentes.

### ✅ Correção — a origem exata de "Erro de conexão" foi encontrada e corrigida (ver seção seguinte)

A frase acima ("continua sem explicação definitiva") ficou desatualizada algumas horas depois, na mesma investigação — ver "✅ Resolvido de verdade — 'Erro de conexão' no login de cliente" logo abaixo.

**Ação necessária, fora do alcance deste agente**: reconectar a instância Evolution API via QR code no painel da VPS (Hostinger) — requer acesso de gestão à instância que este agente não tem, só leitura de status via API. Isso continua bloqueando a *entrega* real do código por WhatsApp mesmo depois do fix de "Erro de conexão" abaixo — são dois problemas independentes, os dois precisam estar resolvidos pro login funcionar de ponta a ponta.

## ✅ Resolvido de verdade — "Erro de conexão" no login de cliente (`request-otp`), causa raiz real encontrada (2026-09-05)

Continuação direta da investigação acima. Reproduzido de forma determinística via Puppeteer, clicando de verdade em "Enviar código pro WhatsApp" em `https://doohplay.com.br/dashboard/local/LEMEL186` — não só chamada crua via curl/backend, conforme pedido explícito do usuário depois de descartar rede local/navegador/cache (testado em aba anônima antes).

**Achado-chave, que quebrou a hipótese de rede/CDN/WAF**: o teste mostrou uma resposta `200 OK` completamente saudável — Cloudflare e Render nos headers, `192ms` de latência, **zero** evento `requestfailed` do Chrome, **zero** `console.error`/`pageerror` — e ainda assim a tela mostrou "Erro de conexão. Tenta de novo." depois do clique. Rede limpa + erro visível só é possível se o JavaScript do cliente estiver lançando exceção *depois* da resposta chegar, dentro do próprio `try` do `requestCode()`.

**Causa raiz, confirmada capturando o corpo bruto da resposta** (não só status/headers, que é o que os testes anteriores tinham checado): o corpo vinha **vazio** (`0` bytes) apesar do `Content-Type: application/json` e status `200`. `const data = await res.json()` estourava `SyntaxError: Unexpected end of JSON input` — capturado pelo mesmo `catch` que produz a mensagem genérica "Erro de conexão", mesmo com o servidor "respondendo bem".

**Por que o corpo vinha vazio**: em `app/api/client/auth/request-otp/route.ts`, a resposta de sucesso genérica era uma constante de módulo — `const GENERIC_OK = NextResponse.json({...})` — criada **uma única vez**, no carregamento do módulo, e reaproveitada em 3 dos 4 caminhos de retorno da rota (telefone não cadastrado, cooldown de reenvio, e o caminho de sucesso normal). O corpo de um `Response`/`NextResponse` é um `ReadableStream` de **leitura única** (por isso a Fetch API tem `.clone()`). Como o Render roda `next start` como processo Node persistente — não serverless com módulo recarregado a cada chamada — esse mesmo objeto em memória era devolvido em requisições diferentes: funcionava na primeira vez que era usado depois de cada deploy/restart, e a partir da segunda vez o stream já estava consumido, produzindo corpo vazio pra sempre (headers continuam corretos porque são propriedade estática do objeto, só o corpo é o stream de leitura única). Como esse é o caminho usado em praticamente toda chamada da rota, na prática isso quebrava quase toda tentativa de login — não era intermitente nem específico do `LEMEL186`.

**Fix aplicado** (commit `94a3434`): `GENERIC_OK` virou uma função `genericOk()` que cria um `NextResponse.json(...)` novo a cada chamada, eliminando o reaproveitamento do stream.

**Confirmado em produção depois do deploy**: 5 chamadas reais seguidas ao endpoint (não só a primeira) devolveram o corpo completo (`{"ok":true,"message":"..."}`, 104 bytes) — exatamente o padrão que faltava confirmar, já que o bug só aparecia a partir da segunda chamada.

**Nota**: este fix resolve a mensagem de erro genérica na tela. Não resolve, sozinho, a entrega real do código via WhatsApp — isso depende da instância Evolution API estar conectada (ver achado crítico acima, ainda pendente, ação do fundador).

## ✅ Falso alarme investigado a fundo — suspeita de regressão no login de `LEMEL186` (2026-09-05/06)

Depois do fix acima, o fundador reportou `LEMEL186` continuando inacessível tanto por WhatsApp quanto por email, levantando a hipótese de que a correção do dia teria causado uma regressão nova. Investigado com evidência real antes de reverter qualquer coisa (pedido explícito do fundador: não empilhar mudança em cima de sistema supostamente quebrado sem confirmar primeiro).

**Achado 1 — `/login` (email/WhatsApp) é um fluxo totalmente separado do `/dashboard/local/[code]`.** Usa `app/api/auth/otp/send` e `app/api/auth/otp/verify` (tabela `otp_tokens`), código completamente diferente do `request-otp`/`verify-otp` que corrigimos (tabela `client_login_codes`). `git log` confirma que `otp/send`, `otp/verify`, `lib/client-session.ts` e a rota `verify-otp` do cliente não são tocados desde julho/2026 — nenhuma mudança de hoje encostou neles. `middleware.ts` (última mudança 30/08) já tem a exceção explícita pra `/dashboard/local` desde antes. **Não havia regressão possível vinda do trabalho de hoje**, porque o código desses arquivos é byte-a-byte o mesmo de antes.

**Achado 2 — WhatsApp via `/login` falha de verdade, mas com causa já conhecida.** Testado ao vivo (`fetch` com headers de navegador real): `POST /api/auth/otp/send` com `method: "whatsapp"` devolve `500 {"error":"Falha ao enviar WhatsApp"}` — erro real e visível (essa rota usa `await sendWhatsApp(...)` bloqueante, diferente do fire-and-forget do `request-otp`), causado pela mesma instância Evolution API desconectada já documentada. Não é bug novo.

**Achado 3 — email via `/login` funciona ponta a ponta.** Testado ao vivo, duas vezes: `send` → ler o código direto no banco (`otp_tokens`) → `verify` em poucos segundos → `200 {"ok":true,"redirect":"/dashboard/local/LEMEL186",...}`, com os dois cookies de sessão (`doohplay_session` e `doohplay_client_session`, HMAC válido) setados corretamente.

**Causa real dos dois "código errado"/"não funcionou" relatados pelo fundador**: os primeiros dois códigos testados (`673989`, `647282`) já tinham expirado (TTL de 10 min, `otp/send/route.ts`) pelo tempo gasto na própria investigação (screenshots, perguntas, troca de mensagens) entre o envio e o teste — confirmado comparando `expires_at` com `NOW()` direto no banco. Um terceiro código (`766144`) foi confirmado **válido e aceito pela API** quando testado por este agente imediatamente após o envio — mas foi consumido nesse teste de confirmação, ficando indisponível pro fundador tentar de novo com o mesmo valor (comunicado explicitamente na hora). Um quarto código, gerado pelo fundador via "Reenviar código" (`211829`), foi usado com sucesso pelo fundador de verdade, confirmado no banco (`used: true`).

**Conclusão**: zero regressão. `LEMEL186` está acessível por email via `/login` e por WhatsApp via `/dashboard/local/LEMEL186` (tela funciona; entrega real de WhatsApp em qualquer um dos dois caminhos depende da reconexão da instância Evolution API, pendência já registrada e sem mudança). Nenhuma reversão foi feita — teria reintroduzido o bug real do corpo vazio, sem resolver nada da confusão de timing que gerou este alarme.

## 🔴 Achado — `LEMEL186` sem nenhuma assinatura registrada, e sem cadastro completo pra criar uma (2026-09-06)

Novo agente customizado `financeiro-agent` (adicionado hoje, ver `.claude/agents/financeiro-agent.md`) rodou seu primeiro snapshot real e achou, consultando `financial_subscriptions`/`client_subscriptions`/`financial_payments`/`campaign_payments`: **`LEMEL186` (ativo desde 17/07/2026, usando o Studio normalmente) não tem nenhuma linha de cobrança em lugar nenhum** — diferente de `BARBE332`, que tem assinatura `starter` (R$97, `status: ACTIVE`) batendo exatamente com `lib/asaas.ts`.

O fundador confirmou no painel do Asaas que a assinatura nunca foi criada, e tentou criar agora — **bloqueado pelo Asaas por falta de CPF/CNPJ**. Confirmado direto no banco: `studio_clients.cpf_cnpj` é `NULL` pra `LEMEL186` (`app/api/admin/subscription/route.ts` cria o cliente no Asaas via `getOrCreateAsaasCustomer`, que precisa desse documento). Achado adicional no mesmo registro: `email` cadastrado é `teste@doohplay.com.br` (placeholder de teste, não o email real do cliente — foi o mesmo endereço usado nos testes de login desta sessão) e `person_type` está como `FISICA` (padrão do sistema), o que não bate com "LeMelo Café & Confeitaria" soando como pessoa jurídica — precisa confirmar CPF ou CNPJ antes de criar a assinatura, não presumir.

**Não corrigido agora, por decisão do fundador** ("só registrar o achado e resolver depois") — nenhuma ação financeira foi tentada ou simulada. Ver pendência na lista abaixo.

## ✅ Etapa 2 — sub-parte concluída: `app/api/player/event/route.ts` unificado com `appendEventToLedger` (2026-09-06)

Continuação da Etapa 2 (Separação Lógica) do `DOOHPLAY_Plano_Separacao_Fronts.docx` — sub-parte 1 (`pg.Pool`/`PrismaClient`) já fechada em 31/08. Planejado por `arquiteto-agent`, que investigou os 4 itens restantes da etapa e achou um caso concreto não documentado antes: **3 implementações independentes** do hash-chain gravando em tabelas de prova, quando deveria haver uma só — a canônica (`lib/domain/ledger/appendEvent.ts`, usada por `lib/adserver/registerImpression.ts`), uma reimplementação local em `app/api/player/event/route.ts` (fórmula de hash própria, divergente), e um terceiro caminho em `app/api/events/display/route.ts` gravando numa tabela diferente (`proof_chain`).

**Confirmado com dado real antes de tocar em qualquer coisa**: `proof_chain` tem 1.003 linhas, mas a mais recente é de **11/03/2026** — 6 meses parada, tráfego morto. Esse terceiro caso fica deliberadamente fora de escopo (sem investigação de tráfego adicional necessária, já é evidência suficiente).

**Corrigido**: `app/api/player/event/route.ts` — a rota real de proof-of-play chamada pelo player web e pelo **app Android nativo do `BARBE332`** a cada exibição — parou de reimplementar a gravação em `event_chain` localmente e passou a reusar `appendEventToLedger`, mesmo padrão já usado em `lib/adserver/registerImpression.ts`. Mesma classe de risco do incidente de 25/06/2026 (lógica duplicada divergindo em silêncio), desta vez dentro do próprio ledger de prova. `display_events` (o que decide tela/repasse) não foi tocado. Confirmado seguro trocar a fórmula de hash no meio da cadeia: `lib/domain/ledger/verifyChain.ts` só segue ponteiros (`previous_event_hash`), nunca recalcula hash a partir do payload. Regra documentada no `CLAUDE.md` pra não repetir.

**Validação real ficou bloqueada por um achado separado** (ver seção seguinte) — os dois players reais estavam offline no momento do deploy, então não há tráfego novo ainda pra confirmar a mudança em produção. Endpoint testado diretamente (`curl`) e confirmado saudável, respondendo `200` normalmente.

## 🔴 Achado — os dois players reais (`BARBE332` e `LEMEL186`) estão offline, por motivos independentes e do lado do dispositivo (2026-09-06)

Achado ao tentar validar a mudança acima com tráfego real — nenhum evento novo estava chegando. Investigado com dado estruturado (`player_uptime_daily`, contagem diária real por `player_id`, não logs brutos ambíguos — uma primeira leitura de logs por IP levou a uma conclusão errada, corrigida antes de registrar aqui):

- **`LEMEL186`**: pingava de forma consistente (~2.000-2.800 vezes/dia, ritmo de ~1 a cada 30s) nos dias 02, 03 e 04/09 — parou às **16:57:11 UTC de 04/09**, sem nenhum erro/timeout nas chamadas imediatamente anteriores (todas `200 OK`, 70-150ms). Offline há ~46h no momento do achado.
- **`BARBE332`**: já pingava com uma frequência bem mais baixa que o normal mesmo antes de parar — só **188 vezes em todo o dia 02/09** (~1 a cada 7-8min, achado à parte que merece investigação própria — pode ser versão de app diferente, configuração de intervalo, ou conectividade instável no local). Parou às **02:07:37 UTC de 02/09** e não deixou nenhum registro nos 4 dias seguintes — offline há ~4,5 dias no momento do achado.

**Backend confirmado saudável nos dois casos**: `/api/player/event` e `/api/player/heartbeat` testados diretamente agora, respondem `200` normalmente. Nenhum deploy do dia (nem de nenhum dia recente) coincide com nenhum dos dois horários de parada. Conclusão: são duas quedas físicas/de dispositivo independentes (rede, app travado, tela desligada), não um problema de servidor — fora do alcance de um fix de código. Não relacionado à mudança da Etapa 2 acima (que só troca a fórmula interna do hash, não altera nada que pudesse derrubar o player).

**Impacto real**: nenhuma prova de exibição, dado de repasse ou métrica de audiência sendo registrada pra nenhum dos dois clientes reais neste momento.

## Próximos passos em aberto

- 🔴 **Ação necessária do fundador, urgente**: `BARBE332` e `LEMEL186` (os dois players reais) estão offline (~4,5 dias e ~46h respectivamente, confirmado 2026-09-06) — precisa checar fisicamente/remotamente cada dispositivo (energia, Wi-Fi, app travado). Backend confirmado saudável; fora do alcance deste agente. Ver achado acima.
- 🟡 **Investigação separada, não iniciada**: `BARBE332` já pingava com frequência anormalmente baixa (188/dia) mesmo antes de parar de vez — pode ser versão de app desatualizada ou config de intervalo de heartbeat diferente do `LEMEL186`. Ver achado acima.
- 🔴 **Cadastro incompleto do `LEMEL186` bloqueia cobrança real**: `studio_clients.cpf_cnpj` é `NULL`, `email` é um placeholder de teste (`teste@doohplay.com.br`), `person_type` (`FISICA`) não confirmado contra a realidade do negócio (parece pessoa jurídica). Sem isso, `app/api/admin/subscription/route.ts` não consegue criar o cliente no Asaas. Ação: fundador precisa coletar CPF/CNPJ e email real do cliente antes de criar a assinatura (plano ainda não decidido). Ver achado acima.

- 🔴 **Ação necessária do fundador, urgente**: instância Evolution API (`doohplay`) desconectada (`state: "close"`, confirmado 2026-09-05) — reconectar via QR code no painel da VPS Hostinger. Mesmo com o fix de "Erro de conexão" abaixo, nenhum código real chega no WhatsApp até isso ser feito. Fora do alcance deste agente (sem acesso de gestão à instância). Ver seção acima.
- ✅ ~~"Erro de conexão" no login de cliente via OTP~~ — resolvido (2026-09-05). Causa raiz: `NextResponse.json(...)` reaproveitado como constante de módulo em `request-otp/route.ts`, corpo (stream de leitura única) vinha vazio a partir da 2ª chamada em diante no processo Node persistente do Render. Corrigido (commit `94a3434`), confirmado em produção com 5 chamadas reais seguidas devolvendo corpo completo. Ver seção acima.
- ✅ ~~`app/api/verify/[hash]/route.ts` devolvendo 500 cru quando o enqueue falha~~ — resolvido (2026-09-03). Rota só usa fila como último recurso (tenta cache, depois motor de prova síncrono em processo, só cai em `enqueueProof()` se as duas falharem) — mas quando isso falhava (ex: rate-limit do Upstash), devolvia `500 QUEUE_FAILED` cru pro usuário público. Corrigido pra `503 VERIFICATION_TEMPORARILY_UNAVAILABLE`, com mensagem legível (`"...tente novamente em cerca de 30 segundos"`, refletindo o `Retry-After` também no texto visível, não só no header) — mesmo padrão de honestidade já usado no fix do `PdfCertification`.
- 🟡 **Pendência separada, mesmo padrão, tarefa própria**: `app/api/events/route.ts` tem um catch genérico único que não distingue falha de `enqueueEventProcessing()` (enfileiramento pra `risk-queue`) de outras falhas — também devolve `500` cru hoje. Não implementado agora, propositalmente, pra não misturar escopo com o fix da rota `/verify` acima.
- 🟡 **Decisão de infraestrutura pendente (Upstash)**: causa raiz do martelamento contínuo corrigida (circuit-breaker, ver achado acima) — reduz drasticamente o volume de comandos, mas não é garantia de que o Upstash nunca mais vai rate-limitar sob carga real. Duas opções seguem em aberto, sem decisão: (a) consolidar as 14 conexões Redis distintas do código num cliente só; (b) upgrade do plano Upstash. Decisão do usuário, com ainda menos urgência agora que a causa do martelamento foi corrigida.
- 🟡 **Upgrade do Supabase decidido e pago, mas não efetivo ainda (2026-09-05)**: organização já é `plan: "pro"` (confirmado via API), mas `work_mem`/`shared_buffers`/`effective_cache_size` continuam idênticos ao Free em 4 medições, mesmo após confirmação de que o tamanho de computação foi selecionado no painel. Provável caso pra suporte do Supabase — ver seção acima. Enquanto isso, a causa raiz da contenção (`work_mem` de ~2MB) continua presente na prática, apesar do plano já estar pago.
- ✅ ~~Criar manutenção de partições de `event_chain`~~ — resolvido (2026-09-02). Função `fn_ensure_event_chain_partitions()` (garante partições dos próximos 3 meses, idempotente) + job `pg_cron` (`jobid 6`, `0 3 * * *`, diário — não só mensal, pra se recuperar sozinho em até 24h caso uma execução falhe) criados direto no banco de produção. Confirmado com prova real: partições `event_chain_2026_10`/`_11`/`_12` já existem, job `active: true`. **Escopo deliberadamente limitado a partições futuras** — a chave de particionamento real é `occurred_at` (não `created_at`), e o Postgres recusa criar uma partição nova que conflite com dado já existente na partição `default`; a função por isso começa em "mês seguinte", não no mês atual. **Não inclui** mover os ~89 mil registros de maio-setembro/2026 que já estão em `event_chain_default` pras partições corretas — decisão separada, mais delicada (mutação de dado real em produção, tabela com escrita concorrente), registrada abaixo.
- ✅ ~~Backfill de `event_chain_default` (maio-agosto/2026)~~ — resolvido (2026-09-03). Executado passo a passo, com aprovação e confirmação de resultado real em cada etapa: (1) índice temporário `event_chain_default_occurred_at_tmp_idx` criado via `CREATE INDEX CONCURRENTLY` (sem bloquear escrita); `EXPLAIN` confirmou que o `DELETE` real usaria *Seq Scan*, não o índice — esperado e correto, já que o filtro casava com ~94,7% da tabela (índice só ajudaria uma query mais seletiva); (2) staging criada com 83.607 linhas (bateu exato com a avaliação de ontem); (3) `DELETE` das mesmas linhas do `event_chain_default` real — confirmado `0` linhas de maio-agosto restantes, setembro intacto (cresceu organicamente durante a operação, tráfego real seguiu funcionando); zero erro novo em `player/event` na janela real do `DELETE` (busca inicial trouxe log antigo de ~13h atrás por falta de filtro de tempo — corrigido, checagem refeita com janela certa); (4) partições `event_chain_2026_05` a `_08` criadas sem conflito; (5) `INSERT INTO event_chain SELECT * FROM staging` — contagem por partição bateu exata (5.640/223/20.777/56.967); (6) staging e índice temporário apagados. **Checagem final de integridade**: total geral antes (`92.930`) vs depois (`92.957`) — diferença de `+27` bate exatamente com o crescimento orgânico de `event_chain_default` (setembro) durante a operação. Zero dado perdido, zero duplicado. Setembro (`event_chain_default` atual, ~9.350 linhas) só migra depois que o mês fechar (01/10).
- ✅ ~~`POST /api/reports/generate` bloqueada por bug de terceiros em `@react-pdf/renderer`~~ — resolvido (2026-09-03). Engine trocada pra Puppeteer HTML→PDF (ver seção acima) — geração de PDF real funciona em produção, hash bate certinho com o que `/api/reports/verify` espera (certificação encontrada por hash, testado ponta a ponta).
- ✅ ~~`valid:false` na verificação de assinatura de PDF~~ — resolvido de verdade (2026-09-04). Causa raiz real: `crypto.createSign()/createVerify()` com chave como string PEM crua (em vez de `KeyObject` pré-parseado) produz assinatura que não verifica neste ambiente, **mais** uma cópia duplicada de código em `services/pdf/` (raiz) com o bug antigo de hex não-decodificado que continuava afetando produção apesar do alias supostamente descartá-la. O par de chaves (`PRIVATE_PEM`/`keys/public.pem`) sempre esteve correto — a conclusão anterior de que não batiam foi falso alarme de comparação de hash. Testado ponta a ponta em produção: `valid:true` real. Ver seção acima.
- ✅ ~~`scripts/regenerate-public-key.js` nunca teve efeito real, mas continuava rodando~~ — resolvido (2026-09-04). Reescrito de "Pre-Deploy Command automático" (confirmado nesta sessão que nunca chegava a atualizar o arquivo lido em produção) pra utilitário manual, documentado, testado localmente. **Pendência do usuário**: limpar o campo "Pre-Deploy Command" no painel do Render pro serviço `doohplay-demo` — sem ferramenta MCP pra isso, não é urgente (o script nunca teve efeito mesmo rodando automaticamente).
- ✅ ~~Decidir sobre os arquivos `.docx` e templates de PR não rastreados (commitar ou descartar)~~ — resolvido/desatualizado (2026-09-03). Pendência era um fantasma: os 2 `.docx` e o template de PR real (`.github/pull_request_template.md`) já estavam commitados; os outros 4 caminhos citados nunca existiram no repositório (ver seção "Repositório" acima).
- ✅ ~~Resolver a exposição do certificado A1~~ — resolvido (ver seção de segurança acima: novo certificado instalado e validado ponta a ponta em 2026-09-02).
- ✅ ~~Nenhum teste automatizado existe no projeto atualmente~~ — parcialmente resolvido, ampliado em duas rodadas (2026-09-05). O `CLAUDE.md` já estava desatualizado nesse ponto: existia um teste real com `node:test` (`app/player/dtv/detectReceiver.test.ts`) e um teste órfão quebrado desde sempre (`src/tests/reports/consolidatedReport.hash.test.ts`, contribuía pro baseline de erros do `tsc`). Vitest configurado (`vitest.config.ts`, replicando os aliases de `next.config.ts`). O teste órfão passou a rodar e a compilar (1 linha de import) — `tsc --noEmit` caiu de 63 pra 60. `npm run test` (Vitest) e `npm run test:native` (`node:test`, preservado) coexistem sem conflito.
  - Rodada 1: 40 testes em 3 arquivos, focados nos bugs reais achados nesta sessão (`business_type`/`STUDIO_TEMPLATES`, campo condicional do Horário/Feriado, `buildDashboardReportHtml`).
  - Rodada 2 (commit `9a91da6`): +16 testes em 3 arquivos, incluindo a **primeira rota de API testada** — `app/api/client/auth/request-otp/route.test.ts` chama `POST()` duas vezes seguidas mockando o banco (`@/lib/db`) e o WhatsApp (`@/lib/whatsapp`), confirmando que o corpo vem legível nas duas chamadas — é um teste de regressão direto do bug do `GENERIC_OK` reaproveitado (ver seção acima); se o bug voltasse, esse teste quebraria. Mais `lib/cpmEstimate.test.ts` (limites de faixa, corte é `>` não `>=`) e `lib/hash.test.ts` (independência de ordem de chaves na canonicalização, propriedade que sustenta todo o pipeline de certificação).
  - **Total agora**: 55 testes em 7 arquivos, todos passando. **Cobertura ainda é parcial** — só funções puras + 1 rota de API; a maioria das rotas, componentes React e o resto do motor de prova continuam sem nenhum teste.
- Etapa 2 do `DOOHPLAY_Plano_Separacao_Fronts.docx` — restam: extrair `packages/proof-engine`, sub-parte 2 da unificação de Supabase (~15 pontos, precisa ser fatiada em `app/` vs `lib/`+`src/` — parte são rotas de billing, não motor de prova), testes de contrato (depende da unificação de `app/api/player/event` acima já feita). Ver seções acima.
