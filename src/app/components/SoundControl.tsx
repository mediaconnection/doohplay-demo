import { useState, useEffect } from "react";
import { Volume2, VolumeX, Music, Zap } from "lucide-react";
import { soundEngine } from "../utils/SoundEngine";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

export default function SoundControl() {
  const [enabled, setEnabled]   = useState(false);
  const [volume, setVolume]     = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const [pulse, setPulse]       = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setPulse(p => !p);
    }, 1800);
    return () => clearInterval(id);
  }, [enabled]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    soundEngine.setEnabled(next);
    if (next) soundEngine.play("toggle");
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    soundEngine.setVolume(v);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {expanded && (
        <div className="p-4 rounded-2xl border shadow-2xl w-56"
          style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center gap-2 mb-3">
            <Music size={13} style={{ color: T.accent }} />
            <span className="text-xs font-black" style={{ color: T.text }}>Som Ambiente</span>
            <span className="ml-auto text-xs" style={{ color: enabled ? T.success : T.textSub }}>
              {enabled ? "ON" : "OFF"}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={11} style={{ color: T.textSub }} />
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={e => handleVolume(parseFloat(e.target.value))}
              className="flex-1" style={{ accentColor: T.accent }} />
            <span className="text-xs font-black w-8 text-right" style={{ color: T.textSub }}>
              {Math.round(volume * 100)}%
            </span>
          </div>
          <div className="text-xs mb-2 font-black" style={{ color: T.textSub }}>PRÉVIA DE EFEITOS</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(["click","success","error","notification","alert","navigate"] as const).map(sfx => (
              <button key={sfx} onClick={() => { if (!enabled) { soundEngine.setEnabled(true); setEnabled(true); } soundEngine.play(sfx); }}
                className="py-1.5 rounded-lg text-xs font-bold capitalize transition-all hover:opacity-80"
                style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                {sfx}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        {enabled && (
          <div className="flex items-end gap-0.5 h-5">
            {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
              <div key={i} className="w-0.5 rounded-full transition-all duration-300"
                style={{
                  height: pulse ? `${h + (i % 2) * 2}px` : `${h - 1}px`,
                  background: T.accent,
                  opacity: 0.7 + (i % 3) * 0.1,
                  transitionDelay: `${i * 60}ms`,
                }} />
            ))}
          </div>
        )}
        <button
          onClick={() => { soundEngine.play("click"); setExpanded(e => !e); }}
          className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-105"
          style={{
            background: enabled ? T.accent : T.panel,
            border: `2px solid ${enabled ? T.accent + "60" : T.border}`,
            boxShadow: enabled ? `0 0 20px ${T.accent}40` : "none",
          }}>
          {enabled
            ? <Volume2 size={18} style={{ color: "#fff" }} />
            : <VolumeX size={18} style={{ color: T.textSub }} />}
        </button>
        <button onClick={toggle}
          className="px-3 h-11 rounded-2xl text-xs font-black transition-all hover:opacity-80"
          style={{
            background: enabled ? T.success + "20" : T.panel,
            color: enabled ? T.success : T.textSub,
            border: `2px solid ${enabled ? T.success + "40" : T.border}`,
          }}>
          {enabled ? "SOM ON" : "SOM OFF"}
        </button>
      </div>
    </div>
  );
}
