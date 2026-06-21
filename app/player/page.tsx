# DOOHPLAY — Script de Continuidade de Sessão (Atualizado 20/06/2026 — sessão 2)

> Cole este documento inteiro como primeira mensagem em um novo chat para retomar o projeto sem perder contexto. Este documento substitui a versão anterior do mesmo dia — incorpora a feature de divisão de slots implementada nesta sessão.

## SOBRE O PROJETO

DOOHPLAY é uma plataforma de mídia DOOH (Digital Out-of-Home) local brasileira que transforma TVs de pequenos estabelecimentos (barbearias, bares, padarias) em telas de publicidade monetizadas. O modelo combina: conteúdo do dono, anúncios pagos, rede de troca entre parceiros locais (Clube de Telas), e conteúdo institucional da DOOHPLAY.

---

## STACK & INFRAESTRUTURA

(sem alterações desta sessão — ver detalhes completos abaixo, mantidos da versão anterior)

- **Framework:** Next.js 15.1.11 + TypeScript (strict mode ativado)
- **Banco:** PostgreSQL — hospedado no Supabase (não no Render). Host: `aws-1-us-east-2.pooler.supabase.com`, projeto `mdlbajgnntjwhycouzit`.
- **Storage:** Cloudflare R2 (bucket: `dooh-media`)
- **Domínio de mídia:** `media.doohplay.com.br` (nunca usar `pub-0ad4cd3201ce42198c5211fe201ff660.r2.dev`)
- **WhatsApp:** Evolution API (risco de ban em escala, migrar para WhatsApp Business API oficial antes de campanhas em massa)
- **Email:** Resend
- **Pagamentos:** Asaas (PIX/boleto, assinaturas recorrentes)
- **IA:** Anthropic API configurada via `ANTHROPIC_API_KEY` no Render (nenhuma feature de IA implementada ainda)
- **Deploy:** Render → `doohplay.com.br`. Serviços: `doohplay-demo` (web), `doohplay-workers`, `doohplay-monthly-report` (cron). Banco NÃO está no Render.
- **Repo:** `github.com/mediaconnection/doohplay-demo` (branch `master`) — público, clonável sem autenticação.
- **DNS:** Cloudflare (`rene.ns.cloudflare.com` / `sky.ns.cloudflare.com`)
- **Prisma:** só gerencia `PdfCertification`. Todo o resto do schema real foi criado via SQL manual no Supabase, sem migration registrada. **Nunca assumir schema pelo código — sempre consultar o banco diretamente.**

---

## CLIENTE REAL EM PRODUÇÃO

- **Barbearia Zimermam** | código: `BARBE332`
- TV: Android TV T600, Android 10 (Fire Stick também em uso — bug ainda não confirmado como 100% resolvido, ver pendências)
- `player_id`: `cccccccc-0001-0001-0001-000000000001`
- Dashboard: `doohplay.com.br/dashboard/local/BARBE332`
- Player: `doohplay.com.br/player?screen=BARBE332`
- Plano: Starter (R$ 97/mês), assinatura Asaas: `sub_in0689qzmjbf87ka`
- Dono: Gilson Pimentel
- Geocodificado: lat `-23.595978`, long `-46.7297974`
- **10 mídias atuais em `"CampaignMedia"`, todas `content_source = 'dono'`** (confirmado nesta sessão via query direta — número maior que os 5 documentados anteriormente, provavelmente sobras de upload/teste; não investigado a fundo, não é bloqueante)

---

## CREDENCIAIS IMPORTANTES

