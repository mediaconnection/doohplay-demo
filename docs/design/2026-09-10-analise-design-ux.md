# DOOHPLAY — Análise de Design & UX (10/09/2026)

> Baseado no Documento-Mestre v5.0 e no trabalho real do Designer Agent
> nesta maratona de sessões. Cobre estado real por área, sistema de
> design, padrões aplicados, e lacunas — tudo com base em código
> verificado, não em suposição.

---

## 1. Sistema de design — do zero a formalizado

No início desta maratona, **não existia nenhum arquivo de tokens** —
cada tela tinha constantes de cor duplicadas localmente, com
inconsistências reais nunca notadas (ex: `#0B1120` vs `#0F172A` em 14
páginas de marketing). Hoje existe `lib/theme.ts`, com 5 temas
formalizados, cada um com propósito específico:

| Token | Uso |
|---|---|
| `slateDark` | Tema principal do produto (admin, telas internas) |
| `lightDefault` | Fundo claro, quando aplicável |
| `marketingDark` | ~20 páginas de marketing/cadastro (público) |
| `previewDark` | Simulações de conteúdo (preview do Studio guiado) |
| `deviceDark` | Simulação de estado físico de dispositivo (card "Minha TV Agora") |

**Decisão de design recorrente e correta**: temas parecidos
conceitualmente (`previewDark` vs. `deviceDark`) foram mantidos
**separados de propósito**, não forçados a compartilhar token só
porque "parecem a mesma ideia" — contextos diferentes (edição de
conteúdo vs. estado de dispositivo) merecem liberdade de evoluir sem
acoplamento artificial.

A fonte `Inter` — declarada em CSS desde sempre, mas **nunca carregada
de verdade** — só passou a ser servida de fato nesta sessão.

---

## 2. Estado por área

### `/onboarding` e `/cadastro` — ✅ Maduro
Primeiro reskin real da maratona. Barra de progresso, indicadores de
passo, cards com hover elaborado — tudo em cima da paleta real do
produto, nunca a paleta do protótipo Figma Make. Lista de tipos de
negócio unificada entre os dois formulários (revelou e corrigiu um bug
de segmentação de canal no processo).

### `app/studio` — ✅ Maduro, com UX guiada nova
Templates guiados implementados (6 objetivos, campos curtos, sem
prompt livre) — resolve o item de prioridade máxima do feedback real
de clientes ("IA fraca pra quem não sabe usar IA"). Prévia grátis sem
gastar cota. `previewDark` formalizado nesse processo.

### `app/admin` — ✅ Área principal fechada
`page.tsx` (3.700 linhas) centralizado nos tokens reais, sem mudança
visual — elimina risco de desvio futuro. `reports` migrado de tema
claro pra escuro, com estado vazio honesto adicionado. `risk` já
reskinado antes. `metrics` deliberadamente não tocado (baixo uso, baixo
ganho). Achado sério no caminho: uma rota órfã (`executive`) tinha
conteúdo fabricado (marcas reais como anunciante fictício) que escapou
da varredura original por não ter link em lugar nenhum — removida.

### `app/dashboard` (interno) — 🟡 Parcial
Central de Controle portada do Figma com dado 100% real (impressões,
receita via CPM real, certificações reais — sem inventar audiência ou
fill rate, que não têm sensor real hoje). Três rotas órfãs investigadas
por origem: `executive` removida (risco de conteúdo fabricado),
`analytics` registrada como candidata barata de terminar (RPCs já
nomeadas, faltam implementar), `trust` mantida (não é redundante — tem
timeline de 30 dias e distribuição por faixa de score que não existem
em nenhum outro lugar do produto).

### `app/dashboard/local/[code]` (dashboard do cliente) — ✅ Mais maduro de todos
Onde `BARBE332`/`LEMEL186` vivem, todo dia. Já migrado pra `lib/theme.ts`
antes de qualquer trabalho formal desta sessão. Aba de KPIs
recém-melhorada: eliminada duplicação real (status da TV aparecia 2x),
adicionado "Uptime (30d)" como métrica nova (dado real já buscado,
nunca exibido), painel "Minha TV Agora" consolidado num único card com
`device_type`/`platform` reais no lugar de um placeholder visual sem
sentido. Reutiliza os mesmos limiares de cor (verde/âmbar/vermelho) já
usados em `/trust-center`, mantendo consistência entre telas.

