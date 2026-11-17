/* ============================================================
   UX v2.2 — notifications, needs-you bar, speech/thought bubbles,
   pause, look-stick, exam mini-game routing, marketing, city map
   ============================================================ */

/* ---------- notifications: stacked, capped, de-duplicated ---------- */
(function patchToast() {
  const PRI = { warn: 3, ach: 2, good: 1, info: 1 }; const queue = []; let current = null, timer = null; const recent = new Map();
  const host = () => $("#toasts");
  function next() { current = null; if (!queue.length) return; queue.sort((a, b) => b.pri - a.pri); show(queue.shift()); }
  function show(t) {
    const el = document.createElement("div"); el.className = "toast " + t.kind; el.innerHTML = `<span class="tmsg">${t.msg}</span><button class="tx" aria-label="dismiss">✕</button>`;
    host().innerHTML = ""; host().appendChild(el); current = t; requestAnimationFrame(() => el.classList.add("show"));
    const done = () => { clearTimeout(timer); el.classList.remove("show"); setTimeout(() => { if (el.parentNode) el.remove(); next(); }, 250); };
    el.querySelector(".tx").onclick = done; timer = setTimeout(done, Math.min(t.ms, t.kind === "warn" ? 4200 : 2800));
  }
  window.logActivity = function (msg, kind) { const t = G.s ? clockStr().replace(/^Day \d+ /, "") : ""; G.log.unshift({ t, msg, kind }); if (G.log.length > 60) G.log.pop(); };
  window.toast = function (msg, kind = "info", ms = 3200) {
    logActivity(msg, kind); if (kind === "xp") return; if (G.ho && !G.hoToast && kind !== "warn" && !/EMERGENCY/.test(msg)) { G.hoHeld = (G.hoHeld || 0) + 1; return; } if (kind === "info" && G.s && G.s.settings && (G.s.settings.fewerToasts || (G.ho && typeof hoPhone === "function" && hoPhone()))) return; // XP ticks live in the activity log, not on screen
    const key = msg.replace(/<[^>]+>/g, "").slice(0, 60); const now = Date.now(); if (recent.get(key) && now - recent.get(key) < 4000) return; recent.set(key, now);
    const t = { msg, kind, ms, pri: PRI[kind] || 1 };
    if (!current) show(t); else if (t.pri > current.pri) { queue.push(current); clearTimeout(timer); show(t); } else { queue.push(t); while (queue.length > 3) { queue.sort((a, b) => b.pri - a.pri); queue.pop(); } }
    if (kind === "warn") Sound.vibrate(40);
  };
})();

/* ---------- needs-you bar: persistent chips for things waiting on the player ---------- */
function updateNeeds() {
  const el = $("#needs"); if (!el) return; const chips = [];
  const n = (st) => G.patients.filter(p => p.status === st).length; const rx = G.patients.filter(p => p.rx && !p.rxDone && ["ready_discharge", "to_desk", "recovery"].includes(p.status)).length;
  const em = G.patients.find(p => p.emergency && p.emergencyLeft > 0);
  if (em) chips.push(["warn", `Emergency · ${Math.ceil(em.emergencyLeft)}s`, "warn"]);
  if (n("at_desk")) chips.push(["bell", `${n("at_desk")} at reception`]); if (n("exam_ready")) chips.push(["steth", "Exam ready"]); if (n("ready_or")) chips.push(["scalpel", "Surgery ready"]); if (n("preop")) chips.push(["folder", "Pre-op"]); if (n("xray_ready")) chips.push(["xray", "X-ray"]);
  if (rx) chips.push(["drug", `${rx} prescription`]); if (n("ready_discharge")) chips.push(["card", `${n("ready_discharge")} to pay`]); if (n("waiting")) chips.push(["paw", `${n("waiting")} waiting`]); if (n("recovery")) chips.push(["bed", "Recovery"]);
  if (G.shopCustomer) chips.push(["shop", "Shop customer"]); if (G.s.clinicPet.hunger > 75) chips.push(["bowl", `Feed ${G.s.clinicPet.name}`, "warn"]); if (G.s.energy < 25) chips.push(["moon", "Rest", "warn"]);
  const shown = chips.slice(0, 2); el.innerHTML = shown.map(c => `<span class="chip ${c[2] || ""}">${icon(c[0], 13)} ${c[1]}</span>`).join("") + (chips.length > 2 ? `<span class="chip more">+${chips.length - 2}</span>` : "");
  el.style.display = shown.length ? "" : "none"; const b = $("#pillBadge"); if (b) { b.hidden = !chips.length; b.textContent = chips.length; b.classList.toggle("warn", chips.some(c => c[2] === "warn")); }
}

