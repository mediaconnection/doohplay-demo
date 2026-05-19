"use client";

interface ProofStatus {

  event_hash_valid?: boolean;
  block_valid?: boolean;
  merkle_valid?: boolean;
  chain_valid?: boolean;
  signature_valid?: boolean;

}

interface Props {
  proof: ProofStatus;
}

function Row({
  label,
  valid
}: {
  label: string;
  valid?: boolean;
}) {

  let color = "#888";
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

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0"
      }}
    >

      <span>{label}</span>

      <span
        style={{
          fontWeight: "bold",
          color
        }}
      >
        {text}
      </span>

    </div>

  );

}

export default function CryptographicProofPanel({
  proof
}: Props) {

  const overall =
    proof.event_hash_valid &&
    proof.block_valid &&
    proof.merkle_valid &&
    proof.chain_valid &&
    proof.signature_valid;

  return (

    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 6,
        padding: 20,
        marginTop: 30,
        background: "#fafafa"
      }}
    >

      <h3>Cryptographic Proof</h3>

      <Row
        label="Event Hash"
        valid={proof.event_hash_valid}
      />

      <Row
        label="Block Integrity"
        valid={proof.block_valid}
      />

      <Row
        label="Merkle Proof"
        valid={proof.merkle_valid}
      />

      <Row
        label="Chain Integrity"
        valid={proof.chain_valid}
      />

      <Row
        label="Signature"
        valid={proof.signature_valid}
      />

      <div
        style={{
          marginTop: 15,
          paddingTop: 10,
          borderTop: "1px solid #eee"
        }}
      >

        <strong>
          Overall Status:{" "}
          <span
            style={{
              color: overall ? "green" : "red"
            }}
          >
            {overall ? "Verified" : "Failed"}
          </span>
        </strong>

      </div>

    </div>

  );

}