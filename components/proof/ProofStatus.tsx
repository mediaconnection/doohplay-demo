import {
  evaluateProofStatus,
  ProofLayerResult,
} from "@/lib/proof/evaluateProofStatus";

interface Evidence {
  id: string;
  hash: string;
  type: string;
  pdf_url?: string | null;
  evidence_json_url?: string | null;
  created_at: string;
}

interface ProofStatusProps {
  evidences: Evidence[];
}

const STATUS_COLOR: Record<string, string> = {
  valid: "#f6fffa",
  missing: "#fff5f5",
  warning: "#fffbea",
  invalid: "#ffecec",
};

const STATUS_ICON: Record<string, string> = {
  valid: "✅",
  missing: "❌",
  warning: "⚠️",
  invalid: "🚫",
};

export function ProofStatus({ evidences }: ProofStatusProps) {
  const results = evaluateProofStatus(evidences as import("@/lib/proof/evaluateProofStatus").EvidenceLike[]);

  return (
    <section style={{ marginTop: 32 }}>
      <h2>🔐 Status jurídico da prova</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.map((layer: ProofLayerResult) => {
          const evidence = evidences.find(
            (e) => e.type === layer.type
          );

          return (
            <li
              key={layer.type}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                marginTop: 12,
                background: STATUS_COLOR[layer.status],
              }}
            >
              <strong>
                {STATUS_ICON[layer.status]}{" "}
                {layer.type.replace("_", " ").toUpperCase()}
              </strong>

              <p style={{ margin: "6px 0", fontSize: 14 }}>
                {layer.reason}
              </p>

              {evidence?.pdf_url && (
                <a
                  href={evidence.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Visualizar documento
                </a>
              )}

              {evidence?.evidence_json_url && (
                <div>
                  <a
                    href={evidence.evidence_json_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📎 Visualizar prova técnica
                  </a>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}