/* ---------- 3D-anchored bubbles ---------- */
const Bubbles = (() => {
  const list = []; const host = () => $("#bubbles");
  function project(v3) { const v = v3.clone(); v.project(World.camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, behind: v.z > 1 }; }
  function show(opts) { const el = document.createElement("div"); el.className = "bubble " + (opts.kind || "speech"); el.innerHTML = `<div class="bcontent">${opts.html}</div>`; host().appendChild(el); const b = { el, target: opts.target, ttl: opts.ttl === undefined ? 4 : opts.ttl, born: gameNow(), yoff: opts.yoff || 2.1 }; list.push(b); requestAnimationFrame(() => el.classList.add("on")); if (opts.onMount) opts.onMount(el); return b; }
  function remove(b) { const i = list.indexOf(b); if (i >= 0) list.splice(i, 1); b.el.classList.remove("on"); setTimeout(() => b.el.remove(), 250); }
  function update() { const now = gameNow(); for (const b of list.slice()) { if (b.ttl > 0 && now - b.born > b.ttl * 1000) { remove(b); continue; } const t = b.target(); if (!t) { remove(b); continue; } const p = project(new THREE.Vector3(t.x, t.y + b.yoff, t.z)); const hh = b.el.offsetHeight + 12; b.el.style.left = Math.max(90, Math.min(innerWidth - 90, p.x)) + "px"; b.el.style.top = Math.max(hh, Math.min(innerHeight - 60, p.y)) + "px"; b.el.style.opacity = p.behind ? 0 : 1; } }
  function clear() { list.slice().forEach(remove); }
  return { show, remove, update, clear, get count() { return list.length; } };
})();

/* owner dialogue as a speech bubble with choices */
function bubbleTalk(p, next) {
  const O = OWNER_TYPES[p.personality]; const opts = O.options.map((o, i) => ({ o, i })).sort(() => Math.random() - 0.5);
  if (window.__joyReset) window.__joyReset(); G.panelOpen = true; document.body.classList.add("talking"); // freeze movement while talking
  const target = () => p.npc && p.npc.rig.group.position;
  const b = Bubbles.show({ target, ttl: 0, yoff: 2.2, html: `<button class="bclose" aria-label="Not now">✕</button><div class="bname">${p.ownerName} <span class="muted">(${O.label})</span></div><div class="btext">${O.intro(p)}</div><div class="bopts">${opts.map(x => `<button class="bopt" data-i="${x.i}">${x.o[0]}</button>`).join("")}</div>` });
  b.el.querySelector(".bclose").onclick = () => { Bubbles.remove(b); G.panelOpen = false; document.body.classList.remove("talking"); p.greeted = false; };
  b.el.querySelectorAll(".bopt").forEach(btn => btn.onclick = () => {
    const o = O.options[+btn.dataset.i]; const d = o[1]; if (d > 0) { Sound.success(); rep(0.05, ""); addXP(8); p.compliance = 1; } else { Sound.error(); rep(d * 0.08, "client communication"); p.compliance = 0.6; }
    Bubbles.remove(b);
    const reply = Bubbles.show({ target, ttl: 0, yoff: 2.2, html: `<div class="bname">${p.ownerName}</div><div class="btext">${d > 0 ? ["“Thank you, doctor. That helps.”", "“Okay — I trust you.”", "“That makes sense.”"][Math.floor(Math.random() * 3)] : ["“Hmm. If you say so…”", "“I'm not sure I like that.”"][Math.floor(Math.random() * 2)]}</div><div class="bwhy ${d > 0 ? "good" : "bad"}">${O.why}</div><div class="bopts"><button class="bopt primary" id="bnext">Continue</button></div>` });
    reply.el.querySelector("#bnext").onclick = () => { Bubbles.remove(reply); G.panelOpen = false; document.body.classList.remove("talking"); next(); };
  });
}
/* short NPC remarks (no choices) */
function say(target, text, ttl = 3.5) { return Bubbles.show({ target, ttl, html: `<div class="btext">${text}</div>` }); }

