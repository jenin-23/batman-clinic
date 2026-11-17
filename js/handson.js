/* =====================================================================
   Batman Clinic — HANDS-ON MODE
   Walk up to a table or machine → the camera moves in, the tablet sits
   beside the patient, the tool tray is at hand, and you examine, image,
   prep, operate and dispense directly on the 3D patient.
   ===================================================================== */

/* ---------------- anatomy anchors (pet-local, standing, facing +z; +x = the pet's LEFT side) ---------------- */
const HO_ANCH = {
  dog: { eye: [0.09, 0.87, 0.72], ear: [0.18, 0.84, 0.54], mouth: [0.05, 0.69, 0.84], lymph: [0.1, 0.62, 0.66], heart: [0.24, 0.42, 0.3], ribs: [0.28, 0.56, 0.14], lungCr: [0.24, 0.64, 0.3], lungCd: [0.28, 0.63, -0.04], abdCr: [0.25, 0.42, -0.02], abdMid: [0.27, 0.42, -0.2], abdCd: [0.22, 0.38, -0.38], femoral: [0.16, 0.3, -0.3], leg: [0.16, 0.16, 0.32], hind: [0.16, 0.16, -0.3], back: [0.12, 0.79, -0.12], scruff: [0.1, 0.78, 0.38], tail: [0.05, 0.62, -0.5], ventral: [0, 0.2, -0.04], ventA: [0, 0.2, 0.14], ventB: [0, 0.2, -0.2], scrotal: [0, 0.26, -0.3] },
  cat: { eye: [0.065, 0.56, 0.46], ear: [0.1, 0.67, 0.32], mouth: [0.03, 0.47, 0.5], lymph: [0.07, 0.42, 0.42], heart: [0.17, 0.26, 0.18], ribs: [0.19, 0.35, 0.08], lungCr: [0.17, 0.41, 0.16], lungCd: [0.19, 0.4, -0.06], abdCr: [0.17, 0.25, -0.02], abdMid: [0.18, 0.25, -0.14], abdCd: [0.16, 0.24, -0.26], femoral: [0.11, 0.2, -0.22], leg: [0.1, 0.08, 0.22], hind: [0.11, 0.08, -0.22], back: [0.1, 0.48, -0.08], scruff: [0.08, 0.5, 0.24], tail: [0.03, 0.42, -0.34], ventral: [0, 0.13, -0.06], ventA: [0, 0.13, 0.06], ventB: [0, 0.13, -0.16], scrotal: [0, 0.2, -0.3] },
  rabbit: { eye: [0.065, 0.56, 0.38], ear: [0.08, 0.78, 0.23], mouth: [0.03, 0.47, 0.41], lymph: [0.07, 0.42, 0.34], heart: [0.2, 0.26, 0.12], ribs: [0.22, 0.33, 0.04], lungCr: [0.2, 0.38, 0.1], lungCd: [0.22, 0.38, -0.06], abdCr: [0.2, 0.22, -0.02], abdMid: [0.21, 0.22, -0.14], abdCd: [0.19, 0.22, -0.24], femoral: [0.12, 0.18, -0.2], leg: [0.09, 0.08, 0.18], hind: [0.1, 0.08, -0.18], back: [0.12, 0.5, -0.08], scruff: [0.08, 0.5, 0.18], tail: [0.03, 0.38, -0.33], ventral: [0, 0.1, -0.05], ventA: [0, 0.1, 0.06], ventB: [0, 0.1, -0.14], scrotal: [0, 0.16, -0.26] },
  bird: { eye: [0.045, 0.45, 0.16], ear: [0.07, 0.44, 0.07], mouth: [0.0, 0.42, 0.2], lymph: [0.04, 0.36, 0.14], heart: [0.06, 0.2, 0.14], ribs: [0.07, 0.25, 0.1], lungCr: [0.1, 0.32, -0.02], lungCd: [0.1, 0.29, -0.1], abdCr: [0.09, 0.19, -0.03], abdMid: [0.08, 0.17, -0.08], abdCd: [0.06, 0.17, -0.12], femoral: [0.06, 0.2, 0.14], leg: [0.11, 0.28, -0.02], hind: [0.035, 0.06, 0.02], back: [0.06, 0.37, -0.04], scruff: [0.04, 0.4, 0.04], tail: [0.02, 0.17, -0.14], ventral: [0, 0.34, 0.14], ventA: [0, 0.37, 0.16], ventB: [0, 0.32, 0.12], scrotal: [0, 0.17, -0.12] },
  tortoise: { eye: [0.05, 0.27, 0.5], ear: [0.08, 0.22, 0.44], mouth: [0.02, 0.2, 0.56], lymph: [0.06, 0.18, 0.42], heart: [0.12, 0.2, 0.36], ribs: [0.2, 0.42, 0.0], lungCr: [0.15, 0.42, 0.06], lungCd: [0.18, 0.4, -0.12], abdCr: [0.27, 0.13, -0.2], abdMid: [0.27, 0.13, -0.22], abdCd: [0.26, 0.12, -0.26], femoral: [0.27, 0.13, -0.22], leg: [0.27, 0.08, 0.2], hind: [0.27, 0.08, -0.2], back: [0.1, 0.46, 0.0], scruff: [0.06, 0.22, 0.4], tail: [0.02, 0.14, -0.36], ventral: [0, 0.08, 0], ventA: [0, 0.08, 0.1], ventB: [0, 0.08, -0.1], scrotal: [0, 0.1, -0.3] }
};
const HO_PARTLABEL = { eye: "Eye", ear: "Ear", mouth: "Mouth & gums", lymph: "Lymph nodes", heart: "Heart", ribs: "Ribs (body condition)", lungCr: "Lungs (front)", lungCd: "Lungs (back)", abdCr: "Belly — front", abdMid: "Belly — middle", abdCd: "Belly — back", femoral: "Femoral pulse", leg: "Front leg", hind: "Hind leg", back: "Coat & back", scruff: "Scruff (skin tent)", tail: "Tail end", ventral: "Surgical site", ventA: "Incision start", ventB: "Incision end", scrotal: "Pre-scrotal site" };

