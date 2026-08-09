import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Circle, Tv, Upload, Shield, DollarSign, Zap, Users, ArrowRight, Star, ChevronDown, ChevronUp, RefreshCw, Play } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Task {
  id: string;
  title: string;
  desc: string;
  reward: string;
  xp: number;
  view?: string;
  icon: string;
  tip?: string;
}

interface Phase {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

const PHASES: Phase[] = [
  {
    id: "setup", name: "Configuração inicial", color: T.primary,
    tasks: [
      { id: "t1", title: "Conecte sua primeira tela", desc: "Instale o DOOHPLAY Player e vincule ao painel.", reward: "Tela ativa", xp: 100, view: "screen-setup", icon: "📺", tip: "Funciona em qualquer Android TV, Fire TV ou tablet Android 8+" },
      { id: "t2", title: "Configure seu perfil de negócio", desc: "Informe o tipo de estabelecimento para atrair anunciantes relevantes.", reward: "CPM +15%", xp: 50, view: "login", icon: "🏪", tip: "Barbearias têm CPM médio de R$42 — 31% acima da média geral" },
      { id: "t3", title: "Adicione seu primeiro conteúdo", desc: "Envie uma imagem, vídeo ou ative o Canal DOOHPLAY.", reward: "Playlist pronta", xp: 75, view: "content-studio", icon: "🎨" },
    ],
  },
  {
    id: "revenue", name: "Ativar receita", color: T.success,
    tasks: [
      { id: "t4", title: "Ative o Canal DOOHPLAY", desc: "12 canais de conteúdo gratuito que preenchem o fill rate e geram receita.", reward: "Fill rate +23%", xp: 80, view: "content-studio", icon: "📡", tip: "O Canal DOOHPLAY aumenta o fill rate médio de 71% para 94%" },
      { id: "t5", title: "Configure o sorteio ponderado", desc: "Defina os pesos 60/20/15/5% para maximizar o CPM médio.", reward: "CPM +31%", xp: 120, view: "content-studio", icon: "🎲" },
      { id: "t6", title: "Crie sua primeira peça com IA", desc: "Gere uma peça profissional em segundos com o Gemini.", reward: "1 geração grátis", xp: 60, view: "content-studio", icon: "🤖" },
    ],
  },
  {
    id: "proof", name: "Garantir transparência", color: T.accent,
    tasks: [
      { id: "t7", title: "Verifique sua primeira prova", desc: "Acesse o verificador público e confirme uma prova de exibição.", reward: "Score 100/100", xp: 90, view: "proof-verifier", icon: "🔐", tip: "Compartilhe provas com seus anunciantes para aumentar a confiança" },
      { id: "t8", title: "Baixe o relatório de prova", desc: "Exporte um PDF certificado com assinatura ICP-Brasil.", reward: "Documento legal", xp: 70, view: "proofchain-center", icon: "📄" },
    ],
  },
  {
    id: "growth", name: "Crescer a rede", color: T.warning,
    tasks: [
      { id: "t9",  title: "Indique um estabelecimento", desc: "Compartilhe seu link de indicação e ganhe R$50 por ativação.", reward: "R$50 de bônus", xp: 150, view: "referral", icon: "🤝" },
      { id: "t10", title: "Configure o calendário de conteúdo", desc: "Planeje os conteúdos da semana e aumente o CPM em horário nobre.", reward: "CPM +63% no pico", xp: 100, view: "content-calendar", icon: "📅" },
      { id: "t11", title: "Explore o Otimizador de Receita", desc: "Veja recomendações personalizadas para dobrar seu faturamento.", reward: "+R$420/mês potencial", xp: 80, view: "revenue-optimizer", icon: "📈" },
    ],
  },
];

const ALL_TASKS = PHASES.flatMap(p => p.tasks);
const TOTAL_XP = ALL_TASKS.reduce((a, t) => a + t.xp, 0);

interface Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  initialCompleted?: string[];
}

