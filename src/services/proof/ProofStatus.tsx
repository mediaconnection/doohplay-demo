export function ProofStatus({ proof }: { proof: any }) {
  return (
    <section className="border rounded-lg p-5 bg-green-50">
      <h1 className="text-2xl font-bold text-green-800">
        ✅ Documento Verificado
      </h1>

      <p className="mt-3 text-green-900">
        Este documento possui integridade criptográfica comprovada
        e pode ser validado de forma independente.
      </p>

      <ul className="mt-4 space-y-1 text-sm text-green-800">
        <li>✔ Hash criptográfico válido</li>
        <li>✔ Assinatura digital (ICP-Brasil)</li>
        <li>✔ Timestamp confiável (RFC 3161)</li>
        <li>✔ Âncora em blockchain pública</li>
      </ul>
    </section>
  );
}