/* tools: [label, svg-path] — simple hand-drawn line icons */
const HO_TOOLS = {
  hand: ["Hands", '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12m0-6.5a1.5 1.5 0 0 1 3 0V12m0-5a1.5 1.5 0 0 1 3 0v6.5c0 3.6-2.4 6.5-6 6.5-2.8 0-4.2-1.2-5.6-3.6L4.6 13.6a1.4 1.4 0 0 1 2.3-1.6L8 13.5"/>'],
  steth: ["Stethoscope", '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="12" r="2"/>'],
  thermo: ["Thermometer", '<rect x="10" y="2.5" width="4" height="14" rx="2"/><circle cx="12" cy="18.5" r="3"/><path d="M12 9v8"/>'],
  light: ["Penlight", '<rect x="9" y="8" width="6" height="13" rx="1.5"/><path d="M9 8l-1-3h8l-1 3M12 2v1.5M7 3.5l1 1M17 3.5l-1 1"/>'],
  oto: ["Otoscope", '<path d="M14 4l6 6-3 1-4-4zM13 7l-7 7a2 2 0 0 0 0 3l1 1a2 2 0 0 0 3 0l7-7"/>'],
  fluor: ["Fluorescein", '<path d="M10 3h4v4l3 5v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7l3-5z"/><path d="M8 14h8"/>'],
  comb: ["Flea comb", '<rect x="3" y="6" width="18" height="4" rx="1"/><path d="M5 10v8M8 10v8M11 10v8M14 10v8M17 10v8M20 10v6"/>'],
  treat: ["Treat", '<path d="M6 9a2.5 2.5 0 1 1 3-3h6a2.5 2.5 0 1 1 3 3 2.5 2.5 0 1 1-3 3H9a2.5 2.5 0 1 1-3-3z"/>'],
  towel: ["Towel", '<path d="M4 6h16v12H4z"/><path d="M4 10h16M8 6v12"/>'],
  syringe: ["Syringe", '<path d="M15 3l6 6M18 6l-9 9-3 1 1-3 9-9M14 7l3 3M4 20l3-3"/>'],
  cath: ["IV catheter", '<path d="M3 21l5-5M8 16l8-8 3 3-8 8zM16 8l2-2 2 2-2 2"/><path d="M11 13l2 2"/>'],
  mask: ["Oxygen mask", '<path d="M6 10c0-3 3-5 6-5s6 2 6 5l-2 8H8z"/><path d="M12 18v3"/>'],
  tube: ["ET tube", '<path d="M5 20c0-8 6-14 14-15"/><path d="M7 20c0-7 5-12 12-13"/><circle cx="7" cy="15" r="2"/>'],
  leads: ["Monitor leads", '<path d="M3 12h4l2-5 3 10 2-5h7"/>'],
  lube: ["Eye lube", '<path d="M8 4h8v4l-2 2v9H10v-9L8 8z"/>'],
  clip: ["Clippers", '<rect x="7" y="7" width="10" height="14" rx="3"/><path d="M7 7l1-4h8l1 4M9 3v-1M12 3v-1M15 3v-1"/>'],
  scrub: ["Scrub swab", '<path d="M4 20l6-6"/><circle cx="14" cy="10" r="5"/>'],
  apron: ["Lead apron", '<path d="M8 3h8l3 4-2 2v12H7V9L5 7z"/><path d="M10 3l2 3 2-3"/>'],
  beam: ["Collimator", '<rect x="5" y="5" width="14" height="14"/><path d="M12 3v18M3 12h18"/>'],
  doppler: ["Doppler probe", '<path d="M9 3h6v9l-3 3-3-3z"/><path d="M5 18c2-2 4-2 7 0s5 2 7 0"/>']
};
function hoIcon(k, size = 22) { const t = HO_TOOLS[k]; return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${t ? t[1] : ""}</svg>`; }

/* ---------------- clinical findings per case (what your hands, eyes and ears discover) ---------------- */
const HO_SYMPTOMS = { limp_cat: ["limpFront"], limp_dog: ["limpHind"], ccl_dog: ["limpHind", "fat"], ivdd_dog: ["limpHind", "lethargic"], ulcer_dog: ["squint"], ulcer_indolent: ["squint"], aural_dog: ["earSwollen"], gdv: ["bloated", "pant"], heat_dog: ["pant", "lethargic"], parvo_pup: ["lethargic", "thin"], tick_dog: ["fleas"], hookworm_pup: ["thin", "lethargic"], hyperT_cat: ["thin"], diabetic_cat: ["fat"], blocked_cat: ["lethargic"], eggbound_bird: ["fluffed"], lead_bird: ["fluffed"], psittacosis_bird: ["fluffed", "squint"], ecun_rabbit: ["headTilt"], rabbit_stasis: ["lethargic"], asthma_cat: ["pant"], choc_dog: ["pant"], pyometra: ["lethargic"], spleen_dog: ["lethargic"], pancreatitis_dog: ["lethargic"], abscess_cat: ["lethargic"], vomit_dog: ["lethargic"], mystery_addison: ["lethargic"], hypo_pup: ["lethargic"], eggs_again: ["thin"], vax_cat: ["fleas"] };
function hoSymptomsFor(p) { const s = (HO_SYMPTOMS[p.caseDef.id] || []).slice(); if (p.secondary && /flea/.test(p.secondary)) s.push("fleas"); if (p.secondary && /overweight/.test(p.secondary)) s.push("fat"); return s; }

const HO_CLIN = {
  vax_cat: { coat: "Fleas running through the coat at the tail base, and flea dirt that turns red-brown on damp paper." },
  ear_dog: { ear: "otitis", earText: "Left canal red and swollen with brown, waxy, yeasty-smelling debris. Eardrum hard to see." },
  bird_nails: { leg: "Nails overgrown and curling." },
  limp_cat: { leg: "Swelling and crepitus mid-forearm — very painful.", pain: ["leg"] },
  limp_dog: { hind: "Painful swelling over the thigh with crepitus.", pain: ["hind"] },
  vomit_dog: { abdCr: "Painful cranial abdomen.", abdMid: "A firm, tube-shaped object in the small intestine.", pain: ["abdCr", "abdMid"], tent: "Skin tent slow — about 7 % dehydrated.", hx2: "Not eating, vomiting everything, even water." },
  bird_wing: { leg: "Left wing droops; crepitus over the humerus.", pain: ["leg"] },
  lac_dog: { back: "5 cm dirty laceration on the flank.", pain: ["back"] },
  crop_bird: { abdCr: "Crop distended and doughy at the base of the neck." },
  heat_dog: { tent: "Skin tent slow — about 8 % dehydrated.", lungs: "harsh", hx2: "He collapsed after a run in the sun." },
  parvo_pup: { abdMid: "Fluid-filled, painful intestines.", pain: ["abdMid"], tent: "Skin tent very slow — 8–10 % dehydrated.", hx3: "He hasn't had his vaccines yet." },
  tick_dog: { coat: "Several engorged ticks around the ears and neck." },
  pyometra: { abdCd: "Enlarged, doughy uterus — gentle! It could rupture.", pain: ["abdCd"], tail: "Purulent discharge from the vulva.", hx2: "Drinking loads, vomiting since yesterday." },
  stones_dog: { abdCd: "Thickened, gritty-feeling bladder.", pain: ["abdCd"] },
  spleen_dog: { abdMid: "A large irregular mass in the mid-cranial abdomen.", pain: ["abdMid"] },
  rabbit_stasis: { abdMid: "Firm, doughy stomach; almost no gut sounds.", pain: ["abdMid"], hx2: "No droppings since last night and not eating." },
  rabbit_teeth: { mouthText: "Sharp molar spurs cutting into the cheek." },
  tortoise_rhino: { eyeText: "Nasal discharge; eyes slightly sunken." },
  dental_dog: { mouthText: "Heavy calculus, gingivitis and a fractured upper carnassial tooth." },
  dental_cat: { mouthText: "Red gum swelling over a resorptive lesion on a lower premolar." },
  blocked_cat: { abdCd: "Large, hard, painful bladder that cannot be expressed — emergency!", pain: ["abdCd"], hx2: "Straining in the litter box, nothing coming out." },
  mystery_addison: { tent: "Skin tent slow — about 6 % dehydrated." },
  mystery_fb_cat: { abdMid: "Bunched, plicated intestines.", mouthText: "A string looped under the tongue!", pain: ["abdMid"] },
  ulcer_dog: { eye: "ulcer" }, ulcer_indolent: { eye: "indolent" }, cherry_eye: { eye: "cherry" },
  gdv: { abdCr: "Tight, drum-like, tympanic cranial abdomen.", abdMid: "Distended and tympanic.", pain: ["abdCr", "abdMid"], vit: { temp: 38.4, hr: 165, rr: 44, crt: "3 s", mm: "pale" } },
  choc_dog: { vit: { temp: 39.2, hr: 150, rr: 40 }, mouthText: "Chocolate smell on the breath, brown smears on the lips.", hx2: "He ate a 100 g dark chocolate bar about an hour ago." },
  aural_dog: { ear: "haematoma", earText: "Pinna swollen like a pillow; canal red with yeasty debris." },
  ccl_dog: { hind: "Stifle effusion, positive cranial drawer and tibial thrust, firm medial thickening.", pain: ["hind"] },
  ivdd_dog: { back: "Pain over the thoracolumbar spine.", hind: "Can't stand on the hind legs, but deep pain is still present.", pain: ["back"] },
  hypo_pup: { vit: { temp: 36.6, hr: 180, rr: 30, mm: "pale pink" } },
  pancreatitis_dog: { abdCr: "Very painful cranial abdomen — he tenses and groans.", pain: ["abdCr"] },
  hookworm_pup: { vit: { hr: 180, mm: "pale pink", crt: "2 s" }, coat: "Dull coat; dark tarry faeces on the thermometer." },
  hyperT_cat: { lymph: "A thyroid nodule slips under your fingers in the neck.", vit: { hr: 240, temp: 39.1 }, heartExtra: "gallop", hx2: "Eating like crazy but still losing weight; drinking more." },
  renal_unmasked: { abdMid: "Kidneys small and slightly irregular." },
  diabetic_cat: { hind: "Walks flat on the hocks (plantigrade stance).", hx2: "Drinking and peeing far more than usual." },
  lily_cat: { mouthText: "Orange lily pollen on the face and paws!" },
  abscess_cat: { tail: "Hot, fluctuant, painful swelling at the tail base with two puncture scabs.", pain: ["tail"], vit: { temp: 40.1 } },
  asthma_cat: { lungs: "wheeze", vit: { rr: 52 } },
  eggbound_bird: { abdCd: "A hard egg in the caudal coelom; vent swollen.", pain: ["abdCd"] },
  lead_bird: { leg: "Weak grip and wobbly on the perch." },
  psittacosis_bird: { eyeText: "Both eyes swollen with conjunctivitis; clear nasal discharge.", eye: "conj" },
  ecun_rabbit: { eyeText: "Rhythmic side-to-side flicking of the eyes (nystagmus)." },
  mbd_tortoise: { back: "The shell gives when pressed — soft!", mouthText: "Overgrown beak." }
};
function hoClin(p) {
  const o = HO_CLIN[p.caseDef.id] || {}; const sp = p.species; const bcsM = /BCS (\d)\/9/.exec(p.caseDef.findings || ""); const sym = hoSymptomsFor(p);
  const bcs = bcsM ? +bcsM[1] : sym.includes("fat") ? 8 : sym.includes("thin") ? 3 : 5;
  return Object.assign({ eye: "normal", ear: "normal", lungs: "normal", pain: [], bcs,
    tent: "Skin snaps straight back — well hydrated.", coat: sym.includes("fleas") ? "Fleas and flea dirt along the back and tail base." : "Clean, glossy coat; no parasites.",
    leg: "Full range of motion, no pain.", hind: "Full range of motion, no pain.", back: "Smooth coat, no lumps.", lymph: "Normal size.", tail: "Normal.",
    abdCr: "Soft, not painful.", abdMid: "Soft, not painful.", abdCd: sp === "bird" ? "Soft coelom." : "Small, soft bladder.",
    mouthText: sp === "bird" ? "Beak smooth, choana normal." : sp === "tortoise" ? "Beak and mouth normal." : "Teeth fine, mild calculus at most." }, o);
}

/* ---------------- state ---------------- */
const HO = { on: false, room: null, p: null, tool: "hand", raf: 0, cfg: null, hold: null, listen: null, need: null, paint: null, mon: null, beam: null };
function hoEnabled() { return G.s && G.s.settings && G.s.settings.handsOn !== false; }

/* station framing: where the camera goes and where the patient sits */
const HO_STATIONS = {
  examTable: { status: "exam_ready", pet: [6.5, 1.0, -7, -Math.PI / 2], cam: [6.5, 2.05, -5.72], look: [6.5, 1.27, -7], title: "Exam table" },
  dentalTable: { status: "dental_ready", pet: [19.5, 1.0, -7, -Math.PI / 2], cam: [19.5, 2.05, -5.75], look: [19.5, 1.2, -7], title: "Dental table", recumb: "lateral" },
  xrayTable: { status: "xray_ready", pet: [13.5, 0.95, 6.5, Math.PI / 2], cam: [13.5, 2.45, 5.2], look: [13.5, 1.0, 6.5], title: "X-ray table" },
  prepTable: { status: "preop", pet: [0, 0.95, 5.5, Math.PI / 2], cam: [0, 2.25, 4.25], look: [0, 1.05, 5.5], title: "Prep table" },
  orTable: { status: "ready_or", pet: [7, 1.0, 6.5, -Math.PI / 2], cam: [7, 2.05, 7.65], look: [7, 1.05, 6.5], title: "Operating table" },
  wardTable: { status: "ward_ready", pet: [19.5, 1.0, 6.5, Math.PI / 2], cam: [19.5, 2.15, 5.3], look: [19.5, 1.2, 6.5], title: "Ward table" },
  kennel: { status: "recovery", pet: [10, 0.25, 11.3, Math.PI], cam: [10, 1.45, 10.0], look: [10, 0.45, 11.3], title: "Recovery kennel" }
};

/* ---------------- DOM ---------------- */
function hoBuildDOM() {
  if ($("#ho")) return;
  const d = document.createElement("div"); d.id = "ho"; d.className = "hidden";
  d.innerHTML = `<div id="hoTop"><button id="hoBack" class="hobtn">${icon("arrow", 16)} Step back</button><b id="hoTitle"></b><span id="hoFear"></span><button id="hoTab" class="hobtn">${icon("folder", 16)} Tablet</button></div>
    <div id="hoHot"></div><canvas id="hoPaint"></canvas><div id="hoBeam" class="hidden"><i></i></div>
    <div id="hoHint"></div><div id="hoTools"></div><div id="hoMon" class="hidden"></div><div id="hoLens" class="hidden"><div id="hoLensHead"><b id="hoLensTitle"></b><button id="hoLensX" aria-label="Close">✕</button></div><div id="hoLensBody"></div></div><div id="hoCursor"></div><div id="hoAsk" class="hidden"></div>
    <div id="hoOrbit"><button data-o="l" title="Walk round to the left">⟲</button><button data-o="r" title="Walk round to the right">⟳</button><button data-o="u" title="Look from higher">▲</button><button data-o="d" title="Look from lower">▼</button><button data-o="i" title="Closer">＋</button><button data-o="o" title="Further">－</button><button data-o="c" title="Reset view">⌂</button></div>`;
  document.body.appendChild(d);
  const pan = $("#panel"); if (pan && !$("#hoHandle")) { const hd = document.createElement("button"); hd.id = "hoHandle"; hd.setAttribute("aria-label", "Open or close the tablet"); hd.innerHTML = `<i></i><span></span>`; pan.insertBefore(hd, pan.firstChild); hd.onclick = () => hoTabMin(!document.body.classList.contains("tabmin")); }
  $("#hoBack").onclick = () => hoClose();
  $("#hoTab").onclick = () => { if (G.panelOpen && !document.body.classList.contains("tabmin")) hoTabMin(true); else { hoTabMin(false); if (!G.panelOpen) hoTablet(); } };
  $("#hoLensX").onclick = () => { if (!HO.lensLocked) hoLens(null); };
  $("#hoOrbit").querySelectorAll("button").forEach(b => { let rep = null; const go = () => hoOrbitStep(b.dataset.o); b.onpointerdown = (e) => { e.preventDefault(); go(); if (b.dataset.o !== "c") rep = setInterval(go, 160); }; const stop = () => { clearInterval(rep); rep = null; }; b.onpointerup = stop; b.onpointerleave = stop; b.onpointercancel = stop; });
  const hot = $("#hoHot");
  hot.addEventListener("pointerdown", hoPointerDown);
  hot.addEventListener("wheel", (e) => { if (!HO.on) return; e.preventDefault(); hoOrbitBy(0, 0, e.deltaY > 0 ? 1.08 : 1 / 1.08); }, { passive: false });
  hot.addEventListener("contextmenu", (e) => e.preventDefault()); hot.addEventListener("pointermove", hoPointerMove); window.addEventListener("pointerup", hoPointerUp); hot.addEventListener("pointercancel", hoPointerUp);
  window.addEventListener("keydown", (e) => { if (HO.on && e.key === "Escape" && !G.panelOpen) hoClose(); });
}

/* ---------------- open / close ---------------- */
function hoEnter(it) {
  if (!hoEnabled() || !it) return false;
  const st = HO_STATIONS[it.id];
  if (st) { const p = patientAt(st.status); if (!p) return false; hoOpen(it.id, p); return true; }
  const ps = POSES[it.id]; if (!ps) return false;
  if (!["pharmacy", "analyser", "microscope", "ultrasound", "autoclave"].includes(it.id)) return false;
  const P = World.playerPos(); const lx = ps[1], lz = ps[2]; const dx = P.x - lx, dz = P.z - lz, L = Math.hypot(dx, dz) || 1;
  hoOpen(it.id, null, { cam: [lx + dx / L * 1.45, 1.95, lz + dz / L * 1.45], look: [lx, 1.15, lz], title: { pharmacy: "Pharmacy counter", analyser: "Blood analyser", microscope: "Microscope", ultrasound: "Ultrasound", autoclave: "Autoclave" }[it.id] });
  it.action(); return true;
}
function hoOpen(room, p, frame) {
  hoBuildDOM(); Sound.init();
  const st = HO_STATIONS[room]; HO.orbit = { yaw: 0, pitch: 0, zoom: 1 }; HO.on = true; HO.room = room; HO.p = p; HO.tool = "hand"; HO.need = null; HO.cfg = frame || st; G.ho = true;
  document.body.classList.add("ho"); $("#ho").classList.remove("hidden"); hoTabMin(hoPhone()); $("#hoTitle").textContent = (frame && frame.title) || st.title;
  if (p && st) { World.placePet(p.npc, st.pet[0], st.pet[1], st.pet[2], st.pet[3]); if (p.npc.pet.sleeping) p.npc.pet.sleeping = false; }
  hoFrame();
  hoLens(null); $("#hoMon").classList.add("hidden"); $("#hoBeam").classList.add("hidden"); hoPaintClear(); hoHint("");
  if (room === "examTable") hoExamStart(p);
  else if (room === "xrayTable") hoXrayStart(p);
  else if (room === "prepTable") hoPrepStart(p);
  else if (room === "orTable") hoORStart(p);
  else if (room === "dentalTable") { World.setRecumbency(p.npc.pet, "lateral"); hoTools([]); uiDental(); }
  else if (room === "wardTable") { hoTools(["hand", "steth", "treat"]); hoExamLite(p); uiWard(); }
  else if (room === "kennel") { World.setRecumbency(p.npc.pet, "lateral"); hoTools(["hand", "steth"]); hoExamLite(p); uiRecovery(); }
  else hoTools([]);
  cancelAnimationFrame(HO.raf); const loop = () => { if (!HO.on) return; hoUpdate(); HO.raf = requestAnimationFrame(loop); }; HO.raf = requestAnimationFrame(loop);
}
function hoFrame() {
  const f = HO.cfg; if (!f) return; const O = HO.orbit || (HO.orbit = { yaw: 0, pitch: 0, zoom: 1 });
  const look = { x: f.look[0], y: f.look[1], z: f.look[2] }; const vx = f.cam[0] - look.x, vz = f.cam[2] - look.z, dy0 = f.cam[1] - look.y; const hd = Math.hypot(vx, vz) || 1; const a = Math.atan2(vx, vz) + O.yaw;
  const phone = innerWidth < 760 || innerHeight > innerWidth * 1.2;
  const mult = (phone ? (innerHeight > innerWidth * 1.5 ? 2.5 : 2.0) : 2.05) * (window.__hoMult || 1) * O.zoom;
  const elev = Math.atan2(dy0, hd) + O.pitch; const R0 = Math.hypot(hd, dy0) * mult;
  const cam = { x: look.x + Math.sin(a) * Math.cos(elev) * R0, y: look.y + Math.sin(elev) * R0, z: look.z + Math.cos(a) * Math.cos(elev) * R0 };
  const fx = look.x - cam.x, fz = look.z - cam.z, L = Math.hypot(fx, fz) || 1; const rx = -fz / L, rz = fx / L; const dist = Math.hypot(hd, dy0);
  if (phone) { look.y -= dist * mult * 0.1; } else { const k = dist * mult * 0.28; look.x += rx * k; look.z += rz * k; cam.x += rx * k; cam.z += rz * k; }
  World.setFocus({ cam, look, fov: phone ? 55 : 44 });
}
function hoClose() {
  if (!HO.on) return; HO.on = false; G.ho = false; cancelAnimationFrame(HO.raf); hoStopSounds();
  if (HO.mon) { HO.mon.stop = true; HO.mon = null; }
  if (HO.p && HO.p.npc && HO.p.npc.pet && !["preop", "ready_or", "recovery", "dental_ready"].includes(HO.p.status)) World.setRecumbency(HO.p.npc.pet, null);
  const owner = HO.p && HO.p.npc && HO.p.npc.rig; if (owner && HO.ownerHome && HO.p.status === "exam_ready") { owner.group.position.set(HO.ownerHome[0], 0, HO.ownerHome[1]); owner.group.rotation.y = HO.ownerHome[2]; HO.ownerHome = null; }
  World.setFocus(null); $("#ho").classList.add("hidden"); document.body.classList.remove("ho"); hoTabMin(false); hoAskHide(); closePanel(); HO.p = null; HO.room = null;
}
function hoPhone() { return innerWidth < 760 || innerHeight > innerWidth * 1.2; }
function hoTabMin(on) { document.body.classList.toggle("tabmin", !!on); const h = $("#hoHandle span"); if (h) h.textContent = on ? "Open tablet" : "Close tablet"; }
function hoOrbitBy(dYaw, dPitch, zoomK) { const O = HO.orbit || (HO.orbit = { yaw: 0, pitch: 0, zoom: 1 }); O.yaw += dYaw; O.pitch = Math.max(-0.55, Math.min(0.75, O.pitch + dPitch)); O.zoom = Math.max(0.45, Math.min(1.6, O.zoom * (zoomK || 1))); hoFrame(); }
function hoOrbitStep(o) { if (o === "c") { HO.orbit = { yaw: 0, pitch: 0, zoom: 1 }; return hoFrame(); } hoOrbitBy(o === "l" ? -0.22 : o === "r" ? 0.22 : 0, o === "u" ? 0.1 : o === "d" ? -0.1 : 0, o === "i" ? 0.9 : o === "o" ? 1.11 : 1); }
function hoTablet() { const r = HO.room, p = HO.p; if (r === "examTable" && p) return hoExamTablet(p); if (r === "xrayTable") return p && p.xray ? showXrayPanel(p, p.xray, true) : hoXrayTablet(p); if (r === "prepTable" && p) return renderPreop(p); if (r === "orTable" && p) return p.surg ? hoSurgTablet(p) : uiSurgery(); if (r === "dentalTable") return uiDental(); if (r === "wardTable") return uiWard(); if (r === "kennel") return uiRecovery(); const it = INTERACT.find(x => x.id === r); if (it) it.action(); }
function hoStopSounds() { try { Sound.purr(false); Sound.clipper(false); } catch (e) { } if (HO.listen) { clearInterval(HO.listen.timer); HO.listen = null; } }

/* ---------------- tools tray, hints, floating notes ---------------- */
function hoTools(list, extra) {
  HO.toolList = list; const host = $("#hoTools");
  host.innerHTML = list.map(k => `<button class="hotool ${HO.tool === k ? "on" : ""}" data-k="${k}">${hoIcon(k, 24)}<span>${(k === "treat" && HO.p && HO.p.species === "bird") ? "Millet" : (k === "steth" && HO.p && HO.p.species === "tortoise") ? "Doppler" : HO_TOOLS[k][0]}</span></button>`).join("") + (extra || "");
  host.querySelectorAll(".hotool[data-k]").forEach(b => b.onclick = () => { HO.tool = b.dataset.k; Sound.click(); host.querySelectorAll(".hotool[data-k]").forEach(x => x.classList.toggle("on", x === b)); hoToolChanged(); });
  host.classList.toggle("hidden", !list.length && !extra);
}
function hoToolChanged() { if (HO.room === "orTable") return; const tips = { hand: "Tap a body part to palpate or check it. Tap the inner thigh to count the pulse.", steth: "Hold the stethoscope on the chest. Move it around — the heart is loudest low on the left chest.", thermo: "Tap the tail end — the thermometer reads by itself in a few seconds.", light: "Shine the penlight into the eye.", oto: "Look into the ear canal.", fluor: "One drop of stain on the eye, then look with the light.", comb: "Comb along the back.", treat: "Offer a treat at the mouth — it calms the patient.", towel: "Wrap the patient gently (purrito / towel hold)." }; if (HO.room === "examTable" || HO.room === "wardTable" || HO.room === "kennel") hoHint(tips[HO.tool] || ""); }
function hoHint(t, keep) { const h = $("#hoHint"); if (!h) return; clearTimeout(HO.hintT); h.classList.remove("fade"); h.innerHTML = t; h.style.display = t ? "" : "none"; if (t && !keep && !/red|button/.test(t)) HO.hintT = setTimeout(() => h.classList.add("fade"), hoPhone() ? 4000 : 9000); }
function hoFloat(part, text, kind) {
  if (hoPhone()) document.querySelectorAll("#ho .hofloat").forEach(x => x.remove());
  const a = hoAnchorScreen(part); const el = document.createElement("div"); el.className = "hofloat " + (kind || ""); el.innerHTML = text; $("#ho").appendChild(el);
  const x = a ? a.x : innerWidth * 0.35, y = a ? a.y : innerHeight * 0.4; el.style.left = Math.max(10, Math.min(innerWidth - 270, x + 14)) + "px"; el.style.top = Math.max(60, y - 30) + "px";
  setTimeout(() => el.classList.add("off"), 3600); setTimeout(() => el.remove(), 4200);
}
function hoLens(title, html, anchorPart, opts = {}) {
  const L = $("#hoLens"); if (!L) return; if (!title) { L.classList.add("hidden"); HO.lensLocked = false; return; }
  HO.lensLocked = !!opts.locked; $("#hoLensX").style.display = opts.locked ? "none" : ""; $("#hoLensTitle").innerHTML = title; $("#hoLensBody").innerHTML = html || ""; L.classList.remove("hidden"); L.classList.toggle("wide", !!opts.wide);
  const a = anchorPart ? hoAnchorScreen(anchorPart) : null; HO.lensAnchor = anchorPart || null;
  if (a && innerWidth > 760) { L.style.left = Math.max(10, Math.min(innerWidth - L.offsetWidth - 10, a.x - L.offsetWidth / 2)) + "px"; L.style.top = Math.max(56, Math.min(innerHeight - L.offsetHeight - 90, a.y - L.offsetHeight - 30)) + "px"; } else { L.style.left = ""; L.style.top = ""; }
  return $("#hoLensBody");
}

/* ---------------- anchors → screen ---------------- */
function hoAnchorWorld(part) {
  const p = HO.p; if (!p || !p.npc || !p.npc.pet) return null; const A = HO_ANCH[p.species] || HO_ANCH.dog; const l = A[part]; if (!l) return null;
  const g = p.npc.pet.group; const rz = g.rotation.z || 0, ry = g.rotation.y || 0; const s = g.scale || { x: 1, y: 1, z: 1 };
  let x = l[0] * (s.x || 1), y = l[1] * (s.y || 1), z = l[2] * (s.z || 1);
  if (Math.abs(l[0]) > 0.015) { const cam = World.camera; if (cam) { const dx = cam.position.x - g.position.x, dz = cam.position.z - g.position.z, dyc = cam.position.y - g.position.y; const ux = dx * Math.cos(ry) - dz * Math.sin(ry); const lx = ux * Math.cos(rz) + dyc * Math.sin(rz); if (lx < 0) x = -x; } }
  const x1 = x * Math.cos(rz) - y * Math.sin(rz), y1 = x * Math.sin(rz) + y * Math.cos(rz); const x2 = x1 * Math.cos(ry) + z * Math.sin(ry), z2 = -x1 * Math.sin(ry) + z * Math.cos(ry);
  return { x: g.position.x + x2, y: g.position.y + y1, z: g.position.z + z2 };
}
function hoAnchorScreen(part) { if (HO.stationAnch && HO.stationAnch[part]) { const w = HO.stationAnch[part]; return World.project(w[0], w[1], w[2]); } const w = hoAnchorWorld(part); return w ? World.project(w.x, w.y, w.z) : null; }
function hoActiveParts() {
  const r = HO.room; if (HO.need && HO.need.parts) return HO.need.parts;
  if (r === "examTable" || r === "wardTable" || r === "kennel") { const t = HO.tool; const sp = HO.p && HO.p.species;
    if (t === "steth") return ["heart", "lungCr", "lungCd"]; if (t === "thermo") return ["tail"]; if (t === "light" || t === "fluor") return ["eye"]; if (t === "oto") return ["ear"]; if (t === "comb") return ["back"]; if (t === "treat") return ["mouth"]; if (t === "towel") return ["back", "scruff"];
    return ["eye", "ear", "mouth", "lymph", "ribs", "abdCr", "abdMid", "abdCd", "femoral", "leg", "hind", "back", "scruff", "tail"].filter(k => !(sp === "bird" && (k === "femoral" || k === "scruff")) && !(sp === "tortoise" && (k === "lymph" || k === "abdCr" || k === "abdCd"))); }
  return [];
}
function hoUpdate() {
  const host = $("#hoHot"); if (!host) return; const parts = hoActiveParts(); const show = G.s.settings.hoDots !== false;
  let html = ""; if (show) parts.forEach(k => { const a = hoAnchorScreen(k); if (a && !a.behind) html += `<i class="hodot ${HO.need && HO.need.done && HO.need.done.includes(k) ? "ok" : ""}" style="left:${a.x}px;top:${a.y}px" title="${HO_PARTLABEL[k] || k}"></i>`; });
  if (HO.need && HO.need.guide) { const a = hoAnchorScreen(HO.need.guide[0]), b = hoAnchorScreen(HO.need.guide[1]); if (a && b) html += `<svg class="hoguide" width="${innerWidth}" height="${innerHeight}"><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/></svg>`; }
  if (host.dataset.h !== html) { host.dataset.h = html; host.innerHTML = html; }
  if (HO.lensAnchor && innerWidth > 760 && !$("#hoLens").classList.contains("hidden") && !HO.lensMoved) { /* lens stays where it opened */ }
  if (HO.mon) hoMonTick();
  if (HO.paint) hoPaintDraw();
  const st = HO_STATIONS[HO.room]; if (st && HO.p && HO.p.status !== st.status && !G.panelOpen && !HO.lensLocked && !HO.closing) { HO.closing = true; setTimeout(() => { HO.closing = false; if (HO.on && HO.p && HO.p.status !== st.status && !G.panelOpen) hoClose(); }, 400); }
}

/* ---------------- pointer handling ---------------- */
function hoNearest(x, y, parts, maxD = 64) { let best = null, bd = maxD; (parts || hoActiveParts()).forEach(k => { const a = hoAnchorScreen(k); if (!a || a.behind) return; const d = Math.hypot(a.x - x, a.y - y); if (d < bd) { bd = d; best = k; } }); return best; }
function hoCursor(x, y, show) { const c = $("#hoCursor"); if (!c) return; if (!show) { c.style.display = "none"; return; } c.style.display = "block"; c.style.left = x + "px"; c.style.top = y + "px"; c.innerHTML = hoIcon(HO.tool, 34); }
function hoPointerDown(e) {
  if (!HO.on || G.paused) return; e.preventDefault(); const x = e.clientX, y = e.clientY;
  HO.ptrs = HO.ptrs || {}; HO.ptrs[e.pointerId] = { x, y };
  if (Object.keys(HO.ptrs).length >= 2 || e.button === 2) { if (HO.hold) { const h = HO.hold; HO.hold = null; if (h.end) h.end(); } HO.orb = { x, y, d: hoPinchDist() }; return; }
  HO.down = { x, y, t: performance.now() };
  if (!HO.paint && !(HO.need && HO.need.drag && HO.tool === "scalpel") && !hoNearest(x, y, null, 80) && !(HO.need && HO.need.surgical && hoNearest(x, y, HO.need.parts, 110))) { HO.orb = { x, y, d: 0, maybe: true }; return; }
  if (HO.paint) return hoPaintStart(x, y);
  if (HO.room === "orTable" && HO.need && HO.need.surgical) {
    if (HO.mon && HO.mon.ev) return toast("Deal with the anaesthetic problem first — check the monitor.", "warn");
    if (!HO.tool) return hoFloatAt(x, y, "Pick an instrument from the Mayo stand first.");
    if (HO.need.drag && HO.tool === "scalpel" && HO.need.guide) return hoDragStart(x, y);
    const sp = hoNearest(x, y, HO.need.parts, 110); if (!sp) return hoFloatAt(x, y, "Use it on the surgical site (the glowing dot).");
    return hoSurgUse(HO.p, HO.tool);
  }
  const part = hoNearest(x, y); hoCursor(x, y, HO.tool !== "hand");
  if (!part) { if (HO.room === "examTable") hoFloatAt(x, y, "Tap a body part — the faint dots show where."); return; }
  if (HO.room === "examTable" || HO.room === "wardTable" || HO.room === "kennel") hoExamAct(part, x, y, true);
  else if (HO.room === "prepTable" || HO.room === "orTable") hoNeedAct(part, x, y, true);
}
function hoPinchDist() { const v = Object.values(HO.ptrs || {}); return v.length >= 2 ? Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y) : 0; }
function hoPointerMove(e) { if (!HO.on) return; const x = e.clientX, y = e.clientY;
  if (HO.ptrs && HO.ptrs[e.pointerId]) HO.ptrs[e.pointerId] = { x, y };
  if (HO.orb) { const O = HO.orb; const dx = x - O.x, dy = y - O.y; if (O.maybe && Math.hypot(dx, dy) < 6) return; O.maybe = false; const d = hoPinchDist(); hoOrbitBy(-dx * 0.008, dy * 0.005, O.d && d ? O.d / d : 1); O.x = x; O.y = y; if (d) O.d = d; return; } if (HO.paint && HO.paint.active) return hoPaintMove(x, y); if (HO.drag) return hoDragMove(x, y); if (HO.hold) { hoCursor(x, y, true); if (HO.hold.move) HO.hold.move(x, y); } }
function hoPointerUp(e) { if (!HO.on) return; if (HO.ptrs && e && e.pointerId !== undefined) delete HO.ptrs[e.pointerId];
  if (HO.orb) { const O = HO.orb; HO.orb = null; if (O.maybe && HO.room === "examTable" && HO.down) hoFloatAt(HO.down.x, HO.down.y, "Tap a body part — or drag here to walk round the table."); return; } if (HO.paint && HO.paint.active) return hoPaintEnd(); if (HO.drag) return hoDragEnd(); if (HO.hold) { const h = HO.hold; HO.hold = null; if (h.end) h.end(); } hoCursor(0, 0, false); }
function hoFloatAt(x, y, text) { const el = document.createElement("div"); el.className = "hofloat dim"; el.textContent = text; el.style.left = Math.min(innerWidth - 270, x + 12) + "px"; el.style.top = y - 20 + "px"; $("#ho").appendChild(el); setTimeout(() => el.classList.add("off"), 1500); setTimeout(() => el.remove(), 2000); }
/* timed reading: tap once, the instrument stays in place and reads by itself */
function hoTimed(ms, label, part, onDone) {
  if (HO.timing) return hoFloat(part, "Wait for the current reading to finish."); HO.timing = true;
  const a = hoAnchorScreen(part) || HO.down; const clk = hoClock(); const ring = document.createElement("div"); ring.className = "horing"; ring.innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16"/><circle class="p" cx="20" cy="20" r="16"/></svg><span>${label}</span>`; $("#ho").appendChild(ring);
  const timer = setInterval(() => { const b = hoAnchorScreen(part) || a; ring.style.left = b.x + "px"; ring.style.top = b.y + "px"; const k = Math.min(1, clk() / ms); ring.querySelector(".p").style.strokeDashoffset = 100.5 * (1 - k); if (k >= 1 || !HO.on) { clearInterval(timer); ring.remove(); HO.timing = false; if (HO.on) onDone(); } }, 50);
}
/* hold helper: progress ring at the pointer */
/* real-time stopwatch that stops while the game is paused (frame-rate independent) */
function hoClock() { let el = 0, last = performance.now(); return () => { const n = performance.now(); if (!G.paused) el += n - last; last = n; return el; }; }
function hoHoldStart(ms, label, onDone, opts = {}) {
  const clk = hoClock(); const ring = document.createElement("div"); ring.className = "horing"; ring.innerHTML = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16"/><circle class="p" cx="20" cy="20" r="16"/></svg><span>${label}</span>`; $("#ho").appendChild(ring);
  const place = (x, y) => { ring.style.left = x + "px"; ring.style.top = y + "px"; }; place(HO.down.x, HO.down.y);
  const timer = setInterval(() => { const k = Math.min(1, clk() / ms); ring.querySelector(".p").style.strokeDashoffset = 100.5 * (1 - k); if (opts.tick) opts.tick(k); if (k >= 1) { clearInterval(timer); ring.remove(); HO.hold = null; hoCursor(0, 0, false); onDone(); } }, 50);
  HO.hold = { move: (x, y) => { place(x, y); if (opts.move) opts.move(x, y); }, end: () => { clearInterval(timer); ring.remove(); if (opts.cancel) opts.cancel(); } };
}

