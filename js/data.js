/* ============================================================
   BATMAN CLINIC — clinical content
   All ranges are textbook / guideline values for healthy adults.
   Sources: 2020 AAHA Anesthesia & Monitoring Guidelines; Fossum,
   Small Animal Surgery; Tobias, Manual of Small Animal Soft Tissue
   Surgery; Univ. of Melbourne "Preparation of the Surgical Patient
   & Surgeon" (2014); Frontiers Vet Sci 2024 review of preoperative
   antiseptics. Always follow your own clinic protocol in real life.
   ============================================================ */

const SPECIES = {
  dog: {
    label: "Dog", emoji: "🐕", soundFn: "bark",
    vitals: { temp: [38.3, 39.2], hr: [60, 140], rr: [10, 30], crt: "< 2 s", mm: "pink, moist" },
    vitalsNote: "Large breeds sit at the low end of heart rate; toy breeds and puppies can run 140–180 bpm.",
    fasting: "Healthy adult: withhold food 4–6 h before premedication (AAHA 2020); water allowed until premed. Puppies < 8 weeks: 1–2 h only.",
    handling: ["Basket muzzle", "Slip lead + gentle lateral restraint", "Towel over head (calming)", "Treats & slow approach"],
    bestHandling: "Basket muzzle",
    handlingWhy: "A well-fitted basket muzzle protects staff yet lets the dog pant and breathe. Dogs resist most when cornered or stared at — approach from the side, low and slow.",
    etTube: "Cuffed Murphy tube; size by tracheal palpation (roughly 1 mm ID per 2 kg to a max ~14 mm). Inflate cuff only to seal at 20 cmH₂O.",
    names: ["Rex", "Luna", "Bolt", "Daisy", "Simba", "Zara", "Max", "Nala", "Rocky", "Bella"],
    breeds: ["Golden Retriever", "Shih Tzu", "German Shepherd", "Beagle", "Husky", "Mixed breed", "Poodle", "Labrador"],
    weight: [4, 38]
  },
  cat: {
    label: "Cat", emoji: "🐈", soundFn: "meow",
    vitals: { temp: [38.1, 39.2], hr: [140, 220], rr: [20, 30], crt: "< 2 s", mm: "pink, moist" },
    vitalsNote: "Stress in the clinic easily pushes heart rate above 220 — recheck after the cat settles.",
    fasting: "Healthy adult: 4–6 h food fast; water until premed. Kittens: ≤ 2 h.",
    handling: ["Towel wrap ('cat burrito')", "Scruff and stretch hard", "Hold by all four legs", "Let it roam the room"],
    bestHandling: "Towel wrap ('cat burrito')",
    handlingWhy: "A towel wrap controls all four limbs without pain, lowers stress, and still gives access to one limb or the head. Heavy scruffing is painful and increases aggression (AAFP low-stress handling).",
    etTube: "Cats are prone to laryngospasm and tracheal tears: spray larynx with lidocaine, intubate gently, do NOT over-inflate the cuff, and disconnect the circuit before turning the patient.",
    names: ["Mishmish", "Tom", "Cleo", "Milo", "Sousou", "Oreo", "Lulu", "Ginger", "Figaro", "Nour"],
    breeds: ["Domestic short-hair", "Persian", "Siamese", "Maine Coon", "British Shorthair", "Shirazi"],
    weight: [2.5, 7]
  },
  bird: {
    label: "Bird", emoji: "🦜", soundFn: "chirp",
    vitals: { temp: [40.0, 42.0], hr: [250, 600], rr: [40, 75], crt: "n/a", mm: "pink (oral)" },
    vitalsNote: "Small psittacines (budgie, cockatiel). Heart rate is counted with a stethoscope over the keel; respiration by tail-bob. Values climb steeply with handling stress.",
    fasting: "Small birds: 1–3 h at most (high metabolic rate → hypoglycaemia risk). Check that the crop is EMPTY by palpation before induction to avoid regurgitation.",
    handling: ["Towel restraint, head held between fingers, chest free", "Grip firmly around the chest", "Hold by the wings", "Hold by the legs upside-down"],
    bestHandling: "Towel restraint, head held between fingers, chest free",
    handlingWhy: "Birds have no diaphragm — they breathe by moving the sternum (keel). Any pressure on the chest can suffocate them within seconds. Restrain the head and wings with a towel, never squeeze the body.",
    etTube: "UNCUFFED tube only: birds have complete cartilaginous tracheal rings and an inflated cuff causes pressure necrosis and tracheal stricture. Many small birds are maintained by face-mask instead.",
    names: ["Kiwi", "Sunny", "Pico", "Mango", "Tweety", "Blu", "Coco", "Zizi"],
    breeds: ["Budgerigar", "Cockatiel", "Lovebird", "Canary"],
    weight: [0.03, 0.12]
  }
};

/* Body condition score 1–9 (WSAVA) */
const BCS = [
  "1 — Emaciated: ribs, spine, pelvis visible from a distance, no fat.",
  "3 — Thin: ribs easily felt, obvious waist, minimal fat.",
  "5 — Ideal: ribs palpable with slight fat cover, waist visible from above, abdominal tuck.",
  "7 — Overweight: ribs felt with difficulty, waist barely visible, fat on tail base.",
  "9 — Obese: heavy fat over thorax, spine and tail base, no waist, abdominal distension."
];

/* Physical exam checklist — the order a clinician actually follows */
const EXAM_STEPS = [
  { id: "history", label: "History & signalment", tip: "Age, sex, neuter status, vaccination, diet, appetite, water intake, urination, defecation, the owner's main concern and when it started." },
  { id: "observe", label: "Hands-off observation", tip: "Mentation, posture, gait and breathing pattern before you touch the patient — animals hide signs once handled." },
  { id: "tpr", label: "TPR — Temperature, Pulse, Respiration", tip: "Rectal temperature (cloacal in birds), femoral pulse (dog/cat) or keel auscultation (bird), respiratory rate counted over 15 s × 4." },
  { id: "mm", label: "Mucous membranes & CRT", tip: "Lift the lip: colour should be pink; press the gum and count the capillary refill time — under 2 seconds. Pale = anaemia/shock, blue = hypoxia, yellow = icterus, brick red = sepsis." },
  { id: "ausc", label: "Auscultation", tip: "Listen to all four heart valve areas and both lung fields. Note murmurs, arrhythmia, crackles, wheezes." },
  { id: "palp", label: "Abdominal & lymph node palpation", tip: "Gently palpate cranial to caudal: liver edge, stomach, kidneys, intestines, bladder. Check submandibular, prescapular and popliteal lymph nodes." },
  { id: "eyes", label: "Eyes, ears, mouth, teeth", tip: "Otoscope both ears, check dental calculus and gingivitis, pupil symmetry, discharge." },
  { id: "msk", label: "Musculoskeletal & skin", tip: "Flex/extend every joint, check for pain, swelling, crepitus. Part the coat for fleas, flea dirt, alopecia, masses." },
  { id: "bcs", label: "Body condition score (1–9)", tip: "WSAVA 9-point scale; 4–5 is ideal." }
];

