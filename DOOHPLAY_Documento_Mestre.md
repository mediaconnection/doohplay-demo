# PROJETO DOOHPLAY — Documento-mestre (v5.0, FINAL CONSOLIDADO)

> **A partir desta versão, este é o ÚNICO documento de continuidade do
> projeto.** Nenhuma sessão nova deve criar um arquivo `CONTINUIDADE_vX`
> separado — toda sessão relevante **edita este arquivo**. A fragmentação
> em 15+ documentos paralelos (v2 a v12, mais scripts de 20/06, 23/06,
> 17/07) foi a causa raiz de pelo menos uma regressão real não detectada
> por 2 semanas (ver seção 5). Não repetir esse padrão.
>
> Envie este arquivo inteiro no início de toda nova conversa, em qualquer
> ferramenta (claude.ai, Claude Code, Cursor).

---

## 0. VISÃO E DIRETRIZES ESTRATÉGICAS (FIXA)
> Origem confirmada: `Script de Continuidade 23/06/2026`. Só muda com
> aprovação explícita do fundador.

**NORTE**: DOOHPLAY não é "uma plataforma de TV pra barbearia". É uma
infraestrutura de mídia DOOH com ambição de escala continental, começando
pelo varejo de bairro no Brasil.

**12 Princípios não-negociáveis** (origem 23/06/2026):
1. Ambição de unicórnio — "isso aguenta 10.000 telas?", não só "isso
   resolve o cliente de hoje?". MVP rápido é aceitável; débito técnico
   que trava escala não é
2. UX de alto valor desde o primeiro fluxo, não "depois"
3. Atende anunciante de qualquer tamanho
4. Qualquer formato/padrão de tela — não travar em 16:9/9:16
5. Proof-of-play real, nunca dado simulado em produção
6. Expansão América Latina → global
7. Benchmark de mercado revisado periodicamente (Broadsign, Vistar,
   Hivestack, Doohmain, VIOOH, Place Exchange)
8. Continuidade entre sessões
9. Nenhuma feature "primordial" que concorrentes já oferecem fica de fora
   indefinidamente
10. Prefixo `TESTE_` obrigatório em dado de teste
11. Toda fase tem estimativa pessimista registrada
12. Inovação contínua

**Não-objetivos explícitos (14/08)**: não ser apenas mais um CMS
genérico; não abandonar a prova por features cosméticas; **não acoplar
precocemente infraestrutura de datacasting antes da base estar estável**.

**Benchmark de mercado (última revisão registrada: 22/06/2026 — vale
atualizar, já passou muito tempo)**:

| Capacidade padrão de mercado | Status DOOHPLAY |
|---|---|
| Proof-of-play (timestamp, duração, screen ID) | ✅ Existe (mas ver seção 3 — só passou a receber dado real a partir de 16/07) |
| Monitoramento de saúde da tela | ✅ Existe |
| Cadastro de inventário com specs completas | 🟡 Parcial |
| Workflow de aprovação de criativo | ✅ Existe |
| Floor price / exclusão de categoria | ❌ Não existe |
| API de disponibilidade pra SSPs | ❌ Não existe |
| Suporte a qualquer formato/resolução | 🟡 Parcial (só 16:9/9:16) |
| Multi-país/moeda/idioma | ❌ Não existe |

**Sequenciamento estratégico**: validar o segmento atual antes de abrir
frente nova (outdoor, veículo, canal de celular, processador de
pagamento próprio). Player Android nativo foi tratado desde 23/06 como
prioridade alta dentro da Fase 1, **especificamente porque exige Claude
Code (acesso a SDK/hardware), não o chat web** — mesmo princípio de
divisão de ferramentas que voltou a valer nesta reconciliação.

**Relação B2C/B2B**: destino estratégico é o modelo do
`OnePager_Investidor.docx` (redes médias, 50-200 telas/contrato, ticket
R$10-60k, pré-seed R$1,5M). B2C self-service é o caminho de tração real.
Reconciliação formal com o fundador ainda pendente.

---

## 1. O QUE É O PRODUTO E MODELO DE NEGÓCIO REAL

**Empresa**: DOOHPLAY Tecnologia. Operação sob o guarda-chuva da Media
Connection (agência, CNPJ 40.794.652/0001-60).

### Evolução real de preços (histórico confirmado por evidência de código)
| Data | Starter | Pro | Business |
|---|---|---|---|
| Até 12/07 | R$97/1 tela | R$197/1 tela | R$397/até 3 telas |
| A partir de 16/07 (Fase 27) | R$97/1 tela | **R$290/3 telas** | **R$620/5 telas** |

- Trial 7 dias, sem cartão (corrigido de mensagem pública anterior que
  dizia "grátis pra sempre" — risco de CDC, corrigido em 12/07)
- Repasse de anúncio: 40% fixo, mesmo pra todo plano
- **Tela extra — achado sério de pricing (Fase 18, 14/07)**: originalmente
  cobrança **única** de R$97, sem checagem de limite — um cliente
  conseguia montar o equivalente ao Business por ~3,5x menos via Starter
  + telas extras avulsas. Corrigido: **R$150/mês recorrente**
- "Relatórios"/"Prioridade"/"Suporte dedicado" (Pro/Business): ainda sem
  gate técnico real

### Canal de distribuição — Media Connection Hub (14/08)
Hub comercial formal de Integrantes independentes que vendem sob a marca
Media Connection com cross-sell entre si. **DOOHPLAY é "Parceiro
Estratégico"**, comissão do Hub 12-18% (vs. 20% padrão), repasse 82-88%.
5 Integrantes hoje. Contrato em modelo/template, **não confirmado como
assinado**. Sem material de apoio pronto pros Integrantes venderem — não
é prioridade agora (decisão do fundador), pendente até o produto
terminar de amadurecer.

### Custo real vs. margem (16/07)
Custo fixo mensal ≈ R$424,64 (Render R$294,64, VPS WhatsApp R$30,
Anthropic R$100; Supabase e R2 em free tier — R2 confirmado como não-risco
de escala até 100 telas). Ponto de equilíbrio: ~5 Starter, ~2 Pro, ou ~1
Business. Estrutura quase inteiramente fixa — margem alta acima do
ponto de equilíbrio.

### Status comercial real — CORRIGIDO nesta versão
- **`BARBE332`** (Barbearia Zimermam, Gilson Pimentel) — piloto real,
  telas V96 + T600
- **`LANCH525`** (LeMelo Café & Confeitaria) — **segundo cliente real,
  confirmado em produção a partir de 17/07**, tela `DHP-B07BDB` em
  processo de pareamento (resultado não confirmado no último documento
  disponível)
- `AGENC787` — registro de teste de agência, sem cliente pagante externo
- 3 clientes prospectados adicionais (feedback coletado em visitas
  comerciais de 20/07), condicionados à resolução de pendências de
  produto (Studio, templates)

---

## 2. ARQUITETURA DE REFERÊNCIA

### Front Isolation Policy — formalizada no CLAUDE.md (14/08)
Proibido alterar `app/` (produto) e `src/`/`doohplay-contract/` (prova)
no mesmo PR/commit. Ownership de tabelas explícito. `docs/api-contract.md`
é fonte única de verdade pra playlist/heartbeat/proof-of-play. Qualquer
tarefa tocando `BARBE332` ou `LANCH525` exige aprovação humana.

**3 clientes de banco coexistindo**: `pg.Pool` (raiz, maioria das rotas),
Supabase JS (auth/realtime), Prisma (só `PdfCertification`). Path alias
`@/*` resolve tanto `src/*` quanto raiz — `src/` tem precedência quando
duplicado. 2 instâncias Redis distintas coexistem.

### Plano de Separação dos Fronts (14/08, 3 etapas)
Etapa 1 (isolamento, 1-2 semanas) → Etapa 2 (extração do Proof Engine
como package interno, 3-6 semanas) → Etapa 3 (repos físicos separados,
opcional, só com crescimento de time).

### Fundação de dados unificada (desde Fase 1, 01/07)
`campaigns_v2`/`creative_assets_v2`/`placements_v2` é a **leitura** real
(`/api/client/playlist/[code]`). Tabelas antigas continuam sendo a
**escrita**; `lib/unifiedSync.ts` mantém sincronizado (best-effort).

### Repositório e hosting
`github.com/mediaconnection/doohplay-demo`, branch `master` — confirmado
por evidência (maior atividade de push entre 3 candidatos). Render,
serviço `srv-d86pg237uimc73ahkco0`. Domínio `doohplay.com.br`.

### Stack
Next.js 15.1.11 + TypeScript · PostgreSQL/Supabase (Free, **sem backup
automático**) · R2/Cloudflare · WhatsApp Evolution API (self-hosted, VPS
Hostinger `srv1737073.hstgr.cloud`) · Asaas · Resend · Anthropic API.

### Autenticação — histórico de dois sistemas paralelos (risco maior do projeto)
- Admin: NextAuth, `super_admin`/`operador`
- Cliente: login via WhatsApp OTP (Fase 14, 12/07), cookie HMAC
  (`lib/client-session.ts`)
- **Achado 16/07 (v12)**: dois cookies de sessão de cliente coexistindo —
  `CLIENT_SESSION_COOKIE` (JWT, portão embutido no dashboard) vs.
  `doohplay_session` (JSON simples, usado por `/login` + `middleware.ts`).
  Não unificado, virou bug real afetando `LANCH525` em 17/07 (usuário
  caía numa segunda tela de OTP sem aviso). Corrigido no mesmo dia
  (commit `28c9ca3`) fazendo `/login` também emitir o cookie do cliente —
  **os dois mecanismos continuam existindo em paralelo**, só o sintoma
  foi corrigido, não a causa estrutural

---

## 3. SISTEMA DE PROVA CRIPTOGRÁFICA (ProofChain) — `src/`

**Origem**: 09/03/2026, antes do produto comercial atual.

**4 camadas, score 100/100**: ICP (RSA-SHA256, 40pts), Merkle (30pts),
Blockchain Polygon (30pts), Timestamp TSA RFC3161 (10pts).

### 🔴 Descoberta crítica (16/07, v12) — motor existia, nunca recebia dado real
- `lib/proof/aggregator/proofChainAggregator.ts`, `lib/blockchain/anchor.ts`
  (Polygon real, contrato `storeRoot`/`anchorMerkle`), 40+ rotas, crons
  (`proofchain-aggregator`, `proof-pipeline`, `graph-builder`) — tudo
  construído e sério
- Mas `event_chain` (o que o motor lê) só era escrito por `/api/event`,
  rota que **o player real nunca chamava**. O player gravava em
  `display_events`, tabela desconectada do motor sofisticado
- **As landing pages prometiam "Blockchain auditável ✓" sem isso estar
  ativo em produção** até essa data
- **Corrigido em 16/07**: `/api/player/event` (rota real) agora grava
  também em `event_chain`. **Conclusão importante**: tudo que foi
  ancorado/certificado **antes de 16/07/2026 não existe de fato** — só
  eventos a partir dessa data têm prova real ponta a ponta

**Pendências não resolvidas (última confirmação disponível, 16/07)**:
1. Confirmar se `event_chain` existe de fato no Supabase de produção
2. Confirmar se o cron `proofchain-aggregator` está agendado de verdade
3. Decidir o que fazer com a promessa "Blockchain auditável" nas landing
   pages retroativamente

**Pasta legada `legacy/ledger/writeEvent.ts`**: schema desalinhado
(`event_type`, `previous_event_hash`, `occurred_at` — colunas que não
existem na tabela real), não usado, mas não removido — risco de confusão
futura.

---

## 4. FRENTE ANDROID NATIVO

Estado mais recente confirmado: `0.7.1-activation-code`, pareamento
self-service testado fisicamente. Também confirmado: `0.7.4 com playlist
por tela` publicado (30/06), **não confirmado fisicamente em hardware**
até o último documento disponível.

**Decisões conscientes já tomadas (não reabrir sem necessidade real)**:
- YouTube embutido: **não implementar**. 3 motivos técnicos reais: exige
  internet o tempo todo (quebra resiliência offline); Termos do YouTube
  proíbem esconder controles do player; YouTube pode injetar anúncio de
  terceiro fora do controle da DOOHPLAY
- Vídeo até 3min: **adiado**. 4 motivos: rotação de inventário pior
  (vídeo longo ocupa 6-18x mais tempo de slot); limite de plano só por
  quantidade, não por tamanho total (risco de banda/storage desigual);
  TV Boxes com pouco armazenamento sem lógica de limpeza de cache;
  carregamento inicial lento em rede fraca

---

## 5. ⚠️ REGRESSÕES CONHECIDAS (seção nova — coisas que já funcionaram e podem ter voltado a quebrar)

> Esta seção existe porque a fragmentação em 15+ documentos permitiu que
> pelo menos uma regressão real passasse 2 semanas sem detecção. Qualquer
> item aqui precisa de reconfirmação antes de ser tratado como "resolvido".