/* =====================================================================
   EXAM ROOM
   ===================================================================== */
function hoExamStart(p) {
  if (!p.vitals) p.vitals = genVitals(p); p.cueChecked = true; p.ho = p.ho || { find: [], asked: 0, q: 0, acts: 0, lungs: [], abd: [], heart: false, temp: false, pulse: false, mouth: false, eye: false, ear: false, leg: false, coat: false, bcs: false, lymph: false, bedside: 0, treats: 0 };
  const n = p.npc.rig; HO.ownerHome = [n.group.position.x, n.group.position.z, n.group.rotation.y]; n.group.position.set(6.95, 0, -8.15); n.group.rotation.y = 0;
  hoTools(["hand", "steth", "thermo", "light", "oto", "fluor", "comb", "treat"].concat(["cat", "bird", "rabbit"].includes(p.species) ? ["towel"] : []));
  hoToolChanged(); hoExamTablet(p); hoFearUI(p);
  if (!p.examDone.observe) { hoHint(`Watch ${p.name} for a moment before you touch — posture, gait, breathing…`); setTimeout(() => { if (!HO.on || HO.p !== p || p.examDone.observe) return; if (p.ho.acts > 0) { p.ho.find.push("Observation skipped — you touched first."); } hoMark(p, "observe", `Observation: ${hoObserve(p)} RR ${Math.round(p.vitals.rr)}/min.`); hoToolChanged(); }, 3200); }
  setTimeout(() => hoOwnerSay(p, pick([`Hi doctor. ${p.name} is ${/^female/.test(p.sex) ? "a bit nervous" : "a bit nervous"} today.`, `Thank you for seeing us.`, `Be gentle with ${hoPron(p).him}, please.`])), 900);
}
function hoExamLite(p) { if (!p.vitals) p.vitals = genVitals(p); p.ho = p.ho || { find: [], asked: 0, q: 0, acts: 0, lungs: [], abd: [], bedside: 0, treats: 0 }; hoToolChanged(); }
function hoPron(p) { const f = /female/.test(p.sex || ""); return { he: f ? "she" : "he", He: f ? "She" : "He", him: f ? "her" : "him", his: f ? "her" : "his" }; }
function hoObserve(p) { const s = hoSymptomsFor(p); const bits = []; if (s.includes("limpFront")) bits.push("not bearing weight on a front leg"); if (s.includes("limpHind")) bits.push("not using a hind leg properly"); if (s.includes("headTilt")) bits.push("head tilted, rolling"); if (s.includes("pant")) bits.push("panting / increased breathing effort"); if (s.includes("lethargic")) bits.push("quiet and dull"); if (s.includes("fluffed")) bits.push("fluffed up, tail bobbing"); if (s.includes("squint")) bits.push("squinting one eye"); if (s.includes("bloated")) bits.push("distended abdomen"); if (s.includes("earSwollen")) bits.push("one ear flap swollen"); if (s.includes("fleas")) bits.push("scratching"); return bits.length ? bits.join(", ") + "." : "bright, alert, normal gait and breathing."; }
function hoOwnerSay(p, text) { const n = p.npc && p.npc.rig; if (!n) return; say(() => n.group.position, text, 3.2); }
function hoMark(p, step, finding) { if (finding && !p.ho.find.includes(finding)) p.ho.find.push(finding); if (step && !p.examDone[step]) { p.examDone[step] = true; Sound.success(); if (step === "ausc" && p.hidden && p.hidden.murmur) { p.murmurFound = true; addXP(10, "murmur detected"); } if (step === "msk" && p.secondary) p.secondaryFound = true; addXP(4); } hoExamTablet(p); }
function hoFearUI(p) { const f = Math.max(0, Math.min(1, p.fear || 0)); const el = $("#hoFear"); if (el) el.innerHTML = `<span class="fearbar" title="Fear"><i style="width:${Math.round(f * 100)}%;background:${f > 0.7 ? "#ff5f7a" : f > 0.4 ? "#f2c14e" : "#7ef29a"}"></i></span> ${f > 0.7 ? "Scared" : f > 0.4 ? "Uneasy" : "Calm"}`; if (p.npc) p.npc.petMood = f > 0.7 ? "angry" : f > 0.45 ? "tense" : "calm"; }
function hoFearAdd(p, d) {
  p.fear = Math.max(0, Math.min(1, (p.fear || 0.3) + d)); hoFearUI(p);
  if (p.fear > 0.9 && !p.ho.fought) { p.ho.fought = true; Sound.petAngry(p.species); hoOwnerSay(p, `Careful! ${hoPron(p).He} doesn't like that!`); uiFightBack(p, () => { p.fear = 0.5; hoFearUI(p); hoExamTablet(p); }); return true; }
  return false;
}
function hoExamDoneAll(p) { return EXAM_STEPS.every(s => p.examDone[s.id]); }
function hoExamTablet(p) {
  if (!HO.on || HO.room !== "examTable") return; const sp = SPECIES[p.species]; const c = p.caseDef; const pr = hoPron(p); const done = p.examDone;
  if (hoExamDoneAll(p) && p.ho.planShown) return renderExam(p);
  const qs = hoHistoryQs(p); const h = p.ho; const av = ["bird", "tortoise"].includes(p.species); const tick = (ok, t) => `<span class="${ok ? "ok" : ""}">${ok ? "✓" : "○"} ${t}</span>`;
  const sub = { history: [tick((h.askedIdx || []).length >= 2, `ask ${p.ownerName} 2 questions`)], observe: [tick(done.observe, "watch for 3 s before touching")], tpr: [tick(h.temp, "temperature — thermometer on the tail end"), tick(h.pulse, av ? (p.species === "bird" ? "heart rate — stethoscope on the chest" : "heart rate — Doppler on the heart") : "pulse — hands on the inner thigh"), tick(done.observe, "breathing — from observation")], mm: [tick(h.mouth, "hands on the mouth → press the gum")], ausc: [tick(h.heart, "heart — low left chest"), tick((h.lungs || []).length >= 2, `both lung fields (${(h.lungs || []).length}/2)`)], palp: [tick((h.abd || []).length >= (av ? 1 : 2), `belly — ${(h.abd || []).length}/${av ? 1 : 2} regions`)].concat(av ? [] : [tick(h.lymph, "lymph nodes under the jaw")]), eyes: [tick(h.eye, "penlight on the eye"), tick(h.ear, "otoscope in the ear"), tick(h.mouth || av, "mouth")], msk: [tick(h.leg, "a leg (hands)"), tick(h.coat, "coat — comb or hands on the back")], bcs: [tick(h.bcs, "hands on the ribs")] };
  const steps = EXAM_STEPS.map(s => `<li class="${done[s.id] ? "done" : ""}">${done[s.id] ? icon("check", 14) : "○"} ${s.label}${!done[s.id] ? ` <button class="skipbtn" onclick="hoSkipStep(${p.id},'${s.id}')" title="A nurse does this test for you">Skip · ${HO_SKIP_COST} JD</button>` : ""}${!done[s.id] && sub[s.id] ? `<div class="hosub">${sub[s.id].join("")}</div>` : ""}</li>`).join("");
  const find = p.ho.find.map(f => `<li>${f}</li>`).join("") || "<li class='muted'>Nothing recorded yet — use your hands, eyes and ears.</li>";
  const vit = `<div class="hovit"><span>T <b>${p.ho.temp ? p.vitals.temp + " °C" : "—"}</b></span><span>P <b>${p.ho.pulse ? p.vitals.hr : "—"}</b></span><span>R <b>${done.observe ? Math.round(p.vitals.rr) : "—"}</b></span><span>Wt <b>${p.weight} kg</b></span><span>BCS <b>${p.ho.bcs ? hoClin(p).bcs + "/9" : "—"}</b></span></div>`;
  const keep = G.panelOpen && $("#panelBody .hofind") ? $("#panelBody").scrollTop : 0;
  const nDone = EXAM_STEPS.filter(s => done[s.id]).length; G.hoQuiet = true;
  openPanel(`${icon("folder", 18)} ${p.name} · ${sp.label}, ${p.breed} <span class="hoprog">${nDone}/${EXAM_STEPS.length}</span>`, `${p.reweigh ? `<div class="alarmbox">${icon("warn", 16)} Nurse wrote <b>${p.reweigh} kg</b>; the file says ${p.weight} kg. <button class="btn small" onclick="reweigh(${p.id});hoExamTablet(G.patients.find(x=>x.id===${p.id}))">Weigh on the table scale</button></div>` : ""}
    <p class="small"><b>Owner (${p.ownerName}):</b> “${c.complaint}”</p>${vit}
    <h4>Ask ${p.ownerName}</h4><div class="replies">${qs.map((q, i) => `<button class="btn small ${p.ho.askedIdx && p.ho.askedIdx.includes(i) ? "" : "primary"}" onclick="hoAsk(${p.id},${i})">${q.q}</button>`).join("")}</div>
    <h4>Findings</h4><ul class="hofind">${find}</ul>
    <h4>Exam</h4><ul class="hosteps">${steps}</ul>
    <div class="btnrow">${hoExamDoneAll(p) ? `<button class="btn primary" onclick="hoPlan(${p.id})">${icon("check", 16)} Assessment & plan</button>` : `<span class="muted small">Finish every exam step to make your assessment.</span>`}</div>`, { side: true, noClose: true });
  G.hoQuiet = false; if (keep) $("#panelBody").scrollTop = keep;
}
function hoPlan(id) { const p = G.patients.find(x => x.id === id); p.ho.planShown = true; const b = p.ho.bedside || 0; if (!p.ho.bedsideScored) { p.ho.bedsideScored = true; if (b >= 2) { rep(0.06, "great bedside manner"); p.record.push(`${clockStr()} — Communication with ${p.ownerName}: excellent.`); } else if (b < 0) { rep(-0.05, "poor bedside manner"); p.record.push(`${clockStr()} — Communication with ${p.ownerName}: the owner felt brushed off.`); } } renderExam(p); }
function hoHistoryQs(p) {
  const o = HO_CLIN[p.caseDef.id] || {}; const vaxUnknown = p.intake && /Unknown/.test(p.intake.vax); const pr = hoPron(p);
  return [
    { q: "When did it start?", a: p.caseDef.outcome === "checkup" && /vaccin|check|well/i.test(p.caseDef.complaint) ? "Nothing's wrong — it's just the routine check." : (o.hx1 || `${p.caseDef.complaint.replace(/\.$/, "")} — it started ${pick(["yesterday", "two days ago", "this morning", "a few days ago"])}.`) },
    { q: "Eating, drinking, toilet?", a: o.hx2 || (p.caseDef.outcome === "checkup" && !p.caseDef.emergency ? `Eating and drinking normally, toilet normal.` : `${pr.He}'s eating less than usual; drinking and toilet about normal.`) },
    { q: "Vaccines, medicines, diet?", a: vaxUnknown ? "Hmm… I'm not sure about the vaccines, maybe two years ago?" : (o.hx3 || `Vaccines are up to date, no medicines. ${p.species === "bird" ? "Seed mix and some fruit." : p.species === "rabbit" ? "Hay, pellets and greens." : p.species === "tortoise" ? "Lettuce and fruit mostly." : "Normal pet food."}`) }
  ];
}
function hoAsk(id, i) {
  const p = G.patients.find(x => x.id === id); if (!p) return; const qs = hoHistoryQs(p); p.ho.askedIdx = p.ho.askedIdx || []; if (!p.ho.askedIdx.includes(i)) p.ho.askedIdx.push(i);
  hoOwnerSay(p, qs[i].a); const f = `Owner: ${qs[i].a}`; if (!p.ho.find.includes(f)) p.ho.find.push(f);
  if (p.ho.askedIdx.length >= 2 && !p.examDone.history) hoMark(p, "history"); else hoExamTablet(p);
}
const HO_OWNER_QS = [
  { q: "Is {he} in pain?", a: [["{He} may be a little sore — I'll make sure {he} has pain relief, and I'll explain everything I find as I go.", 1], ["Pain is multifactorial; we'll score it with a validated composite pain scale.", 0], ["Animals don't really feel pain like we do.", -1]] },
  { q: "Is it serious, doctor?", a: [["I don't know yet — let me finish the exam and then I'll go through the options with you honestly.", 1], ["The differential list includes several aetiologies.", 0], ["Could be anything, really.", -1]] },
  { q: "Can I hold {him} while you check?", a: [["Yes please — stand by {his} head and talk to {him}; it really helps {him} relax.", 1], ["Only if you sign a waiver.", 0], ["No. Owners always get bitten.", -1]] },
  { q: "How much is this going to cost?", a: [["Let me finish the exam, then I'll give you a written estimate before we do anything.", 1], ["Don't worry about money right now.", 0], ["A lot.", -1]] },
  { q: "Did I do something wrong?", a: [["Not at all — this can happen to any pet, and you did the right thing bringing {him} in.", 1], ["Hard to say.", 0], ["You should have come sooner.", -1]] },
  { q: "What are you doing now?", a: [["Checking {his} heart, gums and tummy — it's all part of a full check, and so far I'll tell you what I find.", 1], ["Routine stuff.", 0], ["Please don't distract me.", -1]] }
];
function hoAskHide() { const c = $("#hoAsk"); if (c) { c.classList.add("hidden"); c.innerHTML = ""; } }
function hoOwnerQuestion(p) {
  if (p.ho.q >= 2 || ($("#hoAsk") && !$("#hoAsk").classList.contains("hidden"))) return; const pr = hoPron(p); const fill = (t) => t.replace(/\{He\}/g, pr.He).replace(/\{he\}/g, pr.he).replace(/\{him\}/g, pr.him).replace(/\{his\}/g, pr.his);
  const q = HO_OWNER_QS[(p.id * 3 + p.ho.q * 2) % HO_OWNER_QS.length]; p.ho.q++; hoOwnerSay(p, fill(q.q));
  const order = [0, 1, 2].sort(() => Math.random() - 0.5);
  setTimeout(() => { if (!HO.on || HO.p !== p) return; const card = $("#hoAsk"); card.innerHTML = `<div class="ownerq"><b>${icon("user", 14)} ${p.ownerName}: “${fill(q.q)}”</b>${order.map(k => `<button class="btn small opt" data-k="${k}">${fill(q.a[k][0])}</button>`).join("")}</div>`; card.classList.remove("hidden");
    card.querySelectorAll(".opt").forEach(b => b.onclick = () => { hoAskHide(); const sc = q.a[+b.dataset.k][1]; p.ho.bedside += sc; Sound.click(); hoOwnerSay(p, sc > 0 ? pick(["Thank you, that helps.", "OK… thank you, doctor.", "That's reassuring."]) : sc < 0 ? pick(["…Oh. OK.", "That's not very reassuring.", "Hmm."]) : "I see…"); if (sc > 0) addXP(5, "good communication"); hoExamTablet(p); }); }, 700);
}

