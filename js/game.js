/* ============================================================
   GAME CORE v2 — state, HUD, patient flow, exam, imaging, surgery
   (systems.js adds staff/economy/events/story/pharmacy/lab/dental/etc.)
   ============================================================ */
const SAVE_KEY = "batman-clinic-save-v2";
const $ = (s) => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmtMoney = (n) => `${Math.round(n)} JD`;
const T = (s) => (G.s && G.s.settings.lang === "ar" && I18N.ar[s]) || s;
const DR = () => "Dr. " + ((G.s && G.s.doctor && G.s.doctor.name) || "Ahmad");

const G = { gameTime: 0, log: [], s: null, patients: [], input: { x: 0, z: 0, run: false }, input2: { x: 0, z: 0 }, keys: {}, panelOpen: false, nearest: null, spawnTimer: 0, shopTimer: 0, gateToast: 0, lastRoom: null, patientSeq: 1, nurseTimer: 0, catTimer: 20, staffNPCs: {}, rng: null };

/* game clock: advances only while not paused (all gameplay timers read this) */
function gameNow() { return G.gameTime; }
function defaultState() {
  return { v: 2, money: 400, xp: 0, level: 1, day: 1, shiftActive: false, clockMin: 9 * 60, patientsSeen: 0, correctDx: 0, surgeries: 0, itemsSold: 0, refsRead: [], shiftsDone: 0, achievements: [], cases: [], clinicName: "Batman Clinic", outfit: "clinic",
    seenTutorial: false, stock: Object.fromEntries(SHOP_ITEMS.map(i => [i.id, 5])), theme: { v: 2, wall: "#2a2f4a", accent: "#f2c14e", trim: "#4b4f7a", floor: null, coat: "#e9e9f2", decor: true },
    rep: 3.0, hygiene: 90, staff: [], equipment: [], expansions: [], clients: [], goals: { day: 0, list: [] }, dayStats: {}, event: null, story: { seen: [], rival: false, charity: false, accredited: false, referral: false, certified: false, prestige: 0 },
    collections: { bones: [], tools: [], species: [] }, thankCards: 0, settings: { lang: "en", hints: true, difficulty: "vet", lookSens: 1, headBob: true, textSize: 1, camMode: "third", coop: false, oneHand: "left", music: true, weather: "auto", look: "cozy", film: true, lights: "auto" }, avatar: { scrub: "#2f4f8f", cap: "#2f4f8f", frames: "#2d2438" },
    quiz: { boxes: {}, last: {} }, textbook: [], leaderboard: [], weekly: { week: null, best: 0 }, lastBriefing: null, payrollMissed: 0, customNames: [], news: 0, dosesDone: 0, labsDone: 0,
    energy: 100, naps: 0, coffees: 0, atHome: false, doctor: { name: "Ahmad", hairstyle: "curly", beard: "short", hair: "#1b1420", skin: "#9a5f3a", glassesStyle: "round", frames: "#2d2438", shoes: "#23222e", scrub: "#2f4f8f", cap: "#2f4f8f", coat: "#e9e9f2", scrubsOfDay: ["#2f4f8f", "#3f6f6a", "#5a3e8f", "#b4557a", "#4fb3a9", "#23222e", "#8a3350"] },
    clinicPet: { species: "cat", name: "Mishmish", personality: "curious", color: "#3a3a3a", hunger: 40, feeds: 0, bond: 0, missed: 0 } };
}
function save() { try { if (typeof snapshotPatients === "function" && G.restoreDone) G.s.active = snapshotPatients(); localStorage.setItem(SAVE_KEY, JSON.stringify(G.s)); } catch (e) { } }
function load() { try { const r = localStorage.getItem(SAVE_KEY); if (r) { const s = JSON.parse(r); const d = defaultState(); const m = Object.assign(d, s, { shiftActive: !!(s.shiftActive && Array.isArray(s.active) && s.active.length), outfit: "clinic" }); m.settings = Object.assign(d.settings, s.settings || {}); m.story = Object.assign(d.story, s.story || {}); m.doctor = Object.assign(d.doctor, s.doctor || {}); m.clinicPet = Object.assign(d.clinicPet, s.clinicPet || {}); m.collections = Object.assign(d.collections, s.collections || {}); return m; } } catch (e) { } return defaultState(); }

/* ---------------- UI primitives ---------------- */
function toast(msg, kind = "info", ms = 3200) { const t = document.createElement("div"); t.className = "toast " + kind; t.innerHTML = msg; $("#toasts").appendChild(t); requestAnimationFrame(() => t.classList.add("show")); setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, ms); if (kind === "warn") Sound.vibrate(40); }
function openPanel(title, html, opts = {}) { if (window.__joyReset) window.__joyReset(); if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); const pkey = String(title).replace(/<[^>]+>/g, "").replace(/\d+/g, "#").trim(); const keepScroll = G.panelOpen && G.panelKey === pkey ? $("#panelBody").scrollTop : 0; G.panelKey = pkey; closeMenus(); G.panelOpen = true; const p = $("#panel"); p.classList.remove("hidden"); p.classList.toggle("wide", !!opts.wide); p.classList.toggle("side", !!opts.side); document.body.classList.add("panel-open"); $("#panelTitle").innerHTML = title; $("#panelBody").innerHTML = html; $("#panelBody").scrollTop = keepScroll; if (typeof glossify === "function") glossify($("#panelBody")); $("#panelClose").style.display = opts.noClose ? "none" : ""; G.input.x = G.input.z = 0; G.keys = {}; if (G.ho && !G.hoQuiet && typeof hoTabMin === "function") { const needs = $("#panelBody").querySelector(".opt, input, select, #lb, #pq, .btn.primary, .shopitem"); if (needs || !(typeof hoPhone === "function" && hoPhone())) hoTabMin(false); } }
function closePanel() { G.panelOpen = false; World.setPlayerPose(null); $("#panel").classList.add("hidden"); document.body.classList.remove("panel-open"); if (G.onPanelClose) { const f = G.onPanelClose; G.onPanelClose = null; f(); } }
function setBody(html) { $("#panelBody").innerHTML = html; $("#panelBody").scrollTop = 0; }
function hint(text) { return G.s.settings.hints ? `<div class="hintbox">${icon("help", 16)} <b>Mentor:</b> ${text}</div>` : ""; }
function confetti() { if (G.s && G.s.settings && G.s.settings.reduceMotion) return; const c = document.createElement("div"); c.className = "confetti"; for (let i = 0; i < 40; i++) { const s = document.createElement("i"); s.style.left = Math.random() * 100 + "%"; s.style.background = ["#f2c14e", "#7c6fcf", "#5f8fd6", "#e07a5f", "#4fb3a9"][i % 5]; s.style.animationDelay = (Math.random() * 0.6) + "s"; c.appendChild(s); } document.body.appendChild(c); setTimeout(() => c.remove(), 2600); }

/* ---------------- progression ---------------- */
function addXP(n, why) {
  if (G.s.settings.difficulty === "specialist") n = Math.round(n * 0.8);
  G.s.xp += n; if (why) toast(`+${n} XP · ${why}`, "xp", 2200);
  const next = LEVELS.find(l => l.level === G.s.level + 1);
  if (next && G.s.xp >= next.xp) { G.s.level = next.level; Sound.unlock(); confetti(); if (typeof phoneMilestone === "function") phoneMilestone("level", next.level); setTimeout(() => openPanel(`${icon("party", 20)} Level ${next.level} unlocked!`, `<p class="big">New phase: <b>${next.unlock}</b></p><p>${levelHint(next.level)}</p><div class="btnrow"><button class="btn primary" onclick="closePanel()">Let's go</button></div>`), 300); }
  updateHUD(); save();
}
function levelHint(l) { return { 2: "Fractures, emergencies and birds arrive. Take patients to the X-ray Suite and hover the bones. Rabbits appear once you own the Exotics Ward.", 3: "Surgery unlocks: Exam → Prep room checklist → Locker → Sink → Operating Room. Assemble the pack at the autoclave first (or hire a surgical assistant).", 4: "Abdominal surgery: gastrotomy and cystotomy. Longer procedures, more anaesthetic events, a swab count before closing.", 5: "Avian surgery and splenectomy. Referrals start arriving — higher stakes and higher fees.", 6: "Master Surgeon. Sit the board exam in the office to unlock Prestige." }[l] || ""; }
function award(id) { if (G.s.achievements.includes(id)) return; const a = ACHIEVEMENTS.find(x => x.id === id); if (!a) return; G.s.achievements.push(id); Sound.success(); toast(`${icon(a.icon, 18)} Achievement: <b>${a.name}</b> — ${a.desc}`, "ach", 4200); addXP(25); }
function earn(n) { G.s.money += n; Sound.cash(); updateHUD(); }
function difficultyScale() { const base = Math.max(0, Math.min(1, (G.s.day - 1) / 14)); const f = { student: 0.6, vet: 1, specialist: 1.35 }[G.s.settings.difficulty] || 1; return Math.min(1.4, base * f + (f - 1) * 0.3); }
function rep(delta, why) {
  const s = G.s; let d = delta;
  if (d < 0) { const soft = { student: 0.4, vet: 0.7, specialist: 1.1 }[s.settings.difficulty] || 0.7; d = d * soft * (0.5 + 0.5 * Math.min(1, difficultyScale())); s.dayStats.repLoss = (s.dayStats.repLoss || 0) + Math.abs(d); if (s.dayStats.repLoss > 0.6) d = 0; }
  s.rep = Math.max(0, Math.min(5, s.rep + d)); if (why && Math.abs(d) >= 0.05) toast(`${d > 0 ? "▲" : "▼"} Reputation ${d > 0 ? "+" : ""}${d.toFixed(2)} · ${why}`, d > 0 ? "good" : "warn", 2600); updateHUD();
}
function stat(key, n = 1) { G.s.dayStats[key] = (G.s.dayStats[key] || 0) + n; checkGoals(); }

