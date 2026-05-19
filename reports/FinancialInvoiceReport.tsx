import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from "@react-pdf/renderer";

interface InvoiceReportProps {
  invoice: {
    id: string;
    tenant_name: string;
    reference_month: string;
    total_amount: number;
    currency: string;
    snapshot_hash: string;
    issued_at: string;
    qr_code_url: string;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica"
  },
  title: {
    fontSize: 18,
    marginBottom: 20
  },
  section: {
    marginBottom: 12
  },
  label: {
    fontWeight: "bold"
  },
  qr: {
    width: 120,
    height: 120,
    marginTop: 20
  },
  footer: {
    marginTop: 30,
    fontSize: 9,
    color: "#666"
  }
});

export default function FinancialInvoiceReport({ invoice }: InvoiceReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>FATURA OFICIAL – DOOHPLAY</Text>

        <View style={styles.section}>
          <Text><Text style={styles.label}>Fatura ID:</Text> {invoice.id}</Text>
          <Text><Text style={styles.label}>Cliente:</Text> {invoice.tenant_name}</Text>
          <Text><Text style={styles.label}>Competência:</Text> {invoice.reference_month}</Text>
          <Text><Text style={styles.label}>Emitida em:</Text> {invoice.issued_at}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Valor Total</Text>
          <Text>
            {invoice.currency} {invoice.total_amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Hash do Snapshot Financeiro</Text>
          <Text>{invoice.snapshot_hash}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Verificação Pública</Text>
          <Text>{invoice.qr_code_url}</Text>
          <Image src={invoice.qr_code_url} style={styles.qr} />
        </View>

        <Text style={styles.footer}>
          Documento gerado eletronicamente.  
          Integridade garantida por hash criptográfico, assinatura digital e carimbo do tempo (ICP-Brasil / RFC 3161).
        </Text>
      </Page>
    </Document>
  );
}
