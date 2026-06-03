import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-slate-950 px-6 py-24 sm:py-32">
        {/* Grid decorativo */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ledger público · Polygon Mainnet · Score 100/100
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Publicidade DOOH com{" "}
            <span className="text-emerald-400">prova criptográfica</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            O DOOHPLAY registra cada exibição de mídia em um ledger imutável,
            ancorando as provas na blockchain Polygon. Anunciantes verificam
            o que foi exibido, quando e onde — com score de confiança auditável.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/verify"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-400 transition-colors"
            >
              🔐 Verificar uma prova
            </Link>
            <Link
              href="/explorer"
              className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              🔍 Explorar o ledger
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: "524", label: "Blocos no ledger", icon: "🗄️" },
            { value: "515", label: "Anchorados na Polygon", icon: "⬡" },
            { value: "100/100", label: "Score de confiança", icon: "✅" },
            { value: "RSA-SHA256", label: "Assinatura ICP-Brasil", icon: "🔏" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-center shadow-sm">
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="mt-1 text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Como funciona</h2>
            <p className="mt-3 text-slate-500">Do play na tela à prova on-chain em milissegundos.</p>
          </div>

          <div className="relative">
            {/* Linha conectora */}
            <div className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-0.5 bg-slate-100 sm:block" />

            <div className="space-y-8">
              {[
                {
                  step: "01",
                  icon: "📺",
                  title: "Exibição registrada",
                  desc: "Cada play de mídia gera um evento com hash SHA-256, assinatura RSA do player e timestamp TSA RFC3161.",
                  color: "bg-blue-50 border-blue-200 text-blue-700",
                },
                {
                  step: "02",
                  icon: "🌲",
                  title: "Merkle Tree formada",
                  desc: "Os eventos são agrupados em blocos e organizados em uma Merkle Tree, garantindo integridade da cadeia.",
                  color: "bg-purple-50 border-purple-200 text-purple-700",
                },
                {
                  step: "03",
                  icon: "⬡",
                  title: "Ancoragem na Polygon",
                  desc: "O Merkle Root é gravado em smart contract na Polygon Mainnet, criando prova imutável e auditável.",
                  color: "bg-emerald-50 border-emerald-200 text-emerald-700",
                },
                {
                  step: "04",
                  icon: "🔐",
                  title: "Verificação pública",
                  desc: "Qualquer pessoa pode verificar qualquer hash via portal público ou API REST — sem autenticação.",
                  color: "bg-amber-50 border-amber-200 text-amber-700",
                },
              ].map((item, i) => (
                <div key={i} className="relative flex gap-6">
                  <div className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-2xl ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">PASSO {item.step}</span>
                    </div>
                    <h3 className="mt-0.5 text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Por que DOOHPLAY</h2>
            <p className="mt-3 text-slate-500">A única plataforma DOOH com verificação criptográfica end-to-end.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🔏",
                title: "ICP-Brasil + RSA-SHA256",
                desc: "Cada evento é assinado com chave RSA-SHA256 compatível com a cadeia de certificação ICP-Brasil, com validade jurídica.",
                badge: "Compliance",
                badgeCls: "bg-blue-50 border-blue-200 text-blue-700",
              },
              {
                icon: "⬡",
                title: "Blockchain Polygon",
                desc: "Merkle Roots anchorados na Polygon Mainnet com confirmação de transação verificável no PolygonScan.",
                badge: "On-chain",
                badgeCls: "bg-purple-50 border-purple-200 text-purple-700",
              },
              {
                icon: "📊",
                title: "Score auditável 0–100",
                desc: "Cada verificação retorna um score calculado por camadas — ICP, Merkle, Blockchain e TSA — com breakdown detalhado.",
                badge: "Transparência",
                badgeCls: "bg-emerald-50 border-emerald-200 text-emerald-700",
              },
              {
                icon: "⚡",
                title: "API REST pública",
                desc: "Endpoint público sem autenticação para verificação de provas. Integração em minutos com qualquer sistema.",
                badge: "Integração",
                badgeCls: "bg-amber-50 border-amber-200 text-amber-700",
              },
              {
                icon: "📄",
                title: "PDF certificado",
                desc: "Geração de documento PDF com QR Code, hash, camadas de verificação e link para a transação blockchain.",
                badge: "Documentação",
                badgeCls: "bg-rose-50 border-rose-200 text-rose-700",
              },
              {
                icon: "🗺️",
                title: "Network Map em tempo real",
                desc: "Visualização de todas as telas da rede, status online/offline, plays e localização geográfica.",
                badge: "Visibilidade",
                badgeCls: "bg-slate-100 border-slate-200 text-slate-600",
              },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl">{f.icon}</div>
                <div className="mt-3 flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                </div>
                <span className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${f.badgeCls}`}>
                  {f.badge}
                </span>
                <p className="mt-3 text-sm leading-6 text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO AO VIVO ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-slate-950 p-10 text-center shadow-xl">
          <div className="text-4xl">🔐</div>
          <h2 className="mt-4 text-2xl font-bold text-white">Veja uma prova ao vivo</h2>
          <p className="mt-3 text-slate-400 text-sm leading-6">
            Acesse a verificação de um evento real anchorado na Polygon Mainnet.
            Score 100/100, Trust HIGH, Risk LOW.
          </p>
          <div className="mt-6 rounded-xl bg-slate-800 px-4 py-3 font-mono text-xs text-slate-300 break-all">
            0x20ec722b179a772ddc19c2a6053326906da1e598cc3dcaeed4a48efee2f950be
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/verify/20ec722b179a772ddc19c2a6053326906da1e598cc3dcaeed4a48efee2f950be"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
            >
              Ver verificação completa →
            </Link>
            <a
              href="https://polygonscan.com/tx/0xc0680ce7bbb283cbb7af6ec6c6fc01cb99067434e1aaa4ec513d24d4f1c10b32"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              ⬡ Ver na Polygon
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-2 text-center text-xs text-slate-400">
          <div className="font-semibold text-slate-600">DOOHPLAY — Trust Infrastructure for DOOH Advertising</div>
          <div>Blockchain · ICP-Brasil · Merkle Proof · TSA RFC3161</div>
          <div className="mt-2">© {new Date().getFullYear()} DOOHPLAY. Ledger público auditável.</div>
        </div>
      </footer>

    </main>
  )
}
