// src/lib/pdf/renderReportPdf.tsx

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { buildSealText } from "./seal";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  title: { fontSize: 16, marginBottom: 12 },
  section: { marginBottom: 10 },
  seal: {
    marginTop: 20,
    padding: 10,
    border: "1px solid #000",
  },
  mono: { fontFamily: "Courier", fontSize: 9 },
  qr: { width: 96, height: 96, marginTop: 8 },
});

export function renderReportPdf(params: {
  report: any;
  hash: string;
  verifyUrl: string;
  qrCodeDataUrl: string;
}) {
  const sealLines = buildSealText(params.hash);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Relatório de Exibição — DOOHPLAY</Text>

        {/* Período */}
        <View style={styles.section}>
          <Text>Período:</Text>
          <Text>
            {params.report.period.start} → {params.report.period.end}
          </Text>
        </View>

        {/* Resumo */}
        <View style={styles.section}>
          <Text>Resumo:</Text>
          <Text>Total Players: {params.report.summary.totalPlayers}</Text>
          <Text>Total Plays: {params.report.summary.totalPlays}</Text>
          <Text>
            Duração Total (s): {params.report.summary.totalDurationSeconds}
          </Text>
        </View>

        {/* Players */}
        <View style={styles.section}>
          <Text>Players:</Text>
          {params.report.players.map((p: any) => (
            <Text key={p.playerId}>
              {p.playerId} — plays: {p.plays}, duração: {p.durationSeconds}s
            </Text>
          ))}
        </View>

        {/* Selo de verificação */}
        <View style={styles.seal}>
          {sealLines.map((line) => (
            <Text key={line} style={styles.mono}>
              {line}
            </Text>
          ))}

          <Text style={[styles.mono, { marginTop: 6 }]}>
            Verificação pública:
          </Text>

          <Text style={styles.mono}>{params.verifyUrl}</Text>

          <Image src={params.qrCodeDataUrl} style={styles.qr} />
        </View>
      </Page>
    </Document>
  );
}