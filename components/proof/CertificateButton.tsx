"use client"

export default function CertificateButton({
  hash,
  entity_id,
  entity_type
}: {
  hash: string
  entity_id: string
  entity_type: string
}) {

  async function handleDownload() {
    const res = await fetch("/api/certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        hash,
        entity_id,
        entity_type
      })
    })

    if (!res.ok) {
      alert("Failed to generate certificate")
      return
    }

    const blob = await res.blob()

    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `certificate-${entity_id}.pdf`

    document.body.appendChild(a)
    a.click()
    a.remove()

    window.URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-green-600 text-white rounded"
    >
      Download Certificate
    </button>
  )
}