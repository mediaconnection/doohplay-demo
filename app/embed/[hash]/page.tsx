import { verifyHash } from "@/lib/domain/proof/service"

export default async function EmbedPage({
  params,
}: {
  params: { hash: string }
}) {

  const data = await verifyHash(params.hash)
  const valid = data?.valid

  return (
    <div style={{
      margin: 0,
      fontFamily: "Arial",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh"
    }}>
      <a
        href={`/proof/${params.hash}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          borderRadius: "6px",
          fontSize: "12px",
          textDecoration: "none",
          border: "1px solid",
          background: valid ? "#e6fffa" : "#ffe6e6",
          color: valid ? "#007f5f" : "#a80000",
          borderColor: valid ? "#b2f5ea" : "#ffc1c1"
        }}
      >
        <span>{valid ? "✔" : "✖"}</span>

        {valid
          ? "Verified by DOOHPLAY"
          : "Not verified"}
      </a>
    </div>
  )
}