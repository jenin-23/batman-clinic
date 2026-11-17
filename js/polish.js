/* =====================================================================
   Batman Clinic — polish: medical glossary, case recap card,
   patient autosave/restore, comfort settings (volumes, haptics).
   ===================================================================== */

/* ---------------- glossary: tap a medical word ---------------- */
const GLOSSARY = {
  "CRT": "Capillary refill time — press the gum white and count until it is pink again. Under 2 s is normal.",
  "BCS": "Body condition score, 1–9. 4–5 is ideal; you should feel the ribs with light pressure.",
  "TPR": "Temperature, pulse and respiration — the three basic vital signs.",
  "ETCO₂": "End-tidal CO₂ — carbon dioxide in each breath out. 35–45 mmHg is normal under anaesthesia.",
  "SpO₂": "Oxygen saturation from the pulse oximeter. Keep it above 95 %.",
  "MAP": "Mean arterial pressure. Below 60 mmHg the kidneys and brain are not getting enough blood.",
  "IPPV": "Intermittent positive-pressure ventilation — breathing for the patient by squeezing the bag or using a ventilator.",
  "NSAID": "Non-steroidal anti-inflammatory drug (e.g. meloxicam). Treats pain and inflammation; never combine with steroids.",
  "ASA": "Anaesthetic risk grade from 1 (healthy) to 5 (not expected to survive without surgery).",
  "IVDD": "Intervertebral disc disease — a slipped disc pressing on the spinal cord.",
  "TPLO": "Tibial plateau levelling osteotomy — the standard surgery for cruciate rupture in large dogs.",
  "GDV": "Gastric dilatation-volvulus — a bloated, twisted stomach. A surgical emergency.",
  "MBD": "Metabolic bone disease — soft bones from lack of UVB light and calcium (reptiles).",
  "PCV": "Packed cell volume — the percentage of blood that is red cells. Low = anaemia.",
  "T4": "Thyroxine, the thyroid hormone. High in hyperthyroid cats.",
  "cPL": "Pancreatic lipase test — raised in pancreatitis.",
  "IRIS": "International Renal Interest Society — the staging system for kidney disease.",
  "VPC": "Ventricular premature complex — an extra beat starting in the ventricles.",
  "pyometra": "A womb full of pus in an unspayed female. Life-threatening; usually treated by spaying.",
  "murmur": "A whooshing heart sound from turbulent blood flow, graded I (faint) to VI (loudest).",
  "gallop": "An extra heart sound (three beats instead of two) — common in hyperthyroid cats and heart disease.",
  "palpebral": "The blink reflex when you touch the eyelid corner — used to judge anaesthetic depth.",
  "plantigrade": "Walking flat on the hocks — a sign of diabetic nerve damage in cats.",
  "nystagmus": "Rhythmic flicking of the eyes — a sign of a balance (vestibular) problem.",
  "fluorescein": "Orange stain that turns green on any spot where the cornea's surface is missing (an ulcer).",
  "Schirmer": "Tear test — a paper strip measures tear production in one minute (15+ mm is normal).",
  "fructosamine": "Blood test reflecting average glucose over 1–3 weeks — separates diabetes from stress.",
  "azotaemia": "High urea and creatinine in the blood — the kidneys are not clearing waste.",
  "gastropexy": "Stitching the stomach to the body wall so it cannot twist again.",
  "ovocentesis": "Draining a stuck egg with a needle so it can collapse and pass.",
  "coelom": "A bird's (or reptile's) single body cavity — no diaphragm separating chest and belly.",
  "keel": "The bird's breastbone ridge. Feel the muscle on each side to judge body condition.",
  "ventriculus": "A bird's muscular stomach (gizzard).",
  "crop": "A pouch in a bird's neck where food is stored before digestion.",
  "Malassezia": "A yeast that commonly causes itchy, smelly ear infections in dogs.",
  "otitis": "Inflammation or infection of the ear.",
  "haematoma": "A pocket of blood under the skin or between tissue layers.",
  "recumbency": "The position an animal lies in: lateral (on its side), dorsal (on its back), sternal (on its chest).",
  "cranial": "Towards the head.", "caudal": "Towards the tail.",
  "auscultation": "Listening to the heart, lungs and gut with a stethoscope.",
  "palpation": "Examining by feeling with your hands.",
  "Doppler": "An ultrasound probe that turns blood flow into sound — used to hear the heart in tortoises and small birds.",
  "laparotomy": "Opening the abdomen surgically.", "celiotomy": "Opening the abdomen surgically (same as laparotomy).",
  "bradycardia": "A slow heart rate.", "tachycardia": "A fast heart rate.",
  "hypothermia": "Body temperature too low — the most common anaesthetic complication.",
  "cystotomy": "Opening the bladder to remove stones.", "ligature": "A tie of suture around a vessel to stop bleeding."
};
const GL_RX = new RegExp("\\b(" + Object.keys(GLOSSARY).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")(?![\\w])", "g");
function glossify(root) {
  if (!root || G.s && G.s.settings && G.s.settings.glossary === false) return; const seen = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (!n.nodeValue.trim() || n.parentElement.closest("button, a, input, textarea, select, svg, .gl, script, style")) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => { const t = n.nodeValue; GL_RX.lastIndex = 0; if (!GL_RX.test(t)) return; GL_RX.lastIndex = 0; const frag = document.createDocumentFragment(); let last = 0, m;
    while ((m = GL_RX.exec(t))) { const term = m[1]; if (seen.has(term)) continue; seen.add(term); frag.appendChild(document.createTextNode(t.slice(last, m.index))); const sp = document.createElement("span"); sp.className = "gl"; sp.dataset.t = term; sp.textContent = term; frag.appendChild(sp); last = m.index + term.length; }
    if (last === 0) return; frag.appendChild(document.createTextNode(t.slice(last))); n.parentNode.replaceChild(frag, n); });
}
document.addEventListener("click", (e) => {
  const g = e.target.closest && e.target.closest(".gl"); let tip = document.getElementById("glTip");
  if (!g) { if (tip) tip.classList.add("hidden"); return; }
  e.stopPropagation(); if (!tip) { tip = document.createElement("div"); tip.id = "glTip"; document.body.appendChild(tip); }
  tip.innerHTML = `<b>${g.dataset.t}</b> — ${GLOSSARY[g.dataset.t] || ""}`; tip.classList.remove("hidden");
  const r = g.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(innerWidth - 290, r.left)) + "px"; tip.style.top = (r.bottom + 6 + tip.offsetHeight > innerHeight ? r.top - tip.offsetHeight - 6 : r.bottom + 6) + "px";
}, true);

