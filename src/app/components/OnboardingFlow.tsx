import { useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Tv, MapPin, Zap, Palette,
  Rocket, Store, Dumbbell, Building2, GraduationCap, Heart, Plane,
  Coffee, ShoppingBag, Wifi, Shield, DollarSign, Star, ChevronRight,
  Upload, Plus, X, Check
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#181C30",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", text: "#ECF0FF", textSub: "#4A5280",
};

const STEPS = [
  { id: 1, label: "Tipo de Negócio", icon: Store },
  { id: 2, label: "Suas TVs",        icon: Tv },
  { id: 3, label: "Localização",     icon: MapPin },
  { id: 4, label: "Integrações",     icon: Zap },
  { id: 5, label: "Primeiro Template", icon: Palette },
  { id: 6, label: "Publicar!",       icon: Rocket },
];

const BUSINESS_TYPES = [
  { id:"restaurant", label:"Restaurante",   icon:Coffee,      desc:"Cardápio, promoções, delivery",     color:"#FF6B35" },
  { id:"retail",     label:"Varejo",        icon:ShoppingBag, desc:"Promoções, lançamentos, vitrine",   color:"#4F6EF7" },
  { id:"gym",        label:"Academia",      icon:Dumbbell,    desc:"Horários, aulas, planos",           color:"#00DC82" },
  { id:"corporate",  label:"Corporativo",   icon:Building2,   desc:"Lobby, KPIs, comunicados",         color:"#0EA5E9" },
  { id:"education",  label:"Educação",      icon:GraduationCap,desc:"Grade de aulas, avisos, eventos", color:"#6366F1" },
  { id:"health",     label:"Saúde",         icon:Heart,       desc:"Clínicas, hospitais, farmácias",   color:"#EC4899" },
  { id:"hotel",      label:"Hotelaria",     icon:Plane,       desc:"Lobby, serviços, atrações",        color:"#F59E0B" },
  { id:"mall",       label:"Shopping",      icon:Store,       desc:"Vitrine, promoções, eventos",       color:"#8B5CF6" },
];

const TV_POSITIONS = [
  "Entrada / Recepção", "Sala de Espera", "Corredor Principal",
  "Caixa / Balcão", "Mesa / Área de Consumo", "Fachada Externa",
  "Banheiro / Vestiário", "Estacionamento",
];

const INTEGRATIONS = [
  { id:"ifood",    label:"iFood",         icon:"🍔", desc:"Sincronize cardápio e promoções",          color:"#EA1D2C", cat:"Delivery" },
  { id:"rappi",    label:"Rappi",         icon:"🛵", desc:"Atualize ofertas em tempo real",           color:"#FF441F", cat:"Delivery" },
  { id:"totvs",    label:"TOTVS",         icon:"💼", desc:"Dados do ERP direto na tela",              color:"#00A650", cat:"ERP" },
  { id:"bling",    label:"Bling",         icon:"📦", desc:"Estoque e pedidos integrados",             color:"#0066CC", cat:"ERP" },
  { id:"google",   label:"Google Sheets", icon:"📊", desc:"Dados de planilhas em tempo real",         color:"#34A853", cat:"Dados" },
  { id:"meta",     label:"Meta Ads",      icon:"📱", desc:"Sincronize criativos do Facebook/Insta",   color:"#0668E1", cat:"Mídia" },
  { id:"openai",   label:"OpenAI",        icon:"🧠", desc:"Geração de conteúdo com IA",               color:"#10A37F", cat:"IA" },
  { id:"webhook",  label:"Webhook",       icon:"⚡", desc:"Qualquer sistema via HTTP",                color:"#6366F1", cat:"Dev" },
];

const STARTER_TEMPLATES = [
  { id:"menu",      label:"Menu do Dia",      preview:"#FF6B35", cat:"Alimentação" },
  { id:"promo",     label:"Promoção Flash",   preview:"#7C3AED", cat:"Vendas" },
  { id:"welcome",   label:"Boas-vindas",      preview:"#0EA5E9", cat:"Corporativo" },
  { id:"schedule",  label:"Grade de Aulas",   preview:"#3B82F6", cat:"Educação" },
  { id:"kpi",       label:"KPIs Ao Vivo",     preview:"#10B981", cat:"Dados" },
  { id:"countdown", label:"Contagem Regressiva", preview:"#EC4899", cat:"Eventos" },
];

