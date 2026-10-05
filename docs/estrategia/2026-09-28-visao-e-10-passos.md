# DOOHPLAY — A melhor plataforma de DOOH que podemos criar, onde estamos e 10 passos

Data: 28/09/2026. Todo custo e prazo abaixo é **estimativa minha**, não cotação. As premissas estão no fim. O que foi verificado ao longo das nossas sessões está marcado como "confirmado".

---

## 1. A visão

**Uma plataforma de mídia em telas de pequenos comércios em que cada exibição pode ser verificada por quem pagou, e em que o dono da tela recebe parte da receita.**

Quatro pilares, nesta ordem de importância:

1. **Prova que o anunciante consegue verificar sozinho.** Qualquer pessoa confere se o anúncio rodou, onde e quando, sem confiar em nós. No mercado que pesquisamos, a prova costuma ser um log do próprio fornecedor ou uma auditoria externa paga.
2. **Tela que não cai sem ninguém saber.** Alerta, diagnóstico e religação remota. Tela desligada não prova nada.
3. **Primeira mídia no ar em minutos, sem saber design.** Studio guiado, avisos, modelos prontos.
4. **Renda para o dono da tela e rede entre vizinhos.** Repasse de receita e troca de divulgação (Clube de Telas).

O que **não** vamos tentar ser: o mais barato, o que tem mais widgets, nem uma ferramenta para grandes redes corporativas (Power BI, Grafana, SSO).

---

## 2. Onde estamos hoje (confirmado nas nossas sessões)

| Pilar | Hoje | Situação |
|---|---|---|
| Prova | Cada exibição é gravada em cadeia de hash, com certificado PDF assinado e página pública de verificação. Gravação saudável. | **Ancoragem em blockchain parada desde 26/08**: 49.658 eventos sem bloco (15/09: 40.019) |
| Confiabilidade | Alerta de queda implementado, mas **inativo** (depende do Redis). Dashboard mostra uptime real. | **As 2 TVs reais estão sem sinal desde 17/09**, ninguém foi avisado |
| Infra | Redis da Upstash sem responder (timeout) mesmo após reativação; causa do problema não confirmada | Fila de jobs parada |
| Simplicidade | Studio com 6 templates guiados; Avisos em texto no ar; onboarding reformulado | Funcionando |
| Renda/rede | Clube de Telas completo na parte técnica; repasse de 40% definido | **0 anunciantes, 0 campanhas, 0 pagamentos**; os 2 clientes ficam a 12 km (fora do raio de 5 km) |
| Player | Várias zonas ao mesmo tempo, 11 tipos de widget | Zonas só configuráveis pelo admin |
| Agendamento | Dono define dia/horário no dashboard | **A tela ignora** (bug registrado) |
| Segurança | RLS fechado em toda a base; login por WhatsApp funcionando | Sem permissões por equipe |
| Negócio | R$97 a R$620/mês, cobrança via Asaas | **Mais caro por tela que todos os concorrentes com preço público** que encontramos |
| Escala | 2 clientes, 2 telas | 3 prospectados |

Resumo honesto: a **tecnologia do diferencial existe**, mas a **base operacional está quebrada** e **não há anunciante**. Hoje não conseguimos entregar a promessa.

---

## 3. Os 10 passos

Custo de desenvolvimento em **dias de trabalho** (dev + IA). Calendário assumindo você + Claude Code, com ritmo parecido ao das últimas semanas.

| # | Passo | O que entrega | Dias de trabalho | Calendário | Custo extra além do dev |
|---|---|---|---|---|---|
| 1 | **Consertar a base** | Redis respondendo, TVs de volta ao ar, ancoragem em dia (49 mil eventos) | 3–5 | 1–2 sem | Possível plano pago da Upstash (valor não confirmado); gás da Polygon (o backlog anterior custou menos de R$10) |
| 2 | **Monitoramento que não depende do Redis** | Alerta de queda por job direto no banco; aviso ao dono e a você; detecção de "app não abriu sozinho" | 4–6 | 1–2 sem | Mensagens de WhatsApp (custo baixo, não medido) |
| 3 | **Controle remoto do aparelho** | Reiniciar, capturar tela, ver versão/estado do app | 10–15 | 3–5 sem | Pode precisar de especialista Android; testes em aparelhos reais |
| 4 | **Agendamento que funciona** | Dia/horário do dono aplicados na tela; regras de campanha (janela, cadência, prioridade, limite diário) | 10–15 | 3–4 sem | — |
| 5 | **Primeiro anunciante real** | Cadastro e criação de campanha pelo próprio anunciante, pagamento, aprovação | 15–20 | 4–6 sem (técnico); **prazo comercial incerto** | Taxas do Asaas |
| 6 | **Produto de prova** | Página de verificação clara para o anunciante, relatório PDF com marca do cliente e mapa de calor, ancoragem contínua | 15–20 | 4–6 sem | Auditoria externa opcional (**orçar**) |
| 7 | **Editor de zonas para o cliente** | O dono monta o layout sozinho (motor já existe) | 15–25 | 4–6 sem | — |
| 8 | **Conteúdo mais rico** | Mais templates e widgets, biblioteca curada, aprovação de mídia enviada pelo cliente | 15–25 | 4–8 sem (contínuo) | Custo da IA de geração (uso real não medido) |
| 9 | **Rede e revenda** | Clube de Telas com clientes dentro do raio, painel com marca do revendedor (Hub Media Connection) | 20–30 | 8–12 sem; **depende de ter clientes próximos** | Tempo comercial; contrato do Hub ainda em negociação |
| 10 | **Escala e conformidade** | LGPD, permissões por equipe, teste de carga, backup, suporte estruturado, revisão de preços | 20–30 | 6–8 sem | Assessoria jurídica para LGPD/contratos (**orçar**) |

