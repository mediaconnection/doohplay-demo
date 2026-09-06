# ⚠️ Código morto — não editar

@deprecated — mesmo critério já aplicado a outras árvores duplicadas/mortas
documentadas em `CLAUDE.md` e `STATUS_PROJETO.md`: código morto mantido,
não removido, só documentado.

Esta pasta (`lib/alerts/engine/`, raiz) e sua duplicata em
`src/lib/alerts/engine/` implementam o pipeline `evaluatePolicies →
enrichAlert → computeRiskScore → persistAlert → auditAlert`, que o
`CLAUDE.md` (seção "Trust Graph & Alerts") documentava como o "Alert
engine" ativo do projeto.

Investigação em 2026-09-06 (Fase 0 da extração de `packages/proof-engine`,
Etapa 2 do `DOOHPLAY_Plano_Separacao_Fronts.docx`) confirmou: **nenhuma das
5 funções desse pipeline (`evaluatePolicies`, `enrichAlert`,
`computeRiskScore`, `persistAlert`, `auditAlert`) tem consumidor real em
nenhum lugar do repositório** — a única outra ocorrência delas é a própria
menção no `CLAUDE.md`, agora corrigida.

**O pipeline de alertas que roda de fato em produção é outro**:
`lib/domain/alerts/*` (`detectAlerts.ts`, `shouldSendAlert.ts`,
`saveAlerts.ts`, `formatAlertMessage.ts`, `dispatch.ts`, `incidents.ts`),
chamado por `lib/queue/workers/blockWorker.ts` e `lib/queue/enqueueAlert.ts`.
Ver `CLAUDE.md` atualizado.

**Não editar nem estender esta pasta nem `src/lib/alerts/engine/`.** Se
precisar mexer em alertas, é em `lib/domain/alerts/`.