/* the actual hands-on actions */
function hoExamAct(part, x, y) {
  const p = HO.p; if (!p) return; const t = HO.tool; const c = hoClin(p); const pr = hoPron(p); const sp = p.species;
  p.ho.acts++; if (p.ho.acts === 4 || p.ho.acts === 11) setTimeout(() => hoOwnerQuestion(p), 1800);
  const now = performance.now(); p.ho.tapTimes = (p.ho.tapTimes || []).filter(tt => now - tt < 1500); p.ho.tapTimes.push(now); if (p.ho.tapTimes.length > 4) { if (hoFearAdd(p, 0.12)) return; hoFloat(part, "Slow down — quick grabs scare patients.", "warn"); }
  if (HO.room !== "examTable") { /* ward / kennel quick checks */ if (t === "steth") return hoListen(part); hoFloat(part, part === "mouth" ? `Gums ${p.vitals.mm}.` : `${HO_PARTLABEL[part]}: ${c[part] || "normal."}`); return; }
  if (t === "treat") { if (p.ho.treats >= 3) return hoFloat(part, "That's enough treats!"); p.ho.treats++; Sound.squeak(); hoFearAdd(p, -0.15); hoOwnerSay(p, pick([`${pr.He} loves those!`, "Aww, look at that!", "Good " + (/female/.test(p.sex) ? "girl" : "boy") + "!"])); return hoFloat("mouth", "Treat accepted — calmer.", "good"); }
  if (t === "towel") { if (p.ho.towel) return hoFloat(part, "Already wrapped."); p.ho.towel = true; hoFearAdd(p, -0.2); hoOwnerSay(p, sp === "cat" ? "A purrito!" : "Oh, that's clever."); return hoFloat(part, "Gentle towel wrap — much calmer.", "good"); }
  if (t === "steth") return hoListen(part);
  if (t === "thermo") { if (part !== "tail") return hoFloat(part, "Temperature is taken at the tail end."); return hoTimed(2600, sp === "bird" ? "cloacal…" : "reading…", "tail", () => { Sound.beep(); p.ho.temp = true; hoFearAdd(p, sp === "cat" ? 0.12 : 0.08); hoOwnerSay(p, pick([`Oh no, ${p.name} hates that!`, "Poor thing!", "Is the temperature OK?"])); hoFloat(part, `${p.vitals.temp} °C`, p.vitals.temp > SPECIES[sp].vitals.temp[1] + 0.3 ? "warn" : p.vitals.temp < SPECIES[sp].vitals.temp[0] - 0.3 ? "warn" : "good"); hoAfterTPR(p); }); }
  if (t === "light") { if (part !== "eye") return; p.ho.eye = true; hoEyeLens(p, false); return hoCheckEyesStep(p); }
  if (t === "fluor") { if (part !== "eye") return; p.ho.stain = true; hoEyeLens(p, true); return; }
  if (t === "oto") { if (part !== "ear") return hoFloat(part, "The otoscope is for ears."); hoFearAdd(p, 0.06); p.ho.ear = true; hoEarLens(p); return hoCheckEyesStep(p); }
  if (t === "comb") { if (part !== "back") return; p.ho.coat = true; const txt = c.coat; hoFloat(part, txt, /flea|tick/i.test(txt) ? "warn" : "good"); p.ho.find.includes("Coat: " + txt) || p.ho.find.push("Coat: " + txt); return hoCheckMsk(p); }
  /* hands */
  if (part === "hind" && !p.ho.pulse && sp !== "bird" && sp !== "tortoise") part = "femoral";
  if (part === "femoral" && ["bird", "tortoise"].includes(sp)) return hoFloat(part, sp === "bird" ? "Birds have no pulse you can feel here — use the stethoscope on the chest to count the heart rate." : "Use the Doppler on the heart (between the neck and front leg) to count the heart rate.", "warn");
  if (part === "femoral") { return hoTimed(2200, "counting pulse…", "femoral", () => { p.ho.pulse = true; const weak = /pale|white/.test(p.vitals.mm) || (p.vitals.crt && parseFloat(p.vitals.crt) >= 2.5); hoFloat(part, `Pulse ${p.vitals.hr}/min — ${weak ? "weak and thready" : "strong, synchronous"}`, weak ? "warn" : "good"); hoAfterTPR(p); }); }
  if (part === "mouth") { if (sp === "bird" || sp === "tortoise") { p.ho.mouth = true; hoFloat(part, c.mouthText); p.ho.find.push("Mouth: " + c.mouthText); hoMark(p, "mm", `Mucous membranes: ${p.vitals.mm}.`); return hoCheckEyesStep(p); } return hoMouthLens(p); }
  if (part === "eye") return hoFloat(part, "Use the penlight to look at the eye.");
  if (part === "ear") { const tx = c.ear === "haematoma" ? "Ear flap thick, warm and fluid-filled." : "Ear flap normal. Use the otoscope to look inside."; return hoFloat(part, tx, c.ear === "haematoma" ? "warn" : ""); }
  if (part === "lymph") { p.ho.lymph = true; hoFloat(part, `Lymph nodes: ${c.lymph}`, c.lymph !== "Normal size." ? "warn" : "good"); p.ho.find.includes("Nodes: " + c.lymph) || p.ho.find.push("Nodes: " + c.lymph); return hoCheckPalp(p); }
  if (part.startsWith("abd")) { if (!p.ho.abd.includes(part)) p.ho.abd.push(part); const pain = c.pain.includes(part); if (pain) { Sound.petAngry(sp); if (hoFearAdd(p, 0.1)) return; hoOwnerSay(p, "Is that where it hurts?"); } hoFloat(part, c[part], pain ? "warn" : "good"); const f = `${HO_PARTLABEL[part]}: ${c[part]}`; p.ho.find.includes(f) || p.ho.find.push(f); return hoCheckPalp(p); }
  if (part === "leg" || part === "hind") { p.ho.leg = true; const pain = c.pain.includes(part); if (pain) { Sound.petAngry(sp); if (hoFearAdd(p, 0.1)) return; } hoFloat(part, c[part], pain || !/Full range/.test(c[part]) ? "warn" : "good"); const f = `${HO_PARTLABEL[part]}: ${c[part]}`; p.ho.find.includes(f) || p.ho.find.push(f); return hoCheckMsk(p); }
  if (part === "back") { p.ho.coat = true; hoFloat(part, c.back, /Smooth/.test(c.back) ? "good" : "warn"); const f = `Back: ${c.back}`; p.ho.find.includes(f) || p.ho.find.push(f); return hoCheckMsk(p); }
  if (part === "scruff") { hoFloat(part, c.tent, /snaps/.test(c.tent) ? "good" : "warn"); const f = `Hydration: ${c.tent}`; p.ho.find.includes(f) || p.ho.find.push(f); return hoExamTablet(p); }
  if (part === "ribs") { p.ho.bcs = true; const b = c.bcs; const txt = sp === "bird" ? `Keel ${b <= 3 ? "sharp — thin" : b >= 7 ? "buried in fat" : "just palpable — good"}` : sp === "tortoise" ? `Weight-for-length ${b <= 3 ? "low" : "acceptable"}` : `Ribs ${b <= 3 ? "easily felt, little cover" : b >= 7 ? "hard to feel under fat" : "felt with light pressure"}`; hoFloat(part, `${txt} → BCS ${b}/9`, b === 4 || b === 5 ? "good" : "warn"); return hoMark(p, "bcs", `Body condition ${b}/9.`); }
  if (part === "tail") { hoFloat(part, c.tail, c.tail === "Normal." ? "" : "warn"); if (c.tail !== "Normal.") p.ho.find.includes("Tail end: " + c.tail) || p.ho.find.push("Tail end: " + c.tail); return hoExamTablet(p); }
}
function hoAfterTPR(p) { if (p.ho.temp && p.ho.pulse) hoMark(p, "tpr", `TPR: ${p.vitals.temp} °C, ${p.vitals.hr}/min, ${Math.round(p.vitals.rr)}/min.`); else { hoExamTablet(p); hoHint(!p.ho.pulse ? (["bird", "tortoise"].includes(p.species) ? `Now the heart rate: choose the <b>${p.species === "bird" ? "Stethoscope" : "Doppler"}</b> and hold it on the chest.` : `Now the pulse: choose <b>Hands</b> and tap the inner thigh of the back leg.`) : `Now the temperature: choose the <b>Thermometer</b> and tap the tail end.`, true); } }
function hoCheckEyesStep(p) { if (p.ho.eye && p.ho.ear && (p.ho.mouth || ["bird", "tortoise"].includes(p.species))) hoMark(p, "eyes"); else hoExamTablet(p); }
function hoCheckPalp(p) { if (p.ho.abd.length >= (["bird", "tortoise"].includes(p.species) ? 1 : 2) && (p.ho.lymph || ["bird", "tortoise"].includes(p.species))) hoMark(p, "palp"); else hoExamTablet(p); }
function hoCheckMsk(p) { if (p.ho.leg && p.ho.coat) hoMark(p, "msk", p.secondary ? `Also: ${p.secondary}.` : null); else hoExamTablet(p); }

