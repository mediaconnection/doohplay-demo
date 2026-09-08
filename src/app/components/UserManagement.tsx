import { useState } from "react";
import {
  ArrowLeft, Users, Shield, Key, Plus, Trash2, Settings,
  CheckCircle, XCircle, Mail, Crown, Eye, Lock,
  UserCheck, Building2, RefreshCw, Download, Filter,
  MoreHorizontal, Edit2, LogIn
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }
type TabId = "users" | "roles" | "audit";

type UserRole = "owner" | "admin" | "analyst" | "creator" | "viewer";
type UserStatus = "active" | "invited" | "suspended";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  twoFA: boolean;
  modules: string[];
  createdAt: string;
}

const ROLE_META: Record<UserRole, { label: string; color: string; desc: string }> = {
  owner:   { label: "Owner",    color: T.gold,    desc: "Acesso total, cobrança, SSO" },
  admin:   { label: "Admin",    color: T.danger,  desc: "Gestão de usuários e configurações" },
  analyst: { label: "Analyst",  color: T.primary, desc: "Leitura de relatórios e dashboards" },
  creator: { label: "Creator",  color: T.accent,  desc: "Criar e editar campanhas e criativos" },
  viewer:  { label: "Viewer",   color: T.textSub, desc: "Somente visualização, sem edição" },
};

const STATUS_META: Record<UserStatus, { label: string; color: string }> = {
  active:    { label: "Ativo",     color: T.success },
  invited:   { label: "Convite",   color: T.warning },
  suspended: { label: "Suspenso",  color: T.danger  },
};

const USERS: TeamUser[] = [
  { id: "U001", name: "João Almeida",    email: "joao@doohplay.com",     role: "owner",   status: "active",    lastLogin: "Agora",      twoFA: true,  modules: ["*"],                                           createdAt: "Jan 2024" },
  { id: "U002", name: "Ana Lima",        email: "ana@doohplay.com",       role: "admin",   status: "active",    lastLogin: "2h atrás",   twoFA: true,  modules: ["*"],                                           createdAt: "Mar 2024" },
  { id: "U003", name: "Carlos Souza",    email: "carlos@ambev.com",       role: "analyst", status: "active",    lastLogin: "Ontem",      twoFA: false, modules: ["campaigns","reports","analytics"],              createdAt: "Abr 2024" },
  { id: "U004", name: "Mariana Costa",   email: "mariana@agencia.com",    role: "creator", status: "active",    lastLogin: "3 dias",     twoFA: true,  modules: ["campaigns","creative-studio","ad-scheduler"],  createdAt: "Jun 2024" },
  { id: "U005", name: "Rafael Nunes",    email: "rafael@bradesco.com",    role: "viewer",  status: "invited",   lastLogin: "–",          twoFA: false, modules: ["campaigns","reports"],                         createdAt: "Jul 2024" },
  { id: "U006", name: "Beatriz Ferreira",email: "bia@agencia2.com",       role: "creator", status: "active",    lastLogin: "1 semana",   twoFA: false, modules: ["creative-studio","media-plan"],                 createdAt: "Mai 2024" },
  { id: "U007", name: "Lucas Martins",   email: "lucas@doohplay.com",     role: "analyst", status: "suspended", lastLogin: "2 semanas",  twoFA: false, modules: ["reports","analytics"],                         createdAt: "Fev 2024" },
];

const PERMISSIONS = [
  { module: "Campanhas",        owner: true,  admin: true,  analyst: true,  creator: true,  viewer: true  },
  { module: "Creative Studio",  owner: true,  admin: true,  analyst: false, creator: true,  viewer: false },
  { module: "Relatórios",       owner: true,  admin: true,  analyst: true,  creator: false, viewer: true  },
  { module: "Financeiro",       owner: true,  admin: true,  analyst: false, creator: false, viewer: false },
  { module: "Usuários",         owner: true,  admin: true,  analyst: false, creator: false, viewer: false },
  { module: "API Playground",   owner: true,  admin: true,  analyst: false, creator: false, viewer: false },
  { module: "Fraude",           owner: true,  admin: true,  analyst: true,  creator: false, viewer: false },
  { module: "White Label",      owner: true,  admin: false, analyst: false, creator: false, viewer: false },
];

