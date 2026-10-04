# Atualização da análise de Design & UX (04/10/2026)

Complemento de [`2026-09-10-analise-design-ux.md`](2026-09-10-analise-design-ux.md) (mantida sem alteração). Conferido contra o código (`dashboard-web-prod`, `master`), o histórico do git e o banco.

## Continua valendo
- `lib/theme.ts` com os 5 temas (`slateDark`, `lightDefault`, `marketingDark`, `previewDark`, `deviceDark`) e `FONT_FAMILY` (Inter carregada de verdade). Sem mudança desde 10/09.
- `/dashboard/executive` removida (`03fe71e`, 09/09).
- `app/admin/metrics` sem reskin (nenhum commit desde maio).
- `app/anunciante` sem trabalho de design (o único commit desde 10/09 foi o ajuste de linguagem do TV 3.0).
- Os 5 padrões da seção 3 (nunca dado fabricado, estado vazio honesto, mostrar o que já existe, não fingir feature, consistência de token).

## Mudou desde 10/09

| Área (seção 2) | Em 10/09 | Em 04/10 |
|---|---|---|
| `app/player/page.tsx` | "Intocado por segurança… roda ao vivo nas telas físicas de BARBE332/LEMEL186" | **Premissa errada.** As TVs dos clientes rodam o **app Android nativo `doohplay-player-native` (APK 0.7.4)**, que busca a playlist e desenha a tela sozinho; a página `/player` não é o que está nas TVs. A página foi alterada duas vezes desde então (Avisos e contraste da faixa), e essas mudanças **não aparecem nas TVs**. O risco de mexer no player web é menor do que se supunha; o risco real está no app nativo, cujo código-fonte não está neste repositório. |
| `app/dashboard/local/[code]` | ✅ "mais maduro"; "Minha TV Agora" e "Uptime (30d)" com dado real | **Aba Conteúdo redesenhada** (04/10, `fb4cc70`): resumo real, cards 16:9, status real (No ar / Pausada / Não está passando), estados vazio e de erro. **Nova aba Avisos** (27/09). Login por WhatsApp avisa quando o envio falha (`31f3cac`). **Lacuna**: "Minha TV Agora" e "Uptime (30d)" dependem de `studio_clients.player_id`, que está **vazio no BARBE332** — o painel dele não mostra a TV real. |
| `app/dashboard/analytics` | "candidata barata de terminar, RPCs faltando" | Fases 1 e 2 concluídas (`0333d03`, 15/09). Fase 3 depende do primeiro anunciante. |

## Dívidas de design novas, não listadas em 10/09
1. **Contraste do azul primário**: `#3B82F6` com texto branco dá **3,68:1**, abaixo do mínimo AA (4,5:1) para texto normal. Afeta botões primários e links do dashboard do cliente inteiro. Mudança de token = decisão do fundador.
2. **Texto `text3` (`#9CA3AF`) sobre o fundo claro dá ~2,4:1.** Corrigido só na aba Conteúdo nova (passou para `text2`); o restante do dashboard ainda usa `text3` em textos de apoio.
3. **Aba Conteúdo — estado "Aguardando aprovação" inexistente**: o item enviado mostra "No ar" (e de fato entra no ar antes da aprovação; problema de backend registrado no STATUS). O desenho precisa de um estado para isso quando a regra de aprovação for decidida.
4. **Formulário "Enviar conteúdo"**: sem barra de progresso (vídeos até 100 MB), erro de rede em inglês cru, "Nome da promoção" obrigatório e com exemplo de restaurante, duração oferecida também para vídeo (ignorada na exibição), sucesso mostrado mesmo quando o registro falha. Detalhes no `STATUS_PROJETO.md`.
5. **Avisos com cor de marca muito clara**: texto branco com contraste baixo (1,96 a 2,54). Pendência de baixa prioridade já registrada.
6. **Previews de design**: passaram a ficar em `design-previews/` (fora de `app/`), e o primeiro publicado foi o da aba Conteúdo.

## Leitura
O processo descrito na seção 5 se manteve (preview antes de código, aprovação explícita, dado real, contraste medido). O ponto que a análise de 10/09 não tinha como saber é o **app nativo**: qualquer trabalho visual "na TV" precisa passar por ele, não pela página `/player`.
