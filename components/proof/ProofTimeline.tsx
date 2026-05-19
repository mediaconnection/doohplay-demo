interface Evidence {
  id: string
  hash: string
  type: string
  created_at: string
  pdf_url?: string
  previous_hash?: string
}

interface Props {
  evidences: Evidence[]
}

export function ProofTimeline({ evidences }: Props) {

  return (

    <div style={{ marginTop: 20 }}>

      {evidences.map((e, index) => (

        <div
          key={e.id}
          style={{
            display: "flex",
            marginBottom: 20,
            alignItems: "flex-start"
          }}
        >

          {/* Linha */}
          <div
            style={{
              width: 10,
              marginRight: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >

            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#1a7f37"
              }}
            />

            {index !== evidences.length - 1 && (
              <div
                style={{
                  width: 2,
                  height: 40,
                  background: "#ccc"
                }}
              />
            )}

          </div>

          {/* Conteúdo */}

          <div>

            <div style={{ fontWeight: 600 }}>
              {formatType(e.type)}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#555"
              }}
            >
              {new Date(e.created_at).toLocaleString("pt-BR")}
            </div>

            <div
              style={{
                fontSize: 12,
                marginTop: 4,
                wordBreak: "break-all",
                color: "#777"
              }}
            >
              {e.hash}
            </div>

          </div>

        </div>

      ))}

    </div>

  )

}

function formatType(type: string) {

  switch (type) {

    case "report":
      return "📄 Relatório gerado"

    case "hash":
      return "🔐 Hash criptográfico"

    case "signature":
      return "🖊 Assinatura digital"

    case "proof":
      return "📦 Registro de evidência"

    default:
      return type
  }

}