function starsHTML(r) { let h = ""; for (let i = 1; i <= 5; i++) h += `<span class="star ${r >= i ? "on" : r >= i - 0.5 ? "half" : ""}">${icon("star", 14)}</span>`; return h; }
function updateHUD() {
  const s = G.s; $("#hudName").textContent = s.clinicName; $("#hudDay").textContent = `${T("Day")} ${s.day}`;
  updateClockOnly(); $("#hudShift").textContent = s.shiftActive ? (s.closing ? "◐ Closing" : "● Open") : "○ Closed"; $("#hudShift").className = s.shiftActive && !s.closing ? "on" : "off";
  $("#hudMoney").textContent = fmtMoney(s.money); $("#hudLevel").textContent = `Lv ${s.level}${s.story.prestige ? " ★" + s.story.prestige : ""}`;
  const cur = LEVELS.find(l => l.level === s.level), nxt = LEVELS.find(l => l.level === s.level + 1); const pct = nxt ? Math.min(100, (s.xp - cur.xp) / (nxt.xp - cur.xp) * 100) : 100; $("#xpFill").style.width = pct + "%"; $("#hudXP").textContent = nxt ? `${s.xp} / ${nxt.xp} XP` : `${s.xp} XP · MAX`;
  $("#hudRep").innerHTML = starsHTML(s.rep) + ` <span class="repnum">${s.rep.toFixed(1)}</span>`;
  const en = Math.round(s.energy); $("#energyFill").style.width = en + "%"; $("#energyFill").className = en < 25 ? "low" : en < 45 ? "mid" : ""; $("#energyTxt").textContent = `${en}%`;
  const cp = s.clinicPet; $("#petHud").innerHTML = `${icon(cp.species, 14)} ${cp.name} · ${cp.hunger > 75 ? "<b class='bad'>hungry!</b>" : cp.hunger > 45 ? "peckish" : "fed"}`;
  $("#hudOutfit").innerHTML = { clinic: icon("coat", 16) + " White coat", scrubs: icon("cap", 16) + " Scrubs + cap + mask", surgical: icon("glove", 16) + " Sterile gown + gloves" }[s.outfit];
  const list = G.patients.filter(p => p.status !== "done").map(p => `<li class="${p.emergency ? "emerg" : ""}"><span>${SPECIES[p.species].emoji} <b>${p.name}</b>${p.emergency && p.emergencyLeft > 0 ? ` <em>${Math.ceil(p.emergencyLeft)}s</em>` : ""}</span><span class="st ${p.status}">${statusLabel(p.status)}</span></li>`).join("");
  $("#board").innerHTML = list || "<li class='muted'>No patients right now</li>";
  if (typeof updateNeeds === "function") updateNeeds();
  const g = s.goals.list || []; $("#goals").innerHTML = g.map(x => `<li class="${x.done ? "done" : ""}">${icon(x.done ? "check" : "tag", 14)} ${x.text}${x.target > 1 ? ` <em>${Math.min(x.progress, x.target)}/${x.target}</em>` : ""}</li>`).join("") || "<li class='muted'>Start a shift to get goals</li>";
  $("#pillDay").textContent = `${T("Day")} ${s.day}`; $("#pillShift").textContent = s.shiftActive ? (s.closing ? "Closing" : "Open") : "Closed"; $("#pillShift").className = "pshift " + (s.shiftActive && !s.closing ? "on" : "off"); $("#pillRep").textContent = `★ ${s.rep.toFixed(1)}`; $("#pillEnergy").style.width = en + "%"; $("#pillEnergy").className = en < 25 ? "low" : en < 45 ? "mid" : "";
  if (!$("#statusSheet").classList.contains("hidden")) renderActivity();
  const ev = s.event ? EVENTS.find(e => e.id === s.event.id) : null; $("#eventBanner").innerHTML = ev ? `${icon(ev.weather === "rain" ? "drop" : "sun", 14)} ${ev.name}` : ""; $("#eventBanner").style.display = ev ? "" : "none";
}
function updateClockOnly() { const h = Math.floor(G.s.clockMin / 60), m = Math.floor(G.s.clockMin % 60); const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; $("#hudClock").textContent = t; $("#pillClock").textContent = t; }
function statusLabel(st) { return { arriving: "arriving", at_desk: "at reception", waiting: "waiting room", to_exam: "to exam", exam_ready: "exam table", to_xray: "to X-ray", xray_ready: "X-ray suite", to_prep: "to prep", preop: "pre-op", ready_or: "OR table", recovery: "recovering", to_desk: "to reception", ready_discharge: "ready to pay", leaving: "leaving", nurse: "with the nurse", to_dental: "to dental", dental_ready: "dental table", to_ward: "to ward", ward_ready: "in the ward", farm: "farm call", rx: "needs prescription" }[st] || st; }
function clockStr() { const h = Math.floor(G.s.clockMin / 60), m = Math.floor(G.s.clockMin % 60); return `Day ${G.s.day} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }

/* ---------------- paths (v2 layout) ---------------- */
const CORR = 0; // corridor z
const PATH = {
  entry: [[-5, -13.5], [-5, -11], [-5, -8.3]],
  deskToWait: (seat) => [[-6.5, -8.5], [seat.x + (seat.rot ? 0.9 : 0), seat.z + (seat.rot ? 0 : 0.9)]],
  waitToExam: [[-6, -7.5], [-5, -3.2], [-5, CORR], [6.5, CORR], [6.5, -3.2], [6.5, -5.4]],
  examToXray: [[6.5, -3], [6.5, CORR], [13.5, CORR], [13.5, 3], [13.5, 5.1]],
  examToPrep: [[6.5, -3], [6.5, CORR], [0, CORR], [0, 2.8], [0, 4]],
  examToDental: [[6.5, -3], [6.5, CORR], [19.5, CORR], [19.5, -3.2], [19.5, -5.4]],
  examToWard: [[6.5, -3], [6.5, CORR], [19.5, CORR], [19.5, 3], [19.5, 5.1]],
  xrayToPrep: [[13.5, 2.8], [13.5, CORR], [0, CORR], [0, 2.8], [0, 4]],
  xrayToDesk: [[13.5, 2.8], [13.5, CORR], [-5, CORR], [-5, -3.2], [-5, -8.3]],
  examToDesk: [[6.5, -3], [6.5, CORR], [-5, CORR], [-5, -3.2], [-5, -8.3]],
  dentalToDesk: [[19.5, -3], [19.5, CORR], [-5, CORR], [-5, -3.2], [-5, -8.3]],
  wardToDesk: [[19.5, 2.8], [19.5, CORR], [-5, CORR], [-5, -3.2], [-5, -8.3]],
  prepOut: [[0, 2.8], [0, CORR], [-5, CORR], [-5, -3.2], [-5, -11], [-5, -13.5]],
  leave: [[-5, -11], [-5, -13.5]],
  entryToDesk: [[-5, -11], [-5, -8.3]]
};
const QUEUE_SPOTS = [[-5, -8.3], [-5, -9.5], [-5, -10.7], [-5, -11.6]];
const SEATS = [{ x: -11.2, z: -10.5, rot: 0 }, { x: -10.5, z: -10.5, rot: 0 }, { x: -9.8, z: -10.5, rot: 0 }, { x: -12.3, z: -7.3, rot: Math.PI / 2 }, { x: -12.3, z: -6.5, rot: Math.PI / 2 }, { x: -12.3, z: -5.7, rot: Math.PI / 2 }, { x: -8.2, z: -10.5, rot: 0 }, { x: -7.2, z: -10.5, rot: 0 }];
G.seatTaken = {};
function takeSeat(p) { const i = SEATS.findIndex((st, k) => !G.seatTaken[k]); if (i < 0) return null; G.seatTaken[i] = p.id; p.seat = i; return SEATS[i]; }
function freeSeat(p) { if (p.seat !== undefined) { delete G.seatTaken[p.seat]; p.seat = undefined; } if (p.npc) p.npc.rig.sitting = false; }

/* ---------------- patients ---------------- */
function has(eq) { return G.s.equipment.includes(eq); }
function owns(ex) { return G.s.expansions.includes(ex); }
function eligibleCases(opts = {}) {
  const ev = G.s.event ? EVENTS.find(e => e.id === G.s.event.id) : null;
  return CASES.filter(c => {
    if (c.arcOnly) return false; if (c.level > G.s.level) return false; if (c.species === "bird" && G.s.level < 2) return false; if (c.emergency && G.s.day < 3 && !opts.any) return false;
    if (c.needs && !owns(c.needs)) return false; if ((c.species === "rabbit" || c.species === "tortoise") && !owns("ward")) return false;
    if (c.outcome === "dental" && !has("dentalmachine")) return false; if (c.farm) return false; if (c.mystery && !opts.mystery) return false;
    if (["pyometra", "spleen_dog"].includes(c.id) && !has("ultrasound")) return false; if (c.season && (!ev || ev.caseBias !== c.season)) return false;
    if (c.procedure && PROCEDURES[c.procedure].level > G.s.level) return false;
    return true;
  }).flatMap(c => { const w = (ev && ev.caseBias === c.season) ? 4 : 1; return Array(w).fill(c); });
}
function spawnPatient(force) {
  let c = force || pick(eligibleCases()); if (!c) return;
  const sp = SPECIES[c.species];
  // recurring client?
  const known = G.s.clients.filter(k => k.pets.some(pt => pt.species === c.species)); const returning = !force && !c.breed && known.length && Math.random() < 0.4 ? pick(known) : null;
  const petRec = returning ? pick(returning.pets.filter(pt => pt.species === c.species)) : null;
  const stray = !force && !returning && Math.random() < 0.08 && G.s.level >= 2;
  const p = { arrivedReal: gameNow(), id: G.patientSeq++, caseDef: c, species: c.species, status: "arriving", record: [], mistakes: 0, examDone: {}, vitals: null, intake: null, emergency: !!c.emergency, emergencyLeft: c.emergency ? Math.round(360 - difficultyScale() * 120) : 0, arrivedAt: G.s.clockMin, stray, mystery: !!c.mystery,
    name: petRec ? petRec.name : pick(sp.names.concat(G.s.customNames)), ownerName: stray ? "Good Samaritan" : returning ? returning.ownerName : pick(OWNER_NAMES), breed: petRec ? petRec.breed : pick(sp.breeds), sex: petRec ? petRec.sex : pick(["male", "female"]),
    weight: petRec ? petRec.weight : +(c.species === "bird" ? rnd(sp.weight[0], sp.weight[1]).toFixed(3) : rnd(sp.weight[0], sp.weight[1]).toFixed(1)), personality: returning ? returning.personality : pick(Object.keys(OWNER_TYPES)), client: returning || null, petRec, fear: petRec ? petRec.fear : 0.3 };
  p.age = petRec ? ageLabel(petRec.ageMonths + (G.s.day - petRec.lastDay)) : (c.id.includes("vax_cat") ? "10 weeks" : c.id === "spay_dog" ? "7 months" : c.id === "parvo_pup" ? "12 weeks" : c.id === "spleen_dog" || c.id === "pyometra" ? `${Math.floor(rnd(8, 12))} years` : `${Math.floor(rnd(1, 9))} years`);
  if (c.id.includes("spay") || c.id === "pyometra") p.sex = "female (intact)"; if (c.id.includes("neuter") || c.id === "stones_dog" || c.id === "blocked_cat") p.sex = "male" + (c.id.includes("neuter") ? " (intact)" : "");
  if (G.s.day >= 3 && Math.random() < 0.35 && c.outcome !== "checkup") p.secondary = pick(["overweight — BCS 7/9, discuss a weight plan", "flea dirt in the coat — needs parasite control", "grade 2 dental calculus — book a dental", "mild otitis in one ear — cytology recommended"]);
  if (Math.random() < 0.3 && !c.lab) p.hidden = { murmur: true };
  if (!petRec) { if (c.weight) p.weight = c.weight; if (c.breed) p.breed = c.breed; } if (c.age) p.age = c.age; if (c.sex) p.sex = c.sex;
  p.rx = c.rx !== undefined ? c.rx : c.outcome === "surgery" ? "meloxicam" : { lac_dog: "amoxiclav", limp_cat: "meloxicam", limp_dog: "meloxicam", rabbit_stasis: "metoclop", parvo_pup: "maropitant", blocked_cat: "bupren", tick_dog: "enro", ear_dog: null }[c.id] || null;
  const skinTones = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac], shirts = [0x7c6fcf, 0x5f8fd6, 0xe07a5f, 0xf2c14e, 0x4fb3a9, 0xb4557a, 0x3a3f66], pants = [0x24304f, 0x3a3a4e, 0x5a3e2b];
  const petColors = { dog: [0xd9a066, 0x5b4636, 0xf5e6c8, 0x8c8c8c, 0xe8d5b5], cat: [0xf2a35e, 0x3a3a3a, 0xf7f3ec, 0xa9a9a9, 0xc7b299], bird: [0x7fd1c7, 0xfff3a0, 0x9fd7ff, 0xb7e3a3], rabbit: [0xf7f3ec, 0xc7b299, 0x5b4636, 0x8c8c8c], tortoise: [0x8a9b5a] };
  p.npcCfg = Object.assign({}, returning && returning.cfg ? returning.cfg : (() => { const hs = pick(["curly", "short", "short", "long", "bun", "buzz", "afro"]); return { skin: pick(skinTones), hair: pick([0x1b1420, 0x4a2c1a, 0x8b5a2b, 0xd9b38c, 0x3a2a20]), shirt: pick(shirts), pants: pick(pants), hairstyle: hs, beard: ["short", "buzz", "curly"].includes(hs) && Math.random() < 0.35 ? pick(["stubble", "short", "full"]) : "none", glasses: Math.random() < 0.3, glassesStyle: pick(["round", "square"]), frames: pick([0x2d2438, 0x6e4b36, 0xc8873a]), seed: Math.floor(Math.random() * 1e9) }; })(), { pet: { species: c.species, color: petRec ? petRec.color : pick(petColors[c.species]) } });
  p.npc = World.addNPC(Object.assign({ x: -5, z: -16 }, p.npcCfg)); if (p.npc.pet && World.setPetAppeal) { World.setPetAppeal(p.npc.pet, p.age); try { World.setPetVitals(p.npc.pet, p.vitals || genVitals(p)); } catch (e) { } if (p.emergency) World.setExpression(p.npc.rig, "worried"); } if (typeof hoSymptomsFor === "function" && p.npc.pet) World.setSymptoms(p.npc.pet, hoSymptomsFor(p));
  G.patients.push(p);
  const q = G.patients.filter(x => ["arriving", "at_desk"].includes(x.status)).length - 1; const spot = QUEUE_SPOTS[Math.min(q, 3)];
  p.npc.path = [[-5, -11], [-5, -9.3], spot]; p.npc.speed = p.emergency ? 3.4 : 2.2; p.npc.onArrive = () => { p.status = "at_desk"; updateHUD(); };
  setTimeout(() => { if (!p.restored) Sound.door(); }, 900); setTimeout(() => { if (p.restored) return; Sound.bell(); Sound.vibrate(25); toast(`${icon("bell", 18)} ${p.emergency ? "<b>EMERGENCY</b> — " : ""}${p.ownerName} arrives with ${p.name} the ${p.breed}${returning ? " (regular client)" : stray ? " (stray — no owner)" : " (new patient)"}`, p.emergency ? "warn" : "info", 4000); setTimeout(() => Sound.pet(p.species), 500); }, 1600);
  if (p.emergency && !G.restoring) Sound.alarm();
  p.record.push(`${clockStr()} — Arrived${p.emergency ? " (EMERGENCY)" : ""}. Owner: ${p.ownerName} (${OWNER_TYPES[p.personality].label}). Complaint: ${c.complaint}`); updateHUD();
  return p;
}
function ageLabel(m) { return m < 12 ? `${m} months` : `${Math.floor(m / 12)} years`; }
function walkNPC(p, path, status, onArrive) { p.status = status; p.npc.petFollow = true; p.npc.pet.group.position.y = 0; if (p.npc.pet.parts.cage) p.npc.pet.parts.cage.visible = p.species === "bird"; p.npc.path = path.slice(); p.npc.onArrive = () => { if (onArrive) onArrive(); updateHUD(); }; updateHUD(); }
function reflowQueue() { const q = G.patients.filter(x => ["arriving", "at_desk"].includes(x.status)); q.forEach((p, i) => { const sp = QUEUE_SPOTS[Math.min(i, 3)]; if (p.status === "at_desk") { p.status = "arriving"; p.npc.path = [sp]; p.npc.onArrive = () => { p.status = "at_desk"; updateHUD(); }; } else if (p.npc.path.length) p.npc.path[p.npc.path.length - 1] = sp; }); updateHUD(); }
function patientAt(status) { return G.patients.find(p => p.status === status); }
function feeFor(p) { let f = p.fee || p.caseDef.fee; f *= 0.8 + G.s.rep * 0.08; if (p.referral) f *= 1.5; if (p.stray || p.charity) f = 0; if (p.night) f *= 1.5; return Math.round(f); }

/* ---------------- interactables ---------------- */
const INTERACT = [
  { id: "shiftBoard", pos: { x: -9.5, z: -10.9 }, r: 1.6, label: () => G.s.shiftActive ? "Shift board — goals / end shift" : "Shift board — START SHIFT", action: () => uiShiftBoard() },
  { id: "newsBoard", pos: { x: -1, z: -10.9 }, r: 1.3, label: () => "What's new board", action: () => uiNews() },
  { id: "desk", pos: { x: -5, z: -6.5 }, r: 1.8, label: () => { const d = patientAt("ready_discharge"), p = patientAt("at_desk"); return d ? `Reception — discharge ${d.name}` : p ? `Reception — register ${p.name}` : "Reception desk"; }, action: () => uiDesk(), coop: true },
  { id: "bell", pos: { x: -3.4, z: -6.5 }, r: 0.7, label: () => "Ring the bell", action: () => { Sound.bell(); toast(`${icon("bell", 18)} Ding!`, "info", 1200); }, coop: true },
  { id: "examTable", pos: { x: 6.5, z: -6.1 }, r: 1.7, label: () => { const p = patientAt("exam_ready"); return p ? `Examine ${p.name}` : "Exam table"; }, action: () => uiExam() },
  { id: "staffBoard", pos: { x: 14.5, z: -10.9 }, r: 1.6, label: () => "Staff notice board — hire & manage staff", action: () => uiStaff() },
  { id: "staffTable", pos: { x: 13, z: -8.9 }, r: 1.4, label: () => `Staff room — coffee, nap, radio (energy ${Math.round(G.s.energy)}%)`, action: () => uiBreak() },
  { id: "dentalTable", pos: { x: 19.5, z: -6.1 }, r: 1.7, label: () => { const p = patientAt("dental_ready"); return p ? `Dental procedure — ${p.name}` : "Dental table"; }, action: () => uiDental(), room: "dental" },
  { id: "xrayTable", pos: { x: 13.5, z: 5.5 }, r: 1.6, label: () => { const p = patientAt("xray_ready"); return p ? `Take radiograph of ${p.name}` : "X-ray table"; }, action: () => uiXray() },
  { id: "viewer", pos: { x: 13.5, z: 10.9 }, r: 1.4, label: () => "Radiograph viewer — anatomy atlas", action: () => uiViewer() },
  { id: "prepTable", pos: { x: 0, z: 4.4 }, r: 1.6, label: () => { const p = patientAt("preop"); return p ? `Pre-operative checklist — ${p.name}` : "Prep table"; }, action: () => uiPreop() },
  { id: "autoclave", pos: { x: 1.8, z: 3.2 }, r: 1.1, label: () => "Autoclave — assemble & sterilise the surgical pack", action: () => uiAutoclave() },
  { id: "locker", pos: { x: -1.8, z: 9.5 }, r: 1.4, label: () => "Wardrobe — outfits, appearance & clinic pet", action: () => uiWardrobe() },
  { id: "bowl", pos: { x: 0.6, z: -10.3 }, r: 1.3, label: () => `Feed ${G.s.clinicPet.name}${G.s.clinicPet.hunger > 45 ? " (hungry)" : ""}`, action: () => feedPet() },
  { id: "sink", pos: { x: 0, z: 10.7 }, r: 1.3, label: () => "Scrub sink — hand scrub, gown & gloves", action: () => uiSink() },
  { id: "orTable", pos: { x: 7, z: 7.5 }, r: 1.6, label: () => { const p = patientAt("ready_or"); return p ? `Begin surgery — ${p.name}` : "Operating table"; }, action: () => uiSurgery() },
  { id: "tray", pos: { x: 8.8, z: 5.1 }, r: 1.1, label: () => "Instrument tray — learn the instruments", action: () => uiReference("tools") },
  { id: "anes", pos: { x: 5, z: 7.4 }, r: 1.1, label: () => "Anaesthesia machine — ECG rhythm practice", action: () => uiECGPractice() },
  { id: "kennel", pos: { x: 10, z: 10.4 }, r: 1.4, label: () => { const p = patientAt("recovery"); return p ? `Recovery kennel — ${p.name}` : "Recovery kennel"; }, action: () => uiRecovery() },
  { id: "wardTable", pos: { x: 19.5, z: 5.5 }, r: 1.7, label: () => { const p = patientAt("ward_ready"); return p ? `Treat ${p.name} in the ward` : "Ward exam table"; }, action: () => uiWard(), room: "ward" },
  { id: "counter", pos: { x: -17, z: -3.6 }, r: 1.6, label: () => "Shop counter — sell supplies", action: () => uiShop(), coop: true },
  { id: "pharmacy", pos: { x: -5.5, z: 4.4 }, r: 1.6, label: () => { const n = G.patients.filter(p => p.rx && !p.rxDone && ["ready_discharge", "to_desk", "recovery"].includes(p.status)).length; return n ? `Pharmacy — ${n} prescription(s) to dispense` : "Pharmacy — drugs & dose calculator"; }, action: () => uiPharmacy() },
  { id: "microscope", pos: { x: -12.6, z: 10.6 }, r: 1.2, label: () => "Microscope — cytology", action: () => uiMicroscope() },
  { id: "analyser", pos: { x: -9.6, z: 10.6 }, r: 1.2, label: () => "Blood analyser — read lab panels", action: () => uiLab() },
  { id: "ultrasound", pos: { x: -12.3, z: 5 }, r: 1.3, label: () => has("ultrasound") ? "Ultrasound — scan practice" : "Ultrasound (not purchased — see office)", action: () => uiUltrasound() },
  { id: "labTable", pos: { x: -10.5, z: 4.9 }, r: 1.2, label: () => "Lab table — differential diagnosis board", action: () => uiDDXPractice() },
  { id: "officeDesk", pos: { x: -17.5, z: 8.4 }, r: 1.5, label: () => "Office desk — manage, customise, settings", action: () => uiOffice() },
  { id: "cabinet", pos: { x: -15, z: 10.6 }, r: 1.3, label: () => "Filing cabinet — case files (print PDF)", action: () => uiCases() },
  { id: "printer", pos: { x: -19.5, z: 10.5 }, r: 1.1, label: () => "Printer — print case files", action: () => uiCases() },
  { id: "bookshelf", pos: { x: -19.8, z: 7 }, r: 1.4, label: () => "Bookshelf — references, textbook & quiz", action: () => uiLibrary() },
  { id: "thankWall", pos: { x: -17, z: 10.9 }, r: 1.3, label: () => "Thank-you wall & collections", action: () => uiCollections() },
  { id: "homeDoor", pos: { x: -10, z: -25.2 }, r: 1.7, label: () => G.s.shiftActive ? (G.s.closing && !G.patients.filter(p => p.status !== "done").length ? "Home — finish the day & go in" : "Home — the clinic is still open") : "Home — go in and rest", action: () => { if (!G.s.shiftActive) return goHome(); if (G.s.closing && !G.patients.filter(p => p.status !== "done").length) return endShift(); toast(G.s.closing ? "Patients are still inside the clinic." : "Close the clinic doors first (shift board), then come home.", "warn"); } },
  { id: "mapBoard", pos: { x: 3.5, z: -12.6 }, r: 1.3, label: () => "City map", action: () => uiMap() },
  { id: "parkBench", pos: { x: 12, z: -30.2 }, r: 1.5, label: () => "Garden bench — sit a moment (+energy)", action: () => { award("explorer"); if (G.s.benchDay === G.s.day) return think("Nice out here. Back to work."); G.s.benchDay = G.s.day; energy(12); Sound.chirp(); think("Fresh air. I needed that."); toast("You rest on the bench for a few minutes. Energy +12 %.", "good"); } },
  { id: "busStop", pos: { x: 24, z: -13.2 }, r: 1.5, label: () => "Bus stop — trips (coming soon)", action: () => toast("The bus to the vet school and the shelter is on the roadmap.", "info") },
  { id: "van", pos: { x: 9, z: -18.6 }, r: 2.2, label: () => has("van") ? "Mobile vet van — farm calls" : "Mobile vet van (buy in the office)", action: () => uiVan() }
];
function dynamicInteractables() {
  const list = G.patients.filter(p => p.status === "waiting").map(p => ({ id: "pet" + p.id, pos: { x: p.npc.rig.group.position.x, z: p.npc.rig.group.position.z }, r: 1.4, label: () => `Call ${p.name} into the exam room`, action: () => callToExam(p) }));
  if (typeof walkInteractable === "function") { const w = walkInteractable(); if (w) list.push(w); }
  const cp = World.catPos(); if (cp) list.push({ id: "cat", pos: { x: cp.x, z: cp.z }, r: 1.1, label: () => `Pet ${G.s.clinicPet.name}`, action: () => petClinicPet() });
  return list;
}
function callToExam(p) { if (patientAt("exam_ready") || patientAt("to_exam")) return toast("The exam room is occupied.", "warn"); Sound.click(); freeSeat(p); if (p.npc.pet) p.npc.pet.sleeping = false; const waitedS = (gameNow() - (p.arrivedReal || gameNow())) / 1000; const limit = 240 - difficultyScale() * 90 + (staffLevel("receptionist") === "senior" ? 60 : 0); if (waitedS > limit) { G.s.dayStats.longWait = 1; rep(-0.08, `${p.name} waited too long`); } else if (waitedS < 60) addXP(5, "seen promptly"); walkNPC(p, PATH.waitToExam, "to_exam", () => { World.placePet(p.npc, 6.5, 1.0, -7, Math.PI / 2); p.npc.rig.group.position.set(7.4, 0, -6.1); p.npc.rig.group.rotation.y = -Math.PI / 2; p.status = "exam_ready"; Sound.pet(p.species); nursePrep(p); toast(`${p.name} is on the exam table.`, "info"); }); }
function nursePrep(p) { const nu = G.s.staff.find(s => s.role === "nurse"); if (!nu || patientAt("nurse")) return; if (nu.level === "senior") { p.examDone.tpr = true; p.examDone.bcs = true; p.record.push(`${clockStr()} — ${nu.name} (senior nurse) recorded TPR, weight ${p.weight} kg and body condition before the exam.`); } else { p.record.push(`${clockStr()} — ${nu.name} (junior nurse) weighed ${p.name}.`); if (Math.random() < 0.15) { p.reweigh = +(p.weight * (Math.random() < 0.5 ? 1.35 : 0.7)).toFixed(p.species === "bird" ? 3 : 1); p.record.push(`${clockStr()} — Junior nurse recorded ${p.reweigh} kg — doesn't match the file.`); } } }
function reweigh(id) { const p = G.patients.find(x => x.id === id); if (!p) return; p.reweigh = 0; Sound.beep(); p.record.push(`${clockStr()} — Reweighed by ${DR()}: ${p.weight} kg (nurse's entry corrected).`); addXP(5, "weight checked"); renderExam(p); }

/* ---------------- SHIFT ---------------- */
function uiShiftBoard() {
  const s = G.s; const active = G.patients.filter(p => p.status !== "done").length; const wages = staffWages(); const costs = runningCosts();
  const ach = ACHIEVEMENTS.map(a => `<div class="ach ${s.achievements.includes(a.id) ? "got" : ""}"><span class="icw">${icon(a.icon, 24)}</span><div><b>${a.name}</b><br><span class="muted">${a.desc}</span></div></div>`).join("");
  const nxt = LEVELS.find(l => l.level === s.level + 1); const ev = s.event ? EVENTS.find(e => e.id === s.event.id) : null;
  openPanel(`${icon("clock", 20)} ${T("Shift board")}`, `
    <div class="cols"><div>
      <h4>Shift</h4>${ev ? `<div class="alarmbox"><b>${ev.name}</b> — ${ev.desc}</div>` : ""}
      ${s.shiftActive ? (s.closing ? `<p><b>Doors closed.</b> ${active ? `<b>${active}</b> patient(s) still inside — finish them, then go home.` : "Clinic is empty — time to go home."}</p><p class="muted">End-of-day costs: wages ${wages} JD + rent & utilities ${costs} JD.</p><div class="btnrow">${active ? `<button class="btn warn" onclick="endShift(true)">Reschedule remaining & go home</button><button class="btn" onclick="reopenDoors()">Reopen doors</button>` : `<button class="btn primary" onclick="endShift()">${icon('home', 16)} Finish day & go home</button>`}</div>` : `<p>Shift is open. ${active ? `<b>${active}</b> patient(s) inside.` : "No patients inside."}</p><p class="muted">Closing the doors stops new clients; everyone already inside is still treated.</p><button class="btn warn" onclick="closeDoors()">${icon('door', 16)} Close the doors</button>`)
        : `<p>Open the doors and patients start arriving. Arrival rate depends on your reputation (${s.rep.toFixed(1)} ★) and the week's event.</p><button class="btn primary" onclick="startShift()">${T("Start shift")} (Day ${s.day})</button>${s.weekly.week !== isoWeek() ? `<button class="btn" onclick="startWeekly()">Weekly challenge shift</button>` : `<p class="muted">Weekly challenge done — best ${s.weekly.best} XP.</p>`}`}
      <h4>${T("Daily goals")}</h4><ul class="plain goals">${(s.goals.list || []).map(g => `<li class="${g.done ? "done" : ""}">${icon(g.done ? "check" : "tag", 14)} ${g.text} <em>+${g.reward} JD</em></li>`).join("") || "<li class='muted'>Goals are drawn when the shift starts.</li>"}</ul>
      <p><b>Level ${s.level}</b> — ${(LEVELS.find(l => l.level === s.level) || LEVELS[LEVELS.length - 1]).unlock}<br>${nxt ? `Next: Lv ${nxt.level} at ${nxt.xp} XP → ${nxt.unlock}` : "Max level"}</p>
    </div><div><h4>Achievements (${s.achievements.length}/${ACHIEVEMENTS.length})</h4><div class="achlist">${ach}</div></div></div>`, { wide: true });
}
function startShift(weekly) {
  const s = G.s; s.shiftActive = true; s.closing = false; s.clockMin = 9 * 60; G.spawnTimer = 3; G.shopTimer = 25; G.closingWarned = false; s.dayStats = {}; G.weeklyMode = !!weekly;
  // weekly event
  if (!s.event || s.day - s.event.startDay >= 7) { const ev = pick(EVENTS.filter(e => !s.event || e.id !== s.event.id)); s.event = { id: ev.id, startDay: s.day }; toast(`${icon("tag", 18)} <b>${ev.name}</b> — ${ev.desc}`, "info", 7000); }
  applyWeather();
  // goals
  const pool = GOAL_POOL.filter(g => !g.level || g.level <= s.level); const lifeBag = []; LIFE_TASKS.forEach(t => { for (let k = 0; k < t.weight; k++) lifeBag.push(t); }); const life = pick(lifeBag); s.goals = { day: s.day, list: pool.sort(() => Math.random() - 0.5).slice(0, 3).concat([life]).map(g => ({ ...g, text: fillText(g.text), progress: 0, done: false })) };
  // hygiene decay
  s.hygiene = Math.max(20, s.hygiene - (s.staff.some(x => x.role === "cleaner") ? 0 : 6));
  // story
  const st = STORY.find(x => x.day <= s.day && !s.story.seen.includes(x.id)); if (st) { s.story.seen.push(st.id); storyEffect(st); }
  if (s.settings.music) Sound.music.start("lobby");
  Sound.success(); toast(`${icon("sun", 18)} Shift started — the clinic is open!`, "good"); closePanel(); updateHUD(); save(); if (typeof phoneDaily === "function") phoneDaily(); if (typeof storyDaily === "function") storyDaily(); if (typeof autoBackup === "function") autoBackup(); G.lowStockWarned = {};
  if (weekly) { G.weeklyQueue = seededCases(isoWeek()); toast("Weekly challenge: the same 5 cases for everyone this week. Earn as much XP as you can.", "info", 5000); }
}
function closeDoors() { G.s.closing = true; Sound.door(); toast(`${icon("moon", 18)} Doors closed — no new clients. Finish everyone inside, then go home from the shift board.`, "info", 5000); closePanel(); updateHUD(); save(); }
function reopenDoors() { G.s.closing = false; toast("Doors open again.", "good"); closePanel(); updateHUD(); }
function endShift(force) {
  const s = G.s; const active = G.patients.filter(p => p.status !== "done");
  if (active.length && !force) { toast(`${active.length} patient(s) still inside — finish them, or reschedule them (−reputation).`, "warn", 4000); return; }
  active.forEach(p => { World.removeNPC(p.npc); p.status = "done"; }); G.patients = []; G.shopCustomer = null; G.seatTaken = {};
  const wages = staffWages(), costs = runningCosts(); const goalMoney = s.goals.list.filter(g => g.done).reduce((a, g) => a + g.reward, 0);
  s.money += goalMoney - wages - costs; if (s.money < 0) { s.payrollMissed++; if (s.payrollMissed >= 2 && s.staff.length) { const q = s.staff.pop(); toast(`${q.name} quit — wages unpaid twice.`, "warn", 5000); rep(-0.2, "staff walked out"); rebuildStaffNPCs(); } } else s.payrollMissed = 0;
  if (active.length) rep(-0.08 * active.length, `${active.length} patient(s) rescheduled`);
  if (s.rep >= 4) stat("repHigh"); if (!(s.dayStats.handlingErrors)) stat("handlingErrorsZero"); if (!s.dayStats.longWait) stat("noLongWait"); checkGoals();
  const goalMoney2 = s.goals.list.filter(g => g.done).reduce((a, g) => a + g.reward, 0) - goalMoney; s.money += goalMoney2;
  s.staff.forEach(x => x.days++); s.rep = Math.min(5, s.rep + (s.rep < 3.5 ? 0.04 : 0)); // slow natural recovery
  s.shiftActive = false; s.closing = false; s.shiftsDone++; s.day++; if (s.shiftsDone >= 3) award("shifts3"); addXP(30);
  if (G.weeklyMode) { const xp = s.dayStats.xp || 0; if (xp > s.weekly.best) s.weekly.best = xp; s.weekly.week = isoWeek(); G.weeklyMode = false; }
  Sound.music.stop(); World.setWeather("clear");
  openPanel(`${icon("moon", 20)} Day ${s.day - 1} complete`, `<table class="ref"><tr><td>Patients seen</td><td>${s.dayStats.patients || 0}</td></tr><tr><td>Goals achieved</td><td>${s.goals.list.filter(g => g.done).length}/${s.goals.list.length} (+${goalMoney + goalMoney2} JD)</td></tr><tr><td>Staff wages</td><td>−${wages} JD</td></tr><tr><td>Rent & utilities</td><td>−${costs} JD</td></tr><tr><td>Reputation</td><td>${starsHTML(s.rep)} ${s.rep.toFixed(1)}</td></tr><tr><td>Hygiene</td><td>${s.hygiene}%</td></tr><tr><td>Balance</td><td><b>${fmtMoney(s.money)}</b></td></tr></table>${s.money < 0 ? "<div class='badbox'>Overdrawn. Two unpaid paydays and staff leave.</div>" : ""}<p>Energy ${Math.round(s.energy)}% — ${s.clinicPet.feeds >= 2 ? `${s.clinicPet.name} was fed twice today.` : `<b>${s.clinicPet.name} was fed ${s.clinicPet.feeds} time(s) today.</b>`}</p><div class="btnrow"><button class="btn primary" onclick="goHome()">${icon("home", 16)} Go home & rest</button><button class="btn" onclick="shareCard('day')">${icon("share", 16)} Share day card</button></div>`, { noClose: true });
  if (G.walk) endWalk(false); if (s.clinicPet.walkedDay !== s.day - 1) s.clinicPet.bond = Math.max(0, (s.clinicPet.bond || 0) - 3);
  if (s.clinicPet.feeds < 2) { rep(-0.03 * (2 - s.clinicPet.feeds)); s.clinicPet.missed += 2 - s.clinicPet.feeds; } s.clinicPet.feeds = 0; s.clinicPet.hunger = Math.min(100, s.clinicPet.hunger + 30); s.naps = 0; s.coffees = 0; G.exhausted = false;
  updateHUD(); save();
}
function isoWeek() { const d = new Date(); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return `${t.getUTCFullYear()}-W${Math.ceil(((t - y) / 864e5 + 1) / 7)}`; }
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seededCases(key) { let h = 0; for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const r = mulberry(h); const pool = CASES.filter(c => !c.farm && !c.needs && !c.season && c.level <= 3); const out = []; for (let i = 0; i < 5; i++) out.push(pool[Math.floor(r() * pool.length)]); return out; }

/* ---------------- RECEPTION ---------------- */
function uiDesk() {
  const d = patientAt("ready_discharge"); if (d) return uiDischarge(d);
  const p = patientAt("at_desk");
  if (!p) { const w = G.patients.filter(x => x.status === "waiting"); return openPanel(`${icon("bell", 20)} Reception`, `<p>${G.s.shiftActive ? "No one is at the desk right now." : "The clinic is closed — open a shift at the shift board by the entrance."}</p>${w.length ? `<p>${w.length} patient(s) in the waiting room. Walk to them and press <kbd>E</kbd> to call them in.</p>` : ""}${hint("Hire a receptionist in the staff room and registration happens automatically while you work.")}`); }
  if (!p.greeted && !p.stray) { p.greeted = true; return (typeof bubbleTalk === "function" ? bubbleTalk(p, () => uiDesk()) : uiOwnerTalk(p, () => uiDesk())); }
  const sp = SPECIES[p.species];
  openPanel(`${icon("bell", 20)} Registration — ${p.ownerName} & ${p.name}`, `
    ${p.emergency ? `<div class="alarmbox"><b>Emergency</b> — triage immediately; time left ${Math.ceil(p.emergencyLeft)} s.</div>` : ""}
    <div class="cols"><div>
      <p class="muted">${p.client ? `Regular client — file found (${p.client.pets.length} pet(s), last visit day ${p.petRec.lastDay}). Confirm details.` : p.stray ? "Stray brought in by a passer-by — no owner, no fee. Treat under the shelter agreement." : "New patient — create a file."}</p>
      <label>Patient name <input id="fName" value="${p.name}"></label><label>Species <input value="${sp.label} — ${p.breed}" disabled></label>
      <label>Age <input id="fAge" value="${p.age}"></label><label>Sex <input id="fSex" value="${p.sex}"></label>
      <label>Weight (kg) <input id="fWeight" type="number" step="0.01" inputmode="decimal" value="${p.weight}"></label>
      <label>Vaccination status <select id="fVax"><option>Up to date</option><option>Overdue</option><option>Unknown</option></select></label>
    </div><div>
      <h4>Owner says</h4><p class="quote">“${p.caseDef.complaint}”</p>
      ${p.client ? `<h4>History</h4><ul class="plain small">${p.petRec.history.slice(-3).map(h => `<li>${h}</li>`).join("")}</ul>` : ""}
      <label>Presenting complaint<textarea id="fComplaint" rows="3">${p.caseDef.complaint}</textarea></label>
      <label>Triage <select id="fTriage"><option>Routine</option><option>Urgent — see soon</option><option>Emergency — see now</option></select></label>
      ${hint("Who, what, since when, eating/drinking/toileting, medications, allergies. Emergencies are triaged ahead of the queue.")}
    </div></div>
    <div class="btnrow"><button class="btn primary" onclick="finishIntake(${p.id})">Register → waiting room</button></div>`, { wide: true });
}
function uiOwnerTalk(p, next) {
  const O = OWNER_TYPES[p.personality]; const opts = O.options.map((o, i) => ({ o, i })).sort(() => Math.random() - 0.5);
  openPanel(`${icon("user", 20)} ${p.ownerName} (${O.label})`, `<p class="quote big">${O.intro(p)}</p><p>How do you respond?</p>${opts.map(x => `<button class="btn opt" data-i="${x.i}">${x.o[0]}</button>`).join("")}`, { noClose: true });
  document.querySelectorAll("#panelBody .opt").forEach(b => b.onclick = () => { const o = O.options[+b.dataset.i]; const d = o[1]; if (d > 0) { Sound.success(); rep(0.05, ""); addXP(8); p.compliance = 1; } else { Sound.error(); rep(d * 0.1, "client communication"); p.compliance = 0.6; } setBody(`<div class="${d > 0 ? "goodbox" : "badbox"}"><b>${d > 0 ? "Good." : "That didn't land."}</b> ${O.why}</div><div class="btnrow"><button class="btn primary" id="otNext">Continue</button></div>`); $("#otNext").onclick = next; });
}
function finishIntake(id) {
  const p = G.patients.find(x => x.id === id); if (!p) return;
  p.name = $("#fName").value.trim() || p.name; p.age = $("#fAge").value; p.sex = $("#fSex").value; p.weight = parseFloat($("#fWeight").value) || p.weight;
  p.intake = { vax: $("#fVax").value, complaint: $("#fComplaint").value, triage: $("#fTriage").value };
  if (p.emergency && !p.intake.triage.startsWith("Emergency")) { rep(-0.1, "emergency under-triaged"); p.mistakes++; }
  p.record.push(`${clockStr()} — Registered. ${p.sex}, ${p.age}, ${p.weight} kg. Vaccination: ${p.intake.vax}. Triage: ${p.intake.triage}.`);
  award("first_patient"); addXP(10, "patient registered"); Sound.click(); closePanel();
  if (p.emergency) { callToExam(p); toast("Emergency goes straight to the exam room.", "warn"); reflowQueue(); return; }
  seatPatient(p); reflowQueue();
}
function seatPatient(p) { const seat = takeSeat(p) || { x: -9 + Math.random() * 2, z: -8.6, rot: 0, stand: true }; const stands = seat.stand || Math.random() < 0.2; walkNPC(p, PATH.deskToWait(seat), "waiting", () => { Sound.pet(p.species); const r = p.npc.rig.group; if (!stands) { r.position.set(seat.x, 0, seat.z); r.rotation.y = seat.rot === 0 ? 0 : seat.rot; p.npc.rig.sitting = true; const pr = p.npc.pet.group; const off = seat.rot ? { x: 0.75, z: 0.35 } : { x: 0.4, z: 0.75 }; World.placePet(p.npc, seat.x + off.x, 0, seat.z + off.z, seat.rot === 0 ? Math.PI : -Math.PI / 2); if (p.npc.pet.parts.cage) { p.npc.pet.parts.cage.visible = true; pr.position.y = 0; } p.npc.pet.sleeping = p.species !== "bird" && Math.random() < 0.4; } else { r.rotation.y = Math.PI; } }); }

/* ---------------- EXAM ---------------- */
function genVitals(p) {
  const v = SPECIES[p.species].vitals; const sick = p.caseDef.outcome !== "checkup" || p.emergency;
  const inR = (r, bias = 0) => +(rnd(r[0], r[1]) + bias).toFixed(r[1] > 50 ? 0 : 1);
  const vit = { temp: inR(v.temp, sick ? 0.3 : 0), hr: inR(v.hr, sick ? (v.hr[1] - v.hr[0]) * 0.2 : 0), rr: inR(v.rr, sick ? 4 : 0), crt: "< 2 s", mm: v.mm };
  const o = { vomit_dog: { temp: 39.4, hr: 130, rr: 28, crt: "2.5 s", mm: "pale pink, tacky" }, heat_dog: { temp: 41.6, hr: 170, rr: 80, crt: "< 1 s", mm: "brick red" }, blocked_cat: { temp: 36.8, hr: 120, rr: 30, crt: "2 s", mm: "pale" }, spleen_dog: { temp: 37.9, hr: 160, rr: 36, crt: "3 s", mm: "pale/white" }, pyometra: { temp: 39.9, hr: 140, rr: 32, crt: "2 s", mm: "injected" }, parvo_pup: { temp: 39.8, hr: 160, rr: 36, crt: "2.5 s", mm: "tacky" }, rabbit_stasis: { temp: 38.2, hr: 240, rr: 55, crt: "< 2 s", mm: "pale pink" } }[p.caseDef.id];
  const hv = typeof HO_CLIN !== "undefined" && HO_CLIN[p.caseDef.id] && HO_CLIN[p.caseDef.id].vit; if (hv) Object.assign(vit, hv);
  const out = o ? Object.assign(vit, o) : vit; if (p.npc && p.npc.pet && World.setPetVitals) World.setPetVitals(p.npc.pet, out); return out;
}
function vitalClass(val, r) { return val < r[0] ? "low" : val > r[1] ? "high" : "ok"; }
function uiExam() {
  const p = patientAt("exam_ready"); if (!p) return openPanel(`${icon("steth", 20)} Exam room`, "<p>No patient on the table. Call one from the waiting room.</p>" + hint("A veterinary nurse can run routine checkups here for you."));
  if (!p.vitals) p.vitals = genVitals(p);
  if (!p.cueChecked) { p.cueChecked = true; const chance = 0.1 + p.fear * 0.35 + difficultyScale() * 0.15 + (p.species === "bird" ? 0.2 : 0); if (Math.random() < chance) return uiBehaviourCue(p); }
  renderExam(p);
}
function uiBehaviourCue(p) {
  const cue = { dog: "whale eye, stiff body, a low growl as you reach for the leg", cat: "ears flat, tail thrashing, pupils wide, a hiss", bird: "feathers raised, beak open, lunging at the towel", rabbit: "thumping a hind foot, eyes bulging, trying to bolt", tortoise: "withdrawn tightly into the shell, hissing air" }[p.species];
  p.npc.petMood = "tense"; Sound.petAngry(p.species);
  openPanel(`${icon("warn", 20)} Read the body language`, `<p class="big">${p.name} shows: <b>${cue}</b>.</p><p>What now?</p><button class="btn opt" id="cuePause">Pause, lower your hands, reduce stimulation; prepare the right restraint before continuing</button><button class="btn opt" id="cuePush">Carry on quickly before it gets worse</button>${hint("Animals telegraph a bite or scratch seconds before it happens. Reading the cue and changing the plan is the skill — forcing it is how staff get hurt.")}`, { noClose: true });
  $("#cuePause").onclick = () => { Sound.success(); addXP(15, "read the body language"); p.npc.petMood = "calm"; p.fear = Math.max(0, p.fear - 0.1); MGpanel("Gentle restraint", (el) => MG.restraint(el, p.species)).then(r => { if (!r.ok) { p.mistakes++; stat("handlingErrors"); } renderExam(p); }); };
  $("#cuePush").onclick = () => uiFightBack(p, () => renderExam(p));
}
function MGpanel(title, runner, opts = {}) { if (G.ho && typeof hoMG === "function") return hoMG(title, runner, opts); openPanel(`${icon(opts.icon || "hand", 20)} ${title}`, `<div id="mgHost"></div>`, { noClose: true, wide: true }); energy(-1); return runner($("#mgHost")).then(r => { if (r && r.ok && G.s.energy < 25 && Math.random() < 0.15) { r.ok = false; r.text += " (fatigue error)"; toast("Fatigue cost you that one — take a break.", "warn"); } return r; }); }
function renderExam(p) {
  const sp = SPECIES[p.species], v = sp.vitals, done = p.examDone, allDone = EXAM_STEPS.every(s => done[s.id]);
  const steps = EXAM_STEPS.map(s => `<div class="step ${done[s.id] ? "done" : ""}" onclick="examStep(${p.id},'${s.id}')"><span class="chk">${done[s.id] ? icon("check", 16) : ""}</span><div><b>${s.label}</b>${done[s.id] ? `<div class="tip">${s.tip}${s.id === "tpr" ? vitalsHTML(p) : ""}${s.id === "history" ? `<div class='tip'>Owner: “${p.caseDef.complaint}”</div>` : ""}${s.id === "ausc" && p.hidden && p.hidden.murmur ? `<div class='tip'><b>Finding:</b> grade II/VI systolic murmur over the left apex — note for the anaesthetic plan (ASA II).</div>` : ""}${s.id === "msk" && p.secondary ? `<div class='tip'><b>Also noted:</b> ${p.secondary}.</div>` : ""}${s.id === "bcs" ? `<div class='tip'>${BCS[p.caseDef.id === "bird_well" ? 1 : p.secondary && p.secondary.includes("overweight") ? 3 : 2]}</div>` : ""}</div>` : ""}</div></div>`).join("");
  openPanel(`${icon("steth", 20)} Physical exam — ${sp.emoji} ${p.name} (${p.breed}, ${p.age}, ${p.weight} kg)${p.emergency ? ` <span class="emerg">EMERGENCY ${Math.ceil(p.emergencyLeft)} s</span>` : ""}`, `
    ${p.reweigh ? `<div class="alarmbox">${icon("warn", 16)} The nurse wrote <b>${p.reweigh} kg</b>, but the file says ${p.weight} kg. <button class="btn small" onclick="reweigh(${p.id})">Reweigh on the scale</button></div>` : ""}${p.intake && /Unknown/.test(p.intake.vax) ? `<div class="hintbox">Vaccination status wasn't asked at reception — cover it in the history.</div>` : ""}
    <div class="cols"><div><h4>Work through the exam in order</h4>${steps}</div>
    <div><h4>Findings</h4>${allDone ? `<p>${p.caseDef.findings}</p>${p.caseDef.calc && !p.calcDone ? calcHTML(p) : p.mystery ? `<button class="btn primary" onclick="uiDDX(${p.id})">${icon("flask", 16)} Open the differential board</button>` : `<h4>Your assessment & plan</h4><p class="muted small">All three are real plans — only one fits these findings.</p>${(p.optOrder || (p.optOrder = p.caseDef.options.map((o, i) => i).sort(() => Math.random() - 0.5))).map(i => `<button class="btn opt" onclick="diagnose(${p.id},${i})">${p.caseDef.options[i]}</button>`).join("")}`}` : `<p class="muted">Complete every exam step to reveal the findings.</p>${hint("Skipping auscultation means you miss murmurs that change the anaesthetic risk; skipping the skin check misses parasites.")}`}
    <h4>Normal ranges — ${sp.label}</h4><table class="ref small"><tr><td>Temp</td><td>${v.temp[0]}–${v.temp[1]} °C</td></tr><tr><td>Heart rate</td><td>${v.hr[0]}–${v.hr[1]} bpm</td></tr><tr><td>Resp. rate</td><td>${v.rr[0]}–${v.rr[1]} /min</td></tr><tr><td>CRT</td><td>${v.crt}</td></tr></table><p class="muted">${sp.vitalsNote}</p></div></div>`, { wide: true });
}
function vitalsHTML(p) { const v = SPECIES[p.species].vitals, t = p.vitals; return `<div class="vitals"><span class="${vitalClass(t.temp, v.temp)}">T ${t.temp} °C</span><span class="${vitalClass(t.hr, v.hr)}">HR ${t.hr}</span><span class="${vitalClass(t.rr, v.rr)}">RR ${t.rr}</span><span>CRT ${t.crt}</span><span>MM ${t.mm}</span></div>`; }
function examStep(id, step) { const p = G.patients.find(x => x.id === id); if (!p || p.examDone[step]) return; if (G.s.settings.examGames !== false && typeof examMinigame === "function") { const mg = examMinigame(p, step); if (mg) return mg.then(() => { p.examDone[step] = true; if (step === "ausc" && p.hidden && p.hidden.murmur && !p.murmurFound) { p.murmurFound = true; addXP(10, "murmur detected"); } if (step === "msk" && p.secondary) p.secondaryFound = true; renderExam(p); }); } p.examDone[step] = true; energy(-0.5); Sound.click(); if (step === "tpr" || step === "ausc") Sound.beep(); if (step === "ausc" && p.hidden && p.hidden.murmur) { p.murmurFound = true; addXP(10, "murmur detected"); } if (step === "msk" && p.secondary) p.secondaryFound = true; renderExam(p); }
function diagnose(id, i) {
  const p = G.patients.find(x => x.id === id); if (!p) return; if (!p.vitals) p.vitals = genVitals(p); if (p.reweigh) return toast("Reweigh the patient first — the nurse's weight doesn't match the file, and every dose depends on it.", "warn", 4000); const c = p.caseDef; const ok = i === c.correct; p.dxOk = ok; try { if (ok) World.setExpression("player", "happy", 3); if (p.npc) { const serious = p.emergency || /surgery|xray|dental|ward/.test(p.caseDef.outcome || ""); World.setExpression(p.npc.rig, serious ? "worried" : "happy", serious ? 6 : 3); } } catch (e) { } p.dxChoice = i;
  p.record.push(`${clockStr()} — Exam: ${c.findings} TPR ${p.vitals.temp} °C / ${p.vitals.hr} / ${p.vitals.rr}.${p.murmurFound ? " Grade II murmur noted." : ""}${p.secondaryFound ? " Also: " + p.secondary + "." : ""} Plan: "${c.options[i]}" (${ok ? "correct" : "corrected"}).`);
  if (ok) { G.s.correctDx++; addXP(30, "correct assessment"); if (G.s.correctDx >= 5) award("diagnose5"); Sound.success(); rep(0.05); } else { p.mistakes++; Sound.error(); rep(-0.1, "diagnostic error"); addXP(5); }
  if (p.emergency && p.emergencyLeft > 0) { stat("emergencies"); addXP(40, "emergency treated in time"); rep(0.2, "emergency handled"); p.emergency = false; }
  const route = routeFor(p); const next = { desk: "Finish visit → discharge at reception", xray: "Send to X-ray suite", prep: "Admit for surgery → prep room", dental: "Admit for dental → dental suite", ward: "Admit to the ward" }[route];
  setBody(`<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Correct." : "Not quite."}</b> ${c.why}</div><p><b>Plan:</b> ${c.options[c.correct]}</p>${p.hidden && p.hidden.murmur && !p.murmurFound ? `<div class="badbox"><b>Missed:</b> ${p.name} has a heart murmur you did not auscultate. ${c.outcome === "surgery" ? "The anaesthetist will find it — expect more events." : "Note it for next time."}</div>` : ""}${p.rx ? `<p>${icon("drug", 16)} Prescription needed: <b>${DRUGS.find(d => d.id === p.rx).name}</b> — dispense at the pharmacy before discharge.</p>` : ""}<div class="btnrow"><button class="btn primary" onclick="afterExam(${p.id})">${next}</button></div>`);
}
function routeFor(p) { const c = p.caseDef; if (c.xray && G.s.level >= 2) return "xray"; if (c.outcome === "dental") return "dental"; if (c.outcome === "surgery") return "prep"; if (c.isolation && owns("ward")) return "ward"; if ((p.species === "rabbit" || p.species === "tortoise") && c.outcome === "checkup") return "ward"; return "desk"; }
function afterExam(id) {
  const p = G.patients.find(x => x.id === id); const c = p.caseDef; closePanel(); const route = routeFor(p);
  if (c.id === "bird_nails" && !p.nailsDone) { p.nailsDone = true; return MGpanel("Nail trim", (el) => MG.nailTrim(el, 4), { icon: "paw" }).then(r => { if (!r.ok) p.mistakes++; else addXP(15, "nails trimmed"); p.record.push(`${clockStr()} — Nail trim (${r.ok ? "clean" : "quick nicked, styptic applied"}).`); closePanel(); afterExam(id); }); }
  if (route === "desk") { p.fee = c.fee; sendToDesk(p, PATH.examToDesk); }
  else if (route === "xray") { walkNPC(p, PATH.examToXray, "to_xray", () => { World.placePet(p.npc, 13.5, 0.95, 6.5, Math.PI / 2); p.npc.rig.group.position.set(15.3, 0, 7.5); p.status = "xray_ready"; toast(`${p.name} is positioned on the X-ray table.`, "info"); }); }
  else if (route === "dental") { walkNPC(p, PATH.examToDental, "to_dental", () => { World.placePet(p.npc, 19.5, 1.0, -7, Math.PI / 2); p.npc.rig.group.position.set(20.5, 0, -5.8); p.status = "dental_ready"; toast(`${p.name} is anaesthetised on the dental table.`, "info"); }); }
  else if (route === "ward") { walkNPC(p, PATH.examToWard, "to_ward", () => { World.placePet(p.npc, 19.5, 1.0, 6.5, Math.PI / 2); p.npc.rig.group.position.set(21, 0, 7.5); p.status = "ward_ready"; toast(`${p.name} is in the ward${c.isolation ? " — ISOLATION: gloves and gown on" : ""}.`, "info"); }); }
  else admitForSurgery(p, PATH.examToPrep);
}
function sendToDesk(p, path) { walkNPC(p, path, "to_desk", () => { p.status = "ready_discharge"; Sound.bell(); }); }
function admitForSurgery(p, path) {
  const proc = PROCEDURES[p.caseDef.procedure];
  if (G.s.level < proc.level) { toast(`${proc.name} unlocks at level ${proc.level}. Referred out.`, "warn", 4500); p.fee = 40; sendToDesk(p, path === PATH.examToPrep ? PATH.examToDesk : PATH.xrayToDesk); return; }
  walkNPC(p, path, "to_prep", () => { World.placePet(p.npc, 0, 0.95, 5.5, Math.PI / 2); p.status = "preop"; p.record.push(`${clockStr()} — Admitted for ${proc.name}. Consent signed by ${p.ownerName}.`); toast(`${p.name} is on the prep table. ${p.ownerName} waits outside.`, "info"); p.npc.path = PATH.prepOut.slice(); p.npc.onArrive = () => { p.npc.rig.group.visible = false; }; updateHUD(); });
}

/* ---------------- FIGHT BACK ---------------- */
function uiFightBack(p, next) {
  const sp = SPECIES[p.species]; if (p.npc && p.npc.pet && World.petWindup) World.petWindup(p.npc.pet); Sound.petAngry(p.species); Sound.vibrate(80); p.npc.petMood = "angry";
  const line = { dog: `${p.name} stiffens, lifts a lip and snaps at your hand!`, cat: `${p.name} flattens the ears, hisses and swats!`, bird: `${p.name} flaps wildly and lunges with an open beak!`, rabbit: `${p.name} kicks out violently with both hind legs!`, tortoise: `${p.name} withdraws and hisses, legs flailing.` }[p.species];
  const opts = sp.handling.slice().sort(() => Math.random() - 0.5);
  openPanel(`${icon("warn", 20)} ${p.name} is fighting back!`, `<p class="big">${line}</p><p>How do you restrain safely?</p>${opts.map(o => `<button class="btn opt" data-h="${o.replace(/"/g, "&quot;")}">${o}</button>`).join("")}`, { noClose: true });
  document.querySelectorAll("#panelBody .opt").forEach(b => b.onclick = () => {
    const ok = b.dataset.h === sp.bestHandling;
    if (ok) { Sound.success(); addXP(20, "safe handling"); if (p.species === "cat") award("catwhisperer"); if (p.species === "bird") award("birdnerd"); p.npc.petMood = "calm"; p.fear = Math.max(0, p.fear - 0.15); p.record.push(`${clockStr()} — Fractious; restrained with: ${sp.bestHandling}.`); }
    else { Sound.error(); p.mistakes++; stat("handlingErrors"); G.s.money -= 5; p.fear = Math.min(1, p.fear + 0.2); rep(-0.1, "handling injury"); p.record.push(`${clockStr()} — Handling error (${b.dataset.h}); corrected to ${sp.bestHandling}.`); }
    setBody(`<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Good call." : (p.species === "bird" ? "Dangerous!" : "Ouch — scratched (−5 JD first-aid).")}</b> ${sp.handlingWhy}</div><div class="btnrow"><button class="btn primary" id="fbNext">Continue</button></div>`);
    $("#fbNext").onclick = () => { p.npc.petMood = "calm"; next(); };
  });
}

/* ---------------- X-RAY ---------------- */
function uiXray() {
  const p = patientAt("xray_ready"); if (!p) return openPanel(`${icon("xray", 20)} X-ray table`, "<p>No patient here. Radiographs are ordered from the exam room.</p>");
  openPanel(`${icon("xray", 20)} Radiography — ${p.name}`, `<ol><li><b>Radiation safety:</b> lead apron, thyroid shield, gloves; only essential staff; dosimeter badge on.</li><li><b>Sedation/analgesia</b> so a painful patient lies still.</li><li><b>Two orthogonal views</b> (lateral + craniocaudal/ventrodorsal), include the joint above and below.</li><li><b>Exposure</b> by thickness (kVp/mAs chart); collimate.</li></ol><div class="btnrow"><button class="btn primary" onclick="takeXray(${p.id})">${icon("camera", 16)} Expose</button></div>`);
}
function takeXray(id) { const p = G.patients.find(x => x.id === id); Sound.beep(); energy(-3); const xr = p.caseDef.xray || { view: p.species, finding: null, label: "No abnormality detected" }; p.xray = xr; p.record.push(`${clockStr()} — Radiographs: ${xr.label}.`); award("xray1"); addXP(25, "radiograph taken"); stat("xrays"); showXrayPanel(p, xr, true); }
function showXrayPanel(p, xr, decide) {
  const sp = SPECIES[xr.view];
  const nextBtn = !decide ? "" : (p.caseDef.outcome === "surgery" ? `<button class="btn primary" onclick="closePanel();admitForSurgery(G.patients.find(x=>x.id===${p.id}),PATH.xrayToPrep)">Admit for surgery → prep room</button>` : (xr.finding && !xr.finding.startsWith("fracture") ? `<button class="btn primary" onclick="xrayTreat(${p.id})">${xr.next || "Start treatment & discharge"}</button>` : `<button class="btn primary" onclick="xrayBandage(${p.id})">Robert Jones bandage & discharge</button>`));
  openPanel(`${icon("xray", 20)} Radiograph — ${sp.label}: ${p.name}`, `<div class="xrwrap"><div id="xrHolder">${skeletonSVG(xr.view, xr.finding, 560, 414)}</div><div><h4>Report</h4><p><b>${xr.label}</b></p><p class="muted">Hover or tap any bone for its name — each new bone is added to your anatomy collection.</p>${xr.finding && xr.finding.startsWith("fracture") ? "<p>Describe: bone & third, type (transverse/oblique/spiral/comminuted), open/closed, displacement. Stabilise, then plan coaptation vs internal fixation.</p>" : ""}${xr.finding === "foreign_body" ? "<p>Radio-opaque gastric foreign body. Plan: fluids, electrolytes, laparotomy.</p>" : ""}${xr.plan ? `<p>${xr.plan}</p>` : ""}${xr.finding === "bladder_stones" ? "<p>Multiple cystic calculi; check the urethra too. Plan: cystotomy, stone analysis.</p>" : ""}<div class="btnrow">${nextBtn}</div></div></div>`, { wide: true });
  wireXrayHover($("#xrHolder"), $("#boneLabel")); hookBoneCollection($("#xrHolder"));
}
function hookBoneCollection(el) { el.addEventListener("pointerdown", (e) => { const g = e.target.closest(".bone"); if (g && !G.s.collections.bones.includes(g.dataset.bone)) { G.s.collections.bones.push(g.dataset.bone); if (G.s.collections.bones.length % 10 === 0) toast(`${icon("tag", 16)} Anatomy collection: ${G.s.collections.bones.length} bones`, "xp", 2000); } }); }
function xrayTreat(id) { const p = G.patients.find(x => x.id === id); if (!p) return; p.fee = p.caseDef.fee; p.record.push(`${clockStr()} — Plan after imaging: ${p.caseDef.options[p.caseDef.correct]}.`); addXP(10, "imaging-led plan"); closePanel(); sendToDesk(p, PATH.xrayToDesk); }
function xrayBandage(id) { const p = G.patients.find(x => x.id === id); p.fee = p.caseDef.fee; closePanel(); runProcedureSteps(p, "robert_jones").then(() => MGpanel("Bandage wrap", (el) => MG.bandageWrap(el), { icon: "bandage" })).then(r => { if (r && !r.ok) p.mistakes++; p.record.push(`${clockStr()} — Robert Jones bandage applied; recheck radiographs in 2–3 weeks.`); closePanel(); sendToDesk(p, PATH.xrayToDesk); }); }
function uiViewer() { const last = G.patients.slice().reverse().find(p => p.xray) || null; if (last) return showXrayPanel(last, last.xray, false); openPanel(`${icon("xray", 20)} Viewer — anatomy atlas`, `<p class="muted">Hover any bone. Collected: ${G.s.collections.bones.length}.</p><div class="xrgrid">${["dog", "cat", "bird"].map(s => `<div><h4>${SPECIES[s].label}</h4>${skeletonSVG(s, null, 330, 244)}</div>`).join("")}</div>`, { wide: true }); wireXrayHover($("#panelBody"), $("#boneLabel")); hookBoneCollection($("#panelBody")); }

/* ---------------- PRE-OP ---------------- */
const PREOP_QUIZ = {
  fasting: { dog: ["4–6 hours food, water until premed", "24 hours food and water", "No fasting needed"], cat: ["4–6 hours food, water until premed", "24 hours food and water", "No fasting needed"], bird: ["1–3 hours at most, confirm the crop is empty", "12 hours like a dog", "24 hours"], rabbit: ["No fasting — rabbits cannot vomit; fasting causes gut stasis", "12 hours", "24 hours"], tortoise: ["Warm to POTZ; fast 24–48 h in large species", "No preparation needed", "Cool it down first"], correct: 0 },
  induce: { dog: ["Cuffed tube, inflate just enough to seal", "Uncuffed tube", "No tube — mask only for surgery"], cat: ["Cuffed tube, lidocaine on larynx, gentle — never over-inflate", "Force the tube quickly before laryngospasm", "Never intubate cats"], bird: ["UNCUFFED tube (complete tracheal rings) or face mask", "Cuffed tube like a dog", "Inflate the cuff fully"], rabbit: ["Small uncuffed tube or V-gel; obligate nasal breathers", "Large cuffed tube", "No airway needed"], tortoise: ["Uncuffed tube + IPPV (no diaphragm)", "Cuffed tube, spontaneous breathing", "Mask only"], correct: 0 },
  scrub: { all: ["Chlorhexidine alternating with alcohol, target pattern from incision outward, ≥ 2–5 min", "Quick wipe with water", "Scrub from the edges inward"], correct: 0 }
};
if (typeof PREOP_QUIZ_V2 !== "undefined") Object.assign(PREOP_QUIZ, PREOP_QUIZ_V2);
function uiPreop() {
  const p = patientAt("preop"); if (!p) return openPanel(`${icon("folder", 20)} Prep table`, "<p>No surgical patient on the prep table.</p>");
  if (!p.preopDone) p.preopDone = []; renderPreop(p);
}
function renderPreop(p) {
  const idx = p.preopDone.length; const proc = PROCEDURES[p.caseDef.procedure];
  const list = PREOP_STEPS.map((s, i) => `<div class="step ${i < idx ? "done" : i === idx ? "cur" : "lock"}" ${i === idx ? `onclick="preopStep(${p.id})"` : ""}><span class="chk">${i < idx ? icon("check", 16) : i + 1}</span><div><b>${s.label}</b>${i < idx ? `<div class="tip">${typeof s.why === "function" ? s.why(p.species) : s.why}</div>` : ""}</div></div>`).join("");
  openPanel(`${icon("folder", 20)} Pre-operative checklist — ${p.name} → ${proc.name}`, `<p class="muted">${proc.intro}</p>${p.murmurFound ? `<div class="alarmbox">Murmur on file → ASA II: lower α2 dose, pre-oxygenate, monitor BP closely.</div>` : ""}${list}${idx >= PREOP_STEPS.length ? `<div class="goodbox"><b>Patient ready.</b> ${p.packReady ? "Pack is sterile." : "Assemble and autoclave the instrument pack (autoclave in this room) — or a surgical assistant does it."} Then: locker → sink → OR.</div><div class="btnrow"><button class="btn primary" onclick="toOR(${p.id})">Transfer to operating table</button></div>` : ""}`, { wide: true });
}
function preopStep(id) {
  const p = G.patients.find(x => x.id === id); const i = p.preopDone.length; const s = PREOP_STEPS[i]; if (!s) return;
  const finish = () => { p.preopDone.push(s.id); Sound.click(); if (s.id === "monitor") Sound.beep(); renderPreop(p); };
  if (G.ho && typeof hoPreopStep === "function" && hoPreopStep(p, s, finish)) return;
  if (s.id === "iv" && !p.ivFight && Math.random() < 0.15 + p.fear * 0.3 + difficultyScale() * 0.1 && !["bird", "tortoise"].includes(p.species)) { p.ivFight = true; return uiFightBack(p, finish); }
  if (s.id === "blood") return (G.s.settings.examGames !== false ? MGpanel("Blood sample", (el) => MG.bloodDraw(el, p.species), { icon: "drop" }) : Promise.resolve({ ok: true })).then(r => { if (!r.ok) p.mistakes++; openPanel(`${icon("flask", 20)} Bloods`, "", { noClose: true }); uiLabPanel(p, finish); });
  if (s.id === "clip") return MGpanel("Clip & vacuum", (el) => MG.clipVacuum(el)).then(r => { if (!r.ok) p.mistakes++; finish(); });
  if (s.id === "scrub") return preopQuiz(p, s, () => MGpanel("Surgical site scrub", (el) => MG.scrubPattern(el)).then(r => { if (!r.ok) { p.mistakes++; p.contam = (p.contam || 0) + 1; } finish(); }));
  if (s.id === "premed") return uiDoseTask(p, "methadone", finish);
  if (s.id === "induce") return preopQuiz(p, s, () => uiDoseTask(p, p.species === "dog" || p.species === "cat" ? "propofol" : "alfax", finish));
  const quiz = PREOP_QUIZ[s.id]; if (!quiz) return finish(); preopQuiz(p, s, finish);
}
function preopQuiz(p, s, finish) {
  const quiz = PREOP_QUIZ[s.id]; if (!quiz) return finish(); const opts = (quiz[p.species] || quiz.all); const order = opts.map((o, k) => k).sort(() => Math.random() - 0.5);
  setBody(`<h4>${s.label}</h4><p class="big">${s.id === "fasting" ? `How long should a ${SPECIES[p.species].label.toLowerCase()} be fasted?` : s.id === "induce" ? `Which airway for a ${SPECIES[p.species].label.toLowerCase()}?` : "How do you prepare the surgical site?"}</p>${order.map(k => `<button class="btn opt" data-k="${k}">${opts[k]}</button>`).join("")}`);
  document.querySelectorAll("#panelBody .opt").forEach(b => b.onclick = () => { const ok = +b.dataset.k === quiz.correct; if (ok) { Sound.success(); addXP(15, "correct protocol"); } else { Sound.error(); p.mistakes++; } p.record.push(`${clockStr()} — Pre-op: ${s.label} (${ok ? "correct" : "corrected"}).`); setBody(`<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Correct." : "Not quite."}</b> ${typeof s.why === "function" ? s.why(p.species) : s.why}</div><div class="btnrow"><button class="btn primary" id="pq">Continue</button></div>`); $("#pq").onclick = finish; });
}
function uiDoseTask(p, drugId, next, retry, self) { const drug = DRUGS.find(d => d.id === drugId); if (!drug || !drug.dose[p.species]) return next(); if (!retry && !self && drug.conc && typeof pharmacistDraft === "function" && G.s.staff.some(s => s.role === "pharmacist")) return pharmacistDraft(p, drug, next); MGpanel(`${retry ? "Recalculate" : "Draw up"} ${drug.name}`, (el) => MG.dose(el, drug, p.species, p.weight), { icon: "drug" }).then(r => { if (!r.ok) { if (!retry) { p.mistakes++; rep(-0.05); p.record.push(`${clockStr()} — ${drug.name}: first calculation wrong, redone.`); } return uiDoseTask(p, drugId, next, true); } if (!retry) { addXP(15, "dose correct"); G.s.dosesDone++; stat("doses"); } p.record.push(`${clockStr()} — ${drug.name} ${drug.dose[p.species]} mg/kg → ${(drug.dose[p.species] * p.weight / drug.conc).toFixed(2)} mL (verified).`); next(); }); }
function toOR(id) { const p = G.patients.find(x => x.id === id); const asnP = G.s.staff.find(s => s.role === "assistant"); if (!p.packReady && !(asnP && asnP.level === "senior")) { toast(asnP ? `${asnP.name} is a junior assistant — assemble and autoclave the pack yourself (autoclave, east wall of this room).` : "Assemble and autoclave the surgical pack first (autoclave, east wall of this room).", "warn", 4500); return; } if (!p.packReady) { p.packReady = true; toast(`${asnP.name} (senior assistant) assembled and autoclaved the pack.`, "info"); } World.placePet(p.npc, 7, 1.0, 6.5, Math.PI / 2); p.status = "ready_or"; p.record.push(`${clockStr()} — Anaesthetised, intubated, monitored; transferred to theatre.`); closePanel(); toast(`${p.name} is on the operating table. Scrub in!`, "info", 4000); updateHUD(); }
function uiAutoclave() { const p = patientAt("preop") || patientAt("ready_or"); if (!p) return openPanel(`${icon("tray", 20)} Autoclave`, `<p>No surgery scheduled. Packs are assembled per procedure, wrapped, and steam-sterilised at 121 °C for 15 min (134 °C for 3 min flash). The indicator strip must change colour.</p>`); if (p.packReady) return openPanel(`${icon("tray", 20)} Autoclave`, `<p>The ${PROCEDURES[p.caseDef.procedure].name} pack is sterile and ready.</p>`); MGpanel("Instrument pack", (el) => MG.packAssembly(el, p.caseDef.procedure), { icon: "tray" }).then(r => { p.packReady = true; if (r.ok) addXP(20, "pack complete"); else { p.mistakes++; p.packMissing = true; } closePanel(); }); }

/* ---------------- LOCKER & SINK ---------------- */
function uiLocker() { const o = G.s.outfit; openPanel(`${icon("locker", 20)} Locker`, `<p>Current outfit: <b>${{ clinic: "white coat (clinic wear)", scrubs: "clean scrubs, cap, mask, shoe covers", surgical: "sterile gown & gloves" }[o]}</b></p><p class="muted">Theatre rule: no clinic clothes beyond the red line. Cap and mask go on <i>before</i> the hand scrub.</p><div class="btnrow">${o !== "scrubs" ? `<button class="btn primary" onclick="setOutfit('scrubs')">Change into scrubs + cap + mask + shoe covers</button>` : ""}${o !== "clinic" ? `<button class="btn" onclick="setOutfit('clinic')">Back to white coat</button>` : ""}</div>`); }
function setOutfit(o) { G.s.outfit = o; World.setOutfit(o); Sound.click(); toast(o === "scrubs" ? icon("cap", 18) + " Scrubs, cap, mask and shoe covers on." : o === "clinic" ? icon("coat", 18) + " Back in the white coat." : icon("glove", 18) + " Sterile — hands above your waist!", "good"); updateHUD(); closePanel(); save(); }
function uiSink() {
  if (G.s.outfit === "clinic") return openPanel(`${icon("sink", 20)} Scrub sink`, `<div class="badbox"><b>Stop.</b> Change into scrubs, cap and mask at the locker first.</div>`);
  if (G.s.outfit === "surgical") return openPanel(`${icon("sink", 20)} Scrub sink`, `<p>Already scrubbed, gowned and gloved. Touch anything non-sterile and you must re-glove.</p>`);
  G.scrubIdx = 4; renderScrub();
}
function renderScrub() {
  const i = G.scrubIdx; const html = SCRUB_STEPS.map((s, k) => `<div class="step ${k < i ? "done" : k === i ? "cur" : "lock"}"><span class="chk">${k < i ? icon("check", 16) : k + 1}</span><div><b>${s.label}</b><div class="tip">${s.why}</div></div></div>`).join("");
  const act = i >= SCRUB_STEPS.length ? `<div class="goodbox"><b>Sterile.</b> Walk to the OR table.</div><div class="btnrow"><button class="btn primary" onclick="setOutfit('surgical');award('scrubbed')">Enter theatre</button></div>` : i === 4 ? `<p>Hold to scrub — fingertips first, hands above elbows, all four sides of each finger, then forearms.</p><button class="btn primary hold" id="scrubBtn">Hold to scrub</button><div class="bar"><div id="scrubFill"></div></div>` : `<div class="btnrow"><button class="btn primary" onclick="scrubNext()">${["", "", "", "", "", "Dry hands with sterile towel", "Put on sterile gown", "Closed gloving"][i]}</button></div>`;
  openPanel(`${icon("sink", 20)} Surgical hand scrub`, html + act, { wide: true });
  if (i === 4) { const btn = $("#scrubBtn"); let prog = 0, timer = null; const start = (e) => { e.preventDefault(); Sound.water(); timer = setInterval(() => { if (G.paused) return; prog += 2.2; $("#scrubFill").style.width = Math.min(100, prog) + "%"; if (prog >= 100) { clearInterval(timer); timer = null; scrubNext(); } }, 60); }; const stop = () => { if (timer) { clearInterval(timer); timer = null; if (prog < 100) { prog = 0; $("#scrubFill").style.width = "0%"; toast("Scrub interrupted — start again.", "warn"); } } }; btn.addEventListener("pointerdown", start); btn.addEventListener("pointerup", stop); btn.addEventListener("pointerleave", stop); btn.addEventListener("pointercancel", stop); }
}
function scrubNext() { G.scrubIdx++; Sound.click(); renderScrub(); }

/* ---------------- SURGERY ---------------- */
function uiSurgery() {
  const p = patientAt("ready_or"); if (!p) return openPanel(`${icon("scalpel", 20)} Operating table`, "<p>No anaesthetised patient on the table.</p>");
  if (G.s.outfit !== "surgical") return openPanel(`${icon("scalpel", 20)} Operating table`, `<div class="badbox"><b>You are not sterile.</b> ${G.s.outfit === "clinic" ? "Locker, then sink." : "Complete the hand scrub, gown and gloves at the sink."}</div>`);
  const proc = PROCEDURES[p.caseDef.procedure];
  p.surg = { step: 0, mistakes: 0, events: 0, vit: { hr: p.species === "bird" ? 320 : p.species === "cat" ? 150 : 95, spo2: 98, etco2: 40, map: 78, temp: p.species === "bird" ? 40.5 : 38.2 }, start: gameNow() };
  if (G.s.settings.music) Sound.music.start("or"); energy(-6);
  const approach = proc.approaches ? `<h4>Choose the approach</h4>${proc.approaches.filter(a => !a.species || a.species.includes(p.species)).map(a => `<button class="btn opt" onclick="pickApproach(${p.id},'${a.id}')"><b>${a.label}</b><br><span class="muted">${a.why}</span></button>`).join("")}` : `<div class="btnrow"><button class="btn primary" onclick="renderSurgery(${p.id})">Begin — "Scalpel, please."</button></div>`;
  openPanel(`${icon("scalpel", 20)} ${proc.name} — ${p.name}`, `<p class="big">${proc.intro}</p><p><b>Time-out:</b> ${p.name}, ${p.breed}, ${p.weight} kg · ${proc.name} · allergies none · antibiotics given · count done. Est. ${proc.duration}.${p.packMissing ? " <b>Warning:</b> the pack was incomplete — expect delays." : ""}</p>${G.s.staff.some(s => s.role === "assistant") ? `<p class="muted">${icon("user", 14)} Your surgical assistant is scrubbed in: instruments handed faster, fewer surprises.</p>` : ""}${approach}`, { wide: true, noClose: true });
}
function pickApproach(id, a) { const p = G.patients.find(x => x.id === id); p.approach = a; p.record.push(`${clockStr()} — Approach: ${a}.`); addXP(10); renderSurgery(id); }
function monitorHTML(v, sp) { const r = SPECIES[sp].vitals; return `<div class="monitor"><div><small>HR</small><b class="${v.hr < r.hr[0] * 0.7 || v.hr > r.hr[1] * 1.15 ? "bad" : ""}">${Math.round(v.hr)}</b></div><div><small>SpO₂</small><b class="${v.spo2 < 95 ? "bad" : ""}">${Math.round(v.spo2)}%</b></div><div><small>ETCO₂</small><b class="${v.etco2 < 35 || v.etco2 > 45 ? "bad" : ""}">${Math.round(v.etco2)}</b></div><div><small>MAP</small><b class="${v.map < 60 ? "bad" : ""}">${Math.round(v.map)}</b></div><div><small>Temp</small><b class="${v.temp < 37 ? "bad" : ""}">${v.temp.toFixed(1)}°</b></div><div class="ecg"><svg viewBox="0 0 120 30"><path d="M0 15 L20 15 L25 5 L30 25 L35 15 L60 15 L65 5 L70 25 L75 15 L100 15 L105 5 L110 25 L115 15 L120 15" fill="none" stroke="#7ef29a" stroke-width="2"/></svg></div></div>`; }
function renderSurgery(id) {
  if (G.ho && typeof HO !== "undefined" && HO.room === "orTable") return hoSurgStep(id);
  const p = G.patients.find(x => x.id === id); const proc = PROCEDURES[p.caseDef.procedure]; const S = p.surg; const st = proc.steps[S.step];
  if (!st) return finishSurgery(p);
  const asnL = staffLevel("assistant"); const assistant = !!asnL; const maxEvents = (proc.steps.length > 7 ? 2 : 1) + (p.murmurFound || (p.hidden && p.hidden.murmur) ? 1 : 0) + (p.referral ? 1 : 0) + (G.s.settings.difficulty === "specialist" ? 1 : 0);
  if (S.step > 0 && S.events < maxEvents && Math.random() < (asnL === "senior" ? 0.22 : asnL ? 0.34 : 0.42) && !S.pendingEvent) { S.pendingEvent = true; S.events++; return Math.random() < 0.4 ? ecgEvent(p) : anesEvent(p); }
  if (S.step > 1 && !S.bled && Math.random() < 0.3 && !S.pendingEvent) { S.bled = true; S.pendingEvent = true; return MGpanel("Bleeder!", (el) => MG.clamp(el, assistant ? 5 : 4), { icon: "warn" }).then(r => { if (!r.ok) { S.mistakes++; p.mistakes++; S.vit.map -= 10; S.vit.hr += 20; } else addXP(10); renderSurgery(id); }); }
  S.pendingEvent = false;
  const choices = st.choices.slice().sort(() => Math.random() - 0.5); const timed = G.s.settings.difficulty === "specialist";
  openPanel(`${icon("scalpel", 20)} ${proc.name} — step ${S.step + 1}/${proc.steps.length}`, `${monitorHTML(S.vit, p.species)}<div class="surgstep"><p class="big">${st.text}</p><p class="muted">Which instrument?${timed ? ' <span class="emerg" id="stepTimer">25 s</span>' : ""}</p><div class="tools">${choices.map(c => `<button class="tool" data-t="${c}">${toolSVG(c, 150, 60)}<span>${TOOLS[c].short}</span></button>`).join("")}</div>${hint(TOOLS[st.tool].desc.split(".")[0] + ".")}</div>`, { wide: true, noClose: true });
  let left = 25, tm = null; if (timed) tm = setInterval(() => { left--; const el = $("#stepTimer"); if (el) el.textContent = left + " s"; if (left <= 0) { clearInterval(tm); S.mistakes++; p.mistakes++; S.vit.temp -= 0.2; toast("Too slow — anaesthetic time is risk time.", "warn"); S.step++; renderSurgery(id); } }, 1000);
  document.querySelectorAll("#panelBody .tool").forEach(b => b.onclick = () => {
    if (tm) clearInterval(tm); energy(-1);
    let ok = b.dataset.t === st.tool; if (ok && G.s.energy < 25 && Math.random() < 0.2) { ok = false; toast("Your hands are shaking — you fumble the instrument. Rest!", "warn", 3000); } const asnC = G.s.staff.find(s => s.role === "assistant" && s.level === "senior"); let caught = false; if (!ok && asnC && !S.caught && b.dataset.t !== st.tool) { S.caught = true; caught = true; ok = true; toast(`${asnC.name}: “Wait — I think you want the ${TOOLS[st.tool].name}.” (caught)`, "info", 4500); } const chosen = TOOLS[caught ? st.tool : b.dataset.t], right = TOOLS[st.tool]; if (!G.s.collections.tools.includes(st.tool)) G.s.collections.tools.push(st.tool);
    if (ok) { Sound.success(); addXP(12); S.vit.hr += rnd(-3, 3); } else { Sound.error(); S.vit.hr += rnd(5, 15); S.vit.map -= rnd(2, 6); }
    p.record.push(`${clockStr()} — Step ${S.step + 1}: ${st.text} → ${chosen.short}${caught ? " (wrong instrument caught by the senior assistant)" : ""}${ok ? "" : " (incorrect; " + right.short + " used)"}`);
    const retry = !ok ? `<button class="btn" id="sretry">Retry this step (−5 XP, no error recorded)</button>` : "";
    setBody(`${monitorHTML(S.vit, p.species)}<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Correct — " + right.name + "." : "Wrong instrument: " + chosen.short + ". Correct: " + right.name + "."}</b> ${st.why}</div><div class="toolinfo">${toolSVG(st.tool, 150, 60)}<p class="muted">${right.desc}</p></div><div class="btnrow"><button class="btn primary" id="sn">Next</button>${retry}</div>`);
    const advance = () => { S.step++; S.vit.temp -= 0.08; S.vit.etco2 += rnd(-1.5, 1.5); afterStepMinigame(p, st).then(() => renderSurgery(p.id)); };
    $("#sn").onclick = () => { if (!ok) { S.mistakes++; p.mistakes++; } advance(); };
    if ($("#sretry")) $("#sretry").onclick = () => { G.s.xp = Math.max(0, G.s.xp - 5); updateHUD(); renderSurgery(id); };
  });
}
function afterStepMinigame(p, st) {
  const S = p.surg; const proc = PROCEDURES[p.caseDef.procedure]; const isLast = S.step >= proc.steps.length;
  const run = (title, fn, icon_) => MGpanel(title, fn, { icon: icon_ }).then(r => { if (!r.ok) { S.mistakes++; p.mistakes++; } else addXP(15); return r; });
  if (st.tool === "towel" && !S.draped) { S.draped = true; return run("Draping", (el) => MG.drape(el), "tray"); }
  if ((st.tool === "carmalt" || (st.tool === "absorb" && /ligat/i.test(st.text))) && !S.ligated) { S.ligated = true; return run("Ligature", (el) => MG.ligature(el), "scalpel"); }
  if (isLast && st.tool === "nylon") { return (staffLevel("assistant") === "senior" ? Promise.resolve({ ok: true }) : run("Swab count", (el) => MG.swabCount(el, staffLevel("assistant") ? 6 : 10), "tray")).then(() => run("Skin closure", (el) => MG.suture(el, p.species === "cat" ? "intradermal" : "simple interrupted"), "scalpel")); }
  if (isLast && !proc.nonsterile && st.tool !== "nylon" && !S.counted && staffLevel("assistant") !== "senior") { S.counted = true; return run("Swab count", (el) => MG.swabCount(el, staffLevel("assistant") ? 6 : 10), "tray"); }
  return Promise.resolve({ ok: true });
}
function anesEvent(p) {
  const S = p.surg; const ev = pick(ANES_EVENTS); Sound.alarm(); Sound.vibrate(80);
  if (ev.text.includes("SpO")) S.vit.spo2 = 89; if (ev.text.includes("arterial")) S.vit.map = 52; if (ev.text.includes("temperature")) S.vit.temp = 36.2; if (ev.text.includes("Heart rate")) S.vit.hr *= 1.4; if (ev.text.includes("ETCO")) S.vit.etco2 = 58;
  const order = [0, 1, 2].sort(() => Math.random() - 0.5);
  setBody(`${monitorHTML(S.vit, p.species)}<div class="alarmbox"><b>Anaesthetist:</b> ${ev.text}</div><p>What do you do?</p>${order.map(k => `<button class="btn opt" data-k="${k}">${ev.options[k]}</button>`).join("")}`);
  document.querySelectorAll("#panelBody .opt").forEach(b => b.onclick = () => { const ok = +b.dataset.k === 0; if (ok) { Sound.success(); addXP(20, "anaesthetic event managed"); } else { Sound.error(); S.mistakes++; p.mistakes++; } p.record.push(`${clockStr()} — Anaesthetic event: ${ev.text} → ${ev.options[+b.dataset.k]} (${ok ? "correct" : "corrected"}).`); S.vit = { hr: p.species === "bird" ? 300 : p.species === "cat" ? 145 : 90, spo2: 98, etco2: 40, map: 75, temp: Math.max(S.vit.temp, 37.6) }; setBody(`${monitorHTML(S.vit, p.species)}<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Stabilised." : "The anaesthetist corrects you — "}</b> ${ev.why}</div><div class="btnrow"><button class="btn primary" id="ae">Back to surgery</button></div>`); $("#ae").onclick = () => renderSurgery(p.id); });
}
function ecgEvent(p) {
  const S = p.surg; const keys = ["brady", "vpc", "av2", "rsa"]; const k = pick(keys); const opts = keys.slice().sort(() => Math.random() - 0.5); Sound.alarm();
  setBody(`${monitorHTML(S.vit, p.species)}<div class="alarmbox"><b>ECG changes — identify the rhythm:</b></div>${MG.ecgStrip(k)}<div class="btnrow">${opts.map(o => `<button class="btn opt" data-k="${o}">${ECG[o].label}</button>`).join("")}</div>`);
  document.querySelectorAll("#panelBody .opt").forEach(b => b.onclick = () => { const ok = b.dataset.k === k; if (ok) { Sound.success(); addXP(20, "rhythm identified"); } else { Sound.error(); S.mistakes++; p.mistakes++; } p.record.push(`${clockStr()} — ECG: ${ECG[k].label} (${ok ? "identified" : "misread"}).`); setBody(`${monitorHTML(S.vit, p.species)}<div class="${ok ? "goodbox" : "badbox"}"><b>${ECG[k].label}.</b> ${ECG[k].action}</div><div class="btnrow"><button class="btn primary" id="ae">Back to surgery</button></div>`); $("#ae").onclick = () => renderSurgery(p.id); });
}
function finishSurgery(p) {
  const proc = PROCEDURES[p.caseDef.procedure]; const S = p.surg; G.s.surgeries++; award("first_surgery"); if (G.s.surgeries === 1 && typeof phoneMilestone === "function") phoneMilestone("first_surgery"); { const cl = G.s.staff.find(x => x.role === "cleaner" && x.level === "senior"); if (cl) G.s.hygiene = Math.min(100, G.s.hygiene + 3); } if (S.mistakes === 0) { award("flawless"); stat("flawless"); confetti(); rep(0.2, "flawless surgery"); } else if (S.mistakes >= 3) rep(-0.2, "rough surgery"); stat("surgeries");
  const mins = Math.round((gameNow() - S.start) / 6000) / 10; const xp = 80 + (S.mistakes === 0 ? 40 : 0) + (p.referral ? 40 : 0); addXP(xp, "surgery complete");
  p.record.push(`${clockStr()} — ${proc.name} completed in ${mins} min. Errors: ${S.mistakes}. Count correct. Moved to recovery.`); p.surgResult = { mins, mistakes: S.mistakes, proc: proc.name };
  const infect = (G.s.hygiene < 60 ? 0.25 : 0.08) + (p.contam ? 0.1 : 0); if (Math.random() < infect) p.complication = Math.random() < 0.5 ? "seroma" : "infection";
  World.placePet(p.npc, 10, 0.25, 11.3, Math.PI); p.status = "recovery"; p.fee = p.caseDef.fee; if (G.s.settings.music) Sound.music.start("lobby");
  openPanel(`${icon("check", 20)} Surgery complete`, `<div class="goodbox"><b>${proc.name} done in ${mins} min${S.mistakes === 0 ? " — flawless!" : ` with ${S.mistakes} error(s).`}</b> +${xp} XP</div><h4>Recovery</h4><ul>${POSTOP.map(x => `<li>${x}</li>`).join("")}</ul><p>${p.name} is in the recovery kennel. De-gown before leaving theatre.</p><div class="btnrow"><button class="btn primary" onclick="closePanel();setOutfit('scrubs')">De-gown & de-glove</button><button class="btn" onclick="shareCard('surgery',${p.id})">${icon("share", 16)} Share result card</button></div>`, { noClose: true });
  updateHUD(); save();
}
function runProcedureSteps(p, procId) { // non-sterile step list (bandage, hoof) — simple tool quiz
  const proc = PROCEDURES[procId]; let i = 0, errs = 0;
  return new Promise(resolve => { const step = () => { const st = proc.steps[i]; if (!st) { if (errs === 0) addXP(30, proc.name + " done"); return resolve({ errs }); } const choices = st.choices.slice().sort(() => Math.random() - 0.5); openPanel(`${icon("scalpel", 20)} ${proc.name} — ${i + 1}/${proc.steps.length}`, `<p class="big">${st.text}</p><div class="tools">${choices.map(c => `<button class="tool" data-t="${c}">${toolSVG(c, 150, 60)}<span>${TOOLS[c].short}</span></button>`).join("")}</div>`, { noClose: true, wide: true }); document.querySelectorAll("#panelBody .tool").forEach(b => b.onclick = () => { const ok = b.dataset.t === st.tool; if (!ok) { errs++; p.mistakes++; Sound.error(); } else { Sound.success(); addXP(8); } setBody(`<div class="${ok ? "goodbox" : "badbox"}"><b>${ok ? "Correct." : "Not that — " + TOOLS[st.tool].short + "."}</b> ${st.why}</div><div class="btnrow"><button class="btn primary" id="pn">Next</button></div>`); $("#pn").onclick = () => { i++; step(); }; }); }; step(); });
}
function uiRecovery() {
  const p = patientAt("recovery"); if (!p) return openPanel(`${icon("bed", 20)} Recovery kennel`, "<p>Empty. Post-op patients recover here on a warm pad until they can stand.</p>");
  openPanel(`${icon("bed", 20)} Recovery — ${p.name}`, `<p>${p.name} swallowed and was extubated, is sternal, temperature ${p.species === "bird" ? "40.8" : "37.9"} °C, pain score low. Incision clean and dry.</p><h4>Discharge instructions</h4><ul><li>E-collar on at all times for 10–14 days.</li><li>Lead walks only; no running, stairs or jumping.</li><li>Check the incision twice daily — swelling, discharge, gaping or licking: call us.</li><li>Pain relief as prescribed${p.rx && !p.rxDone ? " — <b>dispense at the pharmacy first</b>" : ""}; small bland meal tonight.</li><li>Recheck / suture removal in 10–14 days.</li></ul><div class="btnrow"><button class="btn primary" onclick="dischargeFromRecovery(${p.id})">Call ${p.ownerName} to collect ${p.name}</button></div>`);
}
function dischargeFromRecovery(id) { const p = G.patients.find(x => x.id === id); closePanel(); Sound.pet(p.species); p.npc.rig.group.visible = true; p.npc.rig.group.position.set(-5, 0, -16); World.placePet(p.npc, -4.4, 0, -16); p.npc.petFollow = true; if (p.npc.pet.parts.cage) p.npc.pet.parts.cage.visible = p.species === "bird"; p.record.push(`${clockStr()} — Recovered; discharged with E-collar, analgesia and written instructions.`); walkNPC(p, PATH.entryToDesk, "to_desk", () => { p.status = "ready_discharge"; Sound.bell(); toast(`${p.ownerName} is at reception to collect ${p.name}.`, "info"); }); }

/* ---------------- DISCHARGE ---------------- */
function uiDischarge(p) {
  if (p.rx && !p.rxDone) return openPanel(`${icon("card", 20)} Discharge — ${p.name}`, `<div class="badbox"><b>Prescription pending.</b> ${p.name} needs <b>${DRUGS.find(d => d.id === p.rx).name}</b> — go to the pharmacy and dispense it (dose calculation), then come back.</div>` + hint("A senior nurse can dispense routine prescriptions for you."));
  const fee = feeFor(p); const items = SHOP_ITEMS.filter(i => (p.caseDef.outcome === "surgery" ? ["ecollar", "deworm"] : ["deworm", "flea", "toothbrush", "food_" + p.species, "seed", "cuttle"]).includes(i.id)).slice(0, 3);
  const sec = p.secondaryFound ? `<div class="alarmbox"><b>Secondary finding:</b> ${p.secondary}. <label class="row"><input type="checkbox" id="secAddr" checked> Discuss and book follow-up (+rep)</label></div>` : "";
  openPanel(`${icon("card", 20)} Discharge — ${p.name}`, `<p>Summary for ${p.ownerName}: ${p.record[p.record.length - 1].split("— ")[1]}</p>${sec}<p><b>Invoice:</b> ${fee} JD${p.stray || p.charity ? " (shelter case — no charge)" : ""}${p.mistakes ? ` <span class="muted">(${p.mistakes} correction(s) recorded — no charge)</span>` : ""}</p><h4>Recommend take-home items</h4><div class="shopgrid">${items.map(i => `<label class="shopitem"><input type="checkbox" value="${i.id}" ${G.s.stock[i.id] > 0 ? "" : "disabled"}><span class="icw">${icon(i.icon, 24)}</span><div><b>${i.name}</b> — ${i.price} JD<br><span class="muted">${i.info}</span></div></label>`).join("")}</div>${!p.client && !p.stray ? `<label>Add a pet name to the clinic's name list (optional) <input id="customName" placeholder="e.g. your own cat's name" maxlength="14"></label>` : ""}<div class="btnrow"><button class="btn primary" onclick="finishDischarge(${p.id},${fee})">Take payment & say goodbye</button></div>`, { wide: true });
}
function finishDischarge(id, fee) {
  const p = G.patients.find(x => x.id === id); let total = fee; let sold = 0; try { if (p && p.npc) { World.setExpression(p.npc.rig, "laughing", 2.5); p.npc.rig.exprAfter = "happy"; } World.setExpression("player", "happy", 3); } catch (e) { }
  document.querySelectorAll("#panelBody .shopitem input[type=checkbox]:checked").forEach(c => { const it = SHOP_ITEMS.find(i => i.id === c.value); if (it && G.s.stock[it.id] > 0) { total += it.price; G.s.stock[it.id]--; sold++; } });
  if ($("#secAddr") && $("#secAddr").checked) { rep(0.05); addXP(10, "secondary problem addressed"); }
  const cn = $("#customName"); if (cn && cn.value.trim()) { G.s.customNames.push(cn.value.trim()); toast(`“${cn.value.trim()}” added to the clinic's pet names.`, "good"); }
  G.s.itemsSold += sold; stat("sales", sold); if (G.s.itemsSold >= 10) award("shop10");
  earn(total); G.s.patientsSeen++; stat("patients"); if (G.s.patientsSeen >= 10) award("bell10"); addXP(20, "patient discharged"); G.s.dayStats.xp = (G.s.dayStats.xp || 0) + 20;
  if (p.stray || p.charity) rep(0.15, "treated a shelter animal"); else rep(p.mistakes ? 0 : 0.05);
  if (!G.s.collections.species.includes(p.species)) G.s.collections.species.push(p.species);
  if (Math.random() < 0.3 && !p.mistakes) { G.s.thankCards++; World.showThankCards(G.s.thankCards); toast(`${icon("heart", 16)} ${p.ownerName} left a thank-you card for the office wall.`, "good"); }
  p.record.push(`${clockStr()} — Paid ${total} JD. Case closed.`);
  const caseRec = { id: p.id, name: p.name, ownerName: p.ownerName, species: p.species, breed: p.breed, age: p.age, sex: p.sex, weight: p.weight, complaint: p.caseDef.complaint, procedure: p.caseDef.procedure ? PROCEDURES[p.caseDef.procedure].name : (p.caseDef.outcome === "xray" ? "Radiography" : p.caseDef.outcome === "dental" ? "Dental" : "Wellness / medical"), record: p.record.slice(), mistakes: p.mistakes, day: G.s.day, xray: p.xray || null, surg: p.surgResult || null };
  G.s.cases.push(caseRec); if (TEXTBOOK[p.caseDef.id] && !G.s.textbook.includes(p.caseDef.id)) { G.s.textbook.push(p.caseDef.id); toast(`${icon("book", 16)} New textbook page unlocked in the library.`, "xp", 3000); }
  // client memory
  if (!p.stray) { let cl = p.client; if (!cl) { cl = { id: Date.now(), ownerName: p.ownerName, personality: p.personality, pets: [], cfg: p.npcCfg }; G.s.clients.push(cl); } let rec = p.petRec; if (!rec) { rec = { name: p.name, species: p.species, breed: p.breed, sex: p.sex, weight: p.weight, color: p.npcCfg.pet.color, ageMonths: /month/.test(p.age) ? parseInt(p.age) : parseInt(p.age) * 12 || 24, history: [], fear: p.fear, lastDay: G.s.day }; cl.pets.push(rec); } rec.fear = p.fear; rec.lastDay = G.s.day; rec.weight = p.weight; rec.history.push(`Day ${G.s.day}: ${caseRec.procedure}${p.complication ? " (complication pending: " + p.complication + ")" : ""}`); if (p.complication) rec.recheck = p.complication; if (G.s.clients.length > 40) G.s.clients.shift(); }
  if (typeof scheduleClientPhoto === "function") scheduleClientPhoto(p); if (typeof storyAdvance === "function") storyAdvance(p); if (typeof showRecap === "function") showRecap(p);
  closePanel(); Sound.pet(p.species);
  walkNPC(p, PATH.leave, "leaving", () => { World.removeNPC(p.npc); p.status = "done"; G.patients = G.patients.filter(x => x.status !== "done"); updateHUD(); });
  toast(`${icon("card", 16)} +${total} JD — ${p.ownerName} and ${p.name} say thank you!`, "good"); save();
}

/* ---------------- SHOP ---------------- */
function uiShop() {
  const cust = G.shopCustomer;
  const grid = SHOP_ITEMS.map(i => `<div class="shopitem"><span class="icw">${icon(i.icon, 24)}</span><div><b>${i.name}</b> — ${i.price} JD · stock ${G.s.stock[i.id]}<br><span class="muted">${i.info}</span><div class="btnrow tight">${cust && cust.wants === i.id ? `<button class="btn primary small" onclick="sellItem('${i.id}')">Sell to ${cust.name}</button>` : ""}<button class="btn small" onclick="restock('${i.id}')">Restock ×5 (${i.cost * 5} JD)</button></div></div></div>`).join("");
  openPanel(`${icon("shop", 20)} Clinic shop`, `${cust ? `<div class="goodbox">${icon("user", 16)} <b>${cust.name}</b> asks: “${cust.line}”</div>` : `<p class="muted">No shop customer right now.</p>` + hint("Hire a shop assistant and walk-in customers are served while you operate.")}<div class="shopgrid">${grid}</div>`, { wide: true });
}
function sellItem(id) { const it = SHOP_ITEMS.find(i => i.id === id); if (G.s.stock[id] <= 0) return toast("Out of stock — restock first.", "warn"); G.s.stock[id]--; G.s.itemsSold++; stat("sales"); earn(it.price); addXP(8, "sale"); if (G.s.itemsSold >= 10) award("shop10"); toast(`Sold ${it.name}. Advice given: ${it.info}`, "good", 4000); G.shopCustomer = null; uiShop(); }
function restock(id) { const it = SHOP_ITEMS.find(i => i.id === id); const c = Math.round(it.cost * 5 * (G.s.phone && G.s.phone.discountDay === G.s.day ? 0.8 : 1)); if (G.s.money < c) return toast("Not enough money.", "warn"); G.s.money -= c; G.s.stock[id] += 5; Sound.click(); updateHUD(); uiShop(); save(); }
const SHOP_LINES = { flea: "My cat keeps scratching — is the dog spot-on okay for her?", food_dog: "My retriever is getting chubby, what food do you recommend?", seed: "My budgie only eats seeds, is that fine?", toothbrush: "The vet said my dog's teeth need brushing — what do I use?", ecollar: "My cat chews her stitches, what can I do?", shampoo: "My dog has itchy skin, can I use my own shampoo?", cuttle: "What does my cockatiel need for calcium?", deworm: "How often should I deworm my puppy?", carrier: "My cat hates the carrier, any tips?", food_cat: "Can my cat live on dog food?" };
function spawnShopCustomer() { const it = pick(SHOP_ITEMS); G.shopCustomer = { name: pick(OWNER_NAMES), wants: it.id, line: SHOP_LINES[it.id] || `Do you sell ${it.name.toLowerCase()}?`, t: 0 }; Sound.bell(); toast(`${icon("shop", 16)} A customer at the shop counter asks about ${it.name.toLowerCase()}.`, "info", 4000); }

/* ---------------- main loop ---------------- */
function nearestInteractable(pos, forCoop) {
  if (World.camMode === "first" && !forCoop) { const L = World.getLook(); const fx = Math.sin(L.yaw), fz = Math.cos(L.yaw); let best = null, bs = 1e9;
    for (const it of INTERACT.concat(dynamicInteractables())) { if (it.room && World.locked[it.room]) continue; const dx = it.pos.x - pos.x, dz = it.pos.z - pos.z, d = Math.hypot(dx, dz); if (d > it.r + 1.0) continue; const ang = d < 0.5 ? 0 : Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d))); if (ang > 0.5) continue; const sc = ang * 2 + d * 0.25; if (sc < bs) { bs = sc; best = it; } }
    return best; }
  let best = null, bd = 1e9; for (const it of INTERACT.concat(dynamicInteractables())) { if (forCoop && !it.coop) continue; if (it.room && World.locked[it.room]) continue; const d = Math.hypot(it.pos.x - pos.x, it.pos.z - pos.z); if (d < it.r && d < bd) { bd = d; best = it; } } return best;
}
function gate(pos) {
  const room = World.roomAt(pos.x, pos.z);
  if (room === "or" && G.s.outfit === "clinic") { if (performance.now() - G.gateToast > 2500) { G.gateToast = performance.now(); Sound.error(); toast(`${icon("block", 18)} <b>Sterile zone.</b> Change into scrubs, cap and mask at the locker in the prep room.`, "warn", 3500); award("blocked"); } return true; }
  if (room && World.locked[room]) { if (performance.now() - G.gateToast > 2500) { G.gateToast = performance.now(); toast(`${icon("block", 18)} This room is for sale — buy the expansion from the office desk.`, "warn", 3000); } return true; }
  return false;
}
function tick() {
  requestAnimationFrame(tick);
  const nowR = performance.now(); const rd = Math.min(250, nowR - (G.lastReal || nowR)); G.lastReal = nowR; if (!G.paused) G.gameTime += rd;
  const night = G.s.shiftActive && G.s.clockMin >= 18 * 60;
  const res = World.update(G.input, { frozen: G.panelOpen || G.paused || G.ho, paused: G.paused, gate, night, input2: G.s.settings.coop ? G.input2 : null, speedMult: G.s.energy < 40 ? 0.85 : 1 });
  if (typeof Bubbles !== "undefined") Bubbles.update();
  if (G.paused) return;
  const dt = res.dt; const pos = res.pos;
  if (res.moving) { G.stepT = (G.stepT || 0) + dt; if (G.stepT > 0.32) { G.stepT = 0; Sound.step(); } }
  const room = World.roomAt(pos.x, pos.z); if (room !== G.lastRoom) { G.lastRoom = room; $("#hudRoom").textContent = room ? (ROOMS[room] ? ROOMS[room].name : "Outside") : ""; if (room === "or" && G.s.settings.music && Sound.music.on && Sound.music.kind !== "or") Sound.music.start("or"); if (room !== "or" && Sound.music.on && Sound.music.kind === "or") Sound.music.start("lobby"); }
  if (typeof thoughtTick === "function") thoughtTick(dt);
  if (G.s.shiftActive && !G.panelOpen) {
    G.s.clockMin += dt * (typeof tutActive === "function" && tutActive() ? 0.35 : 1); updateClockOnly(); energy(-dt * (0.022 + (G.input.run && res.moving ? 0.03 : 0)) * (G.s.fitDay === G.s.day ? 0.75 : 1)); const cp = G.s.clinicPet; cp.hunger = Math.min(100, cp.hunger + dt * 100 / 560); if (cp.hunger > 75 && !G.petHungryToast) { G.petHungryToast = true; toast(`${icon(cp.species, 16)} ${cp.name} is hungry — the bowl is by the pet bed in reception.`, "warn", 4000); World.catMood("sad"); World.catWander([0.6, -10.9]); } if (cp.hunger <= 45) G.petHungryToast = false; if (G.s.energy <= 5 && !G.exhausted) { G.exhausted = true; toast("You're exhausted. Finish the shift and go home to sleep.", "warn", 6000); }
    const ev = G.s.event ? EVENTS.find(e => e.id === G.s.event.id) : null; const rush = (ev && ev.rush) || 1; const rival = G.s.story.rival && G.s.rep < 4 ? 0.65 : 1; const hourRush = (G.s.clockMin > 10 * 60 && G.s.clockMin < 12 * 60) || (G.s.clockMin > 16 * 60 && G.s.clockMin < 17.5 * 60) ? 1.6 : 1;
    const inClinic = G.patients.filter(p => p.status !== "done").length; const waiting = G.patients.filter(p => ["arriving", "at_desk", "waiting"].includes(p.status)).length;
    const ds = difficultyScale(); const maxIn = 2 + Math.round(ds * 3), maxWait = 1 + Math.round(ds * 2) + (G.s.staff.some(x => x.role === "receptionist") ? 1 : 0);
    if (!G.s.closing && !(typeof tutActive === "function" && tutActive())) G.spawnTimer -= dt * rush * rival * hourRush * (0.75 + G.s.rep * 0.1) * (0.7 + ds * 0.6);
    if (G.spawnTimer <= 0 && !G.s.closing) { G.spawnTimer = rnd(75, 120) * (1 - ds * 0.4); if (G.weeklyMode && G.weeklyQueue && G.weeklyQueue.length) { if (inClinic < 4) spawnPatient(G.weeklyQueue.shift()); } else if (night) { if (inClinic < 2 && Math.random() < 0.6) { const c = pick(CASES.filter(x => x.emergency && eligibleCases().includes(x))); if (c) { const p = spawnPatient(c); if (p) p.night = true; } } } else if (inClinic < maxIn && waiting < maxWait && G.s.clockMin < 17.5 * 60) { let c = null; if (G.s.day >= 5 && G.s.day % 7 === 0 && !G.s.dayStats.mystery) { const m = pick(CASES.filter(x => x.mystery && x.level <= G.s.level)); if (m) { c = m; G.s.dayStats.mystery = 1; } } if (!c && G.s.story.charity && Math.random() < 0.15) { c = CASES.find(x => x.id === "spay_cat"); const p = spawnPatient(c); if (p) { p.charity = true; p.ownerName = "Shelter volunteer"; } } else { const p = spawnPatient(c); if (p && G.s.story.referral && p.caseDef.outcome === "surgery" && Math.random() < 0.4) { p.referral = true; toast("Referral case — higher fee, higher stakes.", "info"); } } } }
    if (!(typeof tutActive === "function" && tutActive())) G.shopTimer -= dt; if (G.shopTimer <= 0) { G.shopTimer = rnd(60, 110); if (!G.shopCustomer) spawnShopCustomer(); }
    // emergency countdowns
    G.patients.forEach(p => { if (p.emergency && !["exam_ready"].includes(p.status) && p.emergencyLeft > 0) { p.emergencyLeft -= dt; if (p.emergencyLeft <= 0) { p.emergency = false; p.deteriorated = true; p.mistakes++; rep(-0.25, `${p.name} deteriorated while waiting`); p.record.push(`${clockStr()} — Deteriorated before treatment (delay).`); p.caseDef = Object.assign({}, p.caseDef, { fee: Math.round(p.caseDef.fee * 0.5) }); } else if (Math.floor(p.emergencyLeft) % 30 === 0 && Math.random() < dt * 2) Sound.alarm(); } });
    staffTick(dt);
    if (G.shopCustomer) { G.shopCustomer.t += dt; if (G.shopCustomer.t > 240) { G.shopCustomer = null; rep(-0.03, "shop customer left unserved"); } }
    if (G.s.clockMin >= 18 * 60 && !G.closingWarned) { G.closingWarned = true; toast(`${icon("moon", 18)} 18:00 — after-hours mode: only emergencies arrive (×1.5 fee). End the shift at the board when ready.`, "info", 6000); if (G.s.settings.music) Sound.music.start("night"); }
    if (Math.random() < dt * 0.02) updateHUD();
  }
  if (typeof phoneTick === "function") { phoneTick(dt); walkTick(dt); } if (typeof storyTick === "function") storyTick();
  G.needsT = (G.needsT || 0) + dt; if (G.needsT > 1) { G.needsT = 0; if (typeof updateNeeds === "function") updateNeeds(); }
  G.catTimer -= dt; if (G.catTimer <= 0) { const per = G.s.clinicPet.personality; G.catTimer = per === "playful" ? rnd(15, 30) : per === "lazy" ? rnd(70, 120) : rnd(35, 70); if (G.s.clinicPet.hunger > 75) World.catWander([0.6, -10.9]); else if (per === "curious" && Math.random() < 0.5) { const pp = World.playerPos(); World.catWander([pp.x + 0.8, pp.z + 0.6]); } else World.catWander(); }
  const it = G.panelOpen ? null : nearestInteractable(pos); G.nearest = it; if (G.tapWp && (performance.now() - G.tapWp > 25000 || (it && G.nearest && !G.panelOpen && performance.now() - G.tapWp > 400 && Math.hypot(pos.x - (G.tapWpPos ? G.tapWpPos.x : 1e9), pos.z - (G.tapWpPos ? G.tapWpPos.z : 1e9)) < 2.2))) { G.tapWp = 0; if (!(typeof tutActive === "function" && tutActive()) && !G.walk) World.setWaypoint(null); }
  if (World.camMode === "first") $("#crosshair").classList.toggle("hit", !!it);
  const pr = $("#prompt"); if (it && !G.ho) { pr.classList.add("show"); pr.querySelector("span").textContent = it.label(); World.setRing(it.pos); } else { pr.classList.remove("show"); World.setRing(null); }
  if (G.s.settings.coop) { const p2 = World.player2Pos(); G.nearest2 = p2 && !G.panelOpen ? nearestInteractable(p2, true) : null; }
}
const POSES = { examTable: ["exam", 6.5, -7], orTable: ["exam", 7, 6.5], prepTable: ["exam", 0, 5.5], dentalTable: ["exam", 19.5, -7], wardTable: ["exam", 19.5, 6.5], microscope: ["exam", -12.6, 11.4], xrayTable: ["reach", 13.5, 6.5], desk: ["reach", -5, -6.5], pharmacy: ["reach", -5.5, 5.5], counter: ["reach", -17, -4.5], analyser: ["reach", -9.6, 11.4], bookshelf: ["reach", -20.6, 7], bowl: ["reach", 0.6, -10.9], officeDesk: ["think", -17.5, 6.5], autoclave: ["reach", 2.5, 3.2] };
/* touch: the finger-lift after a tap sends a "click" to whatever just appeared under it — swallow that one */
function swallowGhostClick(ms = 500) { G.noClickUntil = performance.now() + ms; }
document.addEventListener("click", (e) => { if (G.noClickUntil && performance.now() < G.noClickUntil) { G.noClickUntil = 0; e.preventDefault(); e.stopPropagation(); } }, true);
/* tap / click an object in the 3D view to use it (replaces the big Interact button) */
function tapWorld(x, y) {
  if (G.panelOpen || G.ho || G.paused || World.camMode === "first") return false;
  const pos = World.playerPos(); let best = null, bd = 1e9;
  for (const it of INTERACT.concat(dynamicInteractables())) { if (it.room && World.locked && World.locked[it.room]) continue; const s = World.project(it.pos.x, it.y || 0.8, it.pos.z); if (!s || s.behind) continue; const d = Math.hypot(s.x - x, s.y - y); const reach = Math.hypot(it.pos.x - pos.x, it.pos.z - pos.z); const sc = d + reach * 4; if (d < 80 && sc < bd) { bd = sc; best = it; } }
  if (!best) return false;
  const reach = Math.hypot(best.pos.x - pos.x, best.pos.z - pos.z);
  if (reach <= best.r + 0.6) { G.nearest = best; const was = G.panelOpen || G.ho; interact(best); if (!was && (G.panelOpen || G.ho)) swallowGhostClick(); return true; }
  World.setWaypoint({ x: best.pos.x, z: best.pos.z }); G.tapWp = performance.now(); G.tapWpPos = { x: best.pos.x, z: best.pos.z }; toast(`Walk to ${String(best.label()).split(" — ")[0].toLowerCase().replace(/^(call|pet) /, "$1 ")} — follow the marker.`, "info", 2200); return true;
}
function interact() { if (G.panelOpen || G.ho || !G.nearest) return; Sound.init(); Sound.vibrate(15); const it = G.nearest; if (typeof hoEnter === "function" && hoEnter(it)) return; it.action(); const ps = POSES[it.id]; if (ps && G.panelOpen) World.setPlayerPose(ps[0], { x: ps[1], z: ps[2] }); }
function interact2() { if (G.panelOpen || !G.nearest2) return; Sound.init(); G.nearest2.action(); }