/* pay a nurse to do one test for you */
const HO_SKIP_COST = 5;
function hoSkipTrayBtn() { return `<button class="hotool skip" onclick="hoSkipNeed()">${icon("user", 20)}<span>Nurse · ${HO_SKIP_COST} JD</span></button>`; }
function hoPay(what) { if (G.s.money < HO_SKIP_COST) { toast(`You need ${HO_SKIP_COST} JD to have the nurse do that.`, "warn"); return false; } G.s.money -= HO_SKIP_COST; updateHUD(); Sound.cash(); G.s.skipsPaid = (G.s.skipsPaid || 0) + 1; toast(`${icon("user", 16)} The nurse did the ${what} for you (−${HO_SKIP_COST} JD).`, "info", 2500); return true; }
function hoSkipStep(id, step) {
  const p = G.patients.find(x => x.id === id); if (!p || p.examDone[step]) return; const lab = (EXAM_STEPS.find(s => s.id === step) || {}).label || step; if (!hoPay(lab.toLowerCase())) return;
  const c = hoClin(p); const h = p.ho; const add = (f) => { if (!h.find.includes(f)) h.find.push(f); }; const av = ["bird", "tortoise"].includes(p.species);
  if (step === "history") { const qs = hoHistoryQs(p); h.askedIdx = [0, 1, 2]; qs.forEach(q => add(`Owner: ${q.a}`)); }
  if (step === "tpr") { h.temp = h.pulse = true; }
  if (step === "mm") { h.mouth = true; add(`Mouth: ${c.mouthText}`); }
  if (step === "ausc") { h.heart = true; h.lungs = ["lungCr", "lungCd"]; if (av) h.pulse = true; const mur = p.hidden && p.hidden.murmur; add(`Heart: ${p.vitals.hr}/min.${c.heartExtra === "gallop" ? " Gallop rhythm." : ""}${mur ? " Soft systolic murmur, left apex." : " No murmur."}`); add(`Lungs: ${c.lungs === "wheeze" ? "Expiratory wheezes." : c.lungs === "crackles" ? "Crackles." : c.lungs === "harsh" ? "Harsh, fast breath sounds." : "Clear, normal breath sounds."}`); }
  if (step === "palp") { h.abd = ["abdCr", "abdMid", "abdCd"]; h.lymph = true; ["abdCr", "abdMid", "abdCd"].forEach(k => add(`${HO_PARTLABEL[k]}: ${c[k]}`)); if (!av) add(`Nodes: ${c.lymph}`); }
  if (step === "eyes") { h.eye = h.ear = h.mouth = true; add(`Eye: ${c.eyeText || (c.eye === "normal" ? "Clear cornea, pupils equal and responsive." : "Abnormal — see the eye yourself for detail.")}`); add(`Ear: ${c.earText || "Clean canal, intact eardrum."}`); add(`Mouth: ${c.mouthText}`); }
  if (step === "msk") { h.leg = h.coat = true; add(`Front leg: ${c.leg}`); add(`Hind leg: ${c.hind}`); add(`Coat: ${c.coat}`); }
  if (step === "bcs") { h.bcs = true; }
  const extra = step === "tpr" ? `TPR: ${p.vitals.temp} °C, ${p.vitals.hr}/min, ${Math.round(p.vitals.rr)}/min.` : step === "mm" ? `Mucous membranes ${p.vitals.mm}, CRT ${p.vitals.crt}.` : step === "bcs" ? `Body condition ${c.bcs}/9.` : step === "observe" ? `Observation: ${hoObserve(p)} RR ${Math.round(p.vitals.rr)}/min.` : null;
  p.record.push(`${clockStr()} — ${lab}: done by the nurse.`); hoMark(p, step, extra);
}
function hoSkipNeed() {
  if (HO.paint) { if (!hoPay(HO.paint.tool === "clip" ? "clipping" : "scrub")) return; const P = HO.paint; HO.paint = null; Sound.clipper(false); hoPaintClear(); hoHint(""); P.done(true, true); return; }
  const N = HO.need; if (!N || N.surgical) return; if (!hoPay(N.label ? N.label.split(/[:—.]/)[0].toLowerCase() : "step")) return; HO.need = null; hoHint(""); N.onDone();
}

