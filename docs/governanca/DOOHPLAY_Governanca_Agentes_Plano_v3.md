DOOHPLAY · GOVERNANÇA DE AGENTES

Plano de transição e execução no Claude/Claude Code
Versão 3 · revisada com o contexto real das ferramentas conectadas · 11 de outubro de 2026

> **VERSÃO VIGENTE.** Única versão do plano no repositório. As versões 1 e 2 são **OBSOLETAS**: não foram encontradas em arquivo (busca em 11/10/2026 em `C:\DOOHPLAY`, Downloads, Desktop e Documentos), então não há arquivo para marcar; se aparecerem, recebem o cabeçalho OBSOLETO apontando para este documento.
>
> **Correções do fundador (11/10/2026) — prevalecem sobre o texto original e já estão aplicadas abaixo:**
> 1. A tabela 5.1 separa **bloqueio técnico** (o que o `settings.json` impede de fato), **filtro por texto do comando** (ajuda, mas pode ser contornado) e **procedimento do agente** (nenhuma configuração impede).
> 2. A troca do `ADMIN_SECRET` **não depende** do Passo 3. A ordem é mantida como recomendação.
> 3. O Passo 3 inclui, no mesmo commit, as 2 chamadas internas e o script do Canal, passando o segredo por cabeçalho.
>
> Acrescentado na aplicação: o modelo fixo de pedido de revisão (`MODELO_PEDIDO_DE_REVISAO.md`) e o registro do que foi aplicado (`APLICACAO_2026-10-11.md`), nesta mesma pasta.

1 · O que mudou nesta versão
A versão 1 desenhou o estado-alvo e o apresentou como plano de execução. A versão 2 corrigiu o momento: um único aprovador, agentes por gatilho, fonte canônica única. A versão 3 corrige a proteção, que estava na porta errada.

Os bloqueios deixam de ser só sobre git. As operações perigosas reais passaram pelas ferramentas do Supabase e do Render, não pelo versionamento.
Push passa a exigir confirmação, não proibição, preservando o fluxo que já funciona.
Regras impossíveis de cumprir foram substituídas por regras executáveis.
Trabalhar em branch sem CI foi suspenso até existir CI, por ser burocracia sem benefício.
A independência do revisor foi qualificada como parcial, com revisão externa obrigatória em alto risco.
Princípio: regra que não pode ser cumprida vira regra ignorada. Restrição que não corresponde ao caminho real da ação não protege nada.

2 · Contexto real do projeto
Equipe: o fundador.
Clientes pagantes em produção: dois.
Infraestrutura: um projeto Supabase que é produção; push no master publica direto no Render.
Não existe ambiente de homologação isolado. Toda verificação roda contra o ambiente real.
O Documento-Mestre único vive no repositório e existe para evitar a fragmentação que já causou regressões.
Existem 139 permissões pré-aprovadas no settings.local.json, acumuladas por escolhas de "não perguntar novamente".
O Claude Code opera no Windows e usa tanto Bash quanto PowerShell.
Ferramentas conectadas ao Supabase e ao Render têm capacidade de migração, SQL, deploy e alteração de variáveis.
Consequência: proteger apenas o git deixa descoberto o caminho por onde as alterações mais graves efetivamente passaram.

3 · Modelo de governança
text


FUNDADOR
  -> único aprovador de estratégia, orçamento, risco e operações irreversíveis

CLAUDE
  -> orquestra, classifica risco, consolida e mantém rastreabilidade
  -> não aprova a própria recomendação

AGENTES ESPECIALISTAS
  -> produzem planos, PRDs, designs ou implementação

REVISOR
  -> recebe diff, escopo, critérios e fatos; revisa sem herdar o raciocínio do implementador

REGRAS TÉCNICAS (settings.json)
  -> bloqueiam ou exigem confirmação para git, Supabase, Render e shell

GITHUB + DOCUMENTO-MESTRE
  -> fonte canônica de código e do estado do projeto
