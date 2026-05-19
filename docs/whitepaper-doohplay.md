3️⃣ Whitepaper — Conteúdo completo (v1.0)
Abaixo já está texto real, não rascunho.

WHITEPAPER — DOOHPLAY
Sistema de Prova Digital Criptograficamente Verificável

1. Introdução
O DOOHPLAY é uma plataforma de Digital Out-Of-Home (DOOH) que incorpora, nativamente, um sistema de prova digital juridicamente verificável, projetado para comprovar a exibição de conteúdos publicitários de forma auditável, imutável e independente.
Este documento descreve, em detalhes técnicos e jurídicos, o funcionamento do sistema de prova adotado, permitindo sua validação por peritos, auditores, advogados, cartórios e autoridades judiciais.

2. Contexto jurídico da prova digital
A prova digital moderna exige:
Integridade do conteúdo


Autenticidade da autoria


Comprovação temporal


Cadeia de custódia


Possibilidade de verificação independente


O sistema DOOHPLAY foi desenhado para atender esses requisitos sem depender de confiança subjetiva na plataforma, adotando padrões criptográficos amplamente aceitos.

3. Princípios técnicos adotados
O sistema baseia-se nos seguintes princípios:
Determinismo: mesmos dados → mesmo resultado


Imutabilidade: qualquer alteração é detectável


Encadeamento: cada prova depende da anterior


Idempotência: a prova não se altera ao ser recriada


Verificabilidade pública: terceiros podem auditar



4. Arquitetura geral do sistema
A arquitetura de prova é composta por múltiplas camadas independentes:
Logs brutos de exibição


Relatório consolidado determinístico


Hash criptográfico (SHA-256)


Evidences encadeadas


PDF institucional verificável


Assinatura digital ICP-Brasil


Timestamp confiável (RFC 3161)


Âncora em blockchain


Manifesto jurídico final


Assinatura e LTV do manifesto



5. Geração do relatório determinístico
Os logs de exibição são normalizados e consolidados de forma determinística, garantindo que o mesmo conjunto de dados gere sempre o mesmo relatório, independentemente de data ou ambiente de execução.
Campos voláteis (como timestamps de geração) são excluídos antes da etapa criptográfica.

6. Hash criptográfico e imutabilidade
O relatório consolidado é submetido a um hash SHA-256, resultando no hash raiz (baseHash), que representa univocamente o conteúdo da prova.
Qualquer modificação, mesmo mínima, resulta em um hash completamente diferente.

7. Evidences e cadeia de custódia
Cada artefato gerado cria uma evidence, registrada de forma imutável e encadeada à evidence anterior.
Isso cria uma cadeia de custódia digital, onde cada elo depende criptograficamente do anterior.

8. PDF institucional verificável
O relatório é convertido em um PDF institucional contendo:
Resumo da exibição


Hash criptográfico


URL pública de verificação


QR Code de acesso direto


Este PDF é projetado para leitura humana e apresentação formal.

9. Assinatura digital ICP-Brasil
O PDF é assinado digitalmente com certificado A1, conforme os padrões da ICP-Brasil, garantindo:
Autenticidade do emissor


Não repúdio


Integridade do documento



10. Timestamp confiável (RFC 3161)
Após a assinatura, é aplicado um timestamp confiável conforme RFC 3161, emitido por uma Autoridade de Carimbo do Tempo (TSA).
Isso comprova que o documento existia naquela forma em um momento específico, impedindo retrodatação.

11. Âncora em blockchain (OpenTimestamps)
O hash raiz é ancorado em blockchain pública via OpenTimestamps, criando uma prova de existência externa e independente da plataforma DOOHPLAY.

12. Manifesto jurídico (manifest.json)
Todas as evidences são consolidadas em um manifesto JSON contendo:
Hash raiz


Período analisado


Evidences


URLs públicas


Relações de encadeamento


Este manifesto funciona como um laudo técnico estruturado.

13. Assinatura + LTV do manifesto
O manifesto é convertido em PDF, assinado digitalmente e submetido a Long-Term Validation (LTV), garantindo sua validade jurídica mesmo após expiração de certificados.
Este é o artefato jurídico final do sistema.

14. Verificação pública e CLI pericial
O DOOHPLAY disponibiliza:
Página pública de verificação por hash


CLI offline de verificação pericial


Qualquer terceiro pode validar a prova sem depender da plataforma.

15. Aderência jurídica e validade probatória
O sistema atende aos requisitos de:
Prova documental


Prova técnica


Cadeia de custódia


Verificação independente


Sendo compatível com práticas periciais e judiciais contemporâneas.

16. Limitações e garantias
O sistema garante integridade e autenticidade a partir da coleta dos logs, não podendo atestar eventos que não tenham sido registrados.

17. Conclusão
O DOOHPLAY implementa um sistema de prova digital robusto, auditável e juridicamente defensável, alinhado às melhores práticas criptográficas e periciais atuais.

