"use client"

import { useState } from "react"

type Props = {
  hash: string
  entity_id: string
  entity_type: string
}

export default function VerifyButton({
  hash,
  entity_id,
  entity_type
}: Props) {

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleVerify() {
    setLoading(true)

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({
          hash,
          entity_id,
          entity_type
        })
      })

      const data = await res.json()
      setResult(data)

    } catch (e) {
      setResult({ error: "VERIFY_FAILED" })
    }

    setLoading(false)
  }

  return (
    <div className="mt-6">

      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Verifying..." : "Verify Proof"}
      </button>

      {/* RESULT */}

      {result && (
        <div className="mt-4 p-4 border rounded text-sm">

          {/* STATUS */}

          <div className="mb-2">
            Status:{" "}
            <b
              className={
                result.valid
                  ? "text-green-600"
                  : result.pending
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {result.valid
                ? "VALID"
                : result.pending
                ? "PENDING"
                : "INVALID"}
            </b>
          </div>

          {/* DETAILS */}

          {result.details && (
            <div className="text-xs text-gray-600 space-y-1">
              <div>Signature: {String(result.details.signature_valid)}</div>
              <div>Timestamp: {String(result.details.timestamp_valid)}</div>
              <div>Expired: {String(result.details.expired)}</div>
            </div>
          )}

          {/* SOURCE */}

          {result.source && (
            <div className="text-xs text-gray-400 mt-2">
              Source: {result.source}
            </div>
          )}

        </div>
      )}
    </div>
  )
}