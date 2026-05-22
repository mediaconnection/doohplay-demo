export function ProofDownloads({ proof }: { proof: any }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">📄 Documentos</h2>

      {proof.urls.pdf && (
        <a
          href={proof.urls.pdf}
          target="_blank"
          className="block underline text-blue-700"
        >
          Baixar relatório original (PDF)
        </a>
      )}

      {proof.urls.manifest && (
        <a
          href={proof.urls.manifest}
          target="_blank"
          className="block underline text-blue-700"
        >
          Baixar manifesto jurídico
        </a>
      )}
    </section>
  );
}