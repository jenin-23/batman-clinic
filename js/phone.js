/* =====================================================================
   Batman Clinic — phone (messages, gallery, clinic feed), pet walks,
   the pharmacist's dose drafts and staff behaviour helpers.
   ===================================================================== */

/* ---------------- phone state ---------------- */
function phoneState() {
  const s = G.s;
  if (!s.phone || typeof s.phone !== "object") s.phone = {};
  const P = s.phone;
  const def = { threads: [], unread: 0, gallery: [], feed: [], followers: 24, lastWifeDay: 0, lastMidDay: 0, lastPhotoDay: -99, lastAdDay: 0, pending: [], milestones: [], discountDay: -1, lastPostRepDay: 0, wifeName: "Habibti", seq: 1 };
  for (const k in def) if (P[k] === undefined) P[k] = def[k];
  if (!P.threads.find(t => t.id === "wife")) P.threads.unshift({ id: "wife", name: P.wifeName, kind: "wife", msgs: [] });
  return P;
}
function fillText(t, extra) { const s = G.s; if (extra) t = String(t).replace(/\{(\w+)\}/g, (m, k) => extra[k] !== undefined ? extra[k] : m); return String(t).replace(/\{pet\}/g, s.clinicPet ? s.clinicPet.name : "Mishmish").replace(/\{dr\}/g, (s.doctor && s.doctor.name) || "Ahmad").replace(/\{clinic\}/g, s.clinicName || "Batman Clinic").replace(/\{(\w+)\}/g, (m, k) => (extra && extra[k] !== undefined) ? extra[k] : m); }
function thread(id, name, kind) { const P = phoneState(); let t = P.threads.find(x => x.id === id); if (!t) { t = { id, name, kind: kind || "client", msgs: [] }; P.threads.push(t); } return t; }
function pushMsg(id, name, kind, msg, quiet) {
  const P = phoneState(); const t = thread(id, name, kind);
  msg.time = clockStr(); msg.day = G.s.day; msg.from = msg.from || "them"; t.msgs.push(msg); if (t.msgs.length > 40) t.msgs.splice(0, t.msgs.length - 40);
  t.updated = P.seq++;
  if (msg.from === "them") { t.unread = (t.unread || 0) + 1; P.unread = P.threads.reduce((a, x) => a + (x.unread || 0), 0); if (!quiet) { try { Sound.vibrate(30); Sound.beep(); } catch (e) { } toast(`${icon("phone", 16)} <b>${t.name}</b>: ${String(msg.text).slice(0, 60)}${msg.text.length > 60 ? "…" : ""}`, "info", 3200); } }
  updatePhoneBadge(); save();
}
function updatePhoneBadge() { const P = G.s && G.s.phone; const n = P ? P.unread : 0; const b = $("#phoneBadge"); if (b) { b.textContent = n; b.style.display = n ? "" : "none"; } const g = $("#gearBtn"); if (g) g.classList.toggle("hasdot", !!n); }