type TV = { id: number; position: string; size: string; name: string };

export default function OnboardingFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [bizType, setBizType] = useState("");
  const [tvs, setTvs] = useState<TV[]>([{ id: 1, position: "Entrada / Recepção", size: '55"', name: "TV Principal" }]);
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [template, setTemplate] = useState("menu");
  const [apiKey] = useState(`dpk_live_${Math.random().toString(36).slice(2,18)}`);

  const biz = BUSINESS_TYPES.find(b => b.id === bizType);
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const addTV = () => setTvs(t => [...t, { id: Date.now(), position: TV_POSITIONS[0], size: '43"', name: `TV ${t.length + 1}` }]);
  const removeTV = (id: number) => setTvs(t => t.filter(tv => tv.id !== id));
  const toggleInt = (id: string) => setIntegrations(i => i.includes(id) ? i.filter(x => x !== id) : [...i, id]);

  const selTpl = STARTER_TEMPLATES.find(t => t.id === template);

  return (
    <div className="h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: T.textSub }}>
          <ArrowLeft size={15} /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})` }}>
            <Rocket size={13} color="#fff" />
          </div>
          <span className="font-bold text-sm">Setup DOOHPLAY</span>
        </div>
        <div className="text-xs font-mono" style={{ color: T.textSub }}>Passo {step} de {STEPS.length}</div>
      </div>

      {/* Progress bar */}
      <div className="h-1 flex-shrink-0" style={{ background: T.border }}>
        <div className="h-1 transition-all duration-500" style={{ width: `${progress}%`, background: `linear-gradient(90deg,${T.primary},${T.accent})` }} />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-0 py-5 flex-shrink-0 border-b" style={{ borderColor: T.border }}>
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{ background: done ? T.success : active ? T.primary : T.card, border: `2px solid ${done ? T.success : active ? T.primary : T.border}` }}>
                  {done ? <Check size={14} color="#fff" /> : <Icon size={14} color={active ? "#fff" : T.textSub} />}
                </div>
                <span className="text-[9px] font-semibold whitespace-nowrap" style={{ color: active ? T.primary : done ? T.success : T.textSub }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-12 h-px mx-1 mb-4" style={{ background: step > s.id ? T.success : T.border }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">

          {/* STEP 1: Tipo de negócio */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black mb-1">Qual é o seu tipo de negócio?</h2>
              <p className="mb-6 text-sm" style={{ color: T.textSub }}>Vamos personalizar sua experiência e sugerir os melhores templates.</p>
              <div className="grid grid-cols-4 gap-3">
                {BUSINESS_TYPES.map(b => {
                  const Icon = b.icon;
                  return (
                    <button key={b.id} onClick={() => setBizType(b.id)}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl border text-center transition-all hover:scale-[1.02]"
                      style={{ border: `2px solid ${bizType === b.id ? b.color : T.border}`, background: bizType === b.id ? `${b.color}12` : T.card, boxShadow: bizType === b.id ? `0 0 0 4px ${b.color}20` : "none" }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${b.color}20` }}>
                        <Icon size={24} style={{ color: b.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{b.label}</div>
                        <div className="text-[10px] mt-0.5 leading-tight" style={{ color: T.textSub }}>{b.desc}</div>
                      </div>
                      {bizType === b.id && <CheckCircle2 size={16} style={{ color: b.color }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: TVs */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-black mb-1">Configure suas TVs</h2>
              <p className="mb-6 text-sm" style={{ color: T.textSub }}>Adicione cada tela da sua rede. Você pode ajustar posição e tamanho depois.</p>
              <div className="space-y-3 mb-4">
                {tvs.map((tv, i) => (
                  <div key={tv.id} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${T.primary}20` }}>
                      <Tv size={18} style={{ color: T.primary }} />
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-[9px] font-bold uppercase mb-1" style={{ color: T.textSub }}>Nome</div>
                        <input value={tv.name} onChange={e => setTvs(t => t.map(x => x.id === tv.id ? { ...x, name: e.target.value } : x))}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }} />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold uppercase mb-1" style={{ color: T.textSub }}>Posição</div>
                        <select value={tv.position} onChange={e => setTvs(t => t.map(x => x.id === tv.id ? { ...x, position: e.target.value } : x))}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}>
                          {TV_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold uppercase mb-1" style={{ color: T.textSub }}>Tamanho</div>
                        <select value={tv.size} onChange={e => setTvs(t => t.map(x => x.id === tv.id ? { ...x, size: e.target.value } : x))}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}>
                          {['32"','43"','50"','55"','65"','75"','86"'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    {tvs.length > 1 && (
                      <button onClick={() => removeTV(tv.id)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: T.textSub }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addTV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold hover:opacity-80 transition-opacity w-full justify-center"
                style={{ borderColor: T.primary, color: T.primary }}>
                <Plus size={16} /> Adicionar outra TV
              </button>
              <div className="mt-5 p-4 rounded-2xl border" style={{ border: `1px solid ${T.success}30`, background: `${T.success}08` }}>
                <div className="text-sm font-bold mb-1" style={{ color: T.success }}>Estimativa de receita</div>
                <div className="text-2xl font-black font-mono" style={{ color: T.success }}>R$ {(tvs.length * 4380).toLocaleString("pt-BR")}<span className="text-sm font-normal ml-1" style={{ color: T.textSub }}>/mês</span></div>
                <div className="text-xs mt-1" style={{ color: T.textSub }}>Baseado em {tvs.length} TV{tvs.length > 1 ? "s" : ""} · Fill rate 68% · CPM R$18,40</div>
              </div>
            </div>
          )}

          {/* STEP 3: Localização */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-black mb-1">Onde fica seu negócio?</h2>
              <p className="mb-6 text-sm" style={{ color: T.textSub }}>Usamos sua localização para segmentação de audiência e relatórios regionais.</p>
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: T.textSub }}>Nome do estabelecimento</label>
                  <input defaultValue={biz?.label ? `${biz.label} Central` : "Meu Negócio"} className="w-full px-4 py-3 rounded-xl border outline-none text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: T.textSub }}>Endereço</label>
                  <input defaultValue="Av. Paulista, 1000" className="w-full px-4 py-3 rounded-xl border outline-none text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: T.textSub }}>Cidade</label>
                  <input value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: T.textSub }}>Estado</label>
                  <select value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none text-sm" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                    {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border" style={{ border: `1px solid ${T.border}` }}>
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=220&fit=crop&auto=format" alt="Map" className="w-full object-cover" style={{ height: "160px", opacity: 0.6 }} />
                <div className="p-4" style={{ background: T.card }}>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: T.primary }} />
                    <span className="text-sm font-medium">{city}, {state} · Brasil</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: `${T.success}20`, color: T.success }}>Verificado</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Integrações */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-black mb-1">Conecte suas ferramentas</h2>
              <p className="mb-6 text-sm" style={{ color: T.textSub }}>Integre com sistemas que você já usa para sincronizar conteúdo automaticamente. Opcional — pode fazer depois.</p>
              <div className="grid grid-cols-2 gap-3">
                {INTEGRATIONS.map(int => {
                  const active = integrations.includes(int.id);
                  return (
                    <button key={int.id} onClick={() => toggleInt(int.id)}
                      className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all"
                      style={{ border: `1.5px solid ${active ? int.color : T.border}`, background: active ? `${int.color}10` : T.card, boxShadow: active ? `0 0 0 3px ${int.color}15` : "none" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: `${int.color}15` }}>{int.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{int.label}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${int.color}20`, color: int.color }}>{int.cat}</span>
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: T.textSub }}>{int.desc}</div>
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: active ? int.color : T.border }}>
                        {active && <Check size={11} color="#fff" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {integrations.length > 0 && (
                <div className="mt-4 p-3 rounded-xl border text-sm" style={{ border: `1px solid ${T.primary}30`, background: `${T.primary}10`, color: T.primary }}>
                  ✓ {integrations.length} integração{integrations.length > 1 ? "ões" : ""} selecionada{integrations.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Template */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-black mb-1">Escolha seu primeiro template</h2>
              <p className="mb-6 text-sm" style={{ color: T.textSub }}>Você poderá personalizar e criar mais templates depois no TV Designer.</p>
              <div className="grid grid-cols-3 gap-4">
                {STARTER_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className="rounded-2xl overflow-hidden border transition-all text-left group hover:scale-[1.02]"
                    style={{ border: `2px solid ${template === t.id ? t.preview : T.border}`, boxShadow: template === t.id ? `0 0 0 4px ${t.preview}20` : "none" }}>
                    <div className="relative" style={{ aspectRatio: "16/9", background: `linear-gradient(135deg,${t.preview}20,${t.preview}05)` }}>
                      <div className="absolute inset-0 flex flex-col justify-between p-3">
                        <div className="h-2 rounded-full" style={{ background: t.preview, width: "60%", opacity: 0.8 }} />
                        <div className="space-y-1">
                          <div className="h-1 rounded-full" style={{ background: t.preview, width: "80%", opacity: 0.4 }} />
                          <div className="h-3 rounded-md" style={{ background: t.preview, width: "35%", opacity: 0.7 }} />
                        </div>
                      </div>
                      {template === t.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle2 size={28} style={{ color: t.preview }} />
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2.5" style={{ background: T.card }}>
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[9px]" style={{ color: T.textSub }}>{t.cat}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Publicar */}
          {step === 6 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})`, boxShadow: `0 0 60px ${T.primary}40` }}>
                <Rocket size={36} color="#fff" />
              </div>
              <h2 className="text-3xl font-black mb-2">Tudo pronto! 🎉</h2>
              <p className="text-base mb-8" style={{ color: T.textSub }}>Sua rede DOOHPLAY está configurada e pronta para ir ao ar.</p>

              <div className="grid grid-cols-3 gap-4 mb-8 text-left">
                {[
                  { label: "Negócio", value: biz?.label ?? "—", icon: biz?.icon ?? Store, color: biz?.color ?? T.primary },
                  { label: "TVs cadastradas", value: `${tvs.length} dispositivo${tvs.length > 1 ? "s" : ""}`, icon: Tv, color: T.primary },
                  { label: "Localização", value: `${city}, ${state}`, icon: MapPin, color: "#0EA5E9" },
                  { label: "Integrações", value: integrations.length > 0 ? `${integrations.length} ativas` : "Nenhuma", icon: Zap, color: T.accent },
                  { label: "Template inicial", value: selTpl?.label ?? "—", icon: Palette, color: selTpl ? selTpl.preview : T.primary },
                  { label: "Receita estimada", value: `R$ ${(tvs.length * 4380).toLocaleString("pt-BR")}/mês`, icon: DollarSign, color: T.success },
                ].map(({ label, value, icon: Icon, color }, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: T.textSub }}>{label}</div>
                      <div className="text-sm font-semibold mt-0.5">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl border mb-6 text-left" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: T.textSub }}>Sua API Key</div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm font-mono px-3 py-2 rounded-lg" style={{ background: T.bg, color: T.primary }}>{apiKey}</code>
                  <button className="px-3 py-2 rounded-lg text-xs font-bold border" style={{ border: `1px solid ${T.border}`, color: T.textSub }}>Copiar</button>
                </div>
                <div className="text-[10px] mt-2" style={{ color: T.textSub }}>Use esta chave para conectar seus dispositivos via SDK ou API REST.</div>
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold border" style={{ border: `1px solid ${T.border}`, color: T.textSub }}>
                  Ir ao Dashboard
                </button>
                <button className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold" style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})`, color: "#fff" }}>
                  <Rocket size={16} /> Publicar Agora
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      {step < 6 && (
        <div className="flex items-center justify-between px-8 py-4 border-t flex-shrink-0" style={{ background: T.panel, borderColor: T.border }}>
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-opacity disabled:opacity-30"
            style={{ border: `1px solid ${T.border}`, color: T.textSub }}>
            <ArrowLeft size={15} /> Anterior
          </button>
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className="rounded-full transition-all" style={{ width: step === i + 1 ? "20px" : "6px", height: "6px", background: step > i ? T.success : step === i + 1 ? T.primary : T.border }} />
            ))}
          </div>
          <button onClick={() => setStep(s => Math.min(STEPS.length, s + 1))} disabled={step === 1 && !bizType}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-opacity disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})`, color: "#fff" }}>
            {step === 5 ? "Finalizar" : "Próximo"} <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
