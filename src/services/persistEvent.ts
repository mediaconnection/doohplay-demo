// @ts-nocheck
import { supabase } from "@/lib/supabase";

export async function persistEvent(args: {
  contentHash: string;
  event: unknown;
  issuedAt: string;
  proofUrl: string;
  verificationStatus?: string;
  immutable?: boolean;
  isPublic?: boolean;
}) {
  console.log("INSERTING INTO SUPABASE:", args);

  const { error } = await supabase
    .from("digital_certifications")
    .insert({
      content_hash: args.contentHash,
      event: args.event,
      signed_hash: "SIGNATURE_PENDING",
      certificate_serial: "PENDING",
      certificate_authority: "PENDING",
      issued_at: args.issuedAt,
      proof_url: args.proofUrl
    });

  if (error) {
    console.error("❌ SUPABASE INSERT ERROR:", error);
    throw error;
  }

  return { status: "CREATED" };
}

