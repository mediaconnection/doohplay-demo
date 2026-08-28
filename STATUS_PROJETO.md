# STATUS_PROJETO.md — DOOHPLAY (doohplay-demo)

_Última atualização: 2026-08-27_

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

## ⚠️ Achado crítico — todo cliente Studio compartilha a mesma playlist (2026-08-28)

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

### Ainda pendente (crítico)
1. **Corrigir `/api/studio/auth` pra selecionar `playlist_id`** — correção pequena e isolada (adicionar a coluna no `SELECT`), mas precisa de decisão sobre o que fazer com clientes que **não têm** `playlist_id` próprio hoje (criar um novo? migrar dado da playlist compartilhada, se houver algo real lá?).
2. **Investigar se a playlist compartilhada (`bbbbbbbb-0001-0001-0001-000000000001`) tem dado real de algum cliente específico** — antes de qualquer correção, vale conferir quem gravou o quê ali, pra não perder configuração de agendamento de ninguém na migração.
3. **Autenticação real pro fluxo Studio** — hoje é só o `code`, igual ao "achado" do middleware do `/dashboard/local/[code]` que corrigimos antes, mas aqui nunca existiu proteção nenhuma pra remover (não é regressão, é lacuna original). Considerar reaproveitar o mesmo sistema de OTP via WhatsApp já usado em `/dashboard/local/[code]`.

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