/* ------------------------------------------------------------
   CASES.  outcome: checkup | xray | surgery.  level = unlock level
   ------------------------------------------------------------ */
const CASES = [
  /* ---- Level 1: wellness & medicine ---- */
  { id: "vax_dog", species: "dog", level: 1, outcome: "checkup", complaint: "Annual vaccination and health check.",
    findings: "Bright, alert, responsive. TPR normal. BCS 5/9. Mild dental calculus.",
    options: ["Healthy — vaccinate (DHPP + rabies), deworm, dental home-care advice", "Needs emergency surgery", "Prescribe antibiotics for the teeth"],
    correct: 0, why: "A well pet with normal exam is vaccinated according to WSAVA core-vaccine schedule and dewormed. Calculus is managed with brushing and a future dental, not antibiotics.", fee: 25 },
  { id: "vax_cat", species: "cat", level: 1, outcome: "checkup", complaint: "Kitten vaccination, first visit.",
    findings: "Playful kitten, 10 weeks, 1.1 kg. Fleas seen. TPR normal.",
    options: ["Deworm, flea treatment (kitten-safe), FVRCP vaccine, book booster in 3–4 weeks", "Vaccinate and send home, ignore fleas", "Spay today"],
    correct: 0, why: "Kittens receive FVRCP boosters every 3–4 weeks until ≥ 16 weeks. Fleas transmit tapeworm, so deworm as well. Spay is scheduled around 5–6 months, not at 10 weeks in a first-visit kitten.", fee: 30 },
  { id: "ear_dog", species: "dog", level: 1, outcome: "checkup", complaint: "Shaking head, scratching left ear for a week.",
    findings: "Left ear: erythema, dark waxy discharge, pain on palpation of the vertical canal. Otoscopy: inflamed canal, intact tympanum.",
    options: ["Otitis externa — ear cytology, clean, topical ear medication, recheck in 10–14 days", "Surgery to remove the ear canal", "Nothing — ears clean themselves"],
    correct: 0, why: "Otitis externa is diagnosed with cytology (yeast vs bacteria vs mites) and treated topically. Total ear canal ablation is reserved for end-stage chronic disease.", fee: 35 },
  { id: "bird_well", species: "bird", level: 2, outcome: "checkup", complaint: "Budgie seems fluffed up and quieter than usual.",
    findings: "Weight 34 g. Mild tail-bob, feathers fluffed, keel slightly prominent (BCS low). Droppings: loose with increased urates.",
    options: ["Warm hospital cage (28–30 °C), weigh daily, crop & faecal exam, supportive feeding", "Send home — birds fluff when relaxed", "Bath in cold water to reduce fever"],
    correct: 0, why: "A fluffed, quiet bird is a sick bird conserving heat. Birds hide illness until late, so supportive warmth and nutrition plus diagnostics are started at once.", fee: 30 },
  { id: "bird_nails", species: "bird", level: 2, outcome: "checkup", complaint: "Nail & beak trim, routine.",
    findings: "Healthy cockatiel, 90 g, bright. Nails overgrown, beak normal.",
    options: ["Trim nail tips only, avoid the quick, have styptic powder ready", "Trim the beak short too", "Sedate for the trim"],
    correct: 0, why: "Only overgrown nail tips are trimmed; the beak is normal and should not be cut. Styptic (ferric subsulfate) stops bleeding if the quick is nicked.", fee: 15 },

  /* ---- Level 2: imaging ---- */
  { id: "limp_cat", species: "cat", level: 2, outcome: "xray", complaint: "Fell from a balcony, not using the left front leg.",
    findings: "Non-weight-bearing left forelimb, swelling and crepitus mid-antebrachium. Painful. Otherwise stable, no dyspnoea.",
    options: ["Analgesia, then radiograph the left forelimb (2 orthogonal views)", "Bandage and send home", "Amputate"],
    correct: 0, why: "Crepitus suggests fracture. Pain relief first, then two orthogonal radiographs (lateral + craniocaudal). Also check thorax after a fall (high-rise syndrome).",
    xray: { view: "cat", finding: "fracture_radius", label: "Mid-diaphyseal transverse fracture of the radius and ulna" }, fee: 60 },
  { id: "limp_dog", species: "dog", level: 2, outcome: "xray", complaint: "Hit by a car, holding up right hind leg.",
    findings: "Shock parameters stable after fluids. Right hind: swelling over femur, abnormal angulation.",
    options: ["Stabilise, analgesia, radiograph pelvis & femur", "Walk the dog to assess", "Cast immediately without imaging"],
    correct: 0, why: "Imaging confirms the fracture type and rules out pelvic injury before any fixation is planned.",
    xray: { view: "dog", finding: "fracture_femur", label: "Oblique mid-shaft femoral fracture" }, fee: 60 },
  { id: "vomit_dog", species: "dog", level: 4, outcome: "surgery", procedure: "gastrotomy", complaint: "Vomiting for 2 days after chewing a toy; not eating.",
    findings: "Dehydrated 7%, painful cranial abdomen, firm object palpable. TPR: T 39.4, HR 130, RR 28.",
    options: ["IV fluids, radiograph abdomen → likely foreign body → surgery", "Anti-emetic and send home", "Induce vomiting with hydrogen peroxide"],
    correct: 0, why: "A palpable object with persistent vomiting is a surgical emergency; inducing vomiting is contraindicated for sharp or large objects.",
    xray: { view: "dog", finding: "foreign_body", label: "Radio-opaque foreign body in the stomach" }, fee: 350 },
  { id: "bird_wing", species: "bird", level: 2, outcome: "xray", complaint: "Cockatiel flew into a window, left wing drooping.",
    findings: "Left wing held low, swelling over the distal humerus. Breathing normal.",
    options: ["Radiograph the wing (ventrodorsal + lateral whole-body)", "Wrap and release", "Clip the flight feathers"],
    correct: 0, why: "Whole-body radiographs are standard in birds — tiny patients, and you check for air-sac or coelomic injury at the same time.",
    xray: { view: "bird", finding: "fracture_humerus", label: "Closed fracture of the distal humerus — figure-of-eight bandage + body wrap for 3–4 weeks" }, fee: 55 },

  /* ---- Level 3+: surgery ---- */
  { id: "spay_dog", species: "dog", level: 3, outcome: "surgery", procedure: "ohe", complaint: "Scheduled ovariohysterectomy (spay).",
    findings: "Healthy 7-month female, 12 kg. Fasted since 8 pm. TPR normal. ASA I.",
    options: ["Proceed to pre-anaesthetic work-up and surgery", "Cancel — too young", "Vaccinate instead"],
    correct: 0, why: "Elective OHE at 6–9 months is standard. ASA I patients still get a minimum database (PCV/TS, glucose, BUN).", fee: 220 },
  { id: "spay_cat", species: "cat", level: 3, outcome: "surgery", procedure: "ohe", complaint: "Spay before first heat.",
    findings: "Healthy 6-month female, 2.8 kg. Fasted. TPR normal. ASA I.",
    options: ["Proceed to pre-anaesthetic work-up and surgery", "Needs X-ray first", "Only neuter male cats"],
    correct: 0, why: "Cats are often spayed via a flank or ventral midline approach; either way the aseptic preparation and anaesthesia pathway is identical.", fee: 180 },
  { id: "neuter_dog", species: "dog", level: 3, outcome: "surgery", procedure: "castration", complaint: "Castration (neuter).",
    findings: "Healthy 1-year male, 20 kg. Both testes descended. Fasted. ASA I.",
    options: ["Proceed to pre-anaesthetic work-up and surgery", "Not possible — testes too large", "Give hormone injection instead"],
    correct: 0, why: "Pre-scrotal open or closed castration is a routine elective procedure. Always confirm both testes are scrotal — a retained testis needs an abdominal approach.", fee: 170 },
  { id: "lac_dog", species: "dog", level: 3, outcome: "surgery", procedure: "laceration", complaint: "Dog fight — deep cut on the shoulder.",
    findings: "8 cm full-thickness skin laceration, contaminated with hair and dirt, bleeding controlled. Fracture ruled out.",
    options: ["Analgesia, sedation/anaesthesia, lavage, debride and close", "Leave it open with no cleaning", "Superglue the skin"],
    correct: 0, why: "Bite wounds are contaminated: clip, copious sterile saline lavage, debride dead tissue, then close (± drain) under appropriate anaesthesia and antibiotics.", fee: 160 },
  { id: "crop_bird", species: "bird", level: 5, outcome: "surgery", procedure: "ingluviotomy", complaint: "Budgie swallowed a piece of plastic; crop feels hard.",
    findings: "Firm object palpable in the crop; regurgitation. Bird is otherwise stable, 38 g.",
    options: ["Warm, stabilise, then ingluviotomy (crop surgery) under isoflurane", "Pull it out through the beak with pliers", "Wait for it to pass"],
    correct: 0, why: "Crop foreign bodies that cannot be gently retrieved via the mouth are removed through a small skin and crop incision over the left side of the neck.", fee: 200 }
];