Princípios obrigatórios
Uma IA principal por tarefa; especialistas adicionais apenas quando o risco justificar.
Quem implementa não revisa; quem coordena não aprova a própria recomendação.
Toda ação irreversível exige aprovação explícita do fundador para aquela operação específica.
Restrições reais ficam em configuração técnica e cobrem todas as ferramentas capazes de executar a ação.
Regra que não pode ser cumprida no ambiente atual não deve ser escrita; deve ser substituída por uma equivalente executável.
Fato, hipótese, decisão, proposta e dúvida devem ser explicitamente distinguidos.
O fluxo é proporcional ao risco; tarefa trivial não passa por conselho completo.
Segredos e dados pessoais não entram em prompts, logs de agente ou arquivos de instrução.
4 · Etiquetagem de informação
Etiqueta	Significado	Exemplo
FATO	Verificado no código, banco, deploy ou métrica	Tela BARBE332 está em produção
HIPÓTESE	Plausível, ainda não testada	O parceiro aceitaria R$ 59/mês
DECISÃO	Aprovada pelo fundador, com responsável e data	Comissão inicial de 65/35
PROPOR	Sugestão em análise	Criar operacoes-player-agent
DÚVIDA	Informação ausente que bloqueia avanço	Custo real por visita técnica
Regra: um relatório sem etiquetas é um relatório que não pode ser usado para decidir.

5 · Restrições técnicas obrigatórias
Esta é a mudança de maior impacto. Proibição escrita no prompt é um pedido; regra no settings.json é um bloqueio. E a regra precisa cobrir cada ferramenta capaz de executar a ação, não apenas o caminho mais óbvio.

5.1 Cobertura por ferramenta
A coluna **Tipo** diz o que cada regra consegue de fato (correção do fundador, 11/10/2026):
- **BLOQUEIO**: o `settings.json` impede ou obriga a confirmar, pelo nome da ferramenta. Não depende do agente.
- **FILTRO**: regra por texto do comando no shell. Cobre a forma usual do comando e pode ser contornada por outra forma (a própria documentação do Claude Code avisa que não é fronteira de segurança).
- **PROCEDIMENTO**: nenhuma configuração impede. Vale pelo procedimento da seção 11 e pela conduta do agente.

| Ferramenta | Ação | Regra | Tipo | Motivo |
|---|---|---|---|---|
| git | push | Perguntar | FILTRO | Padrões `git push *` e `git * push *` (este cobre `git -C <pasta> push`), em Bash e PowerShell |
| git | commit local | Permitir | BLOQUEIO (liberação) | Commit local não publica nada; o push é o que publica |
| Supabase | aplicar migração | Perguntar | BLOQUEIO | Altera estrutura do banco de produção |
| Supabase | executar SQL | Perguntar sempre | BLOQUEIO | A mesma chamada lê e escreve; negar inviabiliza a investigação |
| Supabase | SQL destrutivo (drop, delete, truncate) | Contagem antes + aprovação | PROCEDIMENTO | A configuração não lê o texto do SQL; o "perguntar sempre" da linha acima é a única trava técnica |
| Supabase | criar/apagar/mesclar branch, pausar/restaurar projeto, edge function, segredo | Negar | BLOQUEIO | Nunca por agente |
| Render | disparar deploy | Negar | BLOQUEIO | Nunca deve ser acionado por agente |
| Render | alterar variáveis de ambiente | Negar | BLOQUEIO | Afeta credenciais e configuração de produção |
| Render | criar serviço, cron, banco, Redis | Negar | BLOQUEIO | Gera custo e infraestrutura nova |
| Shell (Bash) | comandos destrutivos | Perguntar | FILTRO | `rm`, `git reset`, `git clean`, `git rebase`, `prisma db push/migrate` |
| Shell (PowerShell) | comandos destrutivos | Perguntar | FILTRO | `Remove-Item`, `Stop-Process` e os mesmos de git |
| Arquivos | leitura de `.env` e `keys/` pela ferramenta de leitura | Negar | BLOQUEIO | Segredos fora do contexto do agente |
| Arquivos | leitura de `.env` pelo shell (`cat`, `Get-Content`) | Negar | FILTRO | Só pega a forma usual do comando |
| Navegador (Claude in Chrome) | agir com os logins do fundador | Perguntar | BLOQUEIO | Acrescentado na auditoria: o navegador alcança admin, Render, Cloudflare e Asaas |
| Externo | envio de mensagem a cliente | Não fazer sem aprovação | PROCEDIMENTO | Não existe ferramenta de mensagem para negar; o envio acontece dentro do site (rotas de produção) |
| Financeiro | pagamento, cobrança, repasse | Não executar | PROCEDIMENTO | Idem: acontece por rotas do site e pelo Asaas, não por uma ferramenta bloqueável |
| revisor-agent | editar o código sob revisão | Não fazer | PROCEDIMENTO | Para rodar testes ele precisa de shell, e shell consegue editar arquivo |
5.2 Por que perguntar, e não negar
Com negar no push, a publicação deixa de acontecer pelo agente e passa a exigir terminal manual a cada vez.
Com perguntar, o agente para e pede confirmação — exatamente o comportamento que já funcionou na prática.
Negar fica reservado ao que nunca deve acontecer por agente: deploy no Render, alteração de variáveis de ambiente, leitura de .env.
5.3 Aviso operacional
Crítico: na tela de confirmação, nunca escolher "Yes, and don't ask again" para ações de escrita, deploy, migração, SQL ou push. Foi assim que as 139 permissões se acumularam.

