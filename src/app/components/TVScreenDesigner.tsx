import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Tv, Grid3X3, ZoomIn, ZoomOut, Play, Pause, Download,
  Share2, Save, Undo2, Redo2, Eye, EyeOff, Lock, Unlock, Plus,
  Trash2, Type, Square, Circle, Image, Film, Clock, BarChart2,
  Shield, CheckCircle2, X, Search, MousePointer, Move, Sparkles,
  Layers, Hash, TrendingUp, Target, Zap, Star, Monitor, Wifi,
  Activity, DollarSign, Users, ChevronDown, LayoutGrid, RefreshCw,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Globe, Radio
} from "lucide-react";

const T = {
  bg: "#05060E",
  panel: "#0A0C18",
  panel2: "#0D0F1E",
  card: "#11132200",
  cardSolid: "#111322",
  border: "#181C30",
  borderBright: "#232844",
  primary: "#4E6BFF",
  primaryGlow: "rgba(78,107,255,0.18)",
  accent: "#7C5CFC",
  cyan: "#06C8FF",
  success: "#00DC82",
  warning: "#FFAA00",
  danger: "#FF4D6A",
  purple: "#9B6DFF",
  pink: "#FF3EA5",
  text: "#ECF0FF",
  textSub: "#4A5280",
  textMuted: "#1E2340",
};

