/* ============================================================
   MINI-GAMES — hands-on canvas tasks (pointer events: mouse + touch)
   Each MG.run(name, container, opts) returns a Promise<{ ok, score, text }>
   ============================================================ */
const MG = (() => {
  function makeCanvas(container, h = 300) {
    const w = Math.min(560, Math.max(260, container.clientWidth || 480)); const c = document.createElement("canvas"); const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px"; c.style.touchAction = "none"; c.className = "mg";
    const ctx = c.getContext("2d"); ctx.scale(dpr, dpr); container.appendChild(c);
    const pt = (e) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height) }; };
    return { c, ctx, w, h, pt };
  }
  function ui(container, title, hint) { container.innerHTML = `<div class="mgwrap"><h4>${title}</h4><p class="muted">${hint}</p><div class="mgbar"><div class="mgfill"></div></div><div class="mgcanvas"></div><div class="mgfoot"></div></div>`; return { canvasHost: container.querySelector(".mgcanvas"), fill: container.querySelector(".mgfill"), foot: container.querySelector(".mgfoot") }; }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function finish(resolve, ok, score, text, foot) { if (foot) foot.innerHTML = `<div class="${ok ? "goodbox" : "badbox"}">${text}</div>`; setTimeout(() => resolve({ ok, score, text }), 900); }

  /* 1. Clip & vacuum: drag to clear fur across the whole margin */
  function clipVacuum(container) {
    return new Promise(resolve => {
      const u = ui(container, "Clip the surgical site", "Drag the clipper over the shaded area until it is fully clipped — wide margins (10–20 cm) beyond the incision line. Then press Vacuum.");
      const { c, ctx, w, h, pt } = makeCanvas(u.canvasHost, 280); const cols = 24, rows = 12, cell = { w: (w - 40) / cols, h: (h - 60) / rows }; const grid = Array.from({ length: rows }, () => Array(cols).fill(1)); let down = false, cleared = 0, total = rows * cols;
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#c98f5b"; ctx.fillRect(20, 30, w - 40, h - 60); for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) if (grid[r][q]) { ctx.fillStyle = "#5a3e2b"; const x = 20 + q * cell.w, y = 30 + r * cell.h; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + 4 + k * 6, y + cell.h - 3); ctx.lineTo(x + 7 + k * 6, y + 3); ctx.lineWidth = 2; ctx.strokeStyle = "#3b2a1d"; ctx.stroke(); } } ctx.setLineDash([6, 4]); ctx.strokeStyle = "#ff8fa3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w / 2, 70); ctx.lineTo(w / 2, h - 70); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#ff8fa3"; ctx.font = "12px Nunito, sans-serif"; ctx.fillText("incision line", w / 2 + 6, 66); };
      draw();
      const clip = (e) => { const p = pt(e); const q = Math.floor((p.x - 20) / cell.w), r = Math.floor((p.y - 30) / cell.h); for (let dr = -1; dr <= 1; dr++) for (let dq = -1; dq <= 1; dq++) { const rr = r + dr, qq = q + dq; if (rr >= 0 && rr < rows && qq >= 0 && qq < cols && grid[rr][qq]) { grid[rr][qq] = 0; cleared++; } } u.fill.style.width = (cleared / total * 100) + "%"; draw(); if (cleared / total > 0.97 && !u.foot.querySelector("button")) { u.foot.innerHTML = `<button class="btn primary">Vacuum the loose hair</button>`; u.foot.querySelector("button").onclick = () => { Sound.clipper(); finish(resolve, true, 100, "Clipped wide and vacuumed — no loose hair reaches theatre.", u.foot); }; } };
      c.addEventListener("pointerdown", (e) => { down = true; c.setPointerCapture(e.pointerId); Sound.clipper(); clip(e); }); c.addEventListener("pointermove", (e) => { if (down) clip(e); }); c.addEventListener("pointerup", () => down = false); c.addEventListener("pointercancel", () => down = false);
    });
  }
  /* 2. Scrub pattern: trace outward spiral from the centre, never back inward */
  function scrubPattern(container) {
    return new Promise(resolve => {
      const u = ui(container, "Surgical site scrub — target pattern", "Start at the incision line (centre) and scrub in widening circles outward. Never return to the centre with a used swab. Three passes: chlorhexidine → alcohol → chlorhexidine.");
      const { c, ctx, w, h, pt } = makeCanvas(u.canvasHost, 300); const cx = w / 2, cy = h / 2, maxR = Math.min(w, h) / 2 - 16; let pass = 0, maxReached = 0, angle = 0, down = false, violations = 0, lastR = 0; const trail = [];
      const colors = ["#e59bb0", "#9fc5ea", "#e59bb0"], names = ["chlorhexidine scrub", "70 % alcohol", "chlorhexidine scrub"];
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#c98f5b"; ctx.beginPath(); ctx.arc(cx, cy, maxR + 10, 0, Math.PI * 2); ctx.fill(); for (let r = maxR; r > 0; r -= maxR / 4) { ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); } ctx.strokeStyle = colors[Math.min(pass, 2)]; ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); trail.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke(); ctx.fillStyle = "#ff8fa3"; ctx.fillRect(cx - 2, cy - 24, 4, 48); ctx.fillStyle = "#fff"; ctx.font = "bold 13px Nunito, sans-serif"; ctx.fillText(`Pass ${Math.min(pass + 1, 3)}/3 — ${names[Math.min(pass, 2)]}`, 12, 20); };
      draw();
      const onMove = (e) => { if (!down) return; const p = pt(e); const r = dist(p, { x: cx, y: cy }); if (r < lastR - 22 && r < maxR * 0.8) violations++; lastR = Math.max(lastR, r); trail.push(p); if (trail.length > 400) trail.shift(); const prev = trail[trail.length - 2]; if (prev) { const a1 = Math.atan2(prev.y - cy, prev.x - cx), a2 = Math.atan2(p.y - cy, p.x - cx); let d = a2 - a1; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; angle += Math.abs(d); } maxReached = Math.max(maxReached, r); const prog = Math.min(1, (angle / (Math.PI * 6)) * 0.6 + (maxReached / maxR) * 0.4); u.fill.style.width = ((pass + prog) / 3 * 100) + "%"; draw(); if (prog >= 0.98 && maxReached > maxR * 0.9) { pass++; trail.length = 0; angle = 0; maxReached = 0; lastR = 0; down = false; Sound.water(); if (pass >= 3) { const ok = violations < 3; finish(resolve, ok, ok ? 100 : 60, ok ? "Textbook target pattern, ≥ 2–5 min contact time achieved." : `Pattern completed, but you moved back toward the incision ${violations} times — a used swab carries bacteria from the edge back to the centre.`, u.foot); } else draw(); } };
      c.addEventListener("pointerdown", (e) => { const p = pt(e); if (dist(p, { x: cx, y: cy }) > 40) { u.foot.innerHTML = "<p class='muted'>Start at the centre (incision line).</p>"; return; } down = true; lastR = 0; c.setPointerCapture(e.pointerId); trail.push(p); }); c.addEventListener("pointermove", onMove); c.addEventListener("pointerup", () => down = false);
    });
  }
  /* 3. Draping: click the four corners, then the fenestrated drape */
  function drape(container) {
    return new Promise(resolve => {
      const u = ui(container, "Drape the field", "Tap the four corners around the prepped site to place quarter drapes and secure each with a Backhaus towel clamp, then tap the centre for the fenestrated drape.");
      const { c, ctx, w, h, pt } = makeCanvas(u.canvasHost, 280); const cx = w / 2, cy = h / 2; const corners = [{ x: cx - 90, y: cy - 60 }, { x: cx + 90, y: cy - 60 }, { x: cx + 90, y: cy + 60 }, { x: cx - 90, y: cy + 60 }]; const placed = []; let misses = 0;
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#c98f5b"; ctx.fillRect(20, 20, w - 40, h - 40); ctx.fillStyle = "#e59bb0"; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(cx, cy, 120, 80, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; placed.forEach((i) => { if (i < 4) { ctx.fillStyle = "#3f6f6a"; const k = corners[i]; ctx.fillRect(k.x < cx ? 20 : k.x, k.y < cy ? 20 : k.y, k.x < cx ? k.x - 20 : w - 20 - k.x, k.y < cy ? k.y - 20 : h - 20 - k.y); ctx.fillStyle = "#dfe3ee"; ctx.beginPath(); ctx.arc(k.x, k.y, 6, 0, Math.PI * 2); ctx.fill(); } else { ctx.fillStyle = "#3f6f6a"; ctx.fillRect(20, 20, w - 40, h - 40); ctx.fillStyle = "#e59bb0"; ctx.fillRect(cx - 40, cy - 14, 80, 28); } }); corners.forEach((k, i) => { if (!placed.includes(i)) { ctx.strokeStyle = "#ffd166"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(k.x, k.y, 14, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); } }); if (placed.length === 4) { ctx.strokeStyle = "#ffd166"; ctx.setLineDash([4, 4]); ctx.strokeRect(cx - 40, cy - 14, 80, 28); ctx.setLineDash([]); } };
      draw();
      c.addEventListener("pointerdown", (e) => { const p = pt(e); if (placed.length < 4) { const i = corners.findIndex((k, idx) => !placed.includes(idx) && dist(p, k) < 26); if (i >= 0) { placed.push(i); Sound.click(); } else misses++; } else if (Math.abs(p.x - cx) < 60 && Math.abs(p.y - cy) < 40) { placed.push(4); Sound.click(); draw(); u.fill.style.width = "100%"; const ok = misses < 3; finish(resolve, ok, ok ? 100 : 70, ok ? "Four quarter drapes clamped, fenestrated drape over the site — sterile field established." : "Drapes placed, but with fumbling: every mis-placed clamp risks dragging the drape edge across non-sterile skin.", u.foot); return; } else misses++; u.fill.style.width = (placed.length / 5 * 100) + "%"; draw(); });
    });
  }
  /* 4. Ligature: stop the moving marker in the green zone twice (surgeon's throw + square throw) */
  function ligature(container, label = "Ligate the pedicle") {
    return new Promise(resolve => {
      const u = ui(container, label, "Tighten the knot: tap when the marker is in the green zone. Too loose = bleeding; too tight = the ligature cuts through. Two throws: a surgeon's throw then a square throw.");
      const { c, ctx, w, h, pt } = makeCanvas(u.canvasHost, 180); let t = 0, dir = 1, throwsDone = 0, results = []; let raf;
      const zone = [0.55, 0.78];
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#232841"; ctx.fillRect(20, 60, w - 40, 30); ctx.fillStyle = "#3f9f6a"; ctx.fillRect(20 + (w - 40) * zone[0], 60, (w - 40) * (zone[1] - zone[0]), 30); ctx.fillStyle = "#ff8fa3"; ctx.fillRect(20 + (w - 40) * 0.9, 60, (w - 40) * 0.1, 30); ctx.fillStyle = "#f2c14e"; ctx.fillRect(20 + (w - 40) * t - 3, 50, 6, 50); ctx.fillStyle = "#fff"; ctx.font = "bold 13px Nunito, sans-serif"; ctx.fillText(["Surgeon's throw", "Square throw", ""][throwsDone], 20, 40); ctx.fillStyle = "#9ea4c4"; ctx.font = "12px Nunito, sans-serif"; ctx.fillText("loose", 20, 112); ctx.fillText("tight", w - 50, 112); ctx.fillText("cuts through →", 20 + (w - 40) * 0.78, 134); };
      const loop = () => { t += dir * 0.012 * (1 + throwsDone * 0.4); if (t > 1 || t < 0) dir *= -1; draw(); raf = requestAnimationFrame(loop); }; loop();
      c.addEventListener("pointerdown", () => { const inZone = t >= zone[0] && t <= zone[1]; results.push(inZone ? 1 : t > 0.9 ? -1 : 0); Sound.click(); throwsDone++; u.fill.style.width = (throwsDone / 2 * 100) + "%"; if (throwsDone >= 2) { cancelAnimationFrame(raf); const good = results.filter(r => r === 1).length, cut = results.includes(-1); const ok = good === 2; finish(resolve, ok, ok ? 100 : good === 1 ? 60 : 20, ok ? "Secure ligature: both throws snug without crushing — check the pedicle for bleeding before releasing." : cut ? "The ligature cut through the pedicle — haemorrhage! Re-clamp and re-ligate with a fresh throw." : "Loose throw: the ligature can slip when the clamp is released. Tighten with a second square throw.", u.foot); } });
    });
  }
  /* 5. Suture pattern trainer: place bites alternating sides at even spacing */
  function suture(container, pattern = "simple interrupted", n = 6) {
    return new Promise(resolve => {
      const u = ui(container, `Skin closure — ${pattern}`, pattern === "intradermal" ? "Tap bites under the skin edge alternating sides, 3–4 mm apart, so no suture shows on the surface." : "Tap where each bite enters: 5 mm from the wound edge, evenly spaced (about 5–8 mm apart), alternating sides.");
      const { c, ctx, w, h, pt } = makeCanvas(u.canvasHost, 240); const y0 = h / 2; const bites = []; const target = n * 2;
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#c98f5b"; ctx.fillRect(20, 20, w - 40, h - 40); ctx.strokeStyle = "#8a2a3a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(60, y0); ctx.lineTo(w - 60, y0); ctx.stroke(); ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.setLineDash([3, 5]); ctx.lineWidth = 1; [y0 - 18, y0 + 18].forEach(y => { ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(w - 60, y); ctx.stroke(); }); ctx.setLineDash([]); ctx.strokeStyle = "#2f3550"; ctx.lineWidth = 2; for (let i = 1; i < bites.length; i++) { ctx.beginPath(); ctx.moveTo(bites[i - 1].x, bites[i - 1].y); ctx.lineTo(bites[i].x, bites[i].y); ctx.stroke(); } bites.forEach(b => { ctx.fillStyle = "#dfe3ee"; ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill(); }); ctx.fillStyle = "#fff"; ctx.font = "12px Nunito, sans-serif"; ctx.fillText(`${bites.length}/${target} bites`, 24, 36); };
      draw();
      c.addEventListener("pointerdown", (e) => { const p = pt(e); if (p.x < 60 || p.x > w - 60) return; bites.push(p); Sound.click(); u.fill.style.width = (bites.length / target * 100) + "%"; draw(); if (bites.length >= target) { let sideErr = 0, edgeErr = 0, gaps = []; bites.forEach((b, i) => { const side = b.y < y0 ? -1 : 1; if (i && side === (bites[i - 1].y < y0 ? -1 : 1)) sideErr++; const d = Math.abs(b.y - y0); if (d < 10 || d > 30) edgeErr++; if (i >= 2) gaps.push(Math.abs(b.x - bites[i - 2].x)); }); const mean = gaps.reduce((a, b) => a + b, 0) / (gaps.length || 1); const varc = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / (gaps.length || 1)); const score = Math.max(0, 100 - sideErr * 12 - edgeErr * 10 - Math.min(40, varc)); const ok = score >= 65; finish(resolve, ok, score, `${ok ? "Neat closure." : "Uneven closure."} Alternation errors: ${sideErr}, bites too close/far from the edge: ${edgeErr}, spacing variability: ${varc.toFixed(0)} px. ${ok ? "Even tension and spacing distribute load along the incision." : "Uneven bites concentrate tension and invite dehiscence — remove and redo the worst ones."}`, u.foot); } });
    });
  }
  /* 6. Ultrasound: sweep the probe to find the hidden target, then capture */
  function ultrasound(container, targetLabel = "fluid-filled uterus") {
    return new Promise(resolve => {
      const u = ui(container, "Abdominal ultrasound", `Sweep the probe over the shaved abdomen. The fan image shows what lies under it. Find the ${targetLabel} and tap Capture while it is in view.`);
      const { c, ctx, w, h, pt } = makeCanvas(u.canvasHost, 320); const tgt = { x: 60 + Math.random() * (w - 120), y: 60 + Math.random() * 90 }; let probe = { x: w / 2, y: 90 }; let captured = false, sweeps = 0;
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#c98f5b"; ctx.fillRect(20, 20, w - 40, 140); ctx.fillStyle = "#1a1f3a"; ctx.fillRect(20, 170, w - 40, h - 190); const inView = dist(probe, tgt) < 45; ctx.save(); ctx.beginPath(); ctx.moveTo(w / 2, 175); ctx.lineTo(w / 2 - 150, h - 25); ctx.lineTo(w / 2 + 150, h - 25); ctx.closePath(); ctx.clip(); ctx.fillStyle = "#2b3150"; ctx.fill(); for (let i = 0; i < 400; i++) { ctx.fillStyle = `rgba(200,210,230,${Math.random() * 0.25})`; ctx.fillRect(w / 2 - 150 + Math.random() * 300, 175 + Math.random() * (h - 200), 2, 2); } ctx.strokeStyle = "rgba(255,255,255,0.08)"; for (let r = 30; r < 170; r += 30) { ctx.beginPath(); ctx.arc(w / 2, 175, r, 0.4, Math.PI - 0.4); ctx.stroke(); } if (inView) { const off = (tgt.x - probe.x) * 2; ctx.fillStyle = "#0b0d18"; ctx.beginPath(); ctx.ellipse(w / 2 + off, 240, 46, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#e9eef7"; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "#dfe3ee"; ctx.font = "12px Nunito, sans-serif"; ctx.fillText(targetLabel, w / 2 + off - 40, 290); } ctx.restore(); ctx.fillStyle = "#dfe3ee"; ctx.fillRect(probe.x - 18, probe.y - 10, 36, 20); ctx.fillStyle = "#5f8fd6"; ctx.fillRect(probe.x - 14, probe.y + 8, 28, 4); u.fill.style.width = (Math.max(0, 1 - dist(probe, tgt) / 200) * 100) + "%"; };
      draw(); let down = false;
      c.addEventListener("pointerdown", (e) => { const p = pt(e); if (p.y < 165) { down = true; probe = p; c.setPointerCapture(e.pointerId); draw(); } }); c.addEventListener("pointermove", (e) => { if (!down) return; const p = pt(e); if (p.y < 165) { probe = { x: Math.max(30, Math.min(w - 30, p.x)), y: Math.max(30, Math.min(155, p.y)) }; sweeps++; draw(); } }); c.addEventListener("pointerup", () => down = false);
      u.foot.innerHTML = `<button class="btn primary">Capture image</button>`; u.foot.querySelector("button").onclick = () => { if (captured) return; const ok = dist(probe, tgt) < 45; if (!ok) { Sound.error(); u.foot.insertAdjacentHTML("beforeend", "<p class='muted'>Nothing diagnostic in this image — keep sweeping (systematic pattern: cranial to caudal, left to right).</p>"); return; } captured = true; Sound.beep(); finish(resolve, true, 100, `Captured: ${targetLabel}. Measure it, note free fluid, and save the image to the record.`, u.foot); };
    });
  }
  /* 7. Microscope field (SVG) — returns the key; caller asks the question */
  function microscopeField(key, w = 360, h = 240) {
    const shapes = []; const rnd = (a, b) => a + Math.random() * (b - a);
    const bg = `<defs><radialGradient id="mic"><stop offset="0" stop-color="#e9d7ff"/><stop offset="1" stop-color="#b9a3dd"/></radialGradient><clipPath id="circ"><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2 - 6}"/></clipPath></defs><rect width="${w}" height="${h}" fill="#1b1f33"/><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2 - 6}" fill="url(#mic)"/>`;
    for (let i = 0; i < 70; i++) shapes.push(`<circle cx="${rnd(0, w)}" cy="${rnd(0, h)}" r="${rnd(4, 9)}" fill="#f6c8d6" opacity=".55"/>`); // squames / epithelial cells
    if (key === "yeast") for (let i = 0; i < 45; i++) { const x = rnd(0, w), y = rnd(0, h), a = rnd(0, 6); shapes.push(`<g transform="translate(${x} ${y}) rotate(${a * 57})"><circle r="4" fill="#5b4a8a"/><circle cx="5" r="3" fill="#5b4a8a"/></g>`); }
    if (key === "cocci") for (let k = 0; k < 10; k++) { const x = rnd(0, w), y = rnd(0, h); for (let i = 0; i < 8; i++) shapes.push(`<circle cx="${x + rnd(-10, 10)}" cy="${y + rnd(-10, 10)}" r="2.6" fill="#3a2f6b"/>`); }
    if (key === "rods") for (let i = 0; i < 60; i++) shapes.push(`<rect x="${rnd(0, w)}" y="${rnd(0, h)}" width="9" height="3" rx="1.5" fill="#3a2f6b" transform="rotate(${rnd(0, 360)} ${rnd(0, w)} ${rnd(0, h)})"/>`);
    if (key === "mites") for (let i = 0; i < 4; i++) { const x = rnd(40, w - 40), y = rnd(40, h - 40); shapes.push(`<g transform="translate(${x} ${y})"><ellipse rx="18" ry="24" fill="#7a6a9a" stroke="#3a2f6b" stroke-width="2"/>${[-1, 1].map(s => [-16, -6, 4, 12].map(yy => `<path d="M${s * 14} ${yy} q${s * 16} -4 ${s * 22} 6" stroke="#3a2f6b" stroke-width="2" fill="none"/>`).join("")).join("")}<circle cy="-22" r="5" fill="#3a2f6b"/></g>`); shapes.push(`<ellipse cx="${x + 40}" cy="${y + 30}" rx="10" ry="6" fill="#d8c8f0" stroke="#5b4a8a" stroke-width="1.5"/>`); }
    if (key === "eggs") for (let i = 0; i < 6; i++) { const x = rnd(40, w - 40), y = rnd(40, h - 40); shapes.push(`<circle cx="${x}" cy="${y}" r="16" fill="#8a6a3a" stroke="#4a3220" stroke-width="5"/><circle cx="${x}" cy="${y}" r="9" fill="#5a4a2a"/>`); }
    if (key === "demodex") for (let i = 0; i < 5; i++) { const x = rnd(40, w - 40), y = rnd(40, h - 40), a = rnd(0, 360); shapes.push(`<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-6" y="-30" width="12" height="60" rx="6" fill="#7a6a9a" stroke="#3a2f6b" stroke-width="2"/>${[-20, -12, -4, 4].map(yy => `<path d="M-6 ${yy} l-8 2 M6 ${yy} l8 2" stroke="#3a2f6b" stroke-width="2"/>`).join("")}</g>`); }
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;border-radius:18px"><g>${bg}<g clip-path="url(#circ)">${shapes.join("")}</g></g></svg>`;
  }
  /* 8. ECG strip (canvas-free SVG) */
  function ecgStrip(key, w = 420, h = 140) {
    let d = "", x = 0; const base = h * 0.6; const beat = (x0, amp = 1, wide = false) => `M${x0} ${base} l6 0 l3 -${6 * amp} l3 ${6 * amp} l4 0 l3 ${4 * amp} l4 -${(wide ? 28 : 40) * amp} l${wide ? 10 : 4} ${(wide ? 40 : 52) * amp} l3 -${12 * amp} l6 0 l6 -${8 * amp} l8 ${8 * amp} l8 0`;
    const p = (x0) => `M${x0} ${base} l6 0 l3 -6 l3 6 l6 0`;
    if (key === "sinus") for (x = 10; x < w; x += 60) d += beat(x);
    if (key === "rsa") { x = 10; let i = 0; while (x < w) { d += beat(x); x += 45 + 25 * Math.abs(Math.sin(i++)); } }
    if (key === "brady") for (x = 10; x < w; x += 120) d += beat(x);
    if (key === "vpc") { for (x = 10; x < w; x += 60) d += (Math.floor(x / 60) % 3 === 2) ? `M${x - 10} ${base} l6 -40 l10 70 l8 -30 l8 0` : beat(x); }
    if (key === "av2") { for (x = 10; x < w; x += 60) d += (Math.floor(x / 60) % 3 === 1) ? p(x) : beat(x); }
    if (key === "vfib") { d = `M0 ${base}`; for (x = 0; x < w; x += 6) d += ` L${x} ${base + (Math.random() - 0.5) * 50}`; }
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;background:#0b0d18;border-radius:14px"><defs><pattern id="gr" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="#243" stroke-width=".6"/></pattern></defs><rect width="${w}" height="${h}" fill="url(#gr)"/><path d="${d}" fill="none" stroke="#7ef29a" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }
  /* 9. Restraint balance: keep the needle in the calm zone by tapping left/right */
  function restraint(container, species = "cat") {
    return new Promise(resolve => {
      const u = ui(container, "Hold the patient calmly", `Keep the marker inside the green zone for 5 seconds. Tap the left or right half of the pad to correct. ${species === "bird" ? "Never squeeze — the chest must move." : "Firm but gentle: less pressure when it struggles, not more."}`);
      const { c, ctx, w, h, pt } = makeCanvas(u.canvasHost, 160); let x = 0.5, v = 0, held = 0, t0 = performance.now(), last = t0, raf, done = false;
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#232841"; ctx.fillRect(20, 60, w - 40, 30); ctx.fillStyle = "#3f9f6a"; ctx.fillRect(20 + (w - 40) * 0.35, 60, (w - 40) * 0.3, 30); ctx.fillStyle = "#f2c14e"; ctx.beginPath(); ctx.arc(20 + (w - 40) * x, 75, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = "bold 13px Nunito, sans-serif"; ctx.fillText(`Calm time: ${held.toFixed(1)} / 5.0 s`, 20, 40); ctx.fillStyle = "#9ea4c4"; ctx.font = "12px Nunito, sans-serif"; ctx.fillText("◀ tap left", 20, 120); ctx.fillText("tap right ▶", w - 90, 120); };
      const loop = (now) => { const dt = (now - last) / 1000; last = now; v += (Math.random() - 0.5) * 0.04 + (x - 0.5) * 0.02; v *= 0.96; x += v * dt * 10; x = Math.max(0, Math.min(1, x)); if (x > 0.35 && x < 0.65) held += dt; else held = Math.max(0, held - dt * 0.5); u.fill.style.width = (held / 5 * 100) + "%"; draw(); if (held >= 5 && !done) { done = true; cancelAnimationFrame(raf); finish(resolve, true, 100, "The patient settled — minimal restraint is the most effective restraint.", u.foot); return; } if (now - t0 > 25000 && !done) { done = true; cancelAnimationFrame(raf); finish(resolve, false, 30, "The patient kept struggling for too long — switch plan: towel wrap, sedation, or a second pair of hands.", u.foot); return; } raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop);
      c.addEventListener("pointerdown", (e) => { const p = pt(e); v += p.x < w / 2 ? -0.08 : 0.08; Sound.click(); });
    });
  }
  /* 10. Bleeding clamp: react in time */
  function clamp(container, seconds = 4) {
    return new Promise(resolve => {
      const u = ui(container, "Bleeder!", "A vessel is spurting — tap CLAMP before the timer runs out, then it will be ligated.");
      const { c, ctx, w, h } = makeCanvas(u.canvasHost, 120); let t = seconds, raf, done = false; const t0 = performance.now();
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#3a1a26"; ctx.fillRect(20, 30, w - 40, 30); ctx.fillStyle = "#ff5f7a"; ctx.fillRect(20, 30, (w - 40) * (t / seconds), 30); ctx.fillStyle = "#fff"; ctx.font = "bold 16px Nunito, sans-serif"; ctx.fillText(`${t.toFixed(1)} s`, w / 2 - 20, 52); };
      const loop = (now) => { t = Math.max(0, seconds - (now - t0) / 1000); draw(); if (t <= 0 && !done) { done = true; Sound.error(); finish(resolve, false, 0, "Too slow — blood loss. Suction, find the vessel, clamp and ligate; consider a transfusion if PCV drops below 20 %.", u.foot); return; } if (!done) raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop);
      u.foot.innerHTML = `<button class="btn warn hold" style="font-size:20px">CLAMP</button>`; u.foot.querySelector("button").onclick = () => { if (done) return; done = true; cancelAnimationFrame(raf); Sound.click(); finish(resolve, true, Math.round(t / seconds * 100), `Clamped in ${(seconds - t).toFixed(1)} s with a Kelly haemostat; ligate below the clamp.`, u.foot); };
    });
  }
  /* 11. Swab count: count the swabs out; one hides under the drape */
  function swabCount(container, n = 10) { n = +n || 10;
    return new Promise(resolve => {
      const u = ui(container, "Swab count before closing", `${n} swabs went in. Tap every swab you can find on the tray and under the drape edge, then confirm the count. A missing swab means re-exploring the abdomen.`);
      const { c, ctx, w, h, pt } = makeCanvas(u.canvasHost, 260); const swabs = []; for (let i = 0; i < n; i++) swabs.push({ x: 40 + Math.random() * (w - 80), y: 40 + Math.random() * (h - 80), found: false, hidden: i === n - 1 });
      const draw = () => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#8a8fb0"; ctx.fillRect(20, 20, w - 40, h - 40); ctx.fillStyle = "#3f6f6a"; ctx.fillRect(w - 150, 20, 130, h - 40); swabs.forEach(s => { if (s.hidden && !s.found) { ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(w - 60, h / 2 - 10, 20, 14); return; } ctx.fillStyle = s.found ? "#7ef29a" : "#fff"; ctx.fillRect(s.x - 12, s.y - 9, 24, 18); if (!s.found) { ctx.fillStyle = "#c0395c"; ctx.fillRect(s.x - 6, s.y - 2, 12, 3); } }); ctx.fillStyle = "#fff"; ctx.font = "bold 13px Nunito, sans-serif"; ctx.fillText(`Found ${swabs.filter(s => s.found).length} / ${n}`, 26, 38); ctx.fillText("drape", w - 140, 38); };
      swabs[n - 1].x = w - 50; swabs[n - 1].y = h / 2; draw();
      c.addEventListener("pointerdown", (e) => { const p = pt(e); const s = swabs.find(s => !s.found && dist(p, s) < 20); if (s) { s.found = true; Sound.click(); } draw(); u.fill.style.width = (swabs.filter(s => s.found).length / n * 100) + "%"; });
      u.foot.innerHTML = `<button class="btn primary">Count is correct — close</button>`; u.foot.querySelector("button").onclick = () => { const found = swabs.filter(s => s.found).length; const ok = found === n; if (!ok) { Sound.alarm(); finish(resolve, false, 40, `You closed with ${n - found} swab(s) unaccounted for — one was under the drape edge. A retained swab causes a granuloma or sepsis and a second surgery. Always count twice.`, u.foot); } else { Sound.success(); finish(resolve, true, 100, "Count correct: all swabs and instruments accounted for. Safe to close.", u.foot); } };
    });
  }
  /* 12. Pack assembly: choose the right instruments (DOM list) */
  function packAssembly(container, procId) {
    return new Promise(resolve => {
      const proc = PROCEDURES[procId]; const needed = [...new Set(proc.steps.map(s => s.tool))]; const pool = [...new Set(needed.concat(["ettube", "ivcath", "lary", "pulseox", "clipper", "chx", "ecollar", "bandage", "balfour", "snook", "cautery", "suction"]))].slice(0, 14).sort(() => Math.random() - 0.5);
      container.innerHTML = `<div class="mgwrap"><h4>Assemble the ${proc.name} pack</h4><p class="muted">Select only the instruments this procedure needs, then autoclave. Missing instruments cost time mid-surgery; unneeded ones get contaminated for nothing.</p><div class="tools small" id="packPool">${pool.map(t => `<button class="tool" data-t="${t}">${toolSVG(t, 120, 48)}<span>${TOOLS[t].short}</span></button>`).join("")}</div><div class="btnrow"><button class="btn primary" id="packGo">Wrap & autoclave (121 °C, 15 min)</button></div><div class="mgfoot"></div></div>`;
      const sel = new Set(); container.querySelectorAll(".tool").forEach(b => b.onclick = () => { const t = b.dataset.t; if (sel.has(t)) { sel.delete(t); b.classList.remove("sel"); } else { sel.add(t); b.classList.add("sel"); } Sound.click(); });
      container.querySelector("#packGo").onclick = () => { const missing = needed.filter(t => !sel.has(t)), extra = [...sel].filter(t => !needed.includes(t)); const score = Math.max(0, 100 - missing.length * 20 - extra.length * 8); const ok = missing.length === 0; const foot = container.querySelector(".mgfoot"); foot.innerHTML = `<p class="muted">Autoclaving… indicator strip turning dark.</p>`; setTimeout(() => finish(resolve, ok, score, `${ok ? "Complete pack, sterile and indicator-verified." : "Pack incomplete: missing " + missing.map(t => TOOLS[t].short).join(", ") + "."}${extra.length ? " Unneeded: " + extra.map(t => TOOLS[t].short).join(", ") + "." : ""}`, foot), 900); };
    });
  }
  /* 13. Dose calculation */
  function dose(container, drug, species, weight) {
    return new Promise(resolve => {
      const mgkg = drug.dose[species]; if (!mgkg || !drug.conc) { container.innerHTML = `<div class="badbox"><b>${drug.name} is not used in this species${drug.id === "permethrin" ? " — PERMETHRIN IS TOXIC TO CATS" : ""}.</b> ${drug.note}</div>`; setTimeout(() => resolve({ ok: false, score: 0, text: "Wrong drug for species" }), 800); return; }
      const correct = mgkg * weight / drug.conc;
      container.innerHTML = `<div class="mgwrap"><h4>Draw up ${drug.name}</h4><table class="ref small"><tr><td>Patient</td><td>${SPECIES[species].label}, <b>${weight} kg</b></td></tr><tr><td>Dose</td><td><b>${mgkg} mg/kg</b> ${drug.route}</td></tr><tr><td>Concentration</td><td><b>${drug.conc} ${drug.unit}</b> (${drug.form})</td></tr></table><p class="muted">Volume (mL) = dose (mg/kg) × weight (kg) ÷ concentration (mg/mL)</p><label>Volume to draw up (mL) <input id="doseIn" type="number" step="0.01" inputmode="decimal" placeholder="0.00"></label><div class="btnrow"><button class="btn primary" id="doseGo">Check</button></div><div class="mgfoot"></div></div>`;
      const go = () => { const v = parseFloat(container.querySelector("#doseIn").value); if (isNaN(v)) return; const err = Math.abs(v - correct) / correct; const ok = err <= 0.1; const foot = container.querySelector(".mgfoot"); finish(resolve, ok, ok ? 100 : 0, `${ok ? "Correct" : "Incorrect"}: ${mgkg} × ${weight} ÷ ${drug.conc} = <b>${correct.toFixed(2)} mL</b>${!ok ? ` (you entered ${v} mL — ${v > correct ? "an overdose" : "an underdose"} of ${(err * 100).toFixed(0)} %)` : ""}. ${drug.note}`, foot); };
      container.querySelector("#doseGo").onclick = go; container.querySelector("#doseIn").addEventListener("keydown", (e) => { if (e.key === "Enter") go(); }); container.querySelector("#doseIn").focus();
    });
  }
  /* 14. Dental chart */
  function dental(container, species, lesions) {
    return new Promise(resolve => {
      const D = DENTAL[species]; const teeth = []; const mk = (q, nums) => nums.forEach((n, i) => teeth.push({ id: q * 100 + n, q, n, i }));
      mk(1, D.teeth.upper.slice().reverse()); mk(2, D.teeth.upper); mk(3, D.teeth.lower); mk(4, D.teeth.lower.slice().reverse());
      const assign = {}; const keys = Object.keys(lesions); const pickTeeth = teeth.filter(t => t.n >= 3).sort(() => Math.random() - 0.5).slice(0, keys.length); pickTeeth.forEach((t, i) => assign[t.id] = keys[i]);
      const decisions = {}; let cur = null;
      const render = () => {
        const row = (q, list) => list.map(t => { const les = assign[t.id] || "healthy"; const L = DENTAL.lesions[les]; const dec = decisions[t.id]; return `<button class="toothbtn ${dec ? "done" : ""} ${les !== "healthy" ? "lesion" : ""}" data-id="${t.id}" title="${t.id} ${D.names[t.n]}">${icon("tooth", 22)}<small>${t.id}</small>${dec ? `<em>${dec}</em>` : ""}</button>`; }).join("");
        container.innerHTML = `<div class="mgwrap"><h4>Dental chart — modified Triadan</h4><p class="muted">Tap each tooth, read the finding and choose: scale, extract or leave. Quadrants: 100 upper right · 200 upper left · 300 lower left · 400 lower right (as viewed facing the patient).</p><div class="jaw"><div class="arcade">${row(1, teeth.filter(t => t.q === 1))}${row(2, teeth.filter(t => t.q === 2))}</div><div class="arcade">${row(4, teeth.filter(t => t.q === 4))}${row(3, teeth.filter(t => t.q === 3))}</div></div><div id="toothInfo">${cur ? toothInfo(cur) : "<p class='muted'>Select a tooth.</p>"}</div><div class="btnrow"><button class="btn primary" id="dentalDone">Finish dental</button></div><div class="mgfoot"></div></div>`;
        container.querySelectorAll(".toothbtn").forEach(b => b.onclick = () => { cur = +b.dataset.id; render(); });
        container.querySelectorAll("[data-act]").forEach(b => b.onclick = () => { decisions[cur] = b.dataset.act; Sound.click(); cur = null; render(); });
        container.querySelector("#dentalDone").onclick = () => { let errors = 0, missed = 0; teeth.forEach(t => { const les = assign[t.id] || "healthy"; const need = DENTAL.lesions[les].action; const dec = decisions[t.id] || "leave"; if (les !== "healthy" && dec !== need) { errors++; if (!decisions[t.id]) missed++; } if (les === "healthy" && dec === "extract") errors++; }); const ok = errors === 0; finish(resolve, ok, Math.max(0, 100 - errors * 25), ok ? "All pathology addressed correctly; healthy teeth preserved. Polish, chart, and send home with brushing advice." : `${errors} error(s) — ${missed} lesion(s) not examined. Every tooth is probed and charted; radiographs catch what the eye misses.`, container.querySelector(".mgfoot")); };
      };
      const toothInfo = (id) => { const t = teeth.find(x => x.id === id); const les = assign[id] || "healthy"; const L = DENTAL.lesions[les]; return `<div class="step cur"><div><b>${id} — ${D.names[t.n]}</b><div class="tip">${L.label}. Probing depth ${les === "healthy" ? "normal" : "increased"}; ${les === "mobile" ? "grade 3 mobility" : les === "fracture" ? "pulp visible" : les === "forl" ? "radiograph: root resorption" : les === "calculus" ? "stage 1–2 periodontitis" : "no mobility"}.</div><div class="btnrow tight"><button class="btn small" data-act="scale">Scale & polish</button><button class="btn small warn" data-act="extract">Extract</button><button class="btn small" data-act="leave">Leave</button></div></div></div>`; };
      render();
    });
  }

  return { clipVacuum, scrubPattern, drape, ligature, suture, ultrasound, microscopeField, ecgStrip, restraint, clamp, swabCount, packAssembly, dose, dental };
})();
