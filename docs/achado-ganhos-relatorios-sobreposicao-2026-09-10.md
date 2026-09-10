# Achado: sobreposição entre as abas "Ganhos" e "Relatórios" do dashboard do cliente

Investigado durante o reskin da UX de `app/dashboard/local/[code]`
(dono da tela), 10/09/2026.

## O que foi encontrado

`TabGanhos` e `TabRelatorios` (`dashboard-client.tsx`) mostram
essencialmente a mesma informação:

- Os dois exibem o KPI "Receita este mês" (`stats.revenue_month`).
- Os dois exibem uma lista dos mesmos pagamentos — `TabGanhos` mostra o
  histórico completo; `TabRelatorios` mostra só os 3 mais recentes e
  adiciona um link pra `/dashboard/financeiro/[code]` (página financeira
  separada, mais completa, com assinatura/Asaas).

Não são 100% idênticas (Relatórios funciona mais como um teaser +
atalho pra página financeira completa), mas a sobreposição é grande o
bastante pra gerar a pergunta óbvia: por que duas entradas separadas no
menu pra "ver meu dinheiro"?

## Decisão (10/09/2026)

**Não consolidar agora** — fundir duas abas do menu principal é mudança
estrutural que mexe no hábito de navegação de clientes reais
(`BARBE332`/`LEMEL186`) que usam o dashboard todo dia. Fica registrado
como achado pra decisão com calma, não durante uma rodada de reskin
visual.

## Achado relacionado, já corrigido

`TabGanhos` tinha um botão "↓ Exportar" sem `onClick` nenhum — não fazia
nada quando clicado, e não existe nenhum endpoint de exportação/CSV no
backend (`app/api/client`) pra ele chamar. Não era um "esqueceram de
religar", era uma promessa visual de uma feature que nunca existiu.
Removido (não implementado) — se exportação de pagamentos virar
prioridade real, é tarefa própria de backend + front, não algo pra
inventar durante reskin.