/* stethoscope / doppler: real-time sound tied to position */
function hoListen(part) {
  const p = HO.p; const sp = p.species; const c = hoClin(p); if (!["heart", "lungCr", "lungCd"].includes(part)) return hoFloat(part, "Listen over the chest.");
  const purring = sp === "cat" && !p.ho.purrStopped && (p.ho.purrs === undefined ? (p.ho.purrs = Math.random() < 0.55) : p.ho.purrs);
  if (purring) { Sound.purr(true, 0.4); hoHint(`${p.name} is purring — you can't hear the heart over it. <button class="btn small" onclick="hoTapTrick()">Turn on the tap</button> (running water usually stops a purr)`); }
  const hrPlay = Math.min(sp === "bird" ? 200 : 180, p.vitals.hr); let pos = { x: HO.down.x, y: HO.down.y }; const murmur = p.hidden && p.hidden.murmur;
  const beat = () => { if (!HO.listen) return; const h = hoAnchorScreen("heart"), l1 = hoAnchorScreen("lungCr"), l2 = hoAnchorScreen("lungCd"); const dh = h ? Math.hypot(h.x - pos.x, h.y - pos.y) : 999; const vh = Math.max(0, 1 - dh / 170); Sound.heart({ vol: 0.75 * vh, murmur: murmur && dh < 70, muffled: purring && !p.ho.purrStopped, gapScale: 160 / Math.max(80, hrPlay) }); };
  const breathT = setInterval(() => { if (!HO.listen) return; const l1 = hoAnchorScreen("lungCr"), l2 = hoAnchorScreen("lungCd"); const dl = Math.min(l1 ? Math.hypot(l1.x - pos.x, l1.y - pos.y) : 999, l2 ? Math.hypot(l2.x - pos.x, l2.y - pos.y) : 999); Sound.breath({ vol: 0.55 * Math.max(0, 1 - dl / 150), wheeze: c.lungs === "wheeze", crackle: c.lungs === "crackles" }); }, Math.max(900, 60000 / p.vitals.rr));
  HO.listen = { timer: setInterval(beat, 60000 / hrPlay), breathT };
  const which = () => { const h = hoAnchorScreen("heart"), l1 = hoAnchorScreen("lungCr"), l2 = hoAnchorScreen("lungCd"); const d = { heart: h ? Math.hypot(h.x - pos.x, h.y - pos.y) : 999, lungCr: l1 ? Math.hypot(l1.x - pos.x, l1.y - pos.y) : 999, lungCd: l2 ? Math.hypot(l2.x - pos.x, l2.y - pos.y) : 999 }; return Object.keys(d).sort((a, b) => d[a] - d[b])[0]; };
  const stop = () => { if (HO.listen) { clearInterval(HO.listen.timer); clearInterval(HO.listen.breathT); HO.listen = null; } Sound.purr(false); };
  hoHoldStart(sp === "bird" ? 2600 : 3200, "keep holding…", () => {
    const w = which(); stop();
    if (w === "heart") { if (purring && !p.ho.purrStopped) { hoFloat("heart", "Only purring — the heart is drowned out.", "warn"); return; } p.ho.heart = true; if (["bird", "tortoise"].includes(sp) && !p.ho.pulse) { p.ho.pulse = true; setTimeout(() => hoAfterTPR(p), 50); } const extra = (c.heartExtra === "gallop" ? " Gallop rhythm." : "") + (murmur ? " A soft systolic murmur, loudest at the left apex (grade II/VI)." : " No murmur."); hoFloat("heart", `Heart ${p.vitals.hr}/min, regular.${extra}`, murmur || c.heartExtra ? "warn" : "good"); p.ho.find.push(`Heart: ${p.vitals.hr}/min.${extra}`); }
    else { if (!p.ho.lungs.includes(w)) p.ho.lungs.push(w); const txt = c.lungs === "wheeze" ? "Expiratory wheezes." : c.lungs === "crackles" ? "Crackles." : c.lungs === "harsh" ? "Harsh, fast breath sounds." : "Clear, normal breath sounds."; hoFloat(w, txt, c.lungs === "normal" ? "good" : "warn"); const f = `Lungs: ${txt}`; p.ho.find.includes(f) || p.ho.find.push(f); }
    if (p.ho.heart && p.ho.lungs.length >= 2) hoMark(p, "ausc"); else { hoExamTablet(p); hoHint(!p.ho.heart ? "Now find the heart — low on the left chest, just behind the elbow." : "Listen to the other lung field too."); }
  }, { move: (x, y) => { pos = { x, y }; }, cancel: () => { stop(); hoFloat(which(), "Keep the stethoscope pressed on the chest for about 3 seconds.", "warn"); } });
}
function hoTapTrick() { const p = HO.p; if (!p) return; Sound.water(); p.ho.purrStopped = true; Sound.purr(false); hoHint("The purring stopped — listen to the heart now."); hoOwnerSay(p, "Ha, that actually worked!"); }

/* zoomed views: eye, ear, mouth (with capillary refill) */
function hoEyeLens(p, stained) {
  const c = hoClin(p); const e = c.eye; const iris = p.species === "dog" ? "#7a4a22" : p.species === "cat" ? "#c9a227" : p.species === "bird" ? "#2b2b2b" : "#5a3a20";
  const ulcer = e === "ulcer" || e === "indolent"; const show = stained && ulcer;
  const svg = `<svg viewBox="0 0 220 140" class="lenssvg"><defs><radialGradient id="sc"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${e === "conj" ? "#f4b4b4" : "#efe7e2"}"/></radialGradient></defs><rect width="220" height="140" fill="#2a2030"/><path d="M10 70 Q110 -10 210 70 Q110 150 10 70z" fill="url(#sc)"/><circle cx="110" cy="70" r="40" fill="${iris}"/><circle cx="110" cy="70" r="${p.ho.lit ? 9 : 16}" fill="#0c0a10" class="pupil"/><circle cx="96" cy="58" r="6" fill="#fff" opacity=".8"/>${e === "cherry" ? '<ellipse cx="28" cy="78" rx="18" ry="13" fill="#e8546a"/>' : ""}${ulcer ? `<path d="M118 52 q14 4 10 18 q-9 8 -18 0 q-4-12 8-18z" fill="${show ? "#58ff6a" : "#cfd6da"}" opacity="${show ? 0.9 : 0.55}"/>${e === "indolent" && show ? '<path d="M110 50 q22 -2 22 22" stroke="#58ff6a" stroke-width="3" fill="none" stroke-dasharray="3 2" opacity=".7"/>' : ""}` : ""}${e === "conj" ? '<path d="M14 72 q30 18 60 16" stroke="#e05a5a" stroke-width="3" fill="none"/>' : ""}${p.caseDef.id === "ecun_rabbit" ? '<path d="M70 120 l10 -6 l10 6 l10 -6" stroke="#f2c14e" fill="none"/>' : ""}</svg>`;
  const txt = stained ? (ulcer ? (e === "indolent" ? "Green stain under a loose lip of epithelium — non-healing (indolent) ulcer." : "A green-staining patch: a superficial corneal ulcer.") : "No stain uptake — the cornea is intact.") : (c.eyeText || (ulcer ? "Squinting; the cornea looks dull in one patch. Stain it to be sure." : e === "cherry" ? "A pink mass at the inner corner — the third-eyelid gland has prolapsed." : "Clear cornea, pupils equal and responsive to light."));
  setTimeout(() => { p.ho.lit = true; const pu = $("#hoLensBody .pupil"); if (pu) pu.setAttribute("r", "9"); }, 350);
  hoLens(stained ? "Fluorescein + blue light" : "Penlight — eye", `${svg}<p class="small">${txt}</p>`, "eye"); const f = `Eye: ${txt}`; p.ho.find.includes(f) || p.ho.find.push(f); hoExamTablet(p);
}
function hoEarLens(p) {
  const c = hoClin(p); const e = c.ear; const canal = e === "otitis" || e === "haematoma" ? "#c8464e" : "#f0b8b8";
  const svg = `<svg viewBox="0 0 200 200" class="lenssvg round"><circle cx="100" cy="100" r="96" fill="#0c0a10"/><circle cx="100" cy="100" r="70" fill="${canal}"/><circle cx="100" cy="100" r="34" fill="${e === "normal" ? "#e8dcd8" : "#8a5a3a"}" opacity="${e === "normal" ? 0.7 : 0.9}"/>${e !== "normal" ? [[70, 80], [120, 70], [110, 130], [80, 125], [135, 105]].map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="9" fill="#5a3a1a"/>`).join("") : '<circle cx="100" cy="100" r="22" fill="#d9e2ea" opacity=".6"/>'}</svg>`;
  const txt = c.earText || "Clean, pale canal; the eardrum is intact.";
  hoLens("Otoscope — ear canal", `${svg}<p class="small">${txt}</p>`, "ear"); const f = `Ear: ${txt}`; p.ho.find.includes(f) || p.ho.find.push(f); hoExamTablet(p);
}
function hoMouthLens(p) {
  const c = hoClin(p); const mm = String(p.vitals.mm); const col = /white/.test(mm) ? "#f2e8ea" : /pale/.test(mm) ? "#f2c4cc" : /brick|injected/.test(mm) ? "#c43a4a" : /yellow/.test(mm) ? "#e8d27a" : /blue|cyan/.test(mm) ? "#8a8ad0" : "#f08a9a";
  const crt = parseFloat(String(p.vitals.crt).replace(/[^0-9.]/g, "")) || 1.5;
  const svg = `<svg viewBox="0 0 240 130" class="lenssvg"><rect width="240" height="130" fill="#2a2030"/><path d="M10 40 Q120 0 230 40 L230 70 Q120 50 10 70z" id="gum" fill="${col}"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${30 + i * 32} 62 l12 0 l-3 40 l-6 0z" fill="#fbf7ee" stroke="#d9cfb8"/>`).join("")}${/calculus|Heavy/.test(c.mouthText) ? [1, 2, 3].map(i => `<rect x="${30 + i * 32}" y="62" width="12" height="9" fill="#b89a5a"/>`).join("") : ""}<circle id="blanch" cx="120" cy="38" r="0" fill="#fff"/></svg>`;
  const b = hoLens("Lip lifted — gums & teeth", `${svg}<p class="small"><b>Gums:</b> ${mm}. ${c.mouthText}</p><button class="btn small primary" id="crtBtn">Press the gum & watch the refill</button><p id="crtOut" class="small muted"></p>`, "mouth");
  $("#crtBtn").onclick = () => { const bl = $("#blanch"); if (!bl) return; bl.setAttribute("r", "16"); bl.style.transition = `opacity ${crt}s linear`; bl.style.opacity = "1"; requestAnimationFrame(() => requestAnimationFrame(() => { bl.style.opacity = "0"; })); const t0 = performance.now(); setTimeout(() => { $("#crtOut").textContent = `Pink again after about ${crt} s — ${crt < 2 ? "normal" : crt < 2.5 ? "borderline" : "slow: poor perfusion"}.`; p.ho.mouth = true; hoMark(p, "mm", `Mucous membranes ${mm}, CRT ${p.vitals.crt}.`); hoCheckEyesStep(p); }, crt * 1000 + 200); };
  const f = `Mouth: ${c.mouthText}`; p.ho.find.includes(f) || p.ho.find.push(f); hoExamTablet(p);
}

/* =====================================================================
   X-RAY SUITE
   ===================================================================== */
function hoXrayStart(p) {
  World.setRecumbency(p.npc.pet, "lateral"); HO.x = { apron: false, behind: false, shots: 0 };
  hoTools([], `<button class="hotool" id="xApron">${hoIcon("apron", 24)}<span>Lead apron</span></button><button class="hotool" id="xPos">${hoIcon("beam", 24)}<span>Lateral ⇄ VD</span></button><button class="hotool" id="xBehind">${icon("block", 22)}<span>Step behind screen</span></button><button class="hotool expose" id="xExpose">${icon("xray", 22)}<span>EXPOSE</span></button>`);
  $("#xApron").onclick = () => { HO.x.apron = !HO.x.apron; $("#xApron").classList.toggle("on", HO.x.apron); Sound.click(); hoXrayHint(); };
  $("#xBehind").onclick = () => { HO.x.behind = !HO.x.behind; $("#xBehind").classList.toggle("on", HO.x.behind); Sound.click(); hoXrayHint(); };
  $("#xPos").onclick = () => { const r = p.npc.pet.recumb === "lateral" ? "dorsal" : "lateral"; World.setRecumbency(p.npc.pet, r); HO.x.view = r; Sound.click(); hoXrayHint(); };
  $("#xExpose").onclick = () => hoExpose(p);
  const beam = $("#hoBeam"); beam.classList.remove("hidden"); beam.style.left = (innerWidth * (innerWidth > 760 ? 0.18 : 0.12)) + "px"; beam.style.top = (innerHeight * 0.18) + "px";
  hoBeamDrag(beam); hoXrayTablet(p); hoXrayHint();
}
function hoXrayTarget(p) { const f = p.caseDef.xray ? p.caseDef.xray.finding : null; if (!f) return "abdMid"; if (/radius|humerus/.test(f)) return "leg"; if (/femur|stifle/.test(f)) return "hind"; if (f === "bronchial") return "lungCr"; if (f === "egg" || f === "metal") return "abdMid"; return "abdMid"; }
function hoXrayHint() { const x = HO.x; hoHint(`${x.apron ? "✓" : "○"} Apron on · ○ Drag the light square over the ${HO_PARTLABEL[hoXrayTarget(HO.p)].toLowerCase()} · ${x.behind ? "✓" : "○"} Behind the lead screen · then <b>EXPOSE</b>`); }
function hoXrayTablet(p) { if (!p) return; openPanel(`${icon("xray", 18)} Radiography — ${p.name}`, `<p class="small">Order: <b>${p.caseDef.xray ? p.caseDef.xray.label.split(":")[0].split("—")[0] : "survey radiographs"}</b>. Region: <b>${HO_PARTLABEL[hoXrayTarget(p)]}</b>.</p><ol class="small"><li><b>Radiation safety:</b> lead apron and thyroid shield; only essential staff in the room.</li><li><b>Position:</b> lateral first; two orthogonal views where possible.</li><li><b>Collimate</b> tightly to the region — the light square shows the beam.</li><li><b>Expose</b> from behind the screen.</li></ol>`, { side: true, noClose: true }); }
function hoBeamDrag(el) {
  let sx = 0, sy = 0, ox = 0, oy = 0, on = false;
  el.onpointerdown = (e) => { e.preventDefault(); e.stopPropagation(); on = true; sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop; try { el.setPointerCapture(e.pointerId); } catch (er) { } };
  el.onpointermove = (e) => { if (!on) return; el.style.left = ox + e.clientX - sx + "px"; el.style.top = oy + e.clientY - sy + "px"; };
  el.onpointerup = () => { on = false; };
}
function hoBeamCovers(part) { const a = hoAnchorScreen(part); const b = $("#hoBeam").getBoundingClientRect(); if (!a) return true; return a.x >= b.left && a.x <= b.right && a.y >= b.top && a.y <= b.bottom; }
function hoExpose(p) {
  const x = HO.x; const errs = [];
  if (!x.apron) errs.push("no lead apron"); if (!x.behind) errs.push("you stayed beside the table");
  if (errs.length) { p.mistakes++; rep(-0.03, "radiation safety"); toast(`${icon("warn", 16)} Radiation safety: ${errs.join(" and ")}. Scatter radiation adds up over a career — apron on, step back.`, "warn", 5000); p.record.push(`${clockStr()} — Radiation safety breach (${errs.join(", ")}).`); }
  Sound.xray(); x.shots++; const flash = document.createElement("div"); flash.className = "hoflash"; $("#ho").appendChild(flash); setTimeout(() => flash.remove(), 500);
  if (!hoBeamCovers(hoXrayTarget(p))) { p.mistakes++; toast("The beam missed the region of interest — the image is non-diagnostic. Re-collimate and retake.", "warn", 4500); p.record.push(`${clockStr()} — Radiograph retaken (poor collimation).`); return; }
  if (x.shots === 1 && !errs.length) addXP(10, "clean radiography technique");
  $("#hoBeam").classList.add("hidden"); takeXray(p.id);
}