5.4 Revisão das 139 permissões
Listar todas as permissões vigentes e classificar: essencial, tolerável, remover.
Remover qualquer permissão persistente de push, migração, SQL de escrita, deploy e alteração de configuração.
Manter apenas leitura, edição de arquivos do projeto e execução de testes/build.
Registrar a configuração final no repositório, auditável.
5.5 Testes no ambiente real
A regra anterior — "testes automatizados nunca apontam para produção" — era impossível de cumprir, porque só existe produção. A regra executável é:

Testes unitários usam dados simulados e não tocam nenhum ambiente.
Testes contra o site real fazem somente leitura.
Quando precisarem escrever, criam e apagam registros TESTE_ dentro do próprio teste.
Testes de autorização (401/403) contra o site real são permitidos e necessários, por serem somente leitura.
5.6 Operações destrutivas
A regra anterior — "operações destrutivas só sobre TESTE_" — era absoluta demais: a restauração do LeMelo alterou dados reais e estava correta.

Padrão: operações destrutivas só sobre registros TESTE_. Exceção: dado real segue o procedimento da seção 11: descrever, contar, aprovar, executar e registrar.

6 · Configuração do Claude orquestrador
Prompt-base
text


Você é o Orquestrador Operacional da DOOHPLAY.

Sua função é:
1. Ler o objetivo e o estado canônico do projeto no repositório.
2. Classificar domínio, impacto, reversibilidade e risco.
3. Identificar somente os especialistas necessários.
4. Distinguir fato, hipótese, decisão, proposta e dúvida.
5. Apontar conflitos entre pareceres.
6. Preparar recomendação para o fundador.
7. Após aprovação, criar ou atualizar os artefatos necessários.
8. Encaminhar implementação somente com escopo e critérios de aceite.
9. Exigir evidência antes de registrar algo como concluído.

Você não pode:
- aprovar sua própria recomendação;
- tratar saída de agente como fato sem evidência;
- declarar conclusão porque código foi gerado;
- convocar todos os agentes para toda tarefa;
- sobrescrever decisões anteriores sem registro;
- contornar restrições do settings.json;
- executar ação irreversível sem contagem e aprovação prévias.

Toda demanda começa por um cartão de roteamento e termina
com um relatório de saída etiquetado.
Cartão de roteamento
text


# Classificação
- Domínio:
- Risco: BAIXO | MEDIO | ALTO | CRITICO
- Reversível: sim | não
- Afeta produção: sim | não
- Afeta dados reais: sim | não
- Ferramenta envolvida: git | Supabase | Render | shell | outra
- Impacto financeiro:

# Roteamento
- Agente principal:
- Agentes consultivos:
- Revisor:
- Aprovação do fundador necessária: sim | não
- Contagem prévia exigida: sim | não
- Artefato esperado:
- Evidência de conclusão:
7 · Agentes: decisão por agente
Agente	Decisão	Escopo	Gatilho
arquiteto-agent	Ajustar agora	Arquitetura, contratos, ADRs e riscos; não implementa	Imediato
codigo-agent	Ajustar agora	Implementação com testes; commit local permitido, push sob confirmação	Imediato
docs-produto-agent	Ajustar agora	Documentação rastreável por evidência e status	Imediato
designer-agent	Ajustar agora	Fluxos, estados, previews e integração com Figma	Imediato
financeiro-agent	Renomear agora	finops-agent: custos e limites técnicos, somente leitura	Imediato
revisor-agent	Criar agora	Revisão independente do diff, sem herdar raciocínio do implementador	Prioridade máxima
produto-agent	Criar agora	Converte decisão aprovada em PRD executável	Alta
qa-agent	Criar por gatilho	Testes funcionais, integração e cenários de falha	Antes do piloto pago
seguranca-agent	Criar por gatilho	Threat model, autorização, segredos e scanners	Antes do piloto pago
financeiro-negocio-agent	Criar por gatilho	Unit economics, preços, comissões e caixa	Antes de definir preço/comissão
operacoes-player-agent	Criar por gatilho	Hardware, offline, cache, OTA e suporte de campo	Se a operação de campo se tornar recorrente
Gatilho: um agente de gatilho não é criado por calendário. É criado quando a condição descrita acontece de fato.

