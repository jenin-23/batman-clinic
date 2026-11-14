/* ============================================================
   GAME — Batman Clinic state machine, UI panels, progression
   ============================================================ */
const SAVE_KEY = "batman-clinic-save-v1";
const $ = (s) => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmtMoney = (n) => `${Math.round(n)} JD`;

const G = {
  s: null, patients: [], input: { x: 0, z: 0, run: false }, keys: {}, panelOpen: false, nearest: null,
  spawnTimer: 0, shopTimer: 0, gateToast: 0, lastRoom: null, hoverLabel: null, toastQ: [], patientSeq: 1
};

function defaultState() {
  return { money: 300, xp: 0, level: 1, day: 1, shiftActive: false, clockMin: 9 * 60, patientsSeen: 0, correctDx: 0, surgeries: 0, itemsSold: 0, refsRead: [], shiftsDone: 0,
    achievements: [], cases: [], clinicName: "Batman Clinic", outfit: "clinic", handScrubbed: false, seenTutorial: false, stock: Object.fromEntries(SHOP_ITEMS.map(i => [i.id, 5])),
    theme: { v: 2, wall: "#2a2f4a", accent: "#f2c14e", trim: "#4b4f7a", floor: null, coat: "#e9e9f2", decor: true } };
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.s)); } catch (e) { } }
function load() { try { const r = localStorage.getItem(SAVE_KEY); if (r) { const s = JSON.parse(r); if (!s.theme || s.theme.v !== 2) s.theme = defaultState().theme; return Object.assign(defaultState(), s, { shiftActive: false, outfit: "clinic", handScrubbed: false }); } } catch (e) { } return defaultState(); }

/* ---------------- UI primitives ---------------- */
function toast(msg, kind = "info", ms = 3200) {
  const t = document.createElement("div"); t.className = "toast " + kind; t.innerHTML = msg; $("#toasts").appendChild(t);
  requestAnimationFrame(() => t.classList.add("show")); setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, ms);
}
function openPanel(title, html, opts = {}) {
  G.panelOpen = true; const p = $("#panel"); p.classList.remove("hidden"); p.classList.toggle("wide", !!opts.wide);
  $("#panelTitle").innerHTML = title; $("#panelBody").innerHTML = html; $("#panelBody").scrollTop = 0;
  $("#panelClose").style.display = opts.noClose ? "none" : "";
  G.input.x = G.input.z = 0;
}
function closePanel() { G.panelOpen = false; $("#panel").classList.add("hidden"); if (G.onPanelClose) { const f = G.onPanelClose; G.onPanelClose = null; f(); } }
function setBody(html) { $("#panelBody").innerHTML = html; $("#panelBody").scrollTop = 0; }

/* ---------------- progression ---------------- */
function addXP(n, why) {
  G.s.xp += n; if (why) toast(`+${n} XP · ${why}`, "xp", 2200);
  const next = LEVELS.find(l => l.level === G.s.level + 1);
  if (next && G.s.xp >= next.xp) { G.s.level = next.level; Sound.unlock(); setTimeout(() => openPanel("🎉 Level " + next.level + " unlocked!", `<p class="big">New phase: <b>${next.unlock}</b></p><p>${levelHint(next.level)}</p><div class="btnrow"><button class="btn primary" onclick="closePanel()">Let's go</button></div>`), 300); }
  updateHUD(); save();
}
function levelHint(l) { return { 2: "Fractures and foreign bodies now arrive. Take the patient to the X-ray Suite after the exam and hover the bones on the viewer to learn them. Birds will start visiting — remember: never squeeze their chest.", 3: "Surgical cases unlock. The pathway is: Exam → Prep room (pre-op checklist) → Locker (scrubs, cap, mask) → Sink (hand scrub, gown, gloves) → Operating Room. The OR door will stop you if you are not dressed correctly.", 4: "Gastric foreign body surgery (gastrotomy) is now available — longer, with more anaesthetic events to manage.", 5: "Avian surgery: the ingluviotomy. Birds need an uncuffed tube, constant warming and no alcohol prep.", 6: "You are a Master Surgeon. Keep the clinic running and collect every achievement!" }[l] || ""; }
function award(id) { if (G.s.achievements.includes(id)) return; const a = ACHIEVEMENTS.find(x => x.id === id); if (!a) return; G.s.achievements.push(id); Sound.success(); toast(`${a.icon} Achievement: <b>${a.name}</b> — ${a.desc}`, "ach", 4200); addXP(25); }
function earn(n) { G.s.money += n; Sound.cash(); updateHUD(); }

function updateHUD() {
  const s = G.s; $("#hudName").textContent = s.clinicName; $("#hudDay").textContent = `Day ${s.day}`;
  const h = Math.floor(s.clockMin / 60), m = Math.floor(s.clockMin % 60); $("#hudClock").textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  $("#hudShift").textContent = s.shiftActive ? "● Shift open" : "○ Closed"; $("#hudShift").className = s.shiftActive ? "on" : "off";
  $("#hudMoney").textContent = fmtMoney(s.money); $("#hudLevel").textContent = `Lv ${s.level}`;
  const cur = LEVELS.find(l => l.level === s.level), nxt = LEVELS.find(l => l.level === s.level + 1);
  const pct = nxt ? Math.min(100, (s.xp - cur.xp) / (nxt.xp - cur.xp) * 100) : 100; $("#xpFill").style.width = pct + "%"; $("#hudXP").textContent = nxt ? `${s.xp} / ${nxt.xp} XP` : `${s.xp} XP · MAX`;
  const outfitLabel = { clinic: "👔 White coat (clinic)", scrubs: "🧢 Scrubs + cap + mask", surgical: "🧤 Sterile gown + gloves" }[s.outfit];
  $("#hudOutfit").textContent = outfitLabel;
  // patient board
  const list = G.patients.filter(p => p.status !== "done").map(p => `<li><span>${SPECIES[p.species].emoji} <b>${p.name}</b></span><span class="st ${p.status}">${statusLabel(p.status)}</span></li>`).join("");
  $("#board").innerHTML = list || "<li class='muted'>No patients right now</li>";
}
function statusLabel(st) { return { arriving: "arriving", at_desk: "at reception", waiting: "waiting room", to_exam: "walking to exam", exam_ready: "on exam table", to_xray: "to X-ray", xray_ready: "X-ray suite", to_prep: "to prep", preop: "pre-op (prep room)", ready_or: "on OR table", recovery: "recovering", to_desk: "to reception", ready_discharge: "ready to pay", leaving: "leaving" }[st] || st; }