/* =====================================================================
   PREP TABLE — physical steps on the patient
   ===================================================================== */
const HO_PROC_SITE = { ohe: "ventral", castration: "scrotal", gastrotomy: "ventral", pyometra: "ventral", cystotomy: "ventral", splenectomy: "ventral", gdv: "ventral", ingluviotomy: "ventral", laceration: "abdMid", robert_jones: "leg", hoof: "leg", aural: "ear", cherry_eye: "eye" };
const HO_PROC_RECUMB = { laceration: "lateral", robert_jones: "lateral", hoof: "lateral", aural: "lateral", cherry_eye: "lateral" };
function hoProcSite(p) { return HO_PROC_SITE[p.caseDef.procedure] || "ventral"; }
function hoPrepStart(p) { hoTools([]); if (p.preopDone && p.preopDone.includes("induce")) World.setRecumbency(p.npc.pet, HO_PROC_RECUMB[p.caseDef.procedure] || "dorsal"); if (!p.preopDone) p.preopDone = []; renderPreop(p); }
/* returns true when the hands-on version takes over this pre-op step */
function hoPreopStep(p, s, finish) {
  if (!HO.on || HO.room !== "prepTable") return false; const sp = p.species; const site = hoProcSite(p);
  const need = (parts, tool, label, onDone, opts = {}) => { HO.need = { parts, tool, done: [], onDone, holdMs: opts.holdMs || 0, label }; HO.tool = tool; hoTools([tool], hoSkipTrayBtn()); hoHint(label, true); hoLens(null); if (hoPhone()) hoTabMin(true); };
  if (s.id === "blood") { need([sp === "bird" ? "leg" : "leg"], "syringe", `Draw blood: hold the syringe on the ${sp === "bird" ? "wing (basilic) vein" : "front leg (cephalic vein)"}.`, () => { HO.need = null; openPanel(`${icon("flask", 20)} Bloods`, "", { noClose: true, side: true }); uiLabPanel(p, finish); }, { holdMs: 2400 }); return true; }
  if (s.id === "iv") { if (["bird", "tortoise"].includes(sp)) return false; need(["leg"], "cath", "Place the IV catheter in the cephalic vein on the front leg.", () => { HO.need = null; hoAddProp(p, "leg", 0x5f8fd6); if (!p.ivFight && Math.random() < 0.12 + p.fear * 0.25) { p.ivFight = true; return uiFightBack(p, finish); } finish(); }, { holdMs: 1600 }); return true; }
  if (s.id === "preoxy") { need(["mouth"], "mask", "Hold the oxygen mask over the muzzle for 3–5 minutes (hold).", () => { HO.need = null; finish(); }, { holdMs: 3000 }); return true; }
  if (s.id === "induce") { preopQuiz(p, s, () => uiDoseTask(p, sp === "dog" || sp === "cat" ? "propofol" : "alfax", () => { World.setRecumbency(p.npc.pet, HO_PROC_RECUMB[p.caseDef.procedure] || "dorsal"); need(["mouth"], "tube", sp === "rabbit" ? "Place the airway (V-gel / tube) — tap the mouth." : sp === "bird" ? "Intubate (uncuffed tube through the glottis behind the tongue) — tap the beak." : "Intubate — tap the mouth, then inflate the cuff.", () => { HO.need = null; hoAddProp(p, "mouth", 0xdfe8ff); Sound.click(); finish(); }); })); return true; }
  if (s.id === "monitor") { need(["heart", "mouth", "leg"], "leads", "Attach monitoring: ECG on the chest, pulse oximeter on the tongue, blood-pressure cuff on a leg.", () => { HO.need = null; Sound.beep(); finish(); }); return true; }
  if (s.id === "eyes") { need(["eye"], "lube", "Lubricate the eyes — anaesthetised patients don't blink.", () => { HO.need = null; finish(); }); return true; }
  if (s.id === "clip") { hoPaintTask(p, site, "clip", "Clip wide around the site — drag the clippers until the area is bare.", (ok) => { if (!ok) p.mistakes++; finish(); }); return true; }
  if (s.id === "scrub") { preopQuiz(p, s, () => hoPaintTask(p, site, "scrub", "Scrub from the incision line OUTWARDS — start in the centre and spiral out.", (ok, centreFirst) => { if (!ok) p.mistakes++; if (!centreFirst) { p.contam = (p.contam || 0) + 1; p.mistakes++; toast("You started at the dirty edge and dragged bacteria onto the incision site. Centre → outwards, never back.", "warn", 5000); } finish(); }, true)); return true; }
  return false;
}
function hoNeedAct(part, x, y) {
  const N = HO.need; if (!N) return; if (HO.tool !== N.tool) return hoFloat(part, `Use the ${HO_TOOLS[N.tool][0].toLowerCase()}.`);
  if (!N.parts.includes(part)) return hoFloat(part, "Not there.");
  const go = () => { if (!N.done.includes(part)) N.done.push(part); Sound.click(); hoFloat(part, "✓", "good"); if (N.parts.every(k => N.done.includes(k))) { HO.need = null; hoHint(""); N.onDone(); } };
  if (N.holdMs) hoHoldStart(N.holdMs, N.tool === "syringe" ? "drawing…" : N.tool === "mask" ? "oxygen…" : "placing…", go); else go();
}
function hoAddProp(p, part, color) { try { const l = (HO_ANCH[p.species] || HO_ANCH.dog)[part]; if (!l) return; const m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), new THREE.MeshStandardMaterial({ color })); m.position.set(l[0], l[1], l[2]); m.rotation.z = Math.PI / 2; p.npc.pet.group.add(m); } catch (e) { } }