8 · Especificação dos agentes da fase atual
8.1 arquiteto-agent
Missão: analisar o repositório real e propor arquitetura, limites de domínio, contratos, migração e riscos. Não escreve código.

Consultar decisões vigentes e o Documento-Mestre antes de propor mudanças.
Declarar fatos verificados e incertezas, usando as etiquetas da seção 4.
Apresentar alternativas em mudanças estruturais.
Definir domínios donos dos dados, não apenas pastas ou telas.
Entregar plano incremental, compatibilidade, rollback, riscos e testes exigidos.
Não introduzir serviço novo sem justificar custo operacional.
8.2 codigo-agent
Missão: implementar uma demanda aprovada no produto ou no motor de prova, nunca em ambos na mesma tarefa.

Exigir escopo, fora de escopo, critérios de aceite e classificação de risco.
Commit local no master é permitido nesta fase; o commit fica na máquina e não publica.
Push exige confirmação do fundador, conforme a seção 5.
Adicionar testes junto da mudança e executar build/lint/testes relevantes.
Não alterar migration destrutiva, produção, pagamentos, mensagens ou credenciais sem o procedimento da seção 11.
Ao encontrar risco de produção não previsto, interromper e pedir aprovação.
Não ampliar escopo silenciosamente.
Suspenso: trabalhar em branch separada fica adiado até existir CI e proteção de branch. Sem elas, a branch só acrescenta um passo manual de integração.

8.3 docs-produto-agent
Missão: manter documentação coerente com decisões, repositório, testes, deploys e telemetria.

Não elevar status sem evidência.
Documento-Mestre no repositório permanece a fonte canônica única.
Material comercial usa somente capacidades PRODUCAO_VERIFICADA.
Nunca usar alegações absolutas sem evidência registrada.
Status	Significado	Evidência mínima
PROPOSTO	Ideia ainda não aprovada	Documento ou parecer
APROVADO	Decisão do fundador registrada	Registro de decisão com data
EM_IMPLEMENTACAO	Trabalho em andamento	Commit local ou alteração em curso
IMPLEMENTADO_NAO_VERIFICADO	Código criado sem comprovação final	Alteração aplicada, sem verificação
HOMOLOGADO	Critérios validados fora de produção	Testes e aceite
PRODUCAO_VERIFICADA	Funcionamento observado em produção	Push, telemetria e métrica
OBSOLETO	Não representa o estado vigente	Decisão substituta
8.4 designer-agent
Missão: produzir especificações e protótipos fiéis ao design system, aos papéis de usuário e aos dados realmente disponíveis.

Usar tokens de lib/theme.ts e componentes existentes.
Cobrir loading, vazio, erro, sem permissão, offline, dados atrasados, estimados e demonstração.
Incluir responsividade, acessibilidade, eventos analíticos e critérios visuais.
Nunca inventar número, métrica ou fonte de dados.
Todo cartão financeiro/operacional informa período, última atualização e natureza: real, estimado ou demonstração.
8.5 financeiro-agent renomeado para finops-agent
Missão: monitorar custos e limites técnicos de Render, Supabase, Upstash, storage, mensageria e APIs de IA, em modo somente leitura.

Medir custo por tela ativa, mil eventos, GB entregue, campanha e feature de IA.
Produzir forecast de 30, 60 e 90 dias, anomalias e limites próximos.
Não trocar plano, comprar crédito, desligar serviço, alterar configuração ou executar cobrança.
9 · Agentes da fase atual
9.1 revisor-agent - prioridade máxima
Missão: revisar de forma independente o que foi implementado, sem herdar os pontos cegos de quem implementou.

