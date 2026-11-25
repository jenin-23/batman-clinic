/* ============================================================
   COZY RETRO LOOK — warm lamps in the living rooms, clean white
   light in the medical rooms, wood floors, a round rug for the
   clinic cat, retro furniture and original posters.
   Built once by World.init; switched with World.setCozy(on).
   Light budget: 4 pooled point lights that follow Ahmad, plus
   glowing shades and painted light pools (no extra lights).
   ============================================================ */
const COZY_WARM = ["shop", "reception", "staff", "office", "pharmacy", "corridor"];
const COZY_WHITE = ["exam", "prep", "or", "xray", "lab", "dental", "ward"];
const COZY_PAL = { orange: "#d8572a", mustard: "#e8a03a", cream: "#f1d9ae", teal: "#2c5f5a", choc: "#3a2216" };

function buildCozy(W) {
  const { scene, mat, box, cyl, sphere, roundedBoxGeo, addCollider, ROOMS, hemi, sun, windowMats, themeMats, props } = W;
  const root = new THREE.Group(); root.name = "cozy"; scene.add(root);
  const add = (o, x, y, z) => { if (x !== undefined) o.position.set(x, y, z); o.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); root.add(o); return o; };
  const put = (g, m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
  const colliders = [];
  const coll = (x1, z1, x2, z2) => { colliders.push([x1, z1, x2, z2]); };
  const cv = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };

  /* ---------- wood floors (generated, no downloads) ---------- */
  const woodImg = (tones) => { const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d"); const rows = 8, ph = 512 / rows; let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let r = 0; r < rows; r++) { let x = -Math.floor(rnd() * 256); while (x < 512) { const L = 170 + Math.floor(rnd() * 160); g.fillStyle = tones[Math.floor(rnd() * tones.length)]; g.fillRect(x, r * ph, L, ph); g.strokeStyle = "rgba(255,225,190,0.07)"; g.lineWidth = 1.5; for (let k = 0; k < 4; k++) { const y0 = r * ph + 7 + k * 14; g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + L * 0.3, y0 - 4 + rnd() * 8, x + L * 0.6, y0 - 4 + rnd() * 8, x + L, y0); g.stroke(); } if (rnd() < 0.25) { g.fillStyle = "rgba(40,20,10,0.25)"; g.beginPath(); g.ellipse(x + L * rnd(), r * ph + ph / 2, 7, 3, 0, 0, 7); g.fill(); } g.fillStyle = "rgba(18,8,4,0.55)"; g.fillRect(x, r * ph, 2, ph); x += L; } g.fillStyle = "rgba(18,8,4,0.6)"; g.fillRect(0, r * ph, 512, 2); }
    return c; };
  const WOOD = { light: woodImg(["#7a4a2a", "#84522e", "#6e4226", "#8a5832", "#764828"]), dark: woodImg(["#4e2e1c", "#563320", "#472a19", "#5b3622", "#50301e"]) };
  const woodTex = (kind, w, d) => { const t = new THREE.CanvasTexture(WOOD[kind]); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 2.6, d / 2.6); t.anisotropy = 4; return t; };
  const floorKind = { reception: "light", shop: "light", staff: "light", pharmacy: "light", office: "dark", corridor: "dark" };
  const saved = {}; // classic look to restore
  for (const k of COZY_WARM) { const fm = themeMats.floors[k]; if (!fm) continue; const r = ROOMS[k]; saved[k] = { map: fm.map, color: fm.color.getHex(), rough: fm.roughness }; saved[k].wood = woodTex(floorKind[k] || "light", r.x[1] - r.x[0], r.z[1] - r.z[0]); }

  /* ---------- light pools: soft painted glow on the floor (no light cost) ---------- */
  const poolTex = cv(128, 128, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,170,90,0.55)"); gr.addColorStop(0.45, "rgba(255,140,60,0.22)"); gr.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const pools = [];
  const pool = (x, z, r = 1.6, white = false) => { const m = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: white ? 0x9fb4c8 : 0xffffff, opacity: 0.8 }); const p = new THREE.Mesh(new THREE.CircleGeometry(r, 32), m); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.02, z); p.renderOrder = 2; root.add(p); pools.push(m); return p; };

  /* ---------- glowing shades ---------- */
  const shades = []; // emissive materials that brighten at night
  const glowMat = (c, i = 1.4) => { const col = new THREE.Color(c); const m = new THREE.MeshStandardMaterial({ color: col.clone().multiplyScalar(0.55), emissive: col, emissiveIntensity: i * 0.62, roughness: 0.6, side: THREE.DoubleSide }); shades.push({ m, base: i * 0.62 }); return m; };
  const brass = mat(0xc8a060, { metalness: 0.6, roughness: 0.35 }), walnut = mat(0x5a3420), teak = mat(0x7a4a28), cream = mat(0xf1d9ae), choc = mat(0x2e1a12);

  function mushroomLamp(x, z, c = 0xff5a0a) {
    const g = new THREE.Group(); g.add(cyl(0.22, 0.26, 0.06, 0, 0, 0.03, 0, walnut)); g.add(cyl(0.035, 0.035, 1.25, 0, 0, 0.66, 0, brass));
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), glowMat(c, 1.3)); sh.position.y = 1.28; g.add(sh);
    add(g, x, 0, z); pool(x, z, 1.7); coll(x - 0.25, z - 0.25, x + 0.25, z + 0.25); return g;
  }
  function arcLamp(x, z, rot, c = 0xff6a10) {
    const g = new THREE.Group(); g.add(cyl(0.2, 0.22, 0.12, 0, 0, 0.06, 0, mat(0xdfd6c4, { roughness: 0.3 })));
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, 2.6, 0.1), new THREE.Vector3(0, 2.0, 1.2));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.025, 8, false), brass));
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), glowMat(c, 1.2)); sh.position.set(0, 1.95, 1.2); g.add(sh);
    g.rotation.y = rot; add(g, x, 0, z); const ox = x + Math.sin(rot) * 1.2, oz = z + Math.cos(rot) * 1.2; pool(ox, oz, 1.5); coll(x - 0.22, z - 0.22, x + 0.22, z + 0.22); return g;
  }
  function roundRug(x, z, r) {
    const t = cv(512, 512, (g, w) => { const cols = ["#b8481f", "#e8a03a", "#f1d9ae", "#2c5f5a", "#e8a03a", "#b8481f", "#f1d9ae", "#2c5f5a"]; cols.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 12 - i * 30, 0, 7); g.fill(); }); g.strokeStyle = "#f1d9ae"; g.lineWidth = 4; for (let i = 0; i < 96; i++) { const a = i / 96 * 6.283; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * (w / 2 - 12), w / 2 + Math.sin(a) * (w / 2 - 12)); g.lineTo(w / 2 + Math.cos(a) * (w / 2 - 1), w / 2 + Math.sin(a) * (w / 2 - 1)); g.stroke(); } for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; g.fillRect(Math.random() * w, Math.random() * w, 2, 2); } });
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.018, z); m.receiveShadow = true; root.add(m); return m;
  }
  function velvetSofa(x, z, rot, w, c) {
    const g = new THREE.Group(); const v = mat(c, { roughness: 0.95 });
    put(g, new THREE.Mesh(roundedBoxGeo(w, 0.36, 0.82, 0.14), v), 0, 0.42, 0);
    put(g, new THREE.Mesh(roundedBoxGeo(w, 0.6, 0.24, 0.12), v), 0, 0.78, -0.3);
    for (const sx of [-1, 1]) put(g, new THREE.Mesh(roundedBoxGeo(0.2, 0.38, 0.82, 0.1), v), sx * (w / 2 - 0.1), 0.62, 0);
    const n = Math.max(2, Math.round(w / 0.8)); for (let i = 0; i < n; i++) { const cu = new THREE.Mesh(roundedBoxGeo((w - 0.5) / n - 0.04, 0.12, 0.62, 0.06), mat(new THREE.Color(c).offsetHSL(0, 0, 0.05).getHex(), { roughness: 0.95 })); cu.position.set(-((w - 0.5) / 2) + (i + 0.5) * (w - 0.5) / n, 0.64, 0.06); g.add(cu); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const leg = cyl(0.035, 0.018, 0.26, 0, sx * (w / 2 - 0.16), 0.13, sz * 0.3, teak); leg.rotation.z = sx * 0.18; leg.rotation.x = sz * -0.12; g.add(leg); }
    g.rotation.y = rot; add(g, x, 0, z); return g;
  }
  function credenza(x, z, rot, w) { const g = new THREE.Group(); put(g, new THREE.Mesh(roundedBoxGeo(w, 0.56, 0.46, 0.05), teak), 0, 0.52, 0); for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(roundedBoxGeo(w / 3 - 0.06, 0.46, 0.02, 0.02), mat(i === 1 ? 0xe8a03a : 0x8a5a32)); d.position.set(-w / 3 + i * w / 3, 0.52, 0.24); g.add(d); } for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.025, 0.015, 0.24, 0, sx * (w / 2 - 0.1), 0.12, sz * 0.16, teak)); g.rotation.y = rot; add(g, x, 0, z); return g; }
  function radio(x, y, z, rot) { const g = new THREE.Group(); const body = new THREE.Mesh(roundedBoxGeo(0.46, 0.3, 0.2, 0.08), mat(0x8a3a1e, { roughness: 0.5 })); body.position.y = 0.15; g.add(body); const grille = new THREE.Mesh(new THREE.CircleGeometry(0.08, 20), mat(0xf1d9ae)); grille.position.set(-0.1, 0.15, 0.101); g.add(grille); const dial = new THREE.Mesh(roundedBoxGeo(0.16, 0.08, 0.02, 0.02), glowMat(0xffb347, 0.7)); dial.position.set(0.11, 0.18, 0.1); g.add(dial); for (const dx of [0.06, 0.16]) { const k = cyl(0.022, 0.022, 0.03, 0, dx, 0.08, 0.11, brass); k.rotation.x = Math.PI / 2; g.add(k); } g.rotation.y = rot; add(g, x, y, z); props.cozyRadio = g; return g; }
  function lavaLamp(x, y, z) { const g = new THREE.Group(); g.add(cyl(0.07, 0.1, 0.12, 0, 0, 0.06, 0, brass)); const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0xff6a3a, emissive: 0xff4a1a, emissiveIntensity: 0.5, transparent: true, opacity: 0.75 })); glass.position.y = 0.27; g.add(glass); shades.push({ m: glass.material, base: 0.5 }); const blobs = []; for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.03 + i * 0.006, 10, 8), glowMat(0xffd060, 1.1)); b.position.y = 0.18 + i * 0.07; g.add(b); blobs.push(b); } g.add(cyl(0.03, 0.05, 0.06, 0, 0, 0.45, 0, brass)); g.userData.blobs = blobs; add(g, x, y, z); props.lava = g; return g; }
  function rotaryPhone(x, y, z, rot) { const g = new THREE.Group(); const red = mat(0xb8341f, { roughness: 0.4 }); const b = new THREE.Mesh(roundedBoxGeo(0.24, 0.1, 0.22, 0.05), red); b.position.y = 0.05; g.add(b); const dial = cyl(0.06, 0.06, 0.012, 0, 0, 0.105, 0.03, cream); g.add(dial); const hand = new THREE.Mesh(roundedBoxGeo(0.28, 0.05, 0.06, 0.025), red); hand.position.set(0, 0.14, -0.04); g.add(hand); g.rotation.y = rot; add(g, x, y, z); return g; }
  function wallClock(x, y, z, rot) { const g = new THREE.Group(); for (let i = 0; i < 12; i++) { const r = new THREE.Mesh(roundedBoxGeo(0.04, 0.22, 0.02, 0.01), brass); const a = i / 12 * Math.PI * 2; r.position.set(Math.sin(a) * 0.3, Math.cos(a) * 0.3, 0); r.rotation.z = -a; g.add(r); } const face = cyl(0.2, 0.2, 0.04, 0, 0, 0, 0, cream); face.rotation.x = Math.PI / 2; g.add(face); const hH = new THREE.Mesh(roundedBoxGeo(0.02, 0.11, 0.01, 0.005), choc); hH.position.z = 0.03; const mH = new THREE.Mesh(roundedBoxGeo(0.014, 0.16, 0.01, 0.005), choc); mH.position.z = 0.035; g.add(hH, mH); g.userData.hands = [hH, mH]; g.rotation.y = rot; add(g, x, y, z); props.cozyClock = g; return g; }
  function macrame(x, z, top = 2.75) { const g = new THREE.Group(); const rope = mat(0xe8d8b8, { roughness: 1 }); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 0.12, -0.5, Math.sin(a) * 0.12), new THREE.Vector3(Math.cos(a) * 0.17, -0.95, Math.sin(a) * 0.17)); g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 10, 0.008, 5, false), rope)); } const pot = cyl(0.17, 0.12, 0.22, 0, 0, -1.05, 0, mat(0xd8572a)); g.add(pot); for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), mat(0x3f8f5a)); l.scale.set(0.6, 1.5, 0.6); const a = i / 7 * 6.28; l.position.set(Math.cos(a) * 0.13, -1.05 - 0.1 - Math.random() * 0.25, Math.sin(a) * 0.13); l.rotation.z = Math.cos(a) * 0.5; g.add(l); } add(g, x, top, z); return g; }
  function recordPlayer(x, z, rot) { const g = new THREE.Group(); put(g, new THREE.Mesh(roundedBoxGeo(0.8, 0.62, 0.45, 0.05), teak), 0, 0.31, 0); put(g, new THREE.Mesh(roundedBoxGeo(0.6, 0.08, 0.4, 0.03), mat(0x2e1a12)), 0, 0.66, 0); const disc = cyl(0.16, 0.16, 0.01, 0, -0.05, 0.71, 0, mat(0x111111, { roughness: 0.3 })); g.add(disc); g.add(cyl(0.05, 0.05, 0.012, 0, -0.05, 0.716, 0, mat(0xd8572a))); const arm = new THREE.Mesh(roundedBoxGeo(0.02, 0.02, 0.22, 0.008), brass); arm.position.set(0.18, 0.73, 0.02); arm.rotation.y = 0.4; g.add(arm); g.userData.disc = disc; for (let i = 0; i < 5; i++) { const sl = new THREE.Mesh(roundedBoxGeo(0.02, 0.3, 0.3, 0.01), mat([0xd8572a, 0xe8a03a, 0x2c5f5a, 0xf1d9ae, 0x7c4a8a][i])); sl.position.set(-0.3 + i * 0.03, 0.3, 0.05); g.add(sl); } g.rotation.y = rot; add(g, x, 0, z); props.recordPlayer = g; coll(x - 0.45, z - 0.3, x + 0.45, z + 0.3); return g; }
  function retroFridge(x, z, rot) { const g = new THREE.Group(); const mint = mat(0x9fd8c8, { roughness: 0.35 }); put(g, new THREE.Mesh(roundedBoxGeo(0.72, 1.55, 0.66, 0.2), mint), 0, 0.8, 0); put(g, new THREE.Mesh(roundedBoxGeo(0.73, 0.02, 0.67, 0.01), mat(0x6aa898)), 0, 1.12, 0); const h = new THREE.Mesh(roundedBoxGeo(0.04, 0.3, 0.05, 0.02), brass); h.position.set(0.28, 1.3, 0.34); g.add(h); const h2 = h.clone(); h2.position.y = 0.8; g.add(h2); const logo = new THREE.Mesh(roundedBoxGeo(0.2, 0.05, 0.01, 0.02), brass); logo.position.set(0, 1.45, 0.335); g.add(logo); g.rotation.y = rot; add(g, x, 0, z); coll(x - 0.38, z - 0.36, x + 0.38, z + 0.36); return g; }
  function bankersLamp(x, y, z, rot) { const g = new THREE.Group(); g.add(cyl(0.08, 0.1, 0.03, 0, 0, 0.015, 0, brass)); g.add(cyl(0.012, 0.012, 0.3, 0, 0, 0.17, 0, brass)); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.1, 18, 1, true, 0, Math.PI), glowMat(0x1f8a4c, 0.5)); sh.rotation.z = Math.PI / 2; sh.rotation.y = Math.PI / 2; sh.position.y = 0.33; g.add(sh); const under = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.02, 12), glowMat(0xffd08a, 1.2)); under.position.y = 0.3; g.add(under); g.rotation.y = rot; add(g, x, y, z); pool(x, z + 0.2, 0.9); return g; }
  function poster(kind, x, y, z, rot, w = 1.0, h = 1.36) {
    const t = cv(360, 490, (g, W2, H2) => COZY_POSTERS[kind](g, W2, H2));
    const g = new THREE.Group(); g.add(new THREE.Mesh(roundedBoxGeo(w + 0.1, h + 0.1, 0.04, 0.02), walnut)); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 })); p.position.z = 0.025; g.add(p);
    g.rotation.y = rot; add(g, x, y, z); return g;
  }
  function wallSconce(x, y, z, rot) { const g = new THREE.Group(); g.add(new THREE.Mesh(roundedBoxGeo(0.12, 0.2, 0.04, 0.02), brass)); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.18, 16, 1, true), glowMat(0xffa050, 1.2)); sh.position.set(0, 0.06, 0.14); g.add(sh); g.rotation.y = rot; add(g, x, y, z); return g; }

  /* ---------- reception & waiting ---------- */
  const rugX = -8.4, rugZ = -6.6; roundRug(rugX, rugZ, 1.7);
  mushroomLamp(-12.25, -9.0); mushroomLamp(-12.25, -3.4); arcLamp(2.25, -9.6, -Math.PI / 2 - 0.4);
  // the old sofas are swapped for velvet ones while the cozy look is on
  const swapped = [];
  (props.sofas || []).forEach((s, i) => { if (s.x > -14 && s.x < 4 && s.z < -2) { const v = velvetSofa(s.x, s.z, s.rot, s.w, i % 2 ? 0xb8481f : 0xc98a24); swapped.push({ old: s.g, neo: v }); } });
  // wooden front for the desk + rotary phone
  const deskFront = add(new THREE.Mesh(roundedBoxGeo(3.5, 0.92, 0.06, 0.03), teak), -5, 0.5, -6.02); const deskStripe = add(new THREE.Mesh(roundedBoxGeo(3.5, 0.06, 0.07, 0.02), mat(0xe8a03a)), -5, 0.78, -6.01); void deskFront; void deskStripe;
  rotaryPhone(-6.3, 1.08, -6.7, 0.3);
  credenza(2.55, -4.6, -Math.PI / 2, 1.6); coll(2.25, -5.45, 2.85, -3.75); radio(2.55, 0.8, -4.2, -Math.PI / 2); lavaLamp(2.55, 0.8, -5.0);
  wallClock(-2.7, 2.25, -11.8, 0);
  macrame(1.7, -11.2); macrame(-12.4, -2.7, 2.7);
  poster("happyPaws", -12.82, 1.95, -6.5, Math.PI / 2); poster("est1974", -7.6, 1.85, -11.82, 0, 0.9, 1.2);
  wallSconce(-12.8, 1.9, -9.6, Math.PI / 2); wallSconce(-12.8, 1.9, -3.6, Math.PI / 2);
  // ---- staff room
  recordPlayer(15.45, -9.6, -Math.PI / 2); retroFridge(10.45, -4.3, Math.PI / 2); poster("washPaws", 15.82, 1.85, -7.4, -Math.PI / 2, 0.85, 1.15); mushroomLamp(15.4, -11.2, 0xff8a2a);
  // ---- office
  bankersLamp(-18.35, 0.84, 6.25, 0); arcLamp(-14.6, 10.6, Math.PI + 0.6);
  // ---- shop + pharmacy + corridor glow
  mushroomLamp(-13.6, -3.0); wallSconce(-3.2, 1.9, 4.2, -Math.PI / 2);
  [-15, -5, 5, 15].forEach(x => wallSconce(x, 2.0, -1.82, 0));
  // ---- exam room: the cat-teeth poster (clinical, white light)
  poster("catTeeth", 3.18, 1.85, -4.6, Math.PI / 2, 0.85, 1.15);
  // light pools under the room pendants (white in clinical rooms)
  for (const k in ROOMS) { if (k === "corridor") continue; const r = ROOMS[k]; pool((r.x[0] + r.x[1]) / 2, (r.z[0] + r.z[1]) / 2, COZY_WHITE.includes(k) ? 2.6 : 2.2, COZY_WHITE.includes(k)); }

  /* ---------- pooled point lights (fixed count → no shader recompiles) ---------- */
  const WARM = new THREE.Color(0xff9447), WHITE = new THREE.Color(0xf2f6ff);
  const spots = []; for (const k in ROOMS) { if (k === "corridor") continue; const r = ROOMS[k]; spots.push({ key: k, x: (r.x[0] + r.x[1]) / 2, z: (r.z[0] + r.z[1]) / 2, white: COZY_WHITE.includes(k) }); }
  [-15, -5, 5, 15].forEach((x, i) => spots.push({ key: "cor" + i, x, z: -0.2, white: false, corridor: true }));
  const SLOTS = []; for (let i = 0; i < 4; i++) { const L = new THREE.PointLight(0xffffff, 0, 10, 1.6); L.position.set(0, 2.7, 0); scene.add(L); SLOTS.push({ L, key: null, cur: 0 }); }
  // window and sign colours for day / evening
  const winDay = new THREE.Color(0xffc070), winNight = new THREE.Color(0x1b2d6b), winClassic = windowMats.length ? windowMats[0].emissive.clone() : new THREE.Color(0x223355);
  const hemiClassic = { sky: hemi.color.getHex(), ground: hemi.groundColor.getHex() }, sunClassic = sun.color.getHex();
  const pendantClassic = (props.pendants || []).map(p => ({ m: p.bulb.material, c: p.bulb.material.emissive.getHex(), col: p.bulb.material.color.getHex() }));

  let on = false, quality = "full";
  function apply(cozyOn, opts = {}) {
    on = !!cozyOn; quality = opts.quality || quality; root.visible = on;
    swapped.forEach(s => { s.old.visible = !on; s.neo.visible = on; });
    for (const k in saved) { const fm = themeMats.floors[k]; if (!fm) continue; if (on) { fm.map = saved[k].wood; fm.color.set(0xffffff); fm.roughness = 0.72; } else { fm.map = saved[k].map; fm.color.setHex(saved[k].color); fm.roughness = saved[k].rough; } fm.needsUpdate = true; }
    if (W.roomMats) for (const k in W.roomMats) { const rm = W.roomMats[k]; if (!rm.panel) continue; if (rm.panel0 === undefined) { rm.panel0 = rm.panel.color.getHex(); rm.stripe0 = rm.stripe.color.getHex(); } const white = COZY_WHITE.includes(k);
      if (on) { rm.panel.color.setHex(white ? 0xbcd6cf : 0x5a321e); rm.stripe.color.setHex(white ? 0x2c8a80 : 0xe8a03a); if (rm.stripe.emissive) rm.stripe.emissive.setHex(white ? 0x2c8a80 : 0xe8a03a); } else { rm.panel.color.setHex(rm.panel0); rm.stripe.color.setHex(rm.stripe0); if (rm.stripe.emissive) rm.stripe.emissive.setHex(rm.stripe0); } }
    if (on) { W.setThemeColors({ wall: 0x2a1a1c, trim: 0x6b4428, accent: 0xd99a2b }); hemi.color.setHex(0xffd8b0); hemi.groundColor.setHex(0x2b1a12); sun.color.setHex(0xffc68a); Object.assign(W.lightCfg, quality === "light" ? { hemi: 0.62, hemiN: 0.32, sun: 0.48, sunN: 0.34 } : { hemi: 0.4, hemiN: 0.2, sun: 0.36, sunN: 0.26 }); }
    else { hemi.color.setHex(hemiClassic.sky); hemi.groundColor.setHex(hemiClassic.ground); sun.color.setHex(sunClassic); Object.assign(W.lightCfg, { hemi: 0.85, hemiN: 0.45, sun: 0.7, sunN: 0.45 }); windowMats.forEach(m => m.emissive.copy(winClassic)); }
    (props.pendants || []).forEach((p, i) => { const m = p.bulb.material; if (on) { const white = COZY_WHITE.includes(p.room); const c = white ? 0xf4f8ff : 0xff9a40; m.color.setHex(c); m.emissive.setHex(c); } else if (pendantClassic[i]) { m.color.setHex(pendantClassic[i].col); m.emissive.setHex(pendantClassic[i].c); } });
    (props.rugs || []).forEach((r, i) => { if (r.userData.c0 === undefined) r.userData.c0 = r.material.color.getHex(); r.material.color.setHex(on ? [0x6a2a1a, 0x4a3a1c, 0x5a2e22, 0x3e4a30][i % 4] : r.userData.c0); });
    if (props.catBed) { if (props.catBed.userData.c0 === undefined) props.catBed.userData.c0 = props.catBed.material.color.getHex(); props.catBed.material.color.setHex(on ? 0xc98a24 : props.catBed.userData.c0); }
    if (!on) SLOTS.forEach(s => { s.L.intensity = 0; s.cur = 0; s.key = null; });
  }
  function update(dt, pos, night, t) {
    if (!on) return;
    // windows: golden by day, deep blue in the evening
    windowMats.forEach(m => m.emissive.copy(winDay).lerp(winNight, night));
    shades.forEach(s => s.m.emissiveIntensity = s.base * (0.75 + night * 0.6));
    pools.forEach(m => m.opacity = 0.55 + night * 0.4);
    if (props.lava) props.lava.userData.blobs.forEach((b, i) => b.position.y = 0.2 + (Math.sin(t * 0.0006 * (1 + i * 0.3) + i * 2) * 0.5 + 0.5) * 0.18);
    if (props.recordPlayer && props.recordPlayer.userData.spin) props.recordPlayer.userData.disc.rotation.y += dt * 3.5;
    if (props.cozyClock && typeof G !== "undefined" && G.s) { const mins = G.s.clockMin || 0; const [hH, mH] = props.cozyClock.userData.hands; hH.rotation.z = -(mins / 720) * Math.PI * 2; mH.rotation.z = -((mins % 60) / 60) * Math.PI * 2; hH.position.set(Math.sin(-hH.rotation.z) * 0.05, Math.cos(hH.rotation.z) * 0.05, 0.03); mH.position.set(Math.sin(-mH.rotation.z) * 0.075, Math.cos(mH.rotation.z) * 0.075, 0.035); }
    if (quality === "light") { SLOTS.forEach(s => s.L.intensity = 0); return; }
    // the 4 lights go to the room spots nearest Ahmad, fading in/out as he walks
    const want = spots.map(s => ({ s, d: Math.hypot(s.x - pos.x, s.z - pos.z) })).sort((a, b) => a.d - b.d).slice(0, 4).map(o => o.s);
    const wantKeys = new Set(want.map(s => s.key));
    SLOTS.forEach(sl => { if (sl.key && !wantKeys.has(sl.key)) sl.target = 0; });
    want.forEach(sp => { let sl = SLOTS.find(x => x.key === sp.key); if (!sl) { sl = SLOTS.filter(x => !x.key || !wantKeys.has(x.key)).sort((a, b) => a.cur - b.cur)[0]; if (sl && sl.cur < 0.08) { sl.key = sp.key; sl.L.position.set(sp.x, sp.corridor ? 2.4 : 2.7, sp.z); sl.L.color.copy(sp.white ? WHITE : WARM); sl.L.distance = sp.corridor ? 7 : 10; sl.white = sp.white; } else return; } sl.target = sp.white ? 1.5 : (sp.corridor ? 0.9 : 1.3) * (1 + night * 0.3); });
    SLOTS.forEach(sl => { const tg = sl.target || 0; sl.cur += (tg - sl.cur) * Math.min(1, dt * 4); if (sl.cur < 0.02 && tg === 0) sl.key = null; sl.L.intensity = sl.cur; });
  }
  return { apply, update, colliders, rug: { x: rugX, z: rugZ, r: 1.7 }, get on() { return on; } };
}