- **Admin:** `admin@doohplay.com.br` / `Me251294a`
- **CRM:** PIN `dooh2026`
- **ADMIN_SECRET:** autentica rotas `/api/admin/*` via `?secret=`. Contém `@` — sempre URL-encodar como `%40` em curl.
- Variáveis já configuradas no Render: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SECRET`, `ANTHROPIC_API_KEY`, `ASAAS_API_KEY`, `ASAAS_ENV=production`, `CRON_SECRET`, `DATABASE_URL`, `R2_*`, `EVOLUTION_*`, `RESEND_API_KEY`

---

## ESTRUTURA DO BANCO (tabelas reais confirmadas)

⚠️ Nomenclatura inconsistente (PascalCase com aspas vs snake_case). Sempre confirmar via `information_schema` antes de UPDATE/DELETE.

### Tabelas de conteúdo/cliente
- `"CampaignMedia"` — mídias reais. Colunas: `id`, `campaignId`, `name`, `type`, `url`, `status`, `createdAt`, **`content_source`** (NOVO nesta sessão — `'dono'` ou `'anunciante'`, default `'dono'`, CHECK constraint). Tabela usada pela API de playlist.
- `"Campaign"` — campanhas (`id`, `advertiserCode`, `name`, `status`, `startDate`, `endDate`, `budget`, `impressions`, `createdAt`, `updatedAt`)
- `"Advertiser"` — shadow advertiser por cliente (`id`, `code`, `name`, `email`, `phone`, `createdAt`)
- `studio_clients` — dados do cliente (sem lat/long, ver `client_locations`)
- `playlist_schedule` — programação avançada (dias, horário, datas)
- `financial_subscriptions` — assinaturas Asaas
- `playlist_items`, `media_files`, `media_assets` — legado/demo, não usados pelo fluxo principal

**API principal de playlist:** `app/api/client/playlist/[code]/route.ts` — agora retorna 4 categorias unidas (`UNION` via `Promise.all` de 3 queries), campo `slot_category` em cada item: `'dono'`, `'anunciante'`, `'rede'`, `'institucional'`. Campo de mídia continua `asset_url`.

### Sistema de monitoramento/trust score
(sem alterações — `players`, `screens`, `player_heartbeats`, `player_campaigns`, `campaign_logs`, `programmatic_bids`, `alerts_log`, `play_logs`, `schedule`. Módulo de fraude/anomalia, não confundir com o "Clube de Telas" comercial.)

### Tabelas do Clube de Telas do Bairro (sessão anterior)
```sql
client_locations, network_partnerships, network_media, network_media_distribution
```
**Status real:** schema existe, motor de sugestão/aceite de parceria (`network_partnerships`) está implementado e testado. **Mas a distribuição de mídia em si (`network_media`, `network_media_distribution`) não tem NENHUMA rota de API nem UI ainda** — descoberto nesta sessão ao investigar o player. As tabelas existem vazias. Isso significa que hoje o "Clube de Telas" só resolve o pareamento entre estabelecimentos, não a troca de conteúdo de fato.

### Tabela nova: `institutional_media` (NOVO — criada nesta sessão)
```sql
institutional_media (
  id uuid PK, name text, type text CHECK IN ('image','video'),
  url text, duration integer DEFAULT 15, active boolean DEFAULT true,
  position integer DEFAULT 0, created_at timestamptz
)
```
Conteúdo institucional da DOOHPLAY, exibido em todas as telas. **Está vazia** — nenhuma peça foi produzida ainda. Sem rota de admin para gerenciar ainda (inserção seria via SQL direto por enquanto).

---

## FEATURES IMPLEMENTADAS NESTA SESSÃO (20/06/2026, parte 2)

### Divisão de slots por categoria — ✅ IMPLEMENTADO (era "decidido, não implementado")

**Migração SQL aplicada com sucesso em produção:**
- `ALTER TABLE "CampaignMedia" ADD COLUMN content_source` (`'dono'` | `'anunciante'`, default `'dono'`)
- `CREATE TABLE institutional_media`
- Confirmado: 10 mídias do Zimermam todas com `content_source = 'dono'`, `institutional_media` vazia (0 rows) — exatamente como esperado.

**Backend (`app/api/client/playlist/[code]/route.ts`):**
- Query antiga (só `CampaignMedia` JOIN `Campaign`) foi dividida em 3 queries paralelas via `Promise.all`:
  1. Dono + Anunciante — mesma lógica antiga, agora retornando `content_source` como `slot_category`
  2. Rede — `network_media_distribution` JOIN `network_media`, filtrado por `displayed_on_code = $1`, `active = true`, `status = 'approved'` (hoje sempre retorna vazio, pois não há dados ainda — ver pendência acima)
  3. Institucional — `institutional_media` ativo (hoje sempre vazio)
- Resultado unido em um único array `items`, cada item com campo `slot_category`.
- `getPlayerData()` em `app/player/page.tsx` foi atualizado com a mesma lógica (faz sua própria query direta, separada da API de playlist — usada no carregamento inicial server-side; a API é usada só pelo polling client-side).

**Player (`app/player/page.tsx`):**
- Substituída a lógica de round-robin sequencial (`current = (current+1) % medias.length`) por **sorteio ponderado por categoria**:
  - Pesos: `dono: 15, anunciante: 60, rede: 15, institucional: 10`
  - A cada troca de slide: agrupa mídias disponíveis por `category`, sorteia uma categoria com peso proporcional **apenas entre as categorias que têm conteúdo no momento** (peso das vazias é redistribuído automaticamente — não trava a tela esperando anúncio/rede/institucional que não existe ainda)
  - Dentro da categoria sorteada, percorre os itens em round-robin (cursor por categoria, não aleatório dentro do grupo)
  - Mantém a arquitetura de 2 slots fixos (slotA/slotB) da sessão anterior — a próxima mídia sorteada é pré-carregada no slot inativo antes da troca, sem alterar a arquitetura de renderização sob demanda
- Validado com `tsc --noEmit -p tsconfig.json` sem erros nos arquivos alterados antes da entrega.
- **Testado em produção:** migração + deploy feitos pelo usuário, query de confirmação rodada com sucesso. **Ainda não confirmado visualmente que o player na TV do Zimermam está exibindo normalmente após o deploy** — próxima sessão deveria confirmar isso como primeira checagem.

---

### Anúncio real de terceiro (MVP) — ✅ IMPLEMENTADO (20/06/2026, parte 4)
Antes desta sessão, "vender anúncio de terceiro" era 100% mock: a aba "Anúncios" do dashboard mostrava um array fixo (Bradesco/iFood/Natura), e o único fluxo de campanha de anunciante existente (`/anunciante/[code]`, `/api/advertiser/[code]/campaigns`) vinculava campanhas a uma lista fake de 10 shoppings fictícios (`SCREEN_MAP` hardcoded — "Shopping Ibirapuera", "Shopping Rio Sul" etc.), sem nenhuma ligação com telas reais.

**O que foi construído:**
- `GET /api/advertiser/screens` (novo) — lista as telas reais ativas (`studio_clients`) disponíveis para o anunciante escolher. Substitui a lista fake.
- `POST /api/advertiser/[code]/campaigns` — agora valida e vincula contra telas reais (`studio_clients.code`), em vez do `SCREEN_MAP` fixo.
- `app/anunciante/[code]/page.tsx` — busca a lista de telas via o novo endpoint em vez de array fixo client-side.
- `GET /api/client/playlist/[code]/route.ts` e `getPlayerData()` em `app/player/page.tsx` — adicionada uma 4ª fonte de conteúdo: anúncio real de terceiro, via `JOIN "CampaignScreen" → "Campaign" → "CampaignMedia"`, filtrando por `screenId = código da tela`, `Campaign.status = 'active'` e dentro do intervalo `startDate`/`endDate`. Entra na categoria `anunciante` do sorteio ponderado de slots.
- `GET /api/client/ads/[code]` (novo) — retorna os anúncios reais rodando na tela de um cliente (nome do anunciante, campanha, status Ativo/Pausado, contagem de exibições via `display_events`).
- `TabAnuncios` no dashboard (`dashboard-client.tsx`) — substituído o array mockado por fetch real desse endpoint novo.
- **Tabela `CampaignScreen` já existia no banco** (descoberta em sessão anterior, vazia/com dados fake) — não foi preciso nenhuma migration SQL nova para essa feature, só trocar o que a alimentava.

**Testado em produção, ponta a ponta:** criada uma campanha de teste (`Campaign` + `CampaignMedia` + `CampaignScreen` via SQL manual, simulando o que o fluxo real faria) vinculada à tela do BARBE332. Confirmado:
1. `GET /api/advertiser/screens` retorna `BARBE332` e `TESTE719` reais.
2. `GET /api/client/playlist/BARBE332` retornou o item de teste com `"slot_category":"anunciante"`, respeitando datas da campanha.
3. Aba "Anúncios" do dashboard mostrou o anunciante real (nome, campanha, "5 exibições", status "Ativo").
4. Dados de teste limpos depois via `DELETE` em `CampaignScreen`/`CampaignMedia`/`Campaign`.

**Incidente durante o teste (registrar para não repetir):** ao entregar os 7 arquivos dessa feature de uma vez, 1 deles (`playlist_code_route.ts`, o mais crítico) não foi colado de verdade — o usuário confirmou "pronto" mas o arquivo no GitHub continuou com a versão anterior. Só foi descoberto pedindo pra ele confirmar via Ctrl+F no código-fonte do GitHub se a string `CampaignScreen` aparecia no arquivo. **Esse é o MESMO padrão de erro já documentado duas vezes em sessões anteriores** (arquivo não colado/sobrescrito errado ao entregar múltiplos arquivos de uma vez) — agora são 3 ocorrências. Vale reforçar ainda mais a mitigação: depois de qualquer entrega de múltiplos arquivos, **sempre confirmar pelo menos o arquivo mais crítico via Ctrl+F de uma string única antes de assumir que o "pronto, já fiz deploy" do usuário significa que colou certo**.

**Pendências que ficam para a versão completa (não implementadas):**
- Cobrança real via Asaas no momento da compra da campanha (hoje o anunciante "compra" mas não há cobrança automática vinculada).
- Vitrine para o anunciante navegar/escolher telas com mais contexto (hoje é só uma lista simples).
- Fluxo de aprovação/moderação de mídia de anunciante antes de ir ao ar (hoje qualquer `CampaignMedia` com `status != 'rejected'` entra automaticamente).
- Repasse financeiro real pro dono da tela na aba "Ganhos" (continua sem dados reais de anúncio de terceiro).
- Vínculo campanha↔tela ainda é manual (admin roda SQL ou usa o formulário do anunciante) — não há UI de admin dedicada para isso ainda.
- `Advertiser.segment`/`city`/`cnpj` são coletados no formulário de cadastro mas **nunca são salvos no banco** (bug pré-existente, não corrigido nesta sessão, baixa prioridade).

### Distribuição de mídia do Clube de Telas — ✅ IMPLEMENTADO (20-21/06/2026, parte 7)
Antes desta sessão, o Clube de Telas só tinha o pareamento entre parceiros (sugestão/aceite) — a troca de mídia em si nunca tinha sido construída. Isso foi implementado e validado de ponta a ponta, mas foi a parte mais turbulenta da sessão, com vários incidentes pelo caminho (documentados abaixo, porque o padrão deles importa pra próximas sessões).

**O que foi construído:**
- `POST/GET /api/client/network-media/[code]` (novo) — dono envia mídia específica pra rede (separada do conteúdo pessoal), com a mesma validação de resolução/bitrate de vídeo já existente. Mídia entra como `pending_review`.
- `PATCH /api/admin/network-media/[id]` (novo) — admin aprova/rejeita. Ao aprovar, distribui automaticamente a mídia pra todos os parceiros já **aceitos** daquele dono (via INSERT em `network_media_distribution`).
- `app/api/admin/network-partnerships/respond/route.ts` (modificado) — ao uma parceria ser aceita, distribui automaticamente qualquer mídia **já aprovada** de cada lado pro outro (cobre o caso inverso: mídia aprovada antes da parceria existir).
- Aba "🤝 Rede" no admin (`app/admin/page.tsx`) — modera mídia de rede pendente, mesmo padrão visual da aba Mídias.
- Seção "Mídia que você manda pra rede" na aba Clube de Telas do dashboard do dono (`dashboard-client.tsx`) — upload + lista com status.
- `app/api/admin/stats/route.ts` — passou a incluir `networkMedia` no payload.

**Testado em produção, ponta a ponta, com simulação real:** parceria `BARBE332`↔`TESTE719` criada como aceita, mídia de teste enviada pelo dono, aprovada no admin, distribuição automática confirmada na tabela, **e confirmada aparecendo na playlist real do parceiro** (`GET /api/client/playlist/TESTE719` retornou o item com `slot_category: "rede"`). Dados de teste limpos depois.

- **Mídia de rede com botão "Excluir"** (`DELETE /api/client/network-media/[code]`) — dono pode excluir mídia que mandou pra rede (remove do banco, da distribuição pros parceiros e do R2). "Trocar" mídia = excluir + enviar nova, não existe um fluxo de "substituir no lugar".
- **Seção "Mídia de parceiros tocando na sua tela"** (`GET /api/client/network-media-incoming/[code]`) — mostra, na própria aba Clube de Telas, a mídia que está vindo de parceiros pra exibir na tela do dono (nome do parceiro incluso). Antes disso só existia visão do que o dono manda pra fora, não do que recebe.
  - **Validado visualmente em produção** (botão Excluir aparece, seção de mídia recebida aparece vazia como esperado); o clique de exclusão em si não foi testado de fato nesta sessão — considerado validado por inspeção visual a pedido do usuário.



1. **`dashboard-client.tsx` foi sobrescrito com o conteúdo de `admin/page.tsx`** — o quinto caso (!) do padrão "arquivo colado no lugar errado" nesta sessão, mas o mais grave até agora: quebrou a página inteira do dashboard do cliente (`Application error`, `TypeError: Cannot destructure property 'data' of useSession`, porque `useSession` do NextAuth não existe fora do contexto do admin). Só foi descoberto depois de pedir pro usuário comparar o início do arquivo linha por linha no GitHub. **Causa provável:** ao colar múltiplos arquivos parecidos (ambos grandes, ambos `.tsx`, ambos com várias funções `Tab...`), ficou fácil confundir qual conteúdo ia em qual aba do navegador/qual arquivo do GitHub. Resolvido recolando o conteúdo certo.
2. **Cast de tipo errado em `gen_random_uuid()::text`** — a coluna `network_media.id` é `uuid`, não `text` (erro meu, assumi o tipo errado). Causou `"column "id" is of type uuid but expression is of type text"` toda vez que o dono tentava enviar mídia de rede. Resolvido removendo o `::text`. **Esse mesmo padrão de erro pode existir em outras inserções que eu tenha escrito nesta sessão usando `gen_random_uuid()::text` — vale auditar se aparecer outro erro parecido.**
3. **Perda de dados: `"CampaignMedia"` ficou com 0 registros**, mesmo a campanha do BARBE332 e os arquivos físicos no R2 continuando intactos. **Causa raiz não identificada** — não foi nenhum comando SQL desta sessão (os `DELETE` rodados sempre tinham `WHERE` específico). Recuperado reconstruindo os registros a partir da listagem real do bucket R2 (via `GET /api/studio/upload?code=BARBE332`, que já existia e lista os arquivos direto do storage, independente do banco). **Isso é uma pendência real: o "porquê" continua desconhecido, e pode acontecer de novo.** Vale considerar, numa próxima sessão, investigar se existe algum trigger, cron, ou rotina de limpeza automática que possa estar apagando linhas dessa tabela sem querer.
4. **`R2_PUBLIC_URL` configurada no Render com o domínio antigo bloqueado por antivírus** (`pub-0ad4cd3201ce42198c5211fe201ff660.r2.dev`), em vez de `https://media.doohplay.com.br`. Isso não tinha sido percebido antes porque a rota de upload do dono (`studio/upload`) usa um valor fixo no código, não essa variável — mas a rota nova de mídia de rede usa a variável de ambiente direto, e herdou o valor errado. **Resolvido no Render** (variável atualizada). Mídias enviadas antes da correção continuam com a URL antiga salva no banco (não foi corrigido retroativamente, mas não é bloqueante — o domínio antigo ainda funciona, só é o que é bloqueado por antivírus em alguns dispositivos).