O Clube de Telas (parceria entre estabelecimentos) vive aqui — UI
completa de ponta a ponta (criar pedido, aprovar/recusar, timeout,
expiração), com o cuidado de nunca deixar o card "de exemplo" (usado só
pra avaliar layout, sem candidato real hoje) ser confundido com dado
real em produção.

### `app/anunciante` — 🔴 Nunca tocado, deliberadamente
Zero uso real (pipeline de anúncio pago com 0 registros). Confirmado 2x
nesta sessão que o código não tem bug, só não recebeu nenhum trabalho
de design — prioridade mais baixa das 4 áreas, por decisão consciente
de impacto real.

### `app/player/page.tsx` — ⚠️ Intocado por segurança
Mesmo achado de cor visto em outros lugares (`#0B1120`), mas essa é a
página rodando **ao vivo, agora**, nas telas físicas de `BARBE332`/
`LEMEL186`. Decisão consciente de não mexer sem necessidade real — sem
forma de testar localmente, risco desproporcional ao ganho visual
mínimo.

---

## 3. Padrões de design que se firmaram como cultura real

1. **Nunca dado fabricado, nunca inventado** — regra aplicada de forma
   tão consistente que, numa bifurcação real de 4 meses entre duas
   linhas de código trabalhando em paralelo, as duas sessões corrigiram
   os mesmos problemas de conteúdo fabricado de forma independente,
   com o mesmo raciocínio
2. **Empty state honesto, nunca escondido atrás de dado ilustrativo**
   — e quando um exemplo ilustrativo é necessário (card "EXEMPLO" do
   Clube de Telas), ele é marcado de forma inequívoca (selo, borda
   tracejada, nome fictício óbvio, botão desabilitado)
3. **Reaproveitar dado real já buscado antes de inventar** — o padrão
   mais recorrente dos últimos reskins: `sla_30d`, `device_type`,
   `plays_month` já estavam sendo buscados no backend, só não
   apareciam na tela. Boa UX às vezes é só "mostrar o que já existe",
   não construir algo novo
4. **Nunca portar UI que finja ter feature que não existe** —
   descartado repetidamente material do Figma Make com capacidade
   fictícia (leilão de anúncio, comissão de revenda, dashboards de
   investidor com número inventado)
5. **Consistência de token entre telas relacionadas** — reaproveitar
   os mesmos limiares de cor, os mesmos padrões de card, em vez de
   redesenhar do zero a cada tela nova

---

## 4. Lacunas conhecidas, sem urgência

- `app/admin/metrics` sem reskin (baixo uso)
- `app/dashboard/analytics` incompleta (RPCs faltando)
- `app/player/page.tsx` com cor levemente inconsistente (risco não vale o ganho)
- `app/anunciante` nunca desenhado (zero uso real ainda)
- Reskin visual do próprio player (fora do escopo até haver motivo real)

---

## 5. Leitura geral

O DOOHPLAY saiu de um estado sem nenhum sistema de design formal — cor
duplicada e inconsistente em dezenas de arquivos, tela de admin
monolítica sem tratamento visual, rotas escondidas com conteúdo
fabricado que ninguém tinha percebido — para um produto com tokens
centralizados, processo de design repetível (Designer Agent + checklist
de handoff), e uma disciplina genuína de honestidade visual que já
provou resistir até a um cenário imprevisto (duas linhas de código
divergindo por 4 meses sem se saber).

O maior ativo não é nenhuma tela específica — é o **processo**: investigar
antes de propor, confirmar dado real antes de desenhar, nunca prometer
visualmente o que o produto não entrega, e validar cada mudança contra
produção real antes de considerar pronta. Isso é o que vai permitir
que a próxima área (ou a próxima pessoa trabalhando nisso) continue no
mesmo padrão, sem precisar reconstruir a disciplina do zero.
