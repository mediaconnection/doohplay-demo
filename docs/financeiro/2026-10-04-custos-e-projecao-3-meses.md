# Custos reais de infraestrutura e projeção de 3 meses (04/10/2026)

Resposta ao `prompt_financeiro_projecao_3meses.md`, seguindo as regras do `financeiro-agent` (`.claude/agents/financeiro-agent.md`): nada estimado como se fosse real; o que não pôde ser confirmado na fonte está marcado.

**Limite das ferramentas (confirmado de novo hoje):** as APIs do Render e do Supabase informam o **plano**, nunca o **valor da fatura**. Valores em dinheiro só aparecem aqui quando vieram de fatura ou painel vistos pelo fundador.

## 1. Custo de infraestrutura hoje (o que a DOOHPLAY paga)

| Serviço | O que está contratado | Valor | Fonte e data |
|---|---|---|---|
| **Render** — `doohplay-demo` (site) | Plano **standard** | **não confirmado** | API do Render, 04/10 (só o plano) |
| **Render** — `doohplay-workers` | Plano **starter** | **não confirmado** | API do Render, 04/10 |
| **Render** — 3 cron jobs (`network-media-expire`, `network-partnerships-timeout`, `monthly-report`) | Plano **starter** | **não confirmado** | API do Render, 04/10 |
| **Supabase** | Organização no plano **Pro** | **não confirmado** | API do Supabase, 04/10. O upgrade de compute discutido em 03/09 **segue sem confirmação** (pendência antiga) |
| **Upstash** (Redis) | Pay-as-you-go **+ Prod Pack** | Faturas: mai US$ 33,09; jun US$ 246,26; jul US$ 191,07; **ago não aparece**; set US$ 118,83. Out (1–4): **US$ 27,20** = uso US$ 1,39 (694 mil comandos) + **Prod Pack US$ 25,81** | Prints do fundador (registrados no handoff de 04/10). Não conferido por esta sessão. Prod Pack = US$ 200/mês por banco (preço público, segundo o handoff) |
| **Cloudflare R2** (arquivos de mídia) | Bucket `dooh-media` | **não confirmado** | Código (`app/api/studio/upload`). Não estava na lista do prompt |
| **Asaas** | Cobrança de cliente | Taxas **não confirmadas** | Nenhuma fonte acessível daqui |
| **VPS Hostinger** (Evolution / WhatsApp) | `srv1737073.hstgr.cloud` | **não confirmado** | — |
| **Resend** (e-mail de login) | Em uso | **não confirmado** | Código (`app/api/auth/otp/send`). Não estava na lista do prompt |
| **IA — Anthropic API** | Studio e geração de criativo (`claude-sonnet-5`, `claude-sonnet-4-6`), assistente (`claude-sonnet-5`) | **não confirmado** | Código. Uso real (`ai_generation_log`): jul 4, ago 5, set 9 conceitos de criativo; 1 conversa no assistente em ago e 1 em set — volume muito baixo |
| **IA — Google Gemini** | Imagens de fundo do Studio (`GEMINI_API_KEY`) | **não confirmado** | Código (`lib/imageGeneration.ts`). Mesmo volume baixo acima |
| **Gás na Polygon** | Ancoragem de prova (mainnet) | **~R$ 0 desde 27/08** (nada foi ancorado) | Banco: 138 ancoragens em agosto, última transação em **27/08 05:50 UTC**. O backlog de 27/08 custou "menos de R$ 10" segundo registro anterior. Saldo da carteira: **não visível** |
| **Domínio e outros fixos** | `doohplay.com.br` e outros | **não confirmado** | — |

## 2. Total mensal real hoje

**Não é possível somar com honestidade**: só o Upstash tem valor vindo de fatura. Os demais serviços precisam ser conferidos no painel de cada um (Render → Billing; Supabase → Settings → Billing; Cloudflare; Hostinger; Anthropic Console; Google AI Studio/Cloud Billing; Asaas; registrador do domínio).

O que dá para afirmar: **o Upstash sozinho vai custar ~US$ 200/mês enquanto o Prod Pack estiver ativo**, mais ~US$ 10/mês de uso no ritmo atual (694 mil comandos em 4 dias ≈ 5,2 milhões/mês; a US$ 0,20 por 100 mil ≈ US$ 10 — cálculo sobre dado do painel).

## 3. Receita (o que os clientes pagam — separado do custo)