/* ------------------------------------------------------------
   PRE-OPERATIVE PATIENT CHECKLIST (done in the prep room)
   ------------------------------------------------------------ */
const PREOP_STEPS = [
  { id: "consent", label: "Owner consent & contact confirmed", why: "Written informed consent (procedure, anaesthetic risk, costs, CPR wishes) is a legal and AAHA requirement." },
  { id: "fasting", label: "Confirm fasting", why: (sp) => SPECIES[sp].fasting },
  { id: "preanes", label: "Pre-anaesthetic exam & ASA status", why: "Repeat TPR, auscultation and MM/CRT on the day. Assign ASA I–V. A rise from ASA I–II to ≥ III markedly increases anaesthetic mortality risk (AAHA 2020)." },
  { id: "blood", label: "Minimum database bloodwork", why: "At least PCV/total solids, glucose, BUN/creatinine ± full CBC & chemistry for patients > 7 years or ASA ≥ II. Detects anaemia, dehydration, kidney or liver disease that changes the drug plan." },
  { id: "iv", label: "Place IV catheter", why: "Cephalic vein (dog/cat, clip and prep the site). Gives a route for induction drugs, fluids and emergency drugs. In small birds the right jugular or basilic (wing) vein is used, often after induction." },
  { id: "premed", label: "Premedication (sedative + analgesic)", why: "e.g. an opioid plus a sedative (dexmedetomidine or acepromazine, chosen by patient status). Lowers induction and maintenance doses, smooths recovery and provides pre-emptive analgesia." },
  { id: "preoxy", label: "Pre-oxygenate 3–5 min", why: "Face-mask oxygen before induction raises the oxygen reserve during intubation — essential in brachycephalics and dyspnoeic patients." },
  { id: "induce", label: "Induction & intubation", why: (sp) => "IV propofol or alfaxalone given slowly to effect (dog/cat). " + SPECIES[sp].etTube + " Confirm placement with capnography, secure the tube, connect to isoflurane/sevoflurane in oxygen." },
  { id: "monitor", label: "Attach monitoring", why: "Pulse oximeter (SpO₂ > 95 %), capnograph (ETCO₂ 35–45 mmHg), ECG, blood pressure (MAP > 60 mmHg), oesophageal thermometer, ± Doppler. Record values every 5 minutes. Active warming from the start — hypothermia is the most common complication." },
  { id: "eyes", label: "Ocular lubricant", why: "Anaesthetised animals do not blink; lubricate both eyes to prevent corneal ulcers." },
  { id: "clip", label: "Clip hair widely & vacuum", why: "#40 clipper blade, with and against the grain, margins at least 10–20 cm beyond the planned incision (birds: pluck a small area, never clip). Clip in the PREP room, never in theatre — loose hair is a major contamination source." },
  { id: "scrub", label: "Initial surgical site scrub", why: "Chlorhexidine gluconate 2–4 % scrub alternating with 70 % alcohol (or sterile saline), working from the incision line outward in a target pattern, never returning to the centre with a used swab. Minimum 2–5 min contact time. Chlorhexidine-alcohol outperforms povidone-iodine for preventing surgical-site infection." },
  { id: "position", label: "Transfer & position on the OR table", why: "Move with the circuit disconnected, re-connect, re-check tube and monitors. Dorsal recumbency on a warmed pad for abdominal surgery, tie limbs loosely." }
];

