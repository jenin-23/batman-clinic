/* Synthesised clinic sounds (no external files) */
const Sound = (() => {
  let ctx = null, master = null, muted = false;
  const vols = { fx: 1, clin: 1, mon: 1, music: 1 }; let ch = null; const V = () => (ch ? vols[ch] : vols.fx);
  function on(c, fn) { const prev = ch; ch = c; try { fn(); } finally { ch = prev; } }
  function ensure() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
    } catch (e) { ctx = null; return false; }
    return true;
  }
  function resume() { if (ctx && ctx.state !== "running" && ctx.state !== "closed") { try { ctx.resume().catch(() => {}); } catch (e) { } } }
  function tone({ freq = 440, type = "sine", dur = 0.3, vol = 0.3, attack = 0.005, decay = 0.25, slideTo = null, delay = 0 }) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    vol *= V(); if (vol <= 0.0001) return; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + decay);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + decay + 0.05);
  }
  function noise({ dur = 0.15, vol = 0.2, freq = 800, q = 1, delay = 0 }) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + delay;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
    vol *= V(); if (vol <= 0.0001) return; const g = ctx.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  function lpNoise({ dur = 0.1, vol = 0.3, freq = 120, type = "lowpass", q = 0.7, delay = 0, attack = 0.01 }) {
    if (!ensure() || muted) return; vol *= V(); if (vol <= 0.0001) return; const t0 = ctx.currentTime + delay;
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  const loops = {};
  function loopStart(id, build) { if (!ensure() || muted || loops[id]) return; try { loops[id] = build(); } catch (e) { } }
  function loopStop(id) { const l = loops[id]; if (!l) return; try { l.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05); setTimeout(() => { try { l.nodes.forEach(n => n.stop && n.stop()); } catch (e) { } }, 200); } catch (e) { } delete loops[id]; }
  function noiseLoopNode() { const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; return src; }
  return {
    init() { ensure(); resume(); },
    /* ---- clinical sounds ---- */
    setVol(c, v) { vols[c] = Math.max(0, Math.min(1, +v)); for (const k in loops) { try { loops[k].g.gain.value = (k === "purr" ? vols.clin : vols.fx) * (k === "clip" ? 0.06 : 1); } catch (e) { } } },
    getVol(c) { return vols[c]; },
    heart(o = {}) { return on("clin", () => this._heart(o)); },
    _heart(o = {}) { const v = (o.vol === undefined ? 0.6 : o.vol) * (o.muffled ? 0.25 : 1); if (v <= 0.01) return; lpNoise({ dur: 0.09, vol: v, freq: 70 }); tone({ freq: 52, dur: 0.05, decay: 0.06, vol: v * 0.5 }); const gap = Math.min(0.3, 0.22 * (o.gapScale || 1)); lpNoise({ dur: 0.07, vol: v * 0.75, freq: 105, delay: gap }); tone({ freq: 74, dur: 0.04, decay: 0.05, vol: v * 0.4, delay: gap }); if (o.murmur) lpNoise({ dur: gap * 0.8, vol: v * 0.32, freq: 260, type: "bandpass", q: 1.2, delay: 0.06, attack: 0.03 }); },
    breath(o = {}) { return on("clin", () => this._breath(o)); },
    _breath(o = {}) { const v = o.vol === undefined ? 0.4 : o.vol; if (v <= 0.01) return; lpNoise({ dur: 0.75, vol: v * 0.5, freq: 520, type: "bandpass", q: 0.6, attack: 0.3 }); lpNoise({ dur: 0.9, vol: v * 0.3, freq: 380, type: "bandpass", q: 0.6, attack: 0.2, delay: 0.85 }); if (o.wheeze) tone({ freq: 440, type: "triangle", dur: 0.55, decay: 0.2, vol: v * 0.12, delay: 0.95, slideTo: 400 }); if (o.crackle) for (let i = 0; i < 7; i++) lpNoise({ dur: 0.012, vol: v * 0.5, freq: 1800, type: "bandpass", q: 3, delay: 0.15 + Math.random() * 0.5 }); },
    purr(on, vol = 0.35) { if (!on) return loopStop("purr"); loopStart("purr", () => { const src = noiseLoopNode(); const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 160; const g = ctx.createGain(); g.gain.value = 0; const am = ctx.createGain(); am.gain.value = 0; const lfo = ctx.createOscillator(); lfo.frequency.value = 26; const lg = ctx.createGain(); lg.gain.value = vol; lfo.connect(lg); lg.connect(am.gain); src.connect(f); f.connect(am); am.connect(g); g.connect(master); g.gain.setTargetAtTime(vols.clin, ctx.currentTime, 0.2); src.start(); lfo.start(); return { g, nodes: [src, lfo] }; }); },
    pulseOx(spo2 = 98) { return on("mon", () => this._pulseOx(spo2)); },
    _pulseOx(spo2 = 98) { tone({ freq: Math.max(320, 440 + (spo2 - 85) * 32), type: "sine", dur: 0.05, decay: 0.05, vol: 0.12 }); },
    clipper(on) { if (!on) return loopStop("clip"); loopStart("clip", () => { const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = 118; const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900; const g = ctx.createGain(); g.gain.value = 0.0001; o.connect(f); f.connect(g); g.connect(master); g.gain.setTargetAtTime(0.06 * vols.fx, ctx.currentTime, 0.05); o.start(); return { g, nodes: [o] }; }); },
    xray() { tone({ freq: 1950, dur: 0.45, decay: 0.05, vol: 0.14 }); lpNoise({ dur: 0.5, vol: 0.08, freq: 3000, type: "highpass" }); },
    whirr() { tone({ freq: 180, slideTo: 620, type: "sawtooth", dur: 1.4, decay: 0.3, vol: 0.05 }); },
    squeak() { tone({ freq: 900, slideTo: 1300, type: "triangle", dur: 0.08, decay: 0.05, vol: 0.08 }); },

    toggleMute() { muted = !muted; return muted; },
    bell() { tone({ freq: 1760, dur: 0.05, decay: 1.4, vol: 0.25 }); tone({ freq: 2637, dur: 0.05, decay: 1.0, vol: 0.12 }); tone({ freq: 1320, dur: 0.05, decay: 1.2, vol: 0.1, delay: 0.12 }); },
    bark() { for (let i = 0; i < 2; i++) { noise({ dur: 0.12, vol: 0.5, freq: 420, q: 2, delay: i * 0.22 }); tone({ freq: 260, slideTo: 150, type: "sawtooth", dur: 0.12, decay: 0.06, vol: 0.18, delay: i * 0.22 }); } },
    meow() { tone({ freq: 520, slideTo: 760, type: "triangle", dur: 0.25, decay: 0.3, vol: 0.2 }); tone({ freq: 780, slideTo: 540, type: "triangle", dur: 0.3, decay: 0.3, vol: 0.14, delay: 0.25 }); },
    chirp() { for (let i = 0; i < 4; i++) tone({ freq: 2800 + Math.random() * 600, slideTo: 3800, dur: 0.05, decay: 0.07, vol: 0.12, delay: i * 0.11 }); },
    hiss() { noise({ dur: 0.5, vol: 0.35, freq: 3500, q: 0.7 }); },
    growl() { tone({ freq: 90, slideTo: 70, type: "sawtooth", dur: 0.5, decay: 0.2, vol: 0.2 }); noise({ dur: 0.5, vol: 0.15, freq: 200, q: 1 }); },
    squawk() { tone({ freq: 1200, slideTo: 700, type: "square", dur: 0.18, decay: 0.1, vol: 0.12 }); },
    beep() { tone({ freq: 880, type: "square", dur: 0.06, decay: 0.05, vol: 0.06 }); },
    alarm() { return on("mon", () => this._alarm()); },
    _alarm() { tone({ freq: 660, type: "square", dur: 0.12, decay: 0.05, vol: 0.1 }); tone({ freq: 660, type: "square", dur: 0.12, decay: 0.05, vol: 0.1, delay: 0.2 }); },
    click() { noise({ dur: 0.04, vol: 0.25, freq: 2500, q: 2 }); },
    success() { [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, type: "triangle", dur: 0.1, decay: 0.25, vol: 0.14, delay: i * 0.09 })); },
    error() { tone({ freq: 220, slideTo: 160, type: "square", dur: 0.25, decay: 0.1, vol: 0.1 }); },
    unlock() { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone({ freq: f, type: "sine", dur: 0.12, decay: 0.4, vol: 0.14, delay: i * 0.08 })); },
    step() { noise({ dur: 0.05, vol: 0.08, freq: 500, q: 1 }); },
    cash() { tone({ freq: 1200, type: "triangle", dur: 0.05, decay: 0.15, vol: 0.12 }); tone({ freq: 1800, type: "triangle", dur: 0.05, decay: 0.2, vol: 0.12, delay: 0.08 }); },
    water() { noise({ dur: 1.2, vol: 0.12, freq: 1200, q: 0.5 }); },
    clipper() { tone({ freq: 120, type: "sawtooth", dur: 1.0, decay: 0.1, vol: 0.05 }); },
    door() { noise({ dur: 0.2, vol: 0.15, freq: 300, q: 1 }); tone({ freq: 180, slideTo: 120, type: "triangle", dur: 0.2, decay: 0.1, vol: 0.06 }); },
    purr() { for (let i = 0; i < 6; i++) tone({ freq: 28 + (i % 2) * 3, type: "sawtooth", dur: 0.16, decay: 0.05, vol: 0.12, delay: i * 0.18 }); },
    vibrate(ms = 30) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { } },
    music: { timer: null, step: 0, on: false,
      start(kind = "lobby") { this.stop(); if (!ensure()) return; this.on = true; this.kind = kind; const seqs = { lobby: [[0, 7, 12], [3, 7, 14], [5, 12, 17], [3, 10, 15]], or: [[0, 0, 12], [0, 0, 12], [7, 7, 19], [5, 5, 17]], night: [[0, 5, 12], [0, 3, 10], [0, 5, 12], [-2, 3, 10]] };
        const base = kind === "or" ? 110 : 146.83; const seq = seqs[kind] || seqs.lobby; const bpm = kind === "or" ? 72 : 96; const beat = 60 / bpm;
        this.timer = setInterval(() => { if (muted) return; const prevCh = ch; ch = "music"; const chord = seq[Math.floor(this.step / 4) % seq.length]; const n = chord[this.step % 3]; const f = base * Math.pow(2, n / 12); tone({ freq: f, type: kind === "or" ? "sine" : "triangle", dur: beat * 0.6, decay: beat * 0.6, vol: 0.05, attack: 0.02 }); if (this.step % 4 === 0) tone({ freq: f / 2, type: "sine", dur: beat * 1.2, decay: 0.4, vol: 0.06 }); if (kind === "or" && this.step % 2 === 0) tone({ freq: 880, type: "square", dur: 0.03, decay: 0.03, vol: 0.02 }); this.step++; ch = prevCh; }, beat * 1000); },
      stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.on = false; } },
    pet(species) { if (species === "dog") this.bark(); else if (species === "cat") this.meow(); else if (species === "rabbit" || species === "tortoise") this.click(); else this.chirp(); },
    petAngry(species) { if (species === "dog") this.growl(); else if (species === "cat" || species === "rabbit") this.hiss(); else if (species === "tortoise") this.click(); else this.squawk(); }
  };
})();
