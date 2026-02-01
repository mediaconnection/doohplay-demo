import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { hash } = req.query;

  if (!hash || typeof hash !== "string") {
    return res.status(400).json({ error: "Missing hash" });
  }

  const { error } = await supabase
    .from("pdf_hashes")
    .update({
      status: "revoked",
      status_changed_at: new Date().toISOString(),
    })
    .eq("hash", hash);

  if (error) {
    return res.status(500).json({ error: "Failed to revoke" });
  }

  return res.redirect("/admin/reports");
}
