"use client"

import { useMemo, useState, type CSSProperties, type FormEvent } from "react"
import { useRouter } from "next/navigation"

/* =========================
   HELPERS
========================= */

function normalizeHash(value: string): string {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isValidHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value)
}

/* =========================
   PAGE
========================= */

export default function VerifySearchPage() {
  const [hash, setHash] = useState("")
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()

  const normalizedHash = useMemo(() => normalizeHash(hash), [hash])
  const hasValue = normalizedHash.length > 0
  const hashIsValid = isValidHash(normalizedHash)

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched(true)

    if (!hashIsValid) return

    setSubmitting(true)
    router.push(`/verify/${normalizedHash}`)
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>DOOHPLAY Verify</div>

        <h1 style={styles.title}>🔍 Verificar evento</h1>

        <p style={styles.subtitle}>
          Insira o hash do evento para validar autenticidade, integridade
          criptográfica e evidências de prova pública.
        </p>

        <form onSubmit={handleSearch} style={styles.form} noValidate>
          <input
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Cole o hash do evento (64 hex ou 0x...)"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={touched && hasValue && !hashIsValid}
            aria-describedby="verify-hash-help verify-hash-error"
            style={{
              ...styles.input,
              ...(touched && hasValue && !hashIsValid
                ? styles.inputError
                : null)
            }}
            disabled={submitting}
          />

          <button
            type="submit"
            style={{
              ...styles.button,
              ...((!hashIsValid || submitting) ? styles.buttonDisabled : null)
            }}
            disabled={!hashIsValid || submitting}
          >
            {submitting ? "Abrindo..." : "Verificar"}
          </button>
        </form>

        <div id="verify-hash-help" style={styles.helpText}>
          Formato esperado: 64 caracteres hexadecimais. Prefixo <code>0x</code>{" "}
          é aceito.
        </div>

        {touched && hasValue && !hashIsValid ? (
          <div id="verify-hash-error" style={styles.errorText}>
            Hash inválido. Informe um SHA-256 com 64 caracteres hexadecimais.
          </div>
        ) : null}
      </div>
    </main>
  )
}

/* =========================
   STYLES
========================= */

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    background: "#f8fafc",
    fontFamily: "Arial, sans-serif"
  },

  card: {
    width: "100%",
    maxWidth: 760,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 32,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
  },

  badge: {
    display: "inline-block",
    marginBottom: 16,
    padding: "6px 12px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.3
  },

  title: {
    fontSize: 32,
    margin: "0 0 10px 0",
    color: "#0f172a"
  },

  subtitle: {
    color: "#475569",
    margin: "0 0 24px 0",
    lineHeight: 1.6
  },

  form: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap"
  },

  input: {
    flex: "1 1 420px",
    padding: "14px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    fontSize: 15,
    outline: "none"
  },

  inputError: {
    border: "1px solid #dc2626",
    background: "#fef2f2"
  },

  button: {
    padding: "14px 20px",
    background: "#111827",
    color: "#ffffff",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14
  },

  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed"
  },

  helpText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 13
  },

  errorText: {
    marginTop: 10,
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: 600
  }
}