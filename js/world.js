/* ============================================================
   WORLD v2 — Three.js scene for Batman Clinic
   x = east/west, z = north/south (+z toward the default camera)
   ============================================================ */

const ROOMS = {
  shop:      { name: "Clinic Shop",          x: [-21, -13], z: [-12, -2],  floor: 0x3a3352, floor2: 0x332d4a },
  reception: { name: "Reception & Waiting",  x: [-13, 3],   z: [-12, -2],  floor: 0x3b3f5c, floor2: 0x343852 },
  exam:      { name: "Exam Room",            x: [3, 10],    z: [-12, -2],  floor: 0x2f4a4e, floor2: 0x2a4246 },
  staff:     { name: "Staff Room",           x: [10, 16],   z: [-12, -2],  floor: 0x4a3d33, floor2: 0x42362d },
  dental:    { name: "Dental Suite",         x: [16, 23],   z: [-12, -2],  floor: 0x2f3550, floor2: 0x2a2f48, locked: "dental" },
  office:    { name: "Office & Library",     x: [-21, -14], z: [1.5, 12],  floor: 0x4a3d33, floor2: 0x42362d },
  lab:       { name: "Laboratory",           x: [-14, -8],  z: [1.5, 12],  floor: 0x2e3f5a, floor2: 0x293850 },
  pharmacy:  { name: "Pharmacy",             x: [-8, -3],   z: [1.5, 12],  floor: 0x3d3350, floor2: 0x362d48 },
  prep:      { name: "Prep & Scrub Room",    x: [-3, 3],    z: [1.5, 12],  floor: 0x33405c, floor2: 0x2d3952 },
  or:        { name: "Operating Room",       x: [3, 11],    z: [1.5, 12],  floor: 0x2e4a44, floor2: 0x29423d },
  xray:      { name: "X-ray Suite",          x: [11, 16],   z: [1.5, 12],  floor: 0x332f4e, floor2: 0x2d2a46 },
  ward:      { name: "Exotics & Isolation Ward", x: [16, 23], z: [1.5, 12], floor: 0x2f4a4e, floor2: 0x2a4246, locked: "ward" },
  corridor:  { name: "Corridor",             x: [-21, 23],  z: [-2, 1.5],  floor: 0x363a52, floor2: 0x30344a }
};