/* ---------------- patients ---------------- */
function eligibleCases() { return CASES.filter(c => c.level <= G.s.level && (c.species !== "bird" || G.s.level >= 2)); }
function spawnPatient() {
  const c = pick(eligibleCases()); const sp = SPECIES[c.species];
  const regular = G.s.cases.length > 2 && Math.random() < 0.35; const prev = regular ? pick(G.s.cases.filter(x => x.species === c.species)) : null;
  const p = { id: G.patientSeq++, caseDef: c, species: c.species, name: prev ? prev.name : pick(sp.names), ownerName: prev ? prev.ownerName : pick(OWNER_NAMES), breed: prev ? prev.breed : pick(sp.breeds), age: prev ? prev.age : (c.id.includes("vax_cat") ? "10 weeks" : c.id === "spay_dog" ? "7 months" : `${Math.floor(rnd(1, 11))} years`),
    weight: prev ? prev.weight : +(c.species === "bird" ? rnd(sp.weight[0], sp.weight[1]).toFixed(3) : rnd(sp.weight[0], sp.weight[1]).toFixed(1)), sex: pick(["male", "female"]), regular: !!prev, status: "arriving", record: [], mistakes: 0, examDone: {}, vitals: null, intake: null };
  if (c.id.includes("spay")) p.sex = "female (intact)"; if (c.id.includes("neuter")) p.sex = "male (intact)";
  const skinTones = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac], shirts = [0x7c6fcf, 0x5f8fd6, 0xe07a5f, 0xf2c14e, 0x4fb3a9, 0xb4557a, 0x3a3f66], pants = [0x24304f, 0x3a3a4e, 0x5a3e2b];
  const petColors = { dog: [0xd9a066, 0x5b4636, 0xf5e6c8, 0x8c8c8c, 0xe8d5b5], cat: [0xf2a35e, 0x3a3a3a, 0xf7f3ec, 0xa9a9a9, 0xc7b299], bird: [0x7fd1c7, 0xfff3a0, 0x9fd7ff, 0xb7e3a3] };
  p.npcCfg = { skin: pick(skinTones), hair: pick([0x1b1420, 0x4a2c1a, 0x8b5a2b, 0xd9b38c]), shirt: pick(shirts), pants: pick(pants), curly: Math.random() < 0.4, glasses: Math.random() < 0.3, pet: { species: c.species, color: pick(petColors[c.species]) } };
  p.npc = World.addNPC(Object.assign({ x: 0, z: -14.5 }, p.npcCfg));
  G.patients.push(p);
  const q = G.patients.filter(x => ["arriving", "at_desk"].includes(x.status)).length - 1;
  const spots = [[0, -6.3], [1.1, -7.3], [-1.1, -7.3]]; const spot = spots[Math.min(q, 2)];
  p.npc.path = [[0, -10.5], [0, -8.8], spot]; p.npc.speed = 2.2;
  p.npc.onArrive = () => { p.status = "at_desk"; updateHUD(); };
  setTimeout(() => { Sound.door(); }, 900); setTimeout(() => { Sound.bell(); toast(`🛎️ ${p.ownerName} arrives with ${p.name} the ${p.breed}${p.regular ? " (regular client)" : " (new patient)"}`, "info"); setTimeout(() => Sound.pet(p.species), 500); }, 1600);
  p.record.push(`${clockStr()} — Arrived. Owner: ${p.ownerName}. Complaint: ${c.complaint}`); updateHUD();
}
function clockStr() { const h = Math.floor(G.s.clockMin / 60), m = Math.floor(G.s.clockMin % 60); return `Day ${G.s.day} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }
function walkNPC(p, path, status, onArrive) { p.status = status; p.npc.petFollow = true; p.npc.pet.group.position.y = 0; if (p.npc.pet.parts.cage) p.npc.pet.parts.cage.visible = p.species === "bird"; p.npc.path = path.slice(); p.npc.onArrive = () => { if (onArrive) onArrive(); updateHUD(); }; updateHUD(); }
const PATH = {
  deskToWait: (i) => [[-1.5, -6.8], [[-5.6, -7.5], [-4.1, -7.5], [-2.6, -7.5], [-4.7, -6.2]][i % 4]],
  waitToExam: [[-2, -5.5], [0, -3.2], [0, -0.0], [11, 0], [11, -2.2], [11, -3.9]],
  examToXray: [[11, -2.5], [10.5, 0], [10.5, 3], [10.5, 4.6]],
  examToPrep: [[11, -2.5], [-5, 0], [-5, 2.8], [-4.6, 3.8]],
  xrayToPrep: [[10.5, 2.5], [10.5, 0], [-5, 0], [-5, 2.8], [-4.6, 3.8]],
  xrayToDesk: [[10.5, 2.5], [10.5, 0], [0, 0], [0, -2.5], [0, -6.3]],
  examToDesk: [[11, -2.5], [11, 0], [0, 0], [0, -2.5], [0, -6.3]],
  prepOut: [[-5, 2.8], [-5, 0], [0, 0], [0, -2.5], [0, -8.8], [0, -14.5]],
  leave: [[0, -8.8], [0, -14.5]],
  entryToDesk: [[0, -10.5], [0, -8.8], [0, -6.3]]
};

/* ---------------- interactables ---------------- */
const INTERACT = [
  { id: "shiftBoard", pos: { x: 4.5, z: -8.3 }, r: 1.6, label: () => G.s.shiftActive ? "Shift board — end shift / goals" : "Shift board — START SHIFT", action: () => uiShiftBoard() },
  { id: "desk", pos: { x: 0, z: -4.5 }, r: 1.7, label: () => { const p = patientAt("at_desk"); const d = patientAt("ready_discharge"); return d ? `Reception — discharge ${d.name} & take payment` : p ? `Reception — register ${p.name}` : "Reception desk"; }, action: () => uiDesk() },
  { id: "bell", pos: { x: 1.3, z: -4.5 }, r: 0.7, label: () => "Ring the bell", action: () => { Sound.bell(); toast("🛎️ Ding!", "info", 1200); } },
  { id: "examTable", pos: { x: 11, z: -4.6 }, r: 1.7, label: () => { const p = patientAt("exam_ready"); return p ? `Examine ${p.name}` : "Exam table (no patient)"; }, action: () => uiExam() },
  { id: "xrayTable", pos: { x: 10.5, z: 5.0 }, r: 1.6, label: () => { const p = patientAt("xray_ready"); return p ? `Take radiograph of ${p.name}` : "X-ray table"; }, action: () => uiXray() },
  { id: "viewer", pos: { x: 10.5, z: 9.4 }, r: 1.4, label: () => "Radiograph viewer — anatomy atlas", action: () => uiViewer() },
  { id: "prepTable", pos: { x: -4.6, z: 4.2 }, r: 1.6, label: () => { const p = patientAt("preop"); return p ? `Pre-operative checklist — ${p.name}` : "Prep table"; }, action: () => uiPreop() },
  { id: "locker", pos: { x: -6.8, z: 8.4 }, r: 1.4, label: () => "Locker — change outfit", action: () => uiLocker() },
  { id: "sink", pos: { x: -5, z: 9.2 }, r: 1.3, label: () => "Scrub sink — surgical hand scrub, gown & gloves", action: () => uiSink() },
  { id: "orTable", pos: { x: 2, z: 7.0 }, r: 1.6, label: () => { const p = patientAt("ready_or"); return p ? `Begin surgery — ${p.name}` : "Operating table"; }, action: () => uiSurgery() },
  { id: "tray", pos: { x: 3.8, z: 4.6 }, r: 1.2, label: () => "Instrument tray — learn the instruments", action: () => uiReference("tools") },
  { id: "anes", pos: { x: 0.0, z: 6.8 }, r: 1.2, label: () => "Anaesthesia machine — monitoring targets", action: () => uiReference("anes") },
  { id: "kennel", pos: { x: 4.9, z: 8.9 }, r: 1.4, label: () => { const p = patientAt("recovery"); return p ? `Recovery kennel — check on ${p.name}` : "Recovery kennel"; }, action: () => uiRecovery() },
  { id: "counter", pos: { x: -11, z: -2.6 }, r: 1.6, label: () => "Shop counter — sell supplies", action: () => uiShop() },
  { id: "officeDesk", pos: { x: -11.5, z: 7.2 }, r: 1.5, label: () => "Office desk — customise clinic & stats", action: () => uiOffice() },
  { id: "cabinet", pos: { x: -9.2, z: 9.0 }, r: 1.3, label: () => "Filing cabinet — case files (print PDF)", action: () => uiCases() },
  { id: "printer", pos: { x: -13.5, z: 9.0 }, r: 1.2, label: () => "Printer — print case files", action: () => uiCases() },
  { id: "bookshelf", pos: { x: -13.8, z: 6.5 }, r: 1.4, label: () => "Bookshelf — references", action: () => uiLibrary() }
];
function patientAt(status) { return G.patients.find(p => p.status === status); }

/* ---------------- SHIFT ---------------- */
function uiShiftBoard() {
  const s = G.s; const active = G.patients.filter(p => p.status !== "done").length;
  const goals = [[`Patients seen: ${s.patientsSeen}`, s.patientsSeen], [`Correct diagnoses: ${s.correctDx}`, s.correctDx], [`Surgeries: ${s.surgeries}`, s.surgeries], [`Items sold: ${s.itemsSold}`, s.itemsSold], [`Shifts completed: ${s.shiftsDone}`, s.shiftsDone]];
  const ach = ACHIEVEMENTS.map(a => `<div class="ach ${s.achievements.includes(a.id) ? "got" : ""}"><span class="ic">${a.icon}</span><div><b>${a.name}</b><br><span class="muted">${a.desc}</span></div></div>`).join("");
  const nxt = LEVELS.find(l => l.level === s.level + 1);
  openPanel("📋 Shift board", `
    <div class="cols"><div>
      <h4>Shift</h4>
      ${s.shiftActive ? `<p>Shift is open. ${active ? `<b>${active}</b> patient(s) still in the clinic — finish them before closing, or they'll be rescheduled.` : "No patients inside."}</p><button class="btn warn" onclick="endShift()">End shift</button>`
        : `<p>Open the doors and patients will start arriving. A bell rings when someone comes in — go to the reception desk to register them.</p><button class="btn primary" onclick="startShift()">Start shift (Day ${s.day})</button>`}
      <h4>Progress</h4><ul class="plain">${goals.map(g => `<li>${g[0]}</li>`).join("")}</ul>
      <p><b>Level ${s.level}</b> — ${LEVELS.find(l => l.level === s.level).unlock}<br>${nxt ? `Next: Lv ${nxt.level} at ${nxt.xp} XP → ${nxt.unlock}` : "Max level reached"}</p>
    </div><div><h4>Achievements (${s.achievements.length}/${ACHIEVEMENTS.length})</h4><div class="achlist">${ach}</div></div></div>`, { wide: true });
}
function startShift() { G.s.shiftActive = true; G.s.clockMin = 9 * 60; G.spawnTimer = 3; G.shopTimer = 20; Sound.success(); toast("🌞 Shift started — the clinic is open!", "good"); closePanel(); updateHUD(); save(); }
function endShift() {
  const active = G.patients.filter(p => p.status !== "done");
  active.forEach(p => { World.removeNPC(p.npc); p.status = "done"; });
  G.patients = G.patients.filter(p => p.status !== "done");
  G.s.shiftActive = false; G.s.shiftsDone++; G.s.day++;
  const bonus = 40 + G.s.level * 10; G.s.money += bonus;
  if (G.s.shiftsDone >= 3) award("shifts3");
  addXP(30);
  setBody(`<h3>🌙 Shift complete</h3><p>Day ${G.s.day - 1} is done. ${active.length ? `${active.length} patient(s) were rescheduled.` : "Every patient was treated."}</p><p>Overheads covered, end-of-day bonus: <b>+${bonus} JD</b>, +30 XP.</p><div class="btnrow"><button class="btn primary" onclick="closePanel()">Close</button></div>`);
  updateHUD(); save();
}

/* ---------------- RECEPTION ---------------- */
function uiDesk() {
  const d = patientAt("ready_discharge"); if (d) return uiDischarge(d);
  const p = patientAt("at_desk");
  if (!p) { const w = G.patients.filter(x => x.status === "waiting"); return openPanel("🛎️ Reception", `<p>${G.s.shiftActive ? "No one is at the desk right now." : "The clinic is closed — open a shift at the shift board by the entrance."}</p>${w.length ? `<p>${w.length} patient(s) in the waiting room. Walk to them and press <kbd>E</kbd> to call them into the exam room.</p>` : ""}`); }
  const sp = SPECIES[p.species];
  openPanel(`🛎️ Registration — ${p.ownerName} & ${p.name}`, `
    <div class="cols"><div>
      <p class="muted">${p.regular ? "Regular client — file found. Confirm details." : "New patient — create a file."}</p>
      <label>Patient name <input id="fName" value="${p.name}"></label>
      <label>Species <input value="${sp.emoji} ${sp.label} — ${p.breed}" disabled></label>
      <label>Age <input id="fAge" value="${p.age}"></label>
      <label>Sex <input id="fSex" value="${p.sex}"></label>
      <label>Weight (kg) <input id="fWeight" type="number" step="0.01" value="${p.weight}"></label>
      <label>Vaccination status <select id="fVax"><option>Up to date</option><option>Overdue</option><option>Unknown</option></select></label>
    </div><div>
      <h4>Owner says</h4><p class="quote">“${p.caseDef.complaint}”</p>
      <label>Presenting complaint (your words)<textarea id="fComplaint" rows="3">${p.caseDef.complaint}</textarea></label>
      <label>Triage <select id="fTriage"><option>Routine</option><option>Urgent — see soon</option><option>Emergency — see now</option></select></label>
      <p class="muted">Good reception notes: who, what, since when, eating/drinking/toileting, medications, allergies.</p>
    </div></div>
    <div class="btnrow"><button class="btn primary" onclick="finishIntake(${p.id})">Register → waiting room</button></div>`, { wide: true });
}
function finishIntake(id) {
  const p = G.patients.find(x => x.id === id); if (!p) return;
  p.name = $("#fName").value.trim() || p.name; p.age = $("#fAge").value; p.sex = $("#fSex").value; p.weight = parseFloat($("#fWeight").value) || p.weight;
  p.intake = { vax: $("#fVax").value, complaint: $("#fComplaint").value, triage: $("#fTriage").value };
  p.record.push(`${clockStr()} — Registered. ${p.sex}, ${p.age}, ${p.weight} kg. Vaccination: ${p.intake.vax}. Triage: ${p.intake.triage}. Complaint: ${p.intake.complaint}`);
  award("first_patient"); addXP(10, "patient registered"); Sound.click();
  const idx = G.patients.filter(x => x.status === "waiting").length; walkNPC(p, PATH.deskToWait(idx), "waiting", () => { Sound.pet(p.species); });
  closePanel(); reflowQueue();
}
function reflowQueue() { const q = G.patients.filter(x => ["arriving", "at_desk"].includes(x.status)); const spots = [[0, -6.3], [1.1, -7.3], [-1.1, -7.3]]; q.forEach((p, i) => { const sp = spots[Math.min(i, 2)]; if (p.status === "at_desk") { p.status = "arriving"; p.npc.path = [sp]; p.npc.onArrive = () => { p.status = "at_desk"; updateHUD(); }; } else if (p.npc.path.length) { p.npc.path[p.npc.path.length - 1] = sp; } }); updateHUD(); }

/* waiting pets are interactables too */
function waitingInteractables() { return G.patients.filter(p => p.status === "waiting").map(p => ({ id: "pet" + p.id, pos: { x: p.npc.rig.group.position.x, z: p.npc.rig.group.position.z }, r: 1.4, label: () => `Call ${p.name} into the exam room`, action: () => { if (patientAt("exam_ready") || patientAt("to_exam")) return toast("The exam room is occupied.", "warn"); Sound.click(); walkNPC(p, PATH.waitToExam, "to_exam", () => { World.placePet(p.npc, 11, 1.0, -5.5, Math.PI / 2); p.npc.rig.group.position.set(11.9, 0, -4.6); p.npc.rig.group.rotation.y = -Math.PI / 2; p.status = "exam_ready"; Sound.pet(p.species); toast(`${p.name} is on the exam table.`, "info"); }); } }));
}

/* ---------------- EXAM ---------------- */
function genVitals(p) {
  const v = SPECIES[p.species].vitals; const sick = p.caseDef.outcome !== "checkup";
  const inR = (r, bias = 0) => +(rnd(r[0], r[1]) + bias).toFixed(r[1] > 50 ? 0 : 1);
  const vit = { temp: inR(v.temp, sick && p.caseDef.id === "vomit_dog" ? 0.4 : 0), hr: inR(v.hr, sick ? (v.hr[1] - v.hr[0]) * 0.2 : 0), rr: inR(v.rr, sick ? 4 : 0), crt: sick && p.caseDef.id === "vomit_dog" ? "2.5 s (prolonged)" : "< 2 s", mm: sick && p.caseDef.id === "vomit_dog" ? "pale pink, tacky" : v.mm };
  if (p.caseDef.id === "vomit_dog") { vit.temp = 39.4; vit.hr = 130; vit.rr = 28; }
  return vit;
}
function vitalClass(val, r) { return val < r[0] ? "low" : val > r[1] ? "high" : "ok"; }
function uiExam() {
  const p = patientAt("exam_ready"); if (!p) return openPanel("🩺 Exam room", "<p>No patient on the table. Call one from the waiting room.</p>");
  if (!p.vitals) p.vitals = genVitals(p);
  if (!p.fightChecked) { p.fightChecked = true; if (Math.random() < 0.45 || p.species === "bird") return uiFightBack(p, () => uiExam()); }
  renderExam(p);
}
function renderExam(p) {
  const sp = SPECIES[p.species], v = sp.vitals, done = p.examDone, allDone = EXAM_STEPS.every(s => done[s.id]);
  const steps = EXAM_STEPS.map(s => `<div class="step ${done[s.id] ? "done" : ""}" onclick="examStep(${p.id},'${s.id}')"><span class="chk">${done[s.id] ? "✓" : ""}</span><div><b>${s.label}</b>${done[s.id] ? `<div class="tip">${s.tip}${s.id === "tpr" ? vitalsHTML(p) : ""}${s.id === "history" ? `<div class='tip'>Owner: “${p.caseDef.complaint}”</div>` : ""}${s.id === "bcs" ? `<div class='tip'>${BCS[p.caseDef.id === "bird_well" ? 1 : 2]}</div>` : ""}</div>` : ""}</div></div>`).join("");
  openPanel(`🩺 Physical exam — ${sp.emoji} ${p.name} (${p.breed}, ${p.age}, ${p.weight} kg)`, `
    <div class="cols"><div><h4>Work through the exam in order</h4>${steps}</div>
    <div><h4>Findings</h4>${allDone ? `<p>${p.caseDef.findings}</p><h4>Your assessment & plan</h4>${p.caseDef.options.map((o, i) => `<button class="btn opt" onclick="diagnose(${p.id},${i})">${o}</button>`).join("")}` : `<p class="muted">Complete every exam step to reveal the findings. Click a step to perform it and read what it checks.</p>`}
    <h4>Normal ranges — ${sp.label}</h4><table class="ref small"><tr><td>Temp</td><td>${v.temp[0]}–${v.temp[1]} °C</td></tr><tr><td>Heart rate</td><td>${v.hr[0]}–${v.hr[1]} bpm</td></tr><tr><td>Resp. rate</td><td>${v.rr[0]}–${v.rr[1]} /min</td></tr><tr><td>CRT</td><td>${v.crt}</td></tr></table><p class="muted">${sp.vitalsNote}</p></div></div>`, { wide: true });
}
function vitalsHTML(p) { const v = SPECIES[p.species].vitals, t = p.vitals; return `<div class="vitals"><span class="${vitalClass(t.temp, v.temp)}">T ${t.temp} °C</span><span class="${vitalClass(t.hr, v.hr)}">HR ${t.hr}</span><span class="${vitalClass(t.rr, v.rr)}">RR ${t.rr}</span><span>CRT ${t.crt}</span><span>MM ${t.mm}</span></div>`; }
function examStep(id, step) { const p = G.patients.find(x => x.id === id); if (!p) return; if (p.examDone[step]) return; p.examDone[step] = true; Sound.click(); if (step === "tpr") Sound.beep(); if (step === "ausc") setTimeout(() => Sound.beep(), 200); renderExam(p); }
function diagnose(id, i) {
  const p = G.patients.find(x => x.id === id); const c = p.caseDef; const ok = i === c.correct;
  p.record.push(`${clockStr()} — Exam: ${c.findings} TPR ${p.vitals.temp} °C / ${p.vitals.hr} / ${p.vitals.rr}. Plan chosen: "${c.options[i]}" (${ok ? "correct" : "incorrect, corrected"}).`);
  if (ok) { G.s.correctDx++; addXP(30, "correct assessment"); if (G.s.correctDx >= 5) award("diagnose5"); Sound.success(); } else { p.mistakes++; Sound.error(); addXP(5); }
  const next = c.outcome === "checkup" ? "Finish visit → discharge at reception" : c.xray ? "Send to X-ray suite" : "Admit for surgery → prep room";
  setBody(`<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Correct." : "Not quite."}</b> ${c.why}</div><p><b>Plan:</b> ${c.options[c.correct]}</p>${c.outcome === "checkup" ? `<p>Fee: ${c.fee} JD. ${p.name} can go back to reception with ${p.ownerName}.</p>` : c.xray ? `<p>Radiographs are needed. ${p.ownerName} will carry ${p.name} to the X-ray suite — meet them there.</p>` : `<p>${p.name} is admitted. ${p.ownerName} signs the consent form and waits outside; ${p.name} goes to the prep room table. You'll need to run the pre-op checklist, then scrub in.</p>`}<div class="btnrow"><button class="btn primary" onclick="afterExam(${p.id})">${next}</button></div>`);
}
function afterExam(id) {
  const p = G.patients.find(x => x.id === id); const c = p.caseDef; closePanel();
  if (c.outcome === "checkup") { p.fee = c.fee; walkNPC(p, PATH.examToDesk, "to_desk", () => { p.status = "ready_discharge"; Sound.bell(); }); }
  else if (c.xray) { if (G.s.level < 2) { toast("X-ray suite unlocks at level 2 — refer this patient out for now.", "warn", 4000); p.fee = 20; walkNPC(p, PATH.examToDesk, "to_desk", () => { p.status = "ready_discharge"; }); return; } walkNPC(p, PATH.examToXray, "to_xray", () => { World.placePet(p.npc, 10.5, 0.95, 6, Math.PI / 2); p.npc.rig.group.position.set(12.5, 0, 7.2); p.status = "xray_ready"; toast(`${p.name} is positioned on the X-ray table.`, "info"); }); }
  else admitForSurgery(p, PATH.examToPrep);
}
function admitForSurgery(p, path) {
  const proc = PROCEDURES[p.caseDef.procedure];
  if (G.s.level < proc.level) { toast(`${proc.name} unlocks at level ${proc.level}. Referred to a specialist for now.`, "warn", 4500); p.fee = 40; walkNPC(p, path === PATH.examToPrep ? PATH.examToDesk : PATH.xrayToDesk, "to_desk", () => { p.status = "ready_discharge"; }); return; }
  walkNPC(p, path, "to_prep", () => { World.placePet(p.npc, -4.6, 0.95, 5.3, Math.PI / 2); p.status = "preop"; p.record.push(`${clockStr()} — Admitted for ${proc.name}. Consent signed by ${p.ownerName}.`); toast(`${p.name} is on the prep table. ${p.ownerName} is waiting outside.`, "info"); p.npc.path = PATH.prepOut.slice(); p.npc.onArrive = () => { p.npc.rig.group.visible = false; }; updateHUD(); });
}

