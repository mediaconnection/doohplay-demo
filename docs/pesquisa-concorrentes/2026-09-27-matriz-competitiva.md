# DOOHPLAY — Matriz competitiva (pesquisa de mesa, 27/09/2026)

**Como ler:** 🟢 lideramos · 🟡 empatamos / parcial · 🔴 perdemos · ❓ não verificado
**Limites:** dados de site, avaliações públicas e blogs de terceiros; prints do SigX enviados pelo fundador; Over TV vem da análise antiga (não atualizada). Preços em moeda original, sem conversão. Nada aqui foi validado com clientes.

---

## 1. Quem são e quanto cobram

| Concorrente | Modelo | Preço encontrado | Fonte / observação |
|---|---|---|---|
| **DOOHPLAY** | Assinatura por tela + repasse de 40% da receita de anúncio ao dono | Planos de R$97 a R$620/mês (registro interno) | 2 clientes reais, 0 anunciantes pagantes hoje |
| **SigX** (BR) | Assinatura por tela, tudo incluso | R$29,90/tela/mês, teste de 7 dias sem cartão | Site + prints; opera ~1.034 telas / 820 clientes |
| **Over TV** (BR) | Tela grátis, monetiza com anúncio, repasse de 20% ao dono | Grátis p/ o estabelecimento | Análise antiga; números de alcance são declarações deles |
| **Yodeck** (global) | Assinatura por tela | US$8 (Basic), US$12 (Premium), US$16 (Enterprise) por tela/mês; 1 tela grátis | Alta de US$1 em Premium/Enterprise em abril/2026 |
| **ScreenCloud** (global) | Assinatura por tela | US$20 (Core) e US$30 (Pro) anual; US$24 / US$36 mensal; Enterprise sob consulta; Pro exige mínimo de 5 telas | Site oficial + comparativos de terceiros |
| **Broadsign** (DOOH enterprise) | Software para redes de mídia | Não encontrado | Foco em redes grandes de mídia exterior |
| **Xibo** (global) | Assinatura (versão gratuita e teste disponíveis) | A partir de US$3,50/mês | Print do Capterra enviado pelo fundador; rótulo "por usuário", provavelmente por tela (não confirmado) |
| **OptiSigns** (global) | Assinatura (versão gratuita e teste) | A partir de US$10/mês | Idem |
| **Rise Vision** (global) | Assinatura (teste, sem versão gratuita) | A partir de US$11/mês | Idem |
| **Play Digital Signage** (global) | Assinatura (versão gratuita e teste) | Sob consulta | Idem |
| **4yousee** (BR) | Software de signage e mídia indoor | Sem preço público; só 3 avaliações (nota 4,0) no Capterra | Presença pública pequena; concorrentes globais aparecem como alternativas |
| **addus, Digital Senses, Voxel, Display4** (BR) | Software/serviço de signage e mídia indoor | **Não encontrei preços** | Só descrições em diretórios; sem dado confiável |

> Todos os preços "a partir de" são de entrada; planos com recursos avançados custam mais. Valores em dólar, sem conversão (confira o câmbio do dia).

**Leitura:** somos o mais caro por tela entre os que têm preço público. O SigX cobra menos de um terço do nosso plano de entrada, e os globais começam em US$3,50 (Xibo) a US$11 (Rise Vision), quase todos com versão gratuita ou teste. O concorrente que hoje aparece como alternativa aos players brasileiros no Capterra são os globais baratos, não outro brasileiro. Não temos vantagem de preço nem de escala; se for para vencer, não será por aí.

**Atenção ao comparar:** nosso plano inclui elementos que os outros não têm (prova de exibição, repasse ao dono, Studio com IA). Se o cliente compara só o preço da assinatura, perdemos; o desafio é fazer o valor extra aparecer na decisão.

---

## 2. Funcionalidades — onde estamos

