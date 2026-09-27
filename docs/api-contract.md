# DOOHPLAY - Contrato de API

Este arquivo e a fonte unica de verdade para contratos tecnicos consumidos pelo player web e pelo app Android nativo. O backend web e o `CLAUDE.md` do projeto Android devem referenciar este arquivo, nao manter copias proprias da documentacao.

Se um contrato mudar, atualizar este arquivo primeiro e so entao propagar a mudanca para as frentes web/backend e Android.

Motivo de existir: o incidente de 25/06/2026, com categorias erradas e vazamento entre clientes na playlist, aconteceu porque a frente Android e a frente web tinham copias separadas da documentacao da API. Isso facilitou divergencia silenciosa.

## `GET /api/client/playlist/{code}`

**Quem implementa:** backend web (`app/api/client/playlist/[code]/route.ts`)

**Quem consome:** player web, app Android nativo

### Request

- `code` (path param): codigo do cliente, ex: `BARBE332`. Case-insensitive.

### Response (200)

```json
{
  "ok": true,
  "name": "Barbearia Zimermam",
  "items": [
    {
      "id": "uuid-ou-text",
      "name": "video_123.mp4",
      "type": "video",
      "asset_url": "https://media.doohplay.com.br/studio/CODIGO/arquivo.mp4",
      "status": "approved",
      "slot_category": "dono",
      "duration": 15,
      "active": true,
      "created_at": "2026-06-23T02:42:57.370Z",
      "position": 1,
      "days_of_week": null,
      "start_time": null,
      "end_time": null,
      "start_date": null,
      "end_date": null
    }
  ],
  "slides": [ "...mesmo array de items, alias por compatibilidade..." ],
  "playlist": [ "...mesmo array de items, alias por compatibilidade..." ],
  "generated_at": "2026-06-25T21:06:07.434Z"
}
```

### Regras de negocio obrigatorias

1. **Isolamento por tela:** a resposta nunca deve incluir conteudo de campanha de outro cliente. Toda query de origem de midia deve filtrar explicitamente pelo `code` da tela solicitante.
2. **`slot_category`** e sempre um destes 5 valores: `"dono"`, `"anunciante"`, `"rede"`, `"institucional"`, `"canal"`. Nunca hardcoded em um valor fixo. Vem de `CampaignMedia.content_source` (com `"exemplo"` mapeado para `"dono"`), `"rede"` fixo para midia do Clube de Telas, `"anunciante"` para anuncio real de terceiro via `CampaignScreen`. Midia institucional vira `"canal"` quando tem segmento (`placements_v2.segment_id`) que bate com o `business_type` do cliente (Canal DOOHPLAY, 12/07/2026, commit `b560108`), e `"institucional"` quando nao tem segmento.
3. Filtrar sempre: `active !== false` e `status !== "rejected"`.

### Sorteio ponderado

Esta logica e do cliente, nao do servidor. Hoje esta duplicada no player web (`app/player/page.tsx`) e no app Android nativo (Kotlin).

- Pesos fixos: `dono: 15`, `anunciante: 60`, `rede: 5`, `institucional: 5`, `canal: 15` (fonte: `CATEGORY_WEIGHTS` em `app/player/page.tsx`).
- Historico: o contrato original (26/06/2026, commit `508968a`) registrava `rede: 15`, `institucional: 10`, que batia com o codigo daquela data. O codigo mudou de proposito em 12/07/2026 (`b560108`, Canal DOOHPLAY: `rede 0`, `institucional 5`, `canal 20`) e em 08/09/2026 (`2ada8ed`, Clube de Telas v2: `rede 5`, `canal 15`), ambas mudancas documentadas nos commits, mas este arquivo nao foi atualizado na epoca. Corrigido em 27/09/2026 para refletir o codigo, que e a fonte correta.
- Sortear categoria proporcional ao peso, considerando so categorias com pelo menos 1 item disponivel. O peso das categorias vazias e redistribuido automaticamente.
- Dentro da categoria sorteada, percorrer itens em round-robin, com um cursor por categoria.

Nota de risco conhecido: essa duplicacao pode divergir no futuro. Considerar mover a decisao de sequencia para o backend como melhoria futura, fazendo o servidor retornar a sequencia ja calculada.

## `POST /api/player/heartbeat`

**Quem implementa:** backend web (`app/api/player/heartbeat/route.ts`)

**Quem consome:** player web, app Android nativo

### Request

```json
{ "code": "BARBE332" }
```

Campo preferido: `code`.

O player web historicamente tambem aceita `screen_code` como alias. Manter compatibilidade, mas `code` e o nome preferido para clientes novos.

### Response (200)

```json
{ "ok": true, "ts": "2026-06-26T20:45:25.000Z" }
```

Ou, se o `code` nao corresponder a um `player_id` valido:

```json
{ "ok": false, "warning": "player_id nao encontrado ou invalido para este codigo" }
```

## `POST /api/player/event`

Proof-of-play.

**Quem implementa:** backend web (`app/api/player/event/route.ts`)

**Quem consome:** player web, app Android nativo

### Request

```json
{
  "media_id": "uuid-da-midia",
  "screen_code": "BARBE332",
  "played_at": "2026-06-23T10:00:00.000Z",
  "asset_url": "https://...",
  "duration": 15
}
```

Campo correto: `screen_code`, nao `code`.

Esta inconsistencia com o heartbeat e conhecida e mantida por compatibilidade retroativa. Nao "corrigir" sem avaliar todos os consumidores existentes.

## `GET/POST /api/admin/feature-flags` (NOVO, Fase 45, 16/08/2026)