/* ---------------- FIGHT BACK ---------------- */
function uiFightBack(p, next) {
  const sp = SPECIES[p.species]; Sound.petAngry(p.species); p.npc.petMood = "angry";
  const line = { dog: `${p.name} stiffens, lifts a lip and growls as you reach for the leg.`, cat: `${p.name} flattens the ears, hisses and swats at your hand!`, bird: `${p.name} flaps wildly and lunges with an open beak when the carrier opens.` }[p.species];
  const opts = sp.handling.slice().sort(() => Math.random() - 0.5);
  openPanel(`⚠️ ${p.name} is fighting back!`, `<p class="big">${line}</p><p>How do you restrain safely?</p>${opts.map(o => `<button class="btn opt" data-h="${o}">${o}</button>`).join("")}`, { noClose: true });
  document.querySelectorAll("#panelBody .opt").forEach(b => b.onclick = () => {
    const ok = b.dataset.h === sp.bestHandling;
    if (ok) { Sound.success(); addXP(20, "safe handling"); if (p.species === "cat") award("catwhisperer"); if (p.species === "bird") award("birdnerd"); p.npc.petMood = "calm"; p.record.push(`${clockStr()} — Patient fractious; restrained with: ${sp.bestHandling}.`); }
    else { Sound.error(); p.mistakes++; G.s.money -= 5; p.record.push(`${clockStr()} — Handling error (${b.dataset.h}); staff scratched, corrected to ${sp.bestHandling}.`); }
    setBody(`<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Good call." : (p.species === "bird" ? "Dangerous!" : "Ouch — you got scratched (−5 JD for the first-aid kit).")}</b> ${sp.handlingWhy}</div><div class="btnrow"><button class="btn primary" id="fbNext">Continue</button></div>`);
    $("#fbNext").onclick = () => { p.npc.petMood = "calm"; next(); };
  });
}

