// @ts-nocheck
export function detectFraudSignals({
  revoked,
  signatureValid,
  chainValid,
  anchored
}: {
  revoked: boolean
  signatureValid: boolean
  chainValid: boolean
  anchored: boolean
}) {
  const flags: string[] = []

  if (revoked) flags.push("CRITICAL_CERT_REVOKED")

  if (!signatureValid && chainValid) {
    flags.push("TAMPERED_SIGNATURE")
  }

  if (!anchored && chainValid && signatureValid) {
    flags.push("OFFCHAIN_ONLY")
  }

  return flags
}