/* ---------- thought bubbles for the doctor ---------- */
let thoughtT = 25, lastThought = "";
function think(text, ttl = 4.5) { if (text === lastThought) return; lastThought = text; const pp = World.playerPos(); Bubbles.show({ kind: "thought", target: () => World.camMode === "first" ? { x: pp.x, y: 0.2, z: pp.z } : pp, ttl, yoff: 2.35, html: `<div class="btext">${text}</div>` }); }
function thoughtTick(dt) {
  if (G.panelOpen || G.paused) return; thoughtT -= dt; if (thoughtT > 0) return; thoughtT = rnd(28, 50);
  const s = G.s, cp = s.clinicPet, pool = [];
  if (cp.hunger > 70) pool.push(`I should feed ${cp.name}…`, `${cp.name}'s bowl is empty.`);
  if (s.energy < 35) pool.push("I really need a coffee right now.", "A quick nap would help before the next surgery.");
  if (G.patients.some(p => p.status === "at_desk")) pool.push("Someone's waiting at reception.");
  if (G.patients.some(p => p.status === "waiting")) pool.push("I shouldn't keep them waiting too long.");
  if (G.patients.some(p => p.rx && !p.rxDone && ["ready_discharge", "to_desk"].includes(p.status))) pool.push("The prescription still needs dispensing at the pharmacy.");
  if (G.shopCustomer) pool.push("There's a customer at the shop counter.");
  if (s.shiftActive && s.clockMin > 17 * 60 && !s.closing) pool.push("It's getting late — time to close the doors soon.");
  if (!s.shiftActive) pool.push("Shall I open the clinic? The shift board is by the entrance.");
  if (s.outfit === "surgical" && World.roomAt(World.playerPos().x, World.playerPos().z) !== "or") pool.push("I'm still gowned — I should de-gown outside theatre.");
  if (s.staff.length === 0 && s.day >= 2) pool.push("A receptionist would make mornings easier.");
  if (s.rep < 2.5) pool.push("Reputation is slipping. Maybe some ads from the office?");
  if (!pool.length) pool.push(["Nice day for a spay.", `${cp.name} is asleep on the keyboard again.`, "I wonder what the lab results will show.", "Remember: cap and mask before the scrub.", "Chlorhexidine, alcohol, chlorhexidine.", "Did I count the swabs?"][Math.floor(Math.random() * 6)]);
  think(pick(pool));
}

/* ---------- pause ---------- */
function togglePause(force) {
  G.paused = force === undefined ? !G.paused : force; closeMenus(); $("#pauseOverlay").classList.toggle("hidden", !G.paused);
  if (G.paused) { G.input.x = G.input.z = 0; G.input.run = false; G.keys = {}; Sound.music.stop(); if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); save(); }
  else if (G.s.settings.music && G.s.shiftActive) Sound.music.start("lobby");
}
document.addEventListener("visibilitychange", () => { if (document.hidden && G.s && G.s.shiftActive && !G.paused) togglePause(true); });

/* ---------- right-hand look stick (first person on touch) ---------- */
function bindLookStick() {
  const zone = $("#lookZone"); if (!zone) return; let id = null, lx = 0, ly = 0, sx = 0, sy = 0, t0 = 0;
  zone.addEventListener("pointerdown", (e) => { if (id !== null && !e.isPrimary) return; id = e.pointerId; lx = sx = e.clientX; ly = sy = e.clientY; t0 = performance.now(); try { zone.setPointerCapture(id); } catch (err) { } e.preventDefault(); });
  zone.addEventListener("pointermove", (e) => { if (e.pointerId !== id || G.paused) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; World.lookDelta(dx * 0.0062, dy * 0.0052); });
  const end = (e) => { if (e.pointerId !== id) return; id = null; if (performance.now() - t0 < 220 && Math.hypot(e.clientX - sx, e.clientY - sy) < 10) { const was = G.panelOpen || G.ho; interact(); if (!was && (G.panelOpen || G.ho) && typeof swallowGhostClick === "function") swallowGhostClick(); } };
  zone.addEventListener("pointerup", end); zone.addEventListener("pointercancel", end); zone.addEventListener("lostpointercapture", (e) => { if (e.pointerId === id) id = null; });
}
function updateFPUI() { const fp = World.camMode === "first"; $("#lookZone").classList.toggle("show", fp && G.touch); $("#crosshair").classList.toggle("show", fp); document.body.classList.toggle("fp", fp); if (fp && !G.touch && !G.fpHinted) { G.fpHinted = true; toast("First person: click the view to look with the mouse · WASD to walk · E to use · Esc frees the mouse.", "info", 6000); } }

/* ---------- exam-step mini-games ---------- */
function examMinigame(p, step) {
  const run = (title, fn, ic) => MGpanel(title, fn, { icon: ic }).then(r => { if (r && !r.ok) p.mistakes++; else addXP(6); });
  if (step === "tpr") return run("Temperature", (el) => MG.thermometer(el, p.vitals.temp), "steth");
  if (step === "ausc") return run("Auscultation", (el) => MG.auscultation(el, p.species), "steth");
  if (step === "msk" && p.secondary && /flea/.test(p.secondary)) return run("Flea comb", (el) => MG.fleaComb(el), "paw");
  return null;
}