**1. Conteúdo diferente por tela (per-screen customization)**
- **30/06/2026**: implementado e validado
  (`playlist_schedule.screen_id`, toggle "Mesma playlist"/"Conteúdo
  próprio" no dashboard)
- **14/07/2026 (v9)**: listado como lacuna — "per-screen customization
  não está totalmente conectada no ciclo de refresh do player"
- **Não reconciliado até hoje.** Precisa de investigação: regrediu de
  fato, ou a v9 estava descrevendo um aspecto diferente (ex: só o refresh
  do player, não a atribuição em si)?

---

## 6. PADRÕES DE ERRO DO PROJETO (consolidado, agora 10)

1. **Duas implementações paralelas da mesma ação de negócio divergem
   silenciosamente** — documentado 8+ vezes: institucional (Fase 19),
   exclusão de mídia (Fase 26), aprovação de mídia (16/07),
   `createSubscription`/`getOrCreateAsaasCustomer` (16/07), login/sessão
   de cliente (16-17/07), playlist do dashboard vs. player/Playlist
   (16/07), ProofChain/`display_events` (16/07) — e agora, possivelmente,
   conteúdo por tela (seção 5)
2. **Dado mock/simulado sobrevivendo em produção** — 11 ocorrências numa
   auditoria (23/06)
3. **Erros silenciosos** (`catch {}` vazio) — o bug mais comum, recorrente
   em quase toda sessão
4. **HTML server-side descartado pelo motor JS do player** — mudança só
   no HTML inicial nunca chega a ter efeito no runtime real
5. **Migração SQL alegada como executada sem confirmação real** — já
   derrubou a plataforma inteira 2x na mesma sessão (Fase 29/33, 20/07)
6. **Script sem proteção de idempotência** — 10 duplicatas reais geradas
   rodando o mesmo script 2x (20/07)
7. **Trabalho de sessão anterior alegado como "pronto" sem nunca ter sido
   exibido/commitado** — Fase 43/44 inteira alegada numa sessão que nunca
   existiu de fato (21/07)
8. **CSS genérico reaproveitado entre contextos** — efeitos colaterais
   silenciosos (herança de `flex-direction`, `text-transform` deformando
   símbolos como µ)
9. **Escolha da série/fonte de dado errada entre opções parecidas** —
   série diária vs. anualizada do Banco Central
10. **NOVO — fragmentação de documentação de continuidade em múltiplos
    arquivos paralelos (v2 a v12+) impede detectar regressões entre
    sessões** — causa raiz da regressão da seção 5. **Resolvido
    estruturalmente a partir desta versão**: documento único, sem novos
    `CONTINUIDADE_vX`

---

## 7. PENDÊNCIAS DE SEGURANÇA E INFRAESTRUTURA (consolidado)

| Item | Status | Origem |
|---|---|---|
| `lib/db.ts` sem `connectionTimeoutMillis`/`statement_timeout` | Risco real, não corrigido | 17/07 |
| `regenerate-public-key.js` rodado a cada deploy — pode invalidar certificados ProofChain assinados antes do deploy | **Não investigado a fundo**, risco sério pra credibilidade do sistema de certificação | 17/07 |
| Certificado `.pfx` | **Mencionado pelo fundador, não localizado em nenhum dos 17 documentos de continuidade disponíveis** — origem desconhecida, precisa esclarecimento direto | — |
| Token do GitHub — disciplina de rotação por sessão | Inconsistente historicamente (mesmo token reusado várias vezes em pelo menos 3 sessões documentadas) | recorrente |
| Backup automático do banco | Não existe (Supabase Free) | conhecido desde 10/07 |
| `ADMIN_SECRET` vazado por extensão de navegador comprometida | Credenciais rotacionadas | 20-23/06 |
| 6 rotas de cliente sem sessão (críticas: bank-account, payouts, leads) | Corrigidas em 12/07 | 12/07 |
| Rotas de leitura sem sessão (`plan-usage`, `playlist` GET, etc) | Decisão consciente de deixar aberto | 12/07 |

---

## 8. BACKLOG CONSOLIDADO

### Prioridade máxima (produto, antes de qualquer venda ativa)
- [ ] Studio com templates guiados (spec já pronta —
  `DOOHPLAY_Studio_Templates_Guiados_Spec.md` — e briefing de Figma —
  `DOOHPLAY_Studio_Briefing_Figma.md`)
- [ ] Investigar por que os 3 templates visuais não renderizam diferente
  (mesmo `buildHtml()` desde pelo menos 12/07)
- [ ] Transição de imagem configurável por vídeo, não só por tela toda
- [ ] Reconfirmar conteúdo por tela em produção (seção 5)

### Confirmações técnicas pendentes
- [ ] `event_chain` existe de fato em produção? Cron `proofchain-aggregator` agendado?
- [ ] `regenerate-public-key.js` — investigar risco de invalidação de certificado
- [ ] `widget_position = 'left'`/`'bottom'` em produção (só `'right'` confirmado)
- [ ] Widgets de câmbio e loteria em produção (só indicadores/qualidade do ar confirmados)
- [ ] Resultado do pareamento de `LANCH525`/`DHP-B07BDB`

### Decisões do fundador
- [ ] Documento canônico sobre DTV+ (seção 3.5 da v4.0 — recomendação: Roadmap/Visão de Produto, não o Consolidado de Ideias)
- [ ] Origem e conteúdo do problema do certificado `.pfx`
- [ ] Contrato Media Connection Hub — já assinado ou ainda template?
- [ ] Repasse sobre patrocínio de canal (proposta: 0% se genérico, 15-20% se patrocinado) — decisão contratual pendente, fundador em conversa jurídica

### Processo
- [ ] **Parar de criar `CONTINUIDADE_vX` novos — editar este arquivo**
- [ ] Revogar token GitHub não usado, reforçar rotação por sessão
- [ ] Backup automático do banco
- [ ] `lib/db.ts` — adicionar timeouts de conexão

---

## 9. MATERIAL COMERCIAL E JURÍDICO

Comercial: 5 pptx, 3 manuais, 13 landing pages por segmento (todas
funcionais desde 16/07, dropdowns de tipo de negócio unificados),
one-pager investidor. Jurídico: 3 DPAs LGPD, Whitepaper técnico-jurídico,
NDA (template, não preenchido), Contrato Media Connection (template, não
confirmado como assinado).

**Nota de reconciliação pendente**: modelo B2B do one-pager (redes
médias) vs. B2C implementado — mesma pendência da v4.0, ainda sem
resposta do fundador.

---

## 10. LINKS ÚTEIS
- Dashboard cliente: `doohplay.com.br/dashboard/local/BARBE332` /
  `doohplay.com.br/dashboard/local/LANCH525`
- Admin: `doohplay.com.br/admin` · CRM: `doohplay.com.br/crm`
- Player: `doohplay.com.br/player?screen={code}`
- Supabase: projeto `mdlbajgnntjwhycouzit`
- Render: `dashboard.render.com/web/srv-d86pg237uimc73ahkco0/logs`
- WhatsApp suporte real: `5511962050987` (nunca `5511999999999`)

---

## 11. LACUNAS AINDA A PREENCHER

- [ ] **v7 (14/07) nunca recuperada** — só existe como atalho `.lnk` sem
  conteúdo. Buraco entre v9 (14/07) e v11 (16/07) permanece parcial
- [ ] Origem do problema do certificado `.pfx` — não localizado
- [ ] Timeline do pré-seed — indefinida
- [ ] Priorização real (bloqueador de fechamento vs. "seria bom ter") no
  feedback dos 3 clientes prospectados
- [x] ~~Confirmar se os 3 Prompts de Agentes já estão em uso
  operacional~~ ✅ Confirmado em 03/09/2026 (ver seção 12.16)

---

## 12. SESSÃO DE INVESTIGAÇÃO — 27/08 a 02/09/2026 (via Claude Code + SSH)

> Sequência longa de investigações reais em produção, iniciada a partir
> de "analise e corrija a página do cliente BARBE332". Registrada aqui
> de forma consolidada.

### 12.1 — Bug crítico corrigido: middleware bloqueava login do cliente por completo
`middleware.ts` checava o cookie errado (`doohplay_session`, genérico de
admin) em `/dashboard/local/[code]`, nunca reconhecendo
`CLIENT_SESSION_COOKIE` (do fluxo real de OTP via WhatsApp). Resultado:
redirect 307 permanente pra `/login` genérico — **cliente nunca
conseguia sequer chegar na tela de login por WhatsApp**. Não dava pra
saber há quanto tempo isso durava. Corrigido (commit `eee5e1c`,
27/08/2026): removida a checagem redundante e incorreta do middleware;
`/dashboard/local/[code]` saiu do matcher; `page.tsx` (que já validava
corretamente via `verifyClientSessionToken`) passou a ser a única
proteção real dessa rota. Confirmado em produção pós-deploy.

### 12.2 — ProofChain: agendamento do agregador nunca funcionou; backlog processado
Descoberta em cascata a partir de um erro visto manualmente nos logs do
Render (`doohplay-workers`):
- Causa: 14 conexões Redis diferentes disputando o limite de 500k
  comandos/mês do plano Free do Upstash; o agregador sozinho estimado em
  ~13 milhões/mês — 26x o limite
- **Nenhum dado foi perdido** — eventos gravados direto no Postgres
  (`event_chain`), Redis só como "despertador" do cron
- Backlog real: **68.947 eventos pendentes**, acumulados desde
  24/07/2026 (mais antigo) até 25/08/2026, sem nenhum agendamento
  bem-sucedido em toda a janela de log auditável (30 dias)
- **Processado manualmente com sucesso em 27/08/2026**: 68.947/68.947
  eventos, 138/138 transações on-chain, 0 falhas, 2h19min. Custo real:
  irrisório (<R$10). Última tx: `0xaf3d44bc7b5968e1ed3a78c5d797efd9a0c4c8330dbe04bd778f82abac5ea925`
  (bloco #1634). Confirmado no banco: `0` eventos pendentes
- **Transparência de datas**: certificações geradas por este
  processamento retroativo têm a data original do evento e a data de
  ancoragem separadas nos logs (schema de `certifications` não tem
  coluna própria pra isso — lacuna registrada, não bloqueante)
- **Causa raiz corrigida (commit `059d72d`)**: `scheduleAggregatorJob()`
  agora é idempotente — só escreve no Redis se o job repetido ainda não
  existir, em vez de recriar a cada boot do worker (que reinicia com
  frequência por auto-deploy). Reduz drasticamente o volume de comandos
  gerados por essa fonte específica
- **Ainda pendente**: monitoramento pós-fix pra confirmar se isso
  sozinho resolveu o rate-limit ou se ainda vale considerar upgrade do
  plano Upstash (Opção C, em espera). **Bloqueado até 09/09/2026**
  (restrição externa, ex: ciclo de cobrança/disponibilidade do plano —
  confirmar motivo exato quando retomar).
- **Achado à parte, não resolvido**: `certificado-a1.pfx` localizado na
  raiz do servidor de produção (`/opt/render/project/src/`) — não está
  versionado no Git (confirmado, sem exposição de histórico), mas existe
  fora do caminho documentado (`keys/`). Existe também
  `lib/crypto/signature/adapters/pfxSigner.ts`, um **segundo caminho de
  assinatura paralelo** ao RSA-SHA256 via `keys/private.pem` — possível
  origem do "problema do .pfx" mencionado anteriormente pelo fundador,
  não confirmado com certeza

### 12.3 — Regressão de conteúdo por tela: confirmada real, sem impacto hoje
Causa raiz confirmada: `PATCH /api/client/media/[id]/screen` grava
`screen_id` só em `playlist_schedule` (tabela legada); o player lê de
`placements_v2.screen_id`, nunca sincronizado entre as duas (o
sincronizador `syncDonoMediaToUnified()` existe, mas não é chamado por
esse endpoint). Resultado: toda mídia aparece em toda tela,
independente de configuração de "conteúdo próprio" por tela.
**Sem impacto hoje** — `BARBE332` tem só 1 tela cadastrada
("Recepção"), não 2 como os primeiros continuity docs registravam.

**⚠️ Correção estrutural aplicada, mas commit ficou pendente até 02/09**
(ver 12.9): a implementação em `app/api/client/media/[id]/screen/route.ts`
(sync best-effort pra `placements_v2.screen_id`, mesmo padrão do PATCH
irmão) foi escrita numa sessão anterior mas nunca chegou a ser
commitada/enviada — só o backfill de dado histórico (2 registros reais)
era efetivo. **Fechado de verdade em 02/09/2026** (commit `6485eeb`,
deploy `live`). Regressão fechada por completo — estrutural e histórico,
agora ambos confirmados em produção.

### 12.4 — Confusão de identificadores resolvida: LANCH525 ≠ LEMEL186
- `LEMEL186` = código real do cliente `studio_clients` (LeMelo Café &
  Confeitaria) — o nome correto a usar em qualquer investigação
- `LANCH525` = código de um **player órfão diferente**
  (`b07bdb30-...`/`DHP-B07BDB`), pareado desde 18/07/2026, **nunca
  vinculado a nenhum cliente**, parado há 45+ dias. Não é erro de
  digitação nem confusão — os dois códigos existem de verdade, em
  tabelas diferentes, sem relação entre si
- Pendência antiga "confirmar pareamento de DHP-B07BDB com LANCH525"
  fica **resolvida como "órfão sem dono", não como "pareamento
  pendente"** — decisão de negócio pendente: investigar origem ou
  descartar o registro

### 12.5 — "Erro de conexão" no login de LEMEL186: não é bug
Confirmado com evidência de log (5 tentativas, 100% 200 OK, 32-127ms):
rede local do estabelecimento, não regressão de código. As correções de
17/07 (`lib/whatsapp.ts`, timeout 8s) continuam ativas. Rota real usada
pelo login (`/api/client/auth/request-otp`) já dispara o envio de
WhatsApp em fire-and-forget, mais protegida ainda que a rota documentada
em 17/07.

### 12.6 — Tela de LEMEL186 offline por 8+ dias: energia local, resolvido
`last_ping` parado em 24/08/2026 09:48:54 (corte abrupto, não
degradação gradual — consistente com desligamento físico, não bug).
Religada manualmente em 02/09/2026 pelo fundador — confirmado online 3x
consecutivas na mesma checagem, ritmo de ping normal restaurado
(~20-30s). `BARBE332` também confirmado online no mesmo momento.

### 12.7 — Levantamento completo da tabela `players`: só 2 clientes reais confirmados
7 players no total; só 2 vinculados a cliente ativo (`BARBE332`,
`LEMEL186`), ambos online. Os outros 5 são órfãos/teste (2 duplicatas de
pareamento de `BARBE332`, 1 seed/fixture, 1 `TV01` genérico, 1
`LANCH525`/`DHP-B07BDB`), parados em datas individuais não-relacionadas
entre si — **não é falha de infraestrutura central**, é acúmulo de dado
de teste/pareamento superado, sem cliente pagante afetado.

### 12.8 — Origem de `LANCH525`/`DHP-B07BDB` investigada: não é resquício do LeMelo
Hipótese testada e **refutada com evidência**: não tem relação com
`LEMEL186`. Três sinais independentes confirmam serem dispositivos e
eventos completamente diferentes:
- `device_fingerprint` distinto (hardware físico diferente)
- `device_type`: `LANCH525` reportou "Google Google" (device genérico/
  emulador), `LEMEL186` reportou "Amlogic V96" (hardware real confirmado
  da LeMelo)
- Datas de criação 3 dias apartadas (`LANCH525`: 18/07 madrugada,
  criação→pareamento em 9min, típico de teste manual; `LEMEL186`: 21/07)
- O fluxo de ativação (`/api/player/activate`) não captura nome/tipo de
  negócio — não há caminho técnico pra "LANCH" ter vindo de um cadastro
  que depois virou LeMelo

Conclusão: `LANCH525` foi digitado manualmente por alguém testando o
fluxo de pareamento em 18/07/2026 (mesma semana da Fase 14), num
dispositivo diferente — sem relação com nenhum cliente real. Similaridade
com "Lanchonete" é coincidência de nome de teste.

**Decisão**: manter o registro como está, sem apagar (baixo valor
arquivológico, mas não-nulo; órfão inofensivo, dashboard já ignora via
INNER JOIN). Código `DHP-B07BDB` livre pra reuso se necessário no
futuro, sem urgência técnica pra isso agora.

### 12.9 — Correção estrutural da regressão de tela (12.3): pendência real descoberta
A "correção" registrada na seção 12.3 nunca tinha sido de fato
commitada/enviada — ficou só na árvore de trabalho local por engano.
Descoberto e corrigido em 02/09/2026 (commit `6485eeb`, deploy
confirmado `live`). Até essa data, qualquer atribuição *nova* de tela
continuava com o bug original — só o backfill dos 2 registros
históricos (via SQL direto) era real. Agora sim, estrutural e histórico
estão os dois corrigidos em produção.

### 12.10 — Unificação da lista de tipos de negócio (`/cadastro` × `/onboarding`)
Investigação da porta do Onboarding do Figma Make revelou que
`/onboarding` (React) já era, na prática, uma versão corrigida do mesmo
protótipo — já sem a etapa fictícia de "Suas TVs" e sem "Integrações"
(100% inventada, sem correspondência real no produto: iFood, Rappi,
TOTVS, etc. não existem de fato). Mas encontrada uma divergência real e
funcional entre as duas listas de tipo de negócio:

- `/cadastro`: 16 itens, incluindo "Mercado" e "Petshop" (sem espaço)
- `/onboarding`: 16 itens diferentes, incluindo "Cafeteria" e "Pet shop"
  (com espaço) — **nenhum dos dois batia com nenhum canal real** em
  `inventory_segments_v2.criteria_json->business_types` (comparação por
  string exata) — cliente escolhendo essas opções via `/onboarding`
  caía silenciosamente fora de toda segmentação de Canal DOOHPLAY

**Corrigido (commit `9772a7b`, deploy confirmado `live`)**: nova
constante compartilhada `lib/businessTypes.ts`, importada pelos dois
formulários, usando a lista de `/cadastro` como base (bate 100% com os
5 segmentos reais existentes). Zero risco de migração — só 2 clientes
reais na base, ambos já com valores canônicos.

### 12.11 — Mistério do certificado `.pfx` resolvido: código pronto, instalação manual pendente
Conectando o achado da seção 12.2 (certificado antigo solto na raiz do
servidor, nunca versionado) com uma investigação mais recente do
`STATUS_PROJETO.md` (item "instalar certificado A1 novo"):

- Uma sessão anterior (30/08/2026, commit `b8321f9`) já trocou o stub de
  assinatura por implementação real: `lib/crypto/signature/adapters/pfxSigner.ts`,
  via `node-forge`, PKCS7 real, lendo o `.pfx` de `CERT_PFX_PATH` (Secret
  File do Render, mesmo padrão já usado pra `private.pem`) com senha em
  `CERT_PFX_PASSWORD`
- O próprio commit já registrava honestamente: "falta instalar o `.pfx`
  novo e validar antes de considerar concluído" — **código pronto, mas
  instalação manual (subir o arquivo novo + configurar as 2 env vars no
  painel do Render) nunca confirmada**
- Indício forte de que o "problema do `.pfx`" mencionado originalmente
  envolveu exposição do certificado **anterior** no histórico do Git,
  seguida de um `git filter-repo` (reescrita de histórico).
  **Confirmado em 02/09/2026: nenhum colaborador precisa ser avisado**
  sobre os hashes reescritos (fundador solo com acesso ao repositório;
  não há terceiros com clone antigo pendente de aviso)
- **Sem risco de produção hoje**: a função só é chamada por
  `runProofPipeline.ts`, marcado `@deprecated`, que nunca executa em
  produção — zero impacto real independente do status da instalação
- **✅ CONFIRMADO em 02/09/2026 via rota de diagnóstico temporária**
  (`/api/admin/diagnostico-pfx`, projetada pra nunca expor chave privada
  ou certificado completo — só metadados mínimos): `CERT_PFX_PATH` e
  `CERT_PFX_PASSWORD` estão configurados de verdade em produção
  (`/etc/secrets/certificado-a1.pfx`, 12.657 bytes). **Teste de
  assinatura real bem-sucedido** (RSA-SHA256, `ok: true`). Certificado
  ICP-Brasil válido, emitido pra Agência Media Connection (CNPJ
  40.794.652/0001-60, mesma entidade já registrada na base jurídica do
  ProofChain — seção 3), **válido até 03/02/2027**, não revogado. O
  pipeline de assinatura via `.pfx` está pronto e funcional — só não é
  usado em produção porque a função que o chama
  (`runProofPipeline.ts`) está `@deprecated` e nunca executa.
  **Pendência fechada.**

### 12.12 — `PdfCertification` restaurada parcialmente: leitura funciona, geração ainda bloqueada
Investigação da Opção 1 ("PdfCertification completo", item 🔴 crítico do
`STATUS_PROJETO.md`), com o mesmo rigor de confirmação real usado o dia
inteiro:

**Resolvido, com prova de ponta a ponta**:
- Tabela `PdfCertification` criada em produção (migration aplicada via
  Supabase MCP, confirmada depois via `information_schema` — 11+1
  colunas e 2 índices, batendo exatamente com o schema Prisma)
- Causa raiz adicional descoberta e corrigida: o `buildCommand` do
  Render nunca rodava `prisma generate` (o `postinstall` só chamava
  Puppeteer) — `@prisma/client` ficava só como stub não-gerado. Corrigido
  encadeando `prisma generate && npx puppeteer browsers install chrome`
  no `postinstall` (mudança contida em `package.json`, sem tocar
  `buildCommand` do Render)
- Bug real de incompatibilidade criptográfica encontrado e corrigido:
  `signHash()` assinava o hash decodificado (bytes), `verifySignature()`
  verificava a string hex crua (bytes diferentes) — nunca bateriam.
  Corrigido no verificador (lado que já estava quebrado, sem tocar no
  assinador que já funciona em produção)
- **`POST /api/reports/verify` confirmado funcionando de ponta a ponta**
  em produção: de 503 ("indisponível") para 200 com resposta real
  ("PDF não certificado ou hash desconhecido" — comportamento correto
  pra um hash inexistente)
- Confirmado, com janela ampla de log (34h): os erros de `Connection
  terminated unexpectedly` em `player/event`/`player/heartbeat` são
  **anteriores** a todos os deploys de hoje (desde 01/09 00:32 UTC) —
  reforça, com evidência real, a pendência antiga de `lib/db.ts` sem
  timeout de conexão (seção 7)

**Não resolvido — pendência registrada, não bloqueante**:
- `POST /api/reports/generate` (geração real de certificado, diferente
  da verificação) continua falhando com erro de reconciler
  (`@react-pdf/renderer`/`@react-pdf/reconciler`, versões 4.5.1/2.0.0)
- **4 hipóteses testadas com evidência real e descartadas**: versão do
  `react-is`, cache de build do Render, empacotamento do
  `@react-pdf/renderer` pelo webpack, runtime de JSX incompatível —
  nenhuma resolveu, erro idêntico persiste em todas
- Indício forte de **bug da própria biblioteca**, não do código do
  projeto — precisa de investigação própria (5ª hipótese cogitada:
  downgrade de versão), fora do escopo de hoje
- Ambiente local limpo, produção estável — nenhum teste ficou pendurado

### 12.13 — Reskin visual do `/onboarding`: concluído e validado em produção
Barra de progresso proporcional no topo, dots de progresso entre os
botões do rodapé (4 passos), sombra de hover/seleção nos cards de plano
— todas aditivas, sem tocar `STEPS`, `PLANS`, `BUSINESS_TYPES`,
validação ou `submit()`. Paleta do produto (`/onboarding` +
`/cadastro`, azul `#3B82F6`/verde `#10B981` sobre slate escuro)
mantida — deliberadamente **não** importada a paleta roxa/violeta do
protótipo Figma, pra manter consistência visual com o fluxo irmão.
Nomes de botão originais mantidos ("Iniciar 7 dias grátis" em vez de
genérico "Próximo"). **Testado visualmente em produção, nos 4 passos**,
sem submeter formulário de teste (nenhuma conta fictícia criada).

### 12.14 — `lib/db.ts` sem timeout de conexão: pendência antiga, agora ativa em `playlist GET`
Pendência registrada desde 17/07/2026 (v5.0 seção 7), nunca resolvida.
Confirmada como padrão ativo e recorrente em 02/09/2026: `Connection
terminated unexpectedly`/`Query read timeout` em pelo menos 3 rotas nas
últimas horas — `player/event`, `player/heartbeat`, e **agora também
`playlist GET`** (`/api/client/playlist/[code]`, a rota que o player
real consulta pra saber o que exibir). Promovida de "risco teórico" pra
"correção ativa em andamento" — investigação e correção iniciadas.

### 12.15 — Episódio de contenção do Postgres (02/09): causa raiz real encontrada, mas causalidade das correções refutada com honestidade
Investigação em cascata a partir dos timeouts da seção 12.14, com uma
reversão de conclusão importante no meio do caminho:

**Causa raiz confirmada, com evidência**: instância Postgres (Supabase)
subdimensionada pra carga real — `work_mem` de só 2,1 MB. Cache hit
ratio ótimo (99,92%), então não é falta de memória de cache, é falta de
memória de trabalho por query: qualquer `ORDER BY`/agregação sobre mais
de ~2MB de dado transborda pra disco. ~981 GB de `temp_bytes`
acumulados na vida do banco. Dois maiores consumidores identificados:
`dashboard_kpis()` (4.587 chamadas, ~3,1 GB) e uma query interna do
próprio **Supabase Studio** (navegação no painel administrativo, não
código do projeto — 1.656 chamadas, ~14,7 GB, não mitigável pelo lado
do código).

**Duas mitigações aplicadas** (baixo risco, sem custo):
1. Correção de `ORDER BY id` → `ORDER BY created_at` no append ao
   `event_chain` (commit `65d8661`)
2. `dashboard_kpis`: intervalo de auto-refresh do widget de KPIs
   aumentado de 10s pra 30s (commit `4dec853`)

**⚠️ Correção de causalidade — importante, não descartar**: a melhora
observada inicialmente (episódio de erro parando) foi **erroneamente
atribuída** às duas correções acima numa primeira checagem apressada
(amostra pequena, ~10 chamadas). Checagem mais rigorosa, pedida
explicitamente antes de aceitar a conclusão, revelou: **o episódio
agudo de contenção terminou sozinho às 17:36:33 — antes das duas
correções estarem efetivamente em produção** (`event_chain` só foi ao
ar às 17:17:04, sem tempo de ter efeito; `dashboard_kpis` só ~2h30
depois). **Não há evidência de que as mitigações aplicadas hoje
resolveram o episódio agudo** — pode ter sido autolimitação do
Postgres, alguma query pesada específica terminando por conta própria,
ou outro fator não identificado. As mitigações continuam sendo boas
práticas por si só (menos carga é sempre melhor), só não podem ser
creditadas por aquele episódio específico.

**Causa de fundo mais provável, identificada em seguida**: partições
mensais de `event_chain` **paradas de ser criadas desde 04/2026** — toda
escrita desde então cai na partição "default", que cresce sem limite,
degradando qualquer query sobre a tabela inteira. **Corrigido de forma
permanente** (commit `8bed190`): função + job diário via `pg_cron`
garantindo sempre 3 meses de buffer de partições futuras. Mudança só no
banco, sem deploy de aplicação necessário.

**Pendente — decisão separada, mais delicada**: backfill dos ~83.607
registros históricos (maio-agosto/2026) presos na partição "default".
Plano avaliado (não executado): copiar pra staging → `DELETE` das linhas
antigas do default (única operação que toca a tabela viva, com escrita
concorrente ativa) → criar partições retroativas → reinserir da staging.
Setembro fica de fora até o mês fechar (01/10), pra não arriscar
indisponibilidade momentânea em `player/event` (tráfego real, ao vivo).
**Risco não confirmado**: se existe índice em `occurred_at` na partição
default — sem isso, o `DELETE` de 83 mil linhas pode ficar mais pesado
que deveria numa tabela com escrita concorrente. **Decisão de quando
executar fica para uma próxima sessão**, com essa confirmação de índice
feita antes de qualquer execução.

**✅ CONCLUÍDO em 03/09/2026** (commit `53ac1c5`, só documentação — a
mudança real foi só no banco, sem deploy de código): índice
`CONCURRENTLY` em `occurred_at` criado e validado primeiro
(`indisvalid: true`, checagem específica pra não aceitar construção
silenciosamente falha). Backfill executado passo a passo, com aprovação
explícita em cada etapa que tocava a tabela viva, e prova real de
resultado a cada passo (não só ausência de erro): staging com 83.607
linhas confirmadas batendo exatamente com a contagem prévia;
integridade de dado verificada — **zero perda, zero duplicação**.
Setembro segue pendente até 01/10. **Fica para decidir com calma**:
upgrade do tier do Supabase (resolveria o `work_mem` de 2,1 MB na
origem) e o backfill de setembro quando o mês fechar.


### 12.24 — Novo agente de sistema: Financeiro Agent (desenhado, não confirmado como usado ainda)
Em resposta ao incidente de contenção do Postgres (descoberto só depois
de já causar timeout real em produção, não antes), desenhado um 4º
agente de sistema — **estritamente consultivo**, nunca com poder de
executar ação que gere cobrança. Responsabilidades: monitorar custo
real de infraestrutura (Render/Supabase/Upstash/Anthropic), vigiar
limites de plano antes que virem incidente, acompanhar cobrança de
cliente (Asaas), recomendar decisões com dado real — nunca decidir ou
executar sozinho. Prompt completo em
`DOOHPLAY_Financeiro_Agent_System_Prompt.md`. **Ainda não confirmado
como testado/em uso** — mesma cautela já aplicada aos outros 3 antes de
declarar "em uso": só afirmar isso depois de confirmação real.


`LEMEL186` (LeMelo Café & Confeitaria — corrigindo o código usado
anteriormente, `LANCH525`, que era um dispositivo órfão não
relacionado). Ambos com 1 tela cada, ambos online.

---

**Versão 5.0 — consolidação final de 17 documentos de continuidade**
(v2, v3×2, v4, v5, v6, v8, v9, v11, v12×2, 17/07, scripts de 20/06 e
23/06) **+ 10 documentos estratégicos de 14/08** + v3.5/v4.0 anteriores.
Corrige status comercial (2 clientes reais, não 1), documenta a origem
real dos princípios/benchmark (23/06), expõe a descoberta crítica do
ProofChain sem dado real até 16/07, registra uma regressão não
reconciliada (conteúdo por tela), e consolida 10 padrões de erro do
projeto. **A partir desta versão, este arquivo é o único documento de
continuidade — sem exceção.**

**Atualização 02/09/2026**: adicionada seção 12, consolidando uma sessão
longa de investigação real via Claude Code + SSH — corrige o status
comercial (confirmado, não presumido: 2 clientes, `BARBE332` +
`LEMEL186`), resolve o backlog do ProofChain (68.947 eventos
processados), corrige bug crítico de acesso ao dashboard do cliente, e
desfaz a confusão `LANCH525`/`LEMEL186`.

### 12.16 — Confirmado: os 3 agentes de sistema existem e estão em uso (03/09/2026)
Fechando lacuna registrada desde o início desta sessão. Confirmado
direto na configuração do Claude Code (não por memória/alegação):

- **Arquiteto Agent** (`arquiteto-agent`) — guardião da arquitetura e
  isolamento entre `app/`/`src/`. Planeja separação de fronts,
  estrutura de packages, contratos de API, ownership de tabelas. Não
  escreve código de produção completo, entrega planos técnicos
- **Código Agent** (`codigo-agent`) — implementação real em `app/` ou
  `src/`, nunca os dois na mesma tarefa. Sinaliza risco de produção
  (especialmente clientes reais) antes de qualquer mudança — este é o
  agente usado na sessão de investigação inteira da seção 12
- **Docs & Produto Agent** (`docs-produto-agent`) — documentação,
  resumos executivos, texto comercial, sem inventar feature que o
  produto não tem

**Testados e confirmados funcionando em 30/08/2026.**

**Nenhum outro agente existe além destes três.** A lista de agentes de
"Intelligence Layer" da Arquitetura Alvo (Content Agent, Playlist
Optimizer, Anomaly Agent, Report Agent) e qualquer agente adicional
especulado para fases futuras (Ad Network Agent, Hyperlocal Matching
Agent, Partner & Franchise Agent, UGC Moderation Agent, Revenue
Optimization Agent, Multi-Region/LatAm Agent) **são só visão futura —
sem implementação, protótipo, ou configuração no ambiente hoje**.
Qualquer timeline específico atribuído a eles (ex: "Content Agent em
3-4 meses") é estimativa sem base real, não fato do projeto — cuidado
ao reutilizar esse tipo de tabela em material estratégico.

### 12.17 — Reconciliação: "30 parceiros / 5km" era a visão original do Clube de Telas
Confirmado pelo fundador (03/09/2026): a ideia de o dono de tela divulgar
conteúdo em até 30 estabelecimentos parceiros num raio de 5km **não é
uma feature nova** — era a ambição original por trás do **Clube de
Telas** (`network_partnerships`, existente desde a Fase 15, 13/07/2026),
que na implementação real ficou reduzida a uma versão bem mais simples:
aceite manual do dono da tela, sem fila, sem leilão, **sem limite de
parceiros e sem geolocalização por raio**. Decisão consciente registrada
na época: "não construir alocação algorítmica até o Clube de Telas ter
uso real" — mas os parâmetros específicos (30/5km) nunca foram
retomados nem formalizados em nenhum documento encontrado nesta sessão.

**Não confirmado em nenhum documento de origem** (nem no `Script de
Continuidade 23/06`, nem no documento-base da v3.5) — pode ter existido
em material anterior a 20/06/2026, não recuperado ainda, ou ter sido
comunicado verbalmente/fora dos continuity scripts.

**Pendência registrada**: formalizar a especificação completa do Clube
de Telas com os dois parâmetros (limite de parceiros, raio geográfico)
em cima da tabela `network_partnerships` já existente — ver rascunho de
especificação em `DOOHPLAY_Clube_de_Telas_Spec.md`.

### 12.18 — Reconfirmação das pendências de 16/07: 3 corrigidas, 1 reaberta
Checagem direta na fonte (código + banco + logs, 03/09/2026) das 4
pendências antigas registradas na seção 3:

1. **`event_chain` existe?** ✅ Sim — e muito além de "existir": tabela
   particionada por `occurred_at`, 37 colunas reais, ativamente mantida
   (job `pg_cron` diário, backfill de maio-agosto já concluído — ver
   seção 12.15)
2. **`proofchain-aggregator` agendado de verdade?** ⚠️ **Reaberto** —
   código correto (job repetível a cada 5min via BullMQ, idempotência
   aplicada em 27/08), mas **rate-limit do Upstash ativo agora**,
   confirmado em 4 de 4 reinicializações recentes do worker (a mais
   recente, menos de 1h antes desta checagem). A correção de 27/08 não
   foi suficiente sozinha — a data de retomada combinada (09/09) precisa
   ser reavaliada, o problema está ativo, não é mais só "esperar"
3. **"Blockchain auditável" nas landing pages** — decisão de
   produto/jurídica ainda pendente, mas com fato técnico atualizado: a
   escrita (`event_chain`) está correta e mantida, mas a etapa de
   ancoragem pública na Polygon não está rodando de forma confiável
   agora, por causa do item 2
4. **`legacy/ledger/writeEvent.ts` com schema desalinhado?** ❌
   **Alegação da pendência original estava errada** — confirmado
   coluna por coluna que `event_type`, `previous_event_hash`,
   `occurred_at` **existem de verdade** na tabela real e são usadas por
   código funcional. O arquivo legado continua não referenciado em
   lugar nenhum (código morto seguro pra remover quando conveniente),
   mas não há mais motivo de risco associado a ele

**Correção de rastro**: este achado (item 4) veio de uma auto-correção
do Código Agent em cima de um dado que o próprio v5.0 carregava desde a
v3.5 original — reforça a disciplina de nunca tratar pendência antiga
como fato definitivo sem reconfirmar.

### 12.19 — Causa raiz real do rate-limit persistente do Upstash: encontrada e corrigida
Investigação em cadeia, do sintoma superficial até a causa raiz de
verdade, no mesmo dia (03/09/2026):

**Causa raiz confirmada, lendo o código-fonte da biblioteca instalada
(não documentação)**: `node_modules/bullmq` tem uma constante interna
fixa (`DELAY_TIME_1 = 100`, 100ms) usada em `Worker.waitForJob()` — sem
backoff, sem opção pública de configuração. Com **5 workers** (event,
proof, aggregator, risk, alert) cada um tentando reconectar
independentemente a cada ~100ms quando o Redis já está rate-limitado,
o sistema gerava **~4,3 milhões de tentativas/dia** — volume suficiente
pra nunca deixar a janela de bloqueio do Upstash se recuperar sozinha.
Isso explica por que correções anteriores (idempotência do
agendamento, 27/08) não resolviam: atacavam só uma fração pequena do
problema real.

**Corrigido**: circuit-breaker próprio (`lib/queue/rateLimitCircuitBreaker.ts`),
plugado nos 5 workers via wrapper reaproveitável (1 função + 1 linha
por arquivo). Detecta o erro de rate-limit (texto + tipo de erro, dupla
checagem pra evitar falso positivo), pausa o worker de verdade
(`worker.pause()`, confirmado seguro — espera jobs em andamento
terminarem antes de pausar, zero perda/duplicação), com backoff
exponencial próprio, **tetos diferenciados por criticidade de fila**:
2min pra `risk-queue`/`proof-queue` (tráfego real), 10min pras 3
restantes (2 mortas sem produtor real — `event-queue`, `alerts` — e o
agregador, que tolera atraso por natureza). **Confirmado funcionando ao
vivo**, com evidência de log real (pausas de fato interrompendo novas
tentativas, não só logando intenção).

**Achado colateral, também corrigido**: `POST /api/verify/[hash]`
(portal público de verificação de certificado) devolvia **500 cru** pro
usuário real quando o enfileiramento falhava por rate-limit — expondo
erro interno em vez de degradar com honestidade. Escopo real limitado
(a rota só cai na fila como último recurso, depois de cache e motor
síncrono falharem), mas cenário real e confirmado. Corrigido: `503
VERIFICATION_TEMPORARILY_UNAVAILABLE`, com `Retry-After: 30` no header
**e** na mensagem visível, mesmo padrão já usado no fix do
`PdfCertification`.

**Achado bônus, não corrigido, registrado**: `event-queue`/`eventWorker.ts`
e `alerts`/`blockWorker.ts` **não têm nenhum produtor real** — filas
mortas, candidatas a remoção futura (reduziria ainda mais o volume
total contra o Upstash).

**Pendência relacionada, mesmo padrão, registrada separadamente**:
`app/api/events/route.ts` tem o mesmo tipo de `catch` genérico
devolvendo 500 pra falha de `enqueueEventProcessing()` — não corrigido
ainda, tarefa própria.

**Decisões que ainda ficam pra você, agora com bem menos urgência real**
(o martelamento contínuo que alimentava o problema foi eliminado):
1. Consolidar as 14 conexões Redis distintas num cliente só, ou
2. Upgrade do plano Upstash

Nenhuma das duas é mais urgência ativa — o circuit-breaker já resolve o
sintoma mais grave (rate-limit permanente e autoalimentado).

### 12.20 — Studio: templates guiados implementados + bug crítico de publicação descoberto e corrigido
Item de prioridade máxima do backlog (feedback direto dos 3 clientes
prospectados) finalmente implementado, em 4 etapas com aprovação em
cada uma:

**Etapa 0**: corrigido bug de idioma pré-existente (`business_type` em
português vs. chaves em inglês em `STUDIO_TEMPLATES`) — teria sido
herdado pelos 6 templates novos se não corrigido primeiro.

**Etapa 1**: `lib/guidedTemplates.ts` — 6 templates (`promocao`,
`produto_novo`, `horario`, `evento`, `depoimento`, `institucional`),
schema com suporte a campo tipo `select` e obrigatoriedade condicional
(`requiredIf`). **Processo de correção real durante a implementação**:
o primeiro rascunho divergiu da spec original (perdida no resumo de
contexto entre sessões) — identificado, corrigido campo a campo contra
o texto original antes de prosseguir. Lição prática do próprio padrão
de fragmentação que motivou a consolidação deste documento.

**Etapa 2**: aba "🧭 Guiado" no Studio (`app/studio/[code]/page.tsx`) —
galeria + formulário dinâmico. **Validado visualmente em produção**
(não só `tsc --noEmit`): campo condicional do template Horário/Feriado
confirmado via DOM, aparecendo/desaparecendo corretamente conforme a
seleção.

**Etapa 3**: prévia grátis sem IA (`buildGuidedPreviewCopy`) — deriva
headline/subline/CTA direto dos campos digitados, sem consumir cota.

**Etapa 4 (geração real) + achado crítico**: durante o teste end-to-end
real, descoberto que **`BARBE332` (cliente pagante real) tinha ZERO
publicações via Studio possíveis** — `lib/publishMedia.ts`
(`publishToRealPlaylist`, usada pelo Editor clássico, aba IA, e agora
Guiado) não tinha a mesma lógica de auto-criação de `Campaign` que já
existia em `generate-creative/route.ts` (`ensureCampaign()`) — mesmo
Padrão de Erro #1 do projeto (duas implementações divergentes),
afetando **todo o Studio**, não só os templates novos. **Corrigido**
(commit `9c21cd5`): mesma lógica reaproveitada, testada de ponta a
ponta com os dois clientes reais.

**Incidente evitado, resolvido rápido**: o teste de publicação real
criou conteúdo de teste ("20% OFF AGORA") na fila de exibição real da
Barbearia Zimermam — **removido em minutos**, confirmado em 4 tabelas
(incluindo a fundação unificada que o player lê). Lição registrada:
testes de publicação contra cliente real precisam do mesmo cuidado de
rotulagem (`TESTE_`) que testes de banco de dados — Princípio 10 da
seção 0 aplicado na prática.

**Resultado final**: as 4 etapas dos templates guiados estão
implementadas, commitadas, no ar, e validadas de ponta a ponta —
incluindo a publicação real, que só passou a funcionar por causa do fix
descoberto no processo.

### 12.21 — Dois itens de dívida técnica pequena fechados
- **`app/api/events/route.ts`** (mesmo padrão do `/verify/[hash]`,
  seção 12.19): corrigido, 500→503 honesto quando `enqueueEventProcessing()`
  falha. Sem incidente ativo pra validar o caminho 503 na hora (correto
  não simular rate-limit real só pra testar) — fica como confirmação
  orgânica na próxima ocorrência real
- **Arquivos `.docx`/templates de PR "não rastreados"**: pendência era
  **fantasma**. Os 2 `.docx` reais (`DOOHPLAY_Plano_Separacao_Fronts.docx`,
  `DOOHPLAY_Etapa1_Isolamento_Entregas.docx`, ~26KB total, sem dado
  sensível) e o template de PR (`.github/pull_request_template.md`) já
  estavam commitados. Os 4 caminhos que a lista antiga citava
  (`crypto/CLAUDE.md` e 3 variantes) **nunca existiram** no
  repositório. Lista de pendências corrigida no `STATUS_PROJETO.md`

### Balanço da maratona de 02-03/09/2026
Restam, sem urgência real hoje:
- Bug de geração de PDF (`@react-pdf/renderer`, biblioteca terceira)
- Decisão: consolidar 14 conexões Redis vs. upgrade do plano Upstash
- Decisão: upgrade de tier do Supabase (`work_mem`)
- Testes automatizados (inexistentes)
- Separação de fronts, Etapa 2 (extração de `packages/proof-engine`)

Nenhum desses bloqueia cliente real hoje. Tudo que bloqueava foi
corrigido e validado nesta maratona: acesso ao dashboard, backlog de
prova, regressão de tela, certificação PDF (leitura), causa raiz do
Upstash, e — o item de prioridade máxima de negócio — Studio com
templates guiados, incluindo um bug crítico de publicação descoberto
no processo que afetava o único cliente pagante real.

### 12.22 — PdfCertification: ciclo completo funcionando de ponta a ponta pela primeira vez desde que existe
O que começou como "trocar `@react-pdf/renderer` por Puppeteer" (bug de
reconciler, ver 12.12) revelou uma cadeia de 4 problemas reais e
independentes, todos corrigidos:

1. **`@react-pdf/renderer` → Puppeteer**: confirmado bug de
   incompatibilidade entre Next.js 15 e o reconciler React customizado
   da biblioteca — não resolvível ajustando versão. Migrado pra
   Puppeteer HTML→PDF, reaproveitando o mesmo padrão já usado em
   `lib/publishMedia.ts` (Studio). Determinismo de hash avaliado e
   documentado como limite conhecido, não regressão (a rota nunca
   persistia bytes de PDF pra regeneração, só o hash de uma geração
   específica)
2. **`signHash()`/`verifySignature()`**: corrigido pra usar `KeyObject`
   pré-parseado em vez de string PEM crua — bug real do ambiente
   Node/OpenSSL de produção, não do código de aplicação em si
3. **Cópia duplicada morta em `services/pdf/` (raiz)**: tinha o bug
   antigo (hex não-decodificado) e, por mecanismo não totalmente
   explicado, ainda influenciava produção — sincronizada/corrigida
4. **`keys/public.pem` desalinhado de `PRIVATE_PEM`, provavelmente
   desde maio/2026**: causa raiz real — `scripts/regenerate-public-key.js`
   rodava a cada deploy (~18x só no dia de hoje), reportava sucesso
   (`[startup] updated: keys/public.pem`), mas **escrevia num contexto
   de build efêmero que nunca chegava no filesystem da instância real**
   — a chave pública commitada nunca era, de fato, atualizada por esse
   mecanismo. Corrigido capturando a chave pública real (derivada da
   `PRIVATE_PEM` que já era a chave verdadeiramente em uso) e
   commitando diretamente. **Chave pública não é segredo** — nenhuma
   exposição de dado sensível nessa correção. Não foi necessário gerar
   par de chaves novo (o que teria invalidado retroativamente qualquer
   assinatura existente) — decisão tomada com cautela extra antes de
   confirmar a causa raiz real
5. **Pendência remanescente, registrada, não urgente**: o script
   `regenerate-public-key.js` continua "funcionando sem efeito" a cada
   deploy — vale decidir depois se remove do `preDeployCommand` (já que
   nunca teve efeito real) ou corrige de vez o mecanismo

**Teste final real, ponta a ponta, em produção**: gerar PDF → assinar →
persistir certificação → reenviar o mesmo arquivo pro
`/api/reports/verify` → `{"valid":true,"certificationId":"..."}`.
**Primeira vez que esse ciclo completo funciona desde que o pipeline
existe.** Todas as rotas de teste temporárias criadas durante a
investigação foram removidas, nada ficou pra trás no repositório.

### 12.23 — Falso alarme de regressão em LEMEL186: causa real era TTL de OTP + WhatsApp desconectado (não código quebrado)
Investigação longa (horas), inicialmente tratada como regressão crítica
de acesso, com causa real bem mais simples:

**Bug real corrigido durante a investigação**: `app/api/client/auth/request-otp/route.ts`
tinha um anti-padrão real — `NextResponse.json(...)` reaproveitado como
constante de módulo em vez de criado por requisição, fazendo o corpo da
resposta vir vazio/consumido em chamadas subsequentes (`GENERIC_OK`
ilegível). Corrigido, com teste de regressão criado
(`vi.mock("@/lib/db")`, chama `POST()` duas vezes seguidas). Confirmado:
nenhuma outra rota tinha o mesmo padrão.

**Por que pareceu regressão mais ampla, e não era**: depois de corrigir
o bug acima, o acesso continuava parecendo falhar — mas a causa real
era **o TTL de 10 minutos do código OTP se esgotando durante a própria
investigação** (screenshots, perguntas, trocas de mensagem consomem
tempo real). Confirmado com teste ao vivo, código gerado e usado
imediatamente: **login por e-mail funciona de ponta a ponta**, com os
dois cookies de sessão sendo emitidos corretamente.

**Separado, real, ainda pendente**: login por **WhatsApp** continua
falhando — mas por causa já diagnosticada antes nesta sessão (12.19 e
menções anteriores): a instância Evolution API self-hosted está
desconectada (`state: close`). **Requer ação manual do fundador**
(reconectar via QR code no painel da VPS Hostinger,
`evolution-api-zlol`) — não é algo resolvível por código.

**Confirmação final (mesma sessão, depois)**: testados os dois
endpoints de envio de WhatsApp — `/dashboard/local/[code]` (fire-and-
forget, sempre 200, não prova entrega real) e `/login` (aguarda
confirmação, **`500 "Falha ao enviar WhatsApp"` real**). O segundo
confirma de forma direta e inequívoca que a entrega está falhando agora
— não é mais suspeita, é fato confirmado. **E-mail continua sendo o
único caminho de acesso funcional** até a reconexão manual acontecer.

**✅ RESOLVIDO (04-05/09/2026)**: fundador reconectou a instância via QR
code no painel da VPS Hostinger. Testado de ponta a ponta: `LEMEL186`
recebeu o código de verdade no WhatsApp cadastrado e completou o login
com sucesso. Os dois caminhos de acesso (e-mail e WhatsApp) confirmados
funcionando.

**Lição registrada, para não repetir**: ao investigar um fluxo com TTL
curto (código OTP, token de sessão, etc.) que "parece não funcionar"
no meio de uma investigação longa, a primeira pergunta deveria ser
"quanto tempo se passou desde que foi gerado?" antes de suspeitar de
regressão de código. Não fazer essa pergunta antes custou tempo real de
investigação e gerou alarme desproporcional numa situação que não era
uma regressão.

### 12.25 — Extração do `packages/proof-engine`: Etapa 2 do Plano de Separação de Fronts concluída
Trabalho de maior escopo técnico desta sessão. Planejado pelo
`arquiteto-agent`, executado em 7 fases por forks em background, cada
uma testada (`tsc`/`vitest`/`next build`) e validada com dado real de
produção antes de avançar pra próxima:

- **Escopo real, corrigido durante a execução**: estimativa original de
  "~70 arquivos" (só `lib/proof/`) estava incompleta — o motor de prova
  real inclui também `lib/domain/`, `lib/blockchain/`, `lib/trust-graph/`,
  3 arquivos vivos de `legacy/`, e `src/services/pdf/` — **~192 arquivos
  movidos** ao todo, pra um novo pacote `@proof-engine` (alias único,
  sem fallback duplo — decisão consciente pra evitar repetir o padrão
  de ambiguidade de caminho que já causou 2-3 bugs nesta sessão)
- **Fase 0**: código morto mapeado e marcado (não movido) —
  `src/lib/trust-graph/` (zero consumidor), `lib/alerts/engine/` (o
  "Alert engine" documentado no CLAUDE.md nunca teve consumidor real —
  documentação corrigida pro pipeline que roda de verdade,
  `lib/domain/alerts/*`), `src/lib/blockchain/verifyAnchor.ts` morto.
  `legacy/` inteiro mapeado: **3 vivos, 46 mortos** (bom que não foi
  deletado por presunção só pelo nome da pasta). Bug real corrigido:
  `buildForceGraph.ts` com `../../../` incorreto
- **Fases 1-5**: estrutura + alias, depois `lib/blockchain/`+`lib/trust-graph/`,
  `lib/proof/`, `lib/domain/` (exceto `ledger/`), e os 3 arquivos vivos
  de `legacy/` — cada uma validada com rota real em produção depois do
  deploy (`/api/trust/graph`, `/api/audit/merkle-root` com 101.202
  eventos reais, `/api/analytics/risk/clients`)
- **Padrão de risco recorrente, documentado pra referência futura**:
  imports relativos que cruzam a fronteira de uma árvore movida quebram
  silenciosamente quando a profundidade muda — **nunca aparecem no
  `tsc --noEmit`** nessa parte do código (tudo `@ts-nocheck`), só no
  `next build` (resolução real do webpack). A partir desta extração,
  `next build` passou a ser validação obrigatória, não só `tsc`/`vitest`
- **Fase 6 (deliberadamente por último)**: `lib/domain/ledger/`
  (`appendEvent.ts`, `verifyChain.ts`) — o caminho real de proof-of-play
  de `BARBE332`/`LEMEL186`. Feita só depois dos dois players confirmados
  online de novo. **Validado com tráfego real, ao vivo**: eventos novos
  dos dois clientes entrelaçados na mesma cadeia `event_chain`,
  `previous_event_hash` de cada linha batendo exatamente com o
  `event_hash` da anterior, cruzando entre os dois clientes sem quebra
- **Fase 7**: `src/services/pdf/*` movido, zero mudança de lógica nos
  arquivos de assinatura (dado o histórico sensível dessa área nesta
  sessão) — `POST /api/reports/generate` confirmado `certified:true`
  real depois do deploy

**Etapa 2 do Plano de Separação de Fronts: completa.** Restam, não
iniciados: sub-parte 2 da consolidação de Supabase (~21 pontos reais de
instanciação — mais que os ~15 estimados — categorizados em Grupo A
código de prova sem risco de front, Grupo B rotas de prova/auditoria
fisicamente em `app/api/` mas mesma categoria já aprovada nas Fases
2-6, Grupo C comercial genuíno **explicitamente fora de escopo**,
protegido pelo gatilho do CLAUDE.md de "parar e perguntar" — decisão
correta de não tocar sem confirmação); e testes de contrato formais
entre os fronts (agora destravados, já que a fronteira de módulo existe
de verdade).

**Achado colateral, registrado, não corrigido**: `app/api/reports/revoke`
parece ser rota morta/quebrada — sem handler `GET`/`POST` exportado,
mesmo padrão de `route.ts` enganoso já visto antes.

**Incidente à parte, resolvido sem intervenção de código**: `BARBE332`
e `LEMEL186` ficaram offline por um período (~4,5 dias e ~46h
respectivamente, confirmado 06/09/2026) — backend confirmado saudável o
tempo todo pelo Código Agent, causa fora do alcance de código (física/
rede do estabelecimento). **Confirmado online de novo** pelo fundador.

### 12.26 — Financeiro Agent testado ao vivo: achado real já no primeiro uso
Primeira execução do Financeiro Agent (seção 12.24) já validou o valor
da vigilância proativa: encontrou que **`LEMEL186` não tem nenhuma
cobrança registrada no Asaas**, bloqueado por falta de CPF/CNPJ no
cadastro. **Ação pendente do fundador**: obter o CPF/CNPJ do LeMelo e
completar o cadastro no Asaas — até lá, esse cliente real pode estar
usando a plataforma sem cobrança nenhuma sendo gerada.

### 12.27 — Consolidação de clients Supabase (Grupos A+B): concluída, 9 de 9 fases
Sub-parte 2 da Etapa 2 do Plano de Separação de Fronts, escopo revisado
pra **22 pontos reais de instanciação** (mais que os ~15 estimados
originalmente). Grupo C (comercial genuíno: invoices, documents/pdf,
admin/reports, SchedulerEditor) **mantido explicitamente fora de
escopo**, protegido pelo gatilho do CLAUDE.md de parar e confirmar antes
de tocar código comercial.

Progresso completo: Fases 0-6 — 5 módulos mortos marcados, módulos
oficiais definidos (`lib/supabase.ts`/`lib/supabaseServer.ts`), ~12
arquivos migrados. **Fase 7, passo 2** (a mais arriscada de toda a
consolidação — `BARBE332` tem 8.121 eventos reais nesse pipeline):
`getSupabaseAdmin()` em `app/api/verify/[hash]/route.ts` passou a
reusar `lib/supabaseServer.ts` em vez de instanciar client próprio;
bug de bundling do webpack que motivara o client inline original
revalidado e não reproduzido (já confirmado na Fase 4); validado com
bateria completa dos 3 casos de teste da Fase 4, todos idênticos ao
baseline. **Fase 8**: decisão de manter `app/api/reports/revoke/route.ts`
marcado `@deprecated`, não apagar — mesmo padrão consistente da sessão
inteira (código morto confirmado é documentado, nunca apagado sem
necessidade). **Fase 9** (07/09/2026): removidos de fato os 5 módulos
mortos confirmados — `lib/supabaseAdmin.ts`, `src/lib/supabase.ts`,
`src/lib/supabaseServer.ts`, `supabase/client.ts`,
`src/supabase/client.ts`. Zero-import **reconfirmado de novo** (grep
fresco, não só a memória da Fase 0) imediatamente antes do delete.
`tsc` 47 (idêntico antes/depois, confirmado via `git stash`/`stash
pop`), `vitest` 73/73. `next build` local não completa por falta de
`SUPABASE_SERVICE_ROLE_KEY` real (confirmado, via stash, que essa falha
já existia **antes** da Fase 9) — validação real feita pelo deploy no
Render, confirmado `live`.

**Achado colateral, pré-existente, não corrigido**: `app/api/verify/full-proof/route.ts`
importa `getSupabaseServer` de `@/lib/supabaseServer`, que só exporta
`getSupabaseAdmin`/`supabaseAdmin`/`supabaseServer` — rota já quebrada
hoje (chamaria função indefinida em runtime), sem relação com esta
consolidação. Registrado pra correção futura.

**A Etapa 2 inteira do Plano de Separação de Fronts está concluída**:
extração do `packages/proof-engine` (item 1, seção 12.25) +
consolidação de clients Supabase (item 3, sub-parte 2, esta seção) —
front de prova e front de produto agora têm fronteira de módulo real,
não mais convivência ambígua no mesmo espaço de arquivos.

### 12.28 — Padrão a observar: telas offline "resolvendo sozinhas"
Segunda vez nesta sessão que `BARBE332`/`LEMEL186` ficam offline por
período considerável e voltam sem intervenção de código (backend
confirmado saudável nas duas vezes). Não é mais coincidência isolada —
vale registrar como padrão a monitorar. Se acontecer uma terceira vez,
merece investigação mais séria sobre causa comum (rede do bairro,
energia, ou algo na configuração física dos dois dispositivos).

### Estado ao final desta rodada de trabalho
`tsc --noEmit` em 47 erros (baseline estável o dia inteiro, sem
regressão nova). **73 testes automatizados passando** (de 40 no início
da sessão — cobertura ampliada pro bug de OTP, sessão HMAC, verify-otp,
e o pipeline de assinatura RSA). Tudo commitado, enviado e deployado —
nada pendente de aprovação neste momento.

### 12.29 — Etapa 2 do Plano de Separação de Fronts: 100% concluída (4/4 itens)
Fechamento formal: extração do proof-engine (item 1) + fundação de
dados unificada (item 2, herdada de sessões anteriores) + consolidação
de clients Supabase (item 3, 9 fases) + **testes de contrato entre os
fronts (item 4, novo)**. Testes de contrato validados simulando de
propósito os 3 bugs reais já corrigidos nesta sessão (fórmula de hash
divergente, INSERT direto fora do escritor canônico, chamada removida)
pra confirmar que cada teste realmente detecta o problema antes de
considerá-lo pronto. **Achado de risco dormente, não corrigido,
registrado**: `legacy/writeEvent.ts` (reexportado por
`lib/ledger/writeEvent.ts`) grava em `event_chain` com fórmula de hash
divergente da canônica — sem produtor real desde 2025, mas consumido
por um worker BullMQ real (`eventWorker.ts`, fila `event-queue`); se
alguém reativar essa fila sem saber disso, volta a gravar com fórmula
errada, silenciosamente. Mesma classe do bug de hash já corrigido em
06/09 e do incidente de 25/06.

### 12.30 — Clube de Telas: já existe versão diferente em produção, spec v2 pausada por decisão de negócio
Investigação revelou que o "Clube de Telas" **já tem 6 rotas reais em
produção** — mas com um modelo diferente do especificado na v2 (seção
12.17): hoje o aceite é da **parceria inteira** (não por peça), e a
aprovação é feita pelo **admin** (não pelo dono da tela que exibe).
Implementar a spec v2 não seria "adicionar campo", seria **substituir o
mecanismo de distribuição automática** por um fluxo de pedido→aprovação
por peça — escopo real: 1 migration, 4-5 rotas novas, 3 rotas
modificadas, UI nova.

**Bloqueador técnico descartado**: cobertura de coordenadas em
`client_locations` é 100% dos clientes ativos — sem PostGIS necessário,
Haversine em JS puro já implementado e suficiente pra essa escala.

**Pausado por decisão de negócio (07/09/2026)**: só existem 2 clientes
ativos no sistema inteiro — um recurso de "até 30 parceiros num raio de
5km" não tem cenário real pra testar hoje (a rede máxima possível seria
1 parceria). Plano completo de 7 fases documentado e pronto, aguardando
a base de clientes crescer o suficiente pra justificar substituir o
mecanismo que já funciona (ainda que zerado de uso).

### 12.31 — Incidente de segurança real: 108 tabelas com RLS desabilitado, exploração confirmada
Achado durante investigação de rotina (não relacionado à tarefa
original) — **grave, real, com evidência de exploração ativa**:

- **108 tabelas** com Row Level Security desabilitado, totalmente
  expostas às roles `anon`/`authenticated` — qualquer um com a chave
  pública `anon` (já embutida no bundle JS do frontend) podia ler/
  escrever diretamente
- **29 tabelas críticas/sensíveis corrigidas** (RLS habilitado) depois
  de **confirmar exploração real** — não foi ativação preventiva, foi
  resposta a uso indevido já confirmado
- **Validado sem quebrar produção**: `display_events` seguiu crescendo
  organicamente durante a mudança (602.625 → 602.632 linhas) — app real
  (`BARBE332`/`LEMEL186`) continuou funcionando normalmente
- **Teste de confirmação real**: `SET ROLE anon` contra
  `financial_closure_signatures` — de 3 linhas visíveis pra **0**,
  bloqueio total confirmado, sem nenhuma política ainda criada
- **Investigação de acompanhamento sobre o achado mais preocupante**
  (`financial_closure_signatures`, 3 registros expostos): confirmado
  que a leitura de fato aconteceu (15 chamadas reais em
  `pg_stat_statements`, não erro/vazio), mas **não dá pra cravar quando**
  — a tabela de estatísticas só agrega desde 24/12/2025 sem timestamp
  por chamada, e o Log Explorer do Supabase só retém histórico desde
  06/09/2026, um dia antes desta investigação. **Gravidade revista pra
  baixo com evidência concreta**: `signed_by` não bate com nenhum
  `admin_users` real, `tenant_id` não bate com o único tenant real
  existente — referências órfãs, forte indício de **dado de teste/
  desenvolvimento**, não fechamento financeiro real de produção. Sem
  CPF, sem valor financeiro, sem vínculo com `BARBE332`/`LEMEL186`.
  Confirmado sem atividade recente (~36h) — não é ataque em andamento
- **Decisão do fundador**: não abrir tratamento formal de incidente de
  segurança por enquanto, dado o baixo valor de exploração do conteúdo
  confirmado exposto

**Restam, sem decisão ainda**:
- **Tier 3**: demais tabelas operacionais/de negócio com RLS ainda
  desabilitado — não mexido ainda porque várias fazem parte do desenho
  público do produto de prova/verificação e precisam de política
  pensada, não ativação cega
- **Políticas de RLS específicas** pras 29 tabelas já corrigidas — hoje
  ficam com acesso **zero** pra `anon`/`authenticated` (bloqueio total,
  sem política nenhuma ainda) até alguém desenhar as políticas certas
  caso a caso

**Continuação (07/09/2026)**: Tier 3 (76 tabelas) triado por evidência
real de acesso via `pg_stat_statements`/Log Explorer, mesmo critério
usado antes — **2 tabelas com evidência real de acesso confirmada**:
`play_logs` (corrigida) e `playlist_items`. Restantes 76 sem evidência
de acesso, ficam sem urgência adicional por ora.

**`playlist_items` corrigida, com achado bônus real no caminho**: ao
desenhar a política (`SELECT` público, sem `INSERT`/`UPDATE`/`DELETE`
direto — fecha o desvio real de escrever pulando a checagem de posse da
rota server-side), teste com `SET ROLE anon` revelou que
**`schedule_rules` já estava com RLS ativado sem nenhuma política**
(não desta sessão) — `anon` via 0 linhas, o que já quebrava
silenciosamente o carregamento de agendamentos salvos no
`SchedulerEditor.tsx` do Studio, **antes de qualquer mudança de hoje**.
Corrigidas as duas juntas (mesma feature real). Validado com prova
real: `playlist_items` 7/7 linhas visíveis (preservado), `schedule_rules`
0→3/3 (bug corrigido), escrita direta testada e confirmada bloqueada
(`UPDATE` afetando 0 linhas, sem corrupção).

**Estado da segurança ao final desta rodada**: Tier 1+2 (31 tabelas,
incluindo `financial_closure_signatures`) protegidas com acesso zero
total, sem política refinada ainda. Tier 3: 2 das 78 tabelas
corrigidas (as com evidência real de acesso), 76 restantes sem
evidência de exploração, mas ainda tecnicamente expostas.

### 12.32 — BARBE332: ping baixo investigado, mesma causa física já conhecida
Confirmado com dado real: dispositivo online só ~35% dos dias no
período analisado, e quando conectado fica no ar em média só ~1/3 do
dia (vs. ~85% do `LEMEL186`). Intervalo de heartbeat idêntico entre os
dois clientes (30s hardcoded, sem config por cliente) — não é
diferença de configuração. Causa consistente com os incidentes de
offline já documentados (seção 12.28): instabilidade física/rede do
estabelecimento, possivelmente agravada por hardware diferente (T600 vs
V96). **Sem ação de código aplicável.**

**Achado bônus, sem relação, registrado**: `app/api/events/players/heartbeat/route.ts`
referencia colunas inexistentes em `players` — rota morta e quebrada ao
mesmo tempo, zero impacto prático (só `/api/player/heartbeat` é usada
de verdade).

### 12.33 — RLS: as 108 tabelas expostas, zeradas por completo
Fechamento total do incidente de segurança da seção 12.31. **0
tabelas restantes com RLS desabilitado** das 108 originais — incluindo
as ~40 órfãs (resquício de features nunca lançadas, ex: trust-graph,
alert engine morto), protegidas mesmo sem uso real confirmado (decisão
correta: "sem uso hoje" não é garantia de "sem uso nunca"). Cada
correção validada com `SET ROLE anon` antes de considerar fechada —
mesmo padrão do dia inteiro.

**Duas exceções com política real desenhada** (não só bloqueio total):
`playlist_items` e `schedule_rules`, ambas usadas pelo Studio — `SELECT`
público mantido (comportamento real preservado), sem `INSERT`/`UPDATE`/
`DELETE` direto (fecha o desvio de escrever pulando a checagem de posse
da rota server-side). No caminho, achado e corrigido bug pré-existente:
`schedule_rules` já estava com RLS ativado sem nenhuma política,
quebrando silenciosamente o carregamento de agendamentos no
`SchedulerEditor.tsx` antes de qualquer mudança desta sessão.

**Núcleo real do ledger/blockchain confirmado protegido** — escritores
em `legacy/ledger/*` (incluindo `writeEvent.ts`, consumido pelo worker
dormente `event-queue`) verificados antes de fechar a política, não
presumidos.

**Restam, sem urgência**: resto do Tier 3 já provado majoritariamente
resquício de feature nunca lançada — não representa mais risco ativo
(já protegido, seção acima), só falta eventual limpeza de código morto
correspondente, sem pressa. Política refinada específica pras tabelas
do Tier 1+2 (hoje bloqueio total) continua como item de dívida técnica,
não risco.

### 12.34 — Bug real de falso-sucesso no envio de WhatsApp, replicado em 11 lugares
Achado sério: `lib/whatsapp.ts` (e outras 10 implementações duplicadas
espalhadas pelo código) **reportava envio bem-sucedido mesmo quando a
Evolution API respondia com erro HTTP** — ou seja, o sistema podia
dizer "código enviado" pra um cliente sem o código de fato ter chegado,
sem nenhum log de erro pra rastrear depois. **Corrigido no módulo
central e em mais 7 das 11 implementações encontradas** (4 já estavam
certas). Essa é a manifestação mais extensa já registrada do Padrão de
Erro #1 do projeto (duas implementações divergentes) — 11 cópias, não
duas.

**Achado colateral, registrado, não corrigido**: duas rotas de
aprovação de mídia divergiram com o tempo, cada uma com um fix que a
outra não tem — mais uma instância do mesmo padrão, fora do escopo
desta correção.

**Fechamento completo (08/09/2026)**: checagem proativa de status do
WhatsApp (sem sintoma real reportado) revelou a causa raiz do bug —
`sendWhatsApp()` só retornava `false` em exceção de rede/timeout, nunca
checava `res.ok`; se a Evolution API respondesse com erro HTTP sem
derrubar a conexão, o envio era reportado como sucesso mesmo sem
mensagem entregue. Corrigido no módulo central. **Levantamento
completo confirmou 11 implementações locais** (não 13): 4 já
conferiam `res.ok` corretamente (sem bug), **7 corrigidas** com o
mesmo padrão mínimo (`finance/webhook` tinha até `catch {}` vazio,
engolindo erro de rede). **Decisão consciente de não consolidar as 11
num módulo só** — assinaturas divergentes entre elas, risco de
regressão maior que o benefício; a correção pontual já fecha o risco
real (falso positivo de envio).

**A duplicação de `app/admin/media/[id]` (mencionada acima) foi
corrigida no processo**: confirmado que só `app/api/admin/media/[id]`
tem consumidor real (a UI do admin nunca chama a rota sem prefixo
`/api`). Fix de fallback de telefone trazido pra rota viva; a rota sem
consumidor passou a **reexportar** o `PATCH` da rota viva em vez de
manter lógica própria divergente — mesmo padrão de "único caminho
real" já usado nesta sessão pro ledger. Validado com `next build`
completo (não só `tsc`), já que é exatamente o tipo de import que
quebrou silenciosamente antes nesta mesma sessão.

`vitest`: 81/81 passando ao final desta rodada (de 73 no fechamento
anterior).

### Estado ao final desta rodada de trabalho (07/09/2026)
Etapa 2 do Plano de Separação de Fronts: **100% concluída**. Incidente
de segurança de RLS: **100% fechado** (108/108 tabelas protegidas).
Bug de falso-sucesso do WhatsApp: **corrigido em 7 de 11 locais**
conhecidos. Tudo documentado em `STATUS_PROJETO.md` e neste documento,
commitado e deployado a cada etapa. **Nenhuma pendência de aprovação
em aberto neste momento.**

### 12.35 — Clube de Telas v2: implementação retomada (08/09/2026), com incidente real no caminho
Decisão do fundador **revertida**: implementar agora, mesmo com só 2
clientes ativos — vira argumento de venda ativo, não precisa esperar a
base crescer.

**Fase 1 concluída, com achado técnico real**: migration aplicada e
validada via `information_schema`/`pg_constraint` antes/depois. A
constraint `unique_partnership UNIQUE (requester_code, partner_code)`
do modelo binário antigo precisava ser removida — no modelo por-peça, o
mesmo par de clientes pode ter múltiplos pedidos ao longo do tempo, não
só um. `network_partnerships` ganhou `media_id` (FK), `credit_generated`,
`status` aceitando `expired_no_response`; `network_media_distribution`
ganhou `published_at`/`expires_at`/`extended`; nova tabela
`network_reciprocity_credits` (contador por par de clientes, sem
expiração). Zero mutação de dado — as 3 tabelas seguem zeradas.

**Duas decisões de produto confirmadas com o fundador**: crédito sem
expiração por tempo (contador perpétuo); assimetria entre parceiros
aceitável sem trava por ora (revisitar quando a base crescer).

**🔴 Incidente real durante a Fase 2**: ao testar
`POST /api/cron/network-partnerships-timeout` contra produção com dado
de teste, uma mensagem WhatsApp real foi enviada pro **número real do
`BARBE332`** (Gilson Pimentel), mencionando a peça de teste "ZZTMP
teste timeout (remover)". **Causa raiz**: a regra de nunca disparar
efeito colateral externo real durante teste contra produção **nunca
tinha sido escrita** no `CLAUDE.md` — existia só como convenção verbal
entre sessões, por isso foi esquecida.

**Fechamento do incidente, 3 pontos**:
1. **Causa raiz corrigida**: regra escrita no `CLAUDE.md`
   ("Testing routes against real production"), **generalizada** depois
   de auto-avaliação honesta do próprio Código Agent — cobre qualquer
   efeito colateral externo real e irreversível (mensagem, cobrança via
   Asaas, ancoragem real na Polygon, upload/delete em storage externo),
   não só WhatsApp/e-mail
2. **Documentado com rigor** no `STATUS_PROJETO.md`, mesmo padrão de
   qualquer outro achado sério da sessão (RLS, etc.)
3. **Cliente avisado**: mensagem direta e honesta enviada ao Gilson
   explicando o teste que vazou por engano

**Fases 2-6 retomadas** depois do fechamento completo do incidente —
mesmo processo de sempre, uma fase por vez com aprovação explícita.

### 12.36 — RLS: fechamento total, incluindo bypass via SECURITY DEFINER
Reverificação a pedido do fundador encontrou 2 camadas adicionais que o
fechamento anterior (seção 12.33) não cobria:
- **2 funções `SECURITY DEFINER` que bypassavam RLS** — corrigidas com
  `REVOKE EXECUTE ... FROM PUBLIC`
- **`network_reciprocity_credits`** (tabela nova, criada no mesmo dia
  pra suportar o Clube de Telas v2) ficou sem RLS na criação — achado e
  corrigido na hora, mesma sessão

Lição: qualquer tabela nova criada a partir de agora precisa entrar
com RLS habilitado desde a migration original, não como etapa
separada depois.

### 12.37 — 🔴 LEMEL186: telefone cadastrado é da própria DOOHPLAY, não do cliente
Achado grave, confirmado com evidência concreta (08/09/2026): o
telefone cadastrado pra `LEMEL186` desde a criação da conta (21/07/2026)
é um **número interno da própria DOOHPLAY** (placeholder), não o
telefone real do LeMelo. Evidência: **40 códigos OTP gerados, 0
usados** — forte indício de que o cliente **nunca conseguiu logar
sozinho via WhatsApp** desde que a conta existe, o que explica boa
parte da dificuldade de acesso perseguida ao longo de várias sessões
desta maratona (login por e-mail sempre funcionou como caminho
alternativo, mascarando o problema real).

**🔴 Ação necessária do fundador, não resolvível por código**: obter o
telefone real do LeMelo e corrigir o cadastro. Sem isso, o cliente
continua sem conseguir logar sozinho via WhatsApp, mesmo com todo o
resto do sistema tecnicamente correto.

### 12.38 — Central de Controle: mock do Figma portado com dado 100% real
`/dashboard` real ganhou o "Central de Controle" inspirado no mock do
Figma Make — mas **sem inventar nada**: impressões, receita estimada
(via CPM real) e proofs registrados (via certificações reais) usam
dado de produção de verdade; audiência/preview/fill rate **ficaram de
fora** por decisão consciente, já que não existe sensor real pra
medir isso hoje — mesmo princípio já aplicado ao reskin do Onboarding
(não portar dado fictício do protótipo).

### 12.39 — PartnerPortal.tsx (Figma Make): não serve de referência pro Clube de Telas
Investigado como candidato de referência visual — **descartado**: é um
programa de comissão de revenda/indicação (15% do MRR recorrente,
gamificação por nível), conceito de negócio completamente diferente do
Clube de Telas (que é explicitamente sem repasse financeiro). 100% dado
mockado no protótipo, sem chamada de API real.

### Estado ao final do dia (08/09/2026)
Segurança (RLS): fechada por completo, incluindo bypass via
`SECURITY DEFINER`. WhatsApp: bug de falso-sucesso corrigido em 7+1
lugares. Clube de Telas v2: implementação completa, 6/6 fases. Central
de Controle: portado do Figma com dado real. **Pendência real e
não-técnica**: telefone do `LEMEL186` precisa ser corrigido pelo
fundador — é a única ação que resta, fora do alcance de qualquer
correção de código.

### 12.40 — Clube de Telas: UI completada com referência do Figma, incluindo tela que faltava
Continuação do trabalho do Clube de Telas v2 (seção 12.35), usando o
Figma Make como fonte de referência visual — 3 candidatos investigados:

- **`PartnerPortal.tsx`**: descartado — comissão de revenda (15% MRR),
  conceito de negócio incompatível
- **`NetworkMap.tsx`/`BrazilNetworkMap.tsx`**: descartados — mapas de
  monitoramento operacional de telas (NOC/investidor), sem conceito de
  raio/distância entre clientes, sem nada reaproveitável
- **`ReferralProgram.tsx`**: **parcialmente aproveitado** — não o
  modelo de indicação/comissão, mas a **estrutura visual do card**
  (header nome/negócio, badges de status, metadados, rodapé
  condicional) virou referência de layout pra lista de "parceiros
  conectados", com paleta do produto real (não a do protótipo, mesma
  decisão já validada no reskin do Onboarding)

**Achados reais durante o religamento da UI**:
1. Lista de parceiros tinha 2 tipos de linha não-equivalentes:
   `pending` (pedido real por-peça, com `media_id`) vs. `suggested`
   (sugestão do admin, sem peça) — religar "Aceitar" cegamente pras
   duas quebraria `suggested` com erro 400. Corrigido: `/respond` só
   pra `pending`; `suggested` vira estado informativo, sem ação que a
   API não suporta
2. **Bug real, silencioso, encontrado e corrigido**: `suggest/route.ts`
   ainda dependia da constraint `unique_partnership`, removida na Fase
   1 — daria erro 500 na próxima vez que fosse exercitada
3. **Lacuna de negócio identificada e fechada**: não existia nenhuma UI
   pra **criar** um pedido de parceria (só responder) — crítico pro
   objetivo de usar como argumento de venda, já que sem isso nenhum
   dono de tela conseguiria demonstrar o fluxo completo pelo dashboard

**Nova tela construída**: seção "Solicitar nova parceria", reaproveitando
componente já existente (`SendPieceControl`), nova rota de leitura
`GET /api/client/network-partnerships/[code]/candidates`. **Teste
negativo validado com dado real**: `BARBE332`↔`LEMEL186` a 12,04km
(acima do raio de 5km) — confirmado que a rota devolve lista vazia pros
dois, comportamento correto, sem necessidade de criar/limpar dado de
teste (só leitura).

**Cuidado de transparência aplicado**: o preview visual usado pra
avaliar o layout (card "de exemplo", já que não há candidato real hoje
pra mostrar) foi marcado de forma inequívoca — selo "EXEMPLO — NÃO É
DADO REAL", borda tracejada, nome fictício óbvio, botão desabilitado —
e confirmado que esse card **existe só no arquivo de preview estático
local**, nunca no código React de produção (que mostra lista vazia
honesta, "nenhum estabelecimento disponível", quando não há candidato
real).

**Clube de Telas: implementação completa incluindo UI de ponta a
ponta** (criar pedido → aprovar/recusar → propagação → timeout →
expiração), pronto como argumento de venda demonstrável — mesmo sem
uso real ainda, já que os 2 clientes reais estão fora do raio um do
outro.

### 12.41 — Fechamento do dia: bugs residuais, botão Sair, design tokens formalizados
Continuação e fechamento de várias frentes abertas ao longo do dia
08-09/09/2026:

**Bugs residuais corrigidos**:
- `suggest/route.ts`: `ON CONFLICT` dependia da constraint
  `unique_partnership`, removida na Fase 1 da migration do Clube de
  Telas — corrigido antes de dar erro 500 na próxima execução real
- **Sessão fantasma no logout**: a rota de logout do dashboard do
  cliente só limpava um dos dois cookies de sessão (histórico já
  conhecido de dois mecanismos paralelos, `doohplay_session`/
  `doohplay_client_session`) — usuário "saía" mas ficava uma sessão
  residual. Corrigido, **verificado via `curl` seguro contra produção**
  (não é teste real de login com OTP via WhatsApp dos dois clientes —
  isso exigiria acesso real ao WhatsApp de cada um; correção de
  precisão sobre um registro anterior desta mesma seção, que dizia
  "testado com os dois clientes reais" de forma imprecisa)
- **Botão "Sair" adicionado** no dashboard do cliente — não existia
  antes, mesmo com a rota de logout já existindo desde a Fase 14

**Design tokens formalizados**, em três rodadas:
- `lib/theme.ts` criado com `slateDark`/`lightDefault` — primeira
  centralização real da paleta do produto
- `marketingDark` separado pras ~20 páginas de marketing/cadastro —
  achado real no caminho: **inconsistência de tom em 14 delas**
  (`#0B1120` vs `#0F172A`), unificado e testado byte a byte
- `previewDark` — formaliza a simulação de tela de prévia do Studio
  guiado, que tinha sido copiada do Figma numa sessão anterior (ver
  seção 12.20, templates guiados) mas nunca virou tema real, ficando
  solta como cópia isolada até agora
- **4 arquivos residuais migrados** (`api/qrcode/url`, `api/qrcode/[code]`,
  `lead/[code]`, `pitch`) — mesmo achado de `#0B1120` vs `#0F172A` do
  `marketingDark`, fora do escopo original por terem sido descobertos
  depois. Validação extra nos 2 QR codes: confirmado byte a byte que só
  o atributo visual (`stroke`) muda — o padrão estrutural do QR (o que
  a câmera de fato lê no scan) permanece idêntico
- **`app/player/page.tsx` deixado intocado, por decisão consciente**:
  mesmo achado de cor ali (rótulo pequeno no overlay de QR code), mas é
  a página rodando ao vivo nas TVs reais de `BARBE332`/`LEMEL186` agora
  — sem forma de testar localmente, risco desproporcional ao ganho
  visual mínimo. Registrado como pendência de baixíssima prioridade,
  não esquecida
- 3 consumidores reais migrados: `/admin/risk`, ~19 páginas de
  marketing, e a simulação de preview do Studio guiado
- **Fonte `Inter` carregada de verdade pela primeira vez** — estava
  declarada em CSS mas nunca efetivamente servida antes

**Revarredura completa do Clube de Telas**: confirmado **zero
desconexão remanescente** — todos os botões/fluxos ligados corretamente
às rotas reais. **Verificação final honesta**: `BARBE332`/`LEMEL186`
continuam a 12,04km um do outro (fora do raio de 5km) — o ciclo
completo (pedido → aprovação → peça circulando de verdade) **não foi
fechado com prova real hoje**, só validado estruturalmente (rotas
corretas, teste negativo confirmado). Isso não é falha — é honestidade
sobre o limite real de teste possível com só 2 clientes reais e essa
distância entre eles.

**Portal do anunciante**: revarredura completa feita a pedido —
**nenhum bug real encontrado**; o pedido original ("religa o botão pra
criar pedido") era confusão de vocabulário entre "Clube de Telas"
(onde existe "pedido") e "Portal do anunciante" (onde o fluxo se chama
"Criar Campanha", já conectado corretamente) — esclarecido antes de
qualquer mudança desnecessária.

**Decisão do Redis/Upstash fechada** (formalizada nesta sessão): não
consolidar conexões nem fazer upgrade por ora — o circuit-breaker já
elimina o risco ativo; revisitar só se o rate-limit voltar a aparecer
ou a base de clientes crescer.

### Estado ao final do dia (09/09/2026)
`git status`: branch em dia com `origin/master`, nada pendente além da
convenção de `.claude/settings.local.json` (nunca commitado). **Nenhuma
pendência técnica em aberto** — só o telefone do `LEMEL186`, que
depende exclusivamente do fundador (adiado por decisão consciente).

### 12.44 — Reskin sequenciado das 4 áreas com Designer Agent: `app/admin` fechado
Continuação da decisão de aplicar UX substancial nas 4 áreas do
produto (dashboard interno, admin, anunciante, dashboard do cliente),
usando o Designer Agent recém-criado.

**Reinvestigação obrigatória, achado importante**: a investigação
original tinha sido feita no checkout local divergente (`demo-master`,
ver seção 12.43) — reconfirmada contra a linha real de produção
(`demo/master`, clone limpo em novo diretório
`c:\DOOHPLAY\dashboard-web-prod`, HEAD em `cb67684`, batendo com o
deploy live). **Escopo real mudou em relação à investigação antiga**:
`app/admin/risk` já tinha sido reskinado do lado de produção;
`app/dashboard` interno cresceu de 1 pra 4 sub-rotas
(`analytics`/`executive`/`trust`, órfãs — sem link em nenhum lugar do
produto, origem/intenção não confirmada, pendência de decisão de
produto antes de investir design ali).

**Ordem de prioridade final**: 1º `app/admin` (menor escopo real,
alto uso diário do fundador), 2º `app/dashboard` interno (maior
escopo, mas com pergunta de produto pendente sobre as rotas órfãs),
3º dashboard do cliente (só acompanhamento — já maduro, migrado pra
`lib/theme.ts` do lado de produção), 4º `app/anunciante` (zero uso
real, confirmado sem mudança desde a investigação anterior).

**`app/admin` — fechado, deployado, confirmado live** (commit
`dbc6648`):
- `app/admin/page.tsx` (3.700 linhas): centralização pura — 11
  constantes locais (`BG`/`SURFACE`/`BORDER`/etc.) substituídas por
  import de `slateDark` de `lib/theme.ts`, ~939 referências trocadas.
  Valores idênticos, zero mudança visual, só remove duplicação
- `app/admin/reports/page.tsx`: reskin real de tema claro pra escuro
  (mesmo padrão visual de `admin/risk`), badges de status
  reestruturados, **estado vazio honesto adicionado** ("Nenhum
  relatório emitido ainda", não existia antes). Dado real preservado
  (`pdf_hashes` via Supabase, ações Verificar/PDF/Revogar intactas)
- `app/admin/metrics`: **decisão consciente de não mexer agora** —
  baixo uso (só o fundador, ocasionalmente), baixo ganho de polish
- **Decisão separada, registrada, não executada**: quebrar
  `page.tsx` (3.700 linhas) em componentes menores — risco maior,
  arquivo de uso diário, fica pra considerar depois se virar dor real
- Validado: `tsc --noEmit` (47, idêntico), `next build` compilando os
  2 arquivos sem erro novo. Teste visual real não possível localmente
  (dependem de sessão NextAuth + banco de produção) — confirmado só via
  deploy real, `live` sem falha
EOF
echo done

### 12.42 — Designer Agent: 5º agente de sistema, criado e confirmado carregando
Novo agente, desenhado com uma correção importante em cima do rascunho
original: o texto trazido pelo fundador descrevia capacidades de nível
Broadsign/Scala (ad inventory com targeting, calendário com modo
emergência, multi-tenancy avançada) como se já fossem parte real do
produto. **Reformulado** com a mesma disciplina do dia inteiro: nunca
desenhar tela pra funcionalidade que não existe de verdade — mesmo
gatilho de "parar e perguntar" que os outros agentes já seguem pra
código, agora aplicado a design.

**Ancorado no que já é real**: usa os tokens formalizados em
`lib/theme.ts` (`slateDark`/`lightDefault`/`marketingDark`/`previewDark`),
trata os reskins já feitos (Onboarding, Clube de Telas) como precedente
de processo a seguir, nunca a paleta do protótipo Figma Make.

**Commitado e confirmado disponível** (`.claude/agents/designer-agent.md`,
commit `cb67484`, mesmo padrão dos outros 4 agentes já versionados —
`arquiteto-agent`/`codigo-agent`/`docs-produto-agent` em `0ffe404`,
`financeiro-agent` em `75baa45`). Harness re-escaneou e o agente já
apareceu disponível na mesma sessão, sem precisar esperar a próxima.

**Ainda não confirmado em uso real** (fazendo trabalho de design de
fato) — só confirmado que carrega e está registrado, mesma cautela já
aplicada ao Financeiro Agent antes de declarar "em uso".

**5 agentes de sistema agora existem**: Arquiteto, Código, Docs &
Produto, Financeiro, Designer.

### 12.43 — 🔴 Bifurcação real descoberta: 1.091 commits locais órfãos, sem backup até hoje
Achado crítico durante a investigação de UX do `app/admin` — não é mais
um alarme falso (ao contrário das alucinações já corrigidas antes
nesta sessão), é confirmado com evidência de commit e histórico Git
real.

**O que aconteceu**: duas linhas de desenvolvimento divergiram de um
ancestral comum (18/05/2026) e cresceram em paralelo por ~4 meses, sem
nunca sincronizar:
- **Local (`demo-master`, este checkout específico)**: 1.091 commits
  únicos, incluindo um bloco de 34 commits mais recentes com trabalho
  real — "TV 3.0 Ready" (5 commits, 16-19/08) e uma correção extensa de
  **conteúdo fabricado em produção**: marcas reais usadas indevidamente
  como "anunciante interessado" (Bradesco, iFood, Samsung, Itaú,
  Natura), números fictícios de rede, certificação SOC2/KPMG removida,
  migração do CRM pra banco (pendente rodar migration)
- **Remoto (`demo/master`)**: recebeu um `git push --force` em algum
  momento a partir do mesmo ponto de 18/05, cortando a linha local fora
  do remoto — é essa linha que está **em produção agora**
  (`doohplay.com.br`, confirmado via Render: deploy live é o commit
  `cb67484`, "feat: adiciona Designer Agent") — a mesma linha de todo o
  trabalho desta sessão (Clube de Telas, RLS, WhatsApp, design tokens)

**Risco identificado a tempo**: os 1.091 commits locais existiam **só
neste checkout**, sem nenhuma cópia remota — risco real de perda total
se o diretório fosse apagado/corrompido.

**✅ Backup de segurança feito imediatamente** (09/09/2026): duas
branches de backup criadas no remoto (`backup-demo-master-09-09-2026`,
`backup-demo-master-2026-09-09`), hash de topo confirmado batendo com o
local (`3c3d8a9`). `feature/dtv-ready-mvp` confirmada 100% contida em
`demo-master` (via `merge-base --is-ancestor`), sem commit exclusivo —
já coberta pelo backup acima, sem necessidade de branch própria.

**Nenhum merge/reset/rebase feito ainda** — `master`/`demo-master` em
produção seguem intactos. **Reconciliação ainda pendente**, com dois
blocos tratados separadamente por decisão consciente:
1. **✅ Correções de conteúdo fabricado — RECONCILIADO (09/09/2026),
   sem necessidade de merge**: investigação completa dos 15 itens do
   bloco (números de escala fabricados na landing, SOC2/KPMG,
   Ethereum→Polygon, AI Revenue Center citando marcas reais como
   Itaú/iFood/Samsung/Natura, migração do CRM, e mais) confirmou que
   **100% já estão resolvidos de forma equivalente em `demo/master`**
   — em vários casos com a mesma data e texto de comentário, indício
   forte de que as duas sessões seguiam o mesmo princípio do mesmo
   documento-mestre de forma independente. Nenhum commit local
   precisou ser trazido; backup mantido só como registro histórico
2. **"TV 3.0 Ready"**: o próprio commit original já documentava
   cautela ("aguardando revisão humana antes de qualquer merge") —
   precisa da mesma reconciliação de postura sobre DTV+ já registrada
   antes nesta sessão (seção 3.5 do v4.0: canônico é a postura
   cautelosa do Roadmap Técnico, não a agressiva do Documento
   Consolidado de Ideias) antes de decidir se e como mesclar. **Ainda
   não investigado, deliberadamente fora de escopo**

**Restam ~19 commits do bloco de 34** (Studio visual, bug fixes de
build/Studio) — investigação em andamento, mesmo processo de comparar
com `demo/master` antes de propor qualquer coisa.

**✅ Segundo bloco reconciliado (09/09/2026)**: os ~10 commits
restantes desse grupo (Studio layout 3 colunas, fix do botão "Ver
portal", `/verify` nav, `/enterprise`, `/planos` FAQ acordeão, os 3
subagentes — produção já tem 2 a mais, Financeiro e Designer —, e
`app/dashboard/components/`, onde produção tem até mais componentes
que o local) **já têm equivalente em `demo/master`**, em vários casos
com o mesmo comentário e a mesma data (17/08/2026).

**Estado final da reconciliação dos 34 commits recentes**: 26 de 34 já
cobertos (15 de conteúdo fabricado + CRM, 10 deste segundo bloco, 1
bônus/Central de Controle). **Só os 8 commits de TV 3.0 Ready seguem
sem equivalente em produção** — fora de escopo, aguardando decisão de
postura (seção 3.5).

**Decisão consciente de não investigar os ~1.057 commits mais antigos**
da branch local (anteriores a este bloco de 34): risco de perda já
eliminado pelo backup; é mais provável que sejam histórico de
desenvolvimento naturalmente absorvido nos dois lados ao longo do
tempo, não trabalho novo desconectado como os 34 recentes. Fica
registrado como "não investigado, mas seguro" — revisitar só se algo
específico precisar ser recuperado no futuro.

**Reconciliação de código encerrada por ora.** Único item real
pendente: decisão de postura sobre TV 3.0 Ready antes de qualquer
merge desse bloco específico.

**Lição**: o mesmo padrão que já causou fragmentação de documentação
(múltiplos continuity docs paralelos, várias sessões atrás) se repetiu
em nível de código-fonte — duas sessões trabalhando sem saber uma da
outra, divergindo silenciosamente por meses. Vale, daqui pra frente,
confirmar `git log` contra o remoto real no início de qualquer sessão
grande, não só assumir que o checkout local está sincronizado.
