import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function statusBadge(status: string) {
  switch (status) {
    case "valid":
      return "bg-green-100 text-green-800";
    case "revoked":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-yellow-100 text-yellow-800";
    case "superseded":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default async function AdminReportsPage() {
  const { data, error } = await supabase
    .from("pdf_hashes")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(50);

  if (error) {
    return <div className="p-6 text-red-600">Erro ao carregar relatórios</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Relatórios emitidos
      </h1>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Período</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Assinado em</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {data.map((r) => (
              <tr key={r.hash} className="border-t">
                <td className="p-3">{r.report_type}</td>

                <td className="p-3">
                  {new Date(r.start_date).toLocaleDateString("pt-BR")} –{" "}
                  {new Date(r.end_date).toLocaleDateString("pt-BR")}
                </td>

                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="p-3">
                  {r.signed_at
                    ? new Date(r.signed_at).toLocaleString("pt-BR")
                    : "-"}
                </td>

                <td className="p-3 flex gap-3">
                  <Link
                    href={`/verify/${r.hash}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Verificar
                  </Link>

                  <a
                    href={`/api/reports/dashboard?hash=${r.hash}`}
                    target="_blank"
                    className="text-gray-700 underline"
                  >
                    PDF
                  </a>

                  {r.status === "valid" && (
                    <form action={`/admin/reports/revoke?hash=${r.hash}`} method="post">
                      <button className="text-red-600 underline">
                        Revogar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