/* ---------------- daily phone events ---------------- */
function phoneDaily() {
  const P = phoneState(), s = G.s;
  if (P.lastWifeDay !== s.day) { P.lastWifeDay = s.day; const pool = PHONE.wifeMorning; const m = pool[(s.day * 7 + 3) % pool.length]; setTimeout(() => wifeSays(m), 4000); }
  const due = P.pending.filter(x => x.due <= s.day);
  if (due.length && s.day - P.lastPhotoDay >= 3) { const x = due[0]; P.pending = P.pending.filter(y => y !== x); P.lastPhotoDay = s.day; setTimeout(() => clientPhoto(x), 9000); }
  P.pending = P.pending.filter(x => s.day - x.due < 6);
  if (s.day >= 3 && s.day - P.lastAdDay >= 5) { P.lastAdDay = s.day; const ad = PHONE.ads[(s.day / 5 | 0) % PHONE.ads.length]; setTimeout(() => pushMsg("ads", "Offers", "ads", { text: `<b>${ad.from}</b> — ${ad.t}`, ad: ad.id, plain: `${ad.from}: ${ad.t}` }, false), 15000); }
  // followers drift and old posts gather likes
  P.feed.forEach(f => { if (s.day - f.day <= 3) { f.likes += Math.round(P.followers * rnd(0.05, 0.15)); if (Math.random() < 0.5) f.comments.push(pick(PHONE.comments)); } });
}
function wifeSays(m) { const P = phoneState(); pushMsg("wife", P.wifeName, "wife", { text: fillText(m.t), replies: m.r.map(x => fillText(x)), answers: m.a.map(x => fillText(x)), img: m.img ? drawWifePhoto(m.img) : null }); }
function phoneTick(dt) {
  const s = G.s; if (!s.shiftActive) return; const P = phoneState();
  if (s.clockMin >= 13 * 60 && P.lastMidDay !== s.day) { P.lastMidDay = s.day; if (Math.random() < 0.45) { const m = pick(PHONE.wifeMid); wifeSays(m); } }
  if (s.energy < 18 && !P.milestones.includes("tired" + s.day)) { P.milestones.push("tired" + s.day); pushMsg("wife", P.wifeName, "wife", { text: fillText(PHONE.milestones.tired), replies: ["Almost done ❤️", "Coming home soon"], answers: ["❤️", "Drive safe"] }); }
}
function phoneMilestone(key, n) { const P = phoneState(); const k = key + (n || ""); if (P.milestones.includes(k)) return; P.milestones.push(k); setTimeout(() => pushMsg("wife", P.wifeName, "wife", { text: fillText(PHONE.milestones[key], { n }), replies: ["❤️", "Thank you habibti"], answers: ["😘", "Dinner's on me tonight 🎉"] }), 2500); }
function scheduleClientPhoto(p) {
  if (!p || p.stray || !p.caseDef || !p.caseDef.procedure) return; const P = phoneState(); if (P.pending.length >= 3) return;
  const col = p.npcCfg && p.npcCfg.pet ? p.npcCfg.pet.color : 0xb07a4a;
  P.pending.push({ due: G.s.day + 1, owner: p.ownerName, pet: p.name, species: p.species, color: typeof col === "number" ? "#" + col.toString(16).padStart(6, "0") : col, proc: p.caseDef.procedure });
}
function clientPhoto(x) { const url = petPhotoSVG(x.species, x.color, { cone: !["hoof", "robert_jones"].includes(x.proc), bandage: x.proc === "robert_jones" || x.proc === "laceration" }); pushMsg("c_" + x.owner, x.owner, "client", { text: fillText(pick(PHONE.clientLines), { pet: x.pet }).replace(/\{pet\}/g, x.pet), img: url, petName: x.pet }); }
function phoneReply(tid, mi, ri) {
  const P = phoneState(); const t = P.threads.find(x => x.id === tid); const m = t && t.msgs[mi]; if (!m || m.replied) return;
  m.replied = true; t.msgs.push({ from: "me", text: m.replies[ri], time: clockStr(), day: G.s.day }); stat("replies"); energy(2); Sound.click();
  if (m.answers && m.answers[ri]) setTimeout(() => { pushMsg(tid, t.name, t.kind, { text: m.answers[ri] }, true); if (P.open === tid) uiThread(tid); }, 1400);
  save(); uiThread(tid);
}
function adAction(tid, mi) {
  const P = phoneState(); const t = P.threads.find(x => x.id === tid); const m = t && t.msgs[mi]; if (!m || m.used) return; m.used = true; const s = G.s;
  if (m.ad === "restock20") { P.discountDay = s.day; toast("20% off restocks today — open the shop to restock.", "good", 3500); }
  if (m.ad === "freefood") { s.stock.food_dog = (s.stock.food_dog || 0) + 3; toast("3 bags of dog food added to the shop.", "good"); }
  if (m.ad === "ecoll") { s.stock.ecollar = (s.stock.ecollar || 0) + 3; toast("3 e-collars added to the shop.", "good"); }
  if (m.ad === "webinar") { energy(-8); addXP(40, "CPD webinar"); }
  Sound.cash(); save(); uiThread(tid);
}

