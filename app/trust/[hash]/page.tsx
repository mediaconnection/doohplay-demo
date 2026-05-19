
import { notFound } from "next/navigation"

async function getGraph(hash: string) {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/trust/${hash}`,
    { cache: "no-store" }
  )

  if (!res.ok) return null

  const data = await res.json()

  if (!data.success) return null

  return data.graph

}

export default async function TrustPage({
  params
}: {
  params: { hash: string }
}) {

  const graph = await getGraph(params.hash)

  if (!graph) {
    notFound()
  }

  return (

    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        DOOH Trust Proof
      </h1>

      <section className="mb-6">
        <h2 className="font-semibold">Subject</h2>
        <p>ID: {graph.subject.id}</p>
        <p>Type: {graph.subject.type}</p>
        <p>Hash: {graph.subject.hash}</p>
      </section>

      {graph.screen && (
        <section className="mb-6">
          <h2 className="font-semibold">Screen</h2>
          <p>{graph.screen.id}</p>
        </section>
      )}

      {graph.campaign && (
        <section className="mb-6">
          <h2 className="font-semibold">Campaign</h2>
          <p>{graph.campaign.id}</p>
        </section>
      )}

      <section className="mb-6">
        <h2 className="font-semibold">Evidence</h2>

        {graph.evidence.map((e: any) => (
          <div key={e.id} className="border p-3 mb-2">
            <p>Type: {e.type}</p>
            <p>Hash: {e.hash}</p>
          </div>
        ))}

      </section>

      {graph.merkle && (
        <section className="mb-6">
          <h2 className="font-semibold">Merkle Proof</h2>
          <p>Leaf: {graph.merkle.leaf}</p>
          <p>Root: {graph.merkle.root}</p>
        </section>
      )}

      {graph.block && (
        <section className="mb-6">
          <h2 className="font-semibold">Ledger Block</h2>
          <p>Height: {graph.block.block_height}</p>
          <p>Hash: {graph.block.event_hash}</p>
        </section>
      )}

      {graph.anchor && (
        <section className="mb-6">
          <h2 className="font-semibold">Anchor</h2>
          <p>Network: {graph.anchor.network}</p>
          <p>TX: {graph.anchor.tx}</p>
        </section>
      )}

      {graph.certificate && (
        <section className="mb-6">
          <h2 className="font-semibold">Certificate</h2>
          <p>ID: {graph.certificate.certificate_id}</p>
          <p>Hash: {graph.certificate.hash}</p>
        </section>
      )}

    </div>

  )

}