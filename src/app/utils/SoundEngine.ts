// Procedural audio engine — no external files, pure Web Audio API

type SFX = "click" | "navigate" | "success" | "error" | "notification" | "alert" | "toggle";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientNodes: AudioNode[] = [];
  private ambientRunning = false;
  private _enabled = false;
  private _volume = 0.5;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  get enabled() { return this._enabled; }
  get volume() { return this._volume; }

  setEnabled(val: boolean) {
    this._enabled = val;
    if (val) {
      this.getCtx();
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  setVolume(val: number) {
    this._volume = val;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(val, this.getCtx().currentTime, 0.05);
  }

  // ── Ambient generative music ──────────────────────────────────────────────────────────────────────────
  private startAmbient() {
    if (this.ambientRunning) return;
    this.ambientRunning = true;
    const ctx = this.getCtx();
    const master = this.masterGain!;

    const drone = this.makeDrone(ctx, master, 55, 0.06, 8);
    const pad1  = this.makePad(ctx, master, [220, 277.18, 329.63], 0.04, 12);
    const pad2  = this.makePad(ctx, master, [440, 554.37, 659.25], 0.025, 18);
    const shim  = this.makeShimmer(ctx, master);

    this.ambientNodes = [...drone, ...pad1, ...pad2, ...shim];
  }

  private makeDrone(ctx: AudioContext, out: AudioNode, freq: number, amp: number, lfoRate: number): AudioNode[] {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = amp;

    lfo.type = "sine";
    lfo.frequency.value = 1 / lfoRate;
    lfoGain.gain.value = amp * 0.5;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    osc.connect(gain);
    gain.connect(out);

    osc.start();
    lfo.start();
    return [osc, gain, lfo, lfoGain];
  }

  private makePad(ctx: AudioContext, out: AudioNode, freqs: number[], amp: number, lfoRate: number): AudioNode[] {
    const nodes: AudioNode[] = [];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 4;

      filter.type = "lowpass";
      filter.frequency.value = 800 + i * 200;
      filter.Q.value = 1.5;

      gain.gain.value = 0;
      gain.gain.setTargetAtTime(amp, ctx.currentTime, 2 + i * 0.5);

      lfo.type = "sine";
      lfo.frequency.value = 1 / (lfoRate + i * 3);
      lfoGain.gain.value = amp * 0.4;

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(out);

      osc.start();
      lfo.start();
      nodes.push(osc, gain, filter, lfo, lfoGain);
    });
    return nodes;
  }

  private makeShimmer(ctx: AudioContext, out: AudioNode): AudioNode[] {
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 4000;
    filter.Q.value = 8;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.008, ctx.currentTime, 4);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.006;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start();
    lfo.start();

    return [src, filter, gain, lfo, lfoGain];
  }

  private stopAmbient() {
    this.ambientRunning = false;
    const t = this.ctx?.currentTime ?? 0;
    this.ambientNodes.forEach(n => {
      try {
        if (n instanceof GainNode) n.gain.setTargetAtTime(0, t, 0.5);
      } catch {}
    });
    setTimeout(() => {
      this.ambientNodes.forEach(n => {
        try { (n as any).stop?.(); } catch {}
        try { n.disconnect(); } catch {}
      });
      this.ambientNodes = [];
    }, 2000);
  }

  // ── SFX ────────────────────────────────────────────────────────────────────────────────────────
  play(sfx: SFX) {
    if (!this._enabled) return;
    const ctx = this.getCtx();
    const master = this.masterGain!;
    switch (sfx) {
      case "click":       this.sfxClick(ctx, master); break;
      case "navigate":    this.sfxNavigate(ctx, master); break;
      case "success":     this.sfxSuccess(ctx, master); break;
      case "error":       this.sfxError(ctx, master); break;
      case "notification":this.sfxNotification(ctx, master); break;
      case "alert":       this.sfxAlert(ctx, master); break;
      case "toggle":      this.sfxToggle(ctx, master); break;
    }
  }

  private sfxClick(ctx: AudioContext, out: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain); gain.connect(out);
    osc.start(); osc.stop(ctx.currentTime + 0.06);
  }

  private sfxNavigate(ctx: AudioContext, out: AudioNode) {
    const bufSize = Math.floor(ctx.sampleRate * 0.15);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    src.connect(filter); filter.connect(gain); gain.connect(out);
    src.start(); src.stop(ctx.currentTime + 0.15);
  }

  private sfxSuccess(ctx: AudioContext, out: AudioNode) {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.08;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain); gain.connect(out);
      osc.start(t); osc.stop(t + 0.25);
    });
  }

  private sfxError(ctx: AudioContext, out: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    osc.connect(filter); filter.connect(gain); gain.connect(out);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  }

  private sfxNotification(ctx: AudioContext, out: AudioNode) {
    [880, 1108.73].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.1;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain); gain.connect(out);
      osc.start(t); osc.stop(t + 0.22);
    });
  }

  private sfxAlert(ctx: AudioContext, out: AudioNode) {
    [660, 660, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.14;
      osc.type = "square";
      osc.frequency.value = freq;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1200;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(filter); filter.connect(gain); gain.connect(out);
      osc.start(t); osc.stop(t + 0.1);
    });
  }

  private sfxToggle(ctx: AudioContext, out: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain); gain.connect(out);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
  }
}

export const soundEngine = new SoundEngine();
export type { SFX };
