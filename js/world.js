/* ============================================================
   WORLD — Three.js scene for Batman Clinic
   Coordinates: x = east/west, z = north/south (+z is toward the camera)
   ============================================================ */

const ROOMS = {
  reception: { name: "Reception & Waiting", x: [-7, 7], z: [-9.5, -1.5], floor: 0x3b3f5c },
  shop:      { name: "Clinic Shop",         x: [-15, -7], z: [-9.5, -1.5], floor: 0x3a3352 },
  exam:      { name: "Exam Room",           x: [7, 15], z: [-9.5, -1.5], floor: 0x2f4a4e },
  office:    { name: "Office & Library",    x: [-15, -8], z: [1.5, 10.5], floor: 0x4a3d33 },
  prep:      { name: "Prep & Scrub Room",   x: [-8, -2], z: [1.5, 10.5], floor: 0x33405c },
  or:        { name: "Operating Room",      x: [-2, 6], z: [1.5, 10.5], floor: 0x2e4a44 },
  xray:      { name: "X-ray Suite",         x: [6, 15], z: [1.5, 10.5], floor: 0x332f4e },
  corridor:  { name: "Corridor",            x: [-15, 15], z: [-1.5, 1.5], floor: 0x363a52 }
};

const World = (() => {
  let scene, camera, renderer, clock;
  const walls = [];        // { mesh, aabb }
  const colliders = [];    // aabbs for furniture
  const fadeables = [];    // wall meshes that can fade
  const labels = [];
  const props = {};        // named prop meshes/groups
  const npcs = [];
  let player = null, ring = null, signSprite = null;
  const theme = { wall: 0x2a2f4a, accent: 0xf2c14e, trim: 0x4b4f7a, coat: 0xe9e9f2, decor: true };
  const themeMats = { wall: null, accent: [], trim: [], floors: {} };
  let camDist = 1.0;

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
  function box(w, h, d, color, x, y, z, r = 0.08, m = null) {
    const mesh = new THREE.Mesh(roundedBoxGeo(w, h, d, r), m || mat(color));
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
  }
  function sphere(r, color, x, y, z, m = null) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m || mat(color)); s.position.set(x, y, z); s.castShadow = true; return s; }
  function cyl(rt, rb, h, color, x, y, z, m = null) { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 18), m || mat(color)); c.position.set(x, y, z); c.castShadow = true; return c; }
  function addCollider(x1, z1, x2, z2) { colliders.push({ minX: Math.min(x1, x2), maxX: Math.max(x1, x2), minZ: Math.min(z1, z2), maxZ: Math.max(z1, z2) }); }
  function colliderFor(mesh, w, d) { addCollider(mesh.position.x - w / 2, mesh.position.z - d / 2, mesh.position.x + w / 2, mesh.position.z + d / 2); }

  function roundRectPath(ctx, x, y, w, h, r) { // works on older iOS Safari without ctx.roundRect
    r = Math.min(r, w / 2, h / 2); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }
  function textSprite(text, opts = {}) {
    const c = document.createElement("canvas"); c.width = 768; c.height = 160;
    const ctx = c.getContext("2d");
    const draw = (t) => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.font = `bold ${opts.size || 54}px 'Nunito', 'Segoe UI', sans-serif`;
      const tw = ctx.measureText(t).width + 70, x = (c.width - tw) / 2;
      ctx.fillStyle = opts.bg || "rgba(24,27,45,0.94)";
      ctx.beginPath(); roundRectPath(ctx, x, 30, tw, 100, 50); ctx.fill();
      ctx.fillStyle = opts.color || "#f2c14e"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(t, c.width / 2, 82);
    };
    draw(text);
    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    const sc = opts.scale || 1; sp.scale.set(4.8 * sc, 1.0 * sc, 1);
    sp.userData.setText = (t) => { draw(t); tex.needsUpdate = true; };
    return sp;
  }

  /* ---------- building ---------- */
  function wall(x1, z1, x2, z2, h = 2.5, t = 0.3) {
    const horizontal = Math.abs(x2 - x1) > Math.abs(z2 - z1);
    const len = (horizontal ? Math.abs(x2 - x1) : Math.abs(z2 - z1)) + t;
    const m = themeMats.wall;
    const mesh = new THREE.Mesh(roundedBoxGeo(horizontal ? len : t, h, horizontal ? t : len, 0.08), m.clone());
    mesh.position.set((x1 + x2) / 2, h / 2, (z1 + z2) / 2); mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.material.transparent = true;
    scene.add(mesh);
    const aabb = { minX: mesh.position.x - (horizontal ? len : t) / 2, maxX: mesh.position.x + (horizontal ? len : t) / 2, minZ: mesh.position.z - (horizontal ? t : len) / 2, maxZ: mesh.position.z + (horizontal ? t : len) / 2 };
    walls.push({ mesh, aabb }); fadeables.push(mesh); themeMats.wallClones.push(mesh.material);
    return mesh;
  }
  function lintel(x, z, horizontal, w = 2.2) { // soft arch above a doorway
    const m = box(horizontal ? w + 0.3 : 0.36, 0.5, horizontal ? 0.36 : w + 0.3, theme.trim, x, 2.3, z, 0.12);
    m.material.transparent = true; themeMats.trim.push(m.material); fadeables.push(m); scene.add(m);
    walls.push({ mesh: m, aabb: null });
  }
  function floorPlane(x1, z1, x2, z2, color, key) {
    const g = new THREE.PlaneGeometry(x2 - x1, z2 - z1);
    const m = mat(color, { roughness: 0.95 });
    const p = new THREE.Mesh(g, m); p.rotation.x = -Math.PI / 2; p.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2); p.receiveShadow = true;
    scene.add(p); if (key) themeMats.floors[key] = m; return p;
  }
  function buildRooms() {
    themeMats.wall = mat(theme.wall); themeMats.wallClones = [];
    for (const k in ROOMS) { const r = ROOMS[k]; floorPlane(r.x[0], r.z[0], r.x[1], r.z[1], r.floor, k); }
    // outside: pavement + grass
    floorPlane(-16, -16, 16, -9.5, 0x2a2d3e); floorPlane(-30, -30, 30, -16, 0x274a3e); floorPlane(-30, -16, -16, 14, 0x274a3e); floorPlane(16, -16, 30, 14, 0x274a3e); floorPlane(-30, 10.5, 30, 30, 0x274a3e);
    // outer walls
    wall(-15, -9.5, -1.1, -9.5); wall(1.1, -9.5, 15, -9.5); lintel(0, -9.5, true, 2.2);
    wall(-15, 10.5, 15, 10.5); wall(-15, -9.5, -15, 10.5); wall(15, -9.5, 15, 10.5);
    // south row interior
    wall(-7, -9.5, -7, -1.5); wall(7, -9.5, 7, -1.5);
    // corridor south wall (z=-1.5) with doors at x=-11, 0, 11
    wall(-15, -1.5, -12, -1.5); wall(-10, -1.5, -1, -1.5); wall(1, -1.5, 10, -1.5); wall(12, -1.5, 15, -1.5);
    lintel(-11, -1.5, true); lintel(0, -1.5, true); lintel(11, -1.5, true);
    // corridor north wall (z=1.5) with doors at x=-11.5, -5, 2, 10.5
    wall(-15, 1.5, -12.5, 1.5); wall(-10.5, 1.5, -6, 1.5); wall(-4, 1.5, 1, 1.5); wall(3, 1.5, 9.5, 1.5); wall(11.5, 1.5, 15, 1.5);
    lintel(-11.5, 1.5, true); lintel(-5, 1.5, true); lintel(2, 1.5, true); lintel(10.5, 1.5, true);
    // north row interior
    wall(-8, 1.5, -8, 10.5); wall(-2, 1.5, -2, 7); wall(-2, 9, -2, 10.5); lintel(-2, 8, false, 2); wall(6, 1.5, 6, 10.5);
    // room labels
    for (const k in ROOMS) { if (k === "corridor") continue; const r = ROOMS[k]; const sp = textSprite(r.name, { size: 50 }); sp.position.set((r.x[0] + r.x[1]) / 2, 3.3, (r.z[0] + r.z[1]) / 2); scene.add(sp); labels.push(sp); }
    // sterile-zone mat at OR doors
    const sz = textSprite("STERILE ZONE — scrubs, cap & mask required", { size: 34, bg: "rgba(70,18,36,0.96)", color: "#ff8fa3", scale: 0.8 });
    sz.position.set(2, 1.6, 1.0); scene.add(sz);
    // clinic sign above the entrance
    signSprite = textSprite("BATMAN CLINIC", { size: 64, bg: "rgba(14,16,30,0.97)", color: "#f2c14e", scale: 1.5 }); signSprite.position.set(0, 3.6, -9.6); scene.add(signSprite);
  }

  function accentBox(w, h, d, x, y, z, r) { const m = box(w, h, d, theme.accent, x, y, z, r); themeMats.accent.push(m.material); return m; }
  function trimBox(w, h, d, x, y, z, r) { const m = box(w, h, d, theme.trim, x, y, z, r); themeMats.trim.push(m.material); return m; }
  function plant(x, z) { const g = new THREE.Group(); g.add(cyl(0.22, 0.18, 0.4, 0x5a3e2b, 0, 0.2, 0)); for (let i = 0; i < 5; i++) { const l = sphere(0.22, 0x3f8f5a, (Math.random() - .5) * .35, 0.6 + Math.random() * .3, (Math.random() - .5) * .35); l.scale.set(1, 1.3, 1); g.add(l); } g.position.set(x, 0, z); g.userData.decor = true; scene.add(g); return g; }
  function poster(x, z, rotY, color) { const g = new THREE.Group(); g.add(box(1.0, 0.75, 0.06, 0xdfe3ee, 0, 0, 0, 0.04)); g.add(box(0.8, 0.55, 0.07, color, 0, 0, 0.01, 0.06)); g.position.set(x, 1.6, z); g.rotation.y = rotY; g.userData.decor = true; scene.add(g); return g; }
  function chair(x, z, rotY) { const g = new THREE.Group(); g.add(accentBox(0.6, 0.12, 0.6, 0, 0.45, 0, 0.06)); g.add(accentBox(0.6, 0.5, 0.12, 0, 0.75, -0.24, 0.06)); [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(p => g.add(cyl(0.03, 0.03, 0.42, 0x6b6f8f, p[0], 0.21, p[1]))); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g); addCollider(x - .3, z - .3, x + .3, z + .3); return g; }
  function table(x, z, w, d, h, color, legColor = 0x6b6f8f) { const g = new THREE.Group(); g.add(box(w, 0.12, d, color, 0, h, 0, 0.06)); [[-w / 2 + .12, -d / 2 + .12], [w / 2 - .12, -d / 2 + .12], [-w / 2 + .12, d / 2 - .12], [w / 2 - .12, d / 2 - .12]].forEach(p => g.add(cyl(0.05, 0.05, h, legColor, p[0], h / 2, p[1]))); g.position.set(x, 0, z); scene.add(g); addCollider(x - w / 2, z - d / 2, x + w / 2, z + d / 2); return g; }
  function shelf(x, z, w, rotY, items) { const g = new THREE.Group(); g.add(trimBox(w, 2.0, 0.4, 0, 1.0, 0, 0.06)); for (let s = 0; s < 3; s++) { g.add(box(w - 0.1, 0.06, 0.38, 0xdfe3ee, 0, 0.45 + s * 0.55, 0.02, 0.03)); for (let i = 0; i < items; i++) { const col = [0xf2c14e, 0x7c6fcf, 0x5f8fd6, 0xe07a5f, 0x4fb3a9][(i + s) % 5]; g.add(box(0.22, 0.3, 0.2, col, -w / 2 + 0.25 + i * ((w - 0.4) / Math.max(1, items - 1)), 0.65 + s * 0.55, 0.05, 0.05)); } } g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g); return g; }

  function buildFurniture() {
    // ---- Reception & waiting
    const desk = new THREE.Group();
    desk.add(accentBox(3.2, 1.0, 0.9, 0, 0.5, 0, 0.12)); desk.add(box(3.4, 0.1, 1.0, 0xdfe3ee, 0, 1.03, 0, 0.05));
    const screen = box(0.5, 0.35, 0.05, 0x5f8fd6, -0.9, 1.3, -0.1, 0.04); desk.add(screen); desk.add(box(0.1, 0.15, 0.1, 0x6b6f8f, -0.9, 1.1, -0.1, 0.03));
    desk.position.set(0, 0, -4.5); scene.add(desk); addCollider(-1.6, -4.95, 1.6, -4.05); props.desk = desk;
    const bell = new THREE.Group(); const dome = sphere(0.14, 0xf5c542, 0, 0.07, 0); dome.scale.y = 0.7; bell.add(dome); bell.add(cyl(0.18, 0.2, 0.04, 0x6b6f8f, 0, 0.0, 0)); bell.add(sphere(0.035, 0xb88a20, 0, 0.18, 0)); bell.position.set(1.0, 1.1, -4.5); scene.add(bell); props.bell = bell;
    [[-5.6, -8.4], [-4.1, -8.4], [-2.6, -8.4], [-5.6, -6.2]].forEach((p, i) => props["chair" + i] = chair(p[0], p[1], i === 3 ? Math.PI / 2 : 0));
    const shiftBoard = new THREE.Group(); shiftBoard.add(box(1.4, 1.0, 0.08, 0xdfe3ee, 0, 0, 0, 0.06)); shiftBoard.add(trimBox(1.2, 0.3, 0.09, 0, 0.3, 0.01, 0.06)); shiftBoard.add(box(1.1, 0.4, 0.09, 0xf2c14e, 0, -0.15, 0.01, 0.05)); shiftBoard.position.set(4.5, 1.6, -9.3); scene.add(shiftBoard); props.shiftBoard = shiftBoard;
    plant(-6.4, -2.2); plant(6.4, -2.2); poster(-6.6, -4.5, Math.PI / 2, 0xf2c14e); poster(6.6, -7, -Math.PI / 2, 0x5f8fd6);
    const mat1 = box(2.2, 0.03, 1.2, 0x5a4e8f, 0, 0.015, -8.6, 0.02); scene.add(mat1);
    const waterBowl = cyl(0.2, 0.15, 0.1, 0x5f8fd6, -2.8, 0.05, -6.3); scene.add(waterBowl);

    // ---- Shop
    props.counter = new THREE.Group(); props.counter.add(accentBox(2.4, 1.0, 0.8, 0, 0.5, 0, 0.12)); props.counter.add(box(2.6, 0.1, 0.9, 0xdfe3ee, 0, 1.03, 0, 0.05)); props.counter.add(box(0.35, 0.3, 0.3, 0x6b6f8f, 0.7, 1.22, 0, 0.05)); props.counter.position.set(-11, 0, -3.5); scene.add(props.counter); addCollider(-12.2, -3.9, -9.8, -3.1);
    shelf(-14.6, -5.5, 3.6, Math.PI / 2, 5); shelf(-11, -9.1, 5, 0, 6); shelf(-7.4, -6, 2.6, -Math.PI / 2, 4);
    addCollider(-15, -7.4, -14.2, -3.6); addCollider(-13.6, -9.5, -8.4, -8.8); addCollider(-7.8, -7.4, -7, -4.6);
    plant(-8, -2.3);

    // ---- Exam room
    props.examTable = table(11, -5.5, 1.7, 0.9, 0.85, 0xdfe3ee, 0x6b6f8f); props.examTable.add(box(1.6, 0.06, 0.8, 0x4fb3a9, 0, 0.95, 0, 0.03));
    const cab = trimBox(1.8, 0.9, 0.6, 14.5, 0.45, -5.5, 0.08); cab.rotation.y = Math.PI / 2; scene.add(cab); addCollider(14.1, -6.5, 15, -4.5);
    scene.add(box(1.6, 0.08, 0.5, 0xdfe3ee, 14.5, 0.94, -5.5, 0.04));
    const scale = new THREE.Group(); scale.add(box(0.9, 0.08, 0.6, 0x6b6f8f, 0, 0.04, 0, 0.04)); scale.add(box(0.3, 0.2, 0.12, 0x5f8fd6, 0, 0.18, -0.3, 0.04)); scale.position.set(8.2, 0, -8.6); scene.add(scale); addCollider(7.7, -9.0, 8.7, -8.2);
    const otoStand = cyl(0.04, 0.04, 1.1, 0x6b6f8f, 13.5, 0.55, -8.6); scene.add(otoStand); scene.add(sphere(0.12, 0xf2c14e, 13.5, 1.15, -8.6));
    poster(11, -9.3, 0, 0x4fb3a9); plant(7.6, -2.3);

    // ---- Office & library
    props.officeDesk = table(-11.5, 6, 2.0, 1.0, 0.78, 0x6e4b36, 0x4a3224); props.officeDesk.add(box(0.7, 0.45, 0.05, 0x5f8fd6, -0.3, 1.12, -0.2, 0.04)); props.officeDesk.add(box(0.12, 0.2, 0.12, 0x6b6f8f, -0.3, 0.9, -0.2, 0.03)); props.officeDesk.add(box(0.5, 0.25, 0.4, 0xdfe3ee, 0.55, 0.97, -0.1, 0.06));
    chair(-11.5, 7.0, Math.PI);
    props.bookshelf = new THREE.Group(); props.bookshelf.add(trimBox(3.2, 2.2, 0.4, 0, 1.1, 0, 0.06)); for (let s = 0; s < 3; s++) { props.bookshelf.add(box(3.0, 0.05, 0.38, 0xdfe3ee, 0, 0.5 + s * 0.6, 0.02, 0.02)); for (let i = 0; i < 9; i++) props.bookshelf.add(box(0.22, 0.42 + Math.random() * .1, 0.26, [0xf2c14e, 0x7c6fcf, 0x5f8fd6, 0x4fb3a9, 0xe07a5f, 0xb4557a][(i + s) % 6], -1.3 + i * 0.32, 0.76 + s * 0.6, 0.04, 0.04)); }
    props.bookshelf.position.set(-14.6, 0, 6.5); props.bookshelf.rotation.y = Math.PI / 2; scene.add(props.bookshelf); addCollider(-15, 4.8, -14.2, 8.2);
    props.cabinet = new THREE.Group(); props.cabinet.add(accentBox(1.0, 1.5, 0.6, 0, 0.75, 0, 0.08)); for (let i = 0; i < 3; i++) { props.cabinet.add(box(0.8, 0.35, 0.05, 0xdfe3ee, 0, 0.3 + i * 0.45, 0.31, 0.04)); props.cabinet.add(box(0.3, 0.05, 0.06, 0x6b6f8f, 0, 0.3 + i * 0.45, 0.35, 0.02)); }
    props.cabinet.position.set(-9.2, 0, 10.0); scene.add(props.cabinet); addCollider(-9.8, 9.6, -8.6, 10.5);
    props.printer = box(0.6, 0.3, 0.5, 0xdfe3ee, -13.5, 0.93, 9.9, 0.08); scene.add(props.printer); scene.add(trimBox(0.8, 0.78, 0.6, -13.5, 0.39, 9.9, 0.08)); addCollider(-14, 9.5, -13, 10.5);
    poster(-11.5, 10.3, 0, 0xf2c14e); plant(-8.6, 2.2);

    // ---- Prep & scrub room
    props.locker = new THREE.Group(); props.locker.add(trimBox(1.4, 2.0, 0.6, 0, 1.0, 0, 0.08)); props.locker.add(box(0.6, 1.8, 0.05, 0xdfe3ee, -0.35, 1.0, 0.31, 0.04)); props.locker.add(box(0.6, 1.8, 0.05, 0xdfe3ee, 0.35, 1.0, 0.31, 0.04)); props.locker.add(box(0.05, 0.2, 0.06, 0x6b6f8f, -0.1, 1.0, 0.34, 0.02)); props.locker.add(box(0.05, 0.2, 0.06, 0x6b6f8f, 0.6, 1.0, 0.34, 0.02));
    props.locker.position.set(-7.6, 0, 8.4); props.locker.rotation.y = Math.PI / 2; scene.add(props.locker); addCollider(-8, 7.6, -7.2, 9.2);
    props.sink = new THREE.Group(); props.sink.add(box(1.6, 0.9, 0.7, 0xdfe3ee, 0, 0.45, 0, 0.1)); const basin = cyl(0.35, 0.3, 0.2, 0x9fc5ea, 0, 0.9, 0); props.sink.add(basin); props.sink.add(cyl(0.04, 0.04, 0.4, 0x6b6f8f, 0, 1.15, -0.25)); props.sink.add(cyl(0.04, 0.04, 0.3, 0x6b6f8f, 0, 1.35, -0.12).rotateX(Math.PI / 2)); props.sink.add(box(0.2, 0.25, 0.15, 0xf2c14e, -0.55, 1.05, 0, 0.05));
    props.sink.position.set(-5, 0, 10.0); scene.add(props.sink); addCollider(-5.9, 9.6, -4.1, 10.5);
    props.prepTable = table(-4.6, 5.3, 1.7, 0.9, 0.85, 0xdfe3ee); props.prepTable.add(box(1.6, 0.06, 0.8, 0x5f8fd6, 0, 0.95, 0, 0.03));
    const anesCartP = new THREE.Group(); anesCartP.add(box(0.7, 1.1, 0.5, 0x6b6f8f, 0, 0.55, 0, 0.08)); anesCartP.add(cyl(0.12, 0.12, 0.7, 0x5f8fd6, -0.15, 1.45, 0)); anesCartP.add(cyl(0.12, 0.12, 0.7, 0x4fb3a9, 0.15, 1.45, 0)); anesCartP.position.set(-2.7, 0, 3.2); scene.add(anesCartP); addCollider(-3.1, 2.9, -2.3, 3.5);
    const bin = cyl(0.25, 0.22, 0.6, 0xf2c14e, -7.5, 0.3, 2.3); scene.add(bin); addCollider(-7.8, 2, -7.2, 2.6);

    // ---- Operating room
    props.orTable = table(2, 6, 1.9, 0.8, 0.9, 0x8a8fb0, 0x5a5e80); props.orTable.add(box(1.8, 0.08, 0.7, 0x4fb3a9, 0, 1.0, 0, 0.04));
    const lamp = new THREE.Group(); lamp.add(cyl(0.03, 0.03, 1.2, 0x6b6f8f, 0, 3.4, 0)); const head = cyl(0.55, 0.4, 0.25, 0xdfe3ee, 0, 2.75, 0); lamp.add(head); const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.35, 24), new THREE.MeshStandardMaterial({ color: 0xfff8d6, emissive: 0xfff2b0, emissiveIntensity: 0.9 })); bulb.rotation.x = Math.PI / 2; bulb.position.y = 2.62; lamp.add(bulb); lamp.position.set(2, 0, 6); scene.add(lamp);
    const spot = new THREE.SpotLight(0xfff4d0, 0.9, 7, 0.6, 0.5, 1); spot.position.set(2, 2.6, 6); spot.target.position.set(2, 1, 6); scene.add(spot); scene.add(spot.target);
    props.tray = new THREE.Group(); props.tray.add(box(1.0, 0.06, 0.6, 0x6b6f8f, 0, 1.0, 0, 0.03)); props.tray.add(cyl(0.03, 0.03, 1.0, 0x5a5e80, 0, 0.5, 0)); props.tray.add(box(0.9, 0.03, 0.5, 0x5f8fd6, 0, 1.05, 0, 0.02)); for (let i = 0; i < 6; i++) props.tray.add(box(0.05, 0.02, 0.3, 0xe9eef7, -0.3 + i * 0.12, 1.08, 0, 0.01)); props.tray.position.set(3.8, 0, 5.4); scene.add(props.tray); addCollider(3.3, 5.1, 4.3, 5.7);
    props.anes = new THREE.Group(); props.anes.add(box(0.8, 1.2, 0.6, 0x6b6f8f, 0, 0.6, 0, 0.1)); props.anes.add(cyl(0.12, 0.12, 0.8, 0x5f8fd6, -0.2, 1.6, 0)); props.anes.add(cyl(0.12, 0.12, 0.8, 0x4fb3a9, 0.2, 1.6, 0)); props.anes.add(box(0.5, 0.35, 0.08, 0x3a3f66, 0, 1.45, 0.32, 0.04)); props.anes.add(box(0.4, 0.06, 0.02, 0x7ef29a, 0, 1.45, 0.37, 0.01)); props.anes.position.set(0.0, 0, 7.6); scene.add(props.anes); addCollider(-0.4, 7.3, 0.4, 7.9);
    const monitor = new THREE.Group(); monitor.add(cyl(0.03, 0.03, 1.4, 0x5a5e80, 0, 0.7, 0)); monitor.add(box(0.6, 0.45, 0.06, 0x3a3f66, 0, 1.6, 0, 0.04)); monitor.position.set(0.1, 0, 4.4); scene.add(monitor);
    props.kennel = new THREE.Group(); props.kennel.add(trimBox(1.2, 1.2, 0.9, 0, 0.6, 0, 0.1)); props.kennel.add(box(1.0, 1.0, 0.05, 0xdfe3ee, 0, 0.6, 0.46, 0.06)); for (let i = 0; i < 5; i++) props.kennel.add(cyl(0.015, 0.015, 0.9, 0x5a5e80, -0.4 + i * 0.2, 0.6, 0.48)); props.kennel.position.set(4.9, 0, 9.8); scene.add(props.kennel); addCollider(4.3, 9.3, 5.5, 10.5);
    const kennelSign = textSprite("Recovery", { size: 40, scale: 0.6 }); kennelSign.position.set(4.9, 1.7, 9.8); scene.add(kennelSign);

    // ---- X-ray suite
    props.xrayTable = table(10.5, 6, 2.0, 0.9, 0.85, 0x3a3f66, 0x5a5e80);
    const arm = new THREE.Group(); arm.add(cyl(0.08, 0.08, 2.6, 0x6b6f8f, 0, 1.3, 0)); arm.add(box(1.2, 0.12, 0.12, 0x6b6f8f, 0.6, 2.55, 0, 0.05)); arm.add(box(0.5, 0.4, 0.5, 0xdfe3ee, 1.2, 2.3, 0, 0.1)); arm.add(cyl(0.12, 0.08, 0.15, 0x5f8fd6, 1.2, 2.05, 0)); arm.position.set(9.3, 0, 6); scene.add(arm); addCollider(9.1, 5.8, 9.5, 6.2);
    props.viewer = new THREE.Group(); props.viewer.add(box(1.8, 1.1, 0.1, 0xdfe3ee, 0, 0, 0, 0.06)); props.viewer.add(box(1.6, 0.9, 0.11, 0x2d3350, 0, 0, 0.01, 0.05)); props.viewer.position.set(10.5, 1.6, 10.3); scene.add(props.viewer);
    const apron = box(0.5, 0.9, 0.08, 0x5f8fd6, 14.7, 1.2, 4, 0.08); apron.rotation.y = Math.PI / 2; scene.add(apron);
    const consoleX = new THREE.Group(); consoleX.add(box(0.9, 0.9, 0.5, 0x6b6f8f, 0, 0.45, 0, 0.08)); consoleX.add(box(0.6, 0.4, 0.05, 0x5f8fd6, 0, 1.15, 0, 0.04)); consoleX.position.set(13.8, 0, 8.6); scene.add(consoleX); addCollider(13.3, 8.3, 14.3, 8.9);
    poster(10.5, 1.8, Math.PI, 0x7c6fcf);

    // outside: tree & bench
    const tree = new THREE.Group(); tree.add(cyl(0.15, 0.2, 1.2, 0x5a3e2b, 0, 0.6, 0)); tree.add(sphere(0.9, 0x2f6b4f, 0, 1.7, 0)); tree.add(sphere(0.6, 0x3a7d5c, 0.5, 2.0, 0.3)); tree.position.set(4, 0, -12.5); scene.add(tree);
    const tree2 = tree.clone(); tree2.position.set(-4.5, 0, -12.5); scene.add(tree2);
    scene.add(box(1.6, 0.1, 0.5, 0x6e4b36, -2.5, 0.45, -11, 0.04));

    // interaction highlight ring
    ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 32), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; ring.visible = false; scene.add(ring);
  }

  /* ---------- characters ---------- */
  function makeHuman(cfg) {
    const g = new THREE.Group(); const P = {};
    const skin = mat(cfg.skin), shirtM = mat(cfg.shirt), pantsM = mat(cfg.pants), shoeM = mat(cfg.shoes || 0x23222e);
    // legs
    ["l", "r"].forEach((side, i) => {
      const piv = new THREE.Group(); piv.position.set(i === 0 ? -0.13 : 0.13, 0.92, 0);
      piv.add(cyl(0.11, 0.1, 0.78, 0, 0, -0.39, 0, pantsM));
      const shoe = sphere(0.12, 0, 0, -0.84, 0.05, shoeM); shoe.scale.set(1, 0.6, 1.4); piv.add(shoe); P[side + "Shoe"] = shoe;
      g.add(piv); P[side + "Leg"] = piv;
    });
    // torso
    P.torso = box(0.52, 0.66, 0.32, 0, 0, 1.25, 0, 0.14, shirtM); g.add(P.torso);
    P.belt = box(0.5, 0.08, 0.3, 0x23222e, 0, 0.93, 0, 0.04); g.add(P.belt);
    // arms
    ["l", "r"].forEach((side, i) => {
      const piv = new THREE.Group(); piv.position.set(i === 0 ? -0.34 : 0.34, 1.5, 0);
      const sleeve = cyl(0.085, 0.075, 0.3, 0, 0, -0.15, 0, shirtM); piv.add(sleeve); P[side + "Sleeve"] = sleeve;
      piv.add(cyl(0.075, 0.07, 0.3, 0, 0, -0.44, 0, skin));
      const hand = sphere(0.09, 0, 0, -0.63, 0, skin.clone()); piv.add(hand); P[side + "Hand"] = hand;
      g.add(piv); P[side + "Arm"] = piv;
    });
    // head
    const headG = new THREE.Group(); headG.position.set(0, 1.82, 0);
    headG.add(cyl(0.07, 0.08, 0.14, 0, 0, -0.24, 0, skin));
    const head = sphere(0.24, 0, 0, 0, 0, skin); head.scale.set(1, 1.05, 1); headG.add(head);
    headG.add(sphere(0.055, 0, -0.24, -0.02, 0, skin)); headG.add(sphere(0.055, 0, 0.24, -0.02, 0, skin));
    // eyes
    const eyeM = mat(0x2d2438); headG.add(sphere(0.03, 0, -0.085, 0.03, 0.215, eyeM)); headG.add(sphere(0.03, 0, 0.085, 0.03, 0.215, eyeM));
    // smile
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16, Math.PI), mat(0x7a3b3b)); smile.position.set(0, -0.08, 0.215); smile.rotation.z = Math.PI; headG.add(smile);
    // hair
    const hairM = mat(cfg.hair);
    if (cfg.curly) { for (let i = 0; i < 26; i++) { const a = Math.random() * Math.PI * 2, el = Math.random() * 1.1 + 0.25; const r = 0.22; const h = sphere(0.075 + Math.random() * 0.03, 0, r * Math.cos(el) * Math.sin(a), r * Math.sin(el) + 0.02, r * Math.cos(el) * Math.cos(a) - 0.03, hairM); headG.add(h); } }
    else { const cap = sphere(0.25, 0, 0, 0.04, -0.02, hairM); cap.scale.set(1, 0.8, 1); headG.add(cap); }
    // glasses
    if (cfg.glasses) {
      const gm = mat(0x2d2438, { roughness: 0.4 });
      const l = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 20), gm); l.position.set(-0.09, 0.03, 0.23); headG.add(l);
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 20), gm); r.position.set(0.09, 0.03, 0.23); headG.add(r);
      headG.add(box(0.05, 0.015, 0.015, 0x2d2438, 0, 0.03, 0.235, 0.005));
      const lensM = new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.25 });
      [[-0.09], [0.09]].forEach(p => { const c = new THREE.Mesh(new THREE.CircleGeometry(0.068, 16), lensM); c.position.set(p[0], 0.03, 0.232); headG.add(c); });
    }
    // outfit extras (hidden by default)
    P.cap = sphere(0.265, 0, 0, 0.05, -0.01, mat(0x2f4f8f)); P.cap.scale.set(1, 0.75, 1); P.cap.visible = false; headG.add(P.cap);
    P.mask = box(0.2, 0.11, 0.06, 0x5f8fd6, 0, -0.07, 0.22, 0.04); P.mask.visible = false; headG.add(P.mask);
    P.gown = box(0.6, 0.72, 0.4, 0x3f6f6a, 0, 1.24, 0, 0.16); P.gown.visible = false; g.add(P.gown);
    P.coat = new THREE.Group(); const coatM = mat(cfg.coat || 0xe9e9f2); const cb = box(0.58, 0.9, 0.38, 0, 0, 1.12, 0, 0.14, coatM); P.coat.add(cb); const lapel = box(0.14, 0.4, 0.05, 0xcfd3e6, 0, 1.4, 0.19, 0.04); P.coat.add(lapel); P.coat.visible = false; g.add(P.coat); P.coatMat = coatM;
    g.add(headG); P.head = headG;
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
    return { group: g, parts: P, phase: Math.random() * 6, skinColor: cfg.skin };
  }

  function setHumanOutfit(rig, outfit) {
    const P = rig.parts;
    P.coat.visible = outfit === "clinic";
    P.cap.visible = outfit === "scrubs" || outfit === "surgical";
    P.mask.visible = outfit === "scrubs" || outfit === "surgical";
    P.gown.visible = outfit === "surgical";
    const gloves = outfit === "surgical";
    P.lHand.material.color.set(gloves ? 0xbfd3ff : rig.skinColor); P.rHand.material.color.set(gloves ? 0xbfd3ff : rig.skinColor);
    const covers = outfit !== "clinic";
    P.lShoe.material.color.set(covers ? 0x5f8fd6 : 0x23222e); P.rShoe.material.color.set(covers ? 0x5f8fd6 : 0x23222e);
    // curls peek out under the cap: hide most hair when capped
    P.head.children.forEach(c => { if (c.geometry && c.geometry.type === "SphereGeometry" && c.material.color.getHex() === 0x1b1420) c.visible = !P.cap.visible; });
  }

  function animateHuman(rig, dt, moving, speedFactor = 1) {
    const P = rig.parts;
    if (moving) rig.phase += dt * 9 * speedFactor;
    else rig.phase += dt * 1.5;
    const s = moving ? Math.sin(rig.phase) : 0, bob = moving ? Math.abs(Math.sin(rig.phase)) * 0.045 : Math.sin(rig.phase) * 0.008;
    P.lLeg.rotation.x = s * 0.7; P.rLeg.rotation.x = -s * 0.7;
    P.lArm.rotation.x = -s * 0.55; P.rArm.rotation.x = s * 0.55;
    P.lArm.rotation.z = 0.1 + (moving ? 0 : Math.sin(rig.phase) * 0.02); P.rArm.rotation.z = -0.1 - (moving ? 0 : Math.sin(rig.phase) * 0.02);
    rig.group.position.y = bob;
    P.head.rotation.y = moving ? Math.sin(rig.phase * 0.5) * 0.08 : Math.sin(rig.phase * 0.7) * 0.06;
  }

  function makePet(species, color) {
    const g = new THREE.Group(); const P = { species }; const m = mat(color), dark = mat(0x2d2438), pink = mat(0xffb7c5);
    if (species === "dog" || species === "cat") {
      const cat = species === "cat";
      const body = sphere(cat ? 0.22 : 0.3, 0, 0, cat ? 0.33 : 0.46, 0, m); body.scale.set(cat ? 1.5 : 1.45, 0.9, 0.85); g.add(body); P.body = body;
      const headG = new THREE.Group(); headG.position.set(0, cat ? 0.5 : 0.68, cat ? 0.3 : 0.42);
      headG.add(sphere(cat ? 0.17 : 0.22, 0, 0, 0, 0, m));
      const muzzle = sphere(cat ? 0.09 : 0.13, 0, 0, -0.04, cat ? 0.13 : 0.18, mat(0xfff1e6)); muzzle.scale.set(1.2, 0.9, 1); headG.add(muzzle);
      headG.add(sphere(cat ? 0.03 : 0.045, 0, 0, -0.02, cat ? 0.22 : 0.3, dark));
      headG.add(sphere(0.03, 0, -0.08, 0.05, cat ? 0.14 : 0.18, dark)); headG.add(sphere(0.03, 0, 0.08, 0.05, cat ? 0.14 : 0.18, dark));
      if (cat) { const e1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 10), m); e1.position.set(-0.1, 0.18, 0); const e2 = e1.clone(); e2.position.x = 0.1; headG.add(e1, e2); const i1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 8), pink); i1.position.set(-0.1, 0.17, 0.02); const i2 = i1.clone(); i2.position.x = 0.1; headG.add(i1, i2); }
      else { const e1 = sphere(0.08, 0, -0.2, 0.02, 0, m); e1.scale.set(0.6, 1.4, 0.7); const e2 = e1.clone(); e2.position.x = 0.2; headG.add(e1, e2); }
      g.add(headG); P.head = headG;
      const legs = []; [[-0.14, 0.22], [0.14, 0.22], [-0.14, -0.22], [0.14, -0.22]].forEach(p => { const piv = new THREE.Group(); piv.position.set(p[0] * (cat ? 0.8 : 1), cat ? 0.28 : 0.38, p[1] * (cat ? 0.9 : 1.1)); piv.add(cyl(0.05, 0.05, cat ? 0.28 : 0.38, 0, 0, cat ? -0.14 : -0.19, 0, m)); piv.add(sphere(0.06, 0, 0, cat ? -0.28 : -0.38, 0.02, m)); g.add(piv); legs.push(piv); }); P.legs = legs;
      const tail = new THREE.Group(); tail.position.set(0, cat ? 0.42 : 0.6, cat ? -0.32 : -0.42);
      const t = cyl(0.03, cat ? 0.03 : 0.02, cat ? 0.45 : 0.35, 0, 0, cat ? 0.2 : 0.15, cat ? -0.1 : -0.12, m); t.rotation.x = cat ? -0.4 : -0.9; tail.add(t); g.add(tail); P.tail = tail;
      if (!cat) { const collar = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 20), mat(0xff5f7a)); collar.position.set(0, 0.6, 0.3); collar.rotation.x = Math.PI / 2 + 0.3; g.add(collar); }
    } else {
      const body = sphere(0.13, 0, 0, 0.26, 0, m); body.scale.set(0.9, 1.1, 1.3); g.add(body); P.body = body;
      const headG = new THREE.Group(); headG.position.set(0, 0.42, 0.1); headG.add(sphere(0.09, 0, 0, 0, 0, m));
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 10), mat(0xf5c542)); beak.rotation.x = Math.PI / 2; beak.position.set(0, -0.01, 0.11); headG.add(beak);
      headG.add(sphere(0.018, 0, -0.045, 0.025, 0.07, dark)); headG.add(sphere(0.018, 0, 0.045, 0.025, 0.07, dark));
      headG.add(sphere(0.03, 0, -0.045, -0.02, 0.07, mat(0xffb7a5))); headG.add(sphere(0.03, 0, 0.045, -0.02, 0.07, mat(0xffb7a5)));
      const crest = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 8), mat(0xfff3a0)); crest.position.set(0, 0.12, -0.02); crest.rotation.x = -0.5; headG.add(crest);
      g.add(headG); P.head = headG;
      const w1 = sphere(0.07, 0, -0.12, 0.27, -0.02, mat(0x7fd1c7)); w1.scale.set(0.4, 1, 1.6); const w2 = w1.clone(); w2.position.x = 0.12; g.add(w1, w2); P.wings = [w1, w2];
      const tail = box(0.08, 0.02, 0.2, 0x7fd1c7, 0, 0.22, -0.22, 0.01); tail.rotation.x = 0.3; g.add(tail); P.tail = tail;
      [-0.04, 0.04].forEach(x => { g.add(cyl(0.01, 0.01, 0.14, 0, x, 0.08, 0.02, mat(0xf5c542))); g.add(box(0.06, 0.01, 0.07, 0xf5c542, x, 0.005, 0.04, 0.005)); });
      P.legs = [];
      // carrier cage (visible while being carried)
      const cage = new THREE.Group(); const cageM = new THREE.MeshStandardMaterial({ color: 0x6b6f8f, transparent: true, opacity: 0.55 });
      cage.add(cyl(0.3, 0.3, 0.03, 0, 0, 0.0, 0, mat(0x5f8fd6))); cage.add(cyl(0.3, 0.3, 0.03, 0, 0, 0.6, 0, mat(0x5f8fd6)));
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; cage.add(cyl(0.008, 0.008, 0.6, 0, Math.cos(a) * 0.29, 0.3, Math.sin(a) * 0.29, cageM)); }
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 16), mat(0x5f8fd6)); handle.position.y = 0.68; cage.add(handle);
      cage.visible = false; g.add(cage); P.cage = cage;
    }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { group: g, parts: P, phase: Math.random() * 6, species };
  }

  function animatePet(rig, dt, moving, mood = "calm") {
    const P = rig.parts; rig.phase += dt * (moving ? 10 : 2.2) * (mood === "angry" ? 1.6 : 1);
    const s = Math.sin(rig.phase);
    if (P.legs && P.legs.length) P.legs.forEach((l, i) => l.rotation.x = moving ? s * 0.6 * (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1) : 0);
    if (P.body) P.body.scale.y = (rig.species === "bird" ? 1.1 : 0.9) + Math.sin(rig.phase * 0.6) * 0.03;
    if (P.tail) { if (rig.species === "bird") P.tail.rotation.x = 0.3 + s * 0.1; else P.tail.rotation.y = s * (mood === "angry" ? 1.0 : 0.6); }
    if (P.wings) P.wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * (mood === "angry" ? Math.abs(s) * 0.8 : 0.1));
    if (P.head) { P.head.rotation.y = Math.sin(rig.phase * 0.4) * 0.25; P.head.rotation.x = mood === "angry" ? -0.2 : Math.sin(rig.phase * 0.3) * 0.08; }
    if (mood === "angry" && P.body) rig.group.position.x += Math.sin(rig.phase * 3) * 0.002;
  }

  /* ---------- NPC movement ---------- */
  function npcUpdate(dt) {
    for (const n of npcs) {
      if (!n.path || !n.path.length) { animateHuman(n.rig, dt, false); if (n.pet) animatePet(n.pet, dt, false, n.petMood); continue; }
      const tgt = n.path[0], pos = n.rig.group.position; const dx = tgt[0] - pos.x, dz = tgt[1] - pos.z; const d = Math.hypot(dx, dz);
      const step = n.speed * dt;
      if (d < step) { pos.x = tgt[0]; pos.z = tgt[1]; n.path.shift(); if (!n.path.length && n.onArrive) { const cb = n.onArrive; n.onArrive = null; cb(); } }
      else { pos.x += dx / d * step; pos.z += dz / d * step; const ty = Math.atan2(dx, dz); n.rig.group.rotation.y = lerpAngle(n.rig.group.rotation.y, ty, Math.min(1, dt * 10)); }
      animateHuman(n.rig, dt, true, 0.9);
      if (n.pet && n.petFollow) {
        const pr = n.pet.group; const off = n.pet.species === "bird" ? [0.45, 0.0] : [0.55, 0.1];
        const ang = n.rig.group.rotation.y; const tx = pos.x + Math.cos(ang) * off[0] - Math.sin(ang) * off[1], tz = pos.z - Math.sin(ang) * off[0] - Math.cos(ang) * off[1];
        pr.position.x += (tx - pr.position.x) * Math.min(1, dt * 6); pr.position.z += (tz - pr.position.z) * Math.min(1, dt * 6);
        if (n.pet.species === "bird") { pr.position.y = 0.55 + Math.sin(n.rig.phase) * 0.02; n.pet.parts.cage.visible = true; }
        pr.rotation.y = lerpAngle(pr.rotation.y, ang, Math.min(1, dt * 6));
        animatePet(n.pet, dt, true, n.petMood);
      }
    }
  }
  function lerpAngle(a, b, t) { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; }

  /* ---------- player & collisions ---------- */
  function collide(pos, radius) {
    const all = colliders.concat(walls.filter(w => w.aabb).map(w => w.aabb));
    for (const b of all) {
      const cx = Math.max(b.minX, Math.min(pos.x, b.maxX)), cz = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
      const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < radius * radius) {
        if (d2 > 1e-6) { const d = Math.sqrt(d2); pos.x += dx / d * (radius - d); pos.z += dz / d * (radius - d); }
        else { // inside: push along least axis
          const px = Math.min(pos.x - b.minX, b.maxX - pos.x), pz = Math.min(pos.z - b.minZ, b.maxZ - pos.z);
          if (px < pz) pos.x += (pos.x - b.minX < b.maxX - pos.x ? -1 : 1) * (px + radius); else pos.z += (pos.z - b.minZ < b.maxZ - pos.z ? -1 : 1) * (pz + radius);
        }
      }
    }
    // keep inside world
    pos.x = Math.max(-28, Math.min(28, pos.x)); pos.z = Math.max(-28, Math.min(28, pos.z));
  }
  function roomAt(x, z) { for (const k in ROOMS) { const r = ROOMS[k]; if (x >= r.x[0] && x <= r.x[1] && z >= r.z[0] && z <= r.z[1]) return k; } return x > -16 && x < 16 && z < -9.5 && z > -16 ? "outside" : null; }

  /* ---------- public ---------- */
  function init(canvas) {
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x0f1222); scene.fog = new THREE.Fog(0x0f1222, 28, 55);
    camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
    const mobile = (matchMedia && matchMedia("(pointer:coarse)").matches) || Math.min(innerWidth, innerHeight) < 600;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" }); renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2)); renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = mobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding;
    const hemi = new THREE.HemisphereLight(0xdfe6ff, 0x1a1a2e, 0.85); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1c0, 0.7); sun.position.set(-12, 22, 14); sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048); sun.shadow.camera.left = -22; sun.shadow.camera.right = 22; sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22; sun.shadow.bias = -0.0008; scene.add(sun);
    buildRooms(); buildFurniture();
    player = makeHuman({ skin: 0x9a5f3a, hair: 0x1b1420, shirt: 0x2f4f8f, pants: 0x24304f, curly: true, glasses: true, coat: theme.coat });
    player.group.position.set(0, 0, -3); scene.add(player.group); setHumanOutfit(player, "clinic");
    clock = new THREE.Clock();
    const onResize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); camDist = innerWidth < innerHeight ? 1.25 : camDist; };
    window.addEventListener("resize", onResize); window.addEventListener("orientationchange", () => setTimeout(onResize, 300)); onResize();
    window.addEventListener("wheel", (e) => { camDist = Math.max(0.6, Math.min(1.6, camDist + e.deltaY * 0.0008)); }, { passive: true });
  }

  function update(input, opts) {
    const dt = Math.min(0.05, clock.getDelta());
    const pos = player.group.position; const prev = { x: pos.x, z: pos.z };
    let moving = false;
    if (!opts.frozen && (input.x || input.z)) {
      const len = Math.hypot(input.x, input.z) || 1; const sp = (input.run ? 6.2 : 4.0) * dt;
      pos.x += input.x / len * sp; pos.z += input.z / len * sp; moving = true;
      const ty = Math.atan2(input.x, input.z); player.group.rotation.y = lerpAngle(player.group.rotation.y, ty, Math.min(1, dt * 12));
    }
    collide(pos, 0.35);
    if (opts.gate && opts.gate(pos)) { pos.x = prev.x; pos.z = prev.z; }
    animateHuman(player, dt, moving, input.run ? 1.3 : 1);
    npcUpdate(dt);
    // camera follow
    const target = new THREE.Vector3(pos.x, 1.0, pos.z);
    const desired = new THREE.Vector3(pos.x, 11 * camDist + 1.5, pos.z + 9 * camDist + 1);
    camera.position.lerp(desired, Math.min(1, dt * 4)); camera.lookAt(target);
    // fade walls between camera and player
    for (const m of fadeables) { const want = (m.position.z > pos.z + 0.5 && Math.abs(m.position.x - pos.x) < 9) ? 0.14 : 1; m.material.opacity += (want - m.material.opacity) * Math.min(1, dt * 8); m.material.transparent = m.material.opacity < 0.995; m.castShadow = m.material.opacity > 0.5; }
    for (const l of labels) l.material.opacity = 0.9;
    if (ring.visible) { ring.scale.setScalar(1 + Math.sin(performance.now() * 0.005) * 0.08); }
    renderer.render(scene, camera);
    return { dt, moving, pos };
  }

  function setRing(pos) { if (!pos) { ring.visible = false; return; } ring.visible = true; ring.position.x = pos.x; ring.position.z = pos.z; }
  function addNPC(cfg) {
    const rig = makeHuman({ skin: cfg.skin, hair: cfg.hair, shirt: cfg.shirt, pants: cfg.pants, curly: cfg.curly, glasses: cfg.glasses });
    rig.group.position.set(cfg.x, 0, cfg.z); scene.add(rig.group);
    let pet = null; if (cfg.pet) { pet = makePet(cfg.pet.species, cfg.pet.color); pet.group.position.set(cfg.x + 0.6, 0, cfg.z); scene.add(pet.group); }
    const n = { rig, pet, petFollow: true, path: [], speed: 2.4, onArrive: null, petMood: "calm" }; npcs.push(n); return n;
  }
  function removeNPC(n) { const i = npcs.indexOf(n); if (i >= 0) npcs.splice(i, 1); scene.remove(n.rig.group); if (n.pet) scene.remove(n.pet.group); }
  function placePet(n, x, y, z, rotY = 0) { n.petFollow = false; n.pet.group.position.set(x, y, z); n.pet.group.rotation.y = rotY; if (n.pet.parts.cage) n.pet.parts.cage.visible = false; }
  function playerPos() { return player.group.position; }
  function applyTheme(t) {
    Object.assign(theme, t);
    themeMats.wallClones.forEach(m => m.color.set(theme.wall)); themeMats.wall.color.set(theme.wall);
    themeMats.accent.forEach(m => m.color.set(theme.accent)); themeMats.trim.forEach(m => m.color.set(theme.trim));
    if (t.floor) { for (const k in themeMats.floors) if (k !== "corridor") themeMats.floors[k].color.set(t.floor); }
    if (t.coat && player) player.parts.coatMat.color.set(t.coat);
    scene.traverse(o => { if (o.userData && o.userData.decor) o.visible = theme.decor !== false; });
  }
  function setSign(text) { if (signSprite) signSprite.userData.setText(text.toUpperCase()); }

  return { init, update, setRing, addNPC, removeNPC, placePet, playerPos, applyTheme, setSign, setOutfit: (o) => setHumanOutfit(player, o), roomAt, props, animatePet, npcs, get player() { return player; }, get camera() { return camera; }, get scene() { return scene; } };
})();
