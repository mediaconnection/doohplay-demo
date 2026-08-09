import { useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle, Building2, User,
  Globe, DollarSign, Smartphone, Upload, Shield, Zap,
  Star, Check, ChevronRight, MapPin, Mail, Phone
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type Step = 0 | 1 | 2 | 3 | 4;

const STEPS = [
  { id: 0, label: "Perfil",      icon: User      },
  { id: 1, label: "Empresa",     icon: Building2 },
  { id: 2, label: "Território",  icon: MapPin    },
  { id: 3, label: "Comissão",    icon: DollarSign},
  { id: 4, label: "Revisão",     icon: CheckCircle},
];

const TIERS = [
  { id: "silver", label: "Silver",   commission: 15, minScreens: 5,  color: T.textSub, features: ["Painel próprio","Suporte por e-mail","Treinamento online"] },
  { id: "gold",   label: "Gold",     commission: 18, minScreens: 20, color: T.gold,    features: ["Painel white-label","Suporte prioritário","Treinamento presencial","Co-marketing"] },
  { id: "platinum",label: "Platinum",commission: 20, minScreens: 50, color: T.primary, features: ["Tudo do Gold","SLA dedicado","Gerente de conta","Leads compartilhados","API acesso total"] },
];

const STATES = ["SP","RJ","MG","RS","PR","SC","BA","CE","DF","GO","PE","AM"];

function Field({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: T.textSub }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}
        onFocus={e => { e.currentTarget.style.borderColor = T.primary; }}
        onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
      />
    </div>
  );
}

