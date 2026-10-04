# Verificação interna da análise consolidada do SigX (04/10/2026)

Complemento de [`analise-sigx-consolidada.md`](analise-sigx-consolidada.md) (análise do fundador a partir de prints do SigX, mantida sem alteração).

**O que foi verificado:** só as colunas "Status" sobre o **DOOHPLAY**, em especial os itens marcados ❓, contra código (`dashboard-web-prod`, `master`), banco de produção e logs. O que o SigX faz não foi reconferido.

## Status que mudam

| Item da análise | Status na análise | O que foi verificado | Status sugerido |
|---|---|---|---|
| §1 Alerta de tela offline | 🟡 implementado, bloqueado pelo Upstash | O job **se agenda e roda** (boot de 04/10 19:21 UTC). Não envia nada porque o serviço `doohplay-workers` **não tem as variáveis `EVOLUTION_*`**, e **nunca monitorou o BARBE332** (`studio_clients.player_id` nulo). | 🟡 bloqueado por configuração do worker e vínculo de player, não pelo Upstash |
| §1 Aviso de "início automático" (permissão de sobreposição) | 🔵 investigar | As TVs rodam o **app nativo `doohplay-player-native` (APK 0.7.4)**. Ele **não pede** a permissão de sobreposição nem isenção de bateria, tem `WatchdogService` e receptor de boot, e registra a mensagem "Failed to restart (foreground launch restriction)". **Não detecta nem reporta** o estado da permissão. Código-fonte fora deste repositório. | 🔵 confirmado como lacuna; exige mudança no app nativo |
| §1 Ficha do dispositivo | ❓ o que o player reporta | Na ativação: identificador do aparelho, modelo (`Amlogic T600`/`V96`), plataforma (`Android TV`), resolução. No sinal de vida: só código da tela e id do player. **Não reporta** versão do app, codec, origem da instalação. Localização: só 1 player com coordenadas. A versão do Android aparece só no cabeçalho HTTP (`Android 10.0`), não é guardada. | ❓ → parcial; versão do app e permissões exigem o app nativo |
| §2 Avisos rápidos | ✅ implementado e no ar | No ar **só no player web** (`/player`). O app nativo das TVs **ignora** o campo `notices`: **os avisos não aparecem nas TVs dos clientes**. Também não há escolha de telas (todo aviso vale para todas as telas do cliente). | 🟡 feito no player web; falta no app nativo |
| §2 Playlist de inadimplência | 🔵 não investigado | Já existe uma regra **abrupta**: com 10+ dias de atraso, o webhook da Asaas desliga o cliente (`studio_clients.active = false`) e manda WhatsApp "TV suspensa". Não há tela de inatividade. **O LEMEL186 não tem assinatura em `financial_subscriptions`** (só o BARBE332, Starter, ativa) — o "caso real do LEMEL186" citado não aparece no banco. | 🔵 candidato; confirmar a situação de cobrança do LEMEL186 |
| §2 Vigência do conteúdo | ❓ campos existem, não aplicados | Confirmado: vale para o conteúdo do **dono** (nem a API nem o player filtram). O conteúdo institucional/Canal respeita data, horário e dia. | ❓ → confirmado como bug |
| §2 Tags e busca | ❓ | Há `content_tags` só em mídia de anunciante (brand-safety). Conteúdo do dono não tem etiquetas; a aba Conteúdo não tem busca (decisão do redesenho: poucos itens). | ⚪ hoje |
| §2 Conteúdo dinâmico | ❓ comparar | 11 tipos de widget no player web: relógio, clima, relógio+clima, bolsa, notícias, notícias de economia, câmbio, indicadores (Selic/CDI/IPCA), qualidade do ar, **loteria (só Mega-Sena)**, enquete por QR; mais ticker. Clima em 1 layout. Sem UV e sem commodities. Configuração só pelo admin. **No app nativo, não verificado.** | ❓ → menor amplitude que o SigX |
| §2 Biblioteca curada | ❓ profundidade e frequência | Canal DOOHPLAY: **17 itens ativos** (19 no total), **todos criados entre 18 e 20/07/2026**. Sem conteúdo novo há ~2,5 meses. | 🔵 frequência de atualização é o gap |
| §4 "Onde não exibir" | 🔵 | Já existe do lado do dono: desligar categorias de anúncio (`excluded_ad_tags`), desligar canais gerais (`excluded_general_channels`) e bloqueio fixo de anúncio de concorrente direto. Falta do lado da campanha (anunciante escolher onde não exibir). | 🟡 parcial |
| §4 Segmentação por ramo | ✅ base existe | Confirmado: `lib/businessTypes.ts`. | ✅ |
| §4 Prova criptográfica | ✅ diferencial | O diferencial existe no desenho, mas **hoje está quebrado na prática**: ancoragem parada (falha em `unique_merkle_root` antes da Polygon; Polygon falhando desde 27/08; assinatura RSA com erro) e o **BARBE332 não grava eventos em `event_chain` desde 17/09**. | ✅ no desenho; 🔴 em operação |
| §6 Cliente envia mídia e operador aprova | ❓ existe? | Existe: aprovação no `/admin` com WhatsApp ao cliente. **Mas o item entra no ar antes da aprovação** (fica ativo e a playlist não filtra status), a aba Conteúdo mostra "No ar" e a **rota de envio não exige login**. | 🔴 existe, mas não protege |
| §6 "Suas telas" com situação e último sinal | ✅ | O painel só mostra a TV quando `studio_clients.player_id` está preenchido — **no BARBE332 está vazio**, então o painel dele não mostra a TV real. | 🟡 depende do vínculo do player |

## Efeito na prioridade sugerida

1. **"Detecção de início automático"** depende do **app nativo**, cujo código-fonte não está aqui. Antes, é preciso localizar o código e o responsável (frente Android).
2. **Inadimplência**: a regra abrupta já existe; o trabalho é trocar o corte por uma tela de aviso. Confirmar antes a situação real de cobrança do LEMEL186.
3. Nenhum item novo da lista é mais urgente que dois achados desta verificação: **envio sem login com publicação imediata** e **avisos que não chegam às TVs**.