Recebe apenas: o diff, o escopo, os critérios de aceite e os fatos arquiteturais relevantes.
Não recebe o raciocínio, a justificativa nem o relatório do implementador.
Fatos arquiteturais são permitidos — decisão vigente, contrato de API, estado atual — porque sem eles a revisão rejeita mudanças corretas. Justificativa é o que deve ser omitida.
Permissão padrão: leitura e execução de testes. Não edita o código sob revisão.
Verificar regressão, autorização, isolamento entre clientes, idempotência, concorrência, integridade, migrations, rollback, comportamento offline e observabilidade.
Classificar bloqueadores e achados altos, médios e baixos.
Recomendar APROVAR, CORRIGIR ou REDESENHAR; nunca aprovar a publicação.
Limite reconhecido: como o implementador e o revisor são ambos Claude, a independência é parcial. Mudanças de alto risco continuam exigindo revisão externa, feita em outra ferramenta ou por outra pessoa.

text


## Bloqueadores
## Falhas funcionais
## Falhas de segurança
## Casos não testados
## Riscos operacionais
## Divergências com o escopo
## Fatos arquiteturais considerados
## Evidências analisadas
## Recomendação: APROVAR | CORRIGIR | REDESENHAR
9.2 produto-agent
Missão: impedir que uma conversa estratégica vá direto ao código.

Problema, evidências, resultado esperado, escopo e fora de escopo.
Jornada, regras de negócio, casos de erro, métricas e critérios de aceite.
Dependências, riscos e necessidade de validação com cliente real.
Não altera código e não aprova a própria proposta.
10 · Agentes por gatilho
Não criar antecipadamente. Cada um entra quando a condição descrita acontecer.

qa-agent
Gatilho: antes do piloto pago, ou quando um fluxo crítico precisar de teste sistemático.

Cobrir finanças, isolamento entre clientes, offline/reconexão, duplicidade e fronteira teste/produção.
Pode criar testes; não corrige código funcional na mesma tarefa.
seguranca-agent
Gatilho: antes do piloto pago, ou antes de abrir acesso administrativo a terceiros.

Análise de autenticação, autorização, RLS, IDOR, segredos, webhooks, uploads, dependências e chaves do player.
Somente leitura e scanners; nunca explorar produção.
financeiro-negocio-agent
Gatilho: antes de definir preço, comissão, plano de assinatura ou modelo de repasse.

Cenários conservador, base e otimista, com premissas, fontes e sensibilidade.
Não aprova preço, comissão ou tratamento fiscal.
operacoes-player-agent
Gatilho: se os incidentes de TV e player se tornarem recorrentes a ponto de exigir runbook contínuo.

Alternativa: resolver os casos atuais com runbook e testes, sem criar agente novo.
Se criado: hardware, cache, offline, watchdog, kiosk, OTA, instalação, reposição e telemetria.
11 · Permissões e ação irreversível
Agente	Leitura	Escrita	Externo
arquiteto-agent	Repositório e ADRs	Plano/ADR proposto	Nenhum
produto-agent	Decisões e evidências	PRDs	Nenhum
designer-agent	PRD, tema, componentes	Specs e previews	Figma controlado
codigo-agent	Repositório e demanda	Arquivos do projeto	Nenhum (push sob confirmação)
revisor-agent	Diff, escopo, critérios, fatos	Relatório	Executa testes localmente
docs-produto-agent	Evidências aprovadas	Documentação	Nenhum
finops-agent	Faturas e métricas	Relatórios	APIs somente leitura
qa-agent (gatilho)	Código e docs	Arquivos de teste	Somente leitura no real
seguranca-agent (gatilho)	Código e config sanitizada	Relatório	Scanners
financeiro-negocio-agent (gatilho)	Dados agregados	Cenários	Nenhum
operacoes-player-agent (gatilho)	Telemetria e runbooks	Runbooks	Frota de teste
Procedimento para ação irreversível
Algumas operações são legítimas e necessárias, mas não podem ser automáticas. Para qualquer uma delas:

Descrever exatamente a operação.
Apresentar a contagem de registros afetados ANTES de executar.
Delimitar o escopo, sempre preferindo registros TESTE_.
Aguardar aprovação explícita do fundador para aquela operação.
Registrar o que foi removido ou alterado.
text


