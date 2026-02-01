import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  title: { fontSize: 18, marginBottom: 20 },
  section: { marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    border: "1 solid #ccc",
    borderRadius: 6,
    padding: 8,
    width: "48%",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: "1 solid #ccc",
    paddingTop: 6,
  },
  hashLine: {
    fontSize: 7,
    letterSpacing: 0.3, // 🔐 efeito monoespaçado sem depender de fonte
  },
});

type Kpis = {
  total_executions: number;
  active_players: number;
  total_seconds: number;
  active_campaigns: number;
};

type Props = {
  start: string;
  end: string;
  kpis?: Kpis;            // 👈 agora opcional
  integrityHash?: string;
  signedAt?: string;
};

// 🔹 Defaults seguros (NUNCA quebra PDF)
const EMPTY_KPIS: Kpis = {
  total_executions: 0,
  active_players: 0,
  total_seconds: 0,
  active_campaigns: 0,
};

// 🔹 Utilitário para quebrar hash
function splitHash(hash: string, size = 32) {
  const parts: string[] = [];
  for (let i = 0; i < hash.length; i += size) {
    parts.push(hash.slice(i, i + size));
  }
  return parts;
}

export default function DashboardReport({
  start,
  end,
  kpis,
  integrityHash,
  signedAt,
}: Props) {
  const safeKpis = kpis ?? EMPTY_KPIS;

  const signedAtLabel = signedAt
    ? new Date(signedAt).toLocaleString("pt-BR")
    : undefined;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Relatório de Campanhas DOOHPLAY
        </Text>

        <Text>
          Período: {start} – {end}
        </Text>

        {/* KPIs */}
        <View style={[styles.section, styles.row]}>
          <View style={styles.card}>
            <Text>Execuções</Text>
            <Text>{safeKpis.total_executions}</Text>
          </View>

          <View style={styles.card}>
            <Text>Players Ativos</Text>
            <Text>{safeKpis.active_players}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.card}>
            <Text>Tempo Veiculado</Text>
            <Text>
              {Math.round(safeKpis.total_seconds / 60)} min
            </Text>
          </View>

          <View style={styles.card}>
            <Text>Campanhas Ativas</Text>
            <Text>{safeKpis.active_campaigns}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 30 }}>
          Relatório gerado automaticamente pelo DOOHPLAY
        </Text>

        {/* 🔐 Assinatura digital */}
        {integrityHash && (
          <View style={styles.footer}>
            <Text style={{ fontSize: 8 }}>
              Documento assinado digitalmente
            </Text>

            {signedAtLabel && (
              <Text style={{ fontSize: 8 }}>
                Assinado em: {signedAtLabel}
              </Text>
            )}

            <Text style={{ fontSize: 7, marginTop: 4 }}>
              Hash de integridade (SHA-256):
            </Text>

            {splitHash(integrityHash).map((line, index) => (
              <Text key={index} style={styles.hashLine}>
                {line}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