/* Surgeon scrub-in sequence (done at locker + sink) */
const SCRUB_STEPS = [
  { id: "jewel", label: "Remove jewellery & watch; nails short, no polish", why: "Jewellery harbours bacteria and tears gloves." },
  { id: "scrubs", label: "Change into clean scrubs & theatre shoes / shoe covers", why: "Street clothes bring environmental bacteria into the surgical suite." },
  { id: "cap", label: "Surgical cap covering ALL hair", why: "Hair sheds Staphylococcus constantly; a cap must go on BEFORE the hand scrub." },
  { id: "mask", label: "Surgical mask over nose and mouth", why: "Stops droplet contamination of the sterile field. Mask then cap then scrub — never adjust them after scrubbing." },
  { id: "hands", label: "Surgical hand scrub (2–5 min) or alcohol-based rub", why: "Chlorhexidine 4 % or alcohol-chlorhexidine rub, fingertips → elbows, hands always held higher than elbows so water runs away from the clean hands. Clean under nails with a pick. Rinse without touching the tap (use elbow/foot control)." },
  { id: "dry", label: "Dry with a sterile towel, hands up", why: "One side of the towel per hand, moving from fingers to elbow; never go back toward the hands." },
  { id: "gown", label: "Sterile gown — touch only the inside", why: "Pick the gown up by the inner neck fold, let it unfold, slide arms in; a non-sterile assistant ties the back. The gown is sterile only from chest to waist and sleeves to 5 cm above the elbow." },
  { id: "gloves", label: "Closed gloving", why: "Hands stay inside the gown cuffs while gloves are pulled on, so bare skin never touches the glove's outer surface. Once gloved, keep hands above the waist and in front of you." }
];

/* ------------------------------------------------------------
   SURGICAL INSTRUMENTS
   ------------------------------------------------------------ */
const TOOLS = {
  scalpel: { name: "#3 scalpel handle + #10 blade", short: "Scalpel", desc: "Skin and fascia incision. #10 is the all-purpose curved blade; #15 for small/delicate incisions, #11 for stab incisions. Held like a pencil for fine work or a 'fingertip grip' for long incisions." },
  metz: { name: "Metzenbaum scissors", short: "Metzenbaum", desc: "Long, slender, delicate blades for dissecting soft tissue and cutting thin fascia. Never cut suture with them — it blunts the blades." },
  mayo: { name: "Mayo scissors", short: "Mayo scissors", desc: "Heavier blades for dense tissue such as the linea alba and fascia. Also the correct scissor for cutting suture." },
  adson: { name: "Adson thumb forceps (with teeth)", short: "Adson forceps", desc: "Fine tissue forceps for handling skin and fascia with minimal trauma. Debakey forceps are used for viscera and vessels." },
  kelly: { name: "Kelly haemostatic forceps", short: "Kelly haemostat", desc: "Ratcheted clamp; transverse serrations on the distal half of the jaws. Clamps bleeding vessels and holds tissue. Crile is similar with full-jaw serrations." },
  carmalt: { name: "Rochester-Carmalt forceps", short: "Carmalt", desc: "Large crushing forceps with longitudinal serrations and cross-hatched tips — the classic clamp for ovarian and uterine pedicles." },
  allis: { name: "Allis tissue forceps", short: "Allis forceps", desc: "Interlocking teeth hold tissue securely — used on tissue that will be removed (e.g. stomach edge during gastrotomy, tumour) because they crush." },
  needle: { name: "Mayo-Hegar needle holder", short: "Needle holder", desc: "Holds the suture needle at its ⅔ point. Olsen-Hegar has built-in scissor blades. Ratchet locks the needle." },
  towel: { name: "Backhaus towel clamps", short: "Towel clamps", desc: "Pointed, curved tips penetrate drapes and skin to anchor the four quarter drapes at the corners of the surgical field." },
  snook: { name: "Snook ovariohysterectomy hook", short: "Spay hook", desc: "Blunt hook slipped along the body wall to retrieve the uterine horn through a small incision without exteriorising the intestines." },
  balfour: { name: "Balfour abdominal retractor", short: "Balfour retractor", desc: "Self-retaining retractor that holds the abdominal wall open during long abdominal procedures." },
  absorb: { name: "Absorbable suture (e.g. 3-0 polydioxanone / poliglecaprone)", short: "Absorbable suture", desc: "For ligatures, linea alba, subcutis and viscera — dissolves over weeks to months so no removal is needed. Size 2-0 to 3-0 for medium dogs, 3-0 to 4-0 cats, 4-0 to 5-0 birds." },
  nylon: { name: "Non-absorbable skin suture (nylon 3-0 / 4-0)", short: "Nylon skin suture", desc: "Monofilament nylon for skin: simple interrupted or cruciate pattern, removed at 10–14 days. Alternatively an intradermal pattern with absorbable suture." },
  gauze: { name: "Gauze swabs & moistened laparotomy sponges", short: "Gauze / lap sponges", desc: "Count them in AND out. Laparotomy sponges are moistened with warm sterile saline to pack off viscera and protect tissue from drying." },
  suction: { name: "Poole suction tip", short: "Suction", desc: "Multi-fenestrated tip for suctioning fluid from body cavities without sucking up viscera." },
  cautery: { name: "Monopolar electrocautery", short: "Electrocautery", desc: "Coagulates small subcutaneous bleeders. Needs a ground plate under the patient; avoid near alcohol-wet skin." },
  saline: { name: "Warm sterile saline lavage", short: "Saline lavage", desc: "Copious lavage dilutes bacteria and removes debris ('dilution is the solution to pollution'). Warm it to prevent hypothermia." },
  bandage: { name: "Figure-of-eight wing bandage", short: "Figure-8 bandage", desc: "Conforming bandage that immobilises the wing against the body for fractures distal to the elbow; add a body wrap for humeral fractures." },
  clipper: { name: "Electric clipper, #40 blade", short: "Clippers", desc: "Removes hair with a very close cut for surgical site preparation. Clean and disinfect the blade between patients." },
  chx: { name: "Chlorhexidine gluconate 2–4 % scrub", short: "Chlorhexidine", desc: "Broad-spectrum antiseptic with a residual effect; alternated with alcohol for the patient prep; 4 % for the surgeon's hands." },
  ettube: { name: "Endotracheal tube", short: "ET tube", desc: "Secures the airway and delivers oxygen plus inhalant anaesthetic. Cuffed for dogs/cats, UNCUFFED for birds (complete tracheal rings)." },
  ivcath: { name: "IV catheter (20–22 G)", short: "IV catheter", desc: "Over-the-needle catheter in the cephalic vein. Flush with saline, secure with tape." },
  lary: { name: "Laryngoscope", short: "Laryngoscope", desc: "Lights and depresses the tongue so you can see the arytenoid cartilages before passing the tube." },
  pulseox: { name: "Pulse oximeter probe", short: "Pulse oximeter", desc: "On the tongue, lip or ear; reads SpO₂ and pulse rate. Target SpO₂ ≥ 95 %." },
  ecollar: { name: "Elizabethan collar", short: "E-collar", desc: "Stops the patient licking or chewing the incision during the 10–14 day healing period." }
};

