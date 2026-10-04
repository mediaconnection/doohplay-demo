# Análise consolidada do SigX — o que dá pra aproveitar no DOOHPLAY

Base: prints de tela enviados pelo fundador (não consegui acessar o vídeo).
Escala do SigX nos prints: ~1.034 telas, 820 clientes, ~10 mil conteúdos.
O DOOHPLAY tem 2 clientes reais — nada aqui deve ser copiado por "parecer
completo"; só o que resolve um problema real nosso.

Legenda de status: ✅ já feito | 🟡 em andamento/decidido | 🔵 candidato | ⚪ não aplicável hoje | ❓ confirmar se já existe

---

## 1. Operação de telas (maior aderência aos nossos problemas reais)

| Funcionalidade observada | Aplicabilidade | Status |
|---|---|---|
| Alerta de tela offline (widget "Telas Offline" com tempo offline) | Alta — incidentes reais do BARBE332 | 🟡 implementado, bloqueado pelo Upstash |
| Aviso "Início automático: pode não abrir sozinho após reiniciar (falta permissão 'Exibir sobre outros apps')" na ficha da tela | Alta — pode explicar quedas sem causa conhecida | 🔵 investigar se o app Android consegue detectar/reportar isso |
| Comandos remotos: Reiniciar, Fechar, Capturar tela, Limpar dados | Alta — evitaria pedir ao dono pra religar aparelho | 🔵 depende de canal de comando player↔servidor |
| Ficha do dispositivo: versão do app, SO, resolução, codec (HEVC), origem da instalação (APK/sideload), localização em mapa | Média — parte já existe (device_type/platform) | ❓ confirmar o que o player já reporta |
| "Telas com menor uptime" (ranking nominal, não só média) | Média — útil no admin | 🔵 |
| Status "Atualizado" (versão do app em dia) | Média | 🔵 |
| Trocar código da tela | Baixa | ⚪ |
| Preview da tela com zonas na ficha | Média | 🔵 junto com zoneamento |

## 2. Conteúdo e playlists

| Funcionalidade | Aplicabilidade | Status |
|---|---|---|
| **Avisos rápidos em texto** (modelos visuais, agendamento, escolha de telas) | Alta | ✅ implementado e no ar |
| Playlist automática de **inadimplência** ("Tela de Inatividade — falta de pagamento") | Alta — caso real do LEMEL186 (cobrança no Asaas) | 🔵 não investigado |
| Vigência do conteúdo (exibir a partir de / expira em) e tempo de exibição | Média | ❓ dono já tem campos no dashboard, mas **não são aplicados na tela** (achado registrado) |
| "Conteúdos expirando", "Limpar expirados", "Remover mídias não usadas", "Limpeza de storage" | Média — higiene de armazenamento | 🔵 quando o volume crescer |
| Tags/etiquetas em conteúdo e telas, busca por nome/etiqueta | Média | ❓ |
| Conteúdo dinâmico: previsão do tempo (7 layouts), hora certa, qualidade do ar/UV, cotação de moedas, commodities, índices, 10 loterias | Média — já temos alguns widgets | ❓ comparar com o que o player tem hoje |
| Biblioteca curada ("Conteúdo SigX": datas comemorativas, quiz, dicas de beleza, viralizou, você sabia, versículos) | Média — parecido com Canal DOOHPLAY | ❓ comparar profundidade e frequência de atualização |
| RSS com sugestões por categoria (geral, política, economia, tecnologia, saúde, jurídico, agronegócio) | Baixa/Média | 🔵 |
| Tipos avançados: Grafana, Power BI, HTML livre, URL em tela cheia, YouTube | Baixa — público corporativo | ⚪ (URL/YouTube talvez) |

## 3. Zonas, canais e agendamento

| Funcionalidade | Aplicabilidade | Status |
|---|---|---|
| **Editor de zonas** (grade, várias zonas, layout horizontal e vertical, rotação por zona) | Alta como diferencial | 🔵 corrigido em 27/09: o motor de zonas já existe no player (só o admin configura); o que falta é o **editor no dashboard do cliente** |
| Linha do tempo semanal por zona (arrastar blocos, agendar por dia/hora) | Média/Alta | 🔵 depende de zonas |
| Canais (agrupa playlists + zonas; "onde está sendo usado"; histórico de alterações) | Média | ⚪ modelo diferente do nosso |

## 4. Campanhas e relatórios

