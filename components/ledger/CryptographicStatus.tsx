"use client";

interface Props {
  verification: {
    event_hash_valid?: boolean;
    chain_valid?: boolean;
    merkle_valid?: boolean;
    signature_valid?: boolean;
  };
}

function StatusRow({
  label,
  valid
}: {
  label: string;
  valid?: boolean;
}) {

  let color = "#999";
  let text = "Unknown";

  if (valid === true) {
    color = "green";
    text = "Valid";
  }

  if (valid === false) {
    color = "red";
    text = "Invalid";
  }

  return (
    <div style={{ marginBottom: 5 }}>
      <span style={{ fontWeight: "bold" }}>
        {label}:
      </span>{" "}
      <span style={{ color }}>{text}</span>
    </div>
  );
}

export default function CryptographicStatus({
  verification
}: Props) {

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 15,
        marginTop: 30,
        borderRadius: 6,
        background: "#fafafa"
      }}
    >

      <h3>Cryptographic Verification</h3>

      <StatusRow
        label="Event Hash"
        valid={verification.event_hash_valid}
      />

      <StatusRow
        label="Chain Integrity"
        valid={verification.chain_valid}
      />

      <StatusRow
        label="Merkle Proof"
        valid={verification.merkle_valid}
      />

      <StatusRow
        label="Signature"
        valid={verification.signature_valid}
      />

    </div>
  );
}