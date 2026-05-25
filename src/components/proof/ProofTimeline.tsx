// @ts-nocheck
// src/components/proof/ProofTimeline.tsx

interface EvidenceItem {
  id: string;
  hash: string;
  type: string;
  created_at: string;
  pdf_url?: string | null;
  evidence_json_url?: string | null;
}

interface ProofTimelineProps {
  evidences: EvidenceItem[];
}

const typeLabelMap: Record<string, string> = {
  report: "Relatório base",
  evidence: "Evidência técnica",
  pdf: "Documento PDF",
  manifest: "Manifesto jurídico",
};

export function ProofTimeline({
  evidences,
}: ProofTimelineProps) {
  return (
    <section style={{ marginTop: 40 }}>
      <h2>🧾 Linha do tempo da prova</h2>

      <ol
        style={{
          marginTop: 24,
          paddingLeft: 0,
          listStyle: "none",
          borderLeft: "3px solid #1a7f37",
        }}
      >
        {evidences.map((e, index) => (
          <li
            key={e.id}
            style={{
              marginBottom: 24,
              paddingLeft: 20,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: -9,
                top: 4,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#1a7f37",
              }}
            />

            <p style={{ margin: 0, fontWeight: 600 }}>
              {typeLabelMap[e.type] ?? e.type}
            </p>

            <p style={{ margin: "4px 0", fontSize: 13 }}>
              {new Date(e.created_at).toLocaleString("pt-BR")}
            </p>

            <code
              style={{
                display: "block",
                fontSize: 11,
                wordBreak: "break-all",
                background: "#f6f8fa",
                padding: 8,
                borderRadius: 4,
              }}
            >
              {e.hash}
            </code>

            {e.pdf_url && (
              <p style={{ marginTop: 6 }}>
                <a
                  href={e.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Abrir documento
                </a>
              </p>
            )}

            {e.evidence_json_url && (
              <p style={{ marginTop: 6 }}>
                <a
                  href={e.evidence_json_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📎 Abrir artefato técnico
                </a>
              </p>
            )}

            <p
              style={{
                marginTop: 6,
                color: "#1a7f37",
                fontSize: 13,
              }}
            >
              ✔️ Integridade preservada
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
