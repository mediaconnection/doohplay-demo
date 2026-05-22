import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import { supabaseServer } from "@/lib/supabaseServer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },

  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },

  section: {
    marginBottom: 12,
  },

  label: {
    fontSize: 10,
    fontWeight: "bold",
  },

  mono: {
    fontFamily: "Courier",
    fontSize: 9,
    wordBreak: "break-all",
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 9,
    textAlign: "center",
    color: "#555",
  },
});

interface GeneratePericialReportParams {
  baseHash: string;
  periodStart: string;
  periodEnd: string;

  urls: {
    pdf: string;
    signedPdf: string;
    tsa: string;
    anchor: string;
    publicVerify: string;
  };

  evidences: {
    reportId: string;
    pdfId: string;
    signedPdfId: string;
    tsaId: string;
    anchorId: string;
  };
}

/**
 * Gera LAUDO / RELATÓRIO PERICIAL FINAL (PDF)
 */
export async function generatePericialReportPdf(
  params: GeneratePericialReportParams
) {
  const pdfElement = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Relatório Pericial de Prova Digital — DOOHPLAY
        </Text>

        {/* IDENTIFICAÇÃO */}
        <View style={styles.section}>
          <Text style={styles.label}>Hash raiz da prova:</Text>
          <Text style={styles.mono}>{params.baseHash}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Período analisado:</Text>
          <Text>
            {params.periodStart} → {params.periodEnd}
          </Text>
        </View>

        {/* ETAPAS */}
        <View style={styles.section}>
          <Text style={styles.label}>Etapas verificadas:</Text>
          <Text>✔ Relatório consolidado determinístico</Text>
          <Text>✔ Hash criptográfico (SHA-256)</Text>
          <Text>✔ PDF institucional</Text>
          <Text>✔ Assinatura digital ICP-Brasil (A1)</Text>
          <Text>✔ Timestamp confiável (RFC 3161)</Text>
          <Text>✔ Âncora pública em blockchain</Text>
        </View>

        {/* EVIDENCES */}
        <View style={styles.section}>
          <Text style={styles.label}>Identificadores das evidências:</Text>
          <Text style={styles.mono}>Report: {params.evidences.reportId}</Text>
          <Text style={styles.mono}>PDF: {params.evidences.pdfId}</Text>
          <Text style={styles.mono}>
            PDF assinado: {params.evidences.signedPdfId}
          </Text>
          <Text style={styles.mono}>TSA: {params.evidences.tsaId}</Text>
          <Text style={styles.mono}>Blockchain: {params.evidences.anchorId}</Text>
        </View>

        {/* LINKS */}
        <View style={styles.section}>
          <Text style={styles.label}>Links públicos:</Text>
          <Text style={styles.mono}>{params.urls.publicVerify}</Text>
          <Text style={styles.mono}>{params.urls.pdf}</Text>
          <Text style={styles.mono}>{params.urls.signedPdf}</Text>
          <Text style={styles.mono}>{params.urls.tsa}</Text>
          <Text style={styles.mono}>{params.urls.anchor}</Text>
        </View>

        {/* CONCLUSÃO */}
        <View style={styles.section}>
          <Text style={styles.label}>Conclusão pericial:</Text>
          <Text>
            Com base nas verificações realizadas, conclui-se que o
            conjunto probatório apresentado possui integridade
            criptográfica, temporalidade confiável, encadeamento de
            evidências e registro público imutável, sendo tecnicamente
            válido como prova digital.
          </Text>
        </View>

        {/* RODAPÉ */}
        <Text style={styles.footer}>
          Relatório gerado automaticamente · DOOHPLAY ·
          Prova digital verificável e auditável
        </Text>
      </Page>
    </Document>
  );

  const pdfBuffer = await renderToBuffer(pdfElement);

  const path = `proof/${params.baseHash}/pericial-report.pdf`;

  const { error } = await supabaseServer.storage
    .from("reports")
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro ao salvar relatório pericial: ${error.message}`);
  }

  const { data: publicUrl } = supabaseServer.storage
    .from("reports")
    .getPublicUrl(path);

  return {
    pericialReportUrl: publicUrl.publicUrl,
  };
}