| Área | DOOHPLAY | SigX | Yodeck | ScreenCloud | Veredito |
|---|---|---|---|---|---|
| **Prova de exibição** | Registro por evento em cadeia de hash, certificado PDF assinado, página pública de verificação. **Ressalva:** a ancoragem em blockchain está parada (≈40 mil eventos pendentes; o mais antigo é de abril, a última ancoragem confirmada é de 26/08). Nos logs de 15/09 todos os workers, incluindo o agregador, estavam bloqueados pelo mesmo rate-limit do Upstash, mas isso não prova que o Upstash explica todo o atraso desde abril. O Audit Log do Upstash mostra suspensão da conta/database e reativação; o motivo não foi confirmado, e a data da suspensão (cerca de 2 meses antes do print) não bate de forma óbvia com o pipeline ter funcionado em agosto | Não vi nada nos prints | Relatórios de reprodução no plano Premium | "Proof of play" é add-on premium (logs) | 🟢 lidera **em tese**; 🟡 enquanto a ancoragem estiver parada |
| **Auditoria independente** | Prova verificável por terceiro sem confiar no operador | Não vi | Não vi | Log do próprio fornecedor | 🟢 |
| **Multi-zona / layouts** | O player já exibe várias zonas ao mesmo tempo desde a Fase 4 (layouts com zonas, painel de widgets lateral/inferior, formatos de anúncio lateral, faixa inferior e flutuante). **Só o admin configura**; falta um editor no dashboard do cliente | Sim, editor de zonas com linha do tempo | Não verifiquei | Multi-zona listado no plano Core | 🟡 (corrigido em 27/09: antes estava 🔴 "não tem") |
| **Alerta de tela offline** | Implementado, **inativo**: em 13/09 o job não conseguiu se agendar porque o Upstash respondeu "temporarily rate-limited" (confirmado nos logs). Se a ancoragem parada tem a mesma origem, ainda não está estabelecido | Sim (widget de telas offline) | ❓ | Monitoramento incluso | 🔴 hoje |
| **Comandos remotos** (reiniciar, capturar tela) | Não tem | Sim | ❓ | "Remote device management" incluso | 🔴 |
| **Detecção de auto-início / saúde do app** | Não tem | Sim (aviso na ficha da tela) | ❓ | ❓ | 🔴 |
| **Agendamento por dia/hora** | O dono configura, **mas a tela ignora** (bug registrado) | Funciona | Sim | Sim | 🔴 |
| **Avisos rápidos em texto** | Existe, mas **só no player web; não aparece nas TVs** (que rodam o app nativo) | Sim | ❓ | ❓ | 🔴 hoje (corrigido em 04/10) |
| **Criação de conteúdo** | Studio com IA + templates guiados (6) | Envio de arquivo, RSS, HTML, URL | 500+ templates, 80+ integrações | Templates + Quick Post + editor | 🟡 (diferencial IA a validar; amplitude menor) |
| **Widgets prontos** (clima, hora, loteria…) | 11 tipos: relógio, clima, ações, notícias, notícias de economia, câmbio, indicadores econômicos, qualidade do ar, loteria, enquete ao vivo por QR, mais faixa de notícias | Muitos (clima com 7 layouts, 10 loterias, câmbio…) | Grande catálogo de apps | 80+ apps | 🟡 (corrigido em 27/09; amplitude ainda menor que Yodeck e ScreenCloud) |
| **Biblioteca curada** | Canal DOOHPLAY (institucional segmentado) | Playlists prontas atualizadas | Templates | Templates | 🟡 |
| **Relatórios** | Certificados/relatórios PDF; sem mapa de calor nem marca do cliente | Relatório de campanha em PDF com marca do cliente e mapa de calor | Playback reports (Premium) | Proof of play (Pro+) | 🔴 em apresentação |
| **Segmentação / "onde não exibir"** | Lista de tipos de negócio unificada; o dono pode desligar categorias sensíveis de anúncio e canais do Canal DOOHPLAY; anúncio de concorrente direto é sempre bloqueado | Segmentação por ramo com "onde não exibir" | ❓ | ❓ | 🟡 (corrigido em 27/09: a exclusão já existe; empate com o SigX) |
| **Painel do cliente / white-label** | Dashboard do cliente com login por WhatsApp; sem marca própria de revenda | Painel com marca do revendedor e link com token | Workspaces (Enterprise) | Marca própria (Pro) | 🔴 para revenda |
| **Rede entre estabelecimentos** | **Clube de Telas** (troca de divulgação por proximidade) | Não vi | Não vi | Não vi | 🟢 (único que encontrei) |
| **Repasse ao dono da tela** | 40% da receita de anúncio | Não se aplica (assinatura) | Não se aplica | Não se aplica | 🟢 no modelo; 🔴 na prática (0 anunciantes) |
| **Segurança/permissões** | RLS fechado, OTP por WhatsApp | Usuários, equipes, perfis | SSO, papéis, logs (Enterprise) | SSO, audit logs (Enterprise) | 🟡 |
| **Escala e prova social** | 2 clientes, 2 telas | ~1.034 telas, 820 clientes | Milhares de avaliações | Centenas de avaliações | 🔴 |
| **Suporte** | Fundador + agentes | Ticket, WhatsApp, vídeos, comunidade | Suporte bem avaliado em reviews | Suporte 24/5 | 🔴 |