/* ------------------------------------------------------------
   SURGICAL PROCEDURES — each step: text, correct tool, distractors
   ------------------------------------------------------------ */
const PROCEDURES = {
  ohe: {
    name: "Ovariohysterectomy (spay)", species: ["dog", "cat"], level: 3, duration: "30–60 min",
    intro: "Removal of both ovaries and the uterus through a ventral midline approach. Prevents pyometra, oestrus and most mammary tumours when done early.",
    steps: [
      { text: "Final sterile prep done; place four quarter drapes around the incision site and secure them at the corners.", tool: "towel", choices: ["towel", "kelly", "allis"], why: "Backhaus towel clamps anchor the drapes so the sterile field cannot shift during surgery." },
      { text: "Make a ventral midline skin incision starting just caudal to the umbilicus (cranial third of umbilicus-to-pubis in dogs; middle third in cats).", tool: "scalpel", choices: ["scalpel", "mayo", "metz"], why: "A #10 blade makes a clean full-thickness skin incision in one smooth stroke. Scissors would crush the skin edges." },
      { text: "Dissect subcutaneous fat down to the linea alba and control small bleeders.", tool: "metz", choices: ["metz", "snook", "needle"], why: "Metzenbaum scissors are designed for delicate soft-tissue dissection. Pinpoint bleeders are clamped or cauterised." },
      { text: "Tent the linea alba, make a stab incision and extend it cranially and caudally.", tool: "mayo", choices: ["mayo", "metz", "adson"], why: "The linea alba is dense fibrous tissue — Mayo scissors handle it without damaging the finer Metzenbaums. Tenting with thumb forceps protects the bowel beneath." },
      { text: "Retrieve the left uterine horn by sweeping along the body wall caudal to the kidney.", tool: "snook", choices: ["snook", "allis", "balfour"], why: "The Snook spay hook retrieves the horn through a small incision without exteriorising the intestines. Trace it cranially to the ovary." },
      { text: "Break down the suspensory ligament digitally, make a window in the mesovarium and triple-clamp the ovarian pedicle.", tool: "carmalt", choices: ["carmalt", "adson", "towel"], why: "Three Rochester-Carmalt clamps: ligate below the first, cut between the second and third. Longitudinal serrations crush vessels without slipping." },
      { text: "Place a circumferential + transfixing ligature on the ovarian pedicle, then transect. Repeat on the right side.", tool: "absorb", choices: ["absorb", "nylon", "gauze"], why: "Absorbable monofilament (e.g. 2-0/3-0 PDS) ligatures stay buried; nylon is never used internally. Check the pedicle for bleeding before releasing it." },
      { text: "Ligate the broad ligament vessels, then double-ligate the uterine body just cranial to the cervix and transect.", tool: "absorb", choices: ["absorb", "metz", "cautery"], why: "Two encircling/transfixing ligatures on the uterine body incorporating the uterine arteries. Inspect the stump for haemorrhage." },
      { text: "Close the linea alba with a simple continuous pattern, engaging the external rectus sheath.", tool: "needle", choices: ["needle", "kelly", "suction"], why: "The external rectus sheath is the holding layer. Needle holder grips the needle at its ⅔ point; bites 5–10 mm from the edge." },
      { text: "Close subcutaneous tissue (absorbable), then the skin.", tool: "nylon", choices: ["nylon", "absorb", "towel"], why: "Skin: simple interrupted or cruciate 3-0 nylon, removed at 10–14 days (or an intradermal absorbable pattern). Count swabs, check instruments, record the surgery." }
    ]
  },
  castration: {
    name: "Canine castration (pre-scrotal, closed)", species: ["dog"], level: 3, duration: "15–25 min",
    intro: "Both testes are removed through a single pre-scrotal incision. In the 'closed' technique the parietal vaginal tunic is left intact and ligated with the cord.",
    steps: [
      { text: "Drape the pre-scrotal area, pushing the scrotum caudally out of the field.", tool: "towel", choices: ["towel", "allis", "carmalt"], why: "Scrotal skin is too sensitive to incise directly in dogs, so the incision is made just cranial to it." },
      { text: "Push one testis cranially into the pre-scrotal area and incise skin and subcutis over it.", tool: "scalpel", choices: ["scalpel", "snook", "mayo"], why: "A 3–5 cm midline pre-scrotal incision over the advanced testis." },
      { text: "Exteriorise the testis within its tunic and strip the scrotal ligament with a dry gauze.", tool: "gauze", choices: ["gauze", "metz", "suction"], why: "Gauze gives friction to break the ligament attachment without cutting the tunic." },
      { text: "Triple-clamp the spermatic cord (with tunic) and place encircling + transfixing ligatures.", tool: "carmalt", choices: ["carmalt", "adson", "towel"], why: "Three-clamp technique; the ligature occupies the crush groove of the first clamp." },
      { text: "Ligate with absorbable suture, transect and inspect the stump; repeat on the second testis.", tool: "absorb", choices: ["absorb", "nylon", "cautery"], why: "Always inspect the stump before releasing it into the incision — haemorrhage into the scrotum is the most common complication." },
      { text: "Close subcutis and skin.", tool: "nylon", choices: ["nylon", "balfour", "kelly"], why: "Intradermal or simple interrupted. Send home with an E-collar and 10 days of restricted activity." }
    ]
  },
  gastrotomy: {
    name: "Gastrotomy — gastric foreign body removal", species: ["dog", "cat"], level: 4, duration: "45–90 min",
    intro: "Exploratory laparotomy with an incision into the stomach to remove a foreign object. The entire GI tract is explored as well.",
    steps: [
      { text: "Make a long ventral midline incision from xiphoid to caudal to the umbilicus.", tool: "scalpel", choices: ["scalpel", "metz", "snook"], why: "A generous incision is essential: you must explore the whole abdomen." },
      { text: "Open the linea alba and place a self-retaining retractor for exposure.", tool: "balfour", choices: ["balfour", "allis", "towel"], why: "A Balfour retractor frees the assistant's hands and gives a wide view of the stomach and intestines." },
      { text: "Exteriorise the stomach and pack it off from the rest of the abdomen with moistened laparotomy sponges.", tool: "gauze", choices: ["gauze", "cautery", "nylon"], why: "Isolating the stomach prevents gastric contents contaminating the peritoneal cavity." },
      { text: "Place two stay sutures and incise the stomach in the hypovascular area between the greater and lesser curvatures.", tool: "scalpel", choices: ["scalpel", "mayo", "carmalt"], why: "Stay sutures lift the wall; the ventral body of the stomach has the fewest large vessels." },
      { text: "Grasp and remove the foreign body; suction gastric fluid.", tool: "allis", choices: ["allis", "adson", "snook"], why: "Allis forceps grip firmly — acceptable because they are on the object or tissue to be removed, never on tissue you keep." },
      { text: "Close the stomach in two inverting layers (Cushing then Lembert) with absorbable monofilament.", tool: "absorb", choices: ["absorb", "nylon", "towel"], why: "Inverting patterns seal the mucosa inward; 3-0 PDS or poliglecaprone holds while the stomach heals in ~14 days." },
      { text: "Lavage the abdomen with warm sterile saline and suction it dry; change gloves and instruments.", tool: "saline", choices: ["saline", "cautery", "metz"], why: "Lavage reduces bacterial load; swapping to a clean set stops you re-contaminating the closure." },
      { text: "Close linea alba, subcutis and skin.", tool: "needle", choices: ["needle", "kelly", "suction"], why: "Three-layer closure. Count sponges before closing. Feed small meals from 12 h post-op." }
    ]
  },
  laceration: {
    name: "Laceration repair (bite wound)", species: ["dog", "cat"], level: 3, duration: "20–40 min",
    intro: "Contaminated wounds are cleaned, debrided and closed — or left to drain — under general anaesthesia or heavy sedation with local block.",
    steps: [
      { text: "Clip hair widely around the wound and protect the wound bed with sterile lubricant gel.", tool: "clipper", choices: ["clipper", "scalpel", "mayo"], why: "Gel traps loose hair so it can be rinsed away instead of entering the wound." },
      { text: "Lavage the wound copiously with warm sterile saline (ideally ≥ 500 mL).", tool: "saline", choices: ["saline", "chx", "cautery"], why: "Mechanical dilution removes bacteria and debris. Avoid full-strength antiseptics in the wound bed — they damage healthy cells." },
      { text: "Debride devitalised skin edges and crushed tissue.", tool: "scalpel", choices: ["scalpel", "allis", "towel"], why: "Sharp debridement back to bleeding, healthy tissue is faster-healing than leaving necrotic edges." },
      { text: "Undermine skin edges to relieve tension and explore for pockets.", tool: "metz", choices: ["metz", "mayo", "snook"], why: "Bite wounds have deep pockets ('iceberg' injuries). Metzenbaums dissect gently; a drain is placed if a dead space remains." },
      { text: "Close the deep layer with absorbable suture to eliminate dead space.", tool: "absorb", choices: ["absorb", "nylon", "gauze"], why: "Tacking sutures close dead space where fluid would accumulate." },
      { text: "Close the skin with simple interrupted sutures.", tool: "nylon", choices: ["nylon", "absorb", "cautery"], why: "Interrupted sutures allow partial release if infection develops. Antibiotics for bite wounds; recheck 3 days." }
    ]
  },
  ingluviotomy: {
    name: "Ingluviotomy (crop surgery)", species: ["bird"], level: 5, duration: "15–25 min",
    intro: "A small incision into the crop (ingluvies) on the left side of the lower neck to remove a foreign body. Bird is maintained on isoflurane via UNCUFFED tube, kept warm, and the crop is emptied beforehand.",
    steps: [
      { text: "Pluck (do not clip) a small area of feathers over the left lateral crop; prep with dilute chlorhexidine — avoid alcohol.", tool: "chx", choices: ["chx", "clipper", "saline"], why: "Alcohol evaporation causes dangerous heat loss in a 40 g patient; clippers shred feathers and skin." },
      { text: "Incise the skin over the crop, away from large vessels.", tool: "scalpel", choices: ["scalpel", "mayo", "allis"], why: "A #15 blade or fine scissors; the skin is paper-thin in birds." },
      { text: "Grasp the crop wall with fine forceps and make a small incision.", tool: "adson", choices: ["adson", "carmalt", "snook"], why: "Fine Adson or iris forceps; the crop wall is thin and vascular." },
      { text: "Remove the foreign body and flush the crop with warm saline.", tool: "saline", choices: ["saline", "cautery", "nylon"], why: "Check for any second object and inspect the crop lining." },
      { text: "Close the crop in a single inverting layer and the skin separately, with fine absorbable suture.", tool: "absorb", choices: ["absorb", "nylon", "towel"], why: "5-0 or 6-0 absorbable monofilament. Soft food only for 2–3 days; weigh daily." }
    ]
  }
};