Prevenção para o bug descoberto na parte 3 desta sessão (cliente se cadastrando errado como anunciante e fazendo upload pelo portal errado).

**Esclarecimento importante (descoberto na validação):** ter o mesmo telefone cadastrado como dono de tela E anunciante **não é necessariamente um erro** — pode ser um dono de tela legitimamente querendo anunciar nas telas de outros parceiros, um comportamento de crescimento que o produto deve incentivar, não bloquear. O problema real do Gilson foi um caso específico (upload do próprio conteúdo pelo portal errado), não a duplicidade de cadastro em si. A mensagem foi ajustada nos dois lugares pra refletir essa nuance — nem o aviso nas páginas de cadastro nem o painel admin tratam isso como erro; é só um heads-up pra quem for revisar.

**O que foi construído:**
- Tabela nova `duplicate_signup_alerts` (`phone`, `studio_client_code`, `advertiser_code`, `detected_at`, `resolved`).
- `/api/cadastro` (POST, dono de tela) — depois de criar o `studio_clients`, checa se o telefone já existe em `"Advertiser"`; se sim, insere um alerta (não bloqueia o cadastro).
- `/api/advertiser/register` (POST, anunciante) — checagem reversa: se o telefone já existe em `studio_clients`, insere o mesmo tipo de alerta.
- Aviso visual no topo de `/cadastro` (dono) apontando pra `/anunciante/novo`, e vice-versa em `/anunciante/novo`, cada um explicando a diferença entre os dois fluxos **e deixando claro que fazer os dois cadastros de propósito é permitido**.
- **Aba "🚨 Alertas" no painel admin** (`doohplay.com.br/admin`) — lista os telefones duplicados lado a lado (dono ↔ anunciante), com botão "Marcar resolvido" (`PATCH /api/admin/duplicate-alerts/[id]`). KPIs e cores em âmbar/azul (não vermelho), texto explicando que não é necessariamente problema.
- **Deploy feito e validado em produção** (em aba anônima, depois de descobrir que era cache de navegador comum mostrando a versão antiga — mesmo padrão já visto com o dashboard do cliente nesta sessão).
- **Testado em produção, ponta a ponta, com simulação real (via SQL, já que o teste pelo formulário em si não foi feito):** anunciante de teste + dono de teste com mesmo telefone + alerta → apareceu certinho no admin, com nomes/códigos corretos. Botão "Marcar resolvido" testado e confirmado funcionando.
- **Incidente durante a validação (4ª ocorrência do mesmo padrão):** a rota `app/api/admin/duplicate-alerts/[id]/route.ts` nunca foi criada de fato no repositório, apesar de entregue — diferente das vezes anteriores (arquivo de substituição colado por engano no lugar errado), dessa vez foi um arquivo **novo** que passou batido inteiramente (nenhuma pasta/arquivo criado). Só foi descoberto pelo 404 no Network do DevTools ao clicar em "Marcar resolvido". **Padrão a reforçar:** ao entregar arquivo NOVO (não substituição), deixar ainda mais explícito que precisa criar a pasta com colchetes literais (`[id]`), e considerar pedir confirmação específica de que esse tipo de arquivo (novo, caminho com colchetes) foi criado, não só "colado".
- Dados de teste (`TESTEDUP11`, `TESTEDUP12`, alerta) limpos do banco depois da validação.

