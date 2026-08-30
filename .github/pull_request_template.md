## Checklist DOOHPLAY (obrigatório)

### 1. Isolamento de fronts
- [ ] Este PR altera apenas UM front (`app/` OU `src/` + `doohplay-contract/`)
- [ ] Confirmei que não há arquivos do outro front neste PR

### 2. Contrato de API
- [ ] Não há mudança de contrato de playlist/heartbeat/proof-of-play
- [ ] Se houver mudança de contrato: `docs/api-contract.md` foi atualizado ANTES do código
- [ ] Se afetar Android/player: a mudança foi comunicada explicitamente

### 3. Impacto em produção
- [ ] Este PR NÃO afeta o cliente BARBE332 / Barbearia Zimermam
- [ ] Se afetar: houve aprovação humana explícita antes do merge
- [ ] Tabelas tocadas foram listadas no PR

### 4. Qualidade
- [ ] Descrevi o plano de validação (teste manual ou automatizado)
- [ ] Não incluí credenciais, chaves privadas ou `.env`
- [ ] A mudança é reversível ou tem plano de rollback

### 5. Resumo
- Front afetado: `app` / `src` / `docs` / `infra`
- Risco para produção: `Baixo` / `Médio` / `Alto`
- Precisa de review de alguém do outro front? `Sim` / `Não`
