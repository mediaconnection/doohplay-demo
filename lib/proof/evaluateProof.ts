// @ts-nocheck
export function evaluateProof({
  event,
  chain,
  merkle,
  tsa,
  ledger,
  signature
}: any) {

  let score = 0;

  if (event) score += 20;
  if (chain) score += 20;
  if (merkle) score += 20;
  if (tsa) score += 15;
  if (ledger) score += 15;
  if (signature) score += 10;

  return score;

}