### Investigação do C0117.MP4 + validação de resolução/bitrate no upload — ✅ IMPLEMENTADO (20/06/2026, parte 6)
**Causa raiz confirmada:** o `C0117.MP4` é um vídeo de **3840x2160 (4K) a ~97 Mbps**, 4 segundos, claramente a filmagem crua de uma câmera sem nenhuma compressão. Nenhuma Android TV doméstica decodifica isso em tempo real — daí o travamento específico nesse vídeo. Confirmado: toca normal no Chrome desktop (decodificador de PC aguenta), travava só na TV.

**Por que isso passou:** o upload (tanto do dono quanto do anunciante) só validava tamanho total do arquivo, nunca resolução ou bitrate. Um vídeo de 4K bruto e poucos segundos pode ter tamanho de arquivo pequeno (passa fácil no limite de 100MB) e ainda assim ser impossível de decodificar.

**O que foi construído:**
- `lib/mp4-probe.ts` (novo) — leitor mínimo do formato MP4 (ISO Base Media File Format) escrito do zero, sem `ffmpeg` nem dependências externas (incerto se ffmpeg está disponível no Render). Lê `moov > mvhd` (duração) e `moov > trak > tkhd` (resolução) diretamente dos bytes do arquivo. Cobre apenas a versão 0 (32 bits) das boxes — o caso comum — e retorna `null` (não bloqueia) em qualquer formato que não consiga interpretar, pra nunca travar um upload legítimo por engano. **Não cobre WebM** (container diferente, EBML/Matroska) — vídeos WebM passam sem essa checagem.
- Validado com um MP4 sintético gerado em Node com as mesmas dimensões do vídeo real (3840x2160, 4s) — o parser leu certinho.
- `app/api/studio/upload/route.ts` (upload do dono) — rejeita vídeo com lado maior > 1920px OU bitrate médio > 15 Mbps, com mensagem explicando o problema detectado e pedindo recompressão pra 1080p/~8 Mbps.
- `app/api/advertiser/[code]/media/route.ts` (upload do anunciante — **rota por onde o C0117.MP4 passou de verdade**, e que antes não tinha NENHUMA validação de tamanho ou tipo robusta) — mesma checagem, retornando também um array `rejected` com nome do arquivo e motivo, em vez de simplesmente descartar em silêncio como fazia antes.
- Corrigido de brinde um erro de tipo pré-existente nessa mesma rota (`file.name.split(".").pop()` podia ser `undefined`).

