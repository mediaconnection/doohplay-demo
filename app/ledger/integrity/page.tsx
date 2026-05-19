export const dynamic = "force-dynamic";

import { checkLedgerIntegrity } from "@/lib/services/ledgerIntegrityService";

export default async function LedgerIntegrityPage() {

  const result = await checkLedgerIntegrity();

  return (
    <div style={{ padding: 40 }}>

      <h1>Ledger Integrity</h1>

      {result.valid ? (

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#e8f5e9",
            border: "1px solid #4caf50"
          }}
        >
          ✔ Ledger chain is valid
        </div>

      ) : (

        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#ffebee",
            border: "1px solid #f44336"
          }}
        >
          ✖ Ledger integrity failure

          <pre style={{ marginTop: 10 }}>
            {JSON.stringify(result, null, 2)}
          </pre>

        </div>

      )}

    </div>
  );

}