/* ---- original retro posters (all hand-drawn here, no outside art) ---- */
const COZY_POSTERS = {
  happyPaws: (g, w, h) => { g.fillStyle = "#f1d9ae"; g.fillRect(0, 0, w, h); const cs = ["#d8572a", "#e8a03a", "#2c5f5a"]; for (let i = 0; i < 18; i++) { g.fillStyle = cs[i % 3]; g.beginPath(); g.moveTo(w / 2, 230); g.arc(w / 2, 230, 330, i * Math.PI / 9, (i + 0.5) * Math.PI / 9); g.fill(); } g.fillStyle = "#f1d9ae"; g.beginPath(); g.arc(w / 2, 230, 92, 0, 7); g.fill(); g.fillStyle = "#3a2216"; g.beginPath(); g.ellipse(w / 2, 240, 30, 26, 0, 0, 7); g.fill(); [[-34, -30], [-12, -46], [12, -46], [34, -30]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(w / 2 + dx, 240 + dy, 12, 15, 0, 0, 7); g.fill(); }); g.fillStyle = "#3a2216"; g.fillRect(0, h - 104, w, 104); g.fillStyle = "#f1d9ae"; g.font = "bold 44px Georgia, serif"; g.textAlign = "center"; g.fillText("HAPPY PAWS", w / 2, h - 52); g.font = "italic 20px Georgia, serif"; g.fillStyle = "#e8a03a"; g.fillText("check-ups make tails wag", w / 2, h - 22); },
  est1974: (g, w, h) => { g.fillStyle = "#2c5f5a"; g.fillRect(0, 0, w, h); ["#e8a03a", "#d8572a", "#f1d9ae"].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, 250 + i * 26, w, 18); }); g.fillStyle = "#f1d9ae"; g.beginPath(); g.arc(w / 2, 150, 70, 0, 7); g.fill(); g.fillStyle = "#2c5f5a"; g.font = "bold 70px Georgia, serif"; g.textAlign = "center"; g.fillText("✚", w / 2, 175); g.fillStyle = "#3a2216"; g.fillRect(0, h - 120, w, 120); g.fillStyle = "#f1d9ae"; g.font = "bold 34px Georgia, serif"; g.fillText("CLINIC", w / 2, h - 72); g.font = "bold 26px Georgia, serif"; g.fillStyle = "#e8a03a"; g.fillText("est. 1974", w / 2, h - 34); },
  catTeeth: (g, w, h) => { g.fillStyle = "#f1d9ae"; g.fillRect(0, 0, w, h); g.fillStyle = "#d8572a"; g.fillRect(0, 0, w, 78); g.fillStyle = "#f1d9ae"; g.font = "bold 28px Georgia, serif"; g.textAlign = "center"; g.fillText("KNOW YOUR", w / 2, 34); g.fillText("CAT'S TEETH", w / 2, 66); g.strokeStyle = "#3a2216"; g.lineWidth = 4; g.beginPath(); g.ellipse(w / 2, 230, 120, 90, 0, Math.PI, 0); g.stroke(); const teeth = [["Incisors", 12], ["Canines", 4], ["Premolars", 10], ["Molars", 4]]; for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) / 9 * Math.PI; const x = w / 2 + Math.cos(a) * 112, y = 230 + Math.sin(a) * 82; g.fillStyle = i === 1 || i === 7 ? "#fff" : "#fffaf0"; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y); g.lineTo(x, y + (i === 1 || i === 7 ? 30 : 16)); g.closePath(); g.fill(); g.stroke(); } g.textAlign = "left"; g.font = "bold 20px Georgia, serif"; teeth.forEach((t, i) => { g.fillStyle = ["#2c5f5a", "#d8572a", "#e8a03a", "#3a2216"][i]; g.fillRect(40, 300 + i * 38, 16, 16); g.fillStyle = "#3a2216"; g.fillText(`${t[0]} — ${t[1]}`, 66, 315 + i * 38); }); g.font = "italic 17px Georgia, serif"; g.textAlign = "center"; g.fillText("30 adult teeth · brush them!", w / 2, h - 18); },
  washPaws: (g, w, h) => { g.fillStyle = "#e8a03a"; g.fillRect(0, 0, w, h); g.fillStyle = "#3a2216"; g.font = "bold 40px Georgia, serif"; g.textAlign = "center"; g.fillText("WASH", w / 2, 60); g.fillText("YOUR PAWS", w / 2, 104); g.fillStyle = "#f1d9ae"; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(60 + (i % 3) * 120, 170 + Math.floor(i / 3) * 70 + (i % 2) * 12, 16 + (i % 3) * 4, 0, 7); g.fill(); } g.fillStyle = "#2c5f5a"; g.beginPath(); g.ellipse(w / 2, 300, 46, 40, 0, 0, 7); g.fill(); [[-44, -40], [-16, -62], [16, -62], [44, -40]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(w / 2 + dx, 300 + dy, 16, 20, 0, 0, 7); g.fill(); }); g.fillStyle = "#3a2216"; g.fillRect(0, h - 90, w, 90); g.fillStyle = "#f1d9ae"; g.font = "italic 20px Georgia, serif"; g.fillText("20 seconds · between every patient", w / 2, h - 38); }
};