/* painting tasks (clipping, scrubbing) on the real site */
function hoPaintTask(p, part, tool, label, done, needCentre) {
  HO.tool = tool; hoTools([tool], hoSkipTrayBtn()); hoHint(label, true); if (hoPhone()) hoTabMin(true);
  const cv = $("#hoPaint"); cv.width = innerWidth; cv.height = innerHeight; cv.style.display = "block"; const ctx = cv.getContext ? cv.getContext("2d") : null;
  const R = Math.max(50, Math.min(110, Math.min(innerWidth, innerHeight) * 0.13));
  HO.paint = { part, R, tool, grid: [], hit: 0, active: false, first: null, done, needCentre, get cx() { const a = hoAnchorScreen(part); return a ? a.x : innerWidth * 0.35; }, get cy() { const a = hoAnchorScreen(part); return a ? a.y : innerHeight * 0.4; } };
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) { const u = i / 5, v = j / 5; if (u * u + v * v <= 1) HO.paint.grid.push({ u, v, on: false, get x() { return HO.paint ? HO.paint.cx + u * HO.paint.R : 0; }, get y() { return HO.paint ? HO.paint.cy + v * HO.paint.R * 0.7 : 0; } }); }
  HO.paintCtx = ctx; hoPaintDraw();
}
function hoPaintStart(x, y) { const P = HO.paint; P.active = true; if (!P.first) P.first = { x, y }; if (P.tool === "clip") Sound.clipper(true); hoPaintMove(x, y); }
function hoPaintMove(x, y) {
  const P = HO.paint; if (!P || !P.active) return; hoCursor(x, y, true); const r = P.R * 0.28; const ctx = HO.paintCtx;
  P.grid.forEach(g => { if (!g.on && Math.hypot(g.x - x, g.y - y) < r) { g.on = true; P.hit++; } });
  const k = P.hit / P.grid.length; hoHint(`${P.tool === "clip" ? "Clipped" : "Scrubbed"}: ${Math.round(k * 100)} %`);
  if (k >= 0.82) hoPaintFinish();
}
function hoPaintDraw() {
  const P = HO.paint, ctx = HO.paintCtx; if (!P || !ctx) return; const cv = ctx.canvas; if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; }
  ctx.clearRect(0, 0, cv.width, cv.height); const cx = P.cx, cy = P.cy;
  ctx.fillStyle = P.tool === "clip" ? "rgba(90,60,40,.6)" : "rgba(240,220,170,.3)"; ctx.beginPath(); ctx.ellipse(cx, cy, P.R, P.R * 0.7, 0, 0, Math.PI * 2); ctx.fill(); ctx.setLineDash([6, 5]); ctx.strokeStyle = "#f2c14e"; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = P.tool === "clip" ? "rgba(255,214,200,.9)" : "rgba(255,170,110,.5)"; P.grid.forEach(g => { if (g.on) { ctx.beginPath(); ctx.arc(g.x, g.y, P.R * 0.16, 0, Math.PI * 2); ctx.fill(); } });
  if (P.tool === "scrub") { ctx.strokeStyle = "rgba(242,193,78,.7)"; ctx.beginPath(); for (let t = 0; t < 14; t += 0.2) { const r = P.R * 0.07 * t; const x = cx + Math.cos(t * 1.6) * r, y = cy + Math.sin(t * 1.6) * r * 0.7; t ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
}
function hoPaintEnd() { const P = HO.paint; if (!P) return; P.active = false; Sound.clipper(false); hoCursor(0, 0, false); }
function hoPaintFinish() { const P = HO.paint; if (!P) return; HO.paint = null; Sound.clipper(false); Sound.success(); hoPaintClear(); hoHint(""); const centreFirst = !P.needCentre || (P.first && Math.hypot(P.first.x - P.cx, P.first.y - P.cy) < P.R * 0.35); addXP(10); renderPreop(HO.p); P.done(true, centreFirst); }
function hoPaintClear() { const cv = $("#hoPaint"); if (cv) { cv.style.display = "none"; const c = cv.getContext && cv.getContext("2d"); if (c) c.clearRect(0, 0, cv.width, cv.height); } HO.paint = null; }

/* =====================================================================
   OPERATING THEATRE — instruments on the patient + live anaesthesia
   ===================================================================== */
function hoORStart(p) {
  World.setRecumbency(p.npc.pet, HO_PROC_RECUMB[p.caseDef.procedure] || "dorsal"); hoTools([]); hoMonShow(p);
  if (G.s.outfit !== "surgical") return uiSurgery(); if (!p.surg) uiSurgery(); else hoSurgStep(p.id);
}
function hoSurgTools(p) { const proc = PROCEDURES[p.caseDef.procedure]; const set = []; proc.steps.forEach(s => (s.choices || [s.tool]).concat([s.tool]).forEach(t => { if (!set.includes(t)) set.push(t); })); return set; }
function hoSurgTablet(p) { const proc = PROCEDURES[p.caseDef.procedure]; const S = p.surg; const st = proc.steps[S.step]; if (!st) return; openPanel(`${icon("scalpel", 18)} ${proc.name} — step ${S.step + 1}/${proc.steps.length}`, `<p class="big">${st.text}</p><p class="muted small">Pick the instrument from the Mayo stand, then use it on the patient${st.tool === "scalpel" ? " — drag along the dashed incision line" : ""}.</p>${hint(TOOLS[st.tool].desc.split(".")[0] + ".")}`, { side: true, noClose: true }); }
function hoSurgStep(id) {
  const p = G.patients.find(x => x.id === id); if (!p) return; const proc = PROCEDURES[p.caseDef.procedure]; const S = p.surg; const st = proc.steps[S.step];
  if (!st) { HO.need = null; hoMonStop(); return finishSurgery(p); }
  hoMonShow(p);
  const asnL = staffLevel("assistant"); const maxEvents = (proc.steps.length > 7 ? 2 : 1) + (p.murmurFound || (p.hidden && p.hidden.murmur) ? 1 : 0) + (p.referral ? 1 : 0) + (G.s.settings.difficulty === "specialist" ? 1 : 0);
  if (S.step > 0 && S.events < maxEvents && !S.eventShownFor && Math.random() < (asnL === "senior" ? 0.22 : asnL ? 0.34 : 0.42)) { S.eventShownFor = S.step; S.events++; hoAnesEvent(p); }
  if (S.step > 1 && !S.bled && Math.random() < 0.3 && !(HO.mon && HO.mon.ev)) { S.bled = true; return MGpanel("Bleeder! Clamp it", (el) => MG.clamp(el, asnL ? 5 : 4), { icon: "warn" }).then(r => { if (!r.ok) { S.mistakes++; p.mistakes++; S.vit.map -= 10; S.vit.hr += 20; } else addXP(10); hoLens(null); hoSurgStep(id); }); }
  const site = hoProcSite(p); const scalpel = st.tool === "scalpel" && !proc.nonsterile;
  HO.need = { parts: [site], tool: st.tool, done: [], drag: scalpel, guide: scalpel ? (site === "ventral" ? ["ventA", "ventB"] : null) : null, surgical: true };
  HO.tool = null; const host = $("#hoTools"); host.classList.remove("hidden"); host.innerHTML = hoSurgTools(p).map(t => `<button class="hotool instr" data-t="${t}">${toolSVG(t, 70, 28)}<span>${TOOLS[t].short}</span></button>`).join("");
  host.querySelectorAll(".instr").forEach(b => b.onclick = () => { if (HO.mon && HO.mon.ev) { toast("Deal with the anaesthetic problem first — check the monitor.", "warn"); return; } HO.tool = b.dataset.t; host.querySelectorAll(".instr").forEach(x => x.classList.toggle("on", x === b)); Sound.click(); hoHint(`${TOOLS[b.dataset.t].name} in hand — ${scalpel && b.dataset.t === "scalpel" ? "drag along the incision line" : "tap the surgical site"}.`); });
  hoSurgTablet(p); hoHint(hoPhone() ? `<b>Step ${S.step + 1}/${proc.steps.length}:</b> ${st.text}` : "Pick the right instrument from the Mayo stand.", true); if (hoPhone()) hoTabMin(true);
}
function hoSurgUse(p, toolId) {
  const proc = PROCEDURES[p.caseDef.procedure]; const S = p.surg; const st = proc.steps[S.step]; energy(-1);
  let ok = toolId === st.tool; if (ok && G.s.energy < 25 && Math.random() < 0.2) { ok = false; toast("Your hands are shaking — you fumble the instrument. Rest!", "warn", 3000); }
  const asnC = G.s.staff.find(s => s.role === "assistant" && s.level === "senior"); let caught = false; if (!ok && asnC && !S.caught && toolId !== st.tool) { S.caught = true; caught = true; ok = true; toast(`${asnC.name}: “Wait — I think you want the ${TOOLS[st.tool].name}.” (caught)`, "info", 4500); }
  if (!G.s.collections.tools.includes(st.tool)) G.s.collections.tools.push(st.tool); const chosen = TOOLS[caught ? st.tool : toolId], right = TOOLS[st.tool];
  p.record.push(`${clockStr()} — Step ${S.step + 1}: ${st.text} → ${chosen.short}${caught ? " (wrong instrument caught by the senior assistant)" : ""}${ok ? "" : " (incorrect; " + right.short + " used)"}`);
  HO.need = null;
  if (ok) { Sound.success(); addXP(12); S.vit.hr += rnd(-3, 3); hoFloat(hoProcSite(p), `${right.short} ✓`, "good"); openPanel(`${icon("check", 18)} ${right.name}`, `<div class="goodbox">${st.why}</div>`, { side: true, noClose: true }); }
  else { Sound.error(); S.mistakes++; p.mistakes++; S.vit.hr += rnd(5, 15); S.vit.map -= rnd(2, 6); openPanel(`${icon("warn", 18)} Wrong instrument`, `<div class="badbox"><b>${chosen.short} isn't right here. Correct: ${right.name}.</b> ${st.why}</div><div class="toolinfo">${toolSVG(st.tool, 150, 60)}<p class="muted">${right.desc}</p></div>`, { side: true, noClose: true }); }
  const adv = () => { S.step++; S.vit.temp -= 0.08; S.vit.etco2 += rnd(-1.5, 1.5); afterStepMinigame(p, st).then(() => { hoLens(null); hoSurgStep(p.id); }); };
  setTimeout(adv, ok ? 1100 : 2600);
}
/* scalpel drag along the incision line */
function hoDragStart(x, y) { HO.drag = { pts: [{ x, y }] }; hoCursor(x, y, true); }
function hoDragMove(x, y) { if (!HO.drag) return; HO.drag.pts.push({ x, y }); hoCursor(x, y, true); const tr = document.createElement("i"); tr.className = "hocut"; tr.style.left = x + "px"; tr.style.top = y + "px"; $("#hoHot").appendChild(tr); }
function hoDragEnd() {
  const D = HO.drag; HO.drag = null; hoCursor(0, 0, false); const N = HO.need; if (!N || !D) return; const a = hoAnchorScreen(N.guide[0]), b = hoAnchorScreen(N.guide[1]); if (!a || !b) return hoSurgUse(HO.p, "scalpel");
  const L = Math.hypot(b.x - a.x, b.y - a.y) || 1; const dist = (q) => Math.abs((b.y - a.y) * q.x - (b.x - a.x) * q.y + b.x * a.y - b.y * a.x) / L;
  const devi = D.pts.reduce((m, q) => Math.max(m, dist(q)), 0); const s = D.pts[0], e = D.pts[D.pts.length - 1]; const span = Math.hypot(e.x - s.x, e.y - s.y);
  if (D.pts.length < 3 || span < L * 0.55) { hoHint("Draw the whole incision — from one end of the dashed line to the other."); return; }
  if (devi > Math.max(26, L * 0.22)) { hoHint("The incision wandered off the midline — follow the dashed line."); HO.p.surg.vit.hr += 4; return; }
  HO.p.record.push(`${clockStr()} — Clean midline incision.`); hoSurgUse(HO.p, "scalpel");
}

/* live anaesthesia monitor + anaesthetic machine */
function hoMonShow(p) {
  const S = p.surg; if (!S) return; const M = $("#hoMon"); M.classList.remove("hidden"); if (HO.mon && HO.mon.p === p) return;
  HO.mon = { p, iso: 2.0, last: 0, beat: 0, ecgX: 0, ev: null, clk: hoClock() };
  M.innerHTML = `<div class="monhead">${icon("monitor", 14)} Anaesthesia <span id="monAlarm"></span></div><canvas id="monEcg" width="260" height="46"></canvas><div class="monnums"><div><small>HR</small><b id="mHR">-</b></div><div><small>SpO₂</small><b id="mSp">-</b></div><div><small>ETCO₂</small><b id="mCo">-</b></div><div><small>MAP</small><b id="mMap">-</b></div><div><small>T °C</small><b id="mT">-</b></div><div><small>Iso %</small><b id="mIso">2.0</b></div></div>
    <div class="moncontrols">${[["isoDown", "Iso −"], ["isoUp", "Iso +"], ["bolus", "Fluid bolus"], ["warm", "Warm-air blanket"], ["ippv", "Ventilate (IPPV)"], ["tube", "Check ET tube & O₂"], ["atropine", "Atropine"], ["lidocaine", "Lidocaine"], ["ok", "Acknowledge — no action"]].map(([k, l]) => `<button data-c="${k}">${l}</button>`).join("")}</div>`;
  M.querySelectorAll(".moncontrols button").forEach(b => b.onclick = (e) => { e.stopPropagation(); hoMonControl(b.dataset.c); });
  M.onclick = () => M.classList.toggle("open");
}
function hoMonStop() { if (HO.mon) HO.mon = null; const M = $("#hoMon"); if (M) M.classList.add("hidden"); }
const HO_ANES = [
  { id: "spo2", text: "SpO₂ is falling — 89 % and dropping, ETCO₂ still reading.", fix: ["tube", "ippv"], need: 1, apply: (v) => { v.spo2 = Math.max(80, v.spo2 - 0.25); }, why: "Check the ET tube (kinked, disconnected, in a bronchus?) and the oxygen supply, then ventilate." },
  { id: "map", text: "Mean arterial pressure 52 mmHg and falling.", fix: ["isoDown", "bolus"], need: 2, apply: (v) => { v.map = Math.max(40, v.map - 0.15); }, why: "Inhalants dilate vessels: turn the vaporiser down AND give a crystalloid bolus (5–10 mL/kg). Vasopressors if it persists." },
  { id: "temp", text: "Core temperature 36.2 °C and dropping.", fix: ["warm"], need: 1, apply: (v) => { v.temp = Math.max(35, v.temp - 0.01); }, why: "Active warming — forced-air blanket, warm fluids. Hypothermia is the most common anaesthetic complication." },
  { id: "light", text: "Heart rate rising sharply; the patient twitched — too light!", fix: ["isoUp"], need: 1, apply: (v) => { v.hr = Math.min(v.hr + 0.4, 220); }, why: "Check the palpebral reflex and jaw tone — then deepen the plane (and top up analgesia)." },
  { id: "co2", text: "ETCO₂ climbing — 58 mmHg.", fix: ["ippv"], need: 1, apply: (v) => { v.etco2 = Math.min(75, v.etco2 + 0.2); }, why: "Hypoventilation: ventilate (IPPV) and check the soda lime / rebreathing." },
  { id: "brady", text: "Sinus bradycardia — HR falling and MAP dropping.", fix: ["atropine", "isoDown"], need: 1, apply: (v) => { v.hr = Math.max(35, v.hr - 0.25); v.map = Math.max(45, v.map - 0.08); }, why: "Lighten the plane, check temperature; atropine/glycopyrrolate when the bradycardia drops blood pressure (avoid after α2 agonists)." },
  { id: "vpc", text: "Runs of wide, bizarre complexes at 180/min (ventricular tachycardia).", fix: ["lidocaine"], need: 1, apply: (v) => { v.map = Math.max(45, v.map - 0.06); }, why: "Check oxygenation and depth; sustained VT > 160/min → lidocaine 2 mg/kg IV (dog)." },
  { id: "rsa", text: "Heart rate rises and falls with each breath (respiratory sinus arrhythmia).", fix: ["ok"], need: 1, apply: () => { }, why: "Normal in dogs — no treatment. (Abnormal in cats.)" }
];
function hoAnesEvent(p) {
  const S = p.surg; let pool = HO_ANES.slice(); if (p.species !== "dog") pool = pool.filter(e => e.id !== "rsa" && e.id !== "vpc"); const ev = pick(pool); Sound.alarm(); Sound.vibrate(80);
  if (ev.id === "spo2") S.vit.spo2 = 90; if (ev.id === "map") S.vit.map = 53; if (ev.id === "temp") S.vit.temp = 36.3; if (ev.id === "light") S.vit.hr *= 1.35; if (ev.id === "co2") S.vit.etco2 = 57; if (ev.id === "brady") S.vit.hr = Math.round(S.vit.hr * 0.6);
  HO.mon.ev = { ev, t0: HO.mon.clk(), got: [] }; const al = $("#monAlarm"); if (al) al.textContent = "ALARM"; hoHint(`<b class="red">Alarm:</b> ${ev.text} Use the anaesthetic machine controls.`); $("#hoMon").classList.add("alarm");
}
function hoMonControl(c) {
  const M = HO.mon; if (!M) return; const p = M.p; const S = p.surg; Sound.click();
  if (c === "isoUp") M.iso = Math.min(4, M.iso + 0.5); if (c === "isoDown") M.iso = Math.max(0.5, M.iso - 0.5); const iso = $("#mIso"); if (iso) iso.textContent = M.iso.toFixed(1);
  const E = M.ev; if (!E) { if (["atropine", "lidocaine"].includes(c)) { p.mistakes++; S.mistakes++; toast("No indication for that drug right now — every drug has side effects.", "warn"); } return; }
  if (E.ev.fix.includes(c)) { if (!E.got.includes(c)) E.got.push(c); if (E.got.length >= E.ev.need) hoAnesResolve(true); else hoHint(`Good — and? (${E.ev.need - E.got.length} more action needed)`); }
  else { p.mistakes++; S.mistakes++; Sound.error(); hoHint(`<b class="red">Not that.</b> ${E.ev.text}`); }
}
function hoAnesResolve(ok, timeout) {
  const M = HO.mon; if (!M || !M.ev) return; const p = M.p; const S = p.surg; const ev = M.ev.ev; M.ev = null; $("#hoMon").classList.remove("alarm"); const al = $("#monAlarm"); if (al) al.textContent = "";
  if (ok) { Sound.success(); addXP(20, "anaesthetic event managed"); } else { Sound.error(); S.mistakes++; p.mistakes++; }
  p.record.push(`${clockStr()} — Anaesthetic event: ${ev.text} → ${ok ? "managed" : timeout ? "anaesthetist intervened" : "corrected"}.`);
  S.vit = { hr: p.species === "bird" ? 300 : p.species === "cat" ? 145 : 90, spo2: 98, etco2: 40, map: 75, temp: Math.max(S.vit.temp, 37.6) };
  hoHint(`${ok ? "<b>Stabilised.</b>" : "<b>The anaesthetist took over:</b>"} ${ev.why}`); toast(`${ok ? "Stabilised" : "Anaesthetist intervened"} — ${ev.why}`, ok ? "good" : "warn", 5500);
}
function hoMonTick() {
  const M = HO.mon; if (!M || G.paused) return; const p = M.p; const S = p.surg; if (!S) return; const now = M.clk(); const v = S.vit;
  if (now - M.last > 1000) { M.last = now; v.hr += rnd(-1.5, 1.5); v.spo2 = Math.min(100, v.spo2 + rnd(-0.2, 0.25)); v.etco2 += rnd(-0.4, 0.4); v.map += rnd(-0.8, 0.8) - (M.iso - 2) * 0.4; v.temp -= 0.003;
    if (M.ev) { for (let i = 0; i < 6; i++) M.ev.ev.apply(v); if (now - M.ev.t0 > 30000) hoAnesResolve(false, true); }
    const r = SPECIES[p.species].vitals; const set = (id, val, bad) => { const el = $("#" + id); if (el) { el.textContent = val; el.classList.toggle("bad", !!bad); } };
    set("mHR", Math.round(v.hr), v.hr < r.hr[0] * 0.7 || v.hr > r.hr[1] * 1.15); set("mSp", Math.round(v.spo2) + "%", v.spo2 < 95); set("mCo", Math.round(v.etco2), v.etco2 < 35 || v.etco2 > 45); set("mMap", Math.round(v.map), v.map < 60); set("mT", v.temp.toFixed(1), v.temp < 37);
    if (M.ev && Math.random() < 0.5) Sound.alarm();
  }
  const period = 60000 / Math.min(170, Math.max(30, v.hr)); if (now - M.beat > period) { M.beat = now; if (G.s.settings.hoMonSound !== false) Sound.pulseOx(v.spo2); M.spike = 1; }
  const cv = $("#monEcg"); const ctx = cv && cv.getContext ? cv.getContext("2d") : null; if (!ctx) return;
  M.ecgX = (M.ecgX + 2) % cv.width; ctx.fillStyle = "#06120a"; ctx.fillRect(M.ecgX, 0, 6, cv.height); let yv = 26; if (M.spike) { const k = M.spike; yv = k > 0.8 ? 20 : k > 0.6 ? 4 : k > 0.4 ? 40 : 26; M.spike = k > 0.2 ? k - 0.2 : 0; }
  ctx.strokeStyle = M.ev ? "#ff5f7a" : "#7ef29a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(M.ecgX - 2, M.prevY || 26); ctx.lineTo(M.ecgX, yv); ctx.stroke(); M.prevY = yv;
}

/* =====================================================================
   PHARMACY SHELF
   ===================================================================== */
function hoShelf(drugId, onPicked) {
  if (!HO.on || HO.room !== "pharmacy") return onPicked();
  const shelf = DRUGS.slice().sort((a, b) => a.name.localeCompare(b.name));
  const b = hoLens("Pharmacy shelf — take the right bottle", `<div class="shelf">${shelf.map(d => `<button class="bottle cls-${d.cls.replace(/\W/g, "")}" data-d="${d.id}"><i></i><span>${d.name}</span><small>${d.form.replace(/^(injection|oral suspension)\s*/, "")}</small></button>`).join("")}</div>`, null, { wide: true, locked: true });
  b.querySelectorAll(".bottle").forEach(btn => btn.onclick = () => { if (btn.dataset.d === drugId) { Sound.click(); hoLens(null); onPicked(); } else { Sound.error(); btn.classList.add("wrong"); toast(`That's ${DRUGS.find(x => x.id === btn.dataset.d).name} — read the label. You need ${DRUGS.find(x => x.id === drugId).name}.`, "warn", 3500); HO.shelfErr = (HO.shelfErr || 0) + 1; } });
}

/* =====================================================================
   wiring: mini-games inside the scene, settings
   ===================================================================== */
function hoMG(title, runner, opts) {
  if (hoPhone()) hoTabMin(true);
  const body = hoLens(`${icon(opts.icon || "hand", 16)} ${title}`, `<div id="mgHost"></div>`, HO.p ? (HO.room === "orTable" ? hoProcSite(HO.p) : "abdMid") : null, { wide: true, locked: true });
  const tok = HO.mgTok = (HO.mgTok || 0) + 1; energy(-1); return runner($("#mgHost")).then(r => { if (r && r.ok && G.s.energy < 25 && Math.random() < 0.15) { r.ok = false; r.text += " (fatigue error)"; toast("Fatigue cost you that one — take a break.", "warn"); } setTimeout(() => { if (HO.on && HO.mgTok === tok) hoLens(null); }, 250); return r; });
}
