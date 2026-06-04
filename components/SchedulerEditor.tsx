"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DAYS = [
  { label: "Dom", value: 0 },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 },
]

const PRESETS = [
  { label: "Sempre ativo",      days: [0,1,2,3,4,5,6], start: "00:00", end: "23:59" },
  { label: "Dias úteis",        days: [1,2,3,4,5],       start: "08:00", end: "18:00" },
  { label: "Fim de semana",     days: [0,6],              start: "10:00", end: "22:00" },
  { label: "Horário nobre",     days: [0,1,2,3,4,5,6],   start: "18:00", end: "23:00" },
  { label: "Almoço",            days: [1,2,3,4,5],        start: "11:30", end: "14:00" },
  { label: "Manhã",             days: [1,2,3,4,5],        start: "07:00", end: "12:00" },
]

type ScheduleRule = {
  id?: string
  playlist_item_id: string
  days_of_week: number[]
  time_start: string
  time_end: string
  priority: number
  is_active: boolean
}

type PlaylistItem = {
  id: string
  asset_url: string
  type: string
  duration: number
  position: number
  schedule_type: string
  schedule?: ScheduleRule | null
}

export default function SchedulerEditor({ playlistId }: { playlistId: string }) {
  const [items, setItems] = useState<PlaylistItem[]>([])
  const [selected, setSelected] = useState<PlaylistItem | null>(null)
  const [rule, setRule] = useState<ScheduleRule | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [playlistId])

  async function loadItems() {
    setLoading(true)
    const { data: playlistItems } = await supabase
      .from("playlist_items")
      .select("*")
      .eq("playlist_id", playlistId)
      .order("position")

    if (!playlistItems) return setLoading(false)

    const ids = playlistItems.map(i => i.id)
    const { data: rules } = await supabase
      .from("schedule_rules")
      .select("*")
      .in("playlist_item_id", ids)
      .eq("is_active", true)

    const ruleMap: Record<string, ScheduleRule> = {}
    for (const r of rules ?? []) {
      ruleMap[r.playlist_item_id] = r
    }

    setItems(playlistItems.map(i => ({
      ...i,
      schedule: ruleMap[i.id] ?? null
    })))
    setLoading(false)
  }

  function selectItem(item: PlaylistItem) {
    setSelected(item)
    setSaved(false)
    if (item.schedule) {
      setRule({ ...item.schedule })
    } else {
      setRule({
        playlist_item_id: item.id,
        days_of_week: [0,1,2,3,4,5,6],
        time_start: "00:00",
        time_end: "23:59",
        priority: 1,
        is_active: true
      })
    }
  }

  function toggleDay(day: number) {
    if (!rule) return
    const days = rule.days_of_week.includes(day)
      ? rule.days_of_week.filter(d => d !== day)
      : [...rule.days_of_week, day].sort()
    setRule({ ...rule, days_of_week: days })
  }

  function applyPreset(preset: typeof PRESETS[0]) {
    if (!rule) return
    setRule({
      ...rule,
      days_of_week: preset.days,
      time_start: preset.start,
      time_end: preset.end
    })
  }

  async function saveRule() {
    if (!rule || !selected) return
    setSaving(true)

    // Upsert na tabela schedule_rules
    const { error } = await supabase
      .from("schedule_rules")
      .upsert({
        ...(rule.id ? { id: rule.id } : {}),
        playlist_item_id: rule.playlist_item_id,
        days_of_week: rule.days_of_week,
        time_start: rule.time_start + ":00",
        time_end: rule.time_end + ":00",
        priority: rule.priority,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: "playlist_item_id" })

    // Atualiza schedule_type do item
    await supabase
      .from("playlist_items")
      .update({ schedule_type: "scheduled" })
      .eq("id", selected.id)

    setSaving(false)
    if (!error) {
      setSaved(true)
      loadItems()
    }
  }

  async function removeRule() {
    if (!rule?.id || !selected) return
    await supabase.from("schedule_rules").delete().eq("id", rule.id)
    await supabase.from("playlist_items")
      .update({ schedule_type: "always" })
      .eq("id", selected.id)
    setSelected(null)
    setRule(null)
    loadItems()
  }

  function getItemLabel(item: PlaylistItem) {
    try {
      const url = new URL(item.asset_url)
      const path = url.pathname
      const parts = path.split("/")
      return parts[parts.length - 1] || item.asset_url.slice(0, 40)
    } catch {
      return item.asset_url?.slice(0, 40) || "Item sem URL"
    }
  }

  function formatScheduleSummary(item: PlaylistItem) {
    if (!item.schedule || item.schedule_type === "always") return "Sempre ativo"
    const r = item.schedule
    const dayNames = r.days_of_week.map(d => DAYS[d].label).join(", ")
    return `${dayNames} · ${r.time_start.slice(0,5)}–${r.time_end.slice(0,5)}`
  }

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
      Carregando playlist...
    </div>
  )

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
      padding: "24px",
      maxWidth: "900px",
      margin: "0 auto"
    }}>

      {/* Lista de itens */}
      <div>
        <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#888", marginBottom: "12px", textTransform: "uppercase" }}>
          Itens da playlist
        </div>
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => selectItem(item)}
            style={{
              padding: "12px 16px",
              marginBottom: "8px",
              borderRadius: "10px",
              border: selected?.id === item.id ? "1.5px solid #6366f1" : "1px solid #e5e7eb",
              background: selected?.id === item.id ? "#f5f3ff" : "#fff",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {getItemLabel(item)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "20px",
                background: item.schedule_type === "scheduled" ? "#f0fdf4" : "#f3f4f6",
                color: item.schedule_type === "scheduled" ? "#16a34a" : "#6b7280",
                fontWeight: 500
              }}>
                {item.schedule_type === "scheduled" ? "● Agendado" : "○ Sempre ativo"}
              </span>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                {formatScheduleSummary(item)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Editor de regra */}
      <div>
        {!selected ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            Selecione um item para configurar o agendamento
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", color: "#888", marginBottom: "12px", textTransform: "uppercase" }}>
              Configurar agendamento
            </div>

            {/* Presets */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Predefinições</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      fontSize: "12px",
                      color: "#374151",
                      cursor: "pointer"
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dias da semana */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Dias da semana</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {DAYS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => toggleDay(d.value)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: rule?.days_of_week.includes(d.value) ? "1.5px solid #6366f1" : "1px solid #e5e7eb",
                      background: rule?.days_of_week.includes(d.value) ? "#6366f1" : "#fff",
                      color: rule?.days_of_week.includes(d.value) ? "#fff" : "#6b7280",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Horário */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Horário</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Início</div>
                  <input
                    type="time"
                    value={rule?.time_start ?? "00:00"}
                    onChange={e => rule && setRule({ ...rule, time_start: e.target.value })}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                      color: "#111",
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ color: "#9ca3af", marginTop: "16px" }}>→</div>
                <div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Fim</div>
                  <input
                    type="time"
                    value={rule?.time_end ?? "23:59"}
                    onChange={e => rule && setRule({ ...rule, time_end: e.target.value })}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "14px",
                      color: "#111",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Preview do resumo */}
            {rule && (
              <div style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#15803d"
              }}>
                ✓ Exibindo {rule.days_of_week.map(d => DAYS[d].label).join(", ")} das {rule.time_start} às {rule.time_end}
              </div>
            )}

            {/* Ações */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={saveRule}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  background: saved ? "#16a34a" : "#6366f1",
                  color: "#fff",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background 0.2s"
                }}
              >
                {saving ? "Salvando..." : saved ? "✓ Salvo" : "Salvar agendamento"}
              </button>
              {rule?.id && (
                <button
                  onClick={removeRule}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#ef4444",
                    border: "1px solid #fecaca",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