| Cliente | Assinatura no banco (`financial_subscriptions`) |
|---|---|
| BARBE332 | Starter, **R$ 97**, ACTIVE — **o dono é o próprio fundador** |
| LEMEL186 | **Nenhuma assinatura cadastrada** |

Receita recorrente de cliente externo confirmada no banco: **R$ 0**.

## 4. Projeção de 3 meses (out, nov, dez de 2026)

Premissas comuns: mesmos planos de hoje; câmbio não aplicado (valores em US$ ficam em US$); nada de novo contratado.

### Cenário conservador (2 clientes, uso igual)

| Componente | Fixo / variável | Por mês | 3 meses | Premissa |
|---|---|---|---|---|
| Upstash Prod Pack | fixo | US$ 200 | **US$ 600** | Prod Pack continua ativo |
| Upstash uso | variável | ~US$ 10 | ~US$ 30 | Ritmo de comandos de 1–4/10; a correção do `commandTimeout` **não reduz** esse volume |
| Render (site + worker + 3 crons) | fixo | não confirmado | — | Planos de hoje |
| Supabase Pro | fixo | não confirmado | — | Sem upgrade de compute |
| R2, VPS, Resend, domínio | fixo | não confirmado | — | — |
| IA (Anthropic + Gemini) | variável | provavelmente irrelevante | — | Volume de jul–set (≤ 10 conceitos/mês) |
| Gás Polygon | variável | ~0 | ~0 | Ancoragem continua parada. **Se for consertada**: ~100 transações para limpar o backlog e depois ~1 por lote de 500 eventos; valor por transação não confirmado |
| Asaas | variável | não confirmado | — | 1 cobrança/mês (R$ 97) |

### Cenário de crescimento moderado (+3 clientes ao longo do trimestre)

**O número "3 prospectados" não está no banco** — vem só do handoff ("sem detalhes"). Usado aqui como premissa, não como fato.

| Mudança em relação ao conservador | Efeito esperado | Premissa |
|---|---|---|
| Render, Supabase, Upstash Prod Pack | Igual | 5 telas cabem nos planos atuais (não verificado contra limite de cada plano) |
| Upstash uso | Sobe pouco | O volume vem quase todo da consulta de fila dos workers, que não cresce com cliente; tráfego de player cresce por tela |
| IA | Sobe, ainda pequeno | Cota Starter = 10 gerações/mês por cliente (`lib/asaas.ts`); custo por geração não confirmado |
| Asaas | +1 a 3 cobranças/mês | Taxa por cobrança não confirmada |
| R2 | Sobe pouco | Mídias por cliente; limite do plano não está sendo aplicado hoje (contagem usa tabela vazia) |
| **Receita** | +R$ 97 a R$ 291/mês | Os 3 entram no Starter, um por mês |

## 5. Alertas e pendências que exigem decisão

1. **Prod Pack do Upstash (~US$ 200/mês)**: é, de longe, o maior custo com valor conhecido, para um banco de 12 MB usado como fila. Quem ativou é desconhecido. Decisão: remover (≈ US$ 6,50/dia enquanto ativo) depois do retorno do suporte.
2. **Receita externa zero**: a única assinatura no banco é do BARBE332, que é do próprio fundador. O **LEMEL186 não tem assinatura**. Confirmar como o LeMelo é cobrado (trial, cortesia, cobrança fora do sistema?).
3. **Volume do Upstash vem da própria fila**: cada worker consulta a fila a cada ~5 s (`drainDelay` padrão do BullMQ). Aumentar esse intervalo reduziria o uso — mudança de código, não feita.
4. **Upgrade de compute do Supabase (03/09)**: continua sem confirmação de que foi efetivado.
5. **Gás e carteira**: ancoragem parada desde 27/08; quando voltar, o custo volta. Saldo da carteira não visível daqui.
6. **Dois fornecedores de IA** (Anthropic e Google): conferir as duas faturas.
7. **Definição do `financeiro-agent` desatualizada**: diz "Upstash (Redis, plano Free)"; o Upstash é pago (Pay-as-you-go + Prod Pack). Também cita como referência o custo fixo de R$ 424,64 de 16/07, que o próprio arquivo já marca como desatualizado. Atualizar o arquivo do agente é decisão do fundador.
8. **Serviços fora da lista do prompt**: Cloudflare R2 e Resend também geram custo.
