"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import SchedulerEditor from "@/components/SchedulerEditor"

type Client = {
  id: string
  name: string
  business_type: string
  primary_color: string
  phone: string | null
  address: string | null
  logo_url: string | null
  screen_id: string | null
  playlist_id: string | null
}

type Template = {
  id: string
  name: string
  emoji: string
  bg: string
  accent: string
  headline: string
  subline: string
  cta: string
}

const TEMPLATES: Record<string, Template[]> = {
  barber: [
    { id: "barber1", name: "Classico Premium", emoji: "✂", bg: "#0a0a0a", accent: "#C9A84C", headline: "Corte + Barba", subline: "Voce em alto estilo", cta: "Agende agora" },
    { id: "barber2", name: "Moderno Bold", emoji: "🪒", bg: "#1a1a2e", accent: "#e94560", headline: "Novo Visual", subline: "Transforme seu estilo", cta: "Reserve ja" },
    { id: "barber3", name: "Minimalista", emoji: "💈", bg: "#f8f4f0", accent: "#2d2d2d", headline: "Arte em cada corte", subline: "Excelencia e tradicao", cta: "Venha nos conhecer" },
  ],
  food: [
    { id: "food1", name: "Combo Almoco", emoji: "🍽", bg: "#1a0a00", accent: "#f59e0b", headline: "Combo do Dia", subline: "Prato + bebida + sobremesa", cta: "Peca agora" },
    { id: "food2", name: "Promocao Destaque", emoji: "⚡", bg: "#0f1f0f", accent: "#22c55e", headline: "Oferta Especial", subline: "So hoje!", cta: "Aproveite!" },
    { id: "food3", name: "Delivery", emoji: "🛵", bg: "#1a0020", accent: "#a855f7", headline: "Delivery Rapido", subline: "Entregamos em 30 min", cta: "Faca seu pedido" },
  ],
  dessert: [
    { id: "dessert1", name: "Bolo Especial", emoji: "🎂", bg: "#1a0010", accent: "#f472b6", headline: "Bolos Artesanais", subline: "Feitos com amor", cta: "Encomende ja" },
    { id: "dessert2", name: "Doces do Dia", emoji: "🍰", bg: "#fff8f0", accent: "#ea580c", headline: "Doces Fresquinhos", subline: "Todo dia uma surpresa", cta: "Venha provar" },
    { id: "dessert3", name: "Elegante", emoji: "🍫", bg: "#0a0505", accent: "#d4a574", headline: "Alta Confeitaria", subline: "Experiencias unicas", cta: "Descubra" },
  ],
  bakery: [
    { id: "bakery1", name: "Pao Fresquinho", emoji: "🍞", bg: "#1a0d00", accent: "#f97316", headline: "Pao Quentinho", subline: "Direto do forno", cta: "Venha buscar" },
    { id: "bakery2", name: "Cafe da Manha", emoji: "☕", bg: "#f5f0e8", accent: "#78350f", headline: "Cafe da Manha", subline: "O melhor comeco de dia", cta: "Passe aqui" },
    { id: "bakery3", name: "Promocao", emoji: "🥐", bg: "#0f0f1a", accent: "#fbbf24", headline: "Promocao do Dia", subline: "Leve 3, pague 2", cta: "Aproveite!" },
  ],
  pizza: [
    { id: "pizza1", name: "Promocao Sexta", emoji: "🍕", bg: "#1a0000", accent: "#ef4444", headline: "Sexta de Pizza", subline: "2 pizzas pelo preco de 1", cta: "Peca ja" },
    { id: "pizza2", name: "Delivery Noturno", emoji: "🌙", bg: "#020617", accent: "#6366f1", headline: "Delivery ate meia-noite", subline: "Pizza quente na porta", cta: "Faca seu pedido" },
    { id: "pizza3", name: "Familia", emoji: "👨‍👩‍👧", bg: "#0a1a00", accent: "#84cc16", headline: "Pizza em Familia", subline: "Momentos que ficam", cta: "Reserve sua mesa" },
  ],
}

