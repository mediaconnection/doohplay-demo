import type { VerificationResult } from "./types"

type Props = {
  result: VerificationResult | null | undefined
  className?: string
}

type MatrixItem = {
  key: string
  label: string
  value: boolean | null | undefined
  description: string
}

function statusBadge(value: boolean | null | undefined) {
  if (value === true) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }

  if (value === false) {
    return "border-rose-200 bg-rose-50 text-rose-700"
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-600"
}

function statusLabel(value: boolean | null | undefined) {
  if (value === true) return "Válido"
  if (value === false) return "Falha"
  return "N/A"
}

function hasNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function getTechnicalBool(
  result: VerificationResult,
  key: string
): boolean | null | undefined {
  const technical = result.explanation?.technical_details

  if (!technical || typeof technical !== "object") {
    return undefined
  }

  const value = technical[key]
  return typeof value === "boolean" ? value : undefined
}

function getComplianceBool(
  result: VerificationResult,
  key: string
): boolean | null | undefined {
  const compliance = result.explanation?.compliance

  if (!compliance || typeof compliance !== "object") {
    return undefined
  }

  const value = compliance[key]
  return typeof value === "boolean" ? value : undefined
}

function buildMatrix(result: VerificationResult): MatrixItem[] {
  const details = result.details
  const evidence = result.evidence

  const eventExists = details?.event_exists

  const hashValid =
    details?.event_hash_valid ??
    details?.hash_valid ??
    getTechnicalBool(result, "event_hash_valid") ??
    getTechnicalBool(result, "hash_valid")

  const chainValid =
    details?.chain_valid ??
    details?.chain?.valid ??
    getTechnicalBool(result, "chain_valid")

  const chainHead =
    details?.chain_head ??
    details?.chain?.is_chain_head ??
    getTechnicalBool(result, "chain_head")

  const merkleIncluded =
    details?.merkle_included ??
    details?.merkle_valid ??
    evidence?.merkle ??
    getTechnicalBool(result, "merkle_included") ??
    getTechnicalBool(result, "merkle")

  const merkleProofPresent =
    details?.merkle_proof_present ??
    details?.merkle_proof_valid ??
    getTechnicalBool(result, "merkle_proof_valid")

  const merkleRootValid =
    details?.merkle_root_valid ??
    getTechnicalBool(result, "merkle_root_valid") ??
    (hasNonEmptyString(details?.block_merkle_root) ||
    hasNonEmptyString(details?.merkle?.merkle_root)
      ? true
      : undefined)

  const blockExists =
    details?.block_exists ??
    details?.block?.exists ??
    evidence?.ledger ??
    getTechnicalBool(result, "block_exists")

  const blockMerkleMatches =
    details?.block_merkle_matches ??
    getTechnicalBool(result, "block_merkle_matches")

  const anchored =
    details?.anchored ??
    evidence?.anchoring ??
    getTechnicalBool(result, "anchored")

  const txHashValid =
    details?.tx_valid ??
    details?.tx_hash_format_valid ??
    getTechnicalBool(result, "tx_hash_format_valid")

  const certificateFound =
    details?.certificate_found ??
    details?.certificate?.found ??
    getTechnicalBool(result, "certificate_present")

  const certificateValid =
    details?.certificate_valid ??
    details?.certificate?.valid ??
    getComplianceBool(result, "certificate_valid") ??
    getTechnicalBool(result, "certificate_valid")

  const certChainValid =
    details?.cert_chain_valid ??
    details?.certificate?.cert_chain_valid ??
    getTechnicalBool(result, "cert_chain_valid")

  const noRevocationKnown =
    details?.certificate_revoked === true
      ? false
      : details?.certificate_revoked === false
        ? true
        : details?.certificate?.revoked === true
          ? false
          : details?.certificate?.revoked === false
            ? true
            : getTechnicalBool(result, "revoked") === true
              ? false
              : getTechnicalBool(result, "revoked") === false
                ? true
                : null

  const timestampValid =
    details?.timestamp_token_present ??
    details?.timestamp_valid ??
    evidence?.timestamp_token ??
    getTechnicalBool(result, "timestamp_valid") ??
    getTechnicalBool(result, "timestamp_token_present")

  const signaturePresent =
    details?.signature_present ??
    evidence?.signature ??
    getTechnicalBool(result, "signature_present")

  const signatureValidated =
    details?.signature_valid ??
    getTechnicalBool(result, "signature_valid") ??
    getComplianceBool(result, "signature_valid")

  const blockchainValid =
    details?.blockchain_valid ??
    getTechnicalBool(result, "blockchain") ??
    (anchored === true && txHashValid === true
      ? true
      : anchored === false || txHashValid === false
        ? false
        : anchored ?? undefined)

  const crossLayerConsistent = result.metadata?.cross_layer_consistent

  return [
    {
      key: "event_exists",
      label: "Evento localizado",
      value: eventExists,
      description: "Confirma se o registro foi encontrado no ledger."
    },
    {
      key: "hash_valid",
      label: "Hash consistente",
      value: hashValid,
      description: "Verifica se o hash consultado corresponde ao evento recuperado."
    },
    {
      key: "chain_valid",
      label: "Encadeamento íntegro",
      value: chainValid,
      description: "Valida a continuidade estrutural com o evento anterior."
    },
    {
      key: "chain_head",
      label: "Ponta da cadeia",
      value: chainHead,
      description: "Indica se o evento atual é a ponta conhecida do encadeamento."
    },
    {
      key: "merkle_included",
      label: "Inclusão Merkle",
      value: merkleIncluded,
      description: "Confirma se o evento participa de uma estrutura Merkle."
    },
    {
      key: "merkle_proof_present",
      label: "Prova Merkle",
      value: merkleProofPresent,
      description: "Indica se a prova Merkle material está disponível."
    },
    {
      key: "merkle_root_valid",
      label: "Merkle root",
      value: merkleRootValid,
      description: "Verifica presença consistente da raiz Merkle."
    },
    {
      key: "block_exists",
      label: "Bloco localizado",
      value: blockExists,
      description: "Confirma se há bloco associado no ledger local."
    },
    {
      key: "block_merkle_matches",
      label: "Merkle do bloco confere",
      value: blockMerkleMatches,
      description: "Compara a Merkle do evento com a Merkle do bloco associado."
    },
    {
      key: "anchored",
      label: "Âncora blockchain",
      value: anchored,
      description: "Confirma a existência de ancoragem em blockchain ou evidência equivalente."
    },
    {
      key: "tx_hash_valid",
      label: "TX hash",
      value: txHashValid,
      description: "Valida o formato do identificador de transação associado."
    },
    {
      key: "certificate_found",
      label: "Certificado encontrado",
      value: certificateFound,
      description: "Indica se há evidência de certificado associada."
    },
    {
      key: "certificate_valid",
      label: "Certificado válido",
      value: certificateValid,
      description: "Reflete a validade conhecida do certificado."
    },
    {
      key: "cert_chain_valid",
      label: "Cadeia do certificado",
      value: certChainValid,
      description: "Avalia a integridade da cadeia do certificado."
    },
    {
      key: "certificate_not_revoked",
      label: "Sem revogação conhecida",
      value: noRevocationKnown,
      description: "Mostra se não há indício conhecido de revogação do certificado."
    },
    {
      key: "timestamp_valid",
      label: "Timestamp confiável",
      value: timestampValid,
      description: "Confirma presença de timestamp confiável associado."
    },
    {
      key: "signature_present",
      label: "Assinatura presente",
      value: signaturePresent,
      description: "Mostra se existe assinatura vinculada ao evento."
    },
    {
      key: "signature_valid",
      label: "Assinatura validada",
      value: signatureValidated,
      description: "Mostra o resultado conhecido da validação formal da assinatura."
    },
    {
      key: "blockchain_valid",
      label: "Integridade blockchain",
      value: blockchainValid,
      description: "Consolida âncora e consistência mínima da transação."
    },
    {
      key: "cross_layer_consistent",
      label: "Consistência cross-layer",
      value: crossLayerConsistent,
      description: "Valida se ICP, Merkle e Blockchain permanecem estruturalmente consistentes entre si."
    }
  ]
}

export function VerificationMatrix({
  result,
  className
}: Props) {
  if (!result) return null

  const items = buildMatrix(result)

  return (
    <section
      className={[
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        className ?? ""
      ].join(" ")}
    >
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Matriz de verificação
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Consolidação visual dos principais controles de integridade, prova e auditoria.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.key}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {item.label}
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              </div>

              <span
                className={[
                  "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold",
                  statusBadge(item.value)
                ].join(" ")}
              >
                {statusLabel(item.value)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}