**Pendência:** o `C0117.MP4` em si continua desativado (`playlist_schedule.active = false`) e não foi recomprimido — não temos como baixar/reprocessar arquivos de dentro desta sessão (sem acesso de rede ao R2). Se o usuário reenviar uma versão recomprimida pelo dashboard, a validação nova já vai aceitar ou rejeitar corretamente.

### 🔴 Bug crítico pré-existente encontrado e corrigido nesta sessão: `/anunciante/novo` sempre redirecionava pra login
Ao validar o aviso de cadastro duplicado, descobrimos que `middleware.ts` protegia qualquer rota `/anunciante/:path*` — incluindo `/anunciante/novo`, que é a página **pública** de cadastro de novos anunciantes (sem sessão nenhuma, é quem está se cadastrando!). O matcher tratava `novo` como se fosse um código de anunciante, nunca batia com nenhuma sessão real, e redirecionava sempre pra `/login?error=unauthorized`.
- **Isso é pré-existente — não foi algo que quebrou nesta sessão**, mas só foi descoberto agora porque foi a primeira vez que alguém testou esse link de ponta a ponta.
- **Implicação grave:** provavelmente **nenhum anunciante novo conseguia se cadastrar** por essa URL antes desta correção — o que também é consistente com o Gilson ter se cadastrado como anunciante de algum jeito não-padrão (talvez via link direto pro código depois de já ter sessão de outra aba, ou via alguma outra rota; não investigado a fundo).
- **Resolvido** em `middleware.ts`: adicionada exceção explícita pra `pathname !== "/anunciante/novo"` antes de aplicar a checagem de sessão.
- **Validado em produção:** `doohplay.com.br/anunciante/novo` agora carrega normalmente, com o aviso de cadastro duplicado aparecendo.
- **Vale revisar se existe o mesmo problema em `/dashboard/local/...` ou outras rotas públicas semelhantes** — não foi checado nesta sessão, mas o padrão do bug (matcher genérico demais capturando uma sub-rota pública) pode se repetir em outro lugar.

### Produto core
- APK Android universal, player web, polling automático (2 min), renderização sob demanda (slots A/B)
- Dashboard do cliente completo com abas: Dashboard, Minha TV, Conteúdo, Anúncios (⚠️ mockada, ver abaixo), Ganhos, Relatórios, Playlist, Clube de Telas, Meus Clientes, Configurações
- Upload de mídia com validação (10MB/100MB), limite por plano (Starter 10, Pro 25, Business ilimitado)
- Exclusão self-service, programação avançada de playlist, trial de 7 dias, crons mensais