| Funcionalidade | Aplicabilidade | Status |
|---|---|---|
| Campanha com vigência, dias da semana, janela horária, cadência, prioridade, limite diário por tela, peso por conteúdo | Média — só faz sentido com anunciante real | 🔵 quando o primeiro anunciante entrar |
| Segmentação com "onde exibir" **e** "onde não exibir" (o filtro de exclusão sempre vence) | Média | 🔵 |
| Segmentação por ramo de atividade (lista fixa de ~20 ramos) | Média — temos `businessTypes.ts` | ✅ base já existe |
| Relatório de campanha: impressões por dia, distribuição por hora, **mapa de calor dia×hora**, tabela por tela | Média/Alta | 🔵 |
| **Relatório em PDF com a marca do cliente/revendedor** (white-label) | Alta — conecta com Media Connection Hub e com nossa geração de PDF certificado | 🔵 |
| Menu de relatórios: exibição de conteúdo, exibição de campanha, uptime da rede, uso de disco, exceções em telas, telas | Média | 🔵 |
| **Prova criptográfica de exibição** | — | ✅ **diferencial nosso; não aparece em nenhuma tela do SigX** |

## 5. Dashboard e experiência do painel

| Funcionalidade | Aplicabilidade | Status |
|---|---|---|
| Dashboard com **widgets que o usuário escolhe, remove e redimensiona** ("Editar painel"), com catálogo por categoria | Média — faz mais sentido no admin | 🔵 referência de arquitetura futura |
| Atualização automática configurável (5s/7s/9s) | Baixa | ⚪ |
| Feed de atividade recente (quem alterou o quê) | Média | 🔵 auditoria simples |
| Widgets: erros das telas, status das automações, resumo da assinatura (pagamento, próxima cobrança, limites) | Média — "resumo da assinatura" ajuda o cliente | 🔵 |
| Tema claro/escuro alternável | Baixa | 🔵 (temos tokens prontos) |
| Busca global (Ctrl+K) | Baixa | ⚪ |
| Mapa de telas online/offline | Baixa hoje (2 telas) | ⚪ |

## 6. Painel do cliente final (revenda / white-label)

| Funcionalidade | Aplicabilidade | Status |
|---|---|---|
| Painel do cliente **com marca do revendedor**, acessível por link com token (além de usuário/senha) | Alta se o Hub Media Connection avançar | 🔵 decisão de produto + segurança de token |
| Cliente envia mídia pelo painel e o operador **aprova** antes de ir ao ar | Média/Alta | ❓ confirmar se já existe fluxo de aprovação equivalente |
| Cliente cria avisos e vê calendário semanal dos avisos | — | ✅ (avisos feitos; calendário semanal ainda não) |
| Lista "Suas telas" com situação e último sinal | — | ✅ já temos |

## 7. Gestão da conta e suporte

| Funcionalidade | Aplicabilidade | Status |
|---|---|---|
| Usuários, equipes, perfis (permissões) | Baixa hoje | ⚪ quando houver time maior/revenda |
| Tarefas (kanban: planejando / pronto / fazendo / feito) ligadas a telas e clientes | Baixa | ⚪ (usamos STATUS_PROJETO.md) |
| Gatilhos / automações | Média | 🔵 não sei o escopo (só vi o nome no menu) |
| Menu de ajuda: ticket, suporte por WhatsApp, vídeos de ajuda, comunidade | Média — suporte é ponto forte de retenção | 🔵 |
| Roadmap público, "reportar um problema" | Baixa | ⚪ |
| Uso de disco/limites do plano visíveis ao cliente | Baixa hoje | ⚪ |

---

## Prioridade sugerida (só o que resolve problema real nosso)

1. Detecção de "início automático" + relatório de estado do dispositivo (pode explicar quedas)
2. Playlist automática de inadimplência (fecha o caso de cobrança sem cortar o serviço de forma abrupta)
3. Comandos remotos (reiniciar/capturar tela)
4. Relatório PDF com marca do cliente + mapa de calor (junto com nosso PDF certificado)
5. Aplicar de verdade vigência/horário do conteúdo do dono (bug já registrado; SigX tem isso funcionando)
6. Editor de zonas para o cliente (o motor já existe no player; decidir depois dos itens acima)

## Limites desta análise
- Baseada em prints, não em uso do produto; não sei como funcionam por baixo
  (ex.: como o SigX detecta a permissão de sobreposição, como entrega os comandos remotos).
- Itens marcados ❓ exigem conferir o que o DOOHPLAY já tem antes de qualquer decisão.
- "Gatilhos" e "Minha assinatura" só apareceram como itens de menu; não vi as telas.
