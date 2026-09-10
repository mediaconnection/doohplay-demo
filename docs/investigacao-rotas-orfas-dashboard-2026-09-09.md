# Investigação das 3 rotas órfãs de `app/dashboard` (09/09/2026)

Nenhuma das 3 (`analytics`, `executive`, `trust`) nunca teve link em
lugar nenhum do produto — confirmado via `git log --all -S` em busca de
qualquer commit que tenha adicionado ou removido uma referência a esses
caminhos em outro arquivo: zero resultados nos três casos. Não existe
`layout.tsx`/menu em `app/dashboard/` de onde um link poderia ter sido
removido. Conclusão: **trabalho inacabado/esquecido em todas as três,
não abandono deliberado** (nenhuma evidência de decisão de remover).

## `app/dashboard/analytics`

- Origem: commit único `8275f41`, 25/08/2026, Gilson Pimentel — "baseado
  num Figma Make de referência". Nunca mais tocado.
- Dado: híbrido e consciente — `MOCK_KPIS`/`MOCK_REVENUE`/
  `MOCK_ADVERTISERS_REVENUE` com TODO nomeando as RPCs Supabase reais que
  os substituiriam (`dashboard_kpis`, `dashboard_revenue_by_period`,
  `dashboard_revenue_by_advertiser`); o gráfico de campanhas já usa dado
  real (`CampaignsChart`).
- **Decisão (09/09/2026): mantido como está, registrado como candidato
  barato de terminar depois** — não implementado agora. Se retomado no
  futuro, o trabalho real é só plugar as 3 RPCs já nomeadas no próprio
  comentário do arquivo.

## `app/dashboard/executive` — REMOVIDO (09/09/2026)

- Origem: commit único `ba047a0`, mesmo dia que `analytics`, mesmo
  autor, mesmo Figma de referência. Nunca mais tocado.
- Dado: 100% mockado, sem nenhum aviso — e o conteúdo fabricado incluía
  **marcas reais usadas como anunciantes fictícios** (Banco Itaú, iFood,
  Bradesco, Natura, Nescafé) com gasto/trust score inventados, além dos
  mesmos números de escala fabricados já removidos da landing pública em
  `acc358e` (12.847 telas, Trust Score 97.3, SLA 99.9%).
- **Mesma classe de risco já corrigida em 15+ lugares nesta sessão**
  (marcas reais atribuídas como interessadas sem base real, números de
  rede fabricados). Rota nunca foi linkada, mas estava tecnicamente
  acessível em produção via URL direta.
- **Ação: arquivo `app/dashboard/executive/page.tsx` removido por
  completo.** Confirmado sem nenhum consumidor externo antes da remoção
  (`grep` no repositório inteiro, fora de `.next/` gerado). `tsc
  --noEmit` seguue no baseline de 47 erros pré-existentes (após limpar
  `.next/`, que tinha 12 erros de tipos gerados stale da rota removida —
  artefato de build, não código-fonte). `next build` compila com
  sucesso; para depois por falta de credencial real numa rota não
  relacionada, mesma falha pré-existente já documentada.

## `app/dashboard/trust` — mantido, overlap parcial confirmado

- Origem: `80c6e81`, 18/05/2026 — o **commit inicial do repositório**
  (~4 meses mais antiga que as outras duas). Só recebeu 2 consertos
  mecânicos aplicados a todas as rotas de API do projeto (26/05/2026),
  nunca trabalho intencional na feature em si.
- Dado: **real** — `app/api/trust/summary/route.ts` (mesmo commit de
  origem) consulta `event_chain` de verdade e calcula `valid_ratio`/
  `anchor_ratio`/`chain_ratio`/`global_score`. O estilo do front-end
  (tipagem solta, comentários em inglês com emoji, componente genérico
  `Card`) tem cara de boilerplate de scaffold inicial, não de feature
  desenhada de propósito.

**Confirmação de sobreposição pedida**: comparei os 4 blocos da página
(`Confidence Distribution` por faixa de trust_score, `Trust Score Over
Time` — série diária de 30 dias, `System Health` — barras de
valid/anchor/chain ratio, `Blockchain Status` — anchor ratio + score
global) contra `app/admin/page.tsx` (Central de Controle) e
`app/trust-center/page.tsx` (público):

- **Central de Controle**: zero overlap — é sobre saúde operacional de
  tela (online/ociosa/offline, último ping por dispositivo), não sobre
  prova/confiança de evento.
- **`/trust-center`**: overlap **parcial**, não total. Já mostra score
  agregado (`trustScore`), taxa de ancoragem (`icpScore`) e contagem de
  blocos ancorados/pendentes — isso duplica a metade "Blockchain
  Status"/"System Health" da rota órfã. **Mas não existe, em nenhum
  outro lugar do produto hoje, uma visão de série temporal (timeline
  diária de 30 dias) nem uma distribuição por faixa (High/Medium/Low) de
  trust score** — essas duas partes são genuinamente únicas, não
  duplicadas em lugar nenhum.

**Conclusão**: não é redundância completa. Metade do conteúdo já existe
em `/trust-center`; a outra metade (timeline histórica + distribuição
por faixa) não existe em nenhum outro lugar do produto hoje. **Mantido
como está por enquanto** — não é candidata a remoção pura como
`executive` era; é candidata a decisão de produto (terminar/redesenhar
aproveitando a parte única, ou remover mesmo assim por baixo valor
percebido) quando o fundador quiser tratar disso.
