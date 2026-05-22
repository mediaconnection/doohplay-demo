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

  subtitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "bold",
  },

  section: {
    marginBottom: 12,
  },

  playersLine: {
    fontSize: 10,
    marginBottom: 2,
  },

  sealBox: {
    marginTop: 24,
    padding: 12,
    border: "1px solid #000",
  },

  sealTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
  },

  mono: {
    fontFamily: "Courier",
    fontSize: 9,
    wordBreak: "break-all",
  },

  qrContainer: {
    marginTop: 12,
    alignItems: "center",
  },

  qrImage: {
    width: 90,
    height: 90,
    marginBottom: 6,
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

/* =======================
   Tipos
======================= */

interface ReportSummary {
  totalPlayers: number;
  totalPlays: number;
  totalDurationSeconds: number;
}

interface ReportPlayer {
  playerId: string;
  plays: number;
  durationSeconds: number;
}

interface SignatureVisualInfo {
  signed: boolean;
  certificateAuthority?: string;
  certificateHolder?: string;
  signedAt?: string;
  tsaProvider?: string;
  tsaTimestamp?: string;
}

interface RenderReportPdfProps {
  report: {
    period: {
      start: string;
      end: string;
    };
    summary: ReportSummary;
    players: ReportPlayer[];
  };
  hash: string;
  verifyUrl: string;
  qrCodeDataUrl: string;
  signatureInfo?: SignatureVisualInfo;
}

/* =======================
   Template
======================= */

export function renderReportPdf({
  report,
  hash,
  verifyUrl,
  qrCodeDataUrl,
  signatureInfo,
}: RenderReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* TÍTULO */}
        <Text style={styles.title}>Relatório de Exibição — DOOHPLAY</Text>

        {/* PERÍODO */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Período</Text>
          <Text>
            {report.period.start} → {report.period.end}
          </Text>
        </View>

        {/* RESUMO */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Resumo Consolidado</Text>
          <Text>Total Players: {report.summary.totalPlayers}</Text>
          <Text>Total Plays: {report.summary.totalPlays}</Text>
          <Text>
            Duração Total (s): {report.summary.totalDurationSeconds}
          </Text>
        </View>

        {/* PLAYERS */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Detalhamento por Player</Text>
          {report.players.map((p) => (
            <Text key={p.playerId} style={styles.playersLine}>
              {p.playerId} — plays: {p.plays}, duração: {p.durationSeconds}s
            </Text>
          ))}
        </View>

        {/* SELO JURÍDICO */}
        <View style={styles.sealBox}>
          <Text style={styles.sealTitle}>
            Verificação Pública de Integridade — DOOHPLAY
          </Text>

          <Text style={styles.mono}>Hash criptográfico (SHA-256):</Text>
          <Text style={[styles.mono, { marginBottom: 6 }]}>
            {hash}
          </Text>

          <Text style={styles.mono}>Verificação pública:</Text>
          <Text style={styles.mono}>{verifyUrl}</Text>

          <View style={styles.qrContainer}>
            <Image src={qrCodeDataUrl} style={styles.qrImage} />
            <Text style={styles.mono}>Escaneie para verificar</Text>
          </View>
        </View>

        {/* ASSINATURA DIGITAL + TSA (ETAPA 9) */}
        {signatureInfo?.signed && (
          <View style={[styles.sealBox, { marginTop: 16 }]}>
            <Text style={styles.sealTitle}>
              Assinatura Digital e Carimbo do Tempo
            </Text>

            <Text style={styles.mono}>
              Autoridade Certificadora:{" "}
              {signatureInfo.certificateAuthority}
            </Text>

            {signatureInfo.certificateHolder && (
              <Text style={styles.mono}>
                Titular do Certificado:{" "}
                {signatureInfo.certificateHolder}
              </Text>
            )}

            {signatureInfo.signedAt && (
              <Text style={styles.mono}>
                Assinado em:{" "}
                {new Date(signatureInfo.signedAt).toLocaleString("pt-BR")}
              </Text>
            )}

            {signatureInfo.tsaProvider &&
              signatureInfo.tsaTimestamp && (
                <Text style={styles.mono}>
                  Carimbo do Tempo ({signatureInfo.tsaProvider}):{" "}
                  {new Date(
                    signatureInfo.tsaTimestamp
                  ).toLocaleString("pt-BR")}
                </Text>
              )}
          </View>
        )}

        {/* RODAPÉ */}
        <Text style={styles.footer}>
          Documento gerado automaticamente pela plataforma DOOHPLAY ·
          Integridade garantida por hash criptográfico
        </Text>
      </Page>
    </Document>
  );
}