### ⚠️ Descoberta importante desta sessão: aba "Anúncios" é 100% mockada
Ao investigar a estrutura para implementar a divisão de slots, descobriu-se que `TabAnuncios` no dashboard usa um array hardcoded (`Bradesco`, `iFood`, `Natura` com views/valores fictícios) — **não existe fluxo real de venda ou inserção de anúncio de terceiro implementado**. O upload do dono e qualquer "anúncio" futuro caem na mesma tabela `CampaignMedia`/`Campaign` (campanha sombra `"Promoções da Loja"` por cliente). A nova coluna `content_source` resolve a categorização no banco, mas **a venda/inserção de anúncio real ainda precisa ser construída do zero** (hoje seria só via SQL manual, marcando `content_source = 'anunciante'`).

### Clube de Telas do Bairro
Schema + geocodificação + motor de sugestão/aceite de parceria implementados e testados (sessão anterior). **Distribuição de mídia entre parceiros (a parte que efetivamente faz a "troca" funcionar) não tem rota nem UI** — descoberto nesta sessão, não documentado antes. Tabelas `network_media`/`network_media_distribution` existem vazias.

### QR Code de Captura de Clientes + CRM
Schema `client_leads`, QR fixo no player, página de captura LGPD, aba "Meus Clientes" no dashboard. Testado ponta a ponta com o Gilson.

### Comercial, admin e financeiro
(sem alterações — auto-cadastro, landing, materiais de venda, pitch mobile, CRM, guias, admin completo, webhook Asaas, bloqueio por inadimplência, trust score)

---

## BUGS RESOLVIDOS (histórico mantido — ver versão anterior do documento para detalhes completos de 19-20/06 parte 1)

### 20/06/2026 — parte 3 (pós-deploy da divisão de slots)
9. **Player travava no ícone de play nativo do WebView e saía do app** — reportado pelo usuário com fotos: a tela ficava presa mostrando o ícone de play (círculo+triângulo) por tempo indefinido, até a TV matar o app e voltar pro launcher Android. **Esse bug acabou sendo uma cadeia de 4 causas diferentes, descobertas e corrigidas em sequência nesta sessão:**

   **Causa 1 — dados corrompidos (não era bug de código):** as 14 mídias reais do Zimermam (incluindo o vídeo problemático `C0117.MP4`) estavam vinculadas à campanha errada no banco. O Gilson tinha se cadastrado em algum momento como **anunciante** (fluxo separado, `/api/advertiser/register`, gera códigos `ADV` + nome + número) e feito todo o upload pelo portal `/anunciante/ADVBARB921` em vez do dashboard `/dashboard/local/BARBE332`. Isso deixava a campanha real do BARBE332 com **zero mídias**, e a aba "Conteúdo" do dashboard aparecia vazia mesmo com 14 arquivos existindo (e batendo o limite de 10 do plano Starter sem nada visível pra excluir). **Resolvido** com `UPDATE "CampaignMedia" SET "campaignId" = <id da campanha certa> WHERE "campaignId" = <id da campanha errada>`. **Isso pode se repetir com outros clientes** — vale considerar uma validação ou aviso mais claro na hora do cadastro de anunciante vs. dono de tela, já que os dois portais existem e não é óbvio pra um usuário não-técnico qual usar.

   **Causa 2 — vídeo sem rede de segurança:** o player só avançava de slide de vídeo esperando `onended`. Se o vídeo nunca conseguia tocar (autoplay bloqueado, codec, erro), a tela ficava presa pra sempre. **Resolvido** com `el.play().catch()`, `el.onerror` e um timeout de segurança de 45s em `app/player/page.tsx` — mas isso por si só **não foi suficiente** pra resolver o travamento real (ver causa 3).

   **Causa 3 — a causa raiz de verdade: `<html>`/`<body>` duplicado causando erro de hydration do React (`Minified React error #418`).** `app/player/page.tsx` renderizava seu próprio `<html><head><body>`, mas o `app/layout.tsx` raiz do projeto **já renderiza `<html><body>` por fora**. Navegadores não permitem `<html>` aninhado de verdade (descartam a duplicata), criando uma divergência entre o que o React esperava montar e o DOM real — disparando erro de hydration repetidamente, consumindo o processo da página. Piorando isso: o próprio script inline do player mutava o DOM de `#slides`/`#player` (limpando e recriando via `initSlots()`) **antes** do React conseguir hidratar esse mesmo trecho que tinha acabado de renderizar via JSX — um segundo conflito de hydration, mesmo depois de remover o `<html>` duplicado. **Resolvido em 2 etapas:**
      - Removido o `<html>/<head>/<body>` de dentro de `player/page.tsx` (agora usa `<>...</>`, herdando do layout raiz; título/viewport via `export const metadata`)
      - Todo o conteúdo de `#player` (barra de progresso, heartbeat, QR, slides/tela padrão) passou a ser renderizado como uma única string via `dangerouslySetInnerHTML`, fazendo o React tratar esse trecho como opaco e nunca mais tentar comparar com o que o script muta depois.
      - **Esse é muito provavelmente o mesmo problema de fundo do bug histórico "sair do app no Fire Stick"**, documentado em sessões anteriores e nunca confirmado como resolvido — recuperação repetida de hydration mismatch é exatamente o tipo de coisa que sobrecarrega hardware fraco.
      - Confirmado no Console do navegador (F12): erro `#418` parou de aparecer depois da correção, e a troca de slides passou a respeitar os 15s configurados (antes disso, mesmo sem travar 100%, estava trocando mais devagar que o esperado).

   **Causa 4 — cache do WebView da TV não atualizava sozinho:** mesmo com o código corrigido e múltiplos deploys + reinícios da TV, o app continuou preso na versão antiga até o usuário limpar manualmente cache/dados do app nas configurações da TV + forçar parada. Reiniciar a TV (ligar/desligar) **não** limpa esse cache. **Isso não escala** — não dá pra pedir pra fazer isso manualmente em toda TV de todo cliente. **Resolvido** adicionando auto-reload periódico no próprio player: a cada 3 horas, a página navega pra própria URL com um cache-buster (`&_r=timestamp`), forçando uma busca real do HTML/JS, independente de qualquer camada de cache (WebView, CDN, Cloudflare) reter a versão antiga. Bônus: também zera acúmulo de memória do processo periodicamente.

   **Status real após todas as correções:** confirmado pelo usuário, pós-limpeza manual de cache (só essa vez, pra pegar o código novo imediatamente): TV trocando de imagem normalmente a cada ~15s, sem sair do app, **mas só observado por um período curto até o momento — ainda não validado por tempo prolongado** (múltiplos dias, ciclo completo de auto-reload de 3h, etc).

