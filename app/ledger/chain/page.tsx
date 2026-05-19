import LedgerChain from "@/components/ledger/LedgerChain";

export default function LedgerChainPage() {

  return (

    <div style={{ padding: 40 }}>

      <h1>DOOHPLAY Ledger Chain</h1>

      <p>
        Visual representation of the cryptographic event ledger.
      </p>

      <LedgerChain />

    </div>

  );

}