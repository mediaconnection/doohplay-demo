
import Link from "next/link";

async function getTimeline(campaignId: string) {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/audit/campaign-timeline/${campaignId}`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function CampaignTimelinePage(
  { params }: { params: Promise<{ campaign_id: string }> }
) {

  const { campaign_id } = await params;

  const data = await getTimeline(campaign_id);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>

      <h1>Campaign Timeline</h1>

      <p>
        Cryptographic record of ad plays for campaign:
        <br />
        <code>{campaign_id}</code>
      </p>

      <hr/>

      {data.events.map((event: any) => {

        const timestamp = new Date(event.occurred_at).toLocaleString();

        return (

          <div
            key={event.event_id}
            style={{
              borderLeft: "3px solid #999",
              paddingLeft: 20,
              marginBottom: 20
            }}
          >

            <p>
              <b>{event.event_type}</b>
            </p>

            <p>
              {timestamp}
            </p>

            <p>
              <code>{event.event_hash}</code>
            </p>

            <Link href={`/ledger/event/${event.event_id}`}>
              view event
            </Link>

          </div>

        );

      })}

      <hr/>

      <Link href="/ledger">
        ← Back to Ledger
      </Link>

    </div>
  );
}