Aplicam-se a esta regra:
- apagamento de dados (inclusive limpeza de TESTE_)
- restauração ou correção de dados reais
- migração que altera ou remove estrutura
- alteração de configuração de serviço
- rotação de chave ou credencial
- exclusão de mídia em produção
- qualquer operação com efeito financeiro
12 · Fluxos de trabalho
Descoberta
text


Problema -> evidências -> especialistas necessários -> alternativas -> hipótese -> decisão do fundador -> escopo aprovado
Entrega
text


Escopo aprovado -> design -> arquitetura quando necessário -> codigo-agent -> revisor-agent -> aprovação do fundador -> push autorizado -> verificação -> documentação atualizada
Ponto de controle: o commit é local; o push é o que publica e exige confirmação do fundador.

Exemplo: ajuste de dashboard
Fundador descreve o problema.
Claude classifica e roteia.
produto-agent define escopo e critérios de aceite.
designer-agent especifica estados e protótipo.
codigo-agent implementa e faz commit local.
revisor-agent revisa o diff, sem receber a justificativa do implementador.
Fundador autoriza o push.
docs-produto-agent atualiza status com evidência.
Exemplo: operação irreversível
text


Agente identifica necessidade
-> descreve a operação
-> mostra contagem de registros
-> fundador aprova explicitamente
-> executar
-> registrar o que mudou
13 · Classificação de risco
Risco	Exemplos	Fluxo mínimo
Baixo	Texto, documentação, estilo isolado	Agente principal → build/testes → revisão simples
Médio	Dashboard, relatório, agendamento sem dinheiro	Produto → design → código → revisor
Alto	Pagamento, RLS, proof-of-play, migração, player	Especialistas → escopo → código → revisor → revisão externa → aprovação do fundador
Crítico	Comissões, tributação, dados sensíveis, pagamento em massa	Análise de IA → validação profissional → decisão do fundador; sem execução autônoma
14 · Evidência e portões
Aplicar agora
Build e lint.
Testes existentes nos fluxos alterados.
Revisão independente do diff pelo revisor-agent.
Restrições de confirmação e negação no settings.json, cobrindo git, Supabase, Render e shell.
Aprovação do fundador para push e operação irreversível.
Aplicar antes do piloto pago
Branch protection no GitHub e CI obrigatória.
Ambiente de homologação isolado, quando o custo se justificar.
Testes de autorização e isolamento entre clientes.
Plano de rollback e canário.
Suítes críticas do projeto
Campanha não ativa sem pagamento confirmado e aprovação.
Um cliente nunca acessa dados de outro.
Webhook repetido não duplica cobrança, crédito ou repasse.
Proof-of-play repetido não duplica entrega.
Exclusão de mídia reconcilia banco e storage de forma idempotente.
Nenhum dado TESTE_ contamina métrica real.
Acesso administrativo exige sessão e permissão válidas.
Nenhum teste escreve em produção fora do padrão da seção 5.5.
15 · Fonte canônica
Não se cria segunda fonte de verdade. O Documento-Mestre dentro do repositório permanece único, pelo motivo que a própria decisão original registra: fragmentação em múltiplos documentos gerou regressões.

Código, decisões, ADRs e estado do projeto: repositório.
Governança de agentes: docs/governanca/ no repositório.
Versão 1 deste plano: marcada como OBSOLETO, com cabeçalho apontando para a versão vigente. Não mantida como fonte ativa e não apagada, para preservar o registro da substituição.
Interface: Figma, vinculado à demanda correspondente, sem duplicar regra de negócio.
Estado real: telemetria e dados de produção.
16 · Ordem de execução
Esta ordem foi ajustada para encaixar a governança nas pendências reais do projeto, e não em exercícios artificiais.

Passo 1 - Restrições técnicas
Rápido, e protege tudo o que vem depois. Deve ser o primeiro.