export default function PartnerOnboarding({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (v: string) => void }) {
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "",
    company: "", cnpj: "", website: "", employees: "",
    states: [] as string[], cities: "", exclusivity: false,
    tier: "gold",
    agreement: false,
  });

  const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleState = (s: string) => {
    set("states", form.states.includes(s) ? form.states.filter(x => x !== s) : [...form.states, s]);
  };

  const canNext: Record<Step, boolean> = {
    0: !!(form.name && form.email && form.phone),
    1: !!(form.company && form.cnpj),
    2: form.states.length > 0,
    3: !!form.tier,
    4: form.agreement,
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: T.success + "20" }}>
            <CheckCircle size={40} style={{ color: T.success }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Candidatura enviada!</h2>
          <p className="mb-2" style={{ color: T.textSub }}>Sua solicitação de parceria foi recebida com sucesso.</p>
          <p className="text-sm mb-8" style={{ color: T.textSub }}>Nossa equipe de parcerias entrará em contato via WhatsApp em até 48 horas úteis.</p>
          <div className="p-5 rounded-2xl border mb-6 text-left" style={{ background: T.card, borderColor: T.border }}>
            <p className="text-xs font-semibold mb-3" style={{ color: T.textSub }}>PRÓXIMOS PASSOS</p>
            {["Análise de perfil (24–48h)","Reunião de onboarding (30 min)","Assinatura de contrato","Acesso ao painel partner"].map((s, i) => (
              <div key={`ps-${i}`} className="flex items-center gap-3 py-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: T.primary + "20", color: T.primary }}>{i + 1}</span>
                <span className="text-sm">{s}</span>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate?.("partner-portal")}
            className="w-full py-3 rounded-2xl font-bold transition-all hover:scale-105"
            style={{ background: T.primary, color: "#fff" }}>
            Acessar portal de parceiros
          </button>
        </div>
      </div>
    );
  }

  const selectedTier = TIERS.find(t => t.id === form.tier)!;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} style={{ color: T.textSub }} />
        </button>
        <div>
          <h1 className="font-bold text-lg">Cadastro de Parceiro</h1>
          <p className="text-xs" style={{ color: T.textSub }}>Etapa {step + 1} de {STEPS.length} — {STEPS[step].label}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > i;
            const active = step === i;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: done ? T.success : active ? T.primary : T.border, color: done || active ? "#fff" : T.textSub }}>
                    {done ? <Check size={16} /> : <Icon size={15} />}
                  </div>
                  <span className="text-xs hidden md:block" style={{ color: active ? T.primary : T.textSub }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="h-0.5 flex-1 mx-1 mb-5" style={{ background: step > i ? T.success : T.border }} />}
              </div>
            );
          })}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Seu perfil</h2>
              <p className="text-sm" style={{ color: T.textSub }}>Quem será o ponto de contato da parceria?</p>
            </div>
            <Field label="Nome completo"   placeholder="Carlos Meireles"        value={form.name}  onChange={v => set("name", v)}  />
            <Field label="E-mail"          placeholder="carlos@agencia.com.br"  value={form.email} onChange={v => set("email", v)} type="email" />
            <Field label="WhatsApp"        placeholder="(11) 9 9999-9999"       value={form.phone} onChange={v => set("phone", v)} />
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.textSub }}>Seu cargo</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: T.panel, border: `1px solid ${T.border}`, color: form.role ? T.text : T.textSub }}>
                <option value="">Selecione...</option>
                {["Sócio / Fundador","Diretor Comercial","Gerente de Vendas","Consultor","Outros"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Sua empresa</h2>
              <p className="text-sm" style={{ color: T.textSub }}>Dados da razão social que assina o contrato de parceria.</p>
            </div>
            <Field label="Razão social"    placeholder="Agência Mídia Digital Ltda." value={form.company} onChange={v => set("company", v)} />
            <Field label="CNPJ"            placeholder="00.000.000/0001-00"           value={form.cnpj}    onChange={v => set("cnpj", v)} />
            <Field label="Site (opcional)" placeholder="https://agencia.com.br"       value={form.website} onChange={v => set("website", v)} />
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.textSub }}>Tamanho da equipe</label>
              <select value={form.employees} onChange={e => set("employees", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: T.panel, border: `1px solid ${T.border}`, color: form.employees ? T.text : T.textSub }}>
                <option value="">Selecione...</option>
                {["1–5 pessoas","6–20 pessoas","21–50 pessoas","51–200 pessoas","200+ pessoas"].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Território de atuação</h2>
              <p className="text-sm" style={{ color: T.textSub }}>Selecione os estados onde você vai comercializar telas DOOHPLAY.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATES.map(s => {
                const active = form.states.includes(s);
                return (
                  <button key={s} onClick={() => toggleState(s)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: active ? T.primary + "20" : T.border, color: active ? T.primary : T.textSub, border: `1px solid ${active ? T.primary + "50" : "transparent"}` }}>
                    {s} {active && "✓"}
                  </button>
                );
              })}
            </div>
            {form.states.length > 0 && (
              <p className="text-xs" style={{ color: T.success }}>{form.states.length} estado{form.states.length > 1 ? "s" : ""} selecionado{form.states.length > 1 ? "s" : ""}: {form.states.join(", ")}</p>
            )}
            <Field label="Cidades principais (opcional)" placeholder="São Paulo, Campinas, Santos" value={form.cities} onChange={v => set("cities", v)} />
            <div className="flex items-center gap-3 p-4 rounded-xl cursor-pointer" style={{ background: T.panel, border: `1px solid ${T.border}` }}
              onClick={() => set("exclusivity", !form.exclusivity)}>
              <div className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ background: form.exclusivity ? T.primary : T.border }}>
                {form.exclusivity && <Check size={12} color="#fff" />}
              </div>
              <div>
                <p className="text-sm font-semibold">Solicitar exclusividade territorial</p>
                <p className="text-xs" style={{ color: T.textSub }}>Reserva o território para sua carteira por 12 meses (sujeito à aprovação)</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Modelo de comissão</h2>
              <p className="text-sm" style={{ color: T.textSub }}>Escolha o nível que melhor representa seu volume esperado.</p>
            </div>
            <div className="space-y-3">
              {TIERS.map(tier => {
                const active = form.tier === tier.id;
                return (
                  <button key={tier.id} onClick={() => set("tier", tier.id)}
                    className="w-full p-5 rounded-2xl border text-left transition-all"
                    style={{ background: active ? T.primary + "12" : T.card, borderColor: active ? tier.color : T.border }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star size={14} style={{ color: tier.color }} />
                          <p className="font-bold" style={{ color: tier.color }}>{tier.label}</p>
                          {tier.id === "gold" && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: T.gold + "20", color: T.gold }}>Mais popular</span>}
                        </div>
                        <p className="text-xs" style={{ color: T.textSub }}>Mínimo {tier.minScreens} telas ativas na carteira</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: tier.color }}>{tier.commission}%</p>
                        <p className="text-xs" style={{ color: T.textSub }}>comissão</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tier.features.map(f => (
                        <span key={f} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: T.border, color: T.textSub }}>
                          <Check size={9} style={{ color: T.success }} /> {f}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1">Revisão final</h2>
              <p className="text-sm" style={{ color: T.textSub }}>Confirme os dados antes de enviar.</p>
            </div>
            <div className="p-5 rounded-2xl border space-y-3" style={{ background: T.card, borderColor: T.border }}>
              {[
                ["Nome",        form.name],
                ["E-mail",      form.email],
                ["WhatsApp",    form.phone],
                ["Empresa",     form.company],
                ["CNPJ",        form.cnpj],
                ["Estados",     form.states.join(", ") || "—"],
                ["Tier",        `${selectedTier.label} (${selectedTier.commission}% comissão)`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm border-b py-2" style={{ borderColor: T.border }}>
                  <span style={{ color: T.textSub }}>{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl cursor-pointer" style={{ background: T.panel, border: `1px solid ${T.border}` }}
              onClick={() => set("agreement", !form.agreement)}>
              <div className="w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0 transition-colors" style={{ background: form.agreement ? T.primary : T.border }}>
                {form.agreement && <Check size={12} color="#fff" />}
              </div>
              <p className="text-sm" style={{ color: T.textSub }}>
                Concordo com os <span style={{ color: T.primary }}>Termos de Parceria DOOHPLAY</span> e autorizo contato comercial pelo número informado.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => Math.max(0, s - 1) as Step)}
            disabled={step === 0}
            className="px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
            style={{ background: step === 0 ? "transparent" : T.border, color: step === 0 ? T.textSub : T.text, opacity: step === 0 ? 0 : 1 }}>
            Voltar
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(s => (s + 1) as Step)}
              disabled={!canNext[step]}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: canNext[step] ? T.primary : T.border, color: canNext[step] ? "#fff" : T.textSub, cursor: canNext[step] ? "pointer" : "not-allowed" }}>
              Próximo <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={handleSubmit}
              disabled={!canNext[4] || submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: canNext[4] ? T.success : T.border, color: canNext[4] ? "#fff" : T.textSub, cursor: canNext[4] ? "pointer" : "not-allowed" }}>
              {submitting ? "Enviando..." : <><CheckCircle size={15} /> Enviar candidatura</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