/* ---------------- X-RAY ---------------- */
function uiXray() {
  const p = patientAt("xray_ready"); if (!p) return openPanel("🩻 X-ray table", "<p>No patient here. Radiographs are ordered from the exam room.</p>");
  openPanel(`🩻 Radiography — ${p.name}`, `<ol><li><b>Radiation safety:</b> lead apron, thyroid shield, gloves; only essential staff in the room; dosimeter badge on.</li><li><b>Sedation/analgesia</b> so a painful patient lies still — never wrestle a fracture.</li><li><b>Two orthogonal views</b> (lateral + craniocaudal / ventrodorsal), include the joint above and below.</li><li><b>Exposure</b> set by thickness (kVp/mAs chart); collimate to the area of interest.</li></ol><div class="btnrow"><button class="btn primary" onclick="takeXray(${p.id})">📸 Expose</button></div>`);
}
function takeXray(id) {
  const p = G.patients.find(x => x.id === id); Sound.beep(); setTimeout(() => Sound.click(), 300);
  const xr = p.caseDef.xray || { view: p.species, finding: null, label: "No abnormality detected" }; p.xray = xr;
  p.record.push(`${clockStr()} — Radiographs taken. Finding: ${xr.label}.`); award("xray1"); addXP(25, "radiograph taken");
  showXrayPanel(p, xr, true);
}
function showXrayPanel(p, xr, decide) {
  const sp = SPECIES[xr.view];
  const nextBtn = !decide ? "" : (p.caseDef.outcome === "surgery" ? `<button class="btn primary" onclick="closePanel();admitForSurgery(G.patients.find(x=>x.id===${p.id}),PATH.xrayToPrep)">Admit for surgery → prep room</button>` : `<button class="btn primary" onclick="xrayDischarge(${p.id})">Treat conservatively & discharge</button>`);
  openPanel(`🩻 Radiograph — ${sp.label}: ${p.name}`, `<div class="xrwrap"><div id="xrHolder">${skeletonSVG(xr.view, xr.finding, 560, 414)}</div><div><h4>Report</h4><p><b>${xr.label}</b></p><p class="muted">Hover (or tap) any bone to see its name. Dogs and cats: 7 cervical, 13 thoracic, 7 lumbar vertebrae, 13 pairs of ribs. Birds: fused flight skeleton with a deep keel.</p>${xr.finding && xr.finding.startsWith("fracture") ? "<p>Fracture description: location (which bone, which third), type (transverse / oblique / spiral / comminuted), open or closed, displacement. Stabilise with a splint or bandage and plan fixation (external coaptation vs internal fixation) based on patient size and fracture type.</p>" : ""}${xr.finding === "foreign_body" ? "<p>Radio-opaque gastric foreign body with gas distension. Plan: IV fluids, electrolytes, then exploratory laparotomy & gastrotomy.</p>" : ""}<div class="btnrow">${nextBtn}</div></div></div>`, { wide: true });
  wireXrayHover($("#xrHolder"), $("#boneLabel"));
}
function xrayDischarge(id) { const p = G.patients.find(x => x.id === id); p.fee = p.caseDef.fee; p.record.push(`${clockStr()} — Conservative management: analgesia + external coaptation (bandage/splint), recheck radiographs in 2–3 weeks.`); closePanel(); walkNPC(p, PATH.xrayToDesk, "to_desk", () => { p.status = "ready_discharge"; Sound.bell(); }); }
function uiViewer() { const last = G.patients.slice().reverse().find(p => p.xray) || null; if (last) return showXrayPanel(last, last.xray, false); openPanel("🩻 Viewer — anatomy atlas", `<p class="muted">No radiograph yet. Here is the atlas — hover any bone.</p><div class="xrgrid">${["dog", "cat", "bird"].map(s => `<div><h4>${SPECIES[s].label}</h4>${skeletonSVG(s, null, 330, 244)}</div>`).join("")}</div>`, { wide: true }); wireXrayHover($("#panelBody"), $("#boneLabel")); }

/* ---------------- PRE-OP ---------------- */
const PREOP_QUIZ = {
  fasting: { dog: ["4–6 hours food, water until premed", "24 hours food and water", "No fasting needed"], cat: ["4–6 hours food, water until premed", "24 hours food and water", "No fasting needed"], bird: ["1–3 hours at most, confirm the crop is empty", "12 hours like a dog", "24 hours"], correct: 0 },
  induce: { dog: ["Cuffed tube, inflate just enough to seal", "Uncuffed tube", "No tube — mask only for surgery"], cat: ["Cuffed tube, lidocaine on larynx, gentle — never over-inflate", "Force the tube quickly before laryngospasm", "Never intubate cats"], bird: ["UNCUFFED tube (complete tracheal rings) or face mask", "Cuffed tube like a dog", "Inflate the cuff fully to prevent leaks"], correct: 0 },
  scrub: { all: ["Chlorhexidine alternating with alcohol, target pattern from incision outward, ≥ 2–5 min", "Quick wipe with water", "Scrub from the edges inward toward the incision"], correct: 0 }
};
function uiPreop() {
  const p = patientAt("preop"); if (!p) return openPanel("🧾 Prep table", "<p>No surgical patient on the prep table.</p>");
  if (!p.preopDone) p.preopDone = [];
  renderPreop(p);
}
function renderPreop(p) {
  const idx = p.preopDone.length; const proc = PROCEDURES[p.caseDef.procedure];
  const list = PREOP_STEPS.map((s, i) => `<div class="step ${i < idx ? "done" : i === idx ? "cur" : "lock"}" ${i === idx ? `onclick="preopStep(${p.id})"` : ""}><span class="chk">${i < idx ? "✓" : i + 1}</span><div><b>${s.label}</b>${i < idx ? `<div class="tip">${typeof s.why === "function" ? s.why(p.species) : s.why}</div>` : ""}</div></div>`).join("");
  openPanel(`🧾 Pre-operative checklist — ${p.name} → ${proc.name}`, `<p class="muted">${proc.intro} Work top to bottom; each step must be done in order (an anaesthesia–surgery checklist is recommended by AAHA to prevent critical oversights).</p>${list}${idx >= PREOP_STEPS.length ? `<div class="goodbox"><b>Patient ready.</b> Transfer ${p.name} to the OR table. Now YOU need to get ready: locker → scrubs, cap & mask; sink → hand scrub, gown & gloves.</div><div class="btnrow"><button class="btn primary" onclick="toOR(${p.id})">Transfer to operating table</button></div>` : ""}`, { wide: true });
}
function preopStep(id) {
  const p = G.patients.find(x => x.id === id); const i = p.preopDone.length; const s = PREOP_STEPS[i]; if (!s) return;
  const quiz = PREOP_QUIZ[s.id];
  const finish = () => { p.preopDone.push(s.id); Sound.click(); if (s.id === "clip") Sound.clipper(); if (s.id === "scrub") Sound.water(); if (s.id === "monitor") Sound.beep(); renderPreop(p); };
  if (s.id === "iv" && !p.ivFight && Math.random() < 0.4 && p.species !== "bird") { p.ivFight = true; return uiFightBack(p, () => { finish(); }); }
  if (!quiz) return finish();
  const opts = (quiz[p.species] || quiz.all); const order = opts.map((o, k) => k).sort(() => Math.random() - 0.5);
  setBody(`<h4>${s.label}</h4><p class="big">${s.id === "fasting" ? `How long should a ${SPECIES[p.species].label.toLowerCase()} be fasted?` : s.id === "induce" ? `Which airway for a ${SPECIES[p.species].label.toLowerCase()}?` : "How do you prepare the surgical site?"}</p>${order.map(k => `<button class="btn opt" data-k="${k}">${opts[k]}</button>`).join("")}`);
  document.querySelectorAll("#panelBody .opt").forEach(b => b.onclick = () => { const ok = +b.dataset.k === quiz.correct; if (ok) { Sound.success(); addXP(15, "correct protocol"); } else { Sound.error(); p.mistakes++; } p.record.push(`${clockStr()} — Pre-op: ${s.label} (${ok ? "correct" : "corrected"}).`); setBody(`<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Correct." : "Not quite."}</b> ${typeof s.why === "function" ? s.why(p.species) : s.why}</div><div class="btnrow"><button class="btn primary" id="pq">Continue</button></div>`); $("#pq").onclick = finish; });
}
function toOR(id) { const p = G.patients.find(x => x.id === id); World.placePet(p.npc, 2, 1.0, 6, Math.PI / 2); p.status = "ready_or"; p.record.push(`${clockStr()} — Anaesthetised, intubated, monitored; transferred to theatre.`); closePanel(); toast(`${p.name} is on the operating table under anaesthesia. Scrub in!`, "info", 4000); updateHUD(); }

