/* ============================================================
   Cartoon-but-accurate SVG diagrams: instruments & skeletons
   ============================================================ */

const INK = "#5b5470", STEEL = "#b8c4d6", STEEL2 = "#8e9bb3", BONE = "#fff6e5", BONE2 = "#e3cfae";

function toolSVG(key, w = 120, h = 48) {
  const s = (inner) => `<svg class="toolsvg" viewBox="0 0 120 48" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const rings = `<circle cx="14" cy="16" r="8" fill="none" stroke="${STEEL2}" stroke-width="3.5"/><circle cx="14" cy="32" r="8" fill="none" stroke="${STEEL2}" stroke-width="3.5"/>`;
  const shanks = `<path d="M20 18 L62 26" stroke="${STEEL}" stroke-width="4" stroke-linecap="round"/><path d="M20 30 L62 22" stroke="${STEEL}" stroke-width="4" stroke-linecap="round"/><circle cx="62" cy="24" r="2.6" fill="${INK}"/>`;
  const ratchet = `<path d="M22 21 L22 27 M25 20 L25 28" stroke="${INK}" stroke-width="1.6"/>`;
  const ringed = (jaws, extra = "") => s(rings + shanks + ratchet + jaws + extra);
  switch (key) {
    case "scalpel": return s(`<rect x="8" y="19" width="70" height="10" rx="5" fill="${STEEL}"/><path d="M78 20 L112 24 L78 29 Z" fill="#e9eef7" stroke="${STEEL2}" stroke-width="1.5" stroke-linejoin="round"/><text x="30" y="27" font-size="6" fill="${INK}" font-family="sans-serif">No. 3</text>`);
    case "metz": return ringed(`<path d="M62 24 L112 16" stroke="${STEEL}" stroke-width="3" stroke-linecap="round"/><path d="M62 24 L112 32" stroke="${STEEL}" stroke-width="3" stroke-linecap="round"/>`).replace('class="toolsvg"', 'class="toolsvg"') ;
    case "mayo": return ringed(`<path d="M62 24 L104 14" stroke="${STEEL}" stroke-width="5.5" stroke-linecap="round"/><path d="M62 24 L104 34" stroke="${STEEL}" stroke-width="5.5" stroke-linecap="round"/>`);
    case "kelly": return ringed(`<path d="M62 24 L108 20" stroke="${STEEL}" stroke-width="4" stroke-linecap="round"/><path d="M62 24 L108 28" stroke="${STEEL}" stroke-width="4" stroke-linecap="round"/><path d="M88 20 L88 28 M94 20 L94 28 M100 21 L100 27" stroke="${INK}" stroke-width="1"/>`);
    case "carmalt": return ringed(`<path d="M62 24 L114 19" stroke="${STEEL}" stroke-width="5" stroke-linecap="round"/><path d="M62 24 L114 29" stroke="${STEEL}" stroke-width="5" stroke-linecap="round"/><path d="M70 23 L112 20 M70 25 L112 28" stroke="${INK}" stroke-width="0.8"/>`);
    case "allis": return ringed(`<path d="M62 24 L100 20 L108 22" stroke="${STEEL}" stroke-width="3.5" stroke-linecap="round" fill="none"/><path d="M62 24 L100 28 L108 26" stroke="${STEEL}" stroke-width="3.5" stroke-linecap="round" fill="none"/><path d="M104 21 l2 2 l2 -2 M104 27 l2 -2 l2 2" stroke="${INK}" stroke-width="1.2" fill="none"/>`);
    case "needle": return ringed(`<path d="M62 24 L90 21" stroke="${STEEL}" stroke-width="5" stroke-linecap="round"/><path d="M62 24 L90 27" stroke="${STEEL}" stroke-width="5" stroke-linecap="round"/><path d="M92 14 q10 10 0 20" stroke="${INK}" stroke-width="1.6" fill="none"/>`);
    case "towel": return ringed(`<path d="M62 24 Q90 14 108 30" stroke="${STEEL}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M62 24 Q90 34 108 18" stroke="${STEEL}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    case "adson": return s(`<path d="M8 24 L100 14 L108 18" stroke="${STEEL}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M8 24 L100 34 L108 30" stroke="${STEEL}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M8 20 L8 28" stroke="${STEEL2}" stroke-width="3"/>`);
    case "snook": return s(`<rect x="8" y="20" width="60" height="8" rx="4" fill="${STEEL2}"/><path d="M68 24 L100 24 Q112 24 112 14" stroke="${STEEL}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
    case "balfour": return s(`<rect x="20" y="10" width="80" height="6" rx="3" fill="${STEEL}"/><path d="M30 16 L30 30 Q30 40 42 40 L50 40" stroke="${STEEL}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M90 16 L90 30 Q90 40 78 40 L70 40" stroke="${STEEL}" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="56" y="6" width="8" height="14" rx="2" fill="${INK}"/>`);
    case "absorb": case "nylon": {
      const col = key === "absorb" ? "#c9a7f5" : "#7fd1c7";
      return s(`<rect x="10" y="8" width="70" height="32" rx="6" fill="${col}"/><rect x="16" y="14" width="40" height="8" rx="3" fill="#fff" opacity=".7"/><text x="18" y="35" font-size="7" fill="${INK}" font-family="sans-serif">${key === "absorb" ? "3-0 PDS" : "3-0 nylon"}</text><path d="M86 34 q10 -24 24 -6" stroke="${INK}" stroke-width="2" fill="none"/><path d="M86 34 q-4 4 2 8" stroke="${col}" stroke-width="1.5" fill="none"/>`);
    }
    case "gauze": return s(`<rect x="20" y="12" width="40" height="30" rx="4" fill="#fff" stroke="#d8d4e8" stroke-width="2"/><rect x="28" y="6" width="40" height="30" rx="4" fill="#fff" stroke="#d8d4e8" stroke-width="2"/><path d="M34 12 L62 12 M34 20 L62 20 M34 28 L62 28" stroke="#ebe8f5" stroke-width="2"/><text x="78" y="28" font-size="8" fill="${INK}" font-family="sans-serif">×10</text>`);
    case "suction": return s(`<path d="M8 36 Q30 36 40 24 L100 24" stroke="${STEEL}" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="96" y="18" width="18" height="12" rx="6" fill="${STEEL2}"/><circle cx="102" cy="21" r="1.2" fill="#fff"/><circle cx="108" cy="21" r="1.2" fill="#fff"/><circle cx="105" cy="27" r="1.2" fill="#fff"/>`);
    case "cautery": return s(`<path d="M6 40 Q20 44 30 30" stroke="${INK}" stroke-width="2" fill="none"/><rect x="28" y="18" width="60" height="14" rx="7" fill="#9fd7ff"/><rect x="50" y="21" width="10" height="4" rx="2" fill="#2d6fb0"/><rect x="60" y="21" width="10" height="4" rx="2" fill="#f2b84b"/><path d="M88 25 L108 25" stroke="${STEEL2}" stroke-width="3" stroke-linecap="round"/><path d="M108 25 L113 22" stroke="${STEEL2}" stroke-width="2" stroke-linecap="round"/>`);
    case "saline": return s(`<rect x="40" y="10" width="40" height="34" rx="8" fill="#d6ecff" stroke="#9fc5ea" stroke-width="2"/><rect x="52" y="4" width="16" height="10" rx="3" fill="#9fc5ea"/><text x="46" y="31" font-size="7" fill="${INK}" font-family="sans-serif">NaCl 0.9%</text>`);
    case "chx": return s(`<rect x="40" y="10" width="40" height="34" rx="8" fill="#ffd1dc" stroke="#e59bb0" stroke-width="2"/><rect x="52" y="4" width="16" height="10" rx="3" fill="#e59bb0"/><text x="52" y="31" font-size="7" fill="${INK}" font-family="sans-serif">CHX 4%</text>`);
    case "bandage": return s(`<rect x="30" y="12" width="60" height="26" rx="13" fill="#fff" stroke="#d8d4e8" stroke-width="2"/><ellipse cx="90" cy="25" rx="8" ry="13" fill="#f3f1fa" stroke="#d8d4e8" stroke-width="2"/><ellipse cx="90" cy="25" rx="3" ry="6" fill="#d8d4e8"/>`);
    case "clipper": return s(`<rect x="20" y="16" width="64" height="16" rx="8" fill="#ffb7a5"/><path d="M84 18 L104 18 L104 30 L84 30 Z" fill="${STEEL}"/><path d="M104 18 L108 20 L104 22 L108 24 L104 26 L108 28 L104 30" stroke="${INK}" stroke-width="1" fill="none"/><path d="M6 24 L20 24" stroke="${INK}" stroke-width="2"/>`);
    case "ettube": return s(`<path d="M10 14 Q60 10 100 34" stroke="#d6ecff" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M10 14 Q60 10 100 34" stroke="#9fc5ea" stroke-width="1" fill="none" opacity=".6"/><ellipse cx="86" cy="26" rx="10" ry="7" fill="#d6ecff" stroke="#9fc5ea" stroke-width="1.5" opacity=".9"/><rect x="4" y="9" width="10" height="10" rx="3" fill="#9fc5ea"/>`);
    case "ivcath": return s(`<rect x="20" y="20" width="26" height="10" rx="4" fill="#ffd1dc"/><path d="M46 25 L108 25" stroke="#d6ecff" stroke-width="3.5" stroke-linecap="round"/><path d="M8 25 L20 25" stroke="#e59bb0" stroke-width="4" stroke-linecap="round"/>`);
    case "lary": return s(`<rect x="20" y="22" width="16" height="22" rx="6" fill="${INK}"/><path d="M28 22 L28 10 Q28 6 32 6 L96 6" stroke="${STEEL}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="92" cy="12" r="3" fill="#fff3a0"/>`);
    case "pulseox": return s(`<path d="M6 40 Q30 44 40 28" stroke="${INK}" stroke-width="2" fill="none"/><rect x="40" y="16" width="44" height="12" rx="6" fill="#9fd7ff"/><rect x="40" y="28" width="44" height="12" rx="6" fill="#6fb6e8"/><circle cx="76" cy="22" r="2.5" fill="#ff5f5f"/>`);
    case "ecollar": return s(`<path d="M40 44 L80 44 L104 10 L16 10 Z" fill="#e6f7ff" stroke="#9fc5ea" stroke-width="2" stroke-linejoin="round"/><ellipse cx="60" cy="44" rx="20" ry="4" fill="#9fc5ea"/>`);
    default: return s(`<rect x="10" y="10" width="100" height="28" rx="10" fill="#eee"/>`);
  }
}