function AdPreview({ tpl, client, form, imageUrl }: {
  tpl: Template
  client: Client
  form: { headline: string; subline: string; cta: string; phone: string }
  imageUrl?: string | null
}) {
  const isLight = tpl.bg.startsWith("#f")
  const textColor = isLight ? "#1a1a1a" : "#ffffff"
  const mutedColor = isLight ? "#00000060" : "#ffffff70"

  return (
    <div style={{
      width: "100%",
      aspectRatio: "16/9",
      background: tpl.bg,
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      boxSizing: "border-box",
    }}>
      {imageUrl && (
        <img src={imageUrl} alt="bg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 70% at 80% 20%, ${tpl.accent}15 0%, transparent 70%)` }} />
      {!imageUrl && (
        <div style={{ fontSize: 48, marginBottom: 16, position: "relative" }}>{tpl.emoji}</div>
      )}
      <div style={{ fontSize: 13, color: tpl.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8, position: "relative", fontWeight: 700 }}>
        {client.name}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: textColor, textAlign: "center", lineHeight: 1.1, position: "relative", fontFamily: "Georgia, serif" }}>
        {form.headline || tpl.headline}
      </div>
      <div style={{ fontSize: 14, color: mutedColor, marginTop: 10, textAlign: "center", position: "relative" }}>
        {form.subline || tpl.subline}
      </div>
      <div style={{ marginTop: 20, background: tpl.accent, color: isLight ? "#fff" : "#000", borderRadius: 999, padding: "8px 24px", fontSize: 13, fontWeight: 700, position: "relative" }}>
        {form.cta || tpl.cta}
      </div>
      {form.phone && (
        <div style={{ position: "absolute", bottom: 16, right: 16, fontSize: 11, color: mutedColor }}>
          {form.phone}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 8, color: `${tpl.accent}60`, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        DOOHPLAY
      </div>
    </div>
  )
}

type Tab = "editor" | "scheduler"

export default function StudioEditorPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("editor")
  const [selectedTpl, setSelectedTpl] = useState<Template | null>(null)
  const [form, setForm] = useState({ headline: "", subline: "", cta: "", phone: "", duration: "15" })
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishedItems, setPublishedItems] = useState<{ title: string; time: string }[]>([])

  useEffect(() => {
    fetch(`/api/studio/auth?code=${code}`)
      .then(r => r.json())
      .then(d => {
        if (!d.ok) { router.push("/studio"); return }
        setClient(d.client)
        const templates = TEMPLATES[d.client.business_type] ?? TEMPLATES.barber
        setSelectedTpl(templates[0])
        setForm(f => ({ ...f, phone: d.client.phone ?? "" }))
      })
      .catch(() => router.push("/studio"))
      .finally(() => setLoading(false))
  }, [code, router])

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("code", code)
      const res = await fetch("/api/studio/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (data.ok) setImageUrl(data.url)
      else setUploadError(data.error ?? "Erro no upload")
    } catch {
      setUploadError("Erro de conexao")
    } finally {
      setUploading(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedTpl || !client) return
    setPublishing(true)
    try {
      const assetUrl = `https://doohplay-demo.onrender.com/studio/${code}/preview?tpl=${selectedTpl.id}&h=${encodeURIComponent(form.headline || selectedTpl.headline)}`
      const res = await fetch("/api/studio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          asset_url: assetUrl,
          type: "url",
          duration: parseInt(form.duration),
          title: `${form.headline || selectedTpl.headline} - ${client.name}`,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setPublished(true)
        setPublishedItems(prev => [{ title: form.headline || selectedTpl.headline, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }, ...prev])
        setTimeout(() => setPublished(false), 4000)
      }
    } catch {}
    finally { setPublishing(false) }
  }

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A84C", fontFamily: "Georgia, serif", fontSize: 16 }}>Carregando studio...</div>
    </main>
  )

  if (!client || !selectedTpl) return null

  const templates = TEMPLATES[client.business_type] ?? TEMPLATES.barber
  const accent = client.primary_color.startsWith("#") ? client.primary_color : `#${client.primary_color}`

  // Usa playlist_id do cliente ou fallback da Zimermam
  const playlistId = client.playlist_id ?? "bbbbbbbb-0001-0001-0001-000000000001"

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #ffffff10", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, color: accent, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Georgia, serif" }}>DOOHPLAY Studio</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginTop: 2 }}>{client.name}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "#16a34a20", border: "1px solid #16a34a40", borderRadius: 999, padding: "4px 12px", fontSize: 11, color: "#4ade80" }}>
            Tela online
          </div>
          <button onClick={() => router.push("/zimerman")} style={{ background: "transparent", border: "1px solid #ffffff15", borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "#ffffff60", cursor: "pointer" }}>
            Ver portal
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #ffffff10", padding: "0 1.5rem", display: "flex", gap: 0 }}>
        {([
          { key: "editor", label: "✏️  Editor de anúncios" },
          { key: "scheduler", label: "🕐  Grade de programação" },
        ] as { key: Tab; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? `2px solid ${accent}` : "2px solid transparent",
              padding: "14px 20px",
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? "#fff" : "#ffffff40",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Editor */}
      {activeTab === "editor" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem" }}>

          {/* Coluna esquerda */}
          <div>
            {/* Templates */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 12, color: "#ffffff50", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                Escolha o template
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {templates.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => { setSelectedTpl(tpl); setForm(f => ({ ...f, headline: "", subline: "", cta: "" })) }}
                    style={{
                      background: selectedTpl.id === tpl.id ? `${accent}20` : "#111",
                      border: `1px solid ${selectedTpl.id === tpl.id ? accent : "#ffffff10"}`,
                      borderRadius: 10, padding: "8px 14px", cursor: "pointer",
                      color: selectedTpl.id === tpl.id ? accent : "#ffffff60",
                      fontSize: 12, fontWeight: selectedTpl.id === tpl.id ? 600 : 400,
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <span>{tpl.emoji}</span> {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 12, color: "#ffffff50", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                Preview ao vivo
              </div>
              <AdPreview tpl={selectedTpl} client={client} form={form} imageUrl={imageUrl} />
            </div>

            {/* Upload */}
            <div style={{ background: "#111", border: "1px solid #ffffff0f", borderRadius: 16, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: 12, color: "#ffffff50", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                Imagem de fundo (opcional)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
              />
              {imageUrl ? (
                <div style={{ position: "relative" }}>
                  <img src={imageUrl} alt="preview" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
                  <button
                    onClick={() => setImageUrl(null)}
                    style={{ position: "absolute", top: 6, right: 6, background: "#000000cc", color: "#fff", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: `2px dashed ${uploading ? accent : "#ffffff20"}`, borderRadius: 10, padding: "1.5rem", textAlign: "center", cursor: uploading ? "not-allowed" : "pointer" }}
                >
                  {uploading ? (
                    <div style={{ fontSize: 13, color: accent }}>Enviando imagem...</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>🖼</div>
                      <div style={{ fontSize: 13, color: "#ffffff60" }}>Clique para fazer upload</div>
                      <div style={{ fontSize: 11, color: "#ffffff30", marginTop: 4 }}>JPG, PNG ou WebP - max 10MB</div>
                    </>
                  )}
                </div>
              )}
              {uploadError && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>{uploadError}</div>}
            </div>

            {/* Formulário */}
            <div style={{ background: "#111", border: "1px solid #ffffff0f", borderRadius: 16, padding: "1.25rem" }}>
              <div style={{ fontSize: 12, color: "#ffffff50", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                Personalize o anuncio
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { key: "headline", label: "Titulo principal", placeholder: selectedTpl.headline },
                  { key: "subline", label: "Subtitulo", placeholder: selectedTpl.subline },
                  { key: "cta", label: "Chamada para acao", placeholder: selectedTpl.cta },
                  { key: "phone", label: "Telefone / WhatsApp", placeholder: "(11) 99999-9999" },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 11, color: "#ffffff40", display: "block", marginBottom: 4 }}>{field.label}</label>
                    <input
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: "100%", background: "#1a1a1a", border: "1px solid #ffffff10", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#fff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 11, color: "#ffffff40", display: "block", marginBottom: 4 }}>Duracao na tela (segundos)</label>
                <select
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  style={{ background: "#1a1a1a", border: "1px solid #ffffff10", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#fff", outline: "none", width: 160 }}
                >
                  <option value="10">10 segundos</option>
                  <option value="15">15 segundos</option>
                  <option value="30">30 segundos</option>
                  <option value="60">60 segundos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div>
            <div style={{ background: "#111", border: `1px solid ${accent}30`, borderRadius: 16, padding: "1.5rem", marginBottom: "1rem", position: "sticky", top: "1rem" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Pronto para publicar?</div>
              <div style={{ fontSize: 12, color: "#ffffff40", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                O anuncio aparecera na tela da {client.name} em instantes.
              </div>
              <button
                onClick={handlePublish}
                disabled={publishing}
                style={{
                  width: "100%",
                  background: publishing ? `${accent}50` : accent,
                  color: "#0a0a0a",
                  border: "none", borderRadius: 10, padding: "14px",
                  fontSize: 14, fontWeight: 700, cursor: publishing ? "not-allowed" : "pointer",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                }}
              >
                {publishing ? "Publicando..." : published ? "Publicado!" : "Publicar na tela"}
              </button>
              {published && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#4ade80", textAlign: "center" }}>
                  Anuncio na fila da playlist!
                </div>
              )}
              <div style={{ marginTop: "1rem", borderTop: "1px solid #ffffff08", paddingTop: "1rem" }}>
                <div style={{ fontSize: 11, color: "#ffffff30", marginBottom: 8 }}>Cada exibicao gera prova criptografica</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["SHA-256", "Merkle", "Polygon", "ICP-Brasil"].map(tag => (
                    <span key={tag} style={{ background: `${accent}10`, border: `1px solid ${accent}20`, borderRadius: 999, padding: "2px 8px", fontSize: 10, color: accent }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {publishedItems.length > 0 && (
              <div style={{ background: "#111", border: "1px solid #ffffff0f", borderRadius: 16, padding: "1.25rem" }}>
                <div style={{ fontSize: 12, color: "#ffffff40", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Publicados nesta sessao
                </div>
                {publishedItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < publishedItems.length - 1 ? "1px solid #ffffff08" : "none" }}>
                    <div style={{ fontSize: 12, color: "#ffffffcc" }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: "#ffffff30" }}>{item.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Scheduler */}
      {activeTab === "scheduler" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: 14, color: "#ffffff60", lineHeight: 1.6 }}>
              Configure em quais dias e horários cada anúncio aparece na tela.
              Itens sem regra ficam sempre ativos.
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden" }}>
            <SchedulerEditor playlistId={playlistId} />
          </div>
        </div>
      )}

    </main>
  )
}