const AUDIT_LOGS = [
  { time: "14:52", user: "João Almeida",     action: "Aprovou campanha",         detail: "Bradesco Q3 — status: running",         level: "info"    },
  { time: "14:41", user: "Ana Lima",         action: "Criou usuário",             detail: "rafael@bradesco.com — role: viewer",     level: "info"    },
  { time: "13:55", user: "Mariana Costa",    action: "Upload de criativo",        detail: "Ambev Verão Hero — 2.1MB",              level: "info"    },
  { time: "12:30", user: "João Almeida",     action: "Alterou configurações SSO", detail: "Google Workspace habilitado",           level: "warning" },
  { time: "11:14", user: "Carlos Souza",     action: "Exportou relatório",        detail: "Campanha Ambev — 30 dias (CSV)",        level: "info"    },
  { time: "10:02", user: "Sistema",          action: "Login suspeito bloqueado",  detail: "IP 185.234.12.44 — 2FA required",       level: "danger"  },
  { time: "09:45", user: "João Almeida",     action: "Suspenso usuário",          detail: "lucas@doohplay.com — acesso revogado",  level: "warning" },
  { time: "Ontem", user: "Ana Lima",         action: "Alterou permissões",        detail: "creator: removido White Label access",  level: "info"    },
];

const LOGIN_ACTIVITY = [
  { d: "Seg", logins: 12 }, { d: "Ter", logins: 9  }, { d: "Qua", logins: 14 },
  { d: "Qui", logins: 11 }, { d: "Sex", logins: 18 }, { d: "Sáb", logins: 4  }, { d: "Dom", logins: 3  },
];

const LOG_COLOR: Record<string, string> = { info: T.primary, warning: T.warning, danger: T.danger };