**Total: 127 a 191 dias de trabalho.** Com alguns passos em paralelo, **7 a 10 meses** de calendário.

Ordem importa: 1 e 2 vêm antes de tudo, porque sem base estável não dá para vender prova. O passo 5 pode começar assim que o 4 estiver pronto, e depende do mercado, não do código.

---

## 4. Quanto custa

**Cenário A — como trabalhamos hoje (você + Claude Code):**
- Desenvolvimento: sem salário, o custo é a assinatura do Claude e o seu tempo. O limite semanal já foi atingido uma vez; pode ser necessário um plano maior (confira o preço atual).
- Infra mensal hoje: Render (site + worker), Supabase, Upstash, VPS da Hostinger (WhatsApp), Asaas (taxas por cobrança), gás da Polygon. **Não tenho os valores atuais confirmados**; a pesquisa de custos que pedi ao Agente Financeiro ainda não voltou para mim.
- Extras prováveis: especialista Android (passo 3), jurídico (passos 9 e 10), auditoria externa (passo 6). **Sem cotação.**

**Cenário B — se contratássemos desenvolvedor:**
- Referência para dimensionar: 127–191 dias × diária. **Hipótese minha, troque pela sua cotação:** com R$800/dia, ficaria em torno de R$100 mil a R$153 mil; com R$500/dia, R$64 mil a R$96 mil.
- Mais o infra e os extras do cenário A.

**O que mais pesa não é código.** É conseguir anunciantes e clientes dentro do raio de 5 km. Isso custa tempo comercial e talvez mídia, e eu não tenho base para estimar.

---

## 5. Riscos

- **Mais de uma causa na queda das duas TVs.** Pode ser energia, rede ou o app não abrir sozinho após reiniciar. Ainda não sabemos; falta falar com os donos.
- **Upstash.** Reativada, mas sem responder. O problema pode ser o endereço/senha ou outra coisa; ainda não verificado.
- **Preço.** O plano de entrada custa mais de três vezes o do SigX. Se o cliente compara só a mensalidade, perdemos.
- **"Único no mercado".** Não achei concorrente com prova criptográfica por evento, mas a busca foi curta. Não use "único" em material comercial antes de uma pesquisa mais funda.
- **Dependência de poucas pessoas e de uma ferramenta.** Todo o desenvolvimento passa por você e pelo Claude Code.

---

## 6. Premissas e limites desta estimativa

- Dias de trabalho são estimativa minha. Uma estimativa anterior do Código Agent para a feature de Avisos (3,5 a 4,5 dias) não foi medida depois, então não calibra bem.
- Prazos assumem que você revisa e aprova cada etapa no ritmo das últimas semanas.
- Não incluí o tempo para vender, nem custos de marketing, equipamentos de TV ou aparelhos Android.
- Preços de concorrentes e câmbio mudam; revalide antes de decidir preço.
- Nada aqui foi validado com os clientes reais nem com os 3 prospectados. Antes de investir nos passos 6 a 10, vale perguntar a eles o que mais valorizam.


---

## Atualização de 04/10 (noite) — o que mudou nas premissas
- **Passo 1 (consertar a base)** muda: o Redis responde (o erro é timeout do nosso cliente); a ancoragem falha por `unique_merkle_root` no banco; o alerta precisa da configuração do WhatsApp no worker; faltam o vínculo do player do BARBE332 e a causa da perda dos arquivos (R2 + rota de exclusão de anunciante).
- **Passo novo, antes de tudo (segurança):** exigir login na rota de envio de conteúdo, impedir que o conteúdo vá ao ar antes da aprovação, e proteger as rotas de playlist e de atribuição de tela **sem quebrar o que as TVs usam**.
- **Passo 3 (controle remoto/auto-início)** depende de **localizar e controlar o código do app nativo (APK 0.7.4)**, que não está neste repositório. Antes de estimar esse passo, descobrir quem mantém esse app e onde está o código.
- **Avisos** hoje não aparecem nas TVs; os passos que dependem deles precisam do app nativo.
- Os custos de Redis do plano partiam de "Upstash gratuito"; a conta é paga (ver handoff).
