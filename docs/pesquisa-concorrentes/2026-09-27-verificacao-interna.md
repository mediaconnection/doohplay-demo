# Verificação interna da matriz competitiva de 27/09/2026

Complemento de [`2026-09-27-matriz-competitiva.md`](2026-09-27-matriz-competitiva.md) (pesquisa de mesa do fundador, mantida como o fundador entregou).

> **04/10/2026 — matriz revisada pelo fundador.** A versão guardada agora é a revisada (a de 27/09 fica no histórico do git). Ela **já incorpora** as correções abaixo (multi-zona 🟡, widgets, "onde não exibir" como empate) e acrescenta Avisos 🔴 nas TVs e um bloco "Atualização de 04/10". Duas linhas da versão revisada ainda estão desatualizadas:
> - **Alerta de tela offline** ("o job não conseguiu se agendar por causa do Upstash"): desde o boot de 04/10 19:21 UTC o job **se agenda e roda**. Não envia nada porque o serviço `doohplay-workers` não tem as variáveis `EVOLUTION_*`, e o BARBE332 nunca foi monitorado (`studio_clients.player_id` nulo).
> - **Biblioteca curada** 🟡: o Canal DOOHPLAY tem 17 itens ativos, **todos de 18 a 20/07/2026** — sem conteúdo novo há ~2,5 meses, o que pesa contra "playlists prontas atualizadas" do SigX.
>
> E uma nuance no bloco "Atualização de 04/10": a falha **atual** da ancoragem não é o Redis (é `unique_merkle_root` no banco); o bloqueio do Upstash até 16/09 pode ter contribuído para o atraso anterior.

**O que foi verificado:** só as afirmações sobre o **DOOHPLAY**, contra o código (`dashboard-web-prod`, `master` em `3ad9535`), o banco de produção e o `STATUS_PROJETO.md`. Os dados dos concorrentes (preços, funcionalidades) são pesquisa externa e **não foram reconferidos** aqui.

## Correções (a matriz subestima ou superestima o DOOHPLAY)

| Linha da matriz | A matriz diz | O que o código/registro mostra | Veredito sugerido |
|---|---|---|---|
| **Multi-zona / layouts** | "Não tem" · 🔴 | **Tem no player**, configurado só pelo admin: layout genérico de N zonas simultâneas (`layout_templates` + `screen_templates`, Fase 4), painel de widgets lateral ou inferior (template "magazine"), formatos de anúncio encolhe-lateral / faixa inferior / flutuante (Fase 33), slide com zonas dentro da rotação (Fase 9). Aplicação em lote por grupo de telas (`/api/admin/fleet/bulk-layout`). **Falta:** editor self-service no dashboard do cliente e linha do tempo por zona (o que o SigX tem). | 🟡 (tem o motor; perde no editor para o cliente) |
| **Widgets prontos** | "Alguns; não comparei em detalhe" | 11 tipos no player (`renderWidgetHtml`): relógio, clima, relógio+clima, bolsa, notícias, notícias de economia, câmbio, indicadores econômicos, qualidade do ar, loteria, enquete ao vivo via QR — mais ticker de notícias corrido e "painel completo" revezando. Configurados pelo admin, não pelo cliente. | 🔴 em amplitude continua razoável (SigX/Yodeck têm catálogos maiores), mas o "alguns" subestima |
| **Segmentação por ramo / "onde não exibir"** | "Lista de tipos de negócio unificada" · 🟡 | Além da lista, o dono **já controla onde não exibir**: desliga categorias de anúncio sensíveis (`excluded_ad_tags`, ex. bebida alcoólica), desliga canais gerais do Canal DOOHPLAY (`excluded_general_channels`), e o sistema **bloqueia sempre anúncio de concorrente direto** (segmento do anunciante = ramo do dono), sem opção de desligar. | 🟡 → empate real com o SigX nesse ponto |

## Confirmações (a matriz está certa)

| Linha | Confirmação |
|---|---|
| **Preços R$97 a R$620** | `PLANS` em `lib/asaas.ts`: Starter R$97 (1 tela), Pro R$290 (3 telas, R$96,67/tela), Business R$620 (5 telas, R$124/tela); tela extra R$150/mês. **Por tela: R$97 a R$150.** A leitura "mais caro por tela" se mantém (SigX R$29,90 ≈ 31% do Starter). |
| **Agendamento por dia/hora ignorado** | Confirmado em 27/09 (pendência no STATUS): vale para o conteúdo **do dono**; o institucional/Canal DOOHPLAY respeita data/hora/dia. |
| **Avisos rápidos em texto** | No ar desde 27/09 (`ab8e8de`), testado em produção. Limites da v1 que pesam na comparação: 2 modelos, sem imagem, **sem escolha de tela específica** (o player não identifica a tela física), 1 aviso a cada 4 conteúdos. |
| **Escala: 2 clientes, 2 telas** | Coerente com o registro (BARBE332, LEMEL186). A TV do BARBE332 está offline desde 17/09 (`players.last_ping`). |

## Afirmações que o registro interno não sustenta (confirmar a fonte)

| Linha | A matriz diz | O que está registrado |
|---|---|---|
| **Causa da ancoragem parada** | "causa: conta Upstash suspensa" | O STATUS registra ~40 mil eventos sem bloco e último evento ancorado em 26/08 (medição de 15/09), mas **a causa está em aberto**: a própria entrada pede investigar se o circuit-breaker do Upstash (03/09) e o backlog de 27/08 resolveram a causa raiz. Nada liga a ancoragem ao Upstash de forma confirmada. |
| **Upstash "suspensa"** | Conta suspensa | O registro (13/09) fala em **"temporarily rate-limited"**, com ticket aberto no suporte da Upstash aguardando resposta. "Suspensa" pode ser informação nova (ex. resposta do suporte) que não chegou ao STATUS. Se for, precisa ser registrada lá, porque muda a decisão de custo pendente. |
| **Alerta de tela offline "inativo"** | Mesma causa do Upstash | Correto no efeito: o job não conseguiu se agendar no boot do worker por causa do rate-limit (13/09). Mas é o mesmo ponto em aberto acima. |

**Atualização 28/09:** o fundador confirmou a suspensão e a reativação da conta Upstash (Audit Log), o que agora sustenta "suspensa" no passado. Mas a reativação não normalizou o worker (timeouts contínuos no Redis) e a relação com a ancoragem segue hipótese. Detalhes em `STATUS_PROJETO.md`, seção do Upstash.

Nenhum número do banco foi reconsultado para a ancoragem nesta verificação (tabelas do front de prova, fora do escopo desta sessão). Os 40 mil são da medição de 15/09.

## Efeito nas recomendações da seção 4 da matriz

- **"Paridade mínima: multi-zona"** fica menor do que parece: o trabalho não é construir multi-zona, é **expor ao cliente** o que o admin já configura (editor simples no dashboard).
- **"Confiabilidade operacional"** e **"Prova verificável"** dependem da mesma pendência (Upstash/ancoragem). A matriz trata como uma causa só; o registro ainda não confirma isso. Resolver o diagnóstico vem antes de priorizar as duas frentes.
- O restante (preço, escala, suporte, relatório com marca do cliente) não foi afetado pela verificação.

## Conflito com registro anterior

A fila de Design/Produto do `STATUS_PROJETO.md` (13/09, item 2) diz que zoneamento é "diferencial real do concorrente, sem equivalente hoje no DOOHPLAY". Pelo código, isso já não era exato em 13/09 (layout genérico é da Fase 4). Nota de correção acrescentada lá.