/* ---------------- Skeletons ---------------- */
function skeletonSVG(species, finding, w = 480, h = 320) {
  const parts = [];
  const B = (name, inner) => parts.push(`<g class="bone" data-bone="${name}">${inner}</g>`);
  const line = (x1, y1, x2, y2, sw) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BONE}" stroke-width="${sw}" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BONE2}" stroke-width="${sw}" stroke-linecap="round" fill="none" opacity=".35"/>`;
  const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${BONE}" stroke="${BONE2}" stroke-width="1"/>`;
  const rect = (x, y, w2, h2, r) => `<rect x="${x}" y="${y}" width="${w2}" height="${h2}" rx="${r}" fill="${BONE}" stroke="${BONE2}" stroke-width="1"/>`;
  const poly = (pts) => `<polygon points="${pts}" fill="${BONE}" stroke="${BONE2}" stroke-width="1" stroke-linejoin="round"/>`;
  const path = (d, sw = 3, fill = "none") => `<path d="${d}" stroke="${BONE}" stroke-width="${sw}" fill="${fill}" stroke-linecap="round"/>`;
  const spine = (label, abbrev, pts, size) => pts.forEach((p, i) => B(`${label} ${abbrev}${i + 1}`, rect(p[0] - size / 2, p[1] - size / 2, size, size, size / 3)));
  const lerpPts = (a, b, n) => Array.from({ length: n }, (_, i) => [a[0] + (b[0] - a[0]) * (i / (n - 1 || 1)), a[1] + (b[1] - a[1]) * (i / (n - 1 || 1))]);
  let overlay = "";

  if (species !== "bird") {
    const cat = species === "cat" || species === "rabbit";
    // skull
    B("Skull (cranium)", `<ellipse cx="${cat ? 78 : 72}" cy="72" rx="${cat ? 24 : 30}" ry="${cat ? 21 : 22}" fill="${BONE}" stroke="${BONE2}" stroke-width="1"/>`);
    B("Maxilla (upper jaw)", cat ? poly("56,76 40,80 42,90 60,90") : poly("46,74 18,80 20,92 50,92"));
    B("Orbit", `<circle cx="${cat ? 70 : 60}" cy="70" r="7" fill="#efe4d0" stroke="${BONE2}"/>`);
    B("Mandible (lower jaw)", cat ? path("M42 92 L82 94 L90 86", 5) : path("M22 96 L84 97 L92 88", 5));
    B("Tympanic bulla", dot(cat ? 96 : 96, 86, 5));
    // spine
    spine("Cervical vertebra", "C", lerpPts([108, 72], [150, 58], 7), 7);
    spine("Thoracic vertebra", "T", lerpPts([158, 56], [236, 60], 13), 6.5);
    spine("Lumbar vertebra", "L", lerpPts([246, 62], [290, 66], 7), 7.5);
    B("Sacrum", rect(295, 62, 16, 9, 3));
    const tail = cat ? lerpPts([312, 70], [372, 150], 12) : lerpPts([312, 70], [352, 128], 8);
    tail.forEach((p, i) => B(`Caudal vertebra Ca${i + 1}`, dot(p[0], p[1], 3.2 - i * 0.12)));
    // ribs & sternum
    const tpts = lerpPts([158, 56], [236, 60], 13);
    tpts.forEach((p, i) => B(`Rib ${i + 1}${i >= 9 ? " (asternal / floating)" : ""}`, path(`M${p[0]} ${p[1] + 4} Q${p[0] + 14} ${p[1] + 50} ${p[0] - 2 + i * 1.2} ${145 - Math.abs(i - 6) * 3}`, 2.6)));
    const stern = lerpPts([158, 150], [218, 142], 8);
    stern.forEach((p, i) => B(i === 0 ? "Manubrium (1st sternebra)" : i === 7 ? "Xiphoid process" : `Sternebra ${i + 1}`, rect(p[0] - 4, p[1] - 3, 8, 6, 2)));
    // forelimb
    B("Scapula", poly("150,66 176,72 168,118 158,124"));
    if (cat) B("Clavicle (vestigial — cats only)", rect(146, 106, 12, 3, 1.5));
    B("Humerus", line(165, 120, 150, 166, 8));
    B("Radius", line(150, 166, 146, 206, 5));
    B("Ulna", line(158, 160, 152, 206, 4));
    B("Carpal bones (carpus)", dot(146, 208, 4) + dot(153, 209, 3.5));
    B("Metacarpal bones", line(148, 212, 146, 226, 5));
    B("Phalanges (digits)", line(146, 227, 142, 236, 4) + line(150, 227, 152, 236, 4));
    // hindlimb
    B("Pelvis — ilium", poly("292,62 312,70 306,96 288,92"));
    B("Pelvis — ischium", poly("306,96 322,100 320,110 300,108"));
    B("Pelvis — pubis", rect(296, 100, 8, 8, 3));
    B("Femur", line(300, 108, 282, 160, 8));
    B("Patella (kneecap)", dot(276, 160, 4));
    B("Tibia", line(282, 162, 300, 206, 6));
    B("Fibula", line(288, 164, 304, 204, 3));
    B("Tarsal bones (tarsus) — incl. calcaneus", dot(302, 208, 4) + dot(309, 204, 3.5));
    B("Metatarsal bones", line(303, 212, 300, 226, 5));
    B("Phalanges (digits)", line(300, 227, 296, 236, 4) + line(304, 227, 306, 236, 4));
    // findings
    if (finding === "fracture_radius") overlay = `<path d="M148 184 l6 3 l-6 3" stroke="#ff5f7a" stroke-width="2.5" fill="none"/><path d="M155 182 l5 3 l-5 3" stroke="#ff5f7a" stroke-width="2" fill="none"/><circle cx="151" cy="186" r="16" fill="none" stroke="#ff5f7a" stroke-dasharray="4 3" stroke-width="1.5"/>`;
    if (finding === "fracture_femur") overlay = `<path d="M296 128 l-8 10" stroke="#ff5f7a" stroke-width="2.5"/><circle cx="292" cy="133" r="16" fill="none" stroke="#ff5f7a" stroke-dasharray="4 3" stroke-width="1.5"/>`;
    if (finding === "bladder_stones") overlay = `<ellipse cx="268" cy="150" rx="26" ry="18" fill="#cfc7e6" opacity=".3"/>${[[-10,-4],[2,-8],[8,4],[-4,6],[12,-2]].map(p=>`<circle cx="${268+p[0]}" cy="${150+p[1]}" r="4" fill="#fff" stroke="#ff5f7a" stroke-width="1.5"/>`).join("")}<text x="250" y="178" font-size="9" fill="#ff5f7a" font-family="sans-serif">calculi</text>`;
    if (finding === "foreign_body") overlay = `<ellipse cx="226" cy="118" rx="42" ry="26" fill="#cfc7e6" opacity=".35"/><circle cx="222" cy="120" r="9" fill="#f5f0ff" stroke="#ff5f7a" stroke-width="2.5"/><text x="214" y="124" font-size="9" fill="#ff5f7a" font-family="sans-serif">FB</text>`;
  } else {
    // bird (lateral)
    B("Skull (cranium)", `<ellipse cx="78" cy="62" rx="20" ry="17" fill="${BONE}" stroke="${BONE2}"/>`);
    B("Orbit (very large in birds)", `<circle cx="72" cy="60" r="8" fill="#efe4d0" stroke="${BONE2}"/>`);
    B("Upper beak (premaxilla / rhinotheca)", poly("60,62 36,70 60,72"));
    B("Lower beak (mandible / gnathotheca)", poly("60,74 42,76 60,80"));
    const cerv = [[96, 70], [104, 80], [108, 92], [108, 104], [112, 116], [120, 124], [130, 128], [142, 128]];
    cerv.forEach((p, i) => B(`Cervical vertebra C${i + 1}`, dot(p[0], p[1], 3.4)));
    B("Thoracic vertebrae (notarium — fused)", rect(150, 122, 34, 8, 4));
    B("Synsacrum (fused lumbar, sacral & caudal vertebrae)", poly("186,120 236,116 246,130 232,142 190,138"));
    B("Free caudal vertebrae", dot(252, 128, 3) + dot(259, 131, 3));
    B("Pygostyle (tail bones — fused)", poly("264,128 284,134 282,142 266,138"));
    // thorax
    B("Furcula (wishbone — fused clavicles)", path("M150 136 Q146 160 160 176 Q174 160 170 136", 3.5));
    B("Coracoid", line(166, 136, 182, 166, 4));
    B("Scapula (long, blade-like)", line(160, 134, 212, 126, 3.5));
    for (let i = 0; i < 6; i++) {
      const x = 170 + i * 10;
      B(`Rib ${i + 1} with uncinate process`, path(`M${x} 134 Q${x + 14} 160 ${x + 6} 182`, 2.4) + path(`M${x + 9} 154 l8 -4`, 1.8));
    }
    B("Sternum with keel (carina)", poly("176,166 232,164 240,174 220,208 188,214 170,190"));
    // wing
    B("Humerus", line(162, 126, 190, 92, 6));
    B("Radius", line(190, 92, 232, 100, 3.5));
    B("Ulna (secondary feathers attach here)", line(192, 98, 232, 106, 4.5));
    B("Carpometacarpus (fused wrist & hand)", line(234, 103, 258, 110, 5));
    B("Alular digit (thumb)", line(240, 100, 250, 94, 2.5));
    B("Major digit", line(258, 110, 272, 112, 3));
    // leg
    B("Femur", line(214, 136, 198, 172, 5));
    B("Tibiotarsus (fused tibia + proximal tarsals)", line(198, 174, 212, 224, 5));
    B("Fibula (splint-like)", line(202, 176, 212, 206, 2));
    B("Tarsometatarsus (fused distal tarsals + metatarsals)", line(212, 226, 216, 258, 4.5));
    B("Digits (I–IV, zygodactyl in parrots)", line(216, 260, 200, 274, 3) + line(216, 260, 232, 274, 3) + line(216, 260, 206, 266, 2.5) + line(216, 260, 228, 266, 2.5));
    if (finding === "fracture_humerus") overlay = `<path d="M182 100 l6 4" stroke="#ff5f7a" stroke-width="2.5"/><circle cx="184" cy="101" r="14" fill="none" stroke="#ff5f7a" stroke-dasharray="4 3" stroke-width="1.5"/>`;
  }
  return `<svg class="xray" viewBox="0 0 390 290" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="xrbg" cx="50%" cy="50%"><stop offset="0" stop-color="#2d3350"/><stop offset="1" stop-color="#171a2b"/></radialGradient></defs><rect width="390" height="290" rx="18" fill="url(#xrbg)"/>${parts.join("")}${overlay}</svg>`;
}

