import LedgerGraph from "@/components/ledger/LedgerGraph";

export default function LedgerGraphPage() {

  return (
    <div style={{ padding: 40 }}>

      <h1>Ledger Graph</h1>

      <p>
        Visual representation of the DOOHPLAY ledger chain.
      </p>

      <LedgerGraph />

    </div>
  );

}