/* ---------------- LOCKER & SINK ---------------- */
function uiLocker() {
  const o = G.s.outfit;
  openPanel("🚪 Locker", `<p>Current outfit: <b>${{ clinic: "white coat over scrubs (clinic wear)", scrubs: "clean scrubs, cap, mask, shoe covers", surgical: "sterile gown & gloves over scrubs" }[o]}</b></p>
    <p class="muted">Theatre rule: no street/clinic clothes beyond the red line. Cap and mask go on <i>before</i> the hand scrub, never after.</p>
    <div class="btnrow">${o !== "scrubs" ? `<button class="btn primary" onclick="setOutfit('scrubs')">Change into scrubs + cap + mask + shoe covers</button>` : ""}${o !== "clinic" ? `<button class="btn" onclick="setOutfit('clinic')">Back to white coat (leave theatre)</button>` : ""}</div>`);
}
function setOutfit(o) { G.s.outfit = o; G.s.handScrubbed = false; World.setOutfit(o); Sound.click(); toast(o === "scrubs" ? "🧢 Scrubs, cap, mask and shoe covers on." : o === "clinic" ? "👔 Back in the white coat." : "🧤 Sterile — keep your hands above your waist!", "good"); updateHUD(); closePanel(); save(); }
function uiSink() {
  if (G.s.outfit === "clinic") return openPanel("🚰 Scrub sink", `<div class="badbox"><b>Stop.</b> You're still in your white coat. Change into scrubs, cap and mask at the locker first — the cap and mask must be on before you scrub, because touching them afterwards contaminates your hands.</div>`);
  if (G.s.outfit === "surgical") return openPanel("🚰 Scrub sink", `<p>You are already scrubbed, gowned and gloved. Keep your hands above waist level and don't touch anything non-sterile. If you do, you must re-glove.</p>`);
  G.scrubIdx = 4; renderScrub();
}
function renderScrub() {
  const i = G.scrubIdx; const html = SCRUB_STEPS.map((s, k) => `<div class="step ${k < i ? "done" : k === i ? "cur" : "lock"}"><span class="chk">${k < i ? "✓" : k + 1}</span><div><b>${s.label}</b><div class="tip">${s.why}</div></div></div>`).join("");
  const act = i >= SCRUB_STEPS.length ? `<div class="goodbox"><b>Sterile.</b> You are gowned and gloved. Walk to the OR table to begin.</div><div class="btnrow"><button class="btn primary" onclick="setOutfit('surgical');award('scrubbed')">Enter theatre</button></div>`
    : i === 4 ? `<p>Hold the button to scrub — hands above elbows, fingertips first, all four sides of each finger, then forearms. Minimum 2 minutes (shown here as a short timer).</p><button class="btn primary hold" id="scrubBtn">Hold to scrub 🧼</button><div class="bar"><div id="scrubFill"></div></div>`
    : `<div class="btnrow"><button class="btn primary" onclick="scrubNext()">${["", "", "", "", "", "Dry hands with sterile towel", "Put on sterile gown", "Closed gloving"][i]}</button></div>`;
  openPanel("🚰 Surgical hand scrub", html + act, { wide: true });
  if (i === 4) {
    const btn = $("#scrubBtn"); let prog = 0, timer = null;
    const start = (e) => { e.preventDefault(); Sound.water(); timer = setInterval(() => { prog += 2.2; $("#scrubFill").style.width = Math.min(100, prog) + "%"; if (prog % 20 < 2.2) Sound.water(); if (prog >= 100) { clearInterval(timer); timer = null; scrubNext(); } }, 60); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; if (prog < 100) { prog = 0; $("#scrubFill").style.width = "0%"; toast("Scrub interrupted — start again (the count restarts if you stop).", "warn"); } } };
    btn.addEventListener("mousedown", start); btn.addEventListener("touchstart", start, { passive: false }); btn.addEventListener("mouseup", stop); btn.addEventListener("mouseleave", stop); btn.addEventListener("touchend", stop);
  }
}
function scrubNext() { G.scrubIdx++; Sound.click(); renderScrub(); }

