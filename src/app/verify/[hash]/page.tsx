import { createClient } from "@supabase/supabase-js";

interface Props {
  params: {
    hash: string;
  };
}

export default async function VerifyPage({ params }: Props) {

  const hash = params.hash;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: event } = await supabase
    .from("display_events")
    .select("*")
    .eq("event_hash", hash)
    .maybeSingle();

  const { data: chain } = await supabase
    .from("proof_chain")
    .select("*")
    .eq("event_hash", hash)
    .maybeSingle();

  let batch: any = null;

  if (chain?.merkle_batch_id) {

    const { data } = await supabase
      .from("proof_merkle_batches")
      .select("*")
      .eq("id", chain.merkle_batch_id)
      .maybeSingle();

    batch = data;

  }

  if (!event) {

    return (
      <div style={{ padding: 40 }}>
        <h1>Proof not found</h1>
      </div>
    );

  }

  return (

    <div style={{ padding: 40, fontFamily: "sans-serif" }}>

      <h1>DOOHPLAY Proof Explorer</h1>

      <h2>Event</h2>

      <p><b>Campaign:</b> {event.campaign_id}</p>
      <p><b>Player:</b> {event.player_id}</p>
      <p><b>Location:</b> {event.location_id}</p>
      <p><b>Timestamp:</b> {event.played_at}</p>

      <h2>Cryptographic Proof</h2>

      <p><b>Event Hash:</b></p>
      <code>{hash}</code>

      <p><b>Chain Hash:</b></p>
      <code>{chain?.chain_hash}</code>

      <p><b>Merkle Root:</b></p>
      <code>{batch?.root_hash}</code>

      <p><b>TSA Timestamp:</b></p>
      <code>{batch?.tsa_time}</code>

      <h2>Certificate</h2>

      <a href={`/api/proof/export?hash=${hash}`}>
        Download Proof Certificate
      </a>

    </div>

  );

}