export default function UserManagement({ onBack }: Props) {
  const [tab, setTab]       = useState<TabId>("users");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState<UserRole>("analyst");

  const activeCount    = USERS.filter(u => u.status === "active").length;
  const twoFACount     = USERS.filter(u => u.twoFA).length;
  const invitedCount   = USERS.filter(u => u.status === "invited").length;

  const filteredUsers  = USERS.filter(u => roleFilter === "all" || u.role === roleFilter);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
                <Users size={18} style={{ color: T.primary }} />
              </div>
              <div>
                <h1 className="font-black text-lg">User Management</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Equipe, roles, permissões granulares e auditoria de acesso</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["users","roles","audit"] as TabId[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.primary + "20" : "transparent", color: tab === t ? T.primary : T.textSub, border: `1px solid ${tab === t ? T.primary + "30" : "transparent"}` }}>
                {t === "users" ? "Usuários" : t === "roles" ? "Permissões" : "Auditoria"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Usuários Ativos",    value: activeCount,                 color: T.success, icon: UserCheck  },
            { label: "Com 2FA",            value: `${twoFACount}/${USERS.length}`, color: T.primary, icon: Shield },
            { label: "Convites Pendentes", value: invitedCount,                color: T.warning, icon: Mail       },
            { label: "Roles Definidos",    value: Object.keys(ROLE_META).length, color: T.accent, icon: Key       },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* USERS TAB */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {(["all", ...Object.keys(ROLE_META)] as (string)[]).map(r => {
                  const rm = ROLE_META[r as UserRole];
                  return (
                    <button key={r} onClick={() => setRoleFilter(r)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: roleFilter === r ? (rm?.color ?? T.primary) + "20" : T.panel, color: roleFilter === r ? (rm?.color ?? T.primary) : T.textSub, border: `1px solid ${roleFilter === r ? (rm?.color ?? T.primary) + "40" : T.border}` }}>
                      {r === "all" ? "Todos" : rm?.label}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setShowInvite(!showInvite)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.primary, color: "#fff" }}>
                <Plus size={14} /> Convidar Usuário
              </button>
            </div>

            {/* Invite form */}
            {showInvite && (
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.primary + "40" }}>
                <div className="flex items-center gap-3">
                  <input type="email" placeholder="email@empresa.com" value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value as UserRole)}
                    className="px-3 py-2 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                    {(Object.entries(ROLE_META) as [UserRole, any][]).map(([key, rm]) => (
                      <option key={key} value={key}>{rm.label}</option>
                    ))}
                  </select>
                  <button className="px-4 py-2 rounded-xl text-sm font-black"
                    style={{ background: T.success, color: "#000" }}>
                    Enviar Convite
                  </button>
                  <button onClick={() => setShowInvite(false)} className="p-2 rounded-lg hover:bg-white/5">
                    <XCircle size={16} style={{ color: T.textSub }} />
                  </button>
                </div>
              </div>
            )}

            {/* Users table */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="grid grid-cols-6 gap-4 px-4 py-3 text-xs font-black border-b"
                style={{ color: T.textSub, borderColor: T.border }}>
                <span className="col-span-2">USUÁRIO</span><span>ROLE</span><span>STATUS</span><span>2FA</span><span>ÚLTIMO LOGIN</span>
              </div>
              {filteredUsers.map((user, i) => {
                const rm = ROLE_META[user.role];
                const sm = STATUS_META[user.status];
                return (
                  <div key={user.id} className="grid grid-cols-6 gap-4 px-4 py-3 items-center hover:bg-white/2 border-b"
                    style={{ borderColor: i < filteredUsers.length - 1 ? T.border : "transparent" }}>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ background: rm.color + "25", color: rm.color }}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm truncate">{user.name}</div>
                        <div className="text-xs truncate" style={{ color: T.textSub }}>{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {user.role === "owner" && <Crown size={11} style={{ color: T.gold }} />}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: rm.color + "20", color: rm.color }}>{rm.label}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit"
                      style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                    <div>
                      {user.twoFA
                        ? <CheckCircle size={14} style={{ color: T.success }} />
                        : <XCircle size={14} style={{ color: user.role !== "viewer" ? T.warning : T.textSub }} />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: T.textSub }}>{user.lastLogin}</span>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/5"><Edit2 size={11} style={{ color: T.textSub }} /></button>
                        {user.role !== "owner" && (
                          <button className="p-1.5 rounded-lg hover:bg-white/5"><Trash2 size={11} style={{ color: T.danger }} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SSO banner */}
            <div className="p-4 rounded-2xl border flex items-center gap-4"
              style={{ background: T.primary + "08", borderColor: T.primary + "30" }}>
              <Building2 size={18} style={{ color: T.primary }} />
              <div className="flex-1">
                <div className="font-black text-sm" style={{ color: T.primary }}>SSO Corporativo</div>
                <div className="text-xs" style={{ color: T.textSub }}>Google Workspace, Microsoft Azure AD e SAML 2.0 habilitados para login corporativo.</div>
              </div>
              <button className="px-4 py-2 rounded-xl text-xs font-black"
                style={{ background: T.primary + "20", color: T.primary }}>Configurar SSO</button>
            </div>
          </div>
        )}

        {/* ROLES TAB */}
        {tab === "roles" && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-3 mb-2">
              {(Object.entries(ROLE_META) as [UserRole, any][]).map(([key, rm]) => (
                <div key={key} className="p-3 rounded-xl border text-center"
                  style={{ background: T.card, borderColor: rm.color + "30" }}>
                  <div className="font-black text-sm" style={{ color: rm.color }}>{rm.label}</div>
                  <div className="text-xs mt-1" style={{ color: T.textSub }}>{rm.desc}</div>
                  <div className="text-xs font-bold mt-2" style={{ color: T.textSub }}>
                    {USERS.filter(u => u.role === key).length} usuários
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="grid grid-cols-6 gap-2 px-4 py-3 text-xs font-black border-b"
                style={{ color: T.textSub, borderColor: T.border }}>
                <span className="col-span-1">MÓDULO</span>
                {(Object.entries(ROLE_META) as [UserRole, any][]).map(([key, rm]) => (
                  <span key={key} className="text-center" style={{ color: rm.color }}>{rm.label}</span>
                ))}
              </div>
              {PERMISSIONS.map((perm, i) => (
                <div key={i} className="grid grid-cols-6 gap-2 px-4 py-3 items-center border-b hover:bg-white/2"
                  style={{ borderColor: i < PERMISSIONS.length - 1 ? T.border : "transparent" }}>
                  <span className="text-sm font-bold">{perm.module}</span>
                  {[perm.owner, perm.admin, perm.analyst, perm.creator, perm.viewer].map((has, j) => (
                    <div key={j} className="flex justify-center">
                      {has
                        ? <CheckCircle size={14} style={{ color: T.success }} />
                        : <XCircle size={14} style={{ color: T.border }} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {tab === "audit" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4 text-sm">Log de Auditoria</h3>
                <div className="space-y-2">
                  {AUDIT_LOGS.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3"
                      style={{ background: T.panel }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: LOG_COLOR[log.level] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-black" style={{ color: T.primary }}>{log.user}</span>
                          <span style={{ color: T.textSub }}>·</span>
                          <span className="font-bold">{log.action}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{log.detail}</div>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: T.textSub }}>{log.time}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                    <Download size={11} /> Exportar SIEM
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-black text-sm mb-3">Logins por Dia</h3>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={LOGIN_ACTIVITY} barSize={24}>
                      <XAxis dataKey="d" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                        formatter={(v: number) => [v, "Logins"]} />
                      <Bar dataKey="logins" radius={[4, 4, 0, 0]}>
                        {LOGIN_ACTIVITY.map((_, idx) => (
                          <Cell key={`cell-la-${idx}`} fill={idx === 4 ? T.primary : T.primary + "60"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-black text-sm mb-3">Segurança</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "2FA habilitado",      value: `${Math.round(twoFACount/USERS.length*100)}%`, color: T.success },
                      { label: "SSO corporativo",     value: "Ativo",   color: T.success },
                      { label: "Sessões ativas",      value: "4",       color: T.primary },
                      { label: "IPs bloqueados (7d)", value: "2",       color: T.warning },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span style={{ color: T.textSub }}>{m.label}</span>
                        <span className="font-black" style={{ color: m.color }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