const World = (() => {
  let scene, camera, renderer, clock;
  const walls = [], colliders = [], fadeables = [], labels = [], props = {}, npcs = [], gates = {};
  let playerCfg = null, preview = false, previewAngle = 0; let player = null, player2 = null, ring = null, signSprite = null, neonSprite = null, rain = null, searchlight = null, cat = null, hemi = null, sun = null, torch = null;
  const theme = { wall: 0x2a2f4a, accent: 0xf2c14e, trim: 0x4b4f7a, coat: 0xe9e9f2, decor: true };
  const themeMats = { wall: null, wallClones: [], accent: [], trim: [], floors: {} };
  const lockedRooms = { dental: true, ward: true };
  const lockedMeshes = { dental: [], ward: [] };
  let camDist = 1.0, camMode = "third", yaw = Math.PI, pitch = -0.1, tYaw = Math.PI, tPitch = -0.1, lookSens = 1, headBob = true, nightAmount = 0, weather = "clear", hour = 9;
  const windowMats = [];

  /* ---------- helpers ---------- */
  function roundedBoxGeo(w, h, d, r = 0.08) {
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const W = w - 2 * r, H = h - 2 * r, x = -W / 2, y = -H / 2, rr = Math.min(r, W / 2, H / 2);
    const s = new THREE.Shape();
    s.moveTo(x + rr, y); s.lineTo(x + W - rr, y); s.quadraticCurveTo(x + W, y, x + W, y + rr);
    s.lineTo(x + W, y + H - rr); s.quadraticCurveTo(x + W, y + H, x + W - rr, y + H);
    s.lineTo(x + rr, y + H); s.quadraticCurveTo(x, y + H, x, y + H - rr);
    s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 4 });
    g.center(); return g;
  }
  const mat = (color, opts = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.02 }, opts));
  function box(w, h, d, color, x, y, z, r = 0.08, m = null) { const mesh = new THREE.Mesh(roundedBoxGeo(w, h, d, r), m || mat(color)); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
  function sphere(r, color, x, y, z, m = null) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m || mat(color)); s.position.set(x, y, z); s.castShadow = true; return s; }
  function cyl(rt, rb, h, color, x, y, z, m = null) { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 18), m || mat(color)); c.position.set(x, y, z); c.castShadow = true; return c; }
  function addCollider(x1, z1, x2, z2) { colliders.push({ minX: Math.min(x1, x2), maxX: Math.max(x1, x2), minZ: Math.min(z1, z2), maxZ: Math.max(z1, z2) }); }
  function roundRectPath(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath(); }
  function textSprite(text, opts = {}) {
    const c = document.createElement("canvas"); c.width = 768; c.height = 160; const ctx = c.getContext("2d");
    const draw = (t) => { ctx.clearRect(0, 0, c.width, c.height); ctx.font = `bold ${opts.size || 54}px 'Nunito','Segoe UI',sans-serif`; const tw = Math.min(740, ctx.measureText(t).width + 70), x = (c.width - tw) / 2; ctx.fillStyle = opts.bg || "rgba(24,27,45,0.94)"; ctx.beginPath(); roundRectPath(ctx, x, 30, tw, 100, 50); ctx.fill(); if (opts.glow) { ctx.shadowColor = opts.color || "#f2c14e"; ctx.shadowBlur = 24; } ctx.fillStyle = opts.color || "#f2c14e"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(t, c.width / 2, 82, 700); ctx.shadowBlur = 0; };
    draw(text); const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); const sc = opts.scale || 1; sp.scale.set(4.8 * sc, 1.0 * sc, 1);
    sp.userData.setText = (t) => { draw(t); tex.needsUpdate = true; }; return sp;
  }
  function tileTexture(c1, c2, size = 2) {
    const c = document.createElement("canvas"); c.width = c.height = 128; const ctx = c.getContext("2d");
    const h1 = "#" + c1.toString(16).padStart(6, "0"), h2 = "#" + c2.toString(16).padStart(6, "0");
    ctx.fillStyle = h1; ctx.fillRect(0, 0, 128, 128); ctx.fillStyle = h2; ctx.fillRect(0, 0, 64, 64); ctx.fillRect(64, 64, 64, 64);
    ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 2; ctx.strokeRect(1, 1, 126, 126); ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(64, 128); ctx.moveTo(0, 64); ctx.lineTo(128, 64); ctx.stroke();
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(size, size); return t;
  }

  /* ---------- building ---------- */
  function wall(x1, z1, x2, z2, h = 2.6, t = 0.3) {
    const horizontal = Math.abs(x2 - x1) > Math.abs(z2 - z1); const len = (horizontal ? Math.abs(x2 - x1) : Math.abs(z2 - z1)) + t;
    const mesh = new THREE.Mesh(roundedBoxGeo(horizontal ? len : t, h, horizontal ? t : len, 0.08), themeMats.wall.clone());
    mesh.position.set((x1 + x2) / 2, h / 2, (z1 + z2) / 2); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
    const aabb = { minX: mesh.position.x - (horizontal ? len : t) / 2, maxX: mesh.position.x + (horizontal ? len : t) / 2, minZ: mesh.position.z - (horizontal ? t : len) / 2, maxZ: mesh.position.z + (horizontal ? t : len) / 2 };
    walls.push({ mesh, aabb }); fadeables.push(mesh); themeMats.wallClones.push(mesh.material);
    // baseboard trim
    const bb = new THREE.Mesh(roundedBoxGeo(horizontal ? len + 0.04 : t + 0.08, 0.18, horizontal ? t + 0.08 : len + 0.04, 0.04), mat(theme.trim)); bb.position.set(mesh.position.x, 0.09, mesh.position.z); scene.add(bb); themeMats.trim.push(bb.material); fadeables.push(bb);
    return mesh;
  }
  function lintel(x, z, horizontal, w = 2.2) { const m = box(horizontal ? w + 0.3 : 0.36, 0.5, horizontal ? 0.36 : w + 0.3, theme.trim, x, 2.35, z, 0.12); themeMats.trim.push(m.material); fadeables.push(m); scene.add(m); walls.push({ mesh: m, aabb: null }); }
  function windowPane(x, z, horizontal, w = 1.6) { // glass set into an outer wall
    const g = new THREE.Mesh(roundedBoxGeo(horizontal ? w : 0.12, 1.1, horizontal ? 0.12 : w, 0.04), new THREE.MeshStandardMaterial({ color: 0x9fc5ea, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.3, emissive: 0x223355, emissiveIntensity: 0.4 }));
    g.position.set(x, 1.6, z); scene.add(g); windowMats.push(g.material);
  }
  function floorPlane(x1, z1, x2, z2, color, key, color2) {
    const g = new THREE.PlaneGeometry(x2 - x1, z2 - z1); const m = mat(color, { roughness: 0.9 });
    if (color2) { m.map = tileTexture(color, color2, Math.max(1, Math.round((x2 - x1) / 2))); m.color.set(0xffffff); }
    const p = new THREE.Mesh(g, m); p.rotation.x = -Math.PI / 2; p.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2); p.receiveShadow = true; scene.add(p); if (key) themeMats.floors[key] = m; return p;
  }
  function pendant(x, z, color = 0xfff1c0) { const g = new THREE.Group(); g.add(cyl(0.01, 0.01, 0.6, 0x5a5e80, 0, 2.95, 0)); const shade = cyl(0.22, 0.32, 0.22, 0x2a2f4a, 0, 2.6, 0); g.add(shade); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2 })); bulb.position.y = 2.5; g.add(bulb); g.position.set(x, 0, z); g.userData.decor = true; scene.add(g); return g; }
  function rug(x, z, w, d, color) { const r = box(w, 0.03, d, color, x, 0.015, z, 0.02); r.userData.decor = true; scene.add(r); return r; }
  function plant(x, z, big = false) { if (typeof buildDecor === "function") { const g = new THREE.Group(); g.userData.decor = true; scene.add(g); return g; }
 const g = new THREE.Group(); g.add(cyl(big ? 0.3 : 0.22, big ? 0.25 : 0.18, big ? 0.55 : 0.4, 0x5a3e2b, 0, big ? 0.27 : 0.2, 0)); for (let i = 0; i < (big ? 8 : 5); i++) { const l = sphere(big ? 0.3 : 0.22, 0x3f8f5a, (Math.random() - .5) * .4, (big ? 0.85 : 0.6) + Math.random() * .35, (Math.random() - .5) * .4); l.scale.set(1, 1.3, 1); g.add(l); } g.position.set(x, 0, z); g.userData.decor = true; scene.add(g); return g; }
  function poster(x, z, rotY, color) { if (typeof buildDecor === "function") { const g = new THREE.Group(); g.userData.decor = true; scene.add(g); return g; }
 const g = new THREE.Group(); g.add(box(1.0, 0.75, 0.06, 0xdfe3ee, 0, 0, 0, 0.04)); g.add(box(0.8, 0.55, 0.07, color, 0, 0, 0.01, 0.06)); g.add(box(0.35, 0.08, 0.08, 0xf2c14e, -0.15, 0.12, 0.02, 0.03)); g.add(box(0.5, 0.05, 0.08, 0xdfe3ee, -0.07, 0, 0.02, 0.02)); g.position.set(x, 1.6, z); g.rotation.y = rotY; g.userData.decor = true; scene.add(g); return g; }
  function chair(x, z, rotY) { const g = new THREE.Group(); g.add(accentBox(0.6, 0.12, 0.6, 0, 0.45, 0, 0.06)); g.add(accentBox(0.6, 0.5, 0.12, 0, 0.75, -0.24, 0.06)); [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(p => g.add(cyl(0.03, 0.03, 0.42, 0x6b6f8f, p[0], 0.21, p[1]))); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g); addCollider(x - .3, z - .3, x + .3, z + .3); return g; }
  function sofa(x, z, rotY, w = 2.2) { const g = new THREE.Group(); g.add(accentBox(w, 0.45, 0.8, 0, 0.25, 0, 0.14)); g.add(accentBox(w, 0.55, 0.22, 0, 0.72, -0.3, 0.1)); g.add(accentBox(0.22, 0.3, 0.8, -w / 2 + 0.11, 0.6, 0, 0.08)); g.add(accentBox(0.22, 0.3, 0.8, w / 2 - 0.11, 0.6, 0, 0.08)); [[-0.5], [0.5]].forEach(p => g.add(box(0.5, 0.1, 0.6, theme.trim, p[0], 0.5, 0.05, 0.05))); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g); const hw = rotY ? 0.45 : w / 2, hd = rotY ? w / 2 : 0.45; addCollider(x - hw, z - hd, x + hw, z + hd); return g; }
  function table(x, z, w, d, h, color, legColor = 0x6b6f8f) { const g = new THREE.Group(); g.add(box(w, 0.12, d, color, 0, h, 0, 0.06)); [[-w / 2 + .12, -d / 2 + .12], [w / 2 - .12, -d / 2 + .12], [-w / 2 + .12, d / 2 - .12], [w / 2 - .12, d / 2 - .12]].forEach(p => g.add(cyl(0.05, 0.05, h, legColor, p[0], h / 2, p[1]))); g.position.set(x, 0, z); scene.add(g); addCollider(x - w / 2, z - d / 2, x + w / 2, z + d / 2); return g; }
  function shelf(x, z, w, rotY, items, palette) { const g = new THREE.Group(); g.add(trimBox(w, 2.0, 0.4, 0, 1.0, 0, 0.06)); const pal = palette || [0xf2c14e, 0x7c6fcf, 0x5f8fd6, 0xe07a5f, 0x4fb3a9]; for (let s = 0; s < 3; s++) { g.add(box(w - 0.1, 0.06, 0.38, 0xdfe3ee, 0, 0.45 + s * 0.55, 0.02, 0.03)); for (let i = 0; i < items; i++) g.add(box(0.22, 0.3, 0.2, pal[(i + s) % pal.length], -w / 2 + 0.25 + i * ((w - 0.4) / Math.max(1, items - 1)), 0.65 + s * 0.55, 0.05, 0.05)); } g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g); return g; }
  function cabinet(x, z, w, rotY, color) { const g = new THREE.Group(); g.add(box(w, 0.9, 0.6, color || theme.trim, 0, 0.45, 0, 0.08)); g.add(box(w - 0.1, 0.08, 0.62, 0xdfe3ee, 0, 0.94, 0, 0.04)); for (let i = 0; i < Math.floor(w / 0.6); i++) g.add(box(0.5, 0.7, 0.04, 0xdfe3ee, -w / 2 + 0.35 + i * 0.6, 0.45, 0.31, 0.04)); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g); if (!color) themeMats.trim.push(g.children[0].material); return g; }
  function accentBox(w, h, d, x, y, z, r) { const m = box(w, h, d, theme.accent, x, y, z, r); themeMats.accent.push(m.material); return m; }
  function trimBox(w, h, d, x, y, z, r) { const m = box(w, h, d, theme.trim, x, y, z, r); themeMats.trim.push(m.material); return m; }
  function screen(w, h, x, y, z, color = 0x5f8fd6) { const s = new THREE.Mesh(roundedBoxGeo(w, h, 0.05, 0.03), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35 })); s.position.set(x, y, z); return s; }

  function buildRooms() {
    themeMats.wall = mat(theme.wall); themeMats.wallClones = [];
    for (const k in ROOMS) { const r = ROOMS[k]; floorPlane(r.x[0], r.z[0], r.x[1], r.z[1], r.floor, k, r.floor2); }
    // outside: pavement, road, grass
    floorPlane(-24, -18, 26, -12, 0x2a2d3e); floorPlane(-60, -24, 60, -18, 0x1b1d2b); floorPlane(-60, -60, 60, -24, 0x22304a); floorPlane(-60, -18, -24, 30, 0x274a3e); floorPlane(26, -18, 60, 30, 0x274a3e); floorPlane(-60, 12, 60, 60, 0x274a3e);
    // road markings
    for (let x = -56; x < 56; x += 4) { const m = box(2, 0.02, 0.2, 0xf2c14e, x, 0.02, -21, 0.01); scene.add(m); }
    // outer walls (with entrance at x=-5)
    wall(-21, -12, -6.1, -12); wall(-3.9, -12, 23, -12); lintel(-5, -12, true, 2.2);
    wall(-21, 12, 23, 12); wall(-21, -12, -21, 12); wall(23, -12, 23, 12);
    // windows along the south façade
    [-18, -14.5, -10, 0.5, 6.5, 13, 19.5].forEach(x => windowPane(x, -12, true));
    // south row interior
    wall(-13, -12, -13, -2); wall(3, -12, 3, -2); wall(10, -12, 10, -2); wall(16, -12, 16, -2);
    // corridor south wall (z=-2): doors at x=-17, -5, 6.5, 13, 19.5
    wall(-21, -2, -18, -2); wall(-16, -2, -6, -2); wall(-4, -2, 5.5, -2); wall(7.5, -2, 12, -2); wall(14, -2, 18.5, -2); wall(20.5, -2, 23, -2);
    [-17, -5, 6.5, 13, 19.5].forEach(x => lintel(x, -2, true));
    // corridor north wall (z=1.5): doors at x=-17.5, -11, -5.5, 0, 7, 13.5, 19.5
    wall(-21, 1.5, -18.5, 1.5); wall(-16.5, 1.5, -12, 1.5); wall(-10, 1.5, -6.5, 1.5); wall(-4.5, 1.5, -1, 1.5); wall(1, 1.5, 6, 1.5); wall(8, 1.5, 12.5, 1.5); wall(14.5, 1.5, 18.5, 1.5); wall(20.5, 1.5, 23, 1.5);
    [-17.5, -11, -5.5, 0, 7, 13.5, 19.5].forEach(x => lintel(x, 1.5, true));
    // north row interior
    wall(-14, 1.5, -14, 12); wall(-8, 1.5, -8, 12); wall(-3, 1.5, -3, 12); wall(3, 1.5, 3, 7); wall(3, 9, 3, 12); lintel(3, 8, false, 2); wall(11, 1.5, 11, 12); wall(16, 1.5, 16, 12);
    // corridor columns & pendant lights
    [-19, -9, 1, 10, 18].forEach(x => { pendant(x, -0.25); });
    for (const k in ROOMS) { if (k === "corridor") continue; const r = ROOMS[k]; const cx = (r.x[0] + r.x[1]) / 2, cz = (r.z[0] + r.z[1]) / 2; pendant(cx, cz); const sp = textSprite(r.name, { size: 50 }); sp.position.set(cx, 3.4, cz); scene.add(sp); labels.push(sp); }
    // sterile-zone notice + locked notices
    const sz = textSprite("STERILE ZONE — scrubs, cap & mask required", { size: 34, bg: "rgba(70,18,36,0.96)", color: "#ff8fa3", scale: 0.8 }); sz.position.set(7, 1.7, 1.0); scene.add(sz);
    ["dental", "ward"].forEach(k => { const r = ROOMS[k]; const s = textSprite("FOR SALE — expand from the office", { size: 36, bg: "rgba(40,36,20,0.96)", color: "#f2c14e", scale: 0.85 }); s.position.set((r.x[0] + r.x[1]) / 2, 2.2, (r.z[0] + r.z[1]) / 2); scene.add(s); lockedMeshes[k].push(s); });
    // clinic sign: neon above the entrance
    signSprite = textSprite("BATMAN CLINIC", { size: 64, bg: "rgba(14,16,30,0.97)", color: "#f2c14e", scale: 1.6, glow: true }); signSprite.position.set(-5, 3.7, -12.1); scene.add(signSprite);
    neonSprite = textSprite("24h  VET", { size: 48, bg: "rgba(14,16,30,0.9)", color: "#ff8fa3", scale: 0.9, glow: true }); neonSprite.position.set(1.5, 2.6, -12.15); scene.add(neonSprite);
    // skyline backdrop
    const c = document.createElement("canvas"); c.width = 2048; c.height = 512; const ctx = c.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 512); grad.addColorStop(0, "#0b0e1c"); grad.addColorStop(1, "#1a1f3a"); ctx.fillStyle = grad; ctx.fillRect(0, 0, 2048, 512);
    for (let i = 0; i < 140; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.6})`; ctx.fillRect(Math.random() * 2048, Math.random() * 200, 2, 2); }
    let x = 0; while (x < 2048) { const w = 40 + Math.random() * 90, h = 120 + Math.random() * 300; ctx.fillStyle = "#141830"; ctx.fillRect(x, 512 - h, w, h); ctx.fillStyle = "#f2c14e"; for (let wy = 512 - h + 12; wy < 500; wy += 18) for (let wx = x + 6; wx < x + w - 8; wx += 14) if (Math.random() < 0.35) ctx.fillRect(wx, wy, 6, 8); x += w + 6 + Math.random() * 20; }
    const skyTex = new THREE.CanvasTexture(c); const sky = new THREE.Mesh(new THREE.PlaneGeometry(160, 40), new THREE.MeshBasicMaterial({ map: skyTex, fog: false })); sky.position.set(0, 16, -58); scene.add(sky);
    const sky2 = sky.clone(); sky2.rotation.y = Math.PI / 2; sky2.position.set(-70, 16, 0); scene.add(sky2); const sky3 = sky.clone(); sky3.rotation.y = -Math.PI / 2; sky3.position.set(72, 16, 0); scene.add(sky3);
    // searchlight beam (a nod to the night sky)
    searchlight = new THREE.Mesh(new THREE.ConeGeometry(3.5, 40, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xf2c14e, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, fog: false }));
    searchlight.position.set(34, 20, -40); searchlight.rotation.z = 0.5; scene.add(searchlight);
    // moon
    const moon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d5, fog: false })); moon.position.set(-30, 30, -52); scene.add(moon);
    // rain system (hidden unless weather = rain)
    const N = 1600, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = -30 + Math.random() * 60; pos[i * 3 + 1] = Math.random() * 14; pos[i * 3 + 2] = -30 + Math.random() * 20; }
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    rain = new THREE.Points(rg, new THREE.PointsMaterial({ color: 0x9fc5ea, size: 0.08, transparent: true, opacity: 0.6 })); rain.visible = false; scene.add(rain);
  }

  function buildFurniture() {
    // ---- Reception & waiting (-13..3, -12..-2); entrance x=-5
    const desk = new THREE.Group(); desk.add(accentBox(3.4, 1.0, 0.9, 0, 0.5, 0, 0.14)); desk.add(box(3.6, 0.1, 1.0, 0xdfe3ee, 0, 1.03, 0, 0.05)); desk.add(screen(0.5, 0.35, -1.0, 1.3, -0.1)); desk.add(box(0.1, 0.15, 0.1, 0x6b6f8f, -1.0, 1.1, -0.1, 0.03)); desk.add(box(0.6, 0.35, 0.5, 0xdfe3ee, 0.9, 1.25, -0.15, 0.06));
    desk.position.set(-5, 0, -6.5); scene.add(desk); addCollider(-6.7, -6.95, -3.3, -6.05); props.desk = desk;
    const bell = new THREE.Group(); const dome = sphere(0.14, 0xf5c542, 0, 0.07, 0); dome.scale.y = 0.7; bell.add(dome); bell.add(cyl(0.18, 0.2, 0.04, 0x6b6f8f, 0, 0, 0)); bell.add(sphere(0.035, 0xb88a20, 0, 0.18, 0)); bell.position.set(-3.7, 1.1, -6.5); scene.add(bell); props.bell = bell;
    // reception logo on floor
    const logo = textSprite("Batman Clinic", { size: 60, bg: "rgba(0,0,0,0)", color: "rgba(242,193,78,0.35)", scale: 1.2 }); logo.position.set(-5, 0.06, -9.2); scene.add(logo); props.floorLogo = logo;
    rug(-5, -9.5, 4.5, 2.6, 0x2a2440);
    sofa(-10.5, -10.6, 0); sofa(-12.4, -6.5, Math.PI / 2, 2.4); [[-8.2, -10.6], [-7.2, -10.6]].forEach((p, i) => props["chair" + i] = chair(p[0], p[1], 0));
    // aquarium on the west wall
    const aq = new THREE.Group(); aq.add(trimBox(1.6, 0.8, 0.5, 0, 0.4, 0, 0.06)); const water = new THREE.Mesh(roundedBoxGeo(1.5, 0.9, 0.45, 0.05), new THREE.MeshStandardMaterial({ color: 0x3f8fd6, transparent: true, opacity: 0.5, emissive: 0x1f4f8a, emissiveIntensity: 0.6 })); water.position.y = 1.25; aq.add(water); for (let i = 0; i < 4; i++) { const f = sphere(0.06, [0xf2c14e, 0xe07a5f, 0xfff1c0, 0x4fb3a9][i], -0.5 + i * 0.3, 1.1 + (i % 2) * 0.25, 0); f.scale.set(1.6, 1, 0.6); f.userData.fish = { ph: i * 1.3, base: f.position.x }; aq.add(f); } aq.position.set(-12.4, 0, -3.3); aq.rotation.y = Math.PI / 2; scene.add(aq); props.aquarium = aq; addCollider(-12.9, -4.2, -11.9, -2.4);
    const shiftBoard = new THREE.Group(); shiftBoard.add(box(1.4, 1.0, 0.08, 0xdfe3ee, 0, 0, 0, 0.06)); shiftBoard.add(trimBox(1.2, 0.3, 0.09, 0, 0.3, 0.01, 0.06)); shiftBoard.add(box(1.1, 0.4, 0.09, 0xf2c14e, 0, -0.15, 0.01, 0.05)); shiftBoard.position.set(-9.5, 1.6, -11.8); scene.add(shiftBoard); props.shiftBoard = shiftBoard;
    const news = new THREE.Group(); news.add(box(1.2, 0.9, 0.08, 0x2a2f4a, 0, 0, 0, 0.06)); for (let i = 0; i < 4; i++) news.add(box(0.4, 0.3, 0.09, [0xf2c14e, 0xdfe3ee, 0x5f8fd6, 0xe07a5f][i], -0.25 + (i % 2) * 0.5, 0.2 - Math.floor(i / 2) * 0.4, 0.01, 0.03)); news.position.set(-1, 1.6, -11.8); scene.add(news); props.newsBoard = news;
    plant(-12.3, -11.3, true); plant(2.3, -2.6); poster(2.85, -7, -Math.PI / 2, 0x5f8fd6);
    const waterBowl = cyl(0.2, 0.15, 0.1, 0x5f8fd6, -8.8, 0.05, -8.6); scene.add(waterBowl);
    // cat bed (clinic cat)
    const bed = cyl(0.45, 0.4, 0.15, 0x7c6fcf, 1.5, 0.07, -10.8); scene.add(bed);

    // ---- Shop (-21..-13)
    props.counter = new THREE.Group(); props.counter.add(accentBox(2.4, 1.0, 0.8, 0, 0.5, 0, 0.12)); props.counter.add(box(2.6, 0.1, 0.9, 0xdfe3ee, 0, 1.03, 0, 0.05)); props.counter.add(box(0.35, 0.3, 0.3, 0x6b6f8f, 0.7, 1.22, 0, 0.05)); props.counter.position.set(-17, 0, -4.5); scene.add(props.counter); addCollider(-18.2, -4.9, -15.8, -4.1);
    shelf(-20.6, -7.5, 4.6, Math.PI / 2, 6); shelf(-17, -11.6, 6, 0, 7); shelf(-13.4, -8, 3.6, -Math.PI / 2, 5);
    addCollider(-21, -9.9, -20.2, -5.1); addCollider(-20, -12, -14, -11.3); addCollider(-13.8, -9.9, -13, -6.1);
    rug(-17, -8, 3, 3, 0x2a2440); plant(-14, -2.6);

    // ---- Exam room (3..10)
    props.examTable = table(6.5, -7, 1.7, 0.9, 0.85, 0xdfe3ee); props.examTable.add(box(1.6, 0.06, 0.8, 0x4fb3a9, 0, 0.95, 0, 0.03));
    cabinet(9.6, -7, 3, Math.PI / 2); addCollider(9.2, -8.6, 10, -5.4);
    const scale = new THREE.Group(); scale.add(box(0.9, 0.08, 0.6, 0x6b6f8f, 0, 0.04, 0, 0.04)); scale.add(screen(0.3, 0.2, 0, 0.18, -0.3)); scale.position.set(4.2, 0, -11); scene.add(scale); addCollider(3.7, -11.4, 4.7, -10.6);
    const oto = cyl(0.04, 0.04, 1.1, 0x6b6f8f, 9, -0, -11); oto.position.y = 0.55; scene.add(oto); scene.add(sphere(0.12, 0xf2c14e, 9, 1.15, -11));
    poster(6.5, -11.8, 0, 0x4fb3a9);

    // ---- Staff room (10..16)
    props.staffTable = table(13, -7, 1.6, 1.0, 0.75, 0x6e4b36, 0x4a3224); chair(12.3, -8.1, Math.PI); chair(13.7, -8.1, Math.PI); chair(13, -5.9, 0);
    const coffee = new THREE.Group(); coffee.add(trimBox(1.6, 0.9, 0.6, 0, 0.45, 0, 0.08)); coffee.add(box(1.6, 0.08, 0.62, 0xdfe3ee, 0, 0.94, 0, 0.04)); coffee.add(box(0.4, 0.45, 0.35, 0x23222e, -0.4, 1.2, 0, 0.06)); coffee.add(cyl(0.07, 0.06, 0.12, 0xdfe3ee, 0.3, 1.04, 0.1)); coffee.position.set(15.6, 0, -4.5); coffee.rotation.y = Math.PI / 2; scene.add(coffee); addCollider(15.2, -5.3, 16, -3.7);
    const lockers = new THREE.Group(); for (let i = 0; i < 4; i++) { lockers.add(trimBox(0.6, 1.9, 0.5, i * 0.62 - 0.93, 0.95, 0, 0.06)); lockers.add(box(0.5, 1.7, 0.04, 0xdfe3ee, i * 0.62 - 0.93, 0.95, 0.26, 0.03)); } lockers.position.set(11.5, 0, -11.7); scene.add(lockers); addCollider(10.2, -12, 13, -11.4);
    props.staffBoard = new THREE.Group(); props.staffBoard.add(box(1.6, 1.0, 0.08, 0x6e4b36, 0, 0, 0, 0.06)); for (let i = 0; i < 5; i++) props.staffBoard.add(box(0.35, 0.3, 0.09, [0xf2c14e, 0xdfe3ee, 0x5f8fd6, 0xe07a5f, 0x4fb3a9][i], -0.55 + (i % 3) * 0.5, 0.22 - Math.floor(i / 3) * 0.42, 0.01, 0.03)); props.staffBoard.position.set(14.5, 1.6, -11.8); scene.add(props.staffBoard);
    rug(13, -7, 3, 3, 0x3a2e26); plant(10.5, -2.6);

    // ---- Dental suite (16..23) — locked
    props.dentalTable = table(19.5, -7, 1.7, 0.9, 0.85, 0xdfe3ee); props.dentalTable.add(box(1.6, 0.06, 0.8, 0x7c6fcf, 0, 0.95, 0, 0.03));
    const dentalMachine = new THREE.Group(); dentalMachine.add(box(0.7, 1.0, 0.5, 0xdfe3ee, 0, 0.5, 0, 0.1)); dentalMachine.add(cyl(0.03, 0.03, 1.3, 0x6b6f8f, 0.2, 1.6, 0)); dentalMachine.add(box(0.5, 0.3, 0.2, 0x5f8fd6, 0.2, 2.2, 0, 0.05)); dentalMachine.add(cyl(0.02, 0.02, 0.6, 0xdfe3ee, -0.25, 1.3, 0.2)); dentalMachine.position.set(21.8, 0, -7); scene.add(dentalMachine); addCollider(21.4, -7.3, 22.2, -6.7);
    const dentalXray = new THREE.Group(); dentalXray.add(cyl(0.06, 0.06, 2.2, 0x6b6f8f, 0, 1.1, 0)); dentalXray.add(box(0.8, 0.1, 0.1, 0x6b6f8f, 0.4, 2.2, 0, 0.04)); dentalXray.add(cyl(0.12, 0.08, 0.3, 0xdfe3ee, 0.8, 2.0, 0)); dentalXray.position.set(17.5, 0, -8); scene.add(dentalXray); addCollider(17.3, -8.2, 17.7, -7.8);
    cabinet(19.5, -11.6, 3, 0); addCollider(18, -12, 21, -11.2);
    poster(22.85, -4.5, -Math.PI / 2, 0x7c6fcf);
    lockedMeshes.dental.push(props.dentalTable, dentalMachine, dentalXray);

    // ---- Office & library (-21..-14, 1.5..12)
    props.officeDesk = table(-17.5, 6.5, 2.2, 1.0, 0.78, 0x6e4b36, 0x4a3224); props.officeDesk.add(screen(0.7, 0.45, -0.4, 1.12, -0.2)); props.officeDesk.add(box(0.12, 0.2, 0.12, 0x6b6f8f, -0.4, 0.9, -0.2, 0.03)); props.officeDesk.add(box(0.5, 0.25, 0.4, 0xdfe3ee, 0.6, 0.97, -0.1, 0.06)); props.officeDesk.add(cyl(0.05, 0.08, 0.4, 0xf2c14e, 0.1, 1.0, 0.2));
    chair(-17.5, 7.6, Math.PI);
    props.bookshelf = new THREE.Group(); props.bookshelf.add(trimBox(4.6, 2.3, 0.4, 0, 1.15, 0, 0.06)); for (let s = 0; s < 3; s++) { props.bookshelf.add(box(4.4, 0.05, 0.38, 0xdfe3ee, 0, 0.5 + s * 0.62, 0.02, 0.02)); for (let i = 0; i < 13; i++) props.bookshelf.add(box(0.22, 0.42 + Math.random() * .1, 0.26, [0xf2c14e, 0x7c6fcf, 0x5f8fd6, 0x4fb3a9, 0xe07a5f, 0xb4557a][(i + s) % 6], -2 + i * 0.32, 0.76 + s * 0.62, 0.04, 0.04)); }
    props.bookshelf.position.set(-20.6, 0, 7); props.bookshelf.rotation.y = Math.PI / 2; scene.add(props.bookshelf); addCollider(-21, 4.6, -20.2, 9.4);
    props.cabinet = new THREE.Group(); props.cabinet.add(accentBox(1.0, 1.5, 0.6, 0, 0.75, 0, 0.08)); for (let i = 0; i < 3; i++) { props.cabinet.add(box(0.8, 0.35, 0.05, 0xdfe3ee, 0, 0.3 + i * 0.45, 0.31, 0.04)); props.cabinet.add(box(0.3, 0.05, 0.06, 0x6b6f8f, 0, 0.3 + i * 0.45, 0.35, 0.02)); } props.cabinet.position.set(-15, 0, 11.5); scene.add(props.cabinet); addCollider(-15.6, 11.1, -14.4, 12);
    props.printer = box(0.6, 0.3, 0.5, 0xdfe3ee, -19.5, 0.93, 11.4, 0.08); scene.add(props.printer); scene.add(trimBox(0.8, 0.78, 0.6, -19.5, 0.39, 11.4, 0.08)); addCollider(-20, 11, -19, 12);
    // thank-you wall (collectibles)
    props.thankWall = new THREE.Group(); for (let i = 0; i < 12; i++) { const card = box(0.42, 0.32, 0.05, [0xfff1c0, 0xffd1dc, 0xd6ecff, 0xeafbea][i % 4], -1.2 + (i % 6) * 0.48, 0.25 - Math.floor(i / 6) * 0.42, 0, 0.03); card.visible = false; props.thankWall.add(card); } props.thankWall.position.set(-17, 1.8, 11.8); scene.add(props.thankWall);
    rug(-17.5, 6.5, 3.5, 3, 0x3a2e26); plant(-14.6, 2.3); pendant(-17.5, 6.5, 0xffe3a0);

    // ---- Laboratory (-14..-8)
    const bench = new THREE.Group(); bench.add(trimBox(5.6, 0.9, 0.7, 0, 0.45, 0, 0.08)); bench.add(box(5.6, 0.08, 0.72, 0xdfe3ee, 0, 0.94, 0, 0.04)); bench.position.set(-11, 0, 11.5); scene.add(bench); addCollider(-13.8, 11.1, -8.2, 12);
    props.microscope = new THREE.Group(); props.microscope.add(box(0.3, 0.06, 0.4, 0x23222e, 0, 1.0, 0, 0.03)); props.microscope.add(cyl(0.04, 0.04, 0.5, 0x6b6f8f, 0, 1.25, -0.12)); props.microscope.add(cyl(0.06, 0.06, 0.4, 0x6b6f8f, 0, 1.45, 0.05).rotateX(0.5)); props.microscope.add(box(0.2, 0.03, 0.2, 0xdfe3ee, 0, 1.1, 0.05, 0.02)); props.microscope.position.set(-12.6, 0, 11.4); scene.add(props.microscope);
    props.analyser = new THREE.Group(); props.analyser.add(box(0.7, 0.5, 0.5, 0xdfe3ee, 0, 1.25, 0, 0.08)); props.analyser.add(screen(0.4, 0.25, 0, 1.3, 0.26, 0x7ef29a)); props.analyser.position.set(-9.6, 0, 11.4); scene.add(props.analyser);
    props.centrifuge = cyl(0.25, 0.25, 0.3, 0x6b6f8f, -11, 1.13, 11.4); scene.add(props.centrifuge);
    props.ultrasound = new THREE.Group(); props.ultrasound.add(box(0.7, 1.0, 0.6, 0xdfe3ee, 0, 0.5, 0, 0.1)); props.ultrasound.add(screen(0.6, 0.45, 0, 1.4, 0.1, 0x3a3f66)); props.ultrasound.add(cyl(0.03, 0.03, 0.9, 0x6b6f8f, 0, 1.0, 0.0)); props.ultrasound.add(box(0.12, 0.3, 0.08, 0x6b6f8f, 0.42, 1.0, 0.2, 0.04)); props.ultrasound.position.set(-13.2, 0, 5); scene.add(props.ultrasound); addCollider(-13.6, 4.6, -12.8, 5.4);
    props.labTable = table(-10.5, 6, 1.6, 0.9, 0.85, 0xdfe3ee);
    const fridge = trimBox(0.8, 1.8, 0.7, -8.5, 0.9, 3, 0.1); scene.add(fridge); addCollider(-8.9, 2.6, -8.1, 3.4);
    poster(-11, 1.8, Math.PI, 0x4fb3a9);

    // ---- Pharmacy (-8..-3)
    shelf(-5.5, 11.6, 4.6, 0, 6, [0xdfe3ee, 0xf2c14e, 0x5f8fd6, 0xdfe3ee, 0xe07a5f]); addCollider(-7.8, 11.2, -3.2, 12);
    shelf(-7.6, 7, 3.4, Math.PI / 2, 4, [0xdfe3ee, 0x7c6fcf, 0xdfe3ee]); addCollider(-8, 5.3, -7.2, 8.7);
    props.pharmacyCounter = new THREE.Group(); props.pharmacyCounter.add(trimBox(3.0, 1.0, 0.8, 0, 0.5, 0, 0.12)); props.pharmacyCounter.add(box(3.2, 0.1, 0.9, 0xdfe3ee, 0, 1.03, 0, 0.05)); props.pharmacyCounter.add(box(0.5, 0.3, 0.3, 0x6b6f8f, -0.9, 1.22, 0, 0.05)); props.pharmacyCounter.add(cyl(0.1, 0.1, 0.4, 0xdfe3ee, 0.6, 1.3, 0)); props.pharmacyCounter.position.set(-5.5, 0, 5.5); scene.add(props.pharmacyCounter); addCollider(-7, 5.1, -4, 5.9);
    const drugFridge = trimBox(0.8, 1.6, 0.7, -3.4, 0.8, 9, 0.1); drugFridge.rotation.y = Math.PI / 2; scene.add(drugFridge); addCollider(-3.8, 8.6, -3, 9.4);
    const rx = textSprite("Rx", { size: 70, bg: "rgba(14,16,30,0.9)", color: "#7ef29a", scale: 0.5, glow: true }); rx.position.set(-5.5, 2.3, 11.6); scene.add(rx);

    // ---- Prep & scrub room (-3..3)
    props.locker = new THREE.Group(); props.locker.add(trimBox(1.4, 2.0, 0.6, 0, 1.0, 0, 0.08)); props.locker.add(box(0.6, 1.8, 0.05, 0xdfe3ee, -0.35, 1.0, 0.31, 0.04)); props.locker.add(box(0.6, 1.8, 0.05, 0xdfe3ee, 0.35, 1.0, 0.31, 0.04)); props.locker.add(box(0.05, 0.2, 0.06, 0x6b6f8f, -0.1, 1.0, 0.34, 0.02)); props.locker.add(box(0.05, 0.2, 0.06, 0x6b6f8f, 0.6, 1.0, 0.34, 0.02));
    props.locker.position.set(-2.6, 0, 9.5); props.locker.rotation.y = Math.PI / 2; scene.add(props.locker); addCollider(-3, 8.7, -2.2, 10.3);
    props.sink = new THREE.Group(); props.sink.add(box(1.6, 0.9, 0.7, 0xdfe3ee, 0, 0.45, 0, 0.1)); props.sink.add(cyl(0.35, 0.3, 0.2, 0x9fc5ea, 0, 0.9, 0)); props.sink.add(cyl(0.04, 0.04, 0.4, 0x6b6f8f, 0, 1.15, -0.25)); props.sink.add(cyl(0.04, 0.04, 0.3, 0x6b6f8f, 0, 1.35, -0.12).rotateX(Math.PI / 2)); props.sink.add(box(0.2, 0.25, 0.15, 0xf2c14e, -0.55, 1.05, 0, 0.05));
    props.sink.position.set(0, 0, 11.5); scene.add(props.sink); addCollider(-0.9, 11.1, 0.9, 12);
    props.prepTable = table(0, 5.5, 1.7, 0.9, 0.85, 0xdfe3ee); props.prepTable.add(box(1.6, 0.06, 0.8, 0x5f8fd6, 0, 0.95, 0, 0.03));
    props.autoclave = new THREE.Group(); props.autoclave.add(box(0.8, 0.7, 0.7, 0x6b6f8f, 0, 1.3, 0, 0.1)); props.autoclave.add(cyl(0.22, 0.22, 0.05, 0xdfe3ee, 0, 1.3, 0.36).rotateX(Math.PI / 2)); props.autoclave.add(screen(0.25, 0.1, 0.22, 1.55, 0.36, 0x7ef29a)); props.autoclave.add(trimBox(0.8, 0.95, 0.7, 0, 0.47, 0, 0.08)); props.autoclave.position.set(2.5, 0, 3.2); scene.add(props.autoclave); addCollider(2.1, 2.8, 2.9, 3.6);
    const anesCartP = new THREE.Group(); anesCartP.add(box(0.7, 1.1, 0.5, 0x6b6f8f, 0, 0.55, 0, 0.08)); anesCartP.add(cyl(0.12, 0.12, 0.7, 0x5f8fd6, -0.15, 1.45, 0)); anesCartP.add(cyl(0.12, 0.12, 0.7, 0x4fb3a9, 0.15, 1.45, 0)); anesCartP.position.set(2.4, 0, 7.5); scene.add(anesCartP); addCollider(2, 7.2, 2.8, 7.8);
    const bin = cyl(0.25, 0.22, 0.6, 0xf2c14e, -2.5, 0.3, 2.4); scene.add(bin); addCollider(-2.8, 2.1, -2.2, 2.7);

    // ---- Operating room (3..11)
    props.orTable = table(7, 6.5, 1.9, 0.8, 0.9, 0x8a8fb0, 0x5a5e80); props.orTable.add(box(1.8, 0.08, 0.7, 0x4fb3a9, 0, 1.0, 0, 0.04));
    const lamp = new THREE.Group(); lamp.add(cyl(0.03, 0.03, 1.2, 0x6b6f8f, 0, 3.4, 0)); lamp.add(cyl(0.55, 0.4, 0.25, 0xdfe3ee, 0, 2.75, 0)); const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.35, 24), new THREE.MeshStandardMaterial({ color: 0xfff8d6, emissive: 0xfff2b0, emissiveIntensity: 0.9 })); bulb.rotation.x = Math.PI / 2; bulb.position.y = 2.62; lamp.add(bulb); const lamp2 = lamp.clone(); lamp.position.set(6.6, 0, 6.5); lamp2.position.set(7.6, 0, 6.5); lamp2.scale.setScalar(0.8); scene.add(lamp, lamp2);
    const spot = new THREE.SpotLight(0xfff4d0, 0.9, 7, 0.6, 0.5, 1); spot.position.set(7, 2.6, 6.5); spot.target.position.set(7, 1, 6.5); scene.add(spot); scene.add(spot.target);
    props.tray = new THREE.Group(); props.tray.add(box(1.0, 0.06, 0.6, 0x8a8fb0, 0, 1.0, 0, 0.03)); props.tray.add(cyl(0.03, 0.03, 1.0, 0x5a5e80, 0, 0.5, 0)); props.tray.add(box(0.9, 0.03, 0.5, 0x5f8fd6, 0, 1.05, 0, 0.02)); for (let i = 0; i < 6; i++) props.tray.add(box(0.05, 0.02, 0.3, 0xe9eef7, -0.3 + i * 0.12, 1.08, 0, 0.01)); props.tray.position.set(8.8, 0, 5.9); scene.add(props.tray); addCollider(8.3, 5.6, 9.3, 6.2);
    props.anes = new THREE.Group(); props.anes.add(box(0.8, 1.2, 0.6, 0x6b6f8f, 0, 0.6, 0, 0.1)); props.anes.add(cyl(0.12, 0.12, 0.8, 0x5f8fd6, -0.2, 1.6, 0)); props.anes.add(cyl(0.12, 0.12, 0.8, 0x4fb3a9, 0.2, 1.6, 0)); props.anes.add(screen(0.5, 0.35, 0, 1.45, 0.32, 0x3a3f66)); props.anes.add(box(0.4, 0.06, 0.02, 0x7ef29a, 0, 1.45, 0.37, 0.01)); props.anes.position.set(5, 0, 8.2); scene.add(props.anes); addCollider(4.6, 7.9, 5.4, 8.5);
    const monitor = new THREE.Group(); monitor.add(cyl(0.03, 0.03, 1.4, 0x5a5e80, 0, 0.7, 0)); monitor.add(screen(0.6, 0.45, 0, 1.6, 0, 0x3a3f66)); monitor.position.set(5, 0, 4.8); scene.add(monitor);
    props.kennel = new THREE.Group(); props.kennel.add(trimBox(1.2, 1.2, 0.9, 0, 0.6, 0, 0.1)); props.kennel.add(box(1.0, 1.0, 0.05, 0xdfe3ee, 0, 0.6, 0.46, 0.06)); for (let i = 0; i < 5; i++) props.kennel.add(cyl(0.015, 0.015, 0.9, 0x5a5e80, -0.4 + i * 0.2, 0.6, 0.48)); props.kennel.position.set(10, 0, 11.3); scene.add(props.kennel); addCollider(9.4, 10.8, 10.6, 12);
    const kennelSign = textSprite("Recovery", { size: 40, scale: 0.6 }); kennelSign.position.set(10, 1.7, 11.3); scene.add(kennelSign);
    const scrubSinkOR = box(1.2, 0.9, 0.5, 0xdfe3ee, 3.7, 0.45, 11.6, 0.1); scene.add(scrubSinkOR); addCollider(3.1, 11.3, 4.3, 12);

    // ---- X-ray suite (11..16)
    props.xrayTable = table(13.5, 6.5, 2.0, 0.9, 0.85, 0x3a3f66, 0x5a5e80);
    const arm = new THREE.Group(); arm.add(cyl(0.08, 0.08, 2.6, 0x8a8fb0, 0, 1.3, 0)); arm.add(box(1.2, 0.12, 0.12, 0x8a8fb0, 0.6, 2.55, 0, 0.05)); arm.add(box(0.5, 0.4, 0.5, 0xdfe3ee, 1.2, 2.3, 0, 0.1)); arm.add(cyl(0.12, 0.08, 0.15, 0x5f8fd6, 1.2, 2.05, 0)); arm.position.set(12.3, 0, 6.5); scene.add(arm); addCollider(12.1, 6.3, 12.5, 6.7);
    props.viewer = new THREE.Group(); props.viewer.add(box(1.8, 1.1, 0.1, 0xdfe3ee, 0, 0, 0, 0.06)); props.viewer.add(screen(1.6, 0.9, 0, 0, 0.03, 0x2d3350)); props.viewer.position.set(13.5, 1.6, 11.8); scene.add(props.viewer);
    const apron = box(0.5, 0.9, 0.08, 0x5f8fd6, 15.7, 1.2, 4, 0.08); apron.rotation.y = Math.PI / 2; scene.add(apron);
    const consoleX = new THREE.Group(); consoleX.add(box(0.9, 0.9, 0.5, 0x6b6f8f, 0, 0.45, 0, 0.08)); consoleX.add(screen(0.6, 0.4, 0, 1.15, 0)); consoleX.position.set(15.2, 0, 9.5); scene.add(consoleX); addCollider(14.7, 9.2, 15.7, 9.8);
    poster(13.5, 1.8, Math.PI, 0x7c6fcf);

    // ---- Exotics & isolation ward (16..23) — locked
    props.wardTable = table(19.5, 6.5, 1.7, 0.9, 0.85, 0xdfe3ee); props.wardTable.add(box(1.6, 0.06, 0.8, 0x4fb3a9, 0, 0.95, 0, 0.03));
    const kennelRow = new THREE.Group(); for (let i = 0; i < 4; i++) { kennelRow.add(trimBox(1.2, 1.1, 0.9, i * 1.3 - 1.95, 0.55, 0, 0.1)); kennelRow.add(box(1.0, 0.9, 0.05, 0xdfe3ee, i * 1.3 - 1.95, 0.55, 0.46, 0.06)); for (let b = 0; b < 5; b++) kennelRow.add(cyl(0.015, 0.015, 0.8, 0x5a5e80, i * 1.3 - 1.95 - 0.4 + b * 0.2, 0.55, 0.48)); } kennelRow.position.set(19.5, 0, 11.5); scene.add(kennelRow); addCollider(17, 11, 22, 12);
    const heatLamp = new THREE.Group(); heatLamp.add(cyl(0.03, 0.03, 1.6, 0x6b6f8f, 0, 0.8, 0)); const hl = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0xe07a5f, emissive: 0xe07a5f, emissiveIntensity: 0.8 })); hl.position.y = 1.6; heatLamp.add(hl); heatLamp.position.set(22.2, 0, 5); scene.add(heatLamp);
    const isoSign = textSprite("ISOLATION — PPE required", { size: 34, bg: "rgba(70,18,36,0.96)", color: "#ff8fa3", scale: 0.75 }); isoSign.position.set(21.5, 1.9, 2.6); scene.add(isoSign);
    lockedMeshes.ward.push(props.wardTable, kennelRow, heatLamp, isoSign);

    // ---- Outside: trees, bench, lamp posts, van, bins
    const tree = new THREE.Group(); tree.add(cyl(0.15, 0.2, 1.2, 0x5a3e2b, 0, 0.6, 0)); tree.add(sphere(0.9, 0x2f6b4f, 0, 1.7, 0)); tree.add(sphere(0.6, 0x3a7d5c, 0.5, 2.0, 0.3)); tree.position.set(1, 0, -15.5); scene.add(tree);
    const tree2 = tree.clone(); tree2.position.set(-11, 0, -15.5); scene.add(tree2); const tree3 = tree.clone(); tree3.position.set(14, 0, -15.5); scene.add(tree3);
    scene.add(box(1.6, 0.1, 0.5, 0x6e4b36, -8, 0.45, -14, 0.04)); scene.add(box(1.6, 0.1, 0.5, 0x6e4b36, -2, 0.45, -14, 0.04));
    [-16, -5, 8, 20].forEach(x => { const lp = new THREE.Group(); lp.add(cyl(0.06, 0.08, 3.2, 0x2a2f4a, 0, 1.6, 0)); const l = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffe3a0, emissive: 0xffd978, emissiveIntensity: 1.5 })); l.position.y = 3.3; lp.add(l); lp.position.set(x, 0, -17.5); scene.add(lp); });
    props.van = new THREE.Group(); props.van.add(box(4.2, 1.6, 2.0, 0xdfe3ee, 0, 1.1, 0, 0.25)); props.van.add(box(1.3, 1.2, 1.9, 0x2a2f4a, 1.9, 0.9, 0, 0.2)); props.van.add(box(1.2, 0.6, 1.92, 0x9fc5ea, 1.7, 1.4, 0, 0.1)); [[-1.3, 0.9], [1.3, 0.9], [-1.3, -0.9], [1.3, -0.9]].forEach(p => { const w = cyl(0.4, 0.4, 0.3, 0x23222e, p[0], 0.4, p[1]); w.rotation.x = Math.PI / 2; props.van.add(w); }); props.van.add(box(2.6, 0.5, 0.05, 0xf2c14e, -0.3, 1.3, 1.02, 0.05)); props.van.position.set(9, 0, -20.5); scene.add(props.van);
    const vanSign = textSprite("Mobile Vet Van", { size: 40, scale: 0.7 }); vanSign.position.set(9, 2.6, -20.5); scene.add(vanSign);

    buildOutdoor();
    // interaction highlight ring
    ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 32), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.85, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; ring.visible = false; scene.add(ring);
    setLocked("dental", true); setLocked("ward", true);
  }
  function buildOutdoor() {
    // pavement across the road, zebra crossing
    floorPlane(-60, -26, 60, -24, 0x2a2d3e); for (let i = 0; i < 6; i++) scene.add(box(0.6, 0.02, 5.6, 0xdfe3ee, -6.5 + i * 0.9, 0.025, -21, 0.01));
    // apartment building (home) — south of the road
    const bld = new THREE.Group(); bld.add(box(12, 9, 10, 0x3a3352, 0, 4.5, 0, 0.2)); bld.add(box(12.4, 0.4, 10.4, 0x2a2440, 0, 9.1, 0, 0.1));
    for (let f = 0; f < 3; f++) for (let i = 0; i < 4; i++) { const win = new THREE.Mesh(roundedBoxGeo(1.2, 1.1, 0.1, 0.04), new THREE.MeshStandardMaterial({ color: 0xffe3a0, emissive: 0xffd978, emissiveIntensity: (f + i) % 3 === 0 ? 0.9 : 0.25 })); win.position.set(-4.2 + i * 2.8, 2.2 + f * 2.6, 5.02); bld.add(win); bld.add(box(1.4, 0.12, 0.3, 0x2a2440, -4.2 + i * 2.8, 1.6 + f * 2.6, 5.1, 0.03)); }
    const door = box(1.4, 2.3, 0.12, 0x6e4b36, 0, 1.15, 5.02, 0.05); door.add(cyl(0.03, 0.03, 0.12, 0xf2c14e, 0.45, 0, 0.08).rotateX(Math.PI / 2)); door.add(box(0.5, 0.4, 0.02, 0x9fc5ea, 0, 0.6, 0.07, 0.02)); bld.add(door); bld.add(box(2.2, 0.3, 1.2, 0x2a2440, 0, 2.45, 5.5, 0.05));
    bld.add(box(2.4, 0.2, 1.4, 0x3a3f55, 0, 0.1, 5.6, 0.05)); bld.position.set(-10, 0, -31); scene.add(bld); addCollider(-16, -36, -4, -26);
    const homeSign = textSprite("Home", { size: 44, scale: 0.6 }); homeSign.position.set(-10, 3.2, -25.5); scene.add(homeSign);
    // garden — east, south of the road
    floorPlane(4, -36, 22, -26, 0x2f6b4f); floorPlane(5, -31.5, 21, -30.5, 0x8a7a5a); // path
    const pond = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), new THREE.MeshStandardMaterial({ color: 0x2d6fb0, roughness: 0.2, metalness: 0.4, emissive: 0x11304f, emissiveIntensity: 0.4 })); pond.rotation.x = -Math.PI / 2; pond.position.set(16, 0.02, -33.5); scene.add(pond); addCollider(13.6, -35.9, 18.4, -31.1);
    const lily = cyl(0.3, 0.3, 0.02, 0x3f8f5a, 15.2, 0.04, -33); scene.add(lily); scene.add(cyl(0.25, 0.25, 0.02, 0x3f8f5a, 17, 0.04, -34.2));
    [[7, -28], [12, -35], [20, -28], [8, -34.5]].forEach(p => { const t = new THREE.Group(); t.add(cyl(0.18, 0.24, 1.6, 0x5a3e2b, 0, 0.8, 0)); t.add(sphere(1.1, 0x2f6b4f, 0, 2.3, 0)); t.add(sphere(0.8, 0x3a7d5c, 0.6, 2.7, 0.3)); t.add(sphere(0.7, 0x2f6b4f, -0.6, 2.6, -0.3)); t.position.set(p[0], 0, p[1]); scene.add(t); addCollider(p[0] - 0.3, p[1] - 0.3, p[0] + 0.3, p[1] + 0.3); });
    const bench = new THREE.Group(); bench.add(box(1.8, 0.08, 0.5, 0x6e4b36, 0, 0.45, 0, 0.03)); bench.add(box(1.8, 0.4, 0.08, 0x6e4b36, 0, 0.75, -0.22, 0.03)); [[-0.75], [0.75]].forEach(q => { bench.add(box(0.08, 0.45, 0.5, 0x23222e, q[0], 0.22, 0, 0.02)); }); bench.position.set(12, 0, -29.5); scene.add(bench); addCollider(11, -29.8, 13, -29.2); props.parkBench = bench;
    const flowers = (x, z) => { for (let i = 0; i < 7; i++) { const f = sphere(0.09, [0xff5f7a, 0xf2c14e, 0xdfe3ee, 0xe07a5f][i % 4], x + (Math.random() - .5) * 1.4, 0.3 + Math.random() * 0.1, z + (Math.random() - .5) * 0.6); scene.add(f); scene.add(cyl(0.015, 0.015, 0.3, 0x3f8f5a, f.position.x, 0.15, f.position.z)); } }; flowers(10, -27.2); flowers(18, -27.2); flowers(6.5, -32.5);
    const gardenSign = textSprite("Garden", { size: 44, scale: 0.6 }); gardenSign.position.set(13, 2.6, -26.5); scene.add(gardenSign);
    const fence = (x1, x2, z) => { for (let x = x1; x <= x2; x += 0.6) scene.add(cyl(0.03, 0.03, 0.8, 0xdfe3ee, x, 0.4, z)); const r = box(x2 - x1, 0.05, 0.05, 0xdfe3ee, (x1 + x2) / 2, 0.6, z, 0.01); scene.add(r); }; fence(4.2, 10.4, -26.2); fence(13.6, 21.8, -26.2); scene.add(box(0.05, 0.8, 9.6, 0xdfe3ee, 22, 0.4, -31, 0.01)); addCollider(4, -26.4, 10.6, -26); addCollider(13.4, -26.4, 22, -26); addCollider(21.8, -36, 22.2, -26);
    // pet market — placeholder shell
    const mk = new THREE.Group(); mk.add(box(10, 5, 8, 0x4a3d33, 0, 2.5, 0, 0.2)); mk.add(box(10.4, 0.4, 8.4, 0x6e4b36, 0, 5.2, 0, 0.1)); mk.add(box(6, 0.3, 1.6, 0xe07a5f, 0, 3.2, 4.4, 0.1)); for (let i = 0; i < 3; i++) mk.add(box(2, 1.6, 0.1, 0x1a1420, -3 + i * 3, 1.6, 4.02, 0.05)); mk.position.set(-29, 0, -31); scene.add(mk); addCollider(-34, -35, -24, -27);
    const mkSign = textSprite("Pet Market — opening soon", { size: 40, bg: "rgba(40,36,20,0.96)", scale: 0.9 }); mkSign.position.set(-29, 4.2, -26.5); scene.add(mkSign);
    // bus stop on the clinic side
    const bs = new THREE.Group(); bs.add(cyl(0.05, 0.05, 2.6, 0x6b6f8f, -1.2, 1.3, 0)); bs.add(cyl(0.05, 0.05, 2.6, 0x6b6f8f, 1.2, 1.3, 0)); bs.add(box(3, 0.1, 1.4, 0x2a2f4a, 0, 2.6, -0.4, 0.04)); const glass = new THREE.Mesh(roundedBoxGeo(2.6, 1.8, 0.05, 0.02), new THREE.MeshStandardMaterial({ color: 0x9fc5ea, transparent: true, opacity: 0.3 })); glass.position.set(0, 1.5, -1.05); bs.add(glass); bs.add(box(2.4, 0.08, 0.4, 0x6e4b36, 0, 0.5, -0.6, 0.03)); bs.add(box(0.6, 0.9, 0.08, 0xf2c14e, 1.0, 2.0, 0.6, 0.04)); bs.position.set(24, 0, -14.5); scene.add(bs); addCollider(22.6, -15.8, 25.4, -13.9); props.busStop = bs;
    // map board near the entrance
    const mb = new THREE.Group(); mb.add(cyl(0.04, 0.04, 1.6, 0x6b6f8f, -0.5, 0.8, 0)); mb.add(cyl(0.04, 0.04, 1.6, 0x6b6f8f, 0.5, 0.8, 0)); mb.add(box(1.4, 1.0, 0.08, 0x2a2f4a, 0, 1.6, 0, 0.05)); mb.add(box(1.2, 0.8, 0.09, 0x121630, 0, 1.6, 0.01, 0.04)); [[0, 0.1, 0.5, 0.25, 0xf2c14e], [-0.35, -0.2, 0.25, 0.18, 0x7c6fcf], [0.35, -0.2, 0.25, 0.18, 0x3f8f5a]].forEach(r => mb.add(box(r[2], r[3], 0.1, r[4], r[0], 1.6 + r[1], 0.02, 0.02))); mb.add(sphere(0.04, 0x7ef29a, 0, 1.72, 0.06)); mb.position.set(3.5, 0, -13.3); scene.add(mb); addCollider(2.8, -13.6, 4.2, -13); props.mapBoard = mb;
  }
  function setLocked(key, locked) { lockedRooms[key] = locked; lockedMeshes[key].forEach(m => { m.visible = m.isSprite ? locked : !locked; }); if (themeMats.floors[key]) themeMats.floors[key].color.set(locked ? 0x555555 : 0xffffff); }

  /* ---------- characters ---------- */
  /* ---------- humans v3: two-joint limbs, soft face, blinking eyes, seeded hair ---------- */
  function seeded(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hashCfg(cfg) { const str = [cfg.hair, cfg.skin, cfg.hairstyle, cfg.shirt].join("|"); let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shadeC(color, f) { const r = Math.min(255, ((color >> 16) & 255) * f), g = Math.min(255, ((color >> 8) & 255) * f), b = Math.min(255, (color & 255) * f); return (r << 16) | (g << 8) | b; }
  function limb(len, r0, r1, m) { const g = new THREE.Group(); const c = cyl(r0, r1, len, 0, 0, -len / 2, 0, m); g.add(c); g.add(sphere(r0 * 0.96, 0, 0, 0, 0, m)); return g; }
  function makeHuman(cfg) {
    const rnd = seeded(cfg.seed || hashCfg(cfg)); const g = new THREE.Group(); const P = {};
    const skinC = cfg.skin, skin = mat(skinC, { roughness: 0.7 }), shirtM = mat(cfg.shirt), pantsM = mat(cfg.pants), shoeM = mat(cfg.shoes || 0x23222e, { roughness: 0.5 }); P.shoeMat = shoeM; P.shirtMat = shirtM;
    const sleeveM = mat(cfg.shirt); P.sleeveMat = sleeveM;
    // hips (bobs while walking) → legs; upper body pivots at the waist so it can lean
    const hips = new THREE.Group(); hips.position.y = 0.92; g.add(hips); P.hips = hips;
    hips.add(box(0.44, 0.16, 0.27, 0, 0, 0.0, 0, 0.08, pantsM));
    ["l", "r"].forEach((side, i) => {
      const sx = i ? 0.115 : -0.115; const thigh = limb(0.42, 0.1, 0.085, pantsM); thigh.position.set(sx, -0.03, 0); hips.add(thigh);
      const knee = limb(0.41, 0.083, 0.068, pantsM); knee.position.y = -0.42; thigh.add(knee);
      const foot = new THREE.Group(); foot.position.y = -0.41; knee.add(foot); const shoe = sphere(0.085, 0, 0, -0.035, 0.06, shoeM); shoe.scale.set(1, 0.62, 1.55); foot.add(shoe); foot.add(box(0.15, 0.03, 0.26, 0xdfe3ee, 0, -0.07, 0.06, 0.012));
      P[side + "Leg"] = thigh; P[side + "Knee"] = knee; P[side + "Shoe"] = shoe;
    });
    const upper = new THREE.Group(); upper.position.y = 0.92; g.add(upper); P.upper = upper;
    const chest = box(0.48, 0.6, 0.29, 0, 0, 0.33, 0, 0.14, shirtM); upper.add(chest); P.torso = chest;
    P.belt = box(0.46, 0.06, 0.29, 0x23222e, 0, 0.04, 0, 0.03); upper.add(P.belt);
    // V-neck of the scrub top
    const vneck = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 3), skin); vneck.position.set(0, 0.57, 0.135); vneck.rotation.x = Math.PI; vneck.scale.z = 0.25; upper.add(vneck);
    ["l", "r"].forEach((side, i) => {
      const sx = i ? 0.285 : -0.285; const shoulder = limb(0.29, 0.074, 0.064, sleeveM); shoulder.position.set(sx, 0.54, 0); upper.add(shoulder);
      const elbow = limb(0.26, 0.064, 0.055, skin); elbow.position.y = -0.29; shoulder.add(elbow);
      const handM = skin.clone(); const hand = sphere(0.068, 0, 0, -0.29, 0.01, handM); hand.scale.set(0.9, 1.1, 0.75); elbow.add(hand); const thumb = sphere(0.025, 0, (i ? -1 : 1) * 0.05, -0.27, 0.035, handM); elbow.add(thumb);
      P[side + "Arm"] = shoulder; P[side + "Elbow"] = elbow; P[side + "Hand"] = hand;
    });
    // head
    const headG = new THREE.Group(); headG.position.set(0, 0.92, 0); upper.add(headG); P.head = headG;
    headG.add(cyl(0.065, 0.075, 0.16, 0, 0, -0.26, 0, skin));
    const skull = sphere(0.255, 0, 0, 0, 0, skin); skull.scale.set(1, 1.03, 0.97); headG.add(skull);
    const jaw = sphere(0.2, 0, 0, -0.085, 0.035, skin); jaw.scale.set(1.02, 0.78, 0.95); headG.add(jaw); // softer, rounder lower face
    for (const sx of [-1, 1]) { const ear = sphere(0.055, 0, sx * 0.25, -0.005, -0.01, skin); ear.scale.set(0.55, 1, 0.8); headG.add(ear); }
    const nose = sphere(0.03, 0, 0, -0.035, 0.25, mat(shadeC(skinC, 0.9), { roughness: 0.7 })); nose.scale.set(1, 0.85, 0.9); headG.add(nose);
    const blushM = new THREE.MeshBasicMaterial({ color: 0xff8f9f, transparent: true, opacity: 0.22, depthWrite: false });
    for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.045, 18), blushM); b.position.set(sx * 0.135, -0.065, 0.2); b.rotation.y = sx * 0.55; headG.add(b); }
    // eyes: white + brown iris + pupil + catch-light; each eye scales vertically to blink
    P.eyes = []; const irisC = cfg.iris || [0x4a2c1a, 0x3a2414, 0x5a3a20, 0x2d4a3a][Math.floor(rnd() * 4)];
    for (const sx of [-1, 1]) {
      const eg = new THREE.Group(); eg.position.set(sx * 0.088, 0.025, 0.215); headG.add(eg);
      const white = sphere(0.04, 0xffffff, 0, 0, 0, mat(0xfbfbff, { roughness: 0.25 })); white.scale.set(1, 1.15, 0.55); eg.add(white);
      const iris = new THREE.Group(); iris.position.z = 0.018; eg.add(iris);
      const ir = sphere(0.026, 0, 0, 0, 0, mat(irisC, { roughness: 0.3 })); ir.scale.set(1, 1.1, 0.5); iris.add(ir); const pu = sphere(0.014, 0, 0, 0, 0.008, mat(0x0d0a12)); iris.add(pu); const hl = sphere(0.007, 0xffffff, 0.009, 0.011, 0.016, new THREE.MeshBasicMaterial({ color: 0xffffff })); iris.add(hl);
      const lid = sphere(0.043, 0, 0, 0.018, 0.002, skin); lid.scale.set(1.05, 0.55, 0.62); eg.add(lid); // upper lid, slightly hooded
      P.eyes.push({ g: eg, iris, lid });
    }
    const browM = mat(shadeC(cfg.hair, 1.1));
    P.brows = []; for (const sx of [-1, 1]) { const br = box(0.085, 0.022, 0.03, 0, sx * 0.09, 0.105, 0.225, 0.011, browM); br.rotation.z = sx * -0.12; headG.add(br); P.brows.push(br); }
    const mouthM = mat(0x7a3540); const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.011, 8, 16, Math.PI), mouthM); mouth.position.set(0, -0.11, 0.222); mouth.rotation.z = Math.PI; headG.add(mouth); P.mouth = mouth;
    // beard / stubble along the jaw + moustache
    if (cfg.beard && cfg.beard !== "none") { const bm = mat(cfg.hair, { roughness: 1 }); const full = cfg.beard === "full"; const jawline = new THREE.Mesh(new THREE.TorusGeometry(0.17, full ? 0.05 : cfg.beard === "stubble" ? 0.016 : 0.026, 10, 26, Math.PI), bm); jawline.rotation.z = Math.PI; jawline.position.set(0, -0.06, 0.1); jawline.scale.set(1.05, 0.9, 1.05); headG.add(jawline); const chin = sphere(full ? 0.075 : 0.05, 0, 0, -0.19, 0.17, bm); chin.scale.set(1.35, 0.65, 0.7); headG.add(chin); const mous = box(0.11, 0.024, 0.03, 0, 0, -0.074, 0.238, 0.012, bm); headG.add(mous); P.beard = [jawline, chin, mous]; } else P.beard = [];
    // hair (seeded → same silhouette every time)
    const hairM = mat(cfg.hair, { roughness: 0.85 }); P.hair = []; const style = cfg.hairstyle || (cfg.curly ? "curly" : "short"); const add = (m) => { headG.add(m); P.hair.push(m); return m; };
    if (style === "curly" || style === "afro") {
      const big = style === "afro"; const base = add(sphere(big ? 0.29 : 0.262, 0, 0, big ? 0.07 : 0.045, -0.03, hairM)); base.scale.set(1, big ? 0.95 : 0.82, 1);
      const N = big ? 58 : 46, R = big ? 0.29 : 0.255, golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 1.15; const rr = Math.sqrt(Math.max(0, 1 - y * y)); const th = i * golden; const x = Math.cos(th) * rr, z = Math.sin(th) * rr; if (z > 0.35 && y < 0.5) continue; if (y < -0.1 && z > -0.3) continue; const s = (big ? 0.07 : 0.062) + rnd() * 0.03; add(sphere(s, 0, x * R, y * R * 0.95 + 0.07, z * R - 0.02, hairM)); }
      for (let i = 0; i < 6; i++) add(sphere(0.055 + rnd() * 0.015, 0, -0.13 + i * 0.052, 0.19 + Math.sin(i * 1.7) * 0.015, 0.17, hairM)); // curly fringe
    } else if (style === "buzz") { const b = add(sphere(0.262, 0, 0, 0.04, -0.02, mat(cfg.hair, { roughness: 1 }))); b.scale.set(1, 0.86, 1); }
    else if (style === "long") { const t = add(sphere(0.268, 0, 0, 0.05, -0.03, hairM)); t.scale.set(1.02, 0.88, 1.04); add(box(0.46, 0.52, 0.2, 0, 0, -0.24, -0.15, 0.1, hairM)); for (const sx of [-1, 1]) add(box(0.09, 0.42, 0.14, 0, sx * 0.24, -0.18, 0.02, 0.05, hairM)); const fr = add(sphere(0.12, 0, -0.06, 0.18, 0.17, hairM)); fr.scale.set(1.8, 0.45, 0.6); }
    else if (style === "bun") { const t = add(sphere(0.264, 0, 0, 0.045, -0.025, hairM)); t.scale.set(1, 0.86, 1); add(sphere(0.105, 0, 0, 0.23, -0.17, hairM)); }
    else { const t = add(sphere(0.264, 0, 0, 0.05, -0.03, hairM)); t.scale.set(1.01, 0.82, 1.02); const fr = add(sphere(0.12, 0, 0.06, 0.17, 0.17, hairM)); fr.scale.set(1.7, 0.42, 0.62); fr.rotation.z = -0.2; }
    // glasses
    if (cfg.glasses && cfg.glassesStyle !== "none") { const gm = mat(cfg.frames || 0x2d2438, { roughness: 0.35, metalness: 0.2 }); P.frameMat = gm; const sq = cfg.glassesStyle === "square"; const lens = new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.18, roughness: 0.05 });
      for (const sx of [-1, 1]) { if (sq) { const f = new THREE.Mesh(roundedBoxGeo(0.15, 0.11, 0.018, 0.03), gm); f.position.set(sx * 0.09, 0.025, 0.252); headG.add(f); const l = new THREE.Mesh(roundedBoxGeo(0.125, 0.085, 0.02, 0.02), lens); l.position.set(sx * 0.09, 0.025, 0.253); headG.add(l); } else { const r = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.011, 8, 24), gm); r.position.set(sx * 0.09, 0.025, 0.252); headG.add(r); const l = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), lens); l.position.set(sx * 0.09, 0.025, 0.254); headG.add(l); } const arm = box(0.012, 0.012, 0.24, 0, sx * 0.16, 0.035, 0.13, 0.004, gm); headG.add(arm); }
      headG.add(box(0.045, 0.012, 0.012, 0, 0, 0.035, 0.255, 0.004, gm)); }
    // outfit layers (toggled by setHumanOutfit)
    P.cap = sphere(0.275, 0, 0, 0.06, -0.015, mat(cfg.capColor || 0x2f4f8f)); P.cap.scale.set(1, 0.74, 1); P.cap.visible = false; headG.add(P.cap); P.capMat = P.cap.material;
    P.mask = box(0.22, 0.13, 0.06, 0x5f8fd6, 0, -0.085, 0.215, 0.05); P.mask.visible = false; headG.add(P.mask);
    P.gown = new THREE.Group(); const gownM = mat(0x3f6f6a); P.gown.add(box(0.54, 0.66, 0.34, 0, 0, 0.33, 0, 0.16, gownM)); P.gown.add(box(0.56, 0.45, 0.34, 0, 0, -0.18, 0, 0.14, gownM)); P.gown.visible = false; upper.add(P.gown); P.gownMat = gownM;
    P.coat = new THREE.Group(); const coatC = cfg.coat || 0xe9e9f2, coatM = mat(coatC), coatD = mat(shadeC(coatC, 0.88)); P.coat.add(box(0.51, 0.62, 0.31, 0, 0, 0.33, 0, 0.13, coatM));
    for (const sx of [-1, 1]) { const panel = box(0.245, 0.5, 0.05, 0, sx * 0.128, -0.2, 0.125, 0.02, coatM); panel.rotation.z = sx * -0.03; P.coat.add(panel); const back = box(0.24, 0.5, 0.05, 0, sx * 0.125, -0.2, -0.125, 0.02, coatM); P.coat.add(back); const side = box(0.05, 0.5, 0.25, 0, sx * 0.25, -0.2, 0, 0.02, coatM); P.coat.add(side); const lap = box(0.07, 0.3, 0.02, 0, sx * 0.07, 0.47, 0.158, 0.01, coatD); lap.rotation.z = sx * 0.42; P.coat.add(lap); const pocket = box(0.12, 0.11, 0.012, 0, sx * 0.13, -0.17, 0.152, 0.01, coatD); P.coat.add(pocket); }
    P.coat.add(box(0.1, 0.04, 0.012, 0xf2c14e, 0.15, 0.42, 0.158, 0.008)); for (let b = 0; b < 3; b++) P.coat.add(sphere(0.012, 0xdfe3ee, 0.04, 0.3 - b * 0.17, 0.158)); P.coat.visible = false; upper.add(P.coat); P.coatMat = coatM;
    if (cfg.steth) { const sm = mat(0x23222e, { roughness: 0.4 }); const s = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.013, 8, 24, Math.PI), sm); s.position.set(0, 0.58, 0.1); s.rotation.x = 0.35; s.rotation.z = Math.PI; upper.add(s); const tube = cyl(0.011, 0.011, 0.22, 0, 0.15, 0.43, 0.17, sm); upper.add(tube); const disc = cyl(0.035, 0.035, 0.018, 0xf2c14e, 0.15, 0.31, 0.18); disc.rotation.x = Math.PI / 2; upper.add(disc); P.stethDisc = disc;
      const held = cyl(0.035, 0.035, 0.018, 0xf2c14e, 0, -0.33, 0.04); held.rotation.x = Math.PI / 2; held.visible = false; P.rElbow.add(held); P.stethHeld = held; }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { group: g, parts: P, phase: rnd() * 6, skinColor: skinC, hairColor: cfg.hair, shoeColor: cfg.shoes || 0x23222e, cfg, move: 0, blinkT: 1 + rnd() * 3, blinkK: 0, sacT: 1, eyeX: 0, eyeY: 0, pose: null };
  }
  let currentOutfit = "clinic";
  function setHumanOutfit(rig, outfit) {
    if (rig === player) currentOutfit = outfit; const P = rig.parts; P.coat.visible = outfit === "clinic"; P.cap.visible = outfit === "scrubs" || outfit === "surgical"; P.mask.visible = outfit === "scrubs" || outfit === "surgical"; P.gown.visible = outfit === "surgical";
    const gloves = outfit === "surgical"; P.lHand.material.color.set(gloves ? 0xbfd3ff : rig.skinColor); P.rHand.material.color.set(gloves ? 0xbfd3ff : rig.skinColor);
    P.sleeveMat.color.copy(outfit === "clinic" ? P.coatMat.color : outfit === "surgical" ? P.gownMat.color : P.shirtMat.color);
    const covers = outfit !== "clinic"; P.lShoe.material.color.set(covers ? 0x5f8fd6 : (rig.shoeColor || 0x23222e)); P.rShoe.material.color.set(covers ? 0x5f8fd6 : (rig.shoeColor || 0x23222e));
    P.hair.forEach(h => h.visible = !P.cap.visible); P.beard.forEach(b => b.visible = !P.mask.visible); P.belt.visible = outfit === "scrubs";
  }
  function approach(cur, target, k) { return cur + (target - cur) * k; }
  function animateHuman(rig, dt, moving, speedFactor = 1) {
    const P = rig.parts; const k = Math.min(1, dt * 8); rig.move = approach(rig.move, moving ? 1 : 0, Math.min(1, dt * 7)); const m = rig.move;
    rig.phase += dt * (1.6 + 7.4 * m) * (moving ? speedFactor : 1);
    // blink + small eye saccades, independent of pose
    rig.blinkT -= dt; if (rig.blinkT <= 0) { rig.blinkK = 1; rig.blinkT = 2.2 + Math.random() * 3.5; } rig.blinkK = Math.max(0, rig.blinkK - dt * 9);
    rig.sacT -= dt; if (rig.sacT <= 0) { rig.sacT = 0.8 + Math.random() * 2.2; rig.eyeX = (Math.random() - 0.5) * 0.016; rig.eyeY = (Math.random() - 0.5) * 0.008; }
    const lidClose = Math.sin(Math.min(1, rig.blinkK) * Math.PI); P.eyes.forEach(e => { e.g.scale.y = 1 - lidClose * 0.85; e.iris.position.x = approach(e.iris.position.x, rig.eyeX, k); e.iris.position.y = approach(e.iris.position.y, rig.eyeY + (rig.pose === "exam" ? -0.008 : 0), k); e.lid.position.y = 0.018 - lidClose * 0.01; });
    const breath = Math.sin(rig.phase * (moving ? 0.5 : 1.0)) * 0.012;
    const set = (o, x, y, z) => { if (x !== undefined) o.rotation.x = approach(o.rotation.x, x, k); if (y !== undefined) o.rotation.y = approach(o.rotation.y, y, k); if (z !== undefined) o.rotation.z = approach(o.rotation.z, z, k); };
    if ((rig.sitting || rig.pose === "sit") && !moving) {
      set(P.lLeg, -1.5, 0, -0.05); set(P.rLeg, -1.5, 0, 0.05); set(P.lKnee, 1.45); set(P.rKnee, 1.45); set(P.lArm, -0.5, 0, -0.12); set(P.rArm, -0.5, 0, 0.12); set(P.lElbow, -0.9); set(P.rElbow, -0.9); set(P.upper, -0.05, 0, 0);
      rig.group.position.y = approach(rig.group.position.y, -0.43, k); P.hips.position.y = 0.92; P.upper.position.y = 0.92; set(P.head, 0.05, Math.sin(rig.phase * 0.35) * 0.3, 0); return;
    }
    rig.group.position.y = approach(rig.group.position.y, 0, k);
    const s = Math.sin(rig.phase), c = Math.cos(rig.phase);
    // legs: thigh swings, knee bends during the forward swing, foot plants in stance
    const tl = -s * 0.5 * m, tr = s * 0.5 * m; set(P.lLeg, tl, 0, 0); set(P.rLeg, tr, 0, 0);
    set(P.lKnee, m * (0.08 + 0.85 * Math.max(0, c))); set(P.rKnee, m * (0.08 + 0.85 * Math.max(0, -c)));
    const bob = Math.abs(c) * 0.035 * m; P.hips.position.y = 0.92 + bob - 0.012 * m; P.upper.position.y = P.hips.position.y + breath * (1 - m) * 0.4;
    // pose for the upper body
    let lean = 0.04 * m, twist = s * 0.07 * m, la = s * 0.45 * m, ra = -s * 0.45 * m, le = -(0.18 + 0.3 * m), re = -(0.18 + 0.3 * m), headX = 0, headY = moving ? -twist * 0.6 : Math.sin(rig.phase * 0.33) * 0.12, laz = -0.07, raz = 0.07;
    if (rig.pose === "exam" && !moving) { lean = 0.42; twist = 0; ra = -0.95; re = -0.75; la = -0.55; le = -0.9; headX = 0.42; headY = 0; laz = -0.15; raz = 0.05; }
    if (rig.pose === "reach" && !moving) { lean = 0.16; twist = 0; ra = -1.25; re = -0.3; la = -0.2; le = -0.5; headX = 0.18; headY = 0; }
    if (rig.pose === "think" && !moving) { lean = 0.02; ra = -0.6; re = -2.1; la = -0.35; le = -1.5; headX = 0.1; headY = 0.15; raz = 0.25; }
    set(P.upper, lean, twist, 0); set(P.lArm, la, 0, laz); set(P.rArm, ra, 0, raz); set(P.lElbow, le); set(P.rElbow, re); set(P.head, headX, headY, 0);
    if (P.stethHeld) { const ex = rig.pose === "exam" && !moving; P.stethHeld.visible = ex; P.stethDisc.visible = !ex; }
    P.torso.scale.y = 1 + breath * 0.6;
  }

  /* ---------- pets (detailed) ---------- */
  function shade(color, f) { const r = Math.min(255, Math.max(0, ((color >> 16) & 255) * f)), g = Math.min(255, Math.max(0, ((color >> 8) & 255) * f)), b = Math.min(255, Math.max(0, (color & 255) * f)); return (r << 16) | (g << 8) | b; }
  function eye(headG, x, y, z, r, lookZ = 1) { const w = sphere(r, 0xffffff, x, y, z, mat(0xffffff, { roughness: 0.3 })); headG.add(w); const pupil = sphere(r * 0.62, 0x1a1420, x, y, z + r * 0.55 * lookZ, mat(0x1a1420, { roughness: 0.2 })); headG.add(pupil); const hl = sphere(r * 0.22, 0xffffff, x + r * 0.25, y + r * 0.3, z + r * 0.9 * lookZ); headG.add(hl); return [w, pupil]; }
  function tailSeg(parent, segs, len, r0, m, curve) { let node = parent; for (let i = 0; i < segs; i++) { const g = new THREE.Group(); const c = cyl(r0 * (1 - i / (segs + 1)), r0 * (1 - (i + 1) / (segs + 1)), len, 0, 0, len / 2, 0, m); g.add(c); g.rotation.x = curve; node.add(g); g.position.y = i === 0 ? 0 : len; node = g; } return node; }
  function makePet(species, color) {
    const g = new THREE.Group(); const P = { species }; const m = mat(color), belly = mat(shade(color, 1.25)), dark = mat(0x2d2438), pink = mat(0xf2a0b0), nose = mat(0x3a2a2e, { roughness: 0.3 });
    const seg = 24;
    const sph = (r, x, y, z, mm) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, 16), mm || m); o.position.set(x, y, z); o.castShadow = true; return o; };
    if (species === "dog") {
      const body = sph(0.3, 0, 0.5, 0); body.scale.set(1.0, 0.85, 1.55); g.add(body); P.body = body;
      const chest = sph(0.27, 0, 0.5, 0.3); chest.scale.set(1.0, 0.95, 1); g.add(chest); const bl = sph(0.22, 0, 0.42, 0.1, belly); bl.scale.set(0.9, 0.6, 1.6); g.add(bl);
      const neck = sph(0.17, 0, 0.66, 0.42); neck.scale.set(1, 1, 1.2); g.add(neck);
      const headG = new THREE.Group(); headG.position.set(0, 0.8, 0.56); P.head = headG;
      const skull = sph(0.21, 0, 0, 0); skull.scale.set(1, 0.95, 1.05); headG.add(skull);
      const muzzle = sph(0.13, 0, -0.06, 0.2); muzzle.scale.set(1.1, 0.8, 1.3); headG.add(muzzle); const chin = sph(0.09, 0, -0.14, 0.22, belly); chin.scale.set(1, 0.6, 1.1); headG.add(chin);
      const ns = sph(0.05, 0, -0.01, 0.36, nose); ns.scale.set(1.2, 0.9, 0.8); headG.add(ns);
      eye(headG, -0.09, 0.07, 0.16, 0.045); eye(headG, 0.09, 0.07, 0.16, 0.045);
      const brow1 = sph(0.035, -0.1, 0.13, 0.15, mat(shade(color, 0.8))); brow1.scale.set(1.6, 0.6, 1); const brow2 = brow1.clone(); brow2.position.x = 0.1; headG.add(brow1, brow2);
      const floppy = Math.random() < 0.6; P.ears = [];
      for (const sx of [-1, 1]) { const e = sph(0.08, sx * 0.18, floppy ? -0.02 : 0.14, -0.02, mat(shade(color, 0.85))); if (floppy) { e.scale.set(0.5, 1.7, 0.8); e.rotation.z = sx * 0.25; } else { e.scale.set(0.55, 1.3, 0.6); e.rotation.z = sx * -0.15; const inner = sph(0.05, sx * 0.18, 0.15, 0.0, pink); inner.scale.set(0.4, 0.9, 0.4); headG.add(inner); } headG.add(e); P.ears.push(e); }
      const tongue = sph(0.035, 0, -0.14, 0.31, pink); tongue.scale.set(1, 0.4, 1.2); headG.add(tongue);
      g.add(headG);
      P.legs = []; [[-0.15, 0.3], [0.15, 0.3], [-0.14, -0.3], [0.14, -0.3]].forEach(pp => { const piv = new THREE.Group(); piv.position.set(pp[0], 0.42, pp[1]); piv.add(cyl(0.06, 0.055, 0.4, 0, 0, -0.2, 0, m)); const paw = sph(0.07, 0, -0.42, 0.03, mat(shade(color, 0.9))); paw.scale.set(1.1, 0.6, 1.3); piv.add(paw); g.add(piv); P.legs.push(piv); });
      const tail = new THREE.Group(); tail.position.set(0, 0.66, -0.45); tail.rotation.x = -0.9; tailSeg(tail, 3, 0.14, 0.035, m, -0.35); g.add(tail); P.tail = tail;
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 10, 28), mat(pick([0xff5f7a, 0x5f8fd6, 0xf2c14e, 0x4fb3a9]))); collar.position.set(0, 0.68, 0.44); collar.rotation.x = Math.PI / 2 + 0.2; g.add(collar); const tag = cyl(0.03, 0.03, 0.01, 0xf2c14e, 0, 0.52, 0.56); tag.rotation.x = Math.PI / 2; g.add(tag);
      if (Math.random() < 0.5) for (let i = 0; i < 3; i++) { const sp = sph(0.07 + Math.random() * 0.05, (Math.random() - 0.5) * 0.3, 0.6 + Math.random() * 0.1, (Math.random() - 0.5) * 0.6, mat(shade(color, 0.7))); sp.scale.set(1.2, 0.5, 1.2); g.add(sp); }
    } else if (species === "cat" || species === "rabbit") {
      const rab = species === "rabbit";
      const body = sph(rab ? 0.24 : 0.2, 0, rab ? 0.3 : 0.32, 0); body.scale.set(1.0, rab ? 0.95 : 0.9, rab ? 1.25 : 1.6); g.add(body); P.body = body;
      const bl = sph(rab ? 0.18 : 0.15, 0, rab ? 0.24 : 0.26, 0.05, belly); bl.scale.set(0.9, 0.6, rab ? 1.2 : 1.6); g.add(bl);
      const headG = new THREE.Group(); headG.position.set(0, rab ? 0.52 : 0.52, rab ? 0.26 : 0.34); P.head = headG;
      const skull = sph(rab ? 0.16 : 0.165, 0, 0, 0); skull.scale.set(rab ? 1.05 : 1.1, rab ? 1 : 0.92, 1); headG.add(skull);
      const cheek1 = sph(0.07, -0.07, -0.06, 0.1, belly); const cheek2 = cheek1.clone(); cheek2.position.x = 0.07; headG.add(cheek1, cheek2);
      const ns = sph(0.025, 0, -0.03, rab ? 0.15 : 0.16, rab ? pink : nose); ns.scale.set(1.2, 0.8, 0.7); headG.add(ns);
      eye(headG, -0.065, 0.04, 0.12, 0.04); eye(headG, 0.065, 0.04, 0.12, 0.04);
      if (!rab) { for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const w = cyl(0.003, 0.003, 0.22, 0xdfe3ee, sx * 0.15, -0.045 + i * 0.012, 0.12); w.rotation.z = Math.PI / 2; w.rotation.y = sx * (0.15 + i * 0.12); headG.add(w); } }
      P.ears = [];
      for (const sx of [-1, 1]) { if (rab) { const e = sph(0.05, sx * 0.07, 0.27, -0.03, m); e.scale.set(0.7, 3.2, 0.5); e.rotation.z = sx * 0.18; const inner = sph(0.03, sx * 0.07, 0.27, 0.0, pink); inner.scale.set(0.6, 2.6, 0.4); inner.rotation.z = sx * 0.18; headG.add(e, inner); P.ears.push(e); } else { const e = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 12), m); e.position.set(sx * 0.1, 0.17, -0.01); e.rotation.z = sx * -0.25; const inner = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 10), pink); inner.position.set(sx * 0.1, 0.165, 0.015); inner.rotation.z = sx * -0.25; headG.add(e, inner); P.ears.push(e); } }
      g.add(headG);
      P.legs = []; [[-0.1, 0.22], [0.1, 0.22], [-0.11, -0.22], [0.11, -0.22]].forEach((pp, i) => { const piv = new THREE.Group(); piv.position.set(pp[0] * (rab ? 0.9 : 1), rab ? 0.26 : 0.28, pp[1] * (rab ? 0.8 : 1)); const l = cyl(0.045, 0.04, rab && i >= 2 ? 0.2 : 0.28, 0, 0, rab && i >= 2 ? -0.1 : -0.14, 0, m); piv.add(l); const paw = sph(rab && i >= 2 ? 0.07 : 0.05, 0, rab && i >= 2 ? -0.2 : -0.28, rab && i >= 2 ? 0.06 : 0.02, mat(shade(color, 0.9))); paw.scale.set(1, 0.6, rab && i >= 2 ? 1.8 : 1.2); piv.add(paw); g.add(piv); P.legs.push(piv); });
      const tail = new THREE.Group(); if (rab) { tail.position.set(0, 0.38, -0.3); tail.add(sph(0.07, 0, 0, -0.03, belly)); } else { tail.position.set(0, 0.42, -0.32); tail.rotation.x = -0.5; tailSeg(tail, 4, 0.12, 0.03, m, -0.3); } g.add(tail); P.tail = tail;
      if (!rab && Math.random() < 0.5) for (let i = 0; i < 4; i++) { const st = sph(0.04, (Math.random() - 0.5) * 0.25, 0.36 + Math.random() * 0.08, (Math.random() - 0.5) * 0.5, mat(shade(color, 0.72))); st.scale.set(2.2, 0.5, 0.9); g.add(st); }
    } else if (species === "tortoise") {
      const shellM = mat(0x55683a), scute = mat(0x7d8f50, { roughness: 0.6 }), skin = mat(0x8a9b5a);
      const shell = sph(0.3, 0, 0.22, 0, shellM); shell.scale.set(1.2, 0.75, 1); g.add(shell); P.body = shell;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.035, 10, 32), mat(0x44552f)); rim.position.y = 0.16; rim.rotation.x = Math.PI / 2; rim.scale.set(1.2, 1, 1); g.add(rim);
      const top = sph(0.09, 0, 0.42, 0, scute); top.scale.set(1.3, 0.35, 1.1); g.add(top); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const sc = sph(0.085, Math.cos(a) * 0.22, 0.34, Math.sin(a) * 0.18, scute); sc.scale.set(1, 0.35, 1); sc.lookAt(0, 0.9, 0); g.add(sc); }
      const plast = sph(0.26, 0, 0.1, 0, mat(0xc9b47a)); plast.scale.set(1.15, 0.25, 0.95); g.add(plast);
      const headG = new THREE.Group(); headG.position.set(0, 0.2, 0.34); headG.add(cyl(0.06, 0.07, 0.14, 0, 0, 0, 0.0, skin).rotateX(Math.PI / 2)); const hd = sph(0.085, 0, 0.02, 0.12, skin); hd.scale.set(1, 0.9, 1.2); headG.add(hd); eye(headG, -0.05, 0.05, 0.16, 0.025); eye(headG, 0.05, 0.05, 0.16, 0.025); headG.add(sph(0.012, 0, 0.0, 0.22, dark)); g.add(headG); P.head = headG;
      P.legs = []; [[-0.26, 0.2], [0.26, 0.2], [-0.26, -0.2], [0.26, -0.2]].forEach(pp => { const piv = new THREE.Group(); piv.position.set(pp[0], 0.13, pp[1]); const l = cyl(0.055, 0.07, 0.15, 0, 0, -0.05, 0, skin); piv.add(l); for (let k = 0; k < 3; k++) piv.add(sph(0.012, -0.03 + k * 0.03, -0.12, 0.05, mat(0xe8e2c8))); g.add(piv); P.legs.push(piv); });
      P.tail = new THREE.Group(); P.tail.position.set(0, 0.14, -0.33); P.tail.add(new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 8), skin).rotateX(-Math.PI / 2)); g.add(P.tail);
    } else {
      const wing = mat(shade(color, 0.8)), beakM = mat(0xd9b24a, { roughness: 0.4 });
      const body = sph(0.12, 0, 0.26, 0); body.scale.set(0.95, 1.15, 1.35); g.add(body); P.body = body;
      const bl = sph(0.09, 0, 0.22, 0.04, belly); bl.scale.set(0.9, 1, 1.3); g.add(bl);
      const headG = new THREE.Group(); headG.position.set(0, 0.43, 0.1); P.head = headG; headG.add(sph(0.085, 0, 0, 0));
      const ub = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 12), beakM); ub.rotation.x = Math.PI / 2 + 0.3; ub.position.set(0, -0.005, 0.1); headG.add(ub); const lb = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.045, 12), mat(0xb08a30)); lb.rotation.x = Math.PI / 2 + 0.9; lb.position.set(0, -0.03, 0.085); headG.add(lb);
      const cere = sph(0.02, 0, 0.02, 0.085, mat(0x9fc5ea)); cere.scale.set(1.4, 0.8, 0.6); headG.add(cere);
      eye(headG, -0.045, 0.02, 0.06, 0.02); eye(headG, 0.045, 0.02, 0.06, 0.02);
      const cheek1 = sph(0.025, -0.055, -0.02, 0.05, mat(0xf2a35e)); const cheek2 = cheek1.clone(); cheek2.position.x = 0.055; headG.add(cheek1, cheek2);
      for (let i = 0; i < 4; i++) { const cr = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.11 - i * 0.015, 8), mat(0xfff3a0)); cr.position.set(0, 0.11 + i * 0.01, -0.01 - i * 0.025); cr.rotation.x = -0.4 - i * 0.25; headG.add(cr); }
      g.add(headG);
      P.wings = []; for (const sx of [-1, 1]) { const w = sph(0.07, sx * 0.1, 0.28, -0.02, wing); w.scale.set(0.35, 1, 1.7); w.rotation.z = sx * 0.1; g.add(w); P.wings.push(w); for (let k = 0; k < 3; k++) { const f = box(0.015, 0.012, 0.09, shade(color, 0.6), sx * 0.11, 0.2 - k * 0.01, -0.14 - k * 0.03, 0.005); g.add(f); } }
      const tail = new THREE.Group(); tail.position.set(0, 0.22, -0.16); for (let k = -1; k <= 1; k++) { const f = box(0.03, 0.01, 0.2, shade(color, 0.7), k * 0.025, 0, -0.1, 0.005); f.rotation.y = k * 0.15; tail.add(f); } tail.rotation.x = 0.35; g.add(tail); P.tail = tail;
      [-0.035, 0.035].forEach(x => { g.add(cyl(0.008, 0.008, 0.13, 0, x, 0.08, 0.02, mat(0xb08a30))); for (let t = -1; t <= 1; t++) g.add(box(0.012, 0.008, 0.06, 0xb08a30, x + t * 0.012, 0.004, 0.04, 0.004)); });
      P.legs = [];
      const cage = new THREE.Group(); const cageM = new THREE.MeshStandardMaterial({ color: 0xd9d4e8, transparent: true, opacity: 0.55 }); cage.add(cyl(0.3, 0.3, 0.03, 0, 0, 0.0, 0, mat(0x5f8fd6))); cage.add(cyl(0.3, 0.3, 0.03, 0, 0, 0.6, 0, mat(0x5f8fd6))); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; cage.add(cyl(0.008, 0.008, 0.6, 0, Math.cos(a) * 0.29, 0.3, Math.sin(a) * 0.29, cageM)); } const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 16), mat(0x5f8fd6)); handle.position.y = 0.68; cage.add(handle); cage.visible = false; g.add(cage); P.cage = cage;
    }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { group: g, parts: P, phase: Math.random() * 6, species };
  }
  function animatePet(rig, dt, moving, mood = "calm") {
    const P = rig.parts; rig.phase += dt * (moving ? 10 : 2.2) * (mood === "angry" ? 1.6 : 1); const s = Math.sin(rig.phase);
    if (P.legs && P.legs.length) P.legs.forEach((l, i) => l.rotation.x = moving ? s * 0.6 * (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1) : 0);
    if (P.body) { const base = rig.species === "bird" ? 1.15 : rig.species === "tortoise" ? 0.75 : rig.species === "dog" ? 0.85 : 0.9; P.body.scale.y = base + Math.sin(rig.phase * 0.6) * 0.025; }
    if (P.tail) { if (rig.species === "bird") P.tail.rotation.x = 0.35 + s * 0.1; else if (rig.species === "dog") P.tail.rotation.y = s * (mood === "angry" ? 0.3 : mood === "tense" ? 0.1 : 0.8); else P.tail.rotation.y = s * (mood === "angry" ? 1.0 : mood === "tense" ? 0.6 : 0.25); }
    if (P.wings) P.wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * (mood === "angry" ? 0.1 + Math.abs(s) * 0.9 : 0.1));
    if (P.ears) P.ears.forEach((e, i) => { if (rig.species === "cat") e.rotation.x = mood === "tense" || mood === "angry" ? -1.1 : 0; else if (rig.species === "rabbit") e.rotation.x = mood === "tense" ? -0.9 : Math.sin(rig.phase * 0.5 + i) * 0.1; else if (rig.species === "dog") e.rotation.x = mood === "tense" ? -0.5 : Math.sin(rig.phase * 0.7 + i) * 0.05; });
    if (P.head) { P.head.rotation.y = Math.sin(rig.phase * 0.4) * 0.25; P.head.rotation.x = mood === "angry" ? -0.2 : mood === "tense" ? 0.15 : mood === "sad" ? 0.35 : Math.sin(rig.phase * 0.3) * 0.08; }
    if (rig.sleeping) { rig.group.scale.y = 0.6; if (P.head) P.head.rotation.x = 0.5; } else rig.group.scale.y = 1;
  }

  /* ---------- NPC movement ---------- */
  function moveAlong(n, dt) {
    if (!n.path || !n.path.length) return false;
    const tgt = n.path[0], pos = n.rig.group.position; const dx = tgt[0] - pos.x, dz = tgt[1] - pos.z; const d = Math.hypot(dx, dz); const step = n.speed * dt;
    if (d < step) { pos.x = tgt[0]; pos.z = tgt[1]; n.path.shift(); if (!n.path.length && n.onArrive) { const cb = n.onArrive; n.onArrive = null; cb(); } }
    else { pos.x += dx / d * step; pos.z += dz / d * step; n.rig.group.rotation.y = lerpAngle(n.rig.group.rotation.y, Math.atan2(dx, dz), Math.min(1, dt * 10)); }
    return true;
  }
  function npcUpdate(dt) {
    for (const n of npcs) {
      const moving = moveAlong(n, dt);
      animateHuman(n.rig, dt, moving, 0.9);
      if (n.pet) {
        if (n.petFollow) {
          const pr = n.pet.group, pos = n.rig.group.position; const off = n.pet.species === "bird" ? [0.45, 0.0] : [0.55, 0.1]; const ang = n.rig.group.rotation.y;
          const tx = pos.x + Math.cos(ang) * off[0] - Math.sin(ang) * off[1], tz = pos.z - Math.sin(ang) * off[0] - Math.cos(ang) * off[1];
          pr.position.x += (tx - pr.position.x) * Math.min(1, dt * 6); pr.position.z += (tz - pr.position.z) * Math.min(1, dt * 6);
          if (n.pet.species === "bird") { pr.position.y = 0.55 + Math.sin(n.rig.phase) * 0.02; n.pet.parts.cage.visible = true; }
          pr.rotation.y = lerpAngle(pr.rotation.y, ang, Math.min(1, dt * 6));
        }
        animatePet(n.pet, dt, moving && n.petFollow, n.petMood);
      }
    }
    // clinic cat
    if (cat && catLeash && player) { const pp = player.group.position, cp = cat.rig.group.position, ry = player.group.rotation.y; const bx = pp.x - Math.sin(ry) * 1.1 + Math.cos(ry) * 0.5, bz = pp.z - Math.cos(ry) * 1.1 - Math.sin(ry) * 0.5; const d = Math.hypot(bx - cp.x, bz - cp.z); if (d > 7) { cp.x = bx; cp.z = bz; } cat.rig.sleeping = false; cat.path = d > 0.35 ? [[bx, bz]] : []; cat.speed = Math.max(cat.baseSpeed || 1.6, d * 2.2); cat.restT = 3;
      if (leash) { try { const hx = pp.x + Math.cos(ry) * 0.3, hz = pp.z - Math.sin(ry) * 0.3, hy = 0.85; const tx = cp.x, ty = 0.32, tz = cp.z; const L = Math.hypot(tx - hx, ty - hy, tz - hz); leash.visible = G.s.clinicPet.species !== "bird" && camMode !== "first"; leash.position.set((hx + tx) / 2, (hy + ty) / 2, (hz + tz) / 2); leash.scale.set(1, L, 1); leash.lookAt(tx, ty, tz); leash.rotateX(Math.PI / 2); } catch (e) { } } }
    if (waypoint && waypoint.visible) { waypointT += dt; waypoint.children[0].material.opacity = 0.35 + Math.sin(waypointT * 3) * 0.15; waypoint.rotation.y += dt; }
    if (cat) { const moving = moveAlong(cat, dt); animatePet(cat.rig, dt, moving, cat.mood || "calm"); if (!moving && !cat.rig.sleeping && cat.restT > 0) { cat.restT -= dt; if (cat.restT <= 0) cat.rig.sleeping = true; } }
    // aquarium fish
    if (props.aquarium) props.aquarium.children.forEach(f => { if (f.userData.fish) { f.userData.fish.ph += dt; f.position.x = f.userData.fish.base + Math.sin(f.userData.fish.ph) * 0.2; f.rotation.y = Math.cos(f.userData.fish.ph) > 0 ? 0 : Math.PI; } });
  }
  function lerpAngle(a, b, t) { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; }

  /* ---------- collisions ---------- */
  function collide(pos, radius) {
    const all = colliders.concat(walls.filter(w => w.aabb).map(w => w.aabb));
    for (const b of all) {
      const cx = Math.max(b.minX, Math.min(pos.x, b.maxX)), cz = Math.max(b.minZ, Math.min(pos.z, b.maxZ)); const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < radius * radius) { if (d2 > 1e-6) { const d = Math.sqrt(d2); pos.x += dx / d * (radius - d); pos.z += dz / d * (radius - d); } else { const px = Math.min(pos.x - b.minX, b.maxX - pos.x), pz = Math.min(pos.z - b.minZ, b.maxZ - pos.z); if (px < pz) pos.x += (pos.x - b.minX < b.maxX - pos.x ? -1 : 1) * (px + radius); else pos.z += (pos.z - b.minZ < b.maxZ - pos.z ? -1 : 1) * (pz + radius); } }
    }
    pos.x = Math.max(-40, Math.min(40, pos.x)); pos.z = Math.max(-38, Math.min(30, pos.z));
  }
  function roomAt(x, z) { for (const k in ROOMS) { const r = ROOMS[k]; if (x >= r.x[0] && x <= r.x[1] && z >= r.z[0] && z <= r.z[1]) return k; } return z < -26 && x > 4 && x < 22 ? "garden" : z < -12 ? "outside" : null; }

  /* ---------- public ---------- */
  function init(canvas) {
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x0f1222); scene.fog = new THREE.Fog(0x0f1222, 34, 70);
    camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 160);
    const mobile = (matchMedia && matchMedia("(pointer:coarse)").matches) || Math.min(innerWidth, innerHeight) < 600;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance", preserveDrawingBuffer: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2)); renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = mobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding;
    hemi = new THREE.HemisphereLight(0xdfe6ff, 0x1a1a2e, 0.85); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff1c0, 0.7); sun.position.set(-12, 22, 14); sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sun.shadow.camera.left = -30; sun.shadow.camera.right = 30; sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30; sun.shadow.bias = -0.0008; scene.add(sun);
    torch = new THREE.PointLight(0xffe3a0, 0, 7, 2); scene.add(torch);
    buildRooms(); buildFurniture();
    if (typeof buildDecor === "function") { try { buildDecor({ scene, box, cyl, sphere, mat, addCollider, roundedBoxGeo, themeMats, fadeables, textSprite }); } catch (e) { console.warn("decor failed", e); } }
    playerCfg = { skin: 0x9a5f3a, hair: 0x1b1420, shirt: 0x2f4f8f, pants: 0x24304f, hairstyle: "curly", glasses: true, glassesStyle: "round", frames: 0x2d2438, shoes: 0x23222e, coat: theme.coat, steth: true };
    player = makeHuman(playerCfg); player.group.position.set(-5, 0, -4.5); scene.add(player.group); setHumanOutfit(player, "clinic");
    setClinicPet("cat", 0x3a3a3a);
    clock = new THREE.Clock();
    const onResize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); if (innerWidth < innerHeight) camDist = Math.max(camDist, 1.25); };
    window.addEventListener("resize", onResize); window.addEventListener("orientationchange", () => setTimeout(onResize, 300)); onResize();
    window.addEventListener("wheel", (e) => { camDist = Math.max(0.6, Math.min(1.7, camDist + e.deltaY * 0.0008)); }, { passive: true });
    // first-person look controls
    canvas.addEventListener("mousemove", (e) => { if (camMode !== "first") return; if (document.pointerLockElement === canvas || e.buttons === 1) { tYaw -= e.movementX * 0.0022 * lookSens; tPitch = Math.max(-1.3, Math.min(1.2, tPitch - e.movementY * 0.0022 * lookSens)); } });
    canvas.addEventListener("click", () => { if (camMode === "first" && canvas.requestPointerLock && !document.pointerLockElement) { try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => { }); } catch (e) { } } });
    // touch look is handled by #lookZone (ux.js) so it never overlaps on-screen buttons
  }

  function lookDelta(dx, dy) { tYaw -= dx * lookSens; tPitch = Math.max(-1.3, Math.min(1.2, tPitch - dy * lookSens)); }
  function setLookOptions(o) { if (o.sens) lookSens = o.sens; if (o.bob !== undefined) headBob = !!o.bob; }
  function getLook() { return { yaw, pitch, mode: camMode }; }
  function setCamMode(m) {
    camMode = m; if (m === "first") { yaw = tYaw = player.group.rotation.y; pitch = tPitch = -0.08; player.group.visible = false; camera.fov = 70; } else { player.group.visible = true; camera.fov = 42; if (document.exitPointerLock && document.pointerLockElement) document.exitPointerLock(); } camera.updateProjectionMatrix();
    return camMode;
  }

  function update(input, opts) {
    const dt = Math.min(0.05, clock.getDelta());
    const pos = player.group.position; const prev = { x: pos.x, z: pos.z }; let moving = false;
    if (!opts.frozen && (input.x || input.z)) {
      const len = Math.hypot(input.x, input.z) || 1; const sp = (input.run ? 6.2 : 4.0) * dt * (opts.speedMult || 1) * Math.min(1, len);
      let mx = input.x / len, mz = input.z / len; if (preview) { mx = 0; mz = 0; moving = false; }
      if (camMode === "first") { // stick up = walk where you look; stick right = step right
        const f = { x: Math.sin(yaw), z: Math.cos(yaw) }; const r = { x: -Math.cos(yaw), z: Math.sin(yaw) };
        const fx = f.x * -mz + r.x * mx, fz = f.z * -mz + r.z * mx; mx = fx; mz = fz;
      }
      pos.x += mx * sp; pos.z += mz * sp; moving = true;
      if (camMode !== "first") player.group.rotation.y = lerpAngle(player.group.rotation.y, Math.atan2(mx, mz), Math.min(1, dt * 12));
    }
    collide(pos, 0.35);
    if (opts.gate && opts.gate(pos)) { pos.x = prev.x; pos.z = prev.z; }
    if (!opts.paused) animateHuman(player, dt, moving, input.run ? 1.3 : 1);
    // co-op second player
    if (player2 && opts.input2) { const p2 = player2.group.position; const i2 = opts.input2; let m2 = false; if (!opts.frozen && (i2.x || i2.z)) { const l = Math.hypot(i2.x, i2.z) || 1; p2.x += i2.x / l * 4 * dt; p2.z += i2.z / l * 4 * dt; m2 = true; player2.group.rotation.y = lerpAngle(player2.group.rotation.y, Math.atan2(i2.x, i2.z), Math.min(1, dt * 12)); } collide(p2, 0.35); animateHuman(player2, dt, m2); }
    if (!opts.paused) npcUpdate(dt);
    // camera
    if (preview) {
      previewAngle += dt * 0.6; player.group.rotation.y = previewAngle; player.group.position.y = 0; animateHuman(player, dt, false);
      camera.position.lerp(new THREE.Vector3(pos.x, 1.45, pos.z + 3.3), Math.min(1, dt * 5)); camera.lookAt(new THREE.Vector3(pos.x, 1.15, pos.z));
      for (const m of fadeables) { const hide = m.position.z > pos.z + 0.4 && m.position.z < pos.z + 3.6 && Math.abs(m.position.x - pos.x) < 4; m.visible = !hide; }
    } else if (camMode === "first") {
      for (const m of fadeables) m.visible = true;
      const k = Math.min(1, dt * 28); yaw += (tYaw - yaw) * k; pitch += (tPitch - pitch) * k; player.group.rotation.y = yaw;
      camera.position.set(pos.x, 1.62 + (moving && headBob ? Math.abs(Math.sin(player.phase)) * 0.035 : 0), pos.z);
      const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
      camera.lookAt(camera.position.clone().add(dir));
      for (const m of fadeables) { if (m.material.opacity < 1) { m.material.opacity = 1; m.material.transparent = false; } }
    } else {
      for (const m of fadeables) m.visible = true;
      const target = new THREE.Vector3(pos.x, 1.0, pos.z); const desired = new THREE.Vector3(pos.x, 11 * camDist + 1.5, pos.z + 9 * camDist + 1);
      camera.position.lerp(desired, Math.min(1, dt * 4)); camera.lookAt(target);
      for (const m of fadeables) { const want = (m.position.z > pos.z + 0.5 && Math.abs(m.position.x - pos.x) < 10) ? 0.14 : 1; m.material.opacity += (want - m.material.opacity) * Math.min(1, dt * 8); m.material.transparent = m.material.opacity < 0.995; m.castShadow = m.material.opacity > 0.5; }
    }
    // day/night + weather
    const targetNight = opts.night ? 1 : 0; nightAmount += (targetNight - nightAmount) * Math.min(1, dt * 0.8);
    hemi.intensity = 0.85 - nightAmount * 0.45; sun.intensity = 0.7 - nightAmount * 0.45; torch.intensity = nightAmount * 1.4; torch.position.set(pos.x, 2.2, pos.z + 0.5);
    windowMats.forEach(m => m.emissiveIntensity = 0.4 + nightAmount * 0.8);
    if (searchlight) { searchlight.rotation.z = 0.5 + Math.sin(performance.now() * 0.0003) * 0.35; searchlight.rotation.x = Math.sin(performance.now() * 0.0002) * 0.3; }
    if (rain && rain.visible) { const a = rain.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * 12; if (y < 0) y = 14; a.setY(i, y); } a.needsUpdate = true; }
    if (ring.visible) ring.scale.setScalar(1 + Math.sin(performance.now() * 0.005) * 0.08);
    renderer.render(scene, camera);
    return { dt, moving, pos };
  }

  function setRing(pos) { if (!pos) { ring.visible = false; return; } ring.visible = true; ring.position.x = pos.x; ring.position.z = pos.z; }
  function addNPC(cfg) {
    const rig = makeHuman(Object.assign({}, cfg, { pet: undefined })); rig.group.position.set(cfg.x, 0, cfg.z); if (cfg.rotY !== undefined) rig.group.rotation.y = cfg.rotY; scene.add(rig.group);
    if (cfg.outfit) setHumanOutfit(rig, cfg.outfit);
    let pet = null; if (cfg.pet) { pet = makePet(cfg.pet.species, cfg.pet.color); pet.group.position.set(cfg.x + 0.6, 0, cfg.z); scene.add(pet.group); }
    const n = { rig, pet, petFollow: true, path: [], speed: 2.4, onArrive: null, petMood: "calm" }; npcs.push(n); return n;
  }
  function removeNPC(n) { const i = npcs.indexOf(n); if (i >= 0) npcs.splice(i, 1); scene.remove(n.rig.group); if (n.pet) scene.remove(n.pet.group); }
  function placePet(n, x, y, z, rotY = 0) { n.petFollow = false; n.pet.group.position.set(x, y, z); n.pet.group.rotation.y = rotY; if (n.pet.parts.cage) n.pet.parts.cage.visible = false; }
  function playerPos() { return player.group.position; }
  function applyTheme(t) {
    Object.assign(theme, t); themeMats.wallClones.forEach(m => m.color.set(theme.wall)); themeMats.wall.color.set(theme.wall);
    themeMats.accent.forEach(m => m.color.set(theme.accent)); themeMats.trim.forEach(m => m.color.set(theme.trim));
    if (t.floor) { for (const k in themeMats.floors) if (k !== "corridor" && !lockedRooms[k]) { themeMats.floors[k].map = tileTexture(t.floor, Math.max(0, t.floor - 0x060608), 4); themeMats.floors[k].needsUpdate = true; } }
    if (t.coat && player) player.parts.coatMat.color.set(t.coat);
    scene.traverse(o => { if (o.userData && o.userData.decor) o.visible = theme.decor !== false; });
  }
  function applyAvatar(a) { if (!player) return; if (a.scrub) player.parts.shirtMat.color.set(a.scrub); if (a.cap) player.parts.capMat.color.set(a.cap); if (a.frames && player.parts.frameMat) player.parts.frameMat.color.set(a.frames); if (a.shoes) { player.shoeColor = typeof a.shoes === "string" ? parseInt(a.shoes.slice(1), 16) : a.shoes; setHumanOutfit(player, currentOutfit); } }
  function setSign(text) { if (signSprite) signSprite.userData.setText(text.toUpperCase()); if (props.floorLogo) props.floorLogo.userData.setText(text); }
  function setWeather(w) { weather = w; if (rain) rain.visible = w === "rain"; }
  const DOORS = { shop: [-17, -2], reception: [-5, -2], exam: [6.5, -2], staff: [13, -2], dental: [19.5, -2], office: [-17.5, 1.5], lab: [-11, 1.5], pharmacy: [-5.5, 1.5], prep: [0, 1.5], or: [7, 1.5], xray: [13.5, 1.5], ward: [19.5, 1.5] };
  function routeBetween(a, b) { // waypoints through doors and the corridor
    const ra = roomAt(a[0], a[1]), rb = roomAt(b[0], b[1]); const pts = [];
    const exit = (r, pt, into) => { const d = DOORS[r]; if (!d) return; const side = d[1] < 0 ? -1 : 1; if (into) { pts.push([d[0], d[1] - side * 0.6]); pts.push([d[0], d[1] + side * 0.8]); } else { pts.push([d[0], d[1] + side * 0.8]); pts.push([d[0], d[1] - side * 0.6]); } };
    if (ra === rb) return [b];
    if (ra && ra !== "corridor" && ra !== "outside") exit(ra, a, false);
    if (rb && rb !== "corridor" && rb !== "outside") { const d = DOORS[rb]; if (d) { pts.push([d[0], 0]); exit(rb, b, true); } }
    pts.push(b); return pts;
  }
  function catWander(target) { if (!cat) return; cat.rig.sleeping = false; const p = cat.rig.group.position; const spot = target || cat.spots[Math.floor(Math.random() * cat.spots.length)]; cat.path = routeBetween([p.x, p.z], spot); cat.restT = 6; }
  function catPos() { return cat ? cat.rig.group.position : null; }
  function setPlayerPose(pose, target) { if (!player) return; player.pose = pose || null; if (pose && target && camMode !== "first") { const p = player.group.position; player.group.rotation.y = Math.atan2(target.x - p.x, target.z - p.z); } }
  function setClinicPet(species, color) { if (cat) { scene.remove(cat.rig.group); } const crig = makePet(species, color); crig.group.position.set(1.5, 0, -10.8); scene.add(crig.group); crig.sleeping = true; cat = { rig: crig, path: [], speed: species === "tortoise" ? 0.5 : species === "rabbit" ? 2.2 : 1.6, onArrive: null, restT: 0, spots: [[1.5, -10.8], [-8.5, -4], [-11, -9], [-16, 9], [-1, -0.5], [1.5, -10.8], [-7, -8]] }; }
  function catMood(m) { if (cat) cat.mood = m; }
  let catLeash = false, leash = null, waypoint = null, waypointT = 0;
  function catFollow(on) { catLeash = !!on; if (!cat) return; if (!cat.baseSpeed) cat.baseSpeed = cat.speed; if (!on) cat.speed = cat.baseSpeed; cat.path = [];
    if (on && !leash) { try { leash = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 6), new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.6 })); scene.add(leash); } catch (e) { leash = null; } }
    if (leash) leash.visible = !!on; }
  function setWaypoint(w) {
    if (!waypoint) { waypoint = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0xf2c14e, emissive: 0xf2c14e, emissiveIntensity: 0.8, transparent: true, opacity: 0.4 }); const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 5, 16, 1, true), m); beam.position.y = 2.5; waypoint.add(beam); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 8, 32), new THREE.MeshStandardMaterial({ color: 0xf2c14e, emissive: 0xf2c14e, emissiveIntensity: 0.6 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; waypoint.add(ring); scene.add(waypoint); }
    waypoint.visible = !!w; if (w) waypoint.position.set(w.x, 0, w.z); }
  function rebuildPlayer(cfg) { const pos = player.group.position.clone(); const rot = player.group.rotation.y; const outfitNow = currentOutfit; scene.remove(player.group); playerCfg = Object.assign({}, playerCfg, cfg); player = makeHuman(playerCfg); player.group.position.copy(pos); player.group.rotation.y = rot; scene.add(player.group); setHumanOutfit(player, outfitNow); if (camMode === "first") player.group.visible = false; }
  function setPreview(on) { preview = on; if (on) { previewAngle = 0; player.group.visible = true; } else if (camMode === "first") player.group.visible = false; }
  function enableCoop(on) { if (on && !player2) { player2 = makeHuman({ skin: 0xe0ac69, hair: 0x4a2c1a, shirt: 0x4fb3a9, pants: 0x24304f, curly: false, glasses: false }); player2.group.position.set(-3, 0, -4.5); scene.add(player2.group); setHumanOutfit(player2, "scrubs"); } if (!on && player2) { scene.remove(player2.group); player2 = null; } }
  function player2Pos() { return player2 ? player2.group.position : null; }
  function screenshot() { renderer.render(scene, camera); try { return renderer.domElement.toDataURL("image/png"); } catch (e) { return null; } }
  function showThankCards(n) { if (!props.thankWall) return; props.thankWall.children.forEach((c, i) => c.visible = i < n); }
  function addStaffNPC(role) {
    const posts = { receptionist: { x: -5, z: -5.6, rotY: Math.PI, shirt: 0x7c6fcf, outfit: "clinic" }, nurse: { x: 7.4, z: -6, rotY: -Math.PI / 2, shirt: 0x4fb3a9, outfit: "scrubs" }, assistant: { x: 8, z: 7.6, rotY: -Math.PI / 2, shirt: 0x4fb3a9, outfit: "surgical" }, shopkeeper: { x: -17, z: -5.6, rotY: Math.PI, shirt: 0xe07a5f, outfit: "clinic" }, cleaner: { x: -9, z: -0.3, rotY: 0, shirt: 0x5f8fd6, outfit: "clinic" }, pharmacist: { x: -4, z: 8.5, rotY: -Math.PI / 2, shirt: 0x9b7fd1, outfit: "clinic" } };
    const p = posts[role]; if (!p) return null; const n = addNPC({ x: p.x, z: p.z, rotY: p.rotY, skin: [0xf1c27d, 0xc68642, 0x8d5524][Math.floor(Math.random() * 3)], hair: [0x1b1420, 0x4a2c1a, 0x3a2a20][Math.floor(Math.random() * 3)], hairstyle: ["bun", "short", "long", "curly", "buzz"][Math.floor(Math.random() * 5)], glassesStyle: Math.random() < 0.5 ? "round" : "square", shirt: p.shirt, pants: 0x24304f, glasses: Math.random() < 0.4, coat: 0xe9e9f2, outfit: p.outfit, seed: Math.floor(Math.random() * 1e9) }); n.isStaff = role; return n;
  }

  return { init, update, setRing, addNPC, removeNPC, placePet, playerPos, applyTheme, applyAvatar, setSign, setLocked, setWeather, setCamMode, lookDelta, setLookOptions, getLook, setPlayerPose, catWander, catPos, catMood, catFollow, setWaypoint, routeBetween, setClinicPet, rebuildPlayer, setPreview, enableCoop, player2Pos, screenshot, showThankCards, addStaffNPC, setOutfit: (o) => setHumanOutfit(player, o), roomAt, props, animatePet, npcs, get camMode() { return camMode; }, get player() { return player; }, get camera() { return camera; }, get scene() { return scene; }, get locked() { return lockedRooms; } };
})();