/* Intra-op anaesthesia events: correct response first */
const ANES_EVENTS = [
  { text: "SpO₂ drops to 89 %, ETCO₂ still reading.", options: ["Check the ET tube and oxygen flow, ventilate, confirm probe placement", "Increase isoflurane", "Ignore — the probe is wrong"], why: "Low SpO₂ = hypoxaemia: check airway, oxygen supply and ventilation first; pulse-ox probes also slip, so confirm the reading." },
  { text: "Mean arterial pressure falls to 52 mmHg.", options: ["Reduce the inhalant, give a crystalloid fluid bolus (5–10 mL/kg), consider a vasopressor", "Increase the inhalant", "Stop the fluids"], why: "Hypotension (MAP < 60) is most often inhalant-induced vasodilation: turn the vaporiser down first, then fluids ± dopamine/ephedrine." },
  { text: "Core temperature reads 36.2 °C.", options: ["Active warming: forced-air blanket, warm fluids, cover extremities", "Nothing — animals run cool under anaesthesia", "Open a window"], why: "Hypothermia slows drug metabolism, delays recovery and increases infection risk. Warm from induction onward." },
  { text: "Heart rate rises sharply and the patient moves slightly.", options: ["Check anaesthetic depth (palpebral reflex, jaw tone) and deepen if light; top up analgesia", "Clamp more tissue quickly", "Turn off the oxygen"], why: "Movement and tachycardia under anaesthesia usually mean the plane is too light or pain is breaking through." },
  { text: "ETCO₂ climbs to 58 mmHg.", options: ["Assist ventilation (IPPV), check for rebreathing / exhausted soda lime", "Decrease oxygen flow", "Give more premedication"], why: "Hypercapnia = hypoventilation. Manual or mechanical ventilation corrects it; check the circuit too." }
];

