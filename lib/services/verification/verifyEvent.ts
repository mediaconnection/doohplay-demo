import { verifyPkcs7 } from "@/lib/crypto/verifyPkcs7";
import { checkRevocation } from "@/lib/crypto/checkRevocation";

type VerifyEventInput = {
  hash: string;
  signature: string;
};

type VerifyEventResult = {
  valid: boolean;
  reason?: string;
  signer?: string;
  issuer?: string;
  serial?: string;
  trust?: "HIGH" | "MEDIUM" | "LOW";
};

export async function verifyEvent({
  hash,
  signature,
}: VerifyEventInput): Promise<VerifyEventResult> {

  /* =========================
     1. VERIFY SIGNATURE
  ========================= */

  const sig = verifyPkcs7(signature, hash);

  if (!sig.valid) {
    return {
      valid: false,
      reason: "INVALID_SIGNATURE",
    };
  }

  /* =========================
     2. CHECK REVOCATION
  ========================= */

  const revocation = await checkRevocation(sig.serial!);

  if (revocation.revoked) {
    return {
      valid: false,
      reason: "CERT_REVOKED",
    };
  }

  /* =========================
     3. TRUST SCORE (BASE)
  ========================= */

  let trust: "HIGH" | "MEDIUM" | "LOW" = "HIGH";

  // exemplo simples (você pode plugar IA depois)
  if (!sig.issuer?.includes("ICP")) {
    trust = "MEDIUM";
  }

  return {
    valid: true,
    signer: sig.signer ?? undefined,
    issuer: sig.issuer ?? undefined,
    serial: sig.serial ?? undefined,
    trust,
  };
}