function bindInput() {
  const map = { KeyW: "up", ArrowUp: "up", KeyS: "down", ArrowDown: "down", KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right" };
  const map2 = { KeyI: "up2", KeyK: "down2", KeyJ: "left2", KeyL: "right2" };
  const recompute = () => { G.input.x = (G.keys.right ? 1 : 0) - (G.keys.left ? 1 : 0); G.input.z = (G.keys.down ? 1 : 0) - (G.keys.up ? 1 : 0); G.input2.x = (G.keys.right2 ? 1 : 0) - (G.keys.left2 ? 1 : 0); G.input2.z = (G.keys.down2 ? 1 : 0) - (G.keys.up2 ? 1 : 0); };
  addEventListener("keydown", (e) => { Sound.init(); if (e.target.matches("input,textarea,select")) return; if (map[e.code]) { G.keys[map[e.code]] = true; recompute(); e.preventDefault(); } if (map2[e.code] && G.s.settings.coop) { G.keys[map2[e.code]] = true; recompute(); } if (e.code === "ShiftLeft" || e.code === "ShiftRight") G.input.run = true; if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter") { e.preventDefault(); interact(); } if (e.code === "KeyU" && G.s.settings.coop) interact2(); if (e.code === "Escape") { if (G.panelOpen) { if ($("#panelClose").style.display !== "none") closePanel(); } else togglePause(); } if (e.code === "KeyH") { if (!G.panelOpen) uiHelp(); } if (e.code === "KeyM") toggleMute(); if (e.code === "KeyV") toggleCamera(); if (e.code === "KeyP") photoMode(); if (e.code === "KeyO") { if (!G.panelOpen) uiSettings(); } });
  addEventListener("keyup", (e) => { if (map[e.code]) { G.keys[map[e.code]] = false; recompute(); } if (map2[e.code]) { G.keys[map2[e.code]] = false; recompute(); } if (e.code === "ShiftLeft" || e.code === "ShiftRight") G.input.run = false; });
  addEventListener("blur", () => { G.keys = {}; recompute(); G.input.run = false; });
  { const cvs = $("#c"); let d0 = null; cvs.addEventListener("pointerdown", (e) => { d0 = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; }); cvs.addEventListener("pointerup", (e) => { if (!d0 || e.pointerId !== d0.id) return; const ok = performance.now() - d0.t < 300 && Math.hypot(e.clientX - d0.x, e.clientY - d0.y) < 10; d0 = null; if (ok) tapWorld(e.clientX, e.clientY); }); }
  $("#prompt").onclick = interact; $("#panelClose").onclick = closePanel;
  $("#gearBtn").onclick = (e) => { e.stopPropagation(); const open = $("#gearMenu").classList.contains("hidden"); closeMenus(); $("#gearMenu").classList.toggle("hidden", !open); syncMenuClass(); };
  $("#gearMenu").addEventListener("click", () => setTimeout(() => { $("#gearMenu").classList.add("hidden"); syncMenuClass(); }, 0));
  $("#statusPill").onclick = (e) => { e.stopPropagation(); const open = $("#statusSheet").classList.contains("hidden"); closeMenus(); $("#statusSheet").classList.toggle("hidden", !open); syncMenuClass(); if (open) renderActivity(); };
  $("#sheetClose").onclick = () => { $("#statusSheet").classList.add("hidden"); syncMenuClass(); };
  $("#mapBtn").onclick = () => { if (!G.panelOpen) uiMap(); };
  $("#c").addEventListener("pointerdown", closeMenus);
  $("#helpBtn").onclick = () => { if (!G.panelOpen) uiHelp(); }; $("#muteBtn").onclick = toggleMute; $("#camBtn").onclick = toggleCamera; $("#setBtn").onclick = () => { if (!G.panelOpen) uiSettings(); else closePanel(); }; $("#photoBtn").onclick = photoMode; $("#pauseBtn").onclick = () => togglePause(); bindLookStick();
  bindJoystick();
  const pad = $("#dpad"); if (pad) pad.querySelectorAll("button").forEach(b => { const d = b.dataset.d; const on = (e) => { e.preventDefault(); Sound.init(); if (d === "act") return interact(); G.keys[d] = true; recompute(); }; const off = (e) => { e.preventDefault(); G.keys[d] = false; recompute(); }; b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off); });
  const act = $("#actBtn"); if (act) act.addEventListener("pointerdown", (e) => { e.preventDefault(); Sound.init(); const was = G.panelOpen || G.ho; interact(); if (!was && (G.panelOpen || G.ho)) swallowGhostClick(); });
  G.touch = matchMedia("(pointer:coarse)").matches || "ontouchstart" in window;
  if (G.touch) { if (act) act.classList.add("show"); $("#prompt kbd").innerHTML = icon("hand", 16); applyControlMode(); }
  addEventListener("touchstart", () => Sound.init(), { once: true, passive: true }); addEventListener("touchend", () => Sound.init(), { passive: true }); addEventListener("pointerup", () => Sound.init(), { passive: true });
  $("#c").addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
  let lastTouch = 0; addEventListener("touchend", (e) => { const now = Date.now(); if (now - lastTouch < 320 && !e.target.closest("#panel")) e.preventDefault(); lastTouch = now; }, { passive: false });
}
function applyControlMode() { const mode = G.s.settings.controls || "joystick"; const pad = $("#dpad"), zone = $("#joyZone"); if (!G.touch) { pad.classList.remove("show"); zone.classList.remove("show"); return; } pad.classList.toggle("show", mode === "dpad"); zone.classList.toggle("show", mode === "joystick"); }
function bindJoystick() {
  const zone = $("#joyZone"), base = $("#joyBase"), knob = $("#joyKnob"); if (!zone) return; let active = null, cx = 0, cy = 0, t0 = 0, moved = 0; const R = 52;
  const setVec = (dx, dy) => { const d = Math.hypot(dx, dy); const k = d > R ? R / d : 1; knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`; const nx = dx * k / R, nz = dy * k / R; const mag = Math.hypot(nx, nz); G.input.x = mag < 0.15 ? 0 : nx; G.input.z = mag < 0.15 ? 0 : nz; G.input.run = mag > 0.92; };
  zone.addEventListener("pointerdown", (e) => { if (active !== null && !e.isPrimary) return; active = e.pointerId; cx = e.clientX; cy = e.clientY; t0 = performance.now(); moved = 0; try { zone.setPointerCapture(e.pointerId); } catch (err) { } Sound.init(); zone.classList.add("used"); const r = zone.getBoundingClientRect(); base.style.left = (cx - r.left) + "px"; base.style.top = (cy - r.top) + "px"; base.classList.add("on"); setVec(0, 0); e.preventDefault(); });
  zone.addEventListener("pointermove", (e) => { if (e.pointerId !== active) return; moved = Math.max(moved, Math.hypot(e.clientX - cx, e.clientY - cy)); setVec(e.clientX - cx, e.clientY - cy); });
  const end = (e) => { if (e.pointerId !== active) return; active = null; base.classList.remove("on"); G.input.x = 0; G.input.z = 0; G.input.run = false; knob.style.transform = ""; if (e.type === "pointerup" && performance.now() - t0 < 260 && moved < 12) tapWorld(e.clientX, e.clientY); };
  zone.addEventListener("pointerup", end); zone.addEventListener("pointercancel", end); zone.addEventListener("lostpointercapture", end);
  window.__joyReset = () => { active = null; base.classList.remove("on"); G.input.x = 0; G.input.z = 0; G.input.run = false; knob.style.transform = ""; };
}
function closeMenus() { const g = $("#gearMenu"), st = $("#statusSheet"); if (g) g.classList.add("hidden"); if (st) st.classList.add("hidden"); document.body.classList.remove("menu-open"); }
function syncMenuClass() { const open = !$("#gearMenu").classList.contains("hidden") || !$("#statusSheet").classList.contains("hidden"); document.body.classList.toggle("menu-open", open); }
function renderActivity() { const el = $("#activityLog"); if (!el) return; el.innerHTML = G.log.slice(0, 25).map(l => `<li class="${l.kind}"><em>${l.t}</em> ${l.msg}</li>`).join("") || "<li class='muted'>Nothing yet today.</li>"; }
function toggleMute() { const m = Sound.toggleMute(); $("#muteBtn .gi").innerHTML = icon(m ? "mute" : "sound", 20); $("#muteBtn .gl").textContent = m ? "Sound off" : "Sound"; toast(m ? icon("mute", 18) + " Muted" : icon("sound", 18) + " Sound on", "info", 1200); }
function toggleCamera() { const m = World.setCamMode(World.camMode === "third" ? "first" : "third"); G.s.settings.camMode = m; if (typeof updateFPUI === "function") updateFPUI(); toast(m === "first" ? `${icon("camera", 18)} First person — ${G.touch ? "drag on the screen to look around" : "move the mouse (click the game to lock the cursor)"}; V switches back.` : `${icon("camera", 18)} Third person.`, "info", 3500); save(); }
function applySettingsToWorld() { const st = G.s.settings; World.setLookOptions({ sens: st.lookSens || 1, bob: st.headBob !== false && !st.reduceMotion }); document.body.classList.toggle("reduce-motion", !!st.reduceMotion); if (typeof applyControlMode === "function") applyControlMode(); if (typeof updateFPUI === "function") setTimeout(updateFPUI, 0); document.documentElement.style.setProperty("--fs", st.textSize); document.documentElement.dir = st.lang === "ar" ? "rtl" : "ltr"; document.body.classList.toggle("rtl", st.lang === "ar"); document.body.classList.toggle("onehand-right", st.oneHand === "right"); World.setCamMode(st.camMode || "third"); World.enableCoop(!!st.coop); World.applyAvatar(st.avatarApplied ? G.s.avatar : G.s.avatar); $("#coopHint").style.display = st.coop ? "" : "none"; }

function boot() {
  G.s = load();
  if (typeof THREE === "undefined") { $("#loading").innerHTML = "<h2>Could not load the 3D engine</h2><p>Three.js did not load (offline or blocked). Check your connection and reload.</p>"; return; }
  World.init($("#c")); applyTheme(); World.setSign(G.s.clinicName); applyDoctor(); applyClinicPet(); World.setOutfit("clinic"); G.s.expansions.forEach(e => World.setLocked(e, false)); World.showThankCards(G.s.thankCards); rebuildStaffNPCs(); applySettingsToWorld();
  bindInput(); updateHUD(); $("#loading").classList.add("hidden"); registerSW();
  if (typeof initPhone === "function") initPhone();
  if (typeof applyVolumes === "function") applyVolumes();
  if (typeof restorePatients === "function") restorePatients();
  if (!G.s.seenTutorial) { G.s.seenTutorial = true; save(); if (typeof Tut !== "undefined" && G.s.day === 1 && !G.s.patientsSeen) Tut.offer(); else uiHelp(); } else if (!(typeof tutActive === "function" && tutActive())) dailyBriefing();
  tick();
}
window.addEventListener("DOMContentLoaded", () => { try { boot(); } catch (e) { console.error(e); const el = document.getElementById("loading"); if (el) el.innerHTML = `<div><h2>Something went wrong while starting</h2><p class="muted">${String(e && e.message || e)}</p><p>Your progress is safe in this browser. Try reloading; if it keeps failing, an update may be half-loaded.</p><div class="btnrow" style="justify-content:center"><button class="btn primary" onclick="location.reload()">Reload</button><button class="btn" onclick="navigator.serviceWorker&&navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))).then(()=>caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k))))).then(()=>location.reload())">Clear cache & reload</button></div></div>`; } });
