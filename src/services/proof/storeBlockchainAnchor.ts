
import { supabaseServer } from "@/lib/supabaseServer";

export async function storeBlockchainAnchor(params: {
  baseHash: string;
  otsBuffer: Buffer;
}) {
  const path = `anchors/${params.baseHash}.ots`;

  const { error } = await supabaseServer.storage
    .from("reports")
    .upload(path, params.otsBuffer, {
      contentType: "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}