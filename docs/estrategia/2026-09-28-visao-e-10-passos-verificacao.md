# Verificação do "Visão e 10 passos" (04/10/2026)

Complemento de [`2026-09-28-visao-e-10-passos.md`](2026-09-28-visao-e-10-passos.md) (documento do fundador, mantido como veio). O próprio documento já tem um bloco "Atualização de 04/10 (noite)" com as correções de Redis, ancoragem, alerta, segurança, app nativo, Avisos e Upstash pago. Abaixo, só o que **ainda não está** nele, conferido em código, banco e logs.

| Onde | O documento diz | O que foi verificado |
|---|---|---|
| §2 Confiabilidade | "As 2 TVs reais estão sem sinal desde 17/09" | Verdadeiro em 28/09 de manhã. O LEMEL186 ficou no ar de 28/09 07:20 a 01/10 09:26 (BRT); o BARBE332 voltou em 04/10 17:27 (BRT). As voltas longas das duas acontecem sempre juntas (6 de 6) e, em 04/10, os dois aparelhos saíram pela **mesma rede** — onde estão fisicamente ainda não foi confirmado. |
| §2 Renda/rede e Negócio | "0 anunciantes, 0 campanhas, 0 pagamentos" | Correto, e há mais: a **única assinatura no banco é a do BARBE332 (do fundador)**; o **LEMEL186 não tem assinatura**. Receita externa confirmada no banco: **R$ 0**. |
| §2 Escala | "3 prospectados" | Não há registro deles no banco; o número vem só da conversa. |
| §2 Prova | "Gravação saudável" | Vale para o LEMEL186. O **BARBE332 não grava eventos em `event_chain` desde 17/09**, mesmo com o app enviando `/api/player/event` com 200. |
| §2 Simplicidade / Passo 8 | Biblioteca curada como item futuro | O Canal DOOHPLAY existe (17 itens), mas **não recebe conteúdo novo desde 20/07**. |
| §4 Cenário A | "Não tenho os valores… a pesquisa do Agente Financeiro ainda não voltou" | Feita em 04/10: [`docs/financeiro/2026-10-04-custos-e-projecao-3-meses.md`](../financeiro/2026-10-04-custos-e-projecao-3-meses.md). Só o Upstash tem valor de fatura (~US$ 210/mês com o Prod Pack); os demais precisam ser conferidos nos painéis. |
| Passo 1 | "TVs de volta ao ar" | Falta incluir: as **8 mídias do LEMEL186 dão 404** (o cliente não sabe) e as do BARBE332 já foram removidas; reenviar só depois de corrigir a rota de exclusão de anunciante e avisando o LeMelo. |
| Passo 2 | "Detecção de app não abriu sozinho" | Exige mudança no **app nativo** (como o passo 3): o servidor não recebe versão, permissões nem estado do app hoje. O alerta "direto no banco" resolve só a parte de avisar. |
| Passo 8 | "Aprovação de mídia enviada pelo cliente" | A aprovação já existe (`/admin`), mas a mídia **vai ao ar antes** dela. Pertence ao passo novo de segurança, não a "conteúdo mais rico". |
| §5 Riscos | Lista de riscos | Acrescentar: **código-fonte do app nativo fora do repositório** (sem ele, passos 2, 3 e qualquer mudança visível na TV ficam travados). |

As estimativas de dias e custos do documento não foram reavaliadas aqui.