/* Post-op & discharge */
const POSTOP = [
  "Recovery: turn off inhalant, continue 100 % O₂, monitor until the patient swallows — extubate at the first swallow (dogs/cats). Birds: extubate when they begin to move their head.",
  "Keep warm and quiet; monitor temperature, pulse and respiration every 15 min until sternal. Most anaesthetic deaths occur in the first 3 hours of recovery (AAHA).",
  "Analgesia: multimodal (opioid + NSAID where appropriate) for at least 3–5 days.",
  "Discharge: E-collar, restrict exercise 10–14 days, check the incision twice daily for redness, swelling or discharge. Suture removal / recheck at 10–14 days."
];

/* Shop inventory */
const SHOP_ITEMS = [
  { id: "food_dog", name: "Premium dog food 3 kg", price: 18, cost: 10, icon: "🥣", info: "Complete & balanced; feed by body condition, not by the bag's chart alone." },
  { id: "food_cat", name: "Adult cat food 2 kg", price: 15, cost: 8, icon: "🐟", info: "Cats are obligate carnivores — taurine and arginine are essential." },
  { id: "seed", name: "Pelleted parrot diet", price: 9, cost: 4, icon: "🌾", info: "Pellets beat seed-only diets, which cause vitamin A and calcium deficiency." },
  { id: "flea", name: "Flea & tick spot-on", price: 12, cost: 6, icon: "💧", info: "Monthly; dog products with permethrin are TOXIC to cats." },
  { id: "deworm", name: "Broad-spectrum dewormer", price: 8, cost: 3, icon: "💊", info: "Every 3 months for adults; monthly for puppies/kittens until 6 months." },
  { id: "ecollar", name: "Elizabethan collar", price: 7, cost: 3, icon: "⭕", info: "Must extend past the nose to protect the incision." },
  { id: "shampoo", name: "Hypoallergenic shampoo", price: 10, cost: 4, icon: "🧴", info: "Oatmeal-based; never use human shampoo (wrong skin pH)." },
  { id: "carrier", name: "Cat carrier", price: 25, cost: 14, icon: "🧺", info: "Top-opening carriers make vet visits far less stressful." },
  { id: "toothbrush", name: "Pet toothbrush & enzymatic paste", price: 9, cost: 4, icon: "🪥", info: "Daily brushing is the gold standard for preventing periodontal disease." },
  { id: "cuttle", name: "Cuttlebone & mineral block", price: 4, cost: 1.5, icon: "🦴", info: "Calcium source for birds; also keeps the beak worn." }
];