// ─── Environments ───────────────────────────────────────────────────────────
const ENVS = [
  { id:"restaurant", label:"Restaurante", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=800&fit=crop&auto=format", ambientColor:"#FF6B35", audienceCount:34 },
  { id:"mall",       label:"Shopping",   img:"https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1400&h=800&fit=crop&auto=format", ambientColor:"#4E6BFF", audienceCount:127 },
  { id:"gym",        label:"Academia",   img:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=800&fit=crop&auto=format", ambientColor:"#00DC82", audienceCount:18 },
  { id:"hotel",      label:"Hotel Lobby",img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&h=800&fit=crop&auto=format", ambientColor:"#FFAA00", audienceCount:22 },
  { id:"hospital",   label:"Hospital",   img:"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&h=800&fit=crop&auto=format", ambientColor:"#06C8FF", audienceCount:41 },
  { id:"airport",    label:"Aeroporto",  img:"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&h=800&fit=crop&auto=format", ambientColor:"#9B6DFF", audienceCount:289 },
];

// ─── Templates (canvas renders) ─────────────────────────────────────────────
const TEMPLATES = [
  { id:"menu-dia",        cat:"Alimentação",   label:"Menu do Dia",         tag:"Popular",      colors:["#180800","#FF6B35","#FFD700"], accent:"#FF6B35" },
  { id:"cardapio-premium",cat:"Alimentação",   label:"Cardápio Premium",    tag:"Novo",         colors:["#0B1117","#22D3EE","#FFF"],   accent:"#22D3EE" },
  { id:"happy-hour",      cat:"Alimentação",   label:"Happy Hour",          tag:"",             colors:["#180033","#FF2D78","#FFD700"],accent:"#FF2D78" },
  { id:"promocao-flash",  cat:"Retail Media",  label:"Promoção Flash",      tag:"Alta Conv.",   colors:["#09000F","#7C3AED","#F59E0B"],accent:"#7C3AED" },
  { id:"retail-samsung",  cat:"Retail Media",  label:"Samsung Campaign",    tag:"Parceiro",     colors:["#000714","#1428A0","#FFF"],   accent:"#1428A0" },
  { id:"imoveis",         cat:"Retail Media",  label:"Imóveis Premium",     tag:"",             colors:["#060F18","#10B981","#F1F5F9"],accent:"#10B981" },
  { id:"fashion",         cat:"Retail Media",  label:"Fashion Drop",        tag:"Novo",         colors:["#0A000D","#EC4899","#FFF"],   accent:"#EC4899" },
  { id:"horario-aulas",   cat:"Educação",      label:"Grade de Aulas",      tag:"",             colors:["#020917","#3B82F6","#F1F5F9"],accent:"#3B82F6" },
  { id:"avisos-campus",   cat:"Educação",      label:"Avisos Campus",       tag:"",             colors:["#04101D","#6366F1","#F1F5F9"],accent:"#6366F1" },
  { id:"lobby-corp",      cat:"Corporativo",   label:"Lobby Corporativo",   tag:"Enterprise",   colors:["#020509","#0EA5E9","#CBD5E1"],accent:"#0EA5E9" },
  { id:"kpi-realtime",    cat:"Corporativo",   label:"KPIs Tempo Real",     tag:"Live",         colors:["#020817","#10B981","#3B82F6"],accent:"#10B981" },
  { id:"split-screen",    cat:"Entretenimento",label:"Split Screen News",   tag:"",             colors:["#030712","#F59E0B","#EF4444"],accent:"#F59E0B" },
  { id:"event-countdown", cat:"Entretenimento",label:"Contagem Regressiva", tag:"Dinâmico",     colors:["#0F0019","#EC4899","#F59E0B"],accent:"#EC4899" },
  { id:"clinica",         cat:"Saúde",         label:"Clínica & Bem-Estar", tag:"Novo",         colors:["#031116","#06B6D4","#FFF"],   accent:"#06B6D4" },
];

function TplRender({ id }: { id: string }) {
  return <div className="w-full h-full flex items-center justify-center" style={{ background: "#0A0C18", color: "#4A5280", fontSize: "12px" }}>{id}</div>;
}

function Counter({ target, prefix="", suffix="", speed=80 }: { target:number; prefix?:string; suffix?:string; speed?:number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const step = Math.max(1, Math.floor(target / 60));
    const id = setInterval(() => setVal(v => { const next = v + step; if (next >= target) { clearInterval(id); return target; } return next; }), speed);
    return () => clearInterval(id);
  }, [target, speed]);
  return <>{prefix}{val.toLocaleString("pt-BR")}{suffix}</>;
}

function HashStream() {
  const [hashes, setHashes] = useState<{hash:string;time:string;rev:string}[]>([]);
  useEffect(() => {
    const gen = () => `0x${Math.random().toString(16).slice(2,10)}...${Math.random().toString(16).slice(2,6)}`;
    const time = () => { const d = new Date(); return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`; };
    const rev = () => `R$ ${(Math.random()*0.05+0.01).toFixed(4)}`;
    const id = setInterval(() => {
      setHashes(hs => [{ hash:gen(), time:time(), rev:rev() }, ...hs].slice(0, 12));
    }, 1800);
    setHashes([{ hash:gen(), time:time(), rev:rev() }]);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-1 overflow-hidden">
      {hashes.map((h, i) => (
        <div key={i} className="flex items-center justify-between px-2 py-1 rounded text-[8px]"
          style={{ background: i === 0 ? "#00DC8212" : "transparent", border: i === 0 ? "1px solid #00DC8225" : "1px solid transparent", opacity: 1 - i * 0.07 }}>
          <div className="font-mono" style={{ color: i === 0 ? "#00DC82" : T.textSub }}>{h.hash}</div>
          <div className="font-mono" style={{ color: T.textSub }}>{h.time}</div>
          <div className="font-mono" style={{ color: i === 0 ? "#00DC82" : T.textSub }}>{h.rev}</div>
        </div>
      ))}
    </div>
  );
}

function AudienceDots({ count }: { count: number }) {
  const dots = Array.from({ length: Math.min(count, 40) }, (_, i) => ({
    x: 15 + Math.random() * 70,
    y: 60 + Math.random() * 35,
    size: 3 + Math.random() * 4,
    delay: Math.random() * 2,
  }));
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={`${d.x}%`} cy={`${d.y}%`} r={d.size} fill="#06C8FF" opacity="0.6"
            style={{ animation: `pulse ${1.5 + d.delay}s ease-in-out infinite alternate` }} />
          <circle cx={`${d.x}%`} cy={`${d.y}%`} r={d.size * 2.5} fill="#06C8FF" opacity="0.12" />
        </g>
      ))}
      <style>{`@keyframes pulse { from { opacity:0.3; transform:scale(0.8); } to { opacity:0.8; transform:scale(1.1); } }`}</style>
    </svg>
  );
}

const PLAYLIST = [
  { id:1, tpl:"menu-dia",         label:"Menu do Dia",      dur:15, color:"#FF6B35", revenue:8.40 },
  { id:2, tpl:"promocao-flash",   label:"Promoção Flash",   dur:10, color:"#7C3AED", revenue:12.20 },
  { id:3, tpl:"retail-samsung",   label:"Samsung Campaign", dur:20, color:"#1428A0", revenue:22.60 },
  { id:4, tpl:"kpi-realtime",     label:"KPIs Tempo Real",  dur:25, color:"#10B981", revenue:0 },
  { id:5, tpl:"happy-hour",       label:"Happy Hour",       dur:12, color:"#FF2D78", revenue:6.80 },
];

const CATS = ["Todos","Alimentação","Retail Media","Educação","Corporativo","Entretenimento","Saúde"];
const TRANSITIONS = ["Fade","Slide","Zoom","Flip","Wipe","Dissolve","Push","Iris"];
const PALETTE = ["#EF4444","#F97316","#F59E0B","#10B981","#06B6D4","#3B82F6","#6366F1","#8B5CF6","#EC4899","#FFFFFF","#94A3B8","#1E293B"];

export default function TVScreenDesigner({ onBack }: { onBack: () => void }) {
  const [selTpl, setSelTpl] = useState("menu-dia");
  const [leftTab, setLeftTab] = useState<"templates"|"elements"|"strategy">("templates");
  const [rightTab, setRightTab] = useState<"properties"|"layers"|"schedule">("properties");
  const [cat, setCat] = useState("Todos");
  const [query, setQuery] = useState("");
  const [envIdx, setEnvIdx] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [selLayer, setSelLayer] = useState<number|null>(1);
  const [transition, setTransition] = useState("Fade");
  const [duration, setDuration] = useState(15);
  const [preview, setPreview] = useState(false);
  const [activeTool, setActiveTool] = useState<"select"|"hand"|"text"|"shape"|"image">("select");
  const [showAI, setShowAI] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [controlRoom, setControlRoom] = useState(false);
  const [showAudience, setShowAudience] = useState(true);
  const [liveRevenue, setLiveRevenue] = useState(1284.50);
  const [liveImpressions, setLiveImpressions] = useState(24871);
  const [activePl, setActivePl] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  const env = ENVS[envIdx];
  const tpl = TEMPLATES.find(t => t.id === selTpl);
  const ambientColor = tpl?.accent ?? "#4E6BFF";
  const filtered = TEMPLATES.filter(t => (cat === "Todos" || t.cat === cat) && (query === "" || t.label.toLowerCase().includes(query.toLowerCase())));
  const totalRev = PLAYLIST.reduce((s, i) => s + i.revenue, 0);
  const totalDur = PLAYLIST.reduce((s, i) => s + i.dur, 0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setLiveRevenue(v => +(v + 0.003 + Math.random() * 0.01).toFixed(4));
      setLiveImpressions(v => v + Math.floor(Math.random() * 3));
    }, 400);
    return () => clearInterval(id);
  }, [playing]);

  const handleSave = () => { setSavedToast(true); setTimeout(() => setSavedToast(false), 2500); };

  const handleAI = () => {
    setAiLoading(true); setAiDone(false);
    setTimeout(() => { setAiLoading(false); setAiDone(true); setSelTpl("promocao-flash"); }, 2800);
  };

  const tools = [
    { id:"select", icon:MousePointer }, { id:"hand", icon:Move },
    { id:"text", icon:Type }, { id:"shape", icon:Square }, { id:"image", icon:Image },
  ] as const;

  const layers = [
    { name:"ProofChain Badge", locked:true, visible:true, color:"#22D3EE" },
    { name:"Conteúdo Principal", locked:false, visible:true, color:T.primary },
    { name:"Logo / Marca", locked:false, visible:true, color:"#8B5CF6" },
    { name:"Texto de Rodapé", locked:false, visible:true, color:"#F0B429" },
    { name:"Fundo / Background", locked:false, visible:true, color:"#64748B" },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden relative" style={{ background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif" }}>
      {savedToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background:"#00DC8218", border:"1px solid #00DC8240", color:"#00DC82", backdropFilter:"blur(16px)" }}>
          <CheckCircle2 size={14}/> Salvo com sucesso
        </div>
      )}
      <div className="flex items-center gap-2 px-4 h-11 flex-shrink-0 border-b" style={{ background:T.panel, borderColor:T.border }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-[11px] hover:opacity-70 transition-opacity" style={{ color:T.textSub }}>
          <ArrowLeft size={13}/> Voltar
        </button>
        <div className="w-px h-4" style={{ background:T.border }}/>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background:`linear-gradient(135deg,${T.primary},${T.accent})` }}>
            <Tv size={11} color="#fff"/>
          </div>
          <span className="text-[12px] font-bold" style={{ color:T.text }}>TV Studio</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black" style={{ background:`${T.primary}25`, color:T.primary }}>PRO</span>
        </div>
        <div className="flex-1"/>
        <button onClick={handleSave} className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[11px] font-bold" style={{ background:T.primary, color:"#fff" }}>
          <Save size={12}/> Salvar
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex items-center justify-center" style={{ background: T.bg }}>
          <div className="text-center" style={{ color: T.textSub }}>
            <Tv size={48} style={{ margin: "0 auto 16px", color: T.primary }}/>
            <p className="font-bold">TV Screen Designer</p>
            <p className="text-sm mt-1">Template: {selTpl}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
