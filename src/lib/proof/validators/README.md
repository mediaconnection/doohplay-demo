# ⚠️ Código morto — não editar

@deprecated — mesmo caso do `README.md` na pasta pai (`src/lib/proof/`): os
5 validators aqui (`evaluateProofStatus.ts`, `validateCertChain.ts`,
`validatePdfSignature.ts`, `validateRevocation.ts`, `validateTsaToken.ts`)
são inalcançáveis em runtime porque `next.config.ts` define alias de
webpack explícito (`"@/lib": path.resolve(__dirname, "lib")`) que resolve
`@/lib/proof/validators/*` sempre para `lib/proof/validators/*` (raiz),
nunca para este subdiretório de `src/`, mesmo com nomes de arquivo
idênticos.

Não editar nem estender aqui. Se precisar mexer nos validators de verdade,
é em `lib/proof/validators/` (raiz). Detalhes completos no README da pasta
pai.