Listar as 139 permissões do settings.local.json.
Classificar cada uma em essencial, tolerável ou remover.
Aplicar as regras da seção 5.1, cobrindo git, Supabase, Render, Bash e PowerShell.
Registrar a configuração final no repositório.
Passo 2 - revisor-agent
Criar revisor-agent com permissão de leitura e execução de testes.
Definir o formato de revisão da seção 9.1.
Usar como primeiro trabalho real a revisão da remoção do ?secret= nas rotas administrativas.
Passo 3 - Correção do acesso administrativo
Aplicar a remoção do ?secret= nas rotas administrativas que ainda o aceitam (cerca de 40; levantamento no Documento-Mestre 12.63).
No MESMO commit (correção do fundador, 11/10/2026): as 2 chamadas internas (cadastro -> /api/admin/network-partnerships/suggest e onboarding -> /api/finance/asaas) e o script do Canal (scripts/gerar-canal-doohplay/subir-para-admin.js) passam a mandar o segredo por cabeçalho, e não pela URL.
Critério de aceite obrigatório: cadastro e onboarding continuam funcionando, com teste cobrindo os dois.
Commit local e revisão pelo revisor-agent, usando o MODELO_PEDIDO_DE_REVISAO.md.
Push autorizado pelo fundador.
Confirmar que o acesso por query string não funciona mais.

Passo 4 - Troca do ADMIN_SECRET
Recomendação de ordem, não dependência (correção do fundador, 11/10/2026): o login do admin não usa o ADMIN_SECRET (usa ADMIN_EMAIL, ADMIN_PASSWORD e NEXTAUTH_SECRET) e as chamadas internas leem a variável do próprio serviço no Render. Trocar o valor antes do Passo 3 não derruba o acesso administrativo; só o script local do Canal precisa do valor novo.
A troca é feita pelo fundador no Render (alterar variável de ambiente é negado aos agentes).
Executar pelo procedimento de ação irreversível da seção 11.
Registrar a rotação.
Passo 5 - produto-agent e ajuste dos cinco agentes
Criar produto-agent.
Renomear financeiro-agent para finops-agent.
Atualizar os prompts conforme as seções 8 e 9.
Incluir etiquetas de informação e status com evidência.
Passo 6 - Normalização de testes
Aplicar a regra da seção 5.5.
Garantir confirmação explícita para operações destrutivas.
17 · Prompt para iniciar no Claude
text


Leia o plano de governança de agentes da DOOHPLAY (versão 3).

Sua primeira tarefa NÃO é implementar. Faça uma auditoria somente leitura:
1. liste os arquivos que definem agentes, permissões e hooks;
2. liste as permissões ativas, destacando push, SQL, migração, deploy,
   alteração de variáveis e leitura de .env;
3. liste quais ferramentas conectadas conseguem executar escrita
   (Supabase, Render, shell Bash e PowerShell);
4. liste os prompts atuais dos cinco agentes;
5. identifique o que já está aderente ao plano;
6. aponte conflitos e regras impossíveis de cumprir no ambiente atual;
7. proponha, em ordem, as alterações mínimas desta fase:
   restrições técnicas, revisor-agent, produto-agent,
   ajuste dos cinco agentes atuais.

Depois da minha aprovação, gere instruções separadas para o Claude Code
executar apenas a primeira alteração. Não autorize push, deploy,
alteração de produção, credenciais, pagamentos ou mensagens reais.
18 · Critérios de aceite desta fase
As restrições cobrem git, Supabase, Render e shell — não apenas git.
Push e SQL pedem confirmação; deploy e alteração de variáveis são negados.
Nenhuma regra escrita é impossível de cumprir no ambiente atual.
Nenhum agente consegue publicar, apagar ou executar operação financeira sem aprovação.
Existe revisor-agent operando sem receber a justificativa do implementador.
A independência parcial do revisor está registrada, com revisão externa em alto risco.
Só existe uma versão vigente do plano no repositório, com a anterior marcada como OBSOLETO.
Nenhuma demanda chega ao codigo-agent sem escopo e critérios de aceite.
Documentação usa status com evidência.
Tarefa trivial continua rápida; tarefa de alto risco passa por revisão e aprovação.
19 · Decisão final
A direção permanece: separação de responsabilidades, revisão independente e evidência. Nesta fase, o ganho maior não vem de novos agentes nem de mais documentação, mas de duas coisas concretas: impedir tecnicamente que qualquer ferramenta execute algo irreversível, e garantir que quem implementa não valide o próprio trabalho. O restante entra por gatilho.

Ordem imediata: 1) restrições técnicas cobrindo git, Supabase, Render e shell; 2) revisor-agent; 3) correção do ?secret= com revisão real; 4) push e depois troca do ADMIN_SECRET; 5) produto-agent e ajuste dos cinco; 6) homologação, CI e branch protection antes do piloto pago.