/* ---------------- phone UI ---------------- */
function phoneShell(tab, inner) {
  const P = phoneState(); const tabs = [["msgs", "Messages", P.unread], ["gallery", "Gallery", 0], ["feed", "Clinic feed", 0]];
  return `<div class="phone"><div class="phonetabs">${tabs.map(([k, l, n]) => `<button class="ptab ${tab === k ? "on" : ""}" onclick="uiPhone('${k}')">${l}${n ? ` <span class="pdot">${n}</span>` : ""}</button>`).join("")}</div><div class="phonebody">${inner}</div></div>`;
}
function uiPhone(tab) {
  if (G.panelOpen && !$("#panelBody .phone")) closePanel();
  tab = tab || "msgs"; const P = phoneState(); P.open = null; let inner = "";
  if (tab === "msgs") {
    const ts = P.threads.slice().sort((a, b) => (a.id === "wife" ? -1 : b.id === "wife" ? 1 : (b.updated || 0) - (a.updated || 0)));
    inner = ts.map(t => { const last = t.msgs[t.msgs.length - 1]; return `<button class="thread" onclick="uiThread('${t.id.replace(/'/g, "\\'")}')"><span class="avatar ${t.kind}">${icon(t.kind === "wife" ? "heart" : t.kind === "ads" ? "tag" : "paw", 20)}</span><span class="tmeta"><b>${t.name}</b><span class="muted">${last ? (last.from === "me" ? "You: " : "") + String(last.plain || last.text).replace(/<[^>]+>/g, "").slice(0, 48) : "No messages yet"}</span></span>${t.unread ? `<span class="pdot">${t.unread}</span>` : ""}</button>`; }).join("") || "<p class='muted'>No messages.</p>";
  } else if (tab === "gallery") {
    inner = `<p class="muted small">Photos you take (gear menu → Photo) and pictures owners send you. ${P.gallery.length}/24 kept.</p><div class="gallery">${P.gallery.slice().reverse().map(g => `<button class="gimg" onclick="uiPhoto(${g.id})"><img src="${g.url}" alt=""></button>`).join("") || "<p class='muted'>No photos yet. Use the gear menu → Photo.</p>"}</div>`;
  } else {
    inner = `<div class="feedhead"><b>@${(G.s.clinicName || "batmanclinic").toLowerCase().replace(/[^a-z0-9]+/g, "")}</b><span class="muted">${P.followers} followers · ${P.feed.length} posts</span></div>${P.feed.slice().reverse().map(f => { const g = P.gallery.find(x => x.id === f.photo); return `<div class="post">${g ? `<img src="${g.url}" alt="">` : ""}<p><b>${f.caption}</b></p><p class="muted small">${icon("heart", 14)} ${f.likes} · Day ${f.day}</p>${f.comments.slice(-3).map(c => `<p class="comment">${c}</p>`).join("")}</div>`; }).join("") || "<p class='muted'>Nothing posted yet. Open a photo in the gallery and tap “Post”.</p>"}`;
  }
  openPanel(`${icon("phone", 20)} Phone`, phoneShell(tab, inner));
}
function uiThread(id) {
  const P = phoneState(); const t = P.threads.find(x => x.id === id); if (!t) return uiPhone(); P.open = id; t.unread = 0; P.unread = P.threads.reduce((a, x) => a + (x.unread || 0), 0); updatePhoneBadge();
  const lastIdx = t.msgs.length - 1;
  const body = t.msgs.map((m, i) => `<div class="msg ${m.from}">${m.img ? `<img src="${m.img}" alt="">` : ""}<span>${m.text}</span><em>Day ${m.day} · ${m.time}</em>${m.img && m.from === "them" && !m.saved ? `<button class="btn small" onclick="saveMsgPhoto('${id}',${i})">Save to gallery</button>` : ""}${m.ad && !m.used ? `<button class="btn small primary" onclick="adAction('${id}',${i})">${(PHONE.ads.find(a => a.id === m.ad) || {}).btn || "Open"}</button>` : ""}</div>`).join("");
  const last = t.msgs[lastIdx]; const replies = last && last.from === "them" && last.replies && !last.replied ? `<div class="replies">${last.replies.map((r, ri) => `<button class="btn small" onclick="phoneReply('${id}',${lastIdx},${ri})">${r}</button>`).join("")}</div>` : "";
  openPanel(`${icon("phone", 20)} ${t.name}`, `<div class="phone"><div class="chat">${body || "<p class='muted'>No messages.</p>"}</div>${replies}${t.kind === "wife" ? `<div class="btnrow tight"><input id="wifeName" value="${P.wifeName}" maxlength="18" style="max-width:150px"><button class="btn small" onclick="renameWife()">Rename contact</button></div>` : ""}<div class="btnrow"><button class="btn" onclick="uiPhone('msgs')">Back</button></div></div>`);
  const c = $("#panelBody .chat"); if (c) c.scrollTop = c.scrollHeight; save();
}
function renameWife() { const v = ($("#wifeName").value || "").trim(); if (!v) return; const P = phoneState(); P.wifeName = v; thread("wife").name = v; save(); uiThread("wife"); }
function saveMsgPhoto(tid, i) { const P = phoneState(); const t = P.threads.find(x => x.id === tid); const m = t.msgs[i]; addToGallery(m.img, m.petName ? `${m.petName} at home` : "From " + t.name); m.saved = true; save(); uiThread(tid); }
function addToGallery(url, caption) { const P = phoneState(); const id = P.seq++; P.gallery.push({ id, url, caption: caption || "", day: G.s.day }); while (P.gallery.length > 24) { const old = P.gallery.shift(); P.feed = P.feed.filter(f => f.photo !== old.id); } toast(`${icon("camera", 16)} Saved to your phone's gallery.`, "good", 2200); save(); return id; }
function uiPhoto(id) {
  const P = phoneState(); const g = P.gallery.find(x => x.id === id); if (!g) return uiPhone("gallery"); const posted = P.feed.some(f => f.photo === id);
  const caps = PHONE.captions.map(c => fillText(c));
  openPanel(`${icon("camera", 20)} Photo`, `<div class="phone"><img class="bigphoto" src="${g.url}" alt=""><p class="muted small">${g.caption || ""} · Day ${g.day}</p>${posted ? "<p class='goodbox'>Posted on the clinic feed.</p>" : `<h4>Post to the clinic feed</h4><div class="replies">${caps.map((c, i) => `<button class="btn small" onclick="postPhoto(${id},${i})">${c}</button>`).join("")}</div>`}<div class="btnrow"><button class="btn warn small" onclick="deletePhoto(${id})">Delete</button><button class="btn" onclick="uiPhone('gallery')">Back</button></div></div>`);
}
function postPhoto(id, ci) {
  const P = phoneState(); const cap = fillText(PHONE.captions[ci]); const pet = /cat|pet|patient|🐾/i.test(cap) ? 1.4 : 1;
  const likes = Math.round((P.followers * rnd(0.25, 0.5) + rnd(3, 12)) * pet); const gain = Math.round(rnd(3, 9) + likes * 0.12);
  P.feed.push({ id: P.seq++, photo: id, caption: cap, day: G.s.day, likes, comments: [pick(PHONE.comments)] }); P.followers += gain; stat("posts");
  if (P.lastPostRepDay !== G.s.day) { P.lastPostRepDay = G.s.day; rep(0.03, "clinic feed post"); }
  if (P.followers >= 100) award("influencer");
  Sound.success(); toast(`${icon("heart", 16)} Posted! ${likes} likes so far, +${gain} followers.`, "good", 3000); save(); uiPhone("feed");
}
function deletePhoto(id) { const P = phoneState(); P.gallery = P.gallery.filter(g => g.id !== id); P.feed = P.feed.filter(f => f.photo !== id); save(); uiPhone("gallery"); }
function saveShotToPhone() { const url = G.lastShot; if (!url) return; compressImage(url, 360, (small) => { addToGallery(small, "Clinic photo"); closePanel(); }); }
function compressImage(url, w, cb) {
  try { const img = new Image(); img.onload = () => { try { const c = document.createElement("canvas"); const k = w / img.width; c.width = w; c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); cb(c.toDataURL("image/jpeg", 0.6)); } catch (e) { cb(url); } }; img.onerror = () => cb(url); img.src = url; } catch (e) { cb(url); }
}

