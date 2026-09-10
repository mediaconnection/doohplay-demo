import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { slateDark as C, FONT_FAMILY } from "@/lib/theme";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function statusBadge(status: string): { label: string; color: string } {
  switch (status) {
    case "valid":
      return { label: status, color: C.green };
    case "revoked":
      return { label: status, color: C.red };
    case "expired":
      return { label: status, color: C.amber };
    case "superseded":
      return { label: status, color: C.purple };
    default:
      return { label: status, color: C.muted };
  }
}

export default async function AdminReportsPage() {
  const { data, error } = await supabase
    .from("pdf_hashes")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT_FAMILY, padding: "32px 40px" }}>
        <div style={{ background: C.red + "18", border: `1px solid ${C.red}44`, color: C.red, borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          Erro ao carregar relatórios
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT_FAMILY, padding: "32px 40px" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 24 }}>Relatórios emitidos</div>

      {data.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: "center", color: C.text2, fontSize: 14 }}>
          Nenhum relatório emitido ainda.
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg }}>
                <th style={{ padding: 12, textAlign: "left", color: C.text2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tipo</th>
                <th style={{ padding: 12, textAlign: "left", color: C.text2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Período</th>
                <th style={{ padding: 12, textAlign: "left", color: C.text2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
                <th style={{ padding: 12, textAlign: "left", color: C.text2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Assinado em</th>
                <th style={{ padding: 12, textAlign: "left", color: C.text2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r) => {
                const badge = statusBadge(r.status);
                return (
                  <tr key={r.hash} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: 12, color: C.text }}>{r.report_type}</td>

                    <td style={{ padding: 12, color: C.text2 }}>
                      {new Date(r.start_date).toLocaleDateString("pt-BR")} –{" "}
                      {new Date(r.end_date).toLocaleDateString("pt-BR")}
                    </td>

                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: badge.color + "22", color: badge.color, border: `1px solid ${badge.color}44` }}>
                        {badge.label}
                      </span>
                    </td>

                    <td style={{ padding: 12, color: C.text2 }}>
                      {r.signed_at
                        ? new Date(r.signed_at).toLocaleString("pt-BR")
                        : "—"}
                    </td>

                    <td style={{ padding: 12, display: "flex", gap: 14 }}>
                      <Link
                        href={`/verify/${r.hash}`}
                        target="_blank"
                        style={{ color: C.blue, textDecoration: "underline", fontSize: 13 }}
                      >
                        Verificar
                      </Link>

                      <a
                        href={`/api/reports/dashboard?hash=${r.hash}`}
                        target="_blank"
                        style={{ color: C.text2, textDecoration: "underline", fontSize: 13 }}
                      >
                        PDF
                      </a>

                      {r.status === "valid" && (
                        <form action={`/admin/reports/revoke?hash=${r.hash}`} method="post">
                          <button type="submit" style={{ background: "none", border: "none", padding: 0, color: C.red, textDecoration: "underline", fontSize: 13, cursor: "pointer" }}>
                            Revogar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
