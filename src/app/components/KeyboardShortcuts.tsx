import { Keyboard, X, Command } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { open: boolean; onClose: () => void; }

const GROUPS = [
  {
    title: "Navegação Global",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Abrir Command Palette" },
      { keys: ["?"],       label: "Mostrar atalhos de teclado" },
      { keys: ["ESC"],     label: "Fechar / Voltar" },
      { keys: ["⌘", "\\\\"], label: "Toggle sidebar" },
    ],
  },
  {
    title: "Campanhas",
    shortcuts: [
      { keys: ["G", "C"], label: "Ir para Campaign Manager" },
      { keys: ["G", "N"], label: "Nova campanha" },
      { keys: ["G", "A"], label: "Analytics Dashboard" },
      { keys: ["G", "M"], label: "Media Plan" },
    ],
  },
  {
    title: "Telas & Inventário",
    shortcuts: [
      { keys: ["G", "D"], label: "Device Manager" },
      { keys: ["G", "L"], label: "Live Monitor" },
      { keys: ["G", "P"], label: "Playlist Manager" },
      { keys: ["G", "X"], label: "Marketplace" },
    ],
  },
  {
    title: "Plataforma",
    shortcuts: [
      { keys: ["G", "E"], label: "Enterprise Dashboard" },
      { keys: ["G", "B"], label: "Billing Center" },
      { keys: ["G", "S"], label: "System Settings" },
      { keys: ["G", "U"], label: "User Management" },
    ],
  },
  {
    title: "Trust & Segurança",
    shortcuts: [
      { keys: ["G", "V"], label: "ProofChain Verificar" },
      { keys: ["G", "F"], label: "Fraud Detection" },
      { keys: ["G", "R"], label: "Security Center" },
      { keys: ["G", "I"], label: "AI Assistant" },
    ],
  },
  {
    title: "Som",
    shortcuts: [
      { keys: ["⌘", "M"], label: "Toggle música ambiente" },
      { keys: ["⌘", "↑"], label: "Volume +10%" },
      { keys: ["⌘", "↓"], label: "Volume -10%" },
    ],
  },
];

export default function KeyboardShortcuts({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(5,6,14,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>

      <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
        style={{ background: T.card, border: `1px solid ${T.border}` }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
              <Keyboard size={18} style={{ color: T.primary }} />
            </div>
            <div>
              <h2 className="font-black text-base">Atalhos de Teclado</h2>
              <p className="text-xs" style={{ color: T.textSub }}>DOOHPLAY — Navegação rápida</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X size={16} style={{ color: T.textSub }} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {GROUPS.map(group => (
              <div key={group.title} className="p-4 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                <div className="text-xs font-black mb-3" style={{ color: T.textSub }}>{group.title.toUpperCase()}</div>
                <div className="space-y-2">
                  {group.shortcuts.map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-sm" style={{ color: T.text }}>{s.label}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {s.keys.map((k, j) => (
                          <kbd key={j} className="px-2 py-0.5 rounded-md text-xs font-black font-mono"
                            style={{ background: T.card, border: `1px solid ${T.border}`, color: T.primary }}>
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex items-center gap-2" style={{ borderColor: T.border }}>
          <Command size={12} style={{ color: T.textSub }} />
          <span className="text-xs" style={{ color: T.textSub }}>
            Pressione <kbd className="px-1.5 py-0.5 rounded font-mono text-xs mx-0.5" style={{ background: T.panel, color: T.primary }}>?</kbd> a qualquer momento para abrir este painel
          </span>
        </div>
      </div>
    </div>
  );
}
