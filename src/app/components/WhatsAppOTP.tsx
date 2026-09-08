import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Smartphone, Check, RefreshCw, Shield, ChevronRight, Eye, EyeOff } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
  wa: "#25D366",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type Stage = "phone" | "sending" | "otp" | "verifying" | "profile" | "done";

const WA_ICON = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function OTPInput({ value, onChange, disabled }: { value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handle = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...value];
    next[i] = val;
    onChange(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length === 6) {
      onChange(digits);
      refs[5].current?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i} ref={refs[i]}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ""} disabled={disabled}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center font-black text-xl rounded-xl outline-none transition-all"
          style={{
            background: T.card,
            border: `2px solid ${value[i] ? T.wa : T.border}`,
            color: T.text,
            boxShadow: value[i] ? `0 0 12px ${T.wa}30` : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function WhatsAppOTP({ onBack, onNavigate }: Props) {
  const [stage, setStage]     = useState<Stage>("phone");
  const [phone, setPhone]     = useState("");
  const [otp, setOtp]         = useState<string[]>(Array(6).fill(""));
  const [error, setError]     = useState("");
  const [countdown, setCountdown] = useState(0);
  const [name, setName]       = useState("");
  const [role, setRole]       = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);

  const otpFilled = otp.every(d => d !== "");

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const sendOTP = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setError("Número incompleto"); return; }
    setError(""); setSending(true);
    setStage("sending");
    setTimeout(() => { setStage("otp"); setCountdown(60); setSending(false); }, 2000);
  };

  const verifyOTP = () => {
    if (!otpFilled) return;
    setStage("verifying");
    setTimeout(() => {
      const code = otp.join("");
      if (code === "000000") { setError("Código inválido. Tente novamente."); setStage("otp"); setOtp(Array(6).fill("")) ; }
      else setStage("profile");
    }, 1800);
  };

  const finish = () => {
    if (!name.trim()) { setError("Digite seu nome"); return; }
    setStage("done");
    setTimeout(() => onNavigate?.("enterprise"), 1500);
  };

  const masked = phone.replace(/\D/g, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) *****-$3");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>

      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
          <Smartphone size={28} style={{ color: "#fff" }} />
        </div>
        <h1 className="font-black text-2xl" style={{ color: T.text }}>DOOHPLAY</h1>
        <p className="text-sm" style={{ color: T.textSub }}>Acesse sua conta</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="p-6 rounded-3xl border" style={{ background: T.card, borderColor: T.border }}>

          {stage === "phone" && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: T.wa }}>{WA_ICON}</span>
                <h2 className="font-black text-lg">Login via WhatsApp</h2>
              </div>
              <p className="text-sm mb-5" style={{ color: T.textSub }}>
                Enviaremos um código de 6 dígitos no seu WhatsApp. Sem senha.
              </p>

              <div className="mb-4">
                <label className="text-xs font-black mb-2 block" style={{ color: T.textSub }}>SEU NÚMERO</label>
                <div className="flex items-center gap-2 px-3 py-3 rounded-xl border"
                  style={{ background: T.panel, borderColor: error ? T.danger : T.border }}>
                  <span className="text-sm font-bold" style={{ color: T.textSub }}>🇧🇷 +55</span>
                  <div className="w-px h-5" style={{ background: T.border }} />
                  <input
                    type="tel" value={phone}
                    onChange={e => { setPhone(formatPhone(e.target.value)); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && sendOTP()}
                    placeholder="(11) 99999-9999"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: T.text }} />
                </div>
                {error && <p className="text-xs mt-1.5" style={{ color: T.danger }}>{error}</p>}
              </div>

              <button onClick={sendOTP}
                className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: T.wa, color: "#fff" }}>
                {WA_ICON} Enviar código pelo WhatsApp
              </button>

              <p className="text-center text-xs mt-4" style={{ color: T.textSub }}>
                Ao continuar, você concorda com os{" "}
                <span style={{ color: T.primary, cursor: "pointer" }}>Termos de Uso</span>
              </p>
            </div>
          )}

          {stage === "sending" && (
            <div className="py-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: T.wa + "20" }}>
                <div className="w-8 h-8 rounded-full border-3 border-t-transparent animate-spin"
                  style={{ border: `3px solid ${T.wa}`, borderTopColor: "transparent" }} />
              </div>
              <h3 className="font-black mb-1">Enviando pelo WhatsApp…</h3>
              <p className="text-sm" style={{ color: T.textSub }}>Abrindo conversa com DOOHPLAY</p>
            </div>
          )}

          {(stage === "otp" || stage === "verifying") && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: T.wa }}>{WA_ICON}</span>
                <h2 className="font-black text-lg">Código enviado!</h2>
              </div>
              <p className="text-sm mb-5" style={{ color: T.textSub }}>
                Enviamos um código de 6 dígitos para <strong style={{ color: T.text }}>{masked}</strong> pelo WhatsApp.
              </p>

              <div className="mb-5">
                <OTPInput value={otp} onChange={setOtp} disabled={stage === "verifying"} />
                {error && <p className="text-xs text-center mt-2" style={{ color: T.danger }}>{error}</p>}
              </div>

              <button onClick={verifyOTP} disabled={!otpFilled || stage === "verifying"}
                className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: otpFilled ? T.primary : T.border, color: otpFilled ? "#fff" : T.textSub }}>
                {stage === "verifying"
                  ? <><RefreshCw size={15} className="animate-spin" /> Verificando…</>
                  : <><Shield size={15} /> Verificar código</>}
              </button>

              <div className="text-center mt-4">
                {countdown > 0
                  ? <p className="text-xs" style={{ color: T.textSub }}>Reenviar em {countdown}s</p>
                  : <button onClick={() => { setOtp(Array(6).fill("")) ; sendOTP(); }}
                      className="text-xs font-bold" style={{ color: T.wa }}>
                      Reenviar código
                    </button>}
              </div>
              <button onClick={() => { setStage("phone"); setOtp(Array(6).fill("")) ; setError(""); }}
                className="w-full text-center mt-2 text-xs" style={{ color: T.textSub }}>
                ← Alterar número
              </button>
            </div>
          )}

          {stage === "profile" && (
            <div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: T.success + "20" }}>
                <Check size={22} style={{ color: T.success }} />
              </div>
              <h2 className="font-black text-lg text-center mb-1">Número verificado!</h2>
              <p className="text-sm text-center mb-5" style={{ color: T.textSub }}>Complete seu perfil para continuar</p>

              <div className="space-y-3 mb-5">
                {[
                  { label: "SEU NOME", value: name, set: setName, placeholder: "Ex: Ana Costa" },
                  { label: "EMPRESA", value: company, set: setCompany, placeholder: "Ex: Ambev, iFood, Agência" },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label}>
                    <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>{label}</label>
                    <input value={value} onChange={e => { set(e.target.value); setError(""); }}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-black mb-1.5 block" style={{ color: T.textSub }}>SEU PAPEL</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Anunciante","Publisher","Agência","Outro"].map(r => (
                      <button key={r} onClick={() => setRole(r)}
                        className="py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: role === r ? T.primary + "20" : T.panel, color: role === r ? T.primary : T.textSub, border: `1px solid ${role === r ? T.primary + "40" : T.border}` }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="text-xs mb-3 text-center" style={{ color: T.danger }}>{error}</p>}

              <button onClick={finish}
                className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2"
                style={{ background: T.primary, color: "#fff" }}>
                Entrar na plataforma <ChevronRight size={15} />
              </button>
            </div>
          )}

          {stage === "done" && (
            <div className="py-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: T.success + "20" }}>
                <Check size={28} style={{ color: T.success }} />
              </div>
              <h3 className="font-black text-lg mb-1">Bem-vindo, {name}!</h3>
              <p className="text-sm" style={{ color: T.textSub }}>Acessando o dashboard…</p>
            </div>
          )}
        </div>

        {(stage === "phone" || stage === "otp") && (
          <div className="flex items-center gap-2 mt-4 justify-center">
            <Shield size={11} style={{ color: T.textSub }} />
            <p className="text-xs" style={{ color: T.textSub }}>
              Autenticação segura · Sem senha · WhatsApp OTP
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