/* ---------------- case recap card ---------------- */
function showRecap(p) {
  if (!p || G.s.settings.recap === false) return; const c = p.caseDef; const lines = [];
  const plan = String(c.options[c.correct]).split(/[:—]/)[0];
  if (p.dxOk === true) lines.push(`<li class="ok">${icon("check", 14)} Right call: ${plan}.</li>`); else if (p.dxOk === false) lines.push(`<li class="bad">${icon("warn", 14)} The plan needed correcting — it was ${plan}.</li>`);
  const found = []; if (p.murmurFound) found.push("the heart murmur"); if (p.secondaryFound && p.secondary) found.push(p.secondary.split("—")[0].trim()); if (p.calcDone) found.push("the toxic dose"); if (p.xray) found.push("the radiograph finding");
  if (found.length) lines.push(`<li class="ok">${icon("check", 14)} You found ${found.join(", ")}.</li>`);
  const missed = []; if (p.hidden && p.hidden.murmur && !p.murmurFound) missed.push("a soft heart murmur (listen low on the left chest)"); if (p.secondary && !p.secondaryFound) missed.push(p.secondary.split("—")[0].trim()); if (p.mistakes) missed.push(`${p.mistakes} mistake${p.mistakes > 1 ? "s" : ""} on the record`);
  const skipped = Object.keys(p.examDone || {}).filter(k => (p.record || []).some(r => r.includes(`${(EXAM_STEPS.find(s => s.id === k) || {}).label}: done by the nurse`))).length; if (skipped) missed.push(`${skipped} test${skipped > 1 ? "s" : ""} done by the nurse`);
  lines.push(missed.length ? `<li class="bad">${icon("warn", 14)} Missed: ${missed.join("; ")}.</li>` : `<li class="ok">${icon("check", 14)} Nothing missed — clean case.</li>`);
  const learn = (String(c.why || "").split(". ")[0].replace(/\.$/, "") + ".").replace(/^\.$/, "");
  let card = document.getElementById("recap"); if (!card) { card = document.createElement("div"); card.id = "recap"; document.body.appendChild(card); }
  card.innerHTML = `<div class="rhead"><b>${icon("folder", 16)} Case recap — ${p.name}</b><button aria-label="Close" onclick="document.getElementById('recap').classList.add('hidden')">✕</button></div><ul>${lines.join("")}</ul>${learn ? `<p class="small muted">${learn}</p>` : ""}<div class="btnrow tight"><button class="btn small" onclick="printRecap(${p.id}, '${String(p.name).replace(/'/g, "")}')">${icon("print", 14)} Save as PDF</button></div>`;
  glossify(card); card.classList.remove("hidden"); clearTimeout(G.recapT); G.recapT = setTimeout(() => card.classList.add("hidden"), 14000);
}
function printRecap(id, name) { const list = G.s.cases.filter(x => x.id === id && x.name === name); const c = list[list.length - 1]; if (!c) return; $("#printArea").innerHTML = caseHTML(c); try { window.print(); } catch (e) { toast("Printing is blocked here — use Office → Cases.", "warn"); } }