---

## 3. O que a pesquisa diz sobre "prova de exibição" (nosso diferencial)

- No mercado, a **prova de exibição costuma ser um log do próprio fornecedor**, vendido como recurso premium (ScreenCloud) ou um plano superior (Yodeck).
- Na mídia exterior digital enterprise, a confiança vem de **auditorias externas periódicas**: a Broadsign contratou a Arbitron em 2009 para auditar o proof-of-play por amostragem, e a JCDecaux UK teve o processo auditado pela PwC em 2017. Ou seja, o mercado *paga* para ter alguém de fora atestando.
- **Não encontrei, nesta pesquisa, nenhum concorrente com prova criptográfica por evento.** Isso não prova que não exista; só que não achei. Vale uma busca mais funda antes de usar "único" em material comercial.

**Implicação:** a tese do ProofChain (qualquer pessoa verifica sem confiar em nós) é coerente com o que o mercado já busca por vias caras. Mas o argumento só se sustenta com a ancoragem funcionando e com uma forma simples de o anunciante ver isso.

---

## 4. Onde eu sugiro escolher ser o melhor (3–4 frentes)

1. **Prova verificável que o anunciante entende.** Religar a ancoragem (Upstash), manter a verificação pública simples e transformar o certificado em argumento de venda. É onde o mercado paga auditor e nós temos tecnologia.
2. **Confiabilidade operacional.** Alerta de queda ativo, detecção de auto-início, comandos remotos. Não é diferencial sozinho, mas sem isso a prova perde sentido (tela desligada não prova nada) e hoje perdemos de todos.
3. **Simplicidade para o pequeno comércio.** Studio guiado + Avisos + onboarding rápido. O concorrente barato (SigX) ganha em preço e amplitude; a chance é ganhar em "primeira mídia no ar em minutos, sem saber design".
4. **Renda para o dono da tela** (repasse + Clube de Telas). Só vira diferencial se o primeiro anunciante real entrar; até lá é promessa.

**Paridade mínima (não competir, só não ficar para trás):** aplicar de verdade dia/horário do conteúdo do dono; relatório com marca do cliente; **editor de zonas no dashboard do cliente** (o motor de zonas já existe no player; hoje só o admin configura).

**Onde eu não competiria agora:** amplitude de widgets, Grafana/Power BI, SSO/SAML, gestão de equipes, preço.

---

## 5. O que falta para essa matriz valer como decisão

- Testar com os 2 clientes reais e os 3 prospectados **o que eles valorizam** (preço? prova? simplicidade?). Toda a pesquisa acima é visão de fora.
- Levantar preço e funcionalidades dos brasileiros (4yousee, addus, Voxel, Digital Senses): não achei dado público confiável.
- Fazer uma busca dedicada por prova criptográfica/blockchain em DOOH antes de afirmar ineditismo.
- Atualizar Over TV (a análise tem meses).

---

## Fontes consultadas
- Yodeck — preços e planos: risevision.com/blog/yodeck-pricing; softwareadvice.com e capterra.com (Yodeck)
- ScreenCloud — screencloud.com/pricing, screen.cloud/pricing, help.screencloud.com (Proof of Play), getapp.com, fugo.ai/blog/screencloud-pricing
- Proof-of-play em DOOH — broadsign.com/blog/arbitron-portable-people-meter, jcdecaux.co.uk (auditoria PwC), displaydaily.com
- Brasil — ensun.io (lista de empresas), b2bstack.com.br (4yousee)
- SigX — site institucional e prints enviados pelo fundador


---

## Atualização de 04/10 (noite), a partir da verificação do Código Agent
- **Prova de exibição:** a ancoragem falha **no banco** (`unique_merkle_root`) antes de chegar à Polygon. Não é o Redis, ao contrário do que a ressalva acima sugere.
- **Avisos:** só funcionam no player web, não no app nativo das TVs.
- **Segurança:** a rota de envio de conteúdo não exige login e o conteúdo vai ao ar antes da aprovação; isso pesa contra a linha "Segurança/permissões" até ser corrigido.
- **App nativo:** o código dele não está neste repositório, o que limita itens como comandos remotos e detecção de auto-início.