/* ---------- marketing / reputation actions ---------- */
const MARKETING = [
  { id: "posters", name: "Neighbourhood posters", price: 60, rep: 0.1, cd: 2, desc: "Flyers at the pet shop and the mosque noticeboard." },
  { id: "social", name: "Social media campaign", price: 150, rep: 0.3, cd: 3, desc: "A week of before/after stories (with consent) and vaccination reminders." },
  { id: "openday", name: "Open day with free nail trims", price: 300, rep: 0.5, cd: 7, desc: "Tours of the clinic, free nail trims, a talk on parasite prevention." },
  { id: "loyalty", name: "Loyalty cards", price: 100, rep: 0.15, cd: 5, desc: "10th consultation free — regulars come back more often." },
  { id: "charityday", name: "Shelter charity day", price: 200, rep: 0.4, cd: 7, desc: "Discounted spays for the shelter; the newspaper covers it." }
];
function marketingHTML() { const s = G.s; s.marketing = s.marketing || {}; return `<h4>${icon("star", 16)} Reputation & marketing</h4><p class="muted">Reputation also recovers slowly on its own when it is below 3.5. These give it a push.</p><div class="shopgrid">${MARKETING.map(m => { const last = s.marketing[m.id] || -99; const ready = s.day - last >= m.cd; return `<div class="shopitem"><span class="icw">${icon("star", 22)}</span><div><b>${m.name}</b> — ${m.price} JD · +${m.rep} ★<br><span class="muted">${m.desc}</span><div class="btnrow tight">${ready ? `<button class="btn small primary" onclick="buyMarketing('${m.id}')">Run</button>` : `<span class="muted">Available again on day ${last + m.cd}</span>`}</div></div></div>`; }).join("")}</div>`; }
function buyMarketing(id) { const m = MARKETING.find(x => x.id === id); if (G.s.money < m.price) return toast("Not enough money.", "warn"); G.s.money -= m.price; G.s.marketing[id] = G.s.day; G.s.rep = Math.min(5, G.s.rep + m.rep); Sound.success(); toast(`${m.name}: reputation +${m.rep} ★`, "good"); award("marketer"); updateHUD(); uiOffice(); save(); }

/* ---------- city map (foundation for the world outside) ---------- */
function uiMap() {
  const s = G.s; const pos = World.playerPos();
  const poi = OUTDOOR_POIS.map(p => `<g><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="10" fill="${p.open ? "#2a2f4a" : "#1c2033"}" stroke="${p.open ? "#f2c14e" : "#3c4268"}" stroke-width="2" stroke-dasharray="${p.open ? 0 : "6 4"}"/><text x="${p.x + p.w / 2}" y="${p.y + p.h / 2 - 4}" text-anchor="middle" fill="${p.open ? "#fff" : "#9ea4c4"}" font-size="13" font-weight="800" font-family="Nunito, sans-serif">${p.name}</text><text x="${p.x + p.w / 2}" y="${p.y + p.h / 2 + 14}" text-anchor="middle" fill="#9ea4c4" font-size="11" font-family="Nunito, sans-serif">${p.open ? p.sub : "coming soon"}</text></g>`).join("");
  const you = { x: 300 + pos.x * 4.5, y: 200 + pos.z * 4.5 };
  openPanel(`${icon("home", 20)} City map`, `<svg viewBox="0 0 600 420" style="width:100%;border-radius:18px;background:#0f1222"><rect x="0" y="0" width="600" height="420" fill="#121630"/><rect x="0" y="268" width="600" height="40" fill="#1b1d2b"/><line x1="0" y1="288" x2="600" y2="288" stroke="#f2c14e" stroke-width="2" stroke-dasharray="12 10"/><rect x="60" y="0" width="30" height="420" fill="#1b1d2b"/>${poi}<circle cx="${you.x}" cy="${you.y}" r="7" fill="#7ef29a" stroke="#fff" stroke-width="2"><animate attributeName="r" values="6;9;6" dur="1.4s" repeatCount="indefinite"/></circle><text x="${you.x + 12}" y="${you.y + 4}" fill="#7ef29a" font-size="12" font-family="Nunito, sans-serif">you</text></svg><p class="muted">Dashed blocks are planned areas — home interior, the park, the pet market and the shelter are on the roadmap. You can already walk the street, visit the garden and reach your front door.</p>`, { wide: true });
}