function Confetti() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            width: 8, height: 8,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: [T.primary, T.success, T.accent, T.warning, T.gold][Math.floor(Math.random() * 5)],
            animationDuration: `${0.5 + Math.random()}s`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0.8,
          }} />
      ))}
    </div>
  );
}

export default function OnboardingChecklist({ onBack, onNavigate, initialCompleted = ["t1", "t2"] }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted));
  const [expanded, setExpanded] = useState<string | null>("setup");
  const [showConfetti, setShowConfetti] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const totalXp = [...completed].reduce((a, id) => {
    const t = ALL_TASKS.find(t => t.id === id);
    return a + (t?.xp ?? 0);
  }, 0);

  const progress = Math.round((completed.size / ALL_TASKS.length) * 100);
  const xpProgress = Math.round((totalXp / TOTAL_XP) * 100);

  const handleComplete = (task: Task) => {
    if (completed.has(task.id)) return;
    setCompleted(prev => new Set([...prev, task.id]));
    setJustCompleted(task.id);
    setTimeout(() => setJustCompleted(null), 2000);
    if (completed.size + 1 === ALL_TASKS.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleAction = (task: Task) => {
    if (task.view && onNavigate) {
      onNavigate(task.view);
    }
    handleComplete(task);
  };

  const phaseProgress = (phase: Phase) => {
    const done = phase.tasks.filter(t => completed.has(t.id)).length;
    return { done, total: phase.tasks.length, pct: Math.round((done / phase.tasks.length) * 100) };
  };

  const level = totalXp >= 800 ? 5 : totalXp >= 500 ? 4 : totalXp >= 300 ? 3 : totalXp >= 150 ? 2 : 1;
  const levelNames = ["", "Iniciante", "Ativo", "Crescendo", "Avançado", "Expert"];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
              <Star size={18} style={{ color: T.primary }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Guia de Início</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{completed.size}/{ALL_TASKS.length} tarefas · {progress}% completo</p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-black text-sm" style={{ color: T.primary }}>{totalXp} XP</div>
            <div className="text-xs" style={{ color: T.textSub }}>Nível {level} · {levelNames[level]}</div>
          </div>
        </div>
        {/* Overall progress */}
        <div className="max-w-2xl mx-auto px-6 pb-3">
          <div className="h-2 rounded-full" style={{ background: T.border }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.success})` }} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Hero banner */}
        {progress < 100 ? (
          <div className="rounded-2xl border p-6 text-center" style={{ background: `linear-gradient(135deg, ${T.primary}15, ${T.accent}08)`, borderColor: T.primary + "25" }}>
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="text-2xl font-black mb-2">Complete a configuração</h2>
            <p style={{ color: T.textSub }}>
              Faltam <strong className="text-white">{ALL_TASKS.length - completed.size} tarefas</strong> para ativar sua tela completamente e maximizar a receita.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: T.primary }}>{progress}%</div>
                <div className="text-xs" style={{ color: T.textSub }}>concluído</div>
              </div>
              <div className="w-px h-8" style={{ background: T.border }} />
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: T.success }}>{totalXp}</div>
                <div className="text-xs" style={{ color: T.textSub }}>XP ganho</div>
              </div>
              <div className="w-px h-8" style={{ background: T.border }} />
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: T.warning }}>Nv.{level}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{levelNames[level]}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border p-6 text-center" style={{ background: `linear-gradient(135deg, ${T.success}15, ${T.success}05)`, borderColor: T.success + "30" }}>
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: T.success }}>Configuração completa!</h2>
            <p style={{ color: T.textSub }}>Sua tela está totalmente configurada e otimizada. Continue crescendo!</p>
          </div>
        )}

        {/* Phases */}
        {PHASES.map(phase => {
          const pp = phaseProgress(phase);
          const isExpanded = expanded === phase.id;
          return (
            <div key={phase.id} className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: pp.done === pp.total ? phase.color + "30" : T.border }}>
              {/* Phase header */}
              <button onClick={() => setExpanded(isExpanded ? null : phase.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-white/2 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: pp.done === pp.total ? phase.color + "20" : T.panel, border: `1.5px solid ${pp.done === pp.total ? phase.color : T.border}` }}>
                  {pp.done === pp.total
                    ? <CheckCircle size={18} style={{ color: phase.color }} />
                    : <span className="text-lg">{["🚀", "💰", "🔐", "📈"][PHASES.indexOf(phase)]}</span>
                  }
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{phase.name}</span>
                    {pp.done === pp.total && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: phase.color + "20", color: phase.color }}>✓ Completo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full" style={{ background: T.border }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pp.pct}%`, background: phase.color }} />
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: T.textSub }}>{pp.done}/{pp.total}</span>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={16} style={{ color: T.textSub }} /> : <ChevronDown size={16} style={{ color: T.textSub }} />}
              </button>

              {/* Tasks */}
              {isExpanded && (
                <div className="border-t" style={{ borderColor: T.border }}>
                  {phase.tasks.map((task, ti) => {
                    const isDone = completed.has(task.id);
                    const isJustDone = justCompleted === task.id;
                    return (
                      <div key={task.id}
                        className="flex items-start gap-4 p-5 border-b last:border-0 transition-all"
                        style={{ borderColor: T.border, background: isJustDone ? T.success + "08" : "transparent" }}>
                        <div className="flex-shrink-0 mt-0.5">
                          {isDone
                            ? <CheckCircle size={22} style={{ color: T.success }} />
                            : <div className="w-5 h-5 rounded-full border-2 mt-0.5" style={{ borderColor: T.border }} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{task.icon}</span>
                            <span className={`font-bold text-sm ${isDone ? "line-through" : ""}`}
                              style={{ color: isDone ? T.textSub : T.text }}>
                              {task.title}
                            </span>
                          </div>
                          <p className="text-sm mb-2" style={{ color: T.textSub }}>{task.desc}</p>
                          {task.tip && !isDone && (
                            <div className="text-xs px-2.5 py-1.5 rounded-lg mb-2" style={{ background: T.primary + "10", color: T.primary, border: `1px solid ${T.primary}20` }}>
                              💡 {task.tip}
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: T.success + "15", color: T.success }}>
                              +{task.xp} XP
                            </span>
                            <span className="text-xs" style={{ color: T.textSub }}>→ {task.reward}</span>
                          </div>
                        </div>
                        {!isDone ? (
                          <button onClick={() => handleAction(task)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all hover:opacity-90"
                            style={{ background: `linear-gradient(135deg, ${phase.color}, ${phase.color}CC)`, color: "#fff" }}>
                            Ir <ArrowRight size={12} />
                          </button>
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: T.success + "20" }}>
                            <CheckCircle size={15} style={{ color: T.success }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* XP tracker */}
        <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
          <h3 className="font-bold mb-4">Sua progressão</h3>
          <div className="space-y-3">
            {[
              { label: "Nível 1 · Iniciante",   xp: 0,    color: T.textSub },
              { label: "Nível 2 · Ativo",        xp: 150,  color: T.primary },
              { label: "Nível 3 · Crescendo",    xp: 300,  color: T.accent },
              { label: "Nível 4 · Avançado",     xp: 500,  color: T.warning },
              { label: "Nível 5 · Expert",       xp: 800,  color: T.success },
            ].map((lvl, i) => {
              const isReached = totalXp >= lvl.xp;
              const isCurrent = level === i + 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{ background: isReached ? lvl.color + "20" : T.panel, color: isReached ? lvl.color : T.textSub, border: `1.5px solid ${isReached ? lvl.color : T.border}` }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: isReached ? T.text : T.textSub }}>{lvl.label}</div>
                  </div>
                  <div className="text-xs font-mono" style={{ color: isReached ? lvl.color : T.textSub }}>{lvl.xp} XP</div>
                  {isCurrent && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: lvl.color }} />}
                  {isReached && !isCurrent && <CheckCircle size={14} style={{ color: lvl.color }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
