// Rota de diagnóstico temporária -- confirma se SUPABASE_URL e
// NEXT_PUBLIC_SUPABASE_URL apontam pro mesmo valor em produção, sem
// nunca expor o valor em si (só comparação booleana + comprimento).
// Será removida assim que a checagem terminar.
export async function GET() {
  const a = process.env.SUPABASE_URL
  const b = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Response.json({
    supabaseUrlDefined: !!a,
    nextPublicSupabaseUrlDefined: !!b,
    equal: a === b,
    lenA: a?.length ?? null,
    lenB: b?.length ?? null,
  })
}