/* Office bookshelf / references */
const REFERENCES = [
  { id: "vitals", title: "Normal vital signs", icon: "📗", body: () => {
      let h = "<table class='ref'><tr><th>Species</th><th>Temp (°C)</th><th>Heart rate</th><th>Resp. rate</th><th>CRT</th></tr>";
      for (const k in SPECIES) { const s = SPECIES[k], v = s.vitals; h += `<tr><td>${s.emoji} ${s.label}</td><td>${v.temp[0]}–${v.temp[1]}</td><td>${v.hr[0]}–${v.hr[1]}</td><td>${v.rr[0]}–${v.rr[1]}</td><td>${v.crt}</td></tr>`; }
      h += "</table>";
      for (const k in SPECIES) h += `<p><b>${SPECIES[k].label}:</b> ${SPECIES[k].vitalsNote}</p>`;
      return h; } },
  { id: "asa", title: "ASA physical status classification", icon: "📘", body: () => `
      <table class='ref'><tr><th>ASA</th><th>Patient</th><th>Example</th></tr>
      <tr><td>I</td><td>Normal, healthy</td><td>Elective spay</td></tr>
      <tr><td>II</td><td>Mild systemic disease</td><td>Controlled diabetes, mild obesity</td></tr>
      <tr><td>III</td><td>Severe systemic disease</td><td>Anaemia, moderate dehydration, heart disease</td></tr>
      <tr><td>IV</td><td>Severe disease, constant threat to life</td><td>Shock, uraemia, ruptured bladder</td></tr>
      <tr><td>V</td><td>Moribund, not expected to survive 24 h</td><td>Severe trauma, multi-organ failure</td></tr></table>
      <p>Add "E" for emergency. Moving from ASA I–II to ≥ III raises the odds of anaesthetic death (Brodbelt 2008; AAHA 2020). Mortality in healthy pets is about 0.05 % (dogs) and 0.11 % (cats).</p>` },
  { id: "anes", title: "Anaesthesia: the continuum of care", icon: "📙", body: () => `
      <ol>${PREOP_STEPS.map(s => `<li><b>${s.label}.</b> ${typeof s.why === "function" ? s.why("dog") : s.why}</li>`).join("")}</ol>
      <h4>Monitoring targets under anaesthesia</h4>
      <ul><li>SpO₂ ≥ 95 %</li><li>ETCO₂ 35–45 mmHg</li><li>MAP ≥ 60 mmHg, systolic ≥ 90 mmHg</li><li>Temperature 37–39 °C (dog/cat)</li><li>Depth: ventromedial eye rotation, absent palpebral reflex, relaxed jaw tone = surgical plane</li></ul>
      <h4>Recovery</h4><ul>${POSTOP.map(p => `<li>${p}</li>`).join("")}</ul>` },
  { id: "asepsis", title: "Aseptic technique & surgeon scrub", icon: "📕", body: () => `
      <p>Asepsis covers five things: the <b>patient</b>, the <b>surgeon</b>, the <b>instruments</b> (steam autoclave 121 °C/15 min or 134 °C/3 min, indicator strips), the <b>environment</b> (dedicated theatre, minimal traffic, no clipping inside) and the <b>sterile field</b> (drapes; anything below table level is contaminated).</p>
      <ol>${SCRUB_STEPS.map(s => `<li><b>${s.label}.</b> ${s.why}</li>`).join("")}</ol>
      <p><b>Patient skin prep:</b> clip in the prep room, vacuum, chlorhexidine 2–4 % alternated with 70 % alcohol in a target pattern from the incision outward for ≥ 2–5 min, then a final sterile prep in theatre. Chlorhexidine-alcohol is superior to povidone-iodine for SSI prevention.</p>` },
  { id: "tools", title: "Surgical instrument atlas", icon: "🔧", body: () => Object.keys(TOOLS).map(k => `<div class='toolrow'>${toolSVG(k, 110, 44)}<div><b>${TOOLS[k].name}</b><br><span class='muted'>${TOOLS[k].desc}</span></div></div>`).join("") },
  { id: "handling", title: "Low-stress handling & when pets fight back", icon: "🐾", body: () => Object.keys(SPECIES).map(k => `<p><b>${SPECIES[k].emoji} ${SPECIES[k].label}:</b> ${SPECIES[k].handlingWhy}</p>`).join("") + "<p>Signs a patient is about to react: dog — whale eye, lip lift, stiff body, growl; cat — ears flat, tail thrash, hiss, dilated pupils; bird — open beak, raised feathers, lunging. Stop, step back, and change the plan (towel, muzzle, sedation) rather than forcing it.</p>" },
  { id: "anatomy", title: "Skeletal anatomy atlas", icon: "🦴", body: () => `<p>Hover any bone for its name. Dogs and cats have 7 cervical, 13 thoracic, 7 lumbar, 3 fused sacral and ~20 caudal vertebrae, and 13 pairs of ribs. Cats keep a tiny floating clavicle; dogs have none. Birds fuse many bones for flight: the carpometacarpus, tibiotarsus, tarsometatarsus, synsacrum and pygostyle, and have a huge keel (carina) for the flight muscles.</p>
      <div class='xrgrid'>${["dog", "cat", "bird"].map(s => `<div><h4>${SPECIES[s].label}</h4>${skeletonSVG(s, null, 360, 240)}</div>`).join("")}</div>` },
  { id: "wsava", title: "Body condition scoring", icon: "⚖️", body: () => "<ul>" + BCS.map(b => `<li>${b}</li>`).join("") + "</ul><p>Weigh every patient at every visit; a 10 % change in a cat is clinically significant.</p>" }
];

const ACHIEVEMENTS = [
  { id: "first_patient", name: "First Patient", desc: "Register your first patient at reception.", icon: "🛎️" },
  { id: "bell10", name: "Bell Ringer", desc: "See 10 patients.", icon: "🔔" },
  { id: "diagnose5", name: "Sharp Clinician", desc: "Make 5 correct diagnoses.", icon: "🩺" },
  { id: "xray1", name: "See-Through", desc: "Read your first radiograph.", icon: "🩻" },
  { id: "scrubbed", name: "Scrubbed In", desc: "Complete the full surgeon scrub sequence.", icon: "🧼" },
  { id: "first_surgery", name: "First Incision", desc: "Complete a surgery.", icon: "🔪" },
  { id: "flawless", name: "Steady Hands", desc: "Complete a surgery choosing every instrument correctly.", icon: "✨" },
  { id: "catwhisperer", name: "Cat Whisperer", desc: "Calm a fractious cat correctly.", icon: "😺" },
  { id: "birdnerd", name: "Bird Nerd", desc: "Treat a bird without compressing its chest.", icon: "🦜" },
  { id: "shop10", name: "Shopkeeper", desc: "Sell 10 items.", icon: "🛍️" },
  { id: "bookworm", name: "Bookworm", desc: "Read 5 references in the office.", icon: "📚" },
  { id: "decorator", name: "Interior Designer", desc: "Customise your clinic.", icon: "🎨" },
  { id: "shifts3", name: "Dedicated", desc: "Complete 3 shifts.", icon: "🌙" },
  { id: "blocked", name: "Rules Are Rules", desc: "Get stopped at the OR door for not being scrubbed in — and learn why.", icon: "🚫" }
];

const LEVELS = [
  { level: 1, xp: 0, unlock: "Wellness checkups, dogs & cats" },
  { level: 2, xp: 120, unlock: "X-ray suite + bird patients" },
  { level: 3, xp: 320, unlock: "Surgery: spay, castration, wound repair" },
  { level: 4, xp: 650, unlock: "Abdominal surgery: gastrotomy" },
  { level: 5, xp: 1100, unlock: "Avian surgery: ingluviotomy" },
  { level: 6, xp: 1700, unlock: "Master Surgeon title" }
];

const OWNER_NAMES = ["Omar", "Lina", "Yousef", "Hala", "Khaled", "Rana", "Sami", "Dana", "Faris", "Maya", "Tariq", "Salma"];