**Quem implementa:** backend web (`app/api/admin/feature-flags/route.ts`)

**Quem consome:** admin, player web (le via campo `dtv_ready` na playlist, ver abaixo), app Android nativo (idem)

Tabela generica `feature_flags` (`client_code` + `flag_key` unico) — nao criar coluna nova em `screen_templates` a cada feature flag futura. `flag_key` e uma allowlist controlada no backend, mesmo padrao ja usado em `widget_layout_mode`/`widget_position`. Primeira chave usada: `dtv_ready`.

### Request (POST)

```json
{ "client_code": "BARBE332", "flag_key": "dtv_ready", "enabled": true }
```

### Response (200)

```json
{ "ok": true, "client_code": "BARBE332", "flag_key": "dtv_ready", "enabled": true }
```

### Campo novo em `GET /api/client/playlist/{code}` (aditivo)

```json
{
  "...campos existentes inalterados...": "",
  "dtv_ready": false
}
```

`dtv_ready` e sempre `false` por padrao. Ausencia da flag NUNCA muda comportamento existente do player — mesmo padrao "zero mudanca pra quem nao configurou" usado no resto do contrato. Quando `true`, o player web sinaliza preferencia por codec VVC (infraestrutura de intencao — o pipeline de midia ainda nao gera/seleciona variante por codec) e mostra o selo comercial "Preparando para TV 3.0" (renomeado de "TV 3.0 Ready" em 15/09/2026, ver docs/tv-3-0-ready-textos-comerciais.md); e uma flag de compatibilidade/declaracao do instalador, nao deteccao automatica de hardware (nao existe API de browser para consultar dispositivos HDMI-CEC a jusante) nem promessa de recepcao de transmissao aberta de TV 3.0.

## Avisos (NOVO, Fase 46, 27/09/2026)

Recados curtos em texto que o dono cria no dashboard (aba "Avisos") e que o player intercala com a playlist. Regras e limites em `lib/notices.ts`; tabela `client_notices` (`sql/phase46_step1_client_notices.sql`).

### Campo novo em `GET /api/client/playlist/{code}` (aditivo)

```json
{
  "...campos existentes inalterados...": "",
  "notices": [
    {
      "id": "uuid",
      "title": "Fechado no feriado",
      "message": "Na segunda (12/10) nao abriremos. Voltamos na terca as 9h.",
      "template": "cartao",
      "icon": "aviso"
    }
  ]
}
```

- Traz so avisos **no ar agora**: `active = true`, `starts_at` nulo ou ja passado, `ends_at` nulo ou ainda no futuro. Filtro feito no servidor; o player nao precisa checar data.
- `template` e sempre `"cartao"` ou `"faixa"`. `icon` e `null` ou um de `"aviso"`, `"info"`, `"relogio"`, `"coracao"`.
- `title` ate 60 caracteres, `message` ate 200. Texto livre digitado pelo dono: **quem renderiza precisa escapar HTML**.
- Aviso **nao** vem dentro de `items`/`slides`/`playlist` de proposito: o app Firestick baixa cada item de `items` para cache esperando `asset_url`, e aviso nao tem arquivo. Cliente que nao conhece `notices` simplesmente ignora o campo — zero mudanca de comportamento.
- Sem tabela (migracao nao aplicada) ou erro de leitura: `notices` vem `[]` e o resto da playlist segue normal.
- Vale para todas as telas do cliente. Nao existe aviso por tela especifica: o player web hoje nao identifica qual tela fisica esta exibindo a pagina.

### Regra de exibicao (player web)

- **Fora do sorteio ponderado.** Os pesos de categoria acima nao mudam. A cada 4 conteudos mostrados na rotacao de tela cheia, o proximo vira um aviso (rodizio entre os avisos no ar), por 8 segundos. O tempo do aviso sai proporcionalmente de todas as categorias (decisao de produto de 27/09/2026).
- Nunca corta uma sequencia (`sequence_group`) do Canal DOOHPLAY no meio. Tela sem nenhum conteudo nao mostra aviso sozinho.
- So na rotacao de tela cheia: zonas de layout generico, lateral, faixa inferior e flutuante nao mostram aviso.
- **Nao gera proof-of-play** (`/api/player/play-log`) **nem evento de exibicao** (`/api/player/event`) — aviso nao e midia nem anuncio e nao entra na prova de veiculacao.

### Rotas do dashboard (sessao do cliente obrigatoria)

- `GET /api/client/notices/{code}` → `{ notices: [...] }` com todos os avisos (inclusive pausados/agendados/encerrados), com `status` calculado (`no_ar` / `agendado` / `pausado` / `encerrado`).
- `POST /api/client/notices/{code}` com `{ title, message, template, icon, starts_at, ends_at }` → cria. Datas em `"YYYY-MM-DDTHH:mm"`, horario de Brasilia, opcionais. Limite de 20 avisos por cliente.
- `PATCH /api/client/notices/{code}/{id}` com `{ active }` (pausar/retomar) ou com o corpo completo (editar).
- `DELETE /api/client/notices/{code}/{id}`.

## Governanca

1. Qualquer mudanca de contrato precisa ser refletida aqui antes de qualquer codigo.
2. Mudancas que afetam o app Android precisam ser comunicadas explicitamente. Nao assumir que a frente Android vai notar sozinha.
3. Este arquivo nao substitui o Script de Continuidade nem os arquivos `CLAUDE.md`. Ele e especificamente o contrato tecnico de API, enxuto e estavel. Contexto de produto, estrategia e incidentes continua nos outros documentos.
