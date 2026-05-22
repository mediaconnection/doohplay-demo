import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import {
  Document,
  Page,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

import { signPdfWithA1 } from "@/services/signatures/signPdfWithA1";
import { supabaseServer } from "@/lib/supabaseServer";
import { createEvidence } from "@/services/evidences/createEvidence";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "bold",
  },
  mono: {
    fontFamily: "Courier",
    fontSize: 9,
    marginBottom: 4,
  },
});

export async function signManifestPdf(params: {
  baseHash: string;
  manifest: any;
  relatedEvidenceId: string;
}) {
  // 1️⃣ Renderiza MANIFESTO como PDF
  const pdfElement = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Manifesto Jurídico da Prova Digital — DOOHPLAY
        </Text>

        {Object.entries(params.manifest).map(([key, value]) => (
          <Text key={key} style={styles.mono}>
            {key}: {JSON.stringify(value)}
          </Text>
        ))}
      </Page>
    </Document>
  );

  const pdfBuffer = await renderToBuffer(pdfElement);

  const path = `proof/${params.baseHash}/manifest.pdf`;

  await supabaseServer.storage
    .from("reports")
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  const { data: publicUrl } = supabaseServer.storage
    .from("reports")
    .getPublicUrl(path);

  // 2️⃣ Assina o PDF com A1
  const { signedPdfUrl, signedEvidence } =
    await signPdfWithA1({
      pdfUrl: publicUrl.publicUrl,
      baseHash: `${params.baseHash}:manifest`,
      relatedEvidenceId: params.relatedEvidenceId,
    });

  return {
    manifestPdfUrl: signedPdfUrl,
    manifestPdfEvidence: signedEvidence,
  };
}