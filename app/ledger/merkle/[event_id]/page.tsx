
import { pool } from "@/lib/db";

async function getProof(eventId: string) {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/audit/merkle-proof/${eventId}`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function MerkleProofPage(
  { params }: { params: Promise<{ event_id: string }> }
) {

  const { event_id } = await params;

  const proof = await getProof(event_id);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>

      <h1>Merkle Proof</h1>

      <p>This page proves the inclusion of the event in the daily Merkle root.</p>

      <h2>Event Hash</h2>
      <code>{proof.event_hash}</code>

      <h2>Merkle Root</h2>
      <code>{proof.merkle_root}</code>

      <h2>Proof Path</h2>

      <ul>
        {proof.proof.map((p: string, i: number) => (
          <li key={i}>
            <code>{p}</code>
          </li>
        ))}
      </ul>

    </div>
  );
}