/* Attach hover labels inside a container that holds a skeletonSVG */
function wireXrayHover(container, labelEl) {
  container.addEventListener("mousemove", (e) => {
    const g = e.target.closest(".bone");
    if (g) { labelEl.textContent = g.dataset.bone; labelEl.style.opacity = 1; labelEl.style.left = (e.clientX + 14) + "px"; labelEl.style.top = (e.clientY - 10) + "px"; }
    else labelEl.style.opacity = 0;
  });
  container.addEventListener("mouseleave", () => labelEl.style.opacity = 0);
  container.addEventListener("click", (e) => { const g = e.target.closest(".bone"); if (g) { labelEl.textContent = g.dataset.bone; labelEl.style.opacity = 1; labelEl.style.left = (e.clientX + 14) + "px"; labelEl.style.top = (e.clientY - 10) + "px"; } });
}

/* ---------------- UI line icons (24px grid, stroke = currentColor) ---------------- */
const ICON_PATHS = {
  bell: '<path d="M5 15a7 7 0 0 1 14 0z"/><path d="M12 8V5"/><path d="M4 18.5h16"/>',
  steth: '<path d="M6 4v6a5 5 0 0 0 10 0V4"/><path d="M11 15v2a4 4 0 0 0 8 0v-3"/><circle cx="19" cy="11" r="2"/>',
  xray: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M12 7v10M8.5 10h7M9.5 13h5M10 16h4"/>',
  scalpel: '<path d="M4 20l8-8"/><path d="M12 12l8-8-1.5 6L13 13z"/>',
  sink: '<path d="M4 12h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M12 12V6a2 2 0 0 1 4 0"/>',
  locker: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 3v18M9 10v2M15 10v2"/>',
  shop: '<path d="M4 9l1.5-4h13L20 9"/><path d="M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 13h6"/>',
  office: '<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M8 21h8M12 16v5"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h12"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 21h8M10 17h4"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  paw: '<circle cx="12" cy="15.5" r="3.6"/><circle cx="6.8" cy="10.5" r="1.7"/><circle cx="17.2" cy="10.5" r="1.7"/><circle cx="9.4" cy="6.6" r="1.7"/><circle cx="14.6" cy="6.6" r="1.7"/>',
  warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5h.01"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/>',
  bed: '<path d="M3 18V8M3 13h18v5M7 13v-3h6v3M21 18v-3"/>',
  monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M6 11h3l2-3 2 6 2-3h3"/><path d="M9 21h6"/>',
  tray: '<path d="M3 11h18l-2 7H5z"/><path d="M8 11V8M12 11V7M16 11V8"/>',
  print: '<path d="M7 8V4h10v4"/><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  cap: '<path d="M4 13a8 8 0 0 1 16 0z"/><path d="M4 13h16v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 15.5z"/>',
  coat: '<path d="M8 3l4 3 4-3 4 3-1 6h-2v9H7v-9H5L4 6z"/><path d="M12 6v15"/>',
  glove: '<path d="M8 21v-7l-3-5a1.5 1.5 0 0 1 2.6-1.5L9 10V4a1.5 1.5 0 0 1 3 0v4V3a1.5 1.5 0 0 1 3 0v5V5a1.5 1.5 0 0 1 3 0v10a6 6 0 0 1-6 6z"/>',
  block: '<circle cx="12" cy="12" r="8"/><path d="M6.5 6.5l11 11"/>',
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5"/><path d="M12 17h.01"/>',
  sound: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  mute: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M17 9l4 6M21 9l-4 6"/>',
  dog: '<path d="M7 9a5 5 0 0 1 10 0v4.5a5 5 0 0 1-10 0z"/><path d="M7 9L4 14l3 .8M17 9l3 5-3 .8"/><circle cx="10" cy="11.5" r=".9" fill="currentColor" stroke="none"/><circle cx="14" cy="11.5" r=".9" fill="currentColor" stroke="none"/><path d="M11 15.5h2l-1 1.2z" fill="currentColor"/>',
  cat: '<path d="M6 13a6 6 0 0 0 12 0V6.5L15 9H9L6 6.5z"/><circle cx="10" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="14" cy="12" r=".9" fill="currentColor" stroke="none"/><path d="M3 12.5h3M18 12.5h3M11 15h2l-1 1z"/>',
  bird: '<circle cx="12.5" cy="11.5" r="6"/><path d="M18.5 11.5l3.5 1-3.5 1"/><circle cx="14" cy="9.5" r=".9" fill="currentColor" stroke="none"/><path d="M10 5.8c-.5-2 1-3.3 2.5-3.3"/><path d="M11 17.5l-1 3M14 17.5l1 3"/>',
  bowl: '<path d="M4 12h16a8 8 0 0 1-16 0z"/><path d="M8 12V9.5M12 12V8M16 12V9.5"/>',
  drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  pill: '<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M9.9 9.9l4.2 4.2"/>',
  ring: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  bottle: '<path d="M10 3h4v3l2 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z"/><path d="M8 13h8"/>',
  basket: '<path d="M4 10h16l-2 10H6z"/><path d="M8 10l2.5-6M16 10l-2.5-6M9 14v3M15 14v3"/>',
  brush: '<path d="M5 19l5.5-5.5"/><rect x="10" y="3.5" width="10" height="9" rx="2.5" transform="rotate(45 15 8)"/>',
  bone: '<path d="M7 7a2 2 0 1 1 3 2.2l4.8 4.8A2 2 0 1 1 17 17a2 2 0 1 1-3-2.2L9.2 10A2 2 0 1 1 7 7z"/>',
  leaf: '<path d="M4 20c0-8 6-14 16-16-2 10-8 16-16 16z"/><path d="M4 20L14 10"/>',
  fish: '<path d="M3 12c4-5 10-5 14 0-4 5-10 5-14 0z"/><path d="M17 12l4-3v6z"/><circle cx="7" cy="11.5" r=".8" fill="currentColor" stroke="none"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2v-1a2 2 0 0 1 2-2h1.5A3.5 3.5 0 0 0 21 12.5 9 9 0 0 0 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15.5" cy="7.5" r="1.2"/>',
  door: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M15 12h.01"/>',
  hand: '<path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-12 0v-3a1.5 1.5 0 0 1 3 0v1.5"/>',
  party: '<path d="M5 20l3-9 6 6z"/><path d="M11 5l1-2M15 8l2-1M14 4l3-1M19 12l2 .5M17 15l2 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  rabbit: '<path d="M8 13a4 4 0 0 0 8 0 4 4 0 0 0-8 0z"/><path d="M9.5 9.5C8 7 8 3 9.5 3s2 3 2 6M14.5 9.5c1.5-2.5 1.5-6.5 0-6.5s-2 3-2 6"/><circle cx="10.5" cy="12.5" r=".8" fill="currentColor" stroke="none"/><circle cx="13.5" cy="12.5" r=".8" fill="currentColor" stroke="none"/><path d="M12 14.5v1M6 19h12"/>',
  tortoise: '<path d="M5 14a7 5 0 0 1 14 0z"/><path d="M5 14h14M8 14l-1 3M16 14l1 3M12 14v3"/><path d="M19 13h2a1.5 1.5 0 0 1 0 3h-1"/><path d="M8 11l1.5-2M12 10V8M16 11l-1.5-2"/>',
  van: '<path d="M3 16V8h11l4 4h3v4"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>',
  camera: '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.9l7.6-4.4M8.2 13.1l7.6 4.4"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9.5 9.5h3.5a1.75 1.75 0 0 1 0 3.5H9.5h4a1.75 1.75 0 0 1 0 3.5H9.5"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
  tooth: '<path d="M7 3c2 0 3 1 5 1s3-1 5-1c2.5 0 3.5 2.5 2.5 6-.8 2.6-1.5 7-2.5 11-.3 1.2-1.8 1.2-2.2 0L13.5 15h-3l-1.3 5c-.4 1.2-1.9 1.2-2.2 0C6 16 5.3 11.6 4.5 9 3.5 5.5 4.5 3 7 3z"/>',
  drug: '<path d="M4 20l8-8"/><rect x="10" y="2" width="12" height="7" rx="3.5" transform="rotate(45 16 5.5)"/><path d="M14 8l2 2"/>',
  tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7" cy="8" r="1.2" fill="currentColor" stroke="none"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
function icon(name, size = 20, cls = "") {
  const d = ICON_PATHS[name] || ICON_PATHS.paw;
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
