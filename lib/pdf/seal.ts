// @ts-nocheck
export function buildSealText(hash: string) {
  return [
    "DOCUMENTO VERIFICADO — DOOHPLAY",
    `Hash: ${hash}`,
    "Verifique em: https://doohplay.com/verify/" + hash,
  ];
}
