export function ProofDetails({ proof }: { proof: any }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-medium">
        ▸ Detalhes técnicos da verificação
      </summary>

      <pre className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
        {JSON.stringify(proof.evidences, null, 2)}
      </pre>
    </details>
  );
}