---

## DECISÕES ESTRATÉGICAS

### Divisão de slots na TV — ✅ IMPLEMENTADO (era "decidido, não implementado")
```
15% — Dono da tela (conteúdo próprio)
60% — Anunciantes pagos (receita principal)
15% — Rede local "Clube de Telas do Bairro"
10% — DOOHPLAY (conteúdo institucional/próprio)
```
Implementado como sorteio ponderado por categoria no player, com redistribuição automática de peso para categorias vazias. Funciona corretamente mesmo com só 1 de 4 categorias populada (caso atual do Zimermam — 100% dono).

**Como comunicar para o cliente (sem falar em %):**
> "Sua TV exibe suas promoções, recebe anunciantes que pagam por isso, e ainda coloca você em mais 30 telas do bairro — tudo por R$ 97/mês."

### Demais decisões (sem alterações — ver versão anterior)
- Ranking/Gamificação, Campanhas WhatsApp, IA de criação de conteúdo, Box pré-configurado, Programa de indicação — todos "decidido, não implementado"

---

## PLANOS REVISADOS

```
Starter  R$ 97/mês  — 1 TV, Clube de Telas, anunciantes, 10 mídias, dashboard básico
Pro      R$ 197/mês — + QR/CRM, 2 campanhas WhatsApp/mês (200 contatos), 25 mídias, ranking prioritário
Business R$ 397/mês — + até 3 TVs, 8 campanhas/mês (1000 contatos), mídias ilimitadas, IA de criação, suporte dedicado
```

---

## PENDÊNCIAS IMEDIATAS

### Produto
1. [ ] **Confirmar visualmente que o player do Zimermam está rodando normal após o deploy da divisão de slots** — prioridade imediata da próxima sessão, antes de qualquer coisa nova.
2. [ ] Validar por tempo prolongado se o bug do Fire Stick (saída do app) foi resolvido pela refatoração de slots A/B — ainda pendente desde a sessão anterior.
3. [ ] **Construir fluxo real de venda/inserção de anúncio de terceiro** — hoje é mock na UI e manual via SQL no banco. Sem isso, os 60% de "anunciante" nunca saem do papel.
4. [ ] **Construir rota + UI de distribuição de mídia do Clube de Telas** (`network_media`, `network_media_distribution`) — o pareamento de parceiros funciona, mas a troca de conteúdo em si não foi implementada ainda.
5. [ ] Produzir e inserir a primeira peça de conteúdo institucional da DOOHPLAY em `institutional_media` (hoje vazia, sem rota de admin — seria via SQL).
6. [ ] Confirmar geocodificação de mais clientes conforme cadastrados
7. [ ] Sistema de ranking e avaliações
8. [ ] IA de criação de conteúdo
9. [ ] Campanhas WhatsApp em massa (após migração para API oficial)
10. [ ] Relatório semanal automático via WhatsApp

### Comercial (urgente)
- [ ] Filmar vídeo da TV do Zimermam + depoimento do Gilson
- [ ] Cadastrar leads no CRM
- [ ] Instalar em mais 2-3 barbearias/estabelecimentos do bairro — ainda mais urgente agora: sem um segundo/terceiro cliente real, as categorias "anunciante" e "rede" não têm como ser testadas de ponta a ponta nem geram receita

### Infraestrutura
- [ ] Migrar WhatsApp para API oficial antes de campanhas em escala
- [ ] Comprar Android Boxes no atacado
- [ ] Adicionar autenticação adequada nas rotas `/api/admin/*` do Clube de Telas (hoje `ADMIN_SECRET` simples via query string)

---

## LINKS ÚTEIS

- Dashboard cliente: `doohplay.com.br/dashboard/local/BARBE332`
- Admin: `doohplay.com.br/admin`
- CRM: `doohplay.com.br/crm`
- Pitch mobile: `doohplay.com.br/pitch`
- Materiais de venda: `doohplay.com.br/materiais-venda`
- Landing donos: `doohplay.com.br/donos`
- Cadastro: `doohplay.com.br/cadastro`
- Guias: `doohplay.com.br/guia-instalacao`, `doohplay.com.br/guia-uso`
- Player TV: `doohplay.com.br/player?screen=BARBE332`
- APK download: `doohplay.com.br/instalar/BARBE332`
- Supabase SQL Editor: dashboard.supabase.com, projeto `mdlbajgnntjwhycouzit`

---

## INSTRUÇÕES PARA A IA NO NOVO CHAT

