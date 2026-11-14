/* Synthesised clinic sounds (no external files) */
const Sound = (() => {
  let ctx = null, master = null, muted = false;
  function ensure() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
    } catch (e) { ctx = null; return false; }
    return true;
  }
  function resume() { if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {}); }
  function tone({ freq = 440, type = "sine", dur = 0.3, vol = 0.3, attack = 0.005, decay = 0.25, slideTo = null, delay = 0 }) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + decay);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + decay + 0.05);
  }
  function noise({ dur = 0.15, vol = 0.2, freq = 800, q = 1, delay = 0 }) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + delay;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  return {
    init() { ensure(); resume(); },
    toggleMute() { muted = !muted; return muted; },
    bell() { tone({ freq: 1760, dur: 0.05, decay: 1.4, vol: 0.25 }); tone({ freq: 2637, dur: 0.05, decay: 1.0, vol: 0.12 }); tone({ freq: 1320, dur: 0.05, decay: 1.2, vol: 0.1, delay: 0.12 }); },
    bark() { for (let i = 0; i < 2; i++) { noise({ dur: 0.12, vol: 0.5, freq: 420, q: 2, delay: i * 0.22 }); tone({ freq: 260, slideTo: 150, type: "sawtooth", dur: 0.12, decay: 0.06, vol: 0.18, delay: i * 0.22 }); } },
    meow() { tone({ freq: 520, slideTo: 760, type: "triangle", dur: 0.25, decay: 0.3, vol: 0.2 }); tone({ freq: 780, slideTo: 540, type: "triangle", dur: 0.3, decay: 0.3, vol: 0.14, delay: 0.25 }); },
    chirp() { for (let i = 0; i < 4; i++) tone({ freq: 2800 + Math.random() * 600, slideTo: 3800, dur: 0.05, decay: 0.07, vol: 0.12, delay: i * 0.11 }); },
    hiss() { noise({ dur: 0.5, vol: 0.35, freq: 3500, q: 0.7 }); },
    growl() { tone({ freq: 90, slideTo: 70, type: "sawtooth", dur: 0.5, decay: 0.2, vol: 0.2 }); noise({ dur: 0.5, vol: 0.15, freq: 200, q: 1 }); },
    squawk() { tone({ freq: 1200, slideTo: 700, type: "square", dur: 0.18, decay: 0.1, vol: 0.12 }); },
    beep() { tone({ freq: 880, type: "square", dur: 0.06, decay: 0.05, vol: 0.06 }); },
    alarm() { tone({ freq: 660, type: "square", dur: 0.12, decay: 0.05, vol: 0.1 }); tone({ freq: 660, type: "square", dur: 0.12, decay: 0.05, vol: 0.1, delay: 0.2 }); },
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
        this.timer = setInterval(() => { if (muted) return; const chord = seq[Math.floor(this.step / 4) % seq.length]; const n = chord[this.step % 3]; const f = base * Math.pow(2, n / 12); tone({ freq: f, type: kind === "or" ? "sine" : "triangle", dur: beat * 0.6, decay: beat * 0.6, vol: 0.05, attack: 0.02 }); if (this.step % 4 === 0) tone({ freq: f / 2, type: "sine", dur: beat * 1.2, decay: 0.4, vol: 0.06 }); if (kind === "or" && this.step % 2 === 0) tone({ freq: 880, type: "square", dur: 0.03, decay: 0.03, vol: 0.02 }); this.step++; }, beat * 1000); },
      stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.on = false; } },
    pet(species) { if (species === "dog") this.bark(); else if (species === "cat") this.meow(); else if (species === "rabbit" || species === "tortoise") this.click(); else this.chirp(); },
    petAngry(species) { if (species === "dog") this.growl(); else if (species === "cat" || species === "rabbit") this.hiss(); else if (species === "tortoise") this.click(); else this.squawk(); }
  };
})();