/* ---------------- autosave: patients survive a reload ---------------- */
const SNAP_SKIP = new Set(["npc", "caseDef", "client", "petRec"]);
function snapshotPatients() {
  if (!G.s || !G.s.shiftActive || !G.patients) return [];
  return G.patients.filter(p => !["leaving", "done", "arriving"].includes(p.status)).map(p => { const o = {}; for (const k in p) { if (SNAP_SKIP.has(k)) continue; const v = p[k]; if (typeof v === "function" || v === undefined) continue; o[k] = v; } o.caseId = p.caseDef.id; o.clientName = p.client ? p.client.ownerName : null; return o; });
}
function restorePatients() {
  const list = G.s.active; G.restoreDone = true; if (!Array.isArray(list) || !list.length || !G.s.shiftActive) { G.s.active = []; return; } let n = 0; G.restoring = true; G.spawnTimer = 25; G.shopTimer = 25; G.closingWarned = false; G.weeklyMode = false; G.s.dayStats = G.s.dayStats || {};
  list.forEach(q => { try {
    const c = CASES.find(x => x.id === q.caseId); if (!c) return; const p = spawnPatient(c); if (!p) return; p.restored = true; World.removeNPC(p.npc);
    for (const k in q) if (!["caseId", "clientName", "id", "seat", "arrivedReal"].includes(k)) p[k] = q[k];
    p.caseDef = c; p.client = q.clientName ? (G.s.clients.find(cl => cl.ownerName === q.clientName) || null) : null; p.arrivedReal = gameNow();
    p.npc = World.addNPC(Object.assign({ x: -5, z: -8.5 }, p.npcCfg)); if (typeof hoSymptomsFor === "function" && p.npc.pet) World.setSymptoms(p.npc.pet, hoSymptomsFor(p)); p.npc.path = []; p.npc.onArrive = null;
    const st = p.status; const own = p.npc.rig.group;
    if (st === "exam_ready" || st === "to_exam") { World.placePet(p.npc, 6.5, 1.0, -7, Math.PI / 2); own.position.set(7.4, 0, -6.1); p.status = "exam_ready"; }
    else if (st === "xray_ready" || st === "to_xray") { World.placePet(p.npc, 13.5, 0.95, 6.5, Math.PI / 2); own.position.set(15.3, 0, 7.5); p.status = "xray_ready"; }
    else if (st === "dental_ready" || st === "to_dental") { World.placePet(p.npc, 19.5, 1.0, -7, Math.PI / 2); own.position.set(20.5, 0, -5.8); p.status = "dental_ready"; }
    else if (st === "ward_ready" || st === "to_ward") { World.placePet(p.npc, 19.5, 1.0, 6.5, Math.PI / 2); own.position.set(21, 0, 7.5); p.status = "ward_ready"; }
    else if (st === "preop" || st === "to_prep") { World.placePet(p.npc, 0, 0.95, 5.5, Math.PI / 2); own.visible = false; p.status = "preop"; }
    else if (st === "ready_or") { World.placePet(p.npc, 7, 1.0, 6.5, Math.PI / 2); own.visible = false; }
    else if (st === "recovery") { World.placePet(p.npc, 10, 0.25, 11.3, Math.PI); own.visible = false; }
    else { own.position.set(-5, 0, -8.5); p.status = "at_desk"; if (p.greeted) seatPatient(p); }
    n++;
  } catch (e) { console.warn("restore failed", e); } });
  G.restoring = false; if (n) setTimeout(() => toast(`${icon("check", 16)} ${n} patient${n > 1 ? "s" : ""} restored exactly where you left ${n > 1 ? "them" : "it"}.`, "good", 3500), 1200); updateHUD();
}
window.addEventListener("pagehide", () => { try { save(); } catch (e) { } });
document.addEventListener("visibilitychange", () => { if (document.hidden) try { save(); } catch (e) { } });

/* ---------------- comfort: volumes & haptics ---------------- */
function applyVolumes() { const v = (G.s.settings.vol || {}); ["fx", "clin", "mon", "music"].forEach(k => Sound.setVol(k, v[k] === undefined ? 1 : v[k])); }
function setVolume(k, val) { G.s.settings.vol = G.s.settings.vol || {}; G.s.settings.vol[k] = +val; applyVolumes(); if (k === "mon") Sound.pulseOx(98); if (k === "clin") Sound.heart({ vol: 0.6 }); if (k === "fx") Sound.click(); clearTimeout(G.volSave); G.volSave = setTimeout(save, 500); }
function volumeHTML() { const v = G.s.settings.vol || {}; const row = (k, l) => `<label class="volrow"><span>${l}</span><input type="range" min="0" max="1" step="0.05" value="${v[k] === undefined ? 1 : v[k]}" oninput="setVolume('${k}', this.value)"></label>`; return `<h4>Volume</h4>${row("music", "Music")}${row("clin", "Heart, lungs & purring")}${row("mon", "Anaesthesia monitor")}${row("fx", "Effects & animals")}`; }
