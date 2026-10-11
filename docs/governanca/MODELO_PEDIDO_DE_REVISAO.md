# Modelo fixo de pedido de revisão — revisor-agent

Todo pedido ao `revisor-agent` usa este modelo, sem acrescentar blocos. Ele
existe para a sessão principal não repassar justificativa por engano: o
revisor recebe **diff, escopo, critérios e fatos** e mais nada (plano de
governança v3, seção 9.1).

Copie o bloco abaixo, preencha e envie como o pedido inteiro.

```text
# PEDIDO DE REVISÃO — revisor-agent

## 1. DIFF
- Repositório/pasta:
- Intervalo de commits (base..alvo):
- Comando para ver: git diff <base>..<alvo>
- Arquivos alterados (lista):

## 2. ESCOPO
- O que a mudança deve fazer:
- Fora de escopo (não avaliar):

## 3. CRITÉRIOS DE ACEITE
- [ ] critério verificável 1
- [ ] critério verificável 2
- Comandos de verificação permitidos: (ex.: npx vitest run, npx tsc --noEmit)

## 4. FATOS (verificados; sem justificativa)
- Decisões vigentes do fundador que se aplicam (com data):
- Contratos que não podem quebrar (ex.: docs/api-contract.md, regra N):
- Estado atual relevante (tabelas, colunas, rotas, quem consome):
- Restrições do ambiente (ex.: só existe produção; as TVs leem a playlist sem sessão):
```

## O que NÃO entra no pedido

- Por que a solução foi escolhida, ou o que foi tentado antes.
- Alternativas descartadas.
- Relatório, resumo ou conclusão do implementador.
- Frases como "já testei e passou" ou qualquer opinião sobre a qualidade.

Fato é o que foi verificado no código, no banco, no deploy ou em decisão
registrada. Se a frase explica uma escolha, é justificativa e fica de fora.

## Conferência antes de enviar

- [ ] Só os quatro blocos estão preenchidos.
- [ ] Nenhuma frase explica o porquê de uma escolha de implementação.
- [ ] Os critérios de aceite são verificáveis por comando ou por leitura do diff.
- [ ] Nenhum segredo, token ou dado pessoal de cliente no texto.

## Limite reconhecido

Implementador e revisor são ambos Claude: a independência é parcial. Mudança
de risco **alto** continua exigindo revisão externa (outra ferramenta ou outra
pessoa) antes da aprovação do fundador. O revisor recomenda APROVAR, CORRIGIR
ou REDESENHAR; quem autoriza a publicação é o fundador.
