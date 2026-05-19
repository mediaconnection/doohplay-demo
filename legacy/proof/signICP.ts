import { signWithICPProvider } from "@/lib/integrations/icpProvider"

export async function signBlockHash(blockHash: string) {
  try {
    // 🔥 ICP real
    const result = await signWithICPProvider(blockHash)

    return {
      signature: result.signature,
      certificate: result.certificate,
      timestamp: result.timestamp,
      type: "ICP-Brasil"
    }

  } catch (err) {
    console.error("ICP failed, fallback local:", err)

    // fallback (nunca ideal em produção)
    return {
      signature: null,
      type: "fallback"
    }
  }
}