1. **O banco é Supabase, não Render.** SQL Editor do Supabase, não psql direto.
2. Sempre confirmar nomes exatos de tabelas/colunas consultando o banco diretamente — schema tem inconsistências e partes inteiras (trust score, distribuição de rede) não documentadas no código.
3. Nunca usar `pub-0ad4cd3201ce42198c5211fe201ff660.r2.dev` — sempre `media.doohplay.com.br`.
4. O repo `github.com/mediaconnection/doohplay-demo` é público — clonar via `git clone` para leitura, preferível a pedir colagem manual.
5. Antes de editar arquivos grandes do repo, clonar e ler o arquivo real primeiro.
6. **Ao entregar múltiplos arquivos na mesma resposta para colagem manual, esse já foi o ponto de maior risco de erro em sessões anteriores (aconteceu pelo menos 5 vezes até agora — a mais grave foi `dashboard-client.tsx` sendo sobrescrito com o conteúdo de `admin/page.tsx`, quebrando a página inteira do dashboard do cliente).** Entregar um arquivo por vez quando grande ou houver risco de confusão. **Atenção redobrada com arquivos NOVOS** (que precisam de pasta nova, especialmente com colchetes tipo `[id]`/`[code]`) e com **arquivos grandes parecidos entre si** (vários `.tsx` com funções `Tab...` dentro, fácil de confundir qual conteúdo pertence a qual arquivo). Depois de qualquer entrega assim, considerar pedir confirmação explícita por arquivo — inclusive comparando a primeira linha/comentário do arquivo (`// app/caminho/route.ts`) com o caminho esperado, não só um "pronto" genérico no final.
7. Antes de WhatsApp em escala, lembrar do risco de ban e necessidade de API oficial.
8. **Antes de qualquer DELETE em produção**, checar FK em todas as tabelas relacionadas primeiro (já houve um caso em que a checagem inicial perdeu uma tabela).
9. Gerar arquivos `.ts`/`.tsx` grandes com `create_file`/`str_replace`, evitando heredocs complexos.
10. **Validar com `tsc --noEmit -p tsconfig.json` antes de entregar qualquer arquivo `.ts`/`.tsx` editado** (com `npm install` e `PUPPETEER_SKIP_DOWNLOAD=true` se necessário).
11. Tom do usuário é direto e estratégico, pensa como CEO buscando alavancagem rápida — respostas objetivas, com números e justificativas claras.
12. **Pendência crítica do Fire Stick:** muito provavelmente era o mesmo bug de hydration mismatch (`#418`) corrigido nesta sessão (causa 3 do bug #9), já que recuperação repetida de hydration consome CPU/memória e é coerente com hardware fraco saindo do app. **Não confirmado oficialmente como a mesma causa raiz** — se o Fire Stick voltar a sair do app mesmo com esse fix em produção por tempo prolongado, é sinal de que existe AINDA um problema adicional específico daquele hardware.
13. **C0117.MP4 continua desativado na playlist do BARBE332** (`playlist_schedule.active = false`). **Causa já confirmada nesta sessão** (ver "Investigação do C0117.MP4" acima): vídeo 4K bruto a ~97 Mbps, incompatível com decodificador de TV doméstica. Falta só recomprimir o arquivo (pra 1080p/~8 Mbps) e reenviar pelo dashboard — a validação nova já vai aceitar a versão recomprimida automaticamente.
14. **Status real após a sessão de hoje:** todas as 4 causas do bug de travamento foram corrigidas (dados corrompidos, vídeo sem fallback, hydration mismatch, cache de WebView não atualizando). Confirmado funcionando por um período curto após limpeza manual de cache. **Ainda falta validação por tempo prolongado** (dias, não minutos) e validar que o auto-reload de 3h em produção não introduz nenhum efeito colateral (ex: interromper um vídeo no meio, perder o registro de heartbeat por um instante, etc — não testado ainda).
15. **Cadastros duplicados dono/anunciante:** já tratado nesta sessão (aviso visual + alerta automático em `duplicate_signup_alerts`, ver seção de features acima). Falta só validar com um cadastro real duplicado de verdade, e considerar construir uma aba de admin pra ver os alertas se isso virar rotina.
16. As categorias "anunciante" e "rede" da divisão de slots agora TÊM um caminho real e testado pra receber dados (ver "Anúncio real de terceiro (MVP)" acima), mas hoje, em produção, continuam vazias pro BARBE332 (o teste foi limpo do banco depois de validado). Vale considerar vender e cadastrar a primeira campanha real de verdade como próximo passo, já que a engenharia está pronta.
17. **Revisar se o mesmo padrão de bug do middleware (matcher genérico capturando sub-rota pública) existe em outro lugar** — auditado nesta sessão: `/dashboard/local/...` e `/agencia/...` **não têm** o mesmo problema hoje (nenhum dos dois tem uma sub-rota pública tipo "novo" no mesmo caminho). Adicionado comentário de alerta no topo do `middleware.ts` pra qualquer página pública nova criada futuramente sob esses prefixos não cair na mesma armadilha sem querer.
18. **A distribuição de mídia do Clube de Telas está implementada e validada (ver seção acima), mas hoje, em produção, está vazia/zerada** — os dados de teste (`BARBE332`↔`TESTE719`) foram limpos depois da validação. Falta um 2º cliente real geocodificado pra essa engenharia gerar valor de verdade.
19. **🔴 Investigar a causa da perda de dados em `"CampaignMedia"`** (ver incidente #3 da seção "Distribuição de mídia do Clube de Telas") — a tabela ficou zerada sem nenhum comando explícito desta sessão ter causado isso. Foi recuperada a partir dos arquivos reais no R2, mas a causa raiz nunca foi encontrada. Se acontecer de novo, a mesma técnica de recuperação funciona: `GET /api/studio/upload?code=CODIGO` lista os arquivos reais do bucket, independente do banco.
20. **Confirmar se `R2_PUBLIC_URL` está correta em todos os ambientes/serviços** (foi corrigida no serviço `doohplay-demo` nesta sessão, mas só foi notada porque uma rota nova passou a depender dela — outras rotas que dependam dessa variável também devem se beneficiar da correção, mas vale uma checagem geral).