/* ---------------- SURGERY ---------------- */
function uiSurgery() {
  const p = patientAt("ready_or"); if (!p) return openPanel("🔪 Operating table", "<p>No anaesthetised patient on the table. Surgical patients come from the prep room after the pre-op checklist.</p>");
  if (G.s.outfit !== "surgical") return openPanel("🔪 Operating table", `<div class="badbox"><b>You are not sterile.</b> ${G.s.outfit === "clinic" ? "You're in your white coat — go to the locker, then the sink." : "You have scrubs, cap and mask, but no sterile gown and gloves. Complete the hand scrub at the sink."}</div>`);
  const proc = PROCEDURES[p.caseDef.procedure];
  p.surg = { step: 0, mistakes: 0, events: 0, vit: { hr: p.species === "bird" ? 320 : p.species === "cat" ? 150 : 95, spo2: 98, etco2: 40, map: 78, temp: p.species === "bird" ? 40.5 : 38.2 } };
  openPanel(`🔪 ${proc.name} — ${p.name}`, `<p class="big">${proc.intro}</p><p><b>Time-out:</b> confirm patient identity (${p.name}, ${p.breed}, ${p.weight} kg), procedure (${proc.name}), side/site, allergies, antibiotics given, instrument & swab count done. Estimated duration ${proc.duration}.</p><p class="muted">For each step pick the correct instrument. Watch the monitor — anaesthetic events will interrupt you.</p><div class="btnrow"><button class="btn primary" onclick="renderSurgery(${p.id})">Begin — "Scalpel, please."</button></div>`, { wide: true, noClose: true });
}
function monitorHTML(v, sp) { const r = SPECIES[sp].vitals; return `<div class="monitor"><div><small>HR</small><b class="${v.hr < r.hr[0] * 0.7 || v.hr > r.hr[1] * 1.15 ? "bad" : ""}">${Math.round(v.hr)}</b></div><div><small>SpO₂</small><b class="${v.spo2 < 95 ? "bad" : ""}">${Math.round(v.spo2)}%</b></div><div><small>ETCO₂</small><b class="${v.etco2 < 35 || v.etco2 > 45 ? "bad" : ""}">${Math.round(v.etco2)}</b></div><div><small>MAP</small><b class="${v.map < 60 ? "bad" : ""}">${Math.round(v.map)}</b></div><div><small>Temp</small><b class="${v.temp < 37 ? "bad" : ""}">${v.temp.toFixed(1)}°</b></div><div class="ecg"><svg viewBox="0 0 120 30"><path d="M0 15 L20 15 L25 5 L30 25 L35 15 L60 15 L65 5 L70 25 L75 15 L100 15 L105 5 L110 25 L115 15 L120 15" fill="none" stroke="#7ef29a" stroke-width="2"/></svg></div></div>`; }
function renderSurgery(id) {
  const p = G.patients.find(x => x.id === id); const proc = PROCEDURES[p.caseDef.procedure]; const S = p.surg; const st = proc.steps[S.step];
  if (!st) return finishSurgery(p);
  // anaesthetic event between steps
  if (S.step > 0 && S.events < (proc.steps.length > 7 ? 2 : 1) && Math.random() < 0.4 && !S.pendingEvent) { S.pendingEvent = true; S.events++; return anesEvent(p); }
  S.pendingEvent = false;
  const choices = st.choices.slice().sort(() => Math.random() - 0.5);
  openPanel(`🔪 ${proc.name} — step ${S.step + 1}/${proc.steps.length}`, `${monitorHTML(S.vit, p.species)}<div class="surgstep"><p class="big">${st.text}</p><p class="muted">Which instrument?</p><div class="tools">${choices.map(c => `<button class="tool" data-t="${c}">${toolSVG(c, 150, 60)}<span>${TOOLS[c].short}</span></button>`).join("")}</div></div>`, { wide: true, noClose: true });
  document.querySelectorAll("#panelBody .tool").forEach(b => b.onclick = () => {
    const ok = b.dataset.t === st.tool; const chosen = TOOLS[b.dataset.t], right = TOOLS[st.tool];
    if (ok) { Sound.success(); addXP(12); S.vit.hr += rnd(-3, 3); } else { Sound.error(); S.mistakes++; p.mistakes++; S.vit.hr += rnd(5, 15); S.vit.map -= rnd(2, 6); }
    p.record.push(`${clockStr()} — Step ${S.step + 1}: ${st.text} → ${chosen.short}${ok ? "" : " (incorrect; " + right.short + " used)"}`);
    setBody(`${monitorHTML(S.vit, p.species)}<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Correct — " + right.name + "." : "Wrong instrument. You asked for " + chosen.short + "; the right one is the " + right.name + "."}</b> ${st.why}</div><div class="toolinfo">${toolSVG(st.tool, 150, 60)}<p class="muted">${right.desc}</p></div><div class="btnrow"><button class="btn primary" id="sn">Next step</button></div>`);
    $("#sn").onclick = () => { S.step++; S.vit.temp -= 0.08; S.vit.etco2 += rnd(-1.5, 1.5); renderSurgery(p.id); };
  });
}
function anesEvent(p) {
  const S = p.surg; const ev = pick(ANES_EVENTS); Sound.alarm();
  if (ev.text.includes("SpO")) S.vit.spo2 = 89; if (ev.text.includes("arterial")) S.vit.map = 52; if (ev.text.includes("temperature")) S.vit.temp = 36.2; if (ev.text.includes("Heart rate")) S.vit.hr *= 1.4; if (ev.text.includes("ETCO")) S.vit.etco2 = 58;
  const order = [0, 1, 2].sort(() => Math.random() - 0.5);
  setBody(`${monitorHTML(S.vit, p.species)}<div class="alarmbox"><b>⚠️ Anaesthetist calls out:</b> ${ev.text}</div><p>What do you do?</p>${order.map(k => `<button class="btn opt" data-k="${k}">${ev.options[k]}</button>`).join("")}`);
  document.querySelectorAll("#panelBody .opt").forEach(b => b.onclick = () => {
    const ok = +b.dataset.k === 0; if (ok) { Sound.success(); addXP(20, "anaesthetic event managed"); } else { Sound.error(); S.mistakes++; p.mistakes++; }
    p.record.push(`${clockStr()} — Anaesthetic event: ${ev.text} Response: ${ev.options[+b.dataset.k]} (${ok ? "correct" : "corrected"}).`);
    S.vit = { hr: p.species === "bird" ? 300 : p.species === "cat" ? 145 : 90, spo2: 98, etco2: 40, map: 75, temp: Math.max(S.vit.temp, 37.6) };
    setBody(`${monitorHTML(S.vit, p.species)}<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Stabilised." : "The anaesthetist corrects you — "}</b> ${ev.why}</div><div class="btnrow"><button class="btn primary" id="ae">Back to surgery</button></div>`);
    $("#ae").onclick = () => renderSurgery(p.id);
  });
}
function finishSurgery(p) {
  const proc = PROCEDURES[p.caseDef.procedure]; const S = p.surg; G.s.surgeries++; award("first_surgery"); if (S.mistakes === 0) award("flawless");
  const xp = 80 + (S.mistakes === 0 ? 40 : 0); addXP(xp, "surgery complete");
  p.record.push(`${clockStr()} — ${proc.name} completed. Instrument errors: ${S.mistakes}. Swab & instrument count correct. Moved to recovery.`);
  World.placePet(p.npc, 4.9, 0.25, 9.8, Math.PI); p.status = "recovery"; p.fee = p.caseDef.fee;
  openPanel("✅ Surgery complete", `<div class="goodbox"><b>${proc.name} done${S.mistakes === 0 ? " — flawless!" : ` with ${S.mistakes} instrument error(s).`}</b> +${xp} XP</div><h4>Recovery</h4><ul>${POSTOP.map(x => `<li>${x}</li>`).join("")}</ul><p>${p.name} is in the recovery kennel. Remove your gown and gloves (they are now contaminated) before leaving theatre, and check on ${p.name} at the kennel to discharge.</p><div class="btnrow"><button class="btn primary" onclick="closePanel();setOutfit('scrubs')">De-gown & de-glove</button></div>`, { noClose: true });
  updateHUD(); save();
}
function uiRecovery() {
  const p = patientAt("recovery"); if (!p) return openPanel("🛏️ Recovery kennel", "<p>Empty. Post-op patients recover here on a warm pad until they can stand.</p>");
  openPanel(`🛏️ Recovery — ${p.name}`, `<p>${p.name} swallowed and was extubated, is now sternal, temperature ${p.species === "bird" ? "40.8" : "37.9"} °C, pain score low after analgesia. Incision clean and dry.</p><h4>Discharge instructions for ${p.ownerName}</h4><ul><li>E-collar on at all times for 10–14 days.</li><li>Lead walks only; no running, stairs or jumping.</li><li>Check the incision twice daily: slight redness is normal; swelling, discharge, gaping or licking is not — call us.</li><li>Pain relief as prescribed; small bland meal tonight.</li><li>Recheck / suture removal in 10–14 days.</li></ul><div class="btnrow"><button class="btn primary" onclick="dischargeFromRecovery(${p.id})">Call ${p.ownerName} to collect ${p.name}</button></div>`);
}
function dischargeFromRecovery(id) {
  const p = G.patients.find(x => x.id === id); closePanel(); Sound.pet(p.species);
  p.npc.rig.group.visible = true; p.npc.rig.group.position.set(0, 0, -14.5); World.placePet(p.npc, 0.6, 0, -14.5); p.npc.petFollow = true; if (p.npc.pet.parts.cage) p.npc.pet.parts.cage.visible = p.species === "bird";
  p.record.push(`${clockStr()} — Recovered; discharged with E-collar, analgesia and written instructions.`);
  walkNPC(p, PATH.entryToDesk, "to_desk", () => { p.status = "ready_discharge"; Sound.bell(); toast(`${p.ownerName} is at reception to collect ${p.name}.`, "info"); });
}
function uiDischarge(p) {
  const fee = p.fee || p.caseDef.fee; const items = SHOP_ITEMS.filter(i => (p.caseDef.outcome === "surgery" ? ["ecollar", "deworm"] : ["deworm", "flea", "toothbrush", "food_" + p.species, "seed", "cuttle"]).includes(i.id)).slice(0, 3);
  openPanel(`💳 Discharge — ${p.name}`, `<p>Summary for ${p.ownerName}: ${p.record[p.record.length - 1].split("— ")[1]}</p><p><b>Invoice:</b> ${fee} JD${p.mistakes ? ` <span class="muted">(${p.mistakes} correction(s) recorded in the file — no charge to the client)</span>` : ""}</p><h4>Recommend take-home items</h4><div class="shopgrid">${items.map(i => `<label class="shopitem"><input type="checkbox" value="${i.id}" ${G.s.stock[i.id] > 0 ? "" : "disabled"}><span class="ic">${i.icon}</span><div><b>${i.name}</b> — ${i.price} JD<br><span class="muted">${i.info}</span></div></label>`).join("")}</div><div class="btnrow"><button class="btn primary" onclick="finishDischarge(${p.id},${fee})">Take payment & say goodbye</button></div>`, { wide: true });
}
function finishDischarge(id, fee) {
  const p = G.patients.find(x => x.id === id); let total = fee; let sold = 0;
  document.querySelectorAll("#panelBody input[type=checkbox]:checked").forEach(c => { const it = SHOP_ITEMS.find(i => i.id === c.value); if (it && G.s.stock[it.id] > 0) { total += it.price; G.s.stock[it.id]--; sold++; } });
  G.s.itemsSold += sold; if (G.s.itemsSold >= 10) award("shop10");
  earn(total); G.s.patientsSeen++; if (G.s.patientsSeen >= 10) award("bell10"); addXP(20, "patient discharged");
  p.record.push(`${clockStr()} — Paid ${total} JD. Case closed.`);
  G.s.cases.push({ id: p.id, name: p.name, ownerName: p.ownerName, species: p.species, breed: p.breed, age: p.age, sex: p.sex, weight: p.weight, complaint: p.caseDef.complaint, procedure: p.caseDef.procedure ? PROCEDURES[p.caseDef.procedure].name : (p.caseDef.outcome === "xray" ? "Radiography" : "Wellness / medical"), record: p.record.slice(), mistakes: p.mistakes, day: G.s.day, xray: p.xray || null });
  closePanel(); Sound.pet(p.species);
  walkNPC(p, PATH.leave, "leaving", () => { World.removeNPC(p.npc); p.status = "done"; G.patients = G.patients.filter(x => x.status !== "done"); updateHUD(); });
  toast(`💳 +${total} JD — ${p.ownerName} and ${p.name} say thank you!`, "good"); save();
}

