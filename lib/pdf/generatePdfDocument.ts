// @ts-nocheck
import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from "@react-pdf/renderer"

type Merkle = {
  root?: string
  proof?: string[]
}

type Anchor = {
  network?: string
  tx_hash?: string
  block?: number
  anchored?: boolean
}

type Payload = {
  subject_type: string
  subject_id: string
  subject?: {
    hash?: string
  }
  merkle?: Merkle
  anchor?: Anchor
  created_at?: string
}

type Certificate = {
  issuer: string
  subject?: string
  serial: string
  algorithm: string
  signed_at: string
}

type Tsa = {
  authority: string
  timestamp: string
}

export type GeneratePdfDocumentProps = {
  hash: string
  verifyUrl: string
  qrCode: string | null
  payload: Payload
  certificate: Certificate
  tsa?: Tsa | null
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff"
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: 10,
    color: "#666"
  },
  section: {
    marginBottom: 15
  },
  box: {
    border: "1px solid #e5e7eb",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fafafa"
  },
  label: {
    fontSize: 8,
    color: "#666",
    marginBottom: 4
  },
  value: {
    fontSize: 10,
    marginBottom: 4
  },
  small: {
    fontSize: 8,
    marginBottom: 2
  },
  qr: {
    width: 80,
    height: 80,
    marginTop: 10
  },
  signatureBox: {
    marginTop: 30,
    padding: 12,
    border: "2px solid #16a34a",
    borderRadius: 6,
    backgroundColor: "#ecfdf5"
  },
  verified: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 6
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999"
  }
})

const h = React.createElement

export function generatePdfDocument({
  hash,
  verifyUrl,
  qrCode,
  payload,
  certificate,
  tsa
}: GeneratePdfDocumentProps) {
  const safeHash = hash?.slice(0, 64) ?? "-"
  const shortHash = `${safeHash.slice(0, 16)}...`
  const proof = payload?.merkle?.proof ?? []
  const truncatedProof = proof.slice(0, 10)

  return h(
    Document,
    null,
    h(
      Page,
      { size: "A4", style: styles.page },
      h(
        View,
        { style: styles.header },
        h(Text, { style: styles.title }, "DOOHPLAY PROOF CERTIFICATE"),
        h(Text, { style: styles.subtitle }, "Digital Evidence & Verification Document")
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "CERTIFICATE HASH"),
        h(View, { style: styles.box }, h(Text, { style: styles.value }, safeHash))
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "SUBJECT"),
        h(
          View,
          { style: styles.box },
          h(Text, { style: styles.value }, `${payload?.subject_type ?? "-"} / ${payload?.subject_id ?? "-"}`)
        )
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "BLOCKCHAIN"),
        h(View, { style: styles.box }, h(Text, { style: styles.value }, payload?.anchor?.network ?? "N/A"))
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "VERIFY URL"),
        h(View, { style: styles.box }, h(Text, { style: styles.value }, verifyUrl)),
        qrCode ? h(Image, { src: qrCode, style: styles.qr }) : null
      ),

      h(
        View,
        { style: styles.signatureBox },
        h(Text, { style: styles.verified }, "✔ VERIFIED DOCUMENT"),
        h(Text, null, `Issuer: ${certificate?.issuer ?? "-"}`),
        h(Text, null, `Serial: ${certificate?.serial ?? "-"}`),
        h(Text, null, `Algorithm: ${certificate?.algorithm ?? "-"}`),
        h(Text, null, `Signed At: ${certificate?.signed_at ?? "-"}`),
        tsa ? h(Text, null, `TSA: ${tsa.authority}`) : null,
        tsa ? h(Text, null, `Timestamp: ${tsa.timestamp}`) : null,
        h(Text, { style: { marginTop: 6 } }, `Hash (short): ${shortHash}`)
      ),

      h(
        Text,
        { style: styles.footer },
        "This document is cryptographically signed and verifiable via QR Code."
      )
    ),

    h(
      Page,
      { size: "A4", style: styles.page },
      h(
        View,
        { style: styles.header },
        h(Text, { style: styles.title }, "TECHNICAL VERIFICATION REPORT"),
        h(Text, { style: styles.subtitle }, "Cryptographic Proof & Audit Trail")
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "SUMMARY"),
        h(
          View,
          { style: styles.box },
          h(
            Text,
            { style: styles.value },
            "This document certifies that the subject was hashed, included in a Merkle Tree and optionally anchored on blockchain."
          )
        )
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "MERKLE PROOF"),
        h(
          View,
          { style: styles.box },
          h(Text, { style: styles.value }, `Root: ${payload?.merkle?.root ?? "-"}`),
          h(Text, { style: styles.value }, `Leaf: ${payload?.subject?.hash ?? "-"}`),
          h(Text, { style: styles.value }, "Proof Path:"),
          ...truncatedProof.map((p, i) =>
            h(Text, { key: i, style: styles.small }, `${i + 1}. ${p}`)
          ),
          proof.length > 10
            ? h(Text, { style: styles.small }, `... truncated (${proof.length} nodes)`)
            : null
        )
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "BLOCKCHAIN ANCHOR"),
        h(
          View,
          { style: styles.box },
          h(Text, { style: styles.value }, `Network: ${payload?.anchor?.network ?? "N/A"}`),
          h(Text, { style: styles.value }, `Transaction: ${payload?.anchor?.tx_hash ?? "N/A"}`),
          h(Text, { style: styles.value }, `Block: ${payload?.anchor?.block ?? "N/A"}`),
          h(Text, { style: styles.value }, `Status: ${payload?.anchor?.anchored ? "CONFIRMED" : "NOT ANCHORED"}`)
        )
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "CERTIFICATE CHAIN"),
        h(
          View,
          { style: styles.box },
          h(Text, { style: styles.value }, `Issuer: ${certificate?.issuer ?? "-"}`),
          h(Text, { style: styles.value }, `Subject: ${certificate?.subject ?? "-"}`),
          h(Text, { style: styles.value }, `Serial: ${certificate?.serial ?? "-"}`),
          h(Text, { style: styles.value }, `Algorithm: ${certificate?.algorithm ?? "-"}`)
        )
      ),

      tsa
        ? h(
            View,
            { style: styles.section },
            h(Text, { style: styles.label }, "TIMESTAMP AUTHORITY (RFC 3161)"),
            h(
              View,
              { style: styles.box },
              h(Text, { style: styles.value }, `Authority: ${tsa.authority}`),
              h(Text, { style: styles.value }, `Timestamp: ${tsa.timestamp}`)
            )
          )
        : null,

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "AUDIT TRAIL"),
        h(
          View,
          { style: styles.box },
          h(Text, { style: styles.value }, `Generated At: ${payload?.created_at ?? "-"}`),
          h(Text, { style: styles.value }, `Verification URL: ${verifyUrl}`)
        )
      ),

      h(
        View,
        { style: styles.section },
        h(Text, { style: styles.label }, "LEGAL DISCLAIMER"),
        h(
          View,
          { style: styles.box },
          h(
            Text,
            { style: styles.small },
            "This document provides cryptographic proof of integrity. Independent verification should be performed using the hash and verification endpoint."
          )
        )
      )
    )
  )
}

export default generatePdfDocument
