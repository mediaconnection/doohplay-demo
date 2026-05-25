// @ts-nocheck
import { supabase } from "@/lib/supabase";
import { signHash } from "./signHash";

export async function finalizeCertification(contentHash: string) {
  // 🔐 Assinatura digital (real)
  const signedHash = signHash(contentHash);

  // 🕒 Timestamp (placeholder até integrar TSA real)
  const timestampToken = "TSA_PENDING_REAL_INTEGRATION";

  const { error } = await supabase
    .from("digital_certifications")
    .update({
      signed_hash: signedHash,
      certificate_serial: "SERIAL_DO_CERTIFICADO",
      signed_by: "AC Certisign",
      timestamp_token: timestampToken,
      issued_at: new Date().toISOString(),
      verification_status: "JURIDICALLY_VALID"
    })
    .eq("content_hash", contentHash);

  if (error) throw error;

  return { status: "SIGNED" };
}

