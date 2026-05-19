import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from "@react-pdf/renderer";

/**
 * Tipagem do payload recebido do endpoint
 * /api/snapshots/{id}/pdf-data
 */
interface SnapshotPdfData {
  snapshot: {
    id: string;
    tenant_id: string;
    closure_id: string;
    total_amount: number;
    currency: string;
    created_at: string;
  };
  integrity: {
    hash: string;
    algorithm: string;
    qr_code_base64: string;
    verify_url: string;
  };
  legal: {
    immutable: boolean;
    non_repudiation: boolean;
    legal_basis: string[];
  };
}

export default function FinancialSnapshotReport({
  data
}: {
  data: SnapshotPdfData;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>
            RELATÓRIO PERICIAL DE SNAPSHOT FINANCEIRO
          </Text>
          <Text style={styles.subtitle}>
            Documento eletrônico de integridade, autenticidade e não-repúdio
          </Text>
        </View>

        {/* METADADOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Identificação do Snapshot</Text>

          <Text style={styles.line}>
            ID do Snapshot: {data.snapshot.id}
          </Text>
          <Text style={styles.line}>
            ID do Fechamento: {data.snapshot.closure_id}
          </Text>
          <Text style={styles.line}>
            Tenant: {data.snapshot.tenant_id}
          </Text>
          <Text style={styles.line}>
            Data de Geração: {new Date(data.snapshot.created_at).toUTCString()}
          </Text>
        </View>

        {/* DADOS FINANCEIROS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Consolidação Financeira</Text>

          <Text style={styles.line}>
            Valor Total Consolidado:{" "}
            {data.snapshot.total_amount.toFixed(2)} {data.snapshot.currency}
          </Text>
        </View>

        {/* INTEGRIDADE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Integridade Criptográfica</Text>

          <Text style={styles.mono}>
            Algoritmo: {data.integrity.algorithm}
          </Text>
          <Text style={styles.mono}>
            Hash do Snapshot:
          </Text>
          <Text style={styles.hash}>
            {data.integrity.hash}
          </Text>
        </View>

        {/* QR CODE */}
        <View style={styles.qrSection}>
          <Image
            src={data.integrity.qr_code_base64}
            style={styles.qr}
          />

          <Text style={styles.qrText}>
            Escaneie o QR Code ou acesse:
          </Text>
          <Text style={styles.verifyUrl}>
            {data.integrity.verify_url}
          </Text>
        </View>

        {/* BASE LEGAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Fundamentação Legal</Text>

          {data.legal.legal_basis.map((item, idx) => (
            <Text key={idx} style={styles.line}>
              • {item}
            </Text>
          ))}

          <Text style={styles.line}>
            Este documento possui caráter imutável e validade probatória,
            garantindo integridade, autenticidade e não-repúdio.
          </Text>
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text>
            Documento gerado eletronicamente — DOOHPLAY
          </Text>
        </View>

      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica"
  },
  header: {
    marginBottom: 20
  },
  title: {
    fontSize: 16,
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: 10,
    marginTop: 4
  },
  section: {
    marginBottom: 18
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6
  },
  line: {
    marginBottom: 4
  },
  mono: {
    fontFamily: "Courier",
    fontSize: 10
  },
  hash: {
    fontFamily: "Courier",
    fontSize: 9,
    marginTop: 4,
    wordBreak: "break-all"
  },
  qrSection: {
    alignItems: "center",
    marginVertical: 20
  },
  qr: {
    width: 140,
    height: 140,
    marginBottom: 8
  },
  qrText: {
    fontSize: 9
  },
  verifyUrl: {
    fontSize: 8,
    fontFamily: "Courier",
    textAlign: "center",
    marginTop: 2
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#666"
  }
});