/* ---------------- SHOP ---------------- */
function uiShop() {
  const cust = G.shopCustomer;
  const grid = SHOP_ITEMS.map(i => `<div class="shopitem"><span class="ic">${i.icon}</span><div><b>${i.name}</b> — ${i.price} JD · stock ${G.s.stock[i.id]}<br><span class="muted">${i.info}</span><div class="btnrow tight">${cust && cust.wants === i.id ? `<button class="btn primary small" onclick="sellItem('${i.id}')">Sell to ${cust.name}</button>` : ""}<button class="btn small" onclick="restock('${i.id}')">Restock ×5 (${i.cost * 5} JD)</button></div></div></div>`).join("");
  openPanel("🛍️ Clinic shop", `${cust ? `<div class="goodbox">🧍 <b>${cust.name}</b> asks: “${cust.line}”</div>` : `<p class="muted">No shop customer at the moment — they drop by during shifts. Pet owners also buy items at discharge.</p>`}<div class="shopgrid">${grid}</div>`, { wide: true });
}
function sellItem(id) { const it = SHOP_ITEMS.find(i => i.id === id); if (G.s.stock[id] <= 0) return toast("Out of stock — restock first.", "warn"); G.s.stock[id]--; G.s.itemsSold++; earn(it.price); addXP(8, "sale"); if (G.s.itemsSold >= 10) award("shop10"); toast(`Sold ${it.name}. Tip given: ${it.info}`, "good", 4000); G.shopCustomer = null; uiShop(); }
function restock(id) { const it = SHOP_ITEMS.find(i => i.id === id); const c = it.cost * 5; if (G.s.money < c) return toast("Not enough money.", "warn"); G.s.money -= c; G.s.stock[id] += 5; Sound.click(); updateHUD(); uiShop(); save(); }
const SHOP_LINES = { flea: "My cat keeps scratching — do you have something for fleas? Is the dog one okay?", food_dog: "My retriever is getting chubby, what food do you recommend?", seed: "My budgie only eats seeds, is that fine?", toothbrush: "The vet said my dog's teeth need brushing — what do I use?", ecollar: "My cat chews her stitches, what can I do?", shampoo: "My dog has itchy skin, can I use my own shampoo?", cuttle: "What does my cockatiel need for calcium?", deworm: "How often should I deworm my puppy?", carrier: "My cat hates the carrier, any tips?", food_cat: "Can my cat live on dog food?" };
function spawnShopCustomer() { const it = pick(SHOP_ITEMS); G.shopCustomer = { name: pick(OWNER_NAMES), wants: it.id, line: SHOP_LINES[it.id] || `Do you sell ${it.name.toLowerCase()}?` }; Sound.bell(); toast(`🛍️ A customer is at the shop counter asking about ${it.name.toLowerCase()}.`, "info", 4000); }

