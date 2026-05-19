import Link from "next/link";

export default function AuditPortalPage() {

  return (
    <main
      style={{
        padding: 40,
        fontFamily: "Arial, sans-serif",
        maxWidth: 900,
        margin: "0 auto",
        lineHeight: 1.6
      }}
    >

      <header>
        <h1>DOOHPLAY Public Audit Portal</h1>

        <p>
          This portal allows public verification of advertising events recorded
          in the DOOHPLAY cryptographic ledger.
        </p>
      </header>

      <hr />

      <section id="verification">

        <h2>Verification Tools</h2>

        <nav aria-label="Verification tools">
          <ul>

            <li>
              <Link href="/audit/explorer">
                Global Ledger Explorer
              </Link>
            </li>

            <li>
              <Link href="/ledger">
                Ledger Explorer
              </Link>
            </li>

            <li>
              <Link href="/verify">
                Verify Event
              </Link>
            </li>

            <li>
              <Link href="/audit/search">
                Universal Ledger Search
              </Link>
            </li>

          </ul>
        </nav>

      </section>

      <hr />

      <section id="transparency">

        <h2>Network Transparency</h2>

        <nav aria-label="Network transparency tools">
          <ul>

            <li>
              <Link href="/audit/dashboard">
                Ledger Analytics Dashboard
              </Link>
            </li>

            <li>
              <Link href="/audit/live">
                Live Event Stream
              </Link>
            </li>

            <li>
              <Link href="/audit/network">
                Network Transparency Map
              </Link>
            </li>

            <li>
              <Link href="/audit/campaign">
                Campaign Transparency
              </Link>
            </li>

            <li>
              <Link href="/audit/transparency">
                Public Transparency Report
              </Link>
            </li>

          </ul>
        </nav>

      </section>

      <hr />

      <section id="integrity">

        <h2>Security & Integrity</h2>

        <nav aria-label="Security tools">
          <ul>

            <li>
              <Link href="/audit/fraud">
                Fraud Detection Monitor
              </Link>
            </li>

          </ul>
        </nav>

      </section>

      <hr />

      <section id="cryptography">

        <h2>Cryptographic Proof</h2>

        <ul>

          <li>
            Merkle Proof verification (available from event pages)
          </li>

          <li>
            Campaign playback timeline (available from campaign verification)
          </li>

          <li>
            Cryptographic proof certificate (PDF generated per event)
          </li>

        </ul>

        <p style={{ fontSize: 14, opacity: 0.7 }}>
          Merkle proofs, campaign timelines and proof certificates are accessible
          from individual event verification pages.
        </p>

      </section>

      <hr />

      <footer
        style={{
          marginTop: 30,
          fontSize: 14,
          opacity: 0.7
        }}
      >

        DOOHPLAY uses a cryptographic ledger to guarantee transparency,
        integrity and verifiability of advertising playback events.

      </footer>

    </main>
  );
}