// Componente TrialBanner — adicionar no dashboard-client.tsx
// Coloque após os imports existentes e use dentro do componente principal

"use client"

import { useState, useEffect } from "react"

interface TrialInfo {
  trial: boolean
  days_left: number
  plan: string
  value: number
  status: string
}

export function TrialBanner({ code }: { code: string }) {
  const [trial, setTrial] = useState<TrialInfo | null>(null)

  useEffect(() => {
    fetch(`/api/client/trial/${code}`)
      .then(r => r.json())
      .then(data => setTrial(data))
      .catch(() => {})
  }, [code])

  if (!trial || !trial.trial) return null

  const isUrgent = trial.days_left <= 1
  const isWarning = trial.days_left <= 2

  const bg    = isUrgent  ? "#450a0a" : isWarning ? "#431407" : "#052e16"
  const border= isUrgent  ? "#ef444433" : isWarning ? "#f59e0b33" : "#16653433"
  const color = isUrgent  ? "#EF4444" : isWarning ? "#F59E0B" : "#4ade80"
  const icon  = isUrgent  ? "⚠️" : isWarning ? "⏰" : "🎁"

  const message = trial.days_left === 0
    ? "Seu período grátis termina hoje! A cobrança começa amanhã."
    : trial.days_left === 1
    ? "Último dia do seu período grátis. A cobrança começa amanhã."
    : `Você tem ${trial.days_left} dias grátis restantes.`

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: "14px 20px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color }}>
            {message}
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            Após o período, cobramos R$ {Number(trial.value).toFixed(2).replace(".", ",")} /mês via PIX ou boleto · Cancele quando quiser
          </div>
        </div>
      </div>
      {isWarning && (
        <a
          href={`https://wa.me/5511999999999?text=Oi! Sou ${code} e quero continuar com o DOOHPLAY`}
          target="_blank"
          rel="noreferrer"
          style={{
            background: color,
            color: "white",
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Falar com suporte
        </a>
      )}
    </div>
  )
}
