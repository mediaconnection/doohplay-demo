import { createClient } from "@supabase/supabase-js";

type Props = {
  params: { hash: string };
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function splitHash(hash: string, size = 32) {
  const parts: string[] = [];
  for (let i = 0; i < hash.length; i += size) {
    parts.push(hash.slice(i, i + size));
  }
  return parts;
}

export default async function VerifyPage({ params }: Props) {
  const { hash } = params;

  const isValidFormat = /^[a-f0-9]{64}$/.test(hash);

  if (!isValidFormat) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-xl border bg-white p-6 text-center text-red-600 shadow">
          ❌ <b>Hash inválido</b>
          <p className="mt-2 text-sm">
            O código informado não corresponde a um SHA-256 válido.
          </p>
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from("pdf_hashes")
    .select("*")
    .eq("hash", hash)
    .maybeSingle();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-xl border bg-white p-6 text-center text-red-600 shadow">
          ❌ <b>Documento não reconhecido</b>
          <p className="mt-2 text-sm">
            Este documento não foi emitido pelo sistema DOOHPLAY.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-xl border bg-white p-6 shadow">
        <div className="text-center">
          <div className="text-2xl">✅</div>
          <h1 className="mt-2 text-lg font-semibold text-green-700">
            Documento autêntico
          </h1>
          <p className="text-sm text-gray-500">
            Verificação criptográfica concluída com sucesso
          </p>
        </div>

        <div className="mt-6 space-y-2 text-sm text-gray-700">
          <p>
            <b>Tipo:</b> {data.report_type}
          </p>
          <p>
            <b>Período:</b>{" "}
            {new Date(data.start_date).toLocaleDateString("pt-BR")} –{" "}
            {new Date(data.end_date).toLocaleDateString("pt-BR")}
          </p>
          <p>
            <b>Gerado em:</b>{" "}
            {new Date(data.generated_at).toLocaleString("pt-BR")}
          </p>
          <p>
            <b>Assinado em:</b>{" "}
            {new Date(data.signed_at).toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="mt-4 rounded-md bg-gray-50 p-3">
          <p className="text-xs font-semibold text-gray-500">
            Hash SHA-256
          </p>

          {splitHash(hash).map((line, i) => (
            <p
              key={i}
              className="break-all font-mono text-[11px] text-gray-600"
            >
              {line}
            </p>
          ))}
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Este código comprova a integridade e autenticidade do
          documento original.
        </div>
      </div>
    </div>
  );
}
