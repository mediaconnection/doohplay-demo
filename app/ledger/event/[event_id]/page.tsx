export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";

import CryptographicStatus from "@/components/ledger/CryptographicStatus";

import {
  getLedgerEvent,
  verifyLedgerEvent
} from "@/lib/services/ledgerService";

function shortHash(hash?: string | null) {

  if (!hash) return "-";

  if (hash.length <= 20) return hash;

  return hash.slice(0, 20) + "...";

}

function formatTimestamp(value?: string | Date | null) {

  if (!value) return null;

  const date =
    typeof value === "string"
      ? new Date(value)
      : value;

  if (isNaN(date.getTime())) return null;

  return date.toLocaleString();

}

export default async function EventPage({
  params
}: {
  params: { event_id: string };
}) {

  const event = await getLedgerEvent(
    params.event_id
  );

  if (!event) {
    notFound();
  }

  const timestamp =
    formatTimestamp(event.occurred_at);

  const verification =
    verifyLedgerEvent(event);

  return (

    <div style={{ padding: 40 }}>

      <h1>Ledger Event</h1>

      <div>
        <b>Event ID</b>
        <br />
        <code>{event.event_id}</code>
      </div>

      <div>
        <b>Type</b>
        <p>{event.event_type}</p>
      </div>

      {timestamp && (
        <div>
          <b>Timestamp</b>
          <p>{timestamp}</p>
        </div>
      )}

      {event.block_height != null && (
        <div>
          <b>Block</b>
          <br />
          <Link
            href={`/ledger/block/${event.block_height}`}
          >
            #{event.block_height}
          </Link>
        </div>
      )}

      {event.event_hash && (
        <div>
          <b>Event Hash</b>
          <br />
          <code>{shortHash(event.event_hash)}</code>
        </div>
      )}

      <CryptographicStatus
        verification={verification}
      />

      <div style={{ marginTop: 40 }}>
        <Link href="/ledger">
          Back to ledger
        </Link>
      </div>

    </div>

  );

}