/* ---------------- OFFICE ---------------- */
function uiOffice() {
  const t = G.s.theme; const sw = (key, cols) => cols.map(c => `<span class="swatch ${t[key] === c ? "sel" : ""}" style="background:${c}" onclick="setTheme('${key}','${c}')"></span>`).join("");
  openPanel("🏢 Office — customise your clinic", `<div class="cols"><div>
    <label>Clinic name <input id="cName" value="${G.s.clinicName}" maxlength="28"></label><button class="btn primary" onclick="renameClinic()">Rename (updates the sign)</button>
    <h4>Walls</h4><div class="swatches">${sw("wall", ["#2a2f4a", "#1f2235", "#2b2b3f", "#33264a", "#1e2a3a", "#3a3f55"])}</div>
    <h4>Accent (desks, chairs)</h4><div class="swatches">${sw("accent", ["#f2c14e", "#7c6fcf", "#5f8fd6", "#e07a5f", "#4fb3a9", "#b4557a"])}</div>
    <h4>Trim (shelves, cabinets)</h4><div class="swatches">${sw("trim", ["#4b4f7a", "#5a3e8f", "#3f6f6a", "#6e4b36", "#444a66", "#2f4f8f"])}</div>
    <h4>Floors (all rooms)</h4><div class="swatches">${sw("floor", ["#3b3f5c", "#2f3550", "#2e4a44", "#4a3d33", "#332f4e", "#2b2b3f"])}</div>
    <h4>Dr. Ahmad's coat</h4><div class="swatches">${sw("coat", ["#e9e9f2", "#cfd8ff", "#f2c14e", "#9ea4c4", "#4fb3a9", "#2a2f4a"])}</div>
    <label class="row"><input type="checkbox" id="cDecor" ${t.decor !== false ? "checked" : ""} onchange="setTheme('decor',this.checked)"> Plants & posters</label>
  </div><div><h4>Clinic statistics</h4><ul class="plain"><li>Day ${G.s.day} · Level ${G.s.level} · ${G.s.xp} XP</li><li>Balance: ${fmtMoney(G.s.money)}</li><li>Patients seen: ${G.s.patientsSeen}</li><li>Correct diagnoses: ${G.s.correctDx}</li><li>Surgeries: ${G.s.surgeries}</li><li>Items sold: ${G.s.itemsSold}</li><li>Case files: ${G.s.cases.length}</li></ul>
    <h4>Dr. Ahmad</h4><p class="muted">Veterinarian, DVM. Curly black hair, glasses, never without his stethoscope. Founded ${G.s.clinicName} to treat dogs, cats and birds with the same care.</p>
    <div class="btnrow"><button class="btn warn small" onclick="resetGame()">Reset all progress</button></div></div></div>`, { wide: true });
}
function setTheme(k, v) { G.s.theme[k] = v; award("decorator"); applyTheme(); Sound.click(); uiOffice(); save(); }
function applyTheme() { const t = G.s.theme; World.applyTheme({ wall: parseInt(t.wall.slice(1), 16), accent: parseInt(t.accent.slice(1), 16), trim: parseInt(t.trim.slice(1), 16), floor: t.floor ? parseInt(t.floor.slice(1), 16) : null, coat: parseInt(t.coat.slice(1), 16), decor: t.decor !== false }); document.documentElement.style.setProperty("--accent", t.accent); document.documentElement.style.setProperty("--trim", t.trim); document.documentElement.style.setProperty("--onaccent", luma(t.accent) > 0.5 ? "#1b1a12" : "#ffffff"); }
function luma(hex) { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
function renameClinic() { const n = $("#cName").value.trim(); if (!n) return; G.s.clinicName = n; World.setSign(n); award("decorator"); updateHUD(); toast(`Sign updated: ${n}`, "good"); save(); }
function resetGame() { if (!G.confirmReset) { G.confirmReset = true; return toast("Click again to confirm the full reset.", "warn"); } try { localStorage.removeItem(SAVE_KEY); } catch (e) { } location.reload(); }

/* ---------------- CASE FILES / PDF ---------------- */
function uiCases() {
  const cs = G.s.cases.slice().reverse();
  openPanel("🗂️ Case files", `${cs.length ? `<p class="muted">Select a case to view and print it as a PDF (use your browser's "Save as PDF" in the print dialog).</p><div class="caselist">${cs.map(c => `<button class="btn case" onclick="viewCase(${c.id})">${SPECIES[c.species].emoji} <b>${c.name}</b> — ${c.procedure} · Day ${c.day}${c.mistakes ? ` · ${c.mistakes} correction(s)` : " · ✓"}</button>`).join("")}</div>` : "<p>No closed cases yet. Files are created when a patient is discharged at reception.</p>"}`, { wide: true });
}
function caseHTML(c) { return `<div class="casefile"><div class="chead"><div><h2>${G.s.clinicName}</h2><p>Dr. Ahmad, DVM · Clinical record</p></div><div class="right"><p>Case #${String(c.id).padStart(4, "0")}</p><p>Day ${c.day}</p></div></div><table class="ref"><tr><th>Patient</th><td>${c.name}</td><th>Species / breed</th><td>${SPECIES[c.species].label} — ${c.breed}</td></tr><tr><th>Owner</th><td>${c.ownerName}</td><th>Age / sex</th><td>${c.age} / ${c.sex}</td></tr><tr><th>Weight</th><td>${c.weight} kg</td><th>Procedure</th><td>${c.procedure}</td></tr></table><h3>Presenting complaint</h3><p>${c.complaint}</p><h3>Clinical notes</h3><ol class="notes">${c.record.map(r => `<li>${r}</li>`).join("")}</ol>${c.xray ? `<h3>Imaging</h3><p>${c.xray.label}</p>${skeletonSVG(c.xray.view, c.xray.finding, 420, 310)}` : ""}<p class="sig">Signed: Dr. Ahmad ____________________</p></div>`; }
function viewCase(id) {
  const c = G.s.cases.find(x => x.id === id); if (!c) return;
  openPanel(`🗂️ Case #${String(c.id).padStart(4, "0")} — ${c.name}`, `${caseHTML(c)}<div class="btnrow"><button class="btn primary" onclick="printCase(${id})">🖨️ Print / Save as PDF</button><button class="btn" onclick="copyCase(${id})">Copy as text</button><button class="btn" onclick="uiCases()">Back</button></div>`, { wide: true });
}
function printCase(id) {
  const c = G.s.cases.find(x => x.id === id); $("#printArea").innerHTML = caseHTML(c);
  try { const r = window.print(); setTimeout(() => { }, 0); toast("If no print dialog appeared, this preview blocks printing — open the downloaded game file locally to print PDFs, or use “Copy as text”.", "info", 6000); } catch (e) { toast("Printing is blocked in this preview. Open the downloaded game file locally to print PDFs, or use “Copy as text”.", "warn", 6000); }
}
function copyCase(id) { const c = G.s.cases.find(x => x.id === id); const txt = `${G.s.clinicName} — Case #${c.id}\nPatient: ${c.name} (${SPECIES[c.species].label}, ${c.breed}, ${c.age}, ${c.sex}, ${c.weight} kg)\nOwner: ${c.ownerName}\nProcedure: ${c.procedure}\nComplaint: ${c.complaint}\n\n${c.record.join("\n")}`; try { navigator.clipboard.writeText(txt).then(() => toast("Case copied to clipboard.", "good")).catch(() => fallbackCopy(txt)); } catch (e) { fallbackCopy(txt); } }
function fallbackCopy(txt) { setBody(`<p>Select and copy:</p><textarea rows="16" style="width:100%">${txt}</textarea><div class="btnrow"><button class="btn" onclick="uiCases()">Back</button></div>`); }

/* ---------------- LIBRARY ---------------- */
function uiLibrary() { openPanel("📚 Library & references", `<p class="muted">Dr. Ahmad's shelf. Read five to earn <b>Bookworm</b>.</p><div class="books">${REFERENCES.map(r => `<button class="btn book ${G.s.refsRead.includes(r.id) ? "read" : ""}" onclick="uiReference('${r.id}')"><span class="ic">${r.icon}</span>${r.title}</button>`).join("")}</div>`, { wide: true }); }
function uiReference(id) { const r = REFERENCES.find(x => x.id === id); if (!r) return; if (!G.s.refsRead.includes(id)) { G.s.refsRead.push(id); addXP(10, "reference read"); if (G.s.refsRead.length >= 5) award("bookworm"); save(); } openPanel(`${r.icon} ${r.title}`, r.body() + `<div class="btnrow"><button class="btn" onclick="uiLibrary()">Back to shelf</button></div>`, { wide: true }); if (id === "anatomy") wireXrayHover($("#panelBody"), $("#boneLabel")); }

/* ---------------- TUTORIAL / HELP ---------------- */
function uiHelp() {
  openPanel("🐾 Welcome to Batman Clinic", `<div class="cols"><div><h4>Controls</h4><ul class="plain"><li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> — walk (hold <kbd>Shift</kbd> to hurry)</li><li><kbd>E</kbd> / <kbd>Space</kbd> or click the prompt — interact</li><li><kbd>Esc</kbd> — close a panel · <kbd>H</kbd> — this help · <kbd>M</kbd> — mute</li><li>Mouse wheel — zoom</li></ul>
    <h4>You are Dr. Ahmad</h4><p>Curly hair, glasses, and a clinic to run. Pets arrive with their owners when a shift is open. A bell rings at the door.</p></div>
    <div><h4>The patient pathway</h4><ol><li><b>Shift board</b> (by the entrance) → start shift.</li><li><b>Reception desk</b> → register the patient (new or regular).</li><li><b>Waiting room</b> → walk to the pet and call it in.</li><li><b>Exam room</b> → full physical exam, assessment & plan.</li><li><b>X-ray suite</b> → hover the bones to learn anatomy.</li><li><b>Prep room</b> → pre-operative checklist on the patient.</li><li><b>Locker → Sink</b> → scrubs, cap, mask; hand scrub, gown, gloves.</li><li><b>Operating room</b> → the door stops anyone not dressed for theatre.</li><li><b>Recovery → Reception</b> → discharge, invoice, take-home advice.</li></ol><p>Also: the <b>shop</b>, the <b>office</b> (customise colours & name, print case PDFs) and the <b>library</b>.</p></div></div><div class="btnrow"><button class="btn primary" onclick="closePanel()">Start the day</button></div>`, { wide: true });
}

/* ---------------- main loop ---------------- */
function nearestInteractable(pos) {
  let best = null, bd = 1e9; for (const it of INTERACT.concat(waitingInteractables())) { const d = Math.hypot(it.pos.x - pos.x, it.pos.z - pos.z); if (d < it.r && d < bd) { bd = d; best = it; } } return best;
}
function gate(pos) {
  if (World.roomAt(pos.x, pos.z) === "or" && G.s.outfit === "clinic") {
    if (performance.now() - G.gateToast > 2500) { G.gateToast = performance.now(); Sound.error(); toast("🚫 <b>Sterile zone.</b> Change into scrubs, cap and mask at the locker in the prep room before entering theatre.", "warn", 3500); award("blocked"); }
    return true;
  }
  return false;
}
function tick() {
  requestAnimationFrame(tick);
  const res = World.update(G.input, { frozen: G.panelOpen, gate });
  const dt = res.dt; const pos = res.pos;
  if (res.moving) { G.stepT = (G.stepT || 0) + dt; if (G.stepT > 0.32) { G.stepT = 0; Sound.step(); } }
  // room label
  const room = World.roomAt(pos.x, pos.z); if (room !== G.lastRoom) { G.lastRoom = room; $("#hudRoom").textContent = room ? (ROOMS[room] ? ROOMS[room].name : "Outside") : ""; }
  // clock & spawns
  if (G.s.shiftActive && !G.panelOpen) {
    G.s.clockMin += dt * 1.0; updateClockOnly();
    const inClinic = G.patients.filter(p => p.status !== "done").length; const waiting = G.patients.filter(p => ["arriving", "at_desk", "waiting"].includes(p.status)).length;
    G.spawnTimer -= dt; if (G.spawnTimer <= 0) { G.spawnTimer = rnd(40, 70); if (inClinic < 4 && waiting < 3 && G.s.clockMin < 17 * 60) spawnPatient(); }
    G.shopTimer -= dt; if (G.shopTimer <= 0) { G.shopTimer = rnd(60, 110); if (!G.shopCustomer) spawnShopCustomer(); }
    if (G.s.clockMin >= 18 * 60 && !G.closingWarned) { G.closingWarned = true; toast("🌙 It's 18:00 — finish up and end the shift at the shift board.", "info", 5000); }
  }
  // interaction prompt
  const it = G.panelOpen ? null : nearestInteractable(pos); G.nearest = it;
  const pr = $("#prompt"); if (it) { pr.classList.add("show"); pr.querySelector("span").textContent = it.label(); World.setRing(it.pos); } else { pr.classList.remove("show"); World.setRing(null); }
}
function updateClockOnly() { const h = Math.floor(G.s.clockMin / 60), m = Math.floor(G.s.clockMin % 60); $("#hudClock").textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }
function interact() { if (G.panelOpen || !G.nearest) return; Sound.init(); G.nearest.action(); }

function bindInput() {
  const map = { KeyW: "up", ArrowUp: "up", KeyS: "down", ArrowDown: "down", KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right" };
  const recompute = () => { G.input.x = (G.keys.right ? 1 : 0) - (G.keys.left ? 1 : 0); G.input.z = (G.keys.down ? 1 : 0) - (G.keys.up ? 1 : 0); };
  addEventListener("keydown", (e) => { Sound.init(); if (e.target.matches("input,textarea,select")) return; if (map[e.code]) { G.keys[map[e.code]] = true; recompute(); e.preventDefault(); } if (e.code === "ShiftLeft" || e.code === "ShiftRight") G.input.run = true; if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter") { e.preventDefault(); interact(); } if (e.code === "Escape") { if (G.panelOpen && $("#panelClose").style.display !== "none") closePanel(); } if (e.code === "KeyH") { if (!G.panelOpen) uiHelp(); } if (e.code === "KeyM") { const m = Sound.toggleMute(); toast(m ? "🔇 Muted" : "🔊 Sound on", "info", 1200); } });
  addEventListener("keyup", (e) => { if (map[e.code]) { G.keys[map[e.code]] = false; recompute(); } if (e.code === "ShiftLeft" || e.code === "ShiftRight") G.input.run = false; });
  addEventListener("blur", () => { G.keys = {}; recompute(); G.input.run = false; });
  $("#prompt").onclick = interact; $("#panelClose").onclick = closePanel; $("#helpBtn").onclick = () => { if (!G.panelOpen) uiHelp(); }; $("#muteBtn").onclick = () => { const m = Sound.toggleMute(); $("#muteBtn").textContent = m ? "🔇" : "🔊"; };
  // touch d-pad
  const pad = $("#dpad"); if (pad) { pad.querySelectorAll("button").forEach(b => { const d = b.dataset.d; const on = (e) => { e.preventDefault(); Sound.init(); if (d === "act") return interact(); G.keys[d] = true; recompute(); }; const off = (e) => { e.preventDefault(); G.keys[d] = false; recompute(); }; b.addEventListener("touchstart", on, { passive: false }); b.addEventListener("touchend", off); b.addEventListener("mousedown", on); b.addEventListener("mouseup", off); b.addEventListener("mouseleave", off); }); }
  const act = $("#actBtn"); if (act) { const go = (e) => { e.preventDefault(); Sound.init(); interact(); }; act.addEventListener("touchstart", go, { passive: false }); act.addEventListener("mousedown", go); }
  G.touch = matchMedia("(pointer:coarse)").matches || "ontouchstart" in window;
  if (G.touch) { if (pad) pad.classList.add("show"); if (act) act.classList.add("show"); $("#prompt kbd").textContent = "👆"; }
  // unlock audio on first touch and stop the page from scrolling/zooming behind the game
  addEventListener("touchstart", () => Sound.init(), { once: true, passive: true });
  $("#c").addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  let lastTouch = 0; addEventListener("touchend", (e) => { const now = Date.now(); if (now - lastTouch < 320 && !e.target.closest("#panel")) e.preventDefault(); lastTouch = now; }, { passive: false });
}

function boot() {
  G.s = load();
  if (typeof THREE === "undefined") { $("#loading").innerHTML = "<h2>Could not load the 3D engine</h2><p>Three.js did not load (offline or blocked). Check your connection and reload.</p>"; return; }
  World.init($("#c")); applyTheme(); World.setSign(G.s.clinicName); World.setOutfit("clinic");
  bindInput(); updateHUD(); $("#loading").classList.add("hidden");
  G.hoverLabel = $("#boneLabel");
  if (!G.s.seenTutorial) { G.s.seenTutorial = true; save(); uiHelp(); }
  tick();
}
window.addEventListener("DOMContentLoaded", boot);