/* ---------------- drawn photos (owners' pets, wife's bridge) ---------------- */
function svgURL(svg) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); }
function shade(hex, k) { const n = parseInt(String(hex).replace("#", ""), 16) || 0xb07a4a; const r = Math.min(255, Math.round((n >> 16) * k)), g = Math.min(255, Math.round(((n >> 8) & 255) * k)), b = Math.min(255, Math.round((n & 255) * k)); return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0"); }
function petPhotoSVG(species, color, o) {
  o = o || {}; const c = color || "#b07a4a", d = shade(c, 0.75), l = shade(c, 1.25);
  const eyes = (x1, x2, y, r) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#1b1420"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#1b1420"/><circle cx="${x1 + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/><circle cx="${x2 + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
  let pet = "";
  if (species === "cat") pet = `<ellipse cx="120" cy="178" rx="58" ry="40" fill="${c}"/><path d="M168 186q40 4 34-34" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M78 88l8-40 30 28zM162 88l-8-40-30 28z" fill="${c}"/><path d="M86 82l4-22 14 14zM154 82l-4-22-14 14z" fill="#f2a5b5"/><circle cx="120" cy="112" r="46" fill="${c}"/>${eyes(102, 138, 108, 7)}<path d="M114 124l6 5 6-5z" fill="#f28aa0"/><path d="M120 129q-6 8-12 4M120 129q6 8 12 4" stroke="#1b1420" stroke-width="2" fill="none"/><path d="M78 120h-22M78 126l-20 6M162 120h22M162 126l20 6" stroke="#fff" stroke-width="1.5" opacity=".7"/>`;
  else if (species === "bird") pet = `<ellipse cx="120" cy="150" rx="48" ry="60" fill="${c}"/><ellipse cx="120" cy="168" rx="30" ry="38" fill="${l}"/><path d="M78 150q-26 30 0 56 18-24 16-50z" fill="${d}"/><path d="M112 76q8-28 20-30-4 16-8 26z" fill="${d}"/>${eyes(106, 134, 118, 6)}<path d="M112 130q8 16 16 0z" fill="#f2c14e"/><circle cx="96" cy="136" r="9" fill="#ff8a65" opacity=".7"/><circle cx="144" cy="136" r="9" fill="#ff8a65" opacity=".7"/><path d="M106 208v14M134 208v14" stroke="#c08850" stroke-width="5" stroke-linecap="round"/>`;
  else if (species === "rabbit") pet = `<ellipse cx="120" cy="182" rx="56" ry="38" fill="${c}"/><ellipse cx="100" cy="56" rx="13" ry="40" fill="${c}"/><ellipse cx="140" cy="56" rx="13" ry="40" fill="${c}"/><ellipse cx="100" cy="58" rx="6" ry="28" fill="#f2a5b5"/><ellipse cx="140" cy="58" rx="6" ry="28" fill="#f2a5b5"/><circle cx="120" cy="122" r="42" fill="${c}"/>${eyes(104, 136, 116, 7)}<path d="M114 132q6 6 12 0" stroke="#1b1420" stroke-width="2" fill="none"/><circle cx="120" cy="130" r="4" fill="#f28aa0"/><circle cx="176" cy="188" r="12" fill="${l}"/>`;
  else if (species === "tortoise") pet = `<ellipse cx="120" cy="170" rx="70" ry="44" fill="#6b8e4e"/><path d="M60 168q60-90 120 0z" fill="#8a6b3e"/><path d="M90 150l30-26 30 26-30 20z" fill="#a8844e" stroke="#6b5230" stroke-width="3"/><circle cx="196" cy="160" r="20" fill="#7aa35a"/>${eyes(200, 208, 154, 3.5)}<ellipse cx="78" cy="204" rx="14" ry="8" fill="#7aa35a"/><ellipse cx="160" cy="206" rx="14" ry="8" fill="#7aa35a"/>`;
  else pet = `<ellipse cx="120" cy="182" rx="62" ry="40" fill="${c}"/><path d="M178 180q34-8 26-40" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="120" cy="112" r="48" fill="${c}"/><ellipse cx="74" cy="112" rx="16" ry="32" fill="${d}" transform="rotate(18 74 112)"/><ellipse cx="166" cy="112" rx="16" ry="32" fill="${d}" transform="rotate(-18 166 112)"/><ellipse cx="120" cy="134" rx="26" ry="20" fill="${l}"/>${eyes(102, 138, 106, 7)}<ellipse cx="120" cy="124" rx="9" ry="6" fill="#1b1420"/><path d="M114 140q6 12 12 0z" fill="#f28aa0"/>`;
  const cone = o.cone && species !== "tortoise" ? `<path d="M64 150L86 70h68l22 80z" fill="#dfe8ff" opacity=".55" stroke="#b9c6ee" stroke-width="3"/>` : "";
  const band = o.bandage ? `<rect x="134" y="196" width="28" height="22" rx="8" fill="#5f8fd6"/><path d="M138 204h20M138 210h20" stroke="#fff" stroke-width="2"/>` : "";
  return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="#3a3550"/><rect x="150" y="18" width="70" height="60" rx="6" fill="#7fa7d6"/><path d="M185 18v60M150 48h70" stroke="#3a3550" stroke-width="4"/><rect y="168" width="240" height="72" fill="#5b4a7a"/><rect x="10" y="150" width="220" height="40" rx="18" fill="#6e5a92"/>${pet}${cone}${band}<text x="12" y="230" font-family="sans-serif" font-size="11" fill="#fff" opacity=".7">home sweet home</text></svg>`);
}
function drawWifePhoto(kind) {
  return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b26b"/><stop offset="1" stop-color="#7c6fcf"/></linearGradient></defs><rect width="240" height="240" fill="url(#s)"/><circle cx="180" cy="70" r="22" fill="#ffe08a"/><rect y="170" width="240" height="70" fill="#2d6fb0"/><path d="M0 150h240" stroke="#3a3550" stroke-width="10"/><path d="M20 150q100-110 200 0" stroke="#3a3550" stroke-width="7" fill="none"/>${[40, 70, 100, 130, 160, 190].map(x => `<path d="M${x} 150V${150 - Math.round(Math.sin((x - 20) / 200 * Math.PI) * 78)}" stroke="#3a3550" stroke-width="3"/>`).join("")}<rect x="16" y="150" width="10" height="40" fill="#3a3550"/><rect x="214" y="150" width="10" height="40" fill="#3a3550"/><text x="12" y="230" font-family="sans-serif" font-size="11" fill="#fff" opacity=".8">site visit ✓</text></svg>`);
}

