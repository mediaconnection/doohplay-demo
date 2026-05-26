export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server";
import { createCanonicalEvent } from "@/domain/events/createEvent";
import { gerarHashEvento } from "@/domain/events/hashEvent";
import { persistEvent } from "@/services/persistEvent";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("PROCESS EVENT: START");

    // 🔹 (opcional) payload futuro via body
    // const body = await request.json();

    // 🔹 1️⃣ Criar evento canônico
    const evento = createCanonicalEvent({
      event_type: "DOOH_EXECUTION",
      actor: { type: "SYSTEM", id: "dooh-engine" },
      context: {
        environment: "production",
        application: "dashboard-web",
      },
      payload: {
        screen_id: "SP-001",
        duration_seconds: 30,
      },
    });

    console.log("EVENT CREATED");

    // 🔹 2️⃣ Gerar hash criptográfico
    const contentHash = gerarHashEvento(evento);
    console.log("HASH:", contentHash);

    // 🔹 3️⃣ URL pública de verificação
    const proofUrl = `${process.env.SUPABASE_URL}/functions/v1/legal-proof/${contentHash}`;
    console.log("PROOF URL:", proofUrl);

    // 🔹 4️⃣ Campos jurídicos (preparado para A1/TSA)
    const timestampToken = "TSA_PENDING_REAL_INTEGRATION";

    // 🔹 5️⃣ Persistência jurídica
    const result = await persistEvent({
      contentHash,
      verificationStatus: "HASH_VALID_UNSIGNED",
      event: evento,
      issuedAt: new Date().toISOString(),
      proofUrl,
      immutable: true,
      isPublic: true,

      // 🔐 futuros (A1 / TSA)
      // signedHash,
      // certificateSerial,
      // certificateAuthority,
      // timestampToken,
    });

    console.log("PERSIST RESULT:", result);

    // 🔹 6️⃣ Resposta pública
    return NextResponse.json({
      status: "OK",
      hash: contentHash,
      verification_status: "HASH_VALID_UNSIGNED",
    });

  } catch (err) {
    console.error("🔥 PROCESS EVENT ERROR:", err);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}


