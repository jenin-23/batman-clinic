/* ============================================================
   FIRST-DAY TUTORIAL — a step-by-step coach for day 1.
   Steps advance on their own when the player does the thing.
   A gold marker shows where to walk; on-screen buttons pulse.
   ============================================================ */
const TUT_TOUCH = () => matchMedia("(pointer:coarse)").matches;
const TUT_ACT = () => TUT_TOUCH() ? "<b>tap it</b> (or the name label at the bottom)" : "<b>click it</b> or press <b>E</b>";
function tutP() { const t = G.s.tut; if (!t) return null; return G.patients.find(p => p.id === t.pid) || null; }
function tutIt(id) { return INTERACT.find(x => x.id === id); }
function tutPlanTarget(p) {
  if (!p) return null; const st = p.status;
  if (p.rx && !p.rxDone && ["to_desk", "ready_discharge", "recovery"].includes(st)) return { id: "pharmacy", text: `First fill ${p.name}'s prescription: walk to the <b>Pharmacy</b> (follow the marker) and ${TUT_ACT()}.` };
  const map = { xray_ready: ["xrayTable", "Take the radiograph: walk to the <b>X-ray table</b>"], to_xray: ["xrayTable", `${p.name} is going to <b>X-ray</b>. Follow the marker`], preop: ["prepTable", "Get the patient ready: walk to the <b>Prep table</b>"], to_prep: ["prepTable", "Head to the <b>Prep room</b>"], ready_or: ["orTable", "Time for surgery: walk to the <b>Operating table</b>"], recovery: ["kennel", "Check the patient in the <b>Recovery kennel</b>"], dental_ready: ["dentalTable", "Walk to the <b>Dental table</b>"], ward_ready: ["wardTable", "Walk to the <b>Ward table</b>"], to_desk: ["desk", `${p.name} is walking back to <b>Reception</b>. Meet them at the desk`], ready_discharge: ["desk", `Discharge ${p.name}: walk to the <b>Reception desk</b>`] };
  const m = map[st]; return m ? { id: m[0], text: `${m[1]} and ${TUT_ACT()}.` } : null;
}
const TUT_STEPS = [
  { id: "move", title: "Move Dr. Ahmad",
    text: () => TUT_TOUCH() ? "Put your thumb on the <b>bottom-left</b> of the screen and drag to walk. Drag further to hurry." : "Walk with <b>W A S D</b> or the <b>arrow keys</b>. Hold <b>Shift</b> to hurry.",
    el: () => TUT_TOUCH() ? "#joyZone" : null,
    start: () => { const p = World.playerPos(); G.tutStart = { x: p.x, z: p.z }; },
    done: () => { const p = World.playerPos(), s = G.tutStart || p; return Math.hypot(p.x - s.x, p.z - s.z) > 2.2; } },
  { id: "shift", title: "Open the clinic",
    text: () => `Walk to the glowing marker — the <b>Shift board</b> by the entrance — and ${TUT_ACT()}. Then tap <b>Start shift</b>.`,
    world: () => tutIt("shiftBoard").pos, el: () => G.nearest && G.nearest.id === "shiftBoard" ? "#prompt" : (G.panelOpen ? "#panelBody .btn.primary" : null),
    done: () => G.s.shiftActive },
  { id: "arrive", title: "Your first patient",
    text: () => { const p = tutP(); return p && p.status === "arriving" ? `${p ? p.ownerName + " and " + p.name : "A patient"} are walking in. Go and stand by the <b>Reception desk</b> (the marker).` : `They're at the desk. ${TUT_ACT()[0].toUpperCase() + TUT_ACT().slice(1)} to greet them.`; },
    start: () => { if (!tutP()) { const c = CASES.find(x => x.id === "vax_dog") || CASES[0]; const p = spawnPatient(c); if (p) G.s.tut.pid = p.id; } },
    world: () => tutIt("desk").pos, el: () => G.nearest && G.nearest.id === "desk" ? "#prompt" : null,
    done: () => { const p = tutP(); return !!p && (p.greeted || !["arriving", "at_desk"].includes(p.status)); } },
  { id: "talk", title: "Talk to the owner",
    text: () => "The owner is worried. Pick the reply that is <b>kind and clear</b> — good bedside manner raises your reputation.",
    el: () => ".bopt",
    done: () => { const p = tutP(); return !!p && (p.compliance !== undefined || !["arriving", "at_desk"].includes(p.status)); } },
  { id: "register", title: "Register the patient",
    text: () => "This is the patient's file: name, age, weight and what the owner says. Check it, then tap <b>Register → waiting room</b>.",
    el: () => "#panelBody .btn.primary",
    done: () => { const p = tutP(); return !!p && !["arriving", "at_desk"].includes(p.status); } },
  { id: "callin", title: "Call the pet in",
    text: () => { const p = tutP(); return `${p ? p.name : "The pet"} is in the waiting room. Walk to them (the marker) and ${TUT_ACT()} to call them into the exam room.`; },
    world: () => { const p = tutP(); return p && p.npc ? p.npc.rig.group.position : null; }, el: () => G.nearest && /^pet/.test(G.nearest.id) ? "#prompt" : null,
    done: () => { const p = tutP(); return !!p && !["arriving", "at_desk", "waiting"].includes(p.status); } },
  { id: "toexam", title: "Go to the exam room",
    text: () => { const p = tutP(); return `${p ? p.name : "The pet"} is walking to the <b>Exam room</b>. Follow the marker to the exam table and ${TUT_ACT()}.`; },
    world: () => tutIt("examTable").pos, el: () => G.nearest && G.nearest.id === "examTable" ? "#prompt" : null,
    done: () => !!G.ho || (() => { const p = tutP(); return !!p && p.dxChoice !== undefined; })() },
  { id: "exam1", title: "The hands-on exam",
    text: () => { const p = tutP(); return `Tap <b>Next step</b> — it picks the right tool and makes a spot on ${p ? p.name : "the pet"} glow. Then <b>tap the glowing spot</b>. Answer the owner if they ask something.`; },
    el: () => "#hoTools .hotool.next",
    done: () => { const p = tutP(); return !!p && (Object.keys(p.examDone || {}).filter(k => p.examDone[k]).length >= 3 || p.dxChoice !== undefined); } },
  { id: "exam2", title: "Finish the exam",
    text: () => { const p = tutP(); const n = p ? EXAM_STEPS.filter(s => p.examDone[s.id]).length : 0; return `Great — keep going with <b>Next step</b> until all checks are done (<b>${n}/${EXAM_STEPS.length}</b>). Tip: drag on empty space to walk round the table.`; },
    el: () => "#hoTools .hotool.next",
    done: () => { const p = tutP(); return !!p && (EXAM_STEPS.every(s => p.examDone[s.id]) || p.dxChoice !== undefined); } },
  { id: "dx", title: "Make your assessment",
    text: () => `Open the <b>tablet</b> (${innerWidth < 760 || innerHeight > innerWidth * 1.2 ? "the bar at the bottom" : "the panel on the right"}) and tap <b>Assessment &amp; plan</b>. Choose what you think is going on.`,
    el: () => G.panelOpen ? "#panelBody .btn.opt, #panelBody .btn.primary" : "#hoHandle, #hoTab",
    done: () => { const p = tutP(); return !!p && p.dxChoice !== undefined; } },
  { id: "plan", title: "Carry out the plan",
    text: () => { const p = tutP(); if (p && p.status === "exam_ready") return "Read the feedback, then tap the gold button to carry out the plan."; const t = tutPlanTarget(p); return t ? t.text : "Follow the marker."; },
    world: () => { const p = tutP(); if (!p || p.status === "exam_ready") return null; const t = tutPlanTarget(p); const it = t && tutIt(t.id); return it ? it.pos : null; },
    el: () => { const p = tutP(); if (p && p.status === "exam_ready") return "#panelBody .btn.primary"; const t = tutPlanTarget(p); return t && G.nearest && G.nearest.id === t.id ? "#prompt" : null; },
    done: () => { const p = tutP(); return !p || p.status === "done" || (p.status === "ready_discharge" && !(p.rx && !p.rxDone)); } },
  { id: "discharge", title: "Discharge and get paid",
    text: () => { const p = tutP(); return G.panelOpen ? "Explain the home care to the owner, then tap the gold button to finish. You'll get paid and see a short recap of the case." : `${p ? p.name : "The patient"} is ready to go home. Walk to the <b>Reception desk</b> and ${TUT_ACT()}.`; },
    el: () => G.panelOpen ? "#panelBody .btn.primary" : (G.nearest && G.nearest.id === "desk" ? "#prompt" : null),
    world: () => G.panelOpen ? null : tutIt("desk").pos,
    done: () => { const p = tutP(); return !p || p.status === "done"; } },
  { id: "extras", title: "You did it!", final: true,
    text: () => `<ul class="tutlist"><li><b>Menu</b> (top right): your <b>phone</b> — messages from your wife, owner photos, daily tasks.</li><li>Feed the clinic cat <b>${G.s.clinicPet.name}</b> at her bowl, and walk her once a day.</li><li>Low energy? Coffee or a nap in the <b>Staff room</b>.</li><li>At the end of the day: <b>Shift board → close doors</b>, finish patients, then go home.</li></ul>`,
    done: () => false }
];
const Tut = (() => {
  let card = null, lastHL = null, idx = -1, startedAt = 0;
  function on() { return !!(G.s && G.s.tut && G.s.tut.on && !G.s.tut.done); }
  function ensureCard() { if (card) return card; card = document.createElement("div"); card.id = "tutCard"; card.className = "hidden"; card.addEventListener("click", (e) => { if (e.target.closest("button")) return; card.classList.toggle("open"); clearTimeout(card._t); if (card.classList.contains("open")) card._t = setTimeout(() => card.classList.remove("open"), 7000); }); card.setAttribute("role", "status"); card.setAttribute("aria-live", "polite"); document.body.appendChild(card); return card; }
  function clearHL() { if (lastHL) { lastHL.forEach(e => e.classList.remove("tut-hl")); lastHL = null; } }
  function step() { return TUT_STEPS[G.s.tut.step]; }
  function begin(fromStart) {
    G.s.tut = { on: true, done: false, step: 0, pid: (G.s.tut && G.s.tut.pid) || null };
    if (!fromStart) { // replay: skip steps that are already true
      while (G.s.tut.step < TUT_STEPS.length - 1 && TUT_STEPS[G.s.tut.step].id === "shift" && G.s.shiftActive) G.s.tut.step++;
    }
    idx = -1; save(); closePanel(); update(true);
  }
  function offer() {
    openPanel(`${icon("paw", 20)} Welcome, Dr. Ahmad`, `<p class="big">It's your first day at <b>${G.s.clinicName}</b>.</p><p>A quick guided shift shows you everything: walking, the reception desk, the hands-on exam, the plan and getting paid. It takes about 5 minutes and you can skip it any time.</p><div class="btnrow"><button class="btn primary" id="tutGo">${icon("arrow", 16)} Start the tutorial</button><button class="btn" id="tutNo">Skip — I know the basics</button></div><p class="small muted">You can replay it later from <b>Menu → Help</b>.</p>`, { noClose: true });
    $("#tutGo").onclick = () => begin(true);
    $("#tutNo").onclick = () => { G.s.tut = { on: false, done: true, skipped: true }; save(); closePanel(); toast("Tutorial skipped — replay it from Menu → Help.", "info", 4000); };
  }
  function skip() { G.s.tut.on = false; G.s.tut.done = true; G.s.tut.skipped = true; save(); hide(); World.setWaypoint(G.walk ? null : null); toast("Tutorial skipped — replay it from Menu → Help.", "info", 4000); }
  function finish() { G.s.tut.on = false; G.s.tut.done = true; save(); hide(); earn(25); addXP(40, "tutorial complete"); confetti(); toast(`${icon("check", 18)} Tutorial complete — +25 JD. The clinic is all yours, Doctor!`, "good", 5000); G.spawnTimer = Math.min(G.spawnTimer, 25); }
  function hide() { clearHL(); if (card) card.classList.add("hidden"); document.querySelectorAll("#panelBody .tutbox").forEach(b => b.remove()); document.body.classList.remove("tut"); if (!G.walk) World.setWaypoint(null); }
  function render(st) {
    const n = G.s.tut.step + 1, total = TUT_STEPS.length; const body = st.text();
    const inPanel = G.panelOpen && !document.body.classList.contains("talking") && $("#panel") && !$("#panel").classList.contains("hidden") && !(G.ho && document.body.classList.contains("tabmin"));
    ensureCard(); document.body.classList.add("tut");
    if (inPanel) {
      card.classList.add("hidden");
      const pb = $("#panelBody"); if (!pb) return; let box = pb.querySelector(".tutbox");
      const html = `<div class="tuthead"><span>${icon("paw", 14)} Tutorial ${n}/${total} · ${st.title}</span>${st.final ? "" : `<button class="tutskip" aria-label="Skip tutorial">Skip</button>`}</div><div class="tuttext">${body}</div>${st.final ? `<div class="btnrow"><button class="btn primary tutfin">${icon("check", 16)} Finish tutorial</button></div>` : ""}`;
      const wire = () => { const sk = box.querySelector(".tutskip"); if (sk) sk.onclick = skip; const fn = box.querySelector(".tutfin"); if (fn) fn.onclick = finish; };
      if (!box) { box = document.createElement("div"); box.className = "tutbox"; pb.insertBefore(box, pb.firstChild); box.innerHTML = html; wire(); }
      else if (box.dataset.k !== st.id + body) { box.innerHTML = html; wire(); }
      box.dataset.k = st.id + body;
    } else {
      document.querySelectorAll("#panelBody .tutbox").forEach(b => b.remove());
      const key = st.id + body; if (card.dataset.k !== key) {
        card.innerHTML = `<div class="tuthead"><span>${icon("paw", 14)} Tutorial ${n}/${total}</span>${st.final ? "" : `<button class="tutskip" aria-label="Skip tutorial">Skip</button>`}</div><b class="tuttitle">${st.title}</b><div class="tuttext">${body}</div>${st.final ? `<div class="btnrow"><button class="btn primary" id="tutDone">${icon("check", 16)} Finish tutorial</button></div>` : ""}`;
        card.dataset.k = key; const sk = card.querySelector(".tutskip"); if (sk) sk.onclick = skip; const dn = card.querySelector("#tutDone"); if (dn) dn.onclick = finish;
      }
      card.classList.toggle("final", !!st.final); card.classList.remove("hidden");
    }
    // highlight
    clearHL(); const sel = st.el && st.el(); if (sel) { const els = [...document.querySelectorAll(sel)].filter(e => e.offsetParent || e.id === "joyZone").slice(0, 3); if (els.length) { els.forEach(e => e.classList.add("tut-hl")); lastHL = els; } }
    // world marker
    if (!G.walk) { const w = st.world && st.world(); World.setWaypoint(w && !G.ho ? { x: w.x, z: w.z } : null); }
  }
  function update(force) {
    if (!on()) { if (card && !card.classList.contains("hidden")) hide(); return; }
    const t = G.s.tut; let guard = 0;
    while (guard++ < TUT_STEPS.length && t.step < TUT_STEPS.length - 1) {
      const st = TUT_STEPS[t.step]; if (idx !== t.step) { idx = t.step; startedAt = performance.now(); if (st.start) try { st.start(); } catch (e) { } }
      let ok = false; try { ok = st.done(); } catch (e) { }
      if (!ok) break; t.step++; Sound.success && Sound.success(); save();
    }
    const st = step(); if (idx !== t.step) { idx = t.step; if (st.start) try { st.start(); } catch (e) { } }
    // the final card waits for the recap card to close so they don't stack
    if (st.final) { const rc = document.getElementById("recap"); if (rc && !rc.classList.contains("hidden")) { if (card) card.classList.add("hidden"); clearHL(); return; } }
    render(st);
  }
  setInterval(() => { try { update(); } catch (e) { } }, 300);
  return { on, begin, offer, skip, finish, update, hide };
})();
function tutActive() { return typeof Tut !== "undefined" && Tut.on(); }
