export function evaluateProofCryptography({
  hashValid,
  chainValid,
  tsaValid,
  signatureValid,
  anchored
}: any) {

  let score = 0;

  if (hashValid) score += 20;
  if (chainValid) score += 20;
  if (tsaValid) score += 30;
  if (signatureValid) score += 15;
  if (anchored) score += 15;

  return score;
}