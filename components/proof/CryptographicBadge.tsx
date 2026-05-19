interface Props {
  hashValid?: boolean;
  chainValid?: boolean;
  merkleValid?: boolean;
  blockchainTx?: string | null;
}

export function CryptographicBadge({
  hashValid = true,
  chainValid = true,
  merkleValid = false,
  blockchainTx
}: Props) {

  const blockchainValid = Boolean(blockchainTx);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        background: "#f8fafc",
        marginBottom: 24
      }}
    >
      <h3 style={{ marginBottom: 12 }}>
        🔐 DOOHPLAY Cryptographic Proof
      </h3>

      <ul style={{ lineHeight: "1.8em" }}>

        <li>
          {hashValid ? "✔" : "❌"} Hash válido
        </li>

        <li>
          {chainValid ? "✔" : "❌"} Cadeia de evidências íntegra
        </li>

        <li>
          {merkleValid ? "✔" : "⚠️"} Merkle Proof
        </li>

        <li>
          {blockchainValid ? "✔" : "⚠️"} Blockchain Anchor
        </li>

      </ul>

      {blockchainValid && (
        <p style={{ marginTop: 10 }}>
          <strong>TX:</strong>{" "}
          <code>{blockchainTx}</code>
        </p>
      )}
    </div>
  );
}