/* ---------------- daily pet walk ---------------- */
const WALK_POINTS = [
  { name: "Front door", x: -5, z: -14.2, r: 1.8, say: "{pet} sniffs the fresh air." },
  { name: "Garden path", x: 9, z: -31, r: 2.0, say: "{pet} trots happily along the path." },
  { name: "Pond", x: 16, z: -29.9, r: 1.8, say: "{pet} watches the fish very seriously 🐟" },
  { name: "Garden bench", x: 12, z: -28.7, r: 1.5, say: "You sit for a minute. {pet} curls up at your feet. (+energy)", rest: true },
  { name: "Back to the bowl", x: 0.6, z: -10.3, r: 1.5, say: "Home again — {pet} heads straight for the bowl." }
];
function walkDoneToday() { return G.s.clinicPet && G.s.clinicPet.walkedDay === G.s.day; }
function startWalk() {
  if (G.walk) return; const cp = G.s.clinicPet;
  if (cp.personality === "grumpy" && cp.hunger > 70) { toast(`${cp.name} refuses the lead — feed first.`, "warn"); return; }
  G.walk = { i: 0, t0: gameNow() }; World.catFollow(true); World.setWaypoint(WALK_POINTS[0]); Sound.click();
  toast(`${icon("paw", 16)} ${cp.species === "bird" ? `${cp.name} is in the travel cage` : `Lead clipped on`} — follow the light: <b>${WALK_POINTS[0].name}</b>.`, "info", 3500); walkHint();
}
function endWalk(done) {
  World.catFollow(false); World.setWaypoint(null); const cp = G.s.clinicPet; G.walk = null; walkHint();
  if (done) { cp.walkedDay = G.s.day; cp.bond = (cp.bond || 0) + 10; cp.walks = (cp.walks || 0) + 1; stat("walk"); addXP(20, `walked ${cp.name}`); energy(6); award("walkies"); Sound.pet(cp.species); World.catWander([0.6, -10.9]); }
  else { toast(`Walk cancelled. ${cp.name} looks a little disappointed.`, "info"); World.catWander(); }
  save();
}
function walkTick(dt) {
  if (!G.walk) return; const pos = World.playerPos(); const w = WALK_POINTS[G.walk.i]; if (!w) return;
  if (Math.hypot(pos.x - w.x, pos.z - w.z) < w.r) {
    if (w.rest) energy(5); toast(`${icon("check", 16)} ${fillText(w.say)}`, "good", 2600); Sound.click(); G.walk.i++;
    const nx = WALK_POINTS[G.walk.i]; if (!nx) return endWalk(true); World.setWaypoint(nx); walkHint();
  }
}
function walkHint() { const el = $("#walkHint"); if (!el) return; if (!G.walk) { el.style.display = "none"; return; } const w = WALK_POINTS[G.walk.i]; el.style.display = ""; el.innerHTML = `${icon("paw", 14)} Walk ${G.walk.i + 1}/${WALK_POINTS.length}: <b>${w ? w.name : ""}</b> <button onclick="endWalk(false)" aria-label="Cancel walk">✕</button>`; }
function walkInteractable() {
  const cp = G.s.clinicPet; if (!cp) return null;
  if (G.walk) return null;
  return { id: "leash", pos: { x: -1.2, z: -10.5 }, r: 1.0, label: () => walkDoneToday() ? `${cp.name} already had a walk today` : `Take ${cp.name} for a walk`, action: () => walkDoneToday() ? toast(`${cp.name} had a walk today — tomorrow again!`, "info") : startWalk() };
}

/* ---------------- pharmacist ---------------- */
function fmtDose(v) { if (!isFinite(v)) return "?"; return v >= 1 ? (+v.toFixed(2)).toString() : (+v.toPrecision(2)).toString(); }
function pharmacistDraft(p, drug, next, selfCalc) {
  const ph = G.s.staff.find(s => s.role === "pharmacist"); const sp = p.species, W = p.weight, dose = drug.dose[sp], conc = drug.conc;
  const correctMl = dose * W / conc; let err = null, other = null;
  if (ph.level === "junior" && Math.random() < (G.s.settings.pharmErr !== undefined ? G.s.settings.pharmErr : 0.15)) {
    const types = ["decimal", "conc", "lb"]; other = Object.entries(drug.dose).find(([k, v]) => k !== sp && SPECIES[k] && Math.abs(v - dose) / dose > 0.3); if (other) types.push("species"); err = pick(types);
  }
  let sW = W, sD = dose, sC = conc; if (err === "lb") sW = +(W * 2.2).toFixed(sp === "bird" ? 3 : 1); if (err === "species") sD = other[1]; if (err === "conc") sC = conc >= 10 ? conc / 10 : conc * 10;
  const mg = sW * sD; let ml = mg / sC; if (err === "decimal") ml = ml * (Math.random() < 0.5 ? 10 : 0.1);
  const note = ph.level === "senior" ? `<div class="hintbox">${icon("drug", 14)} <b>${ph.name}'s note:</b> ${(String(drug.note).split(". ")[0].replace(/\.$/, "") + ".")}</div>` : "";
  openPanel(`${icon("drug", 20)} ${drug.name} — check ${ph.name}'s draft`, `<p class="muted">${ph.name} (${ph.level} pharmacist) drafted the dose. Check every line against the patient file and the formulary, then sign — or send it back.</p>
    <table class="ref small"><tr><th>Patient file</th><td>${p.name}, ${SPECIES[sp].label}, <b>${W} kg</b></td></tr><tr><th>Formulary</th><td>${drug.name}: ${SPECIES[sp].label.toLowerCase()} <b>${dose} mg/kg</b> ${drug.route}</td></tr><tr><th>Stock bottle</th><td>${drug.form}</td></tr></table>
    <div class="draft"><h4>Draft label</h4><p>Weight used: <b>${sW} kg</b></p><p>Dose: <b>${sD} mg/kg</b></p><p>Concentration: <b>${sC} mg/mL</b></p><p>Working: ${sW} × ${sD} = <b>${fmtDose(mg)} mg</b>; ${fmtDose(mg)} ÷ ${sC} = <b>${fmtDose(ml)} mL</b></p></div>${note}
    <div class="btnrow"><button class="btn primary" id="phOk">Sign & dispense</button><button class="btn warn" id="phBad">Something's wrong — send back</button><button class="btn" id="phSelf">Calculate it myself</button></div>`, { noClose: true });
  const fin = (html, after) => { setBody(`${html}<div class="btnrow"><button class="btn primary" id="phNext">Continue</button></div>`); $("#phNext").onclick = () => after(); };
  const right = `${fmtDose(dose * W)} mg ÷ ${conc} mg/mL = <b>${fmtDose(correctMl)} mL</b>`;
  const why = { decimal: "The decimal point slipped in the last step — a tenfold error.", conc: `The draft used ${sC} mg/mL, but the bottle is ${conc} mg/mL — wrong concentration means a tenfold error.`, lb: `The weight was entered in pounds (${sW}) instead of ${W} kg — 2.2× overdose.`, species: `That is the ${other ? SPECIES[other[0]].label.toLowerCase() : ""} dose (${sD} mg/kg); this patient is a ${SPECIES[sp].label.toLowerCase()} (${dose} mg/kg).` }[err];
  $("#phSelf").onclick = () => uiDoseTask(p, drug.id, next, false, true);
  $("#phOk").onclick = () => {
    if (!err) { Sound.success(); addXP(8, "dose verified"); G.s.dosesDone++; stat("doses"); p.record.push(`${clockStr()} — ${drug.name} ${dose} mg/kg → ${fmtDose(correctMl)} mL (drafted by ${ph.name}, verified by ${DR()}).`); next(); return; }
    Sound.error(); p.mistakes++; rep(-0.15, "dosing error"); p.record.push(`${clockStr()} — DOSING ERROR: ${drug.name} drawn up as ${fmtDose(ml)} mL instead of ${fmtDose(correctMl)} mL (draft by ${ph.name}, signed by ${DR()}). Caught at administration, corrected.`);
    fin(`<div class="badbox"><b>The draft was wrong.</b> ${why} Correct: ${right}. The nurse caught it before it was given, but it goes on the record.</div>`, next);
  };
  $("#phBad").onclick = () => {
    if (err) { Sound.success(); addXP(25, "caught a dosing slip"); G.s.dosesDone++; stat("doses"); award("goodcatch"); ph.catches = (ph.catches || 0) + 1; p.record.push(`${clockStr()} — ${drug.name}: pharmacist draft error caught (${err}); corrected to ${fmtDose(correctMl)} mL (verified).`); fin(`<div class="goodbox"><b>Good catch!</b> ${why} Correct: ${right}. ${ph.name} redoes the label and thanks you.</div>`, next); return; }
    Sound.click(); G.s.clockMin += 5; p.record.push(`${clockStr()} — ${drug.name} draft rechecked — correct, ${fmtDose(correctMl)} mL.`); fin(`<div class="hintbox">${ph.name} rechecks: the draft was correct (${right}). Five minutes lost, but checking is never wrong.</div>`, next);
  };
}

/* ---------------- staff helpers ---------------- */
const CLEAN_SPOTS = [[-5, -8], [6.5, -5], [0, 6], [7, 5], [-5.5, 6], [-11, 6], [13.5, 6], [19.5, -6], [19.5, 6], [-17, -6], [-17.5, 6], [-9, -1.5]];
function cleanerWander(dt) {
  const cl = G.s.staff.find(x => x.role === "cleaner"); const n = G.staffNPCs && G.staffNPCs.cleaner; if (!cl || !n || !n.rig) return;
  G.cleanT = (G.cleanT === undefined ? 10 : G.cleanT) - dt; if (G.cleanT > 0 || (n.path && n.path.length)) return;
  G.cleanT = cl.level === "senior" ? rnd(18, 26) : rnd(28, 40);
  const spots = CLEAN_SPOTS.filter(([x, z]) => { const r = World.roomAt(x, z); return !r || !World.locked[r]; }); const sp = pick(spots); const p = n.rig.group.position;
  n.speed = n.speed || 1.3; n.path = World.routeBetween([p.x, p.z], sp);
}
function staffLevel(role) { const s = G.s.staff.find(x => x.role === role); return s ? s.level : null; }

/* ---------------- wiring ---------------- */
function initPhone() {
  phoneState(); updatePhoneBadge(); walkHint();
  const b = $("#phoneBtn"); if (b) b.onclick = () => uiPhone();
}
