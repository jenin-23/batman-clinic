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
    label: "Dog", icon: "dog", get emoji() { return icon("dog", 18, "sp"); }, soundFn: "bark",
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
    label: "Cat", icon: "cat", get emoji() { return icon("cat", 18, "sp"); }, soundFn: "meow",
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
    label: "Bird", icon: "bird", get emoji() { return icon("bird", 18, "sp"); }, soundFn: "chirp",
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
  { id: "food_dog", name: "Premium dog food 3 kg", price: 18, cost: 10, icon: "bowl", info: "Complete & balanced; feed by body condition, not by the bag's chart alone." },
  { id: "food_cat", name: "Adult cat food 2 kg", price: 15, cost: 8, icon: "fish", info: "Cats are obligate carnivores — taurine and arginine are essential." },
  { id: "seed", name: "Pelleted parrot diet", price: 9, cost: 4, icon: "leaf", info: "Pellets beat seed-only diets, which cause vitamin A and calcium deficiency." },
  { id: "flea", name: "Flea & tick spot-on", price: 12, cost: 6, icon: "drop", info: "Monthly; dog products with permethrin are TOXIC to cats." },
  { id: "deworm", name: "Broad-spectrum dewormer", price: 8, cost: 3, icon: "pill", info: "Every 3 months for adults; monthly for puppies/kittens until 6 months." },
  { id: "ecollar", name: "Elizabethan collar", price: 7, cost: 3, icon: "ring", info: "Must extend past the nose to protect the incision." },
  { id: "shampoo", name: "Hypoallergenic shampoo", price: 10, cost: 4, icon: "bottle", info: "Oatmeal-based; never use human shampoo (wrong skin pH)." },
  { id: "carrier", name: "Cat carrier", price: 25, cost: 14, icon: "basket", info: "Top-opening carriers make vet visits far less stressful." },
  { id: "toothbrush", name: "Pet toothbrush & enzymatic paste", price: 9, cost: 4, icon: "brush", info: "Daily brushing is the gold standard for preventing periodontal disease." },
  { id: "cuttle", name: "Cuttlebone & mineral block", price: 4, cost: 1.5, icon: "bone", info: "Calcium source for birds; also keeps the beak worn." }
];

/* Office bookshelf / references */
const REFERENCES = [
  { id: "vitals", title: "Normal vital signs", icon: "steth", body: () => {
      let h = "<table class='ref'><tr><th>Species</th><th>Temp (°C)</th><th>Heart rate</th><th>Resp. rate</th><th>CRT</th></tr>";
      for (const k in SPECIES) { const s = SPECIES[k], v = s.vitals; h += `<tr><td>${s.emoji} ${s.label}</td><td>${v.temp[0]}–${v.temp[1]}</td><td>${v.hr[0]}–${v.hr[1]}</td><td>${v.rr[0]}–${v.rr[1]}</td><td>${v.crt}</td></tr>`; }
      h += "</table>";
      for (const k in SPECIES) h += `<p><b>${SPECIES[k].label}:</b> ${SPECIES[k].vitalsNote}</p>`;
      return h; } },
  { id: "asa", title: "ASA physical status classification", icon: "monitor", body: () => `
      <table class='ref'><tr><th>ASA</th><th>Patient</th><th>Example</th></tr>
      <tr><td>I</td><td>Normal, healthy</td><td>Elective spay</td></tr>
      <tr><td>II</td><td>Mild systemic disease</td><td>Controlled diabetes, mild obesity</td></tr>
      <tr><td>III</td><td>Severe systemic disease</td><td>Anaemia, moderate dehydration, heart disease</td></tr>
      <tr><td>IV</td><td>Severe disease, constant threat to life</td><td>Shock, uraemia, ruptured bladder</td></tr>
      <tr><td>V</td><td>Moribund, not expected to survive 24 h</td><td>Severe trauma, multi-organ failure</td></tr></table>
      <p>Add "E" for emergency. Moving from ASA I–II to ≥ III raises the odds of anaesthetic death (Brodbelt 2008; AAHA 2020). Mortality in healthy pets is about 0.05 % (dogs) and 0.11 % (cats).</p>` },
  { id: "anes", title: "Anaesthesia: the continuum of care", icon: "monitor", body: () => `
      <ol>${PREOP_STEPS.map(s => `<li><b>${s.label}.</b> ${typeof s.why === "function" ? s.why("dog") : s.why}</li>`).join("")}</ol>
      <h4>Monitoring targets under anaesthesia</h4>
      <ul><li>SpO₂ ≥ 95 %</li><li>ETCO₂ 35–45 mmHg</li><li>MAP ≥ 60 mmHg, systolic ≥ 90 mmHg</li><li>Temperature 37–39 °C (dog/cat)</li><li>Depth: ventromedial eye rotation, absent palpebral reflex, relaxed jaw tone = surgical plane</li></ul>
      <h4>Recovery</h4><ul>${POSTOP.map(p => `<li>${p}</li>`).join("")}</ul>` },
  { id: "asepsis", title: "Aseptic technique & surgeon scrub", icon: "sink", body: () => `
      <p>Asepsis covers five things: the <b>patient</b>, the <b>surgeon</b>, the <b>instruments</b> (steam autoclave 121 °C/15 min or 134 °C/3 min, indicator strips), the <b>environment</b> (dedicated theatre, minimal traffic, no clipping inside) and the <b>sterile field</b> (drapes; anything below table level is contaminated).</p>
      <ol>${SCRUB_STEPS.map(s => `<li><b>${s.label}.</b> ${s.why}</li>`).join("")}</ol>
      <p><b>Patient skin prep:</b> clip in the prep room, vacuum, chlorhexidine 2–4 % alternated with 70 % alcohol in a target pattern from the incision outward for ≥ 2–5 min, then a final sterile prep in theatre. Chlorhexidine-alcohol is superior to povidone-iodine for SSI prevention.</p>` },
  { id: "tools", title: "Surgical instrument atlas", icon: "tray", body: () => Object.keys(TOOLS).map(k => `<div class='toolrow'>${toolSVG(k, 110, 44)}<div><b>${TOOLS[k].name}</b><br><span class='muted'>${TOOLS[k].desc}</span></div></div>`).join("") },
  { id: "handling", title: "Low-stress handling & when pets fight back", icon: "paw", body: () => Object.keys(SPECIES).map(k => `<p><b>${SPECIES[k].emoji} ${SPECIES[k].label}:</b> ${SPECIES[k].handlingWhy}</p>`).join("") + "<p>Signs a patient is about to react: dog — whale eye, lip lift, stiff body, growl; cat — ears flat, tail thrash, hiss, dilated pupils; bird — open beak, raised feathers, lunging. Stop, step back, and change the plan (towel, muzzle, sedation) rather than forcing it.</p>" },
  { id: "anatomy", title: "Skeletal anatomy atlas", icon: "xray", body: () => `<p>Hover any bone for its name. Dogs and cats have 7 cervical, 13 thoracic, 7 lumbar, 3 fused sacral and ~20 caudal vertebrae, and 13 pairs of ribs. Cats keep a tiny floating clavicle; dogs have none. Birds fuse many bones for flight: the carpometacarpus, tibiotarsus, tarsometatarsus, synsacrum and pygostyle, and have a huge keel (carina) for the flight muscles.</p>
      <div class='xrgrid'>${["dog", "cat", "bird"].map(s => `<div><h4>${SPECIES[s].label}</h4>${skeletonSVG(s, null, 360, 240)}</div>`).join("")}</div>` },
  { id: "wsava", title: "Body condition scoring", icon: "paw", body: () => "<ul>" + BCS.map(b => `<li>${b}</li>`).join("") + "</ul><p>Weigh every patient at every visit; a 10 % change in a cat is clinically significant.</p>" }
];

const ACHIEVEMENTS = [
  { id: "first_patient", name: "First Patient", desc: "Register your first patient at reception.", icon: "bell" },
  { id: "bell10", name: "Bell Ringer", desc: "See 10 patients.", icon: "bell" },
  { id: "diagnose5", name: "Sharp Clinician", desc: "Make 5 correct diagnoses.", icon: "steth" },
  { id: "xray1", name: "See-Through", desc: "Read your first radiograph.", icon: "xray" },
  { id: "scrubbed", name: "Scrubbed In", desc: "Complete the full surgeon scrub sequence.", icon: "sink" },
  { id: "first_surgery", name: "First Incision", desc: "Complete a surgery.", icon: "scalpel" },
  { id: "flawless", name: "Steady Hands", desc: "Complete a surgery choosing every instrument correctly.", icon: "star" },
  { id: "catwhisperer", name: "Cat Whisperer", desc: "Calm a fractious cat correctly.", icon: "cat" },
  { id: "birdnerd", name: "Bird Nerd", desc: "Treat a bird without compressing its chest.", icon: "bird" },
  { id: "shop10", name: "Shopkeeper", desc: "Sell 10 items.", icon: "shop" },
  { id: "bookworm", name: "Bookworm", desc: "Read 5 references in the office.", icon: "book" },
  { id: "decorator", name: "Interior Designer", desc: "Customise your clinic.", icon: "palette" },
  { id: "shifts3", name: "Dedicated", desc: "Complete 3 shifts.", icon: "moon" },
  { id: "blocked", name: "Rules Are Rules", desc: "Get stopped at the OR door for not being scrubbed in — and learn why.", icon: "block" },
  { id: "catfriend", name: "Mishmish Approves", desc: "Pet the clinic cat.", icon: "cat" },
  { id: "boss", name: "Team Builder", desc: "Hire your first staff member.", icon: "user" },
  { id: "investor", name: "Investor", desc: "Buy a piece of equipment.", icon: "coin" },
  { id: "expansion", name: "Growing Practice", desc: "Open a new room.", icon: "home" },
  { id: "detective", name: "Detective", desc: "Solve a mystery case on the differential board.", icon: "flask" },
  { id: "dentist", name: "Say Aah", desc: "Complete a dental with no errors.", icon: "tooth" },
  { id: "isolation", name: "Barrier Nurse", desc: "Treat an infectious case in isolation.", icon: "bed" },
  { id: "farmvet", name: "Country Vet", desc: "Answer a farm call.", icon: "van" },
  { id: "camp", name: "Herd Immunity", desc: "Run a vaccination camp.", icon: "drop" },
  { id: "accredited", name: "Accredited", desc: "Pass the board inspection.", icon: "check" },
  { id: "certified", name: "Diplomate", desc: "Pass the board certification exam.", icon: "trophy" },
  { id: "petparent", name: "Pet Parent", desc: "Feed the clinic pet.", icon: "bowl" },
  { id: "marketer", name: "Word of Mouth", desc: "Run a marketing campaign.", icon: "star" },
  { id: "explorer", name: "Fresh Air", desc: "Visit the garden across the street.", icon: "leaf" }
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

/* ============================================================
   v2 CONTENT
   ============================================================ */

/* --- Exotic species (ward expansion) --- */
SPECIES.rabbit = { label: "Rabbit", icon: "rabbit", get emoji() { return icon("rabbit", 18, "sp"); }, soundFn: "chirp",
  vitals: { temp: [38.5, 40.0], hr: [180, 250], rr: [30, 60], crt: "< 2 s", mm: "pink" },
  vitalsNote: "Rabbits cannot vomit and must NEVER be fasted before anaesthesia. Gut sounds should be heard on auscultation; silence means GI stasis.",
  fasting: "No fasting — rabbits cannot vomit and fasting triggers gut stasis. Remove food 30–60 min before only to clear the mouth.",
  handling: ["Support the hindquarters at all times; wrap in a towel ('bunny burrito')", "Hold by the ears", "Let it kick freely", "Flip onto its back (trancing)"],
  bestHandling: "Support the hindquarters at all times; wrap in a towel ('bunny burrito')",
  handlingWhy: "A rabbit's spine is fragile relative to its powerful hind legs — a kick without support can fracture the lumbar spine. Never lift by the ears; trancing is a fear response, not relaxation.",
  etTube: "Blind or endoscope-guided intubation with a small uncuffed tube (2–3 mm) or a V-gel supraglottic device; rabbits are obligate nasal breathers.",
  names: ["Thumper", "Mochi", "Snow", "Bunbun", "Clover"], breeds: ["Netherland Dwarf", "Lop", "Lionhead", "Rex"], weight: [1.2, 3.0] };
SPECIES.tortoise = { label: "Tortoise", icon: "tortoise", get emoji() { return icon("tortoise", 18, "sp"); }, soundFn: "click",
  vitals: { temp: [26, 32], hr: [20, 40], rr: [4, 10], crt: "n/a", mm: "pink" },
  vitalsNote: "Ectotherm: the 'normal' body temperature is whatever the preferred optimum temperature zone (POTZ) provides, 26–32 °C for Mediterranean tortoises. Heart rate is read with a Doppler over the thoracic inlet.",
  fasting: "Fast 24–48 h for large species; always warm to POTZ before any drug is given or it will not be metabolised.",
  handling: ["Hold firmly with both hands either side of the shell, low over a table", "Hold by one leg", "Tip it onto its back and spin", "Carry it high up by the head"],
  bestHandling: "Hold firmly with both hands either side of the shell, low over a table",
  handlingWhy: "Tortoises are stronger than they look and will push off; dropping one cracks the shell. Keep it low over a surface and never pull on the limbs or head.",
  etTube: "Uncuffed tube; tortoises have no diaphragm and breathe by limb/girdle movement, so IPPV is needed throughout anaesthesia.",
  names: ["Sheldon", "Zeno", "Pebble", "Tank"], breeds: ["Greek tortoise", "Hermann's tortoise", "Sulcata (juvenile)"], weight: [0.4, 2.5] };

/* --- Drugs (textbook adult doses; always verify against a formulary) --- */
const DRUGS = [
  { id: "meloxicam", name: "Meloxicam", cls: "NSAID", conc: 5, unit: "mg/mL", form: "injection 5 mg/mL", dose: { dog: 0.2, cat: 0.1, rabbit: 0.6, bird: 0.5, tortoise: 0.2 }, route: "SC", note: "Dog: 0.2 mg/kg loading then 0.1 mg/kg daily. Cat: single 0.1 mg/kg dose. Contraindicated in dehydration, renal disease, GI ulceration, and together with steroids or another NSAID." },
  { id: "carprofen", name: "Carprofen", cls: "NSAID", conc: 50, unit: "mg/mL", form: "injection 50 mg/mL", dose: { dog: 4.4 }, route: "SC", note: "Dogs only (4.4 mg/kg once daily or 2.2 twice daily). Not licensed for repeated use in cats." },
  { id: "amoxiclav", name: "Amoxicillin-clavulanate", cls: "Antibiotic", conc: 50, unit: "mg/mL", form: "oral suspension 50 mg/mL", dose: { dog: 12.5, cat: 12.5, bird: 125 }, route: "PO q12h", note: "Broad-spectrum first-line for skin and bite wounds. Never use penicillins in rabbits, guinea pigs or hamsters — fatal dysbiosis." },
  { id: "cefazolin", name: "Cefazolin", cls: "Antibiotic", conc: 100, unit: "mg/mL", form: "reconstituted 100 mg/mL", dose: { dog: 22, cat: 22 }, route: "IV at induction, repeat q90 min", note: "Perioperative prophylaxis for clean-contaminated surgery: give within 60 min before the first incision." },
  { id: "bupren", name: "Buprenorphine", cls: "Opioid analgesic", conc: 0.3, unit: "mg/mL", form: "injection 0.3 mg/mL", dose: { dog: 0.02, cat: 0.02, rabbit: 0.03, bird: 0.5 }, route: "IV/IM (cat: oral transmucosal)", note: "Partial μ-agonist; 6–8 h duration; excellent in cats by the buccal route." },
  { id: "methadone", name: "Methadone", cls: "Opioid analgesic", conc: 10, unit: "mg/mL", form: "injection 10 mg/mL", dose: { dog: 0.3, cat: 0.2 }, route: "IM/IV", note: "Full μ-agonist for moderate–severe surgical pain; part of the premedication for OHE, gastrotomy and fracture repair." },
  { id: "dexmed", name: "Dexmedetomidine", cls: "α2-agonist sedative", conc: 0.5, unit: "mg/mL", form: "injection 0.5 mg/mL", dose: { dog: 0.005, cat: 0.01 }, route: "IM", note: "Profound sedation and analgesia; causes bradycardia and vasoconstriction — avoid in cardiac disease, shock, the very young or old. Reversible with atipamezole." },
  { id: "propofol", name: "Propofol", cls: "Induction agent", conc: 10, unit: "mg/mL", form: "emulsion 10 mg/mL", dose: { dog: 4, cat: 6 }, route: "IV slowly to effect", note: "Give over 60–90 s to effect; apnoea is common if bolused. Shake, use within 24 h of opening." },
  { id: "alfax", name: "Alfaxalone", cls: "Induction agent", conc: 10, unit: "mg/mL", form: "injection 10 mg/mL", dose: { dog: 2, cat: 4, rabbit: 3, tortoise: 10, bird: 10 }, route: "IV (IM in exotics)", note: "Smooth induction, good cardiovascular stability; can be given IM in cats, rabbits and reptiles." },
  { id: "atropine", name: "Atropine", cls: "Anticholinergic / emergency", conc: 0.54, unit: "mg/mL", form: "injection 0.54 mg/mL", dose: { dog: 0.02, cat: 0.02 }, route: "IV/IM", note: "Treats bradycardia under anaesthesia. Avoid in dexmedetomidine-induced bradycardia (reverse the α2 instead)." },
  { id: "adrenaline", name: "Adrenaline (epinephrine)", cls: "Emergency", conc: 1, unit: "mg/mL", form: "1:1000 = 1 mg/mL", dose: { dog: 0.01, cat: 0.01 }, route: "IV every other CPR cycle", note: "Low-dose 0.01 mg/kg IV during CPR; chest compressions 100–120/min, 1 breath per 6 s (RECOVER guidelines)." },
  { id: "maropitant", name: "Maropitant", cls: "Anti-emetic", conc: 10, unit: "mg/mL", form: "injection 10 mg/mL", dose: { dog: 1, cat: 1 }, route: "SC q24h", note: "NK1 antagonist; prevents vomiting and reduces peri-operative nausea. Stings — give cold or IV." },
  { id: "enro", name: "Enrofloxacin", cls: "Antibiotic (fluoroquinolone)", conc: 50, unit: "mg/mL", form: "injection 50 mg/mL", dose: { dog: 5, cat: 5, rabbit: 10, bird: 15, tortoise: 5 }, route: "SC/PO", note: "Cats: never exceed 5 mg/kg/day — retinal degeneration and blindness. Avoid in growing puppies (cartilage)." },
  { id: "metoclop", name: "Metoclopramide", cls: "Prokinetic", conc: 5, unit: "mg/mL", form: "injection 5 mg/mL", dose: { rabbit: 0.5, dog: 0.3 }, route: "SC q8h", note: "Key drug for rabbit GI stasis together with fluids, syringe feeding and analgesia." },
  { id: "permethrin", name: "Permethrin spot-on", cls: "Ectoparasiticide", conc: 0, unit: "", form: "dog spot-on", dose: { dog: 1 }, route: "topical", note: "TOXIC TO CATS — tremors, seizures, death. Never dispense dog permethrin products to a household that also has cats sleeping with the dog." }
];

/* --- Lab reference ranges --- */
const LAB = {
  dog: { PCV: [37, 55, "%"], TP: [5.5, 7.5, "g/dL"], Glucose: [70, 120, "mg/dL"], BUN: [7, 27, "mg/dL"], Creatinine: [0.5, 1.8, "mg/dL"], ALT: [10, 100, "U/L"], WBC: [6, 17, "×10³/µL"], Platelets: [200, 500, "×10³/µL"], Potassium: [3.5, 5.8, "mmol/L"] },
  cat: { PCV: [30, 45, "%"], TP: [6.0, 8.0, "g/dL"], Glucose: [70, 150, "mg/dL"], BUN: [16, 36, "mg/dL"], Creatinine: [0.8, 2.4, "mg/dL"], ALT: [12, 130, "U/L"], WBC: [5.5, 19.5, "×10³/µL"], Platelets: [175, 500, "×10³/µL"], Potassium: [3.5, 5.8, "mmol/L"] },
  bird: { PCV: [40, 55, "%"], TP: [3, 5, "g/dL"], Glucose: [200, 400, "mg/dL"], "Uric acid": [2, 10, "mg/dL"], AST: [100, 350, "U/L"], WBC: [5, 15, "×10³/µL"] },
  rabbit: { PCV: [33, 50, "%"], TP: [5.4, 7.5, "g/dL"], Glucose: [75, 155, "mg/dL"], BUN: [13, 29, "mg/dL"], Creatinine: [0.5, 2.5, "mg/dL"], WBC: [5, 12, "×10³/µL"] },
  tortoise: { PCV: [20, 35, "%"], TP: [3, 6, "g/dL"], Glucose: [60, 130, "mg/dL"], "Uric acid": [1, 8, "mg/dL"], AST: [50, 250, "U/L"] }
};
/* lab scenarios: which analytes are off and what it means */
const LAB_SCENARIOS = {
  normal: { changes: {}, meaning: "All values within reference range — ASA I; proceed with the standard anaesthetic plan.", options: ["Normal panel — proceed as planned", "Anaemia — transfuse first", "Kidney failure — cancel surgery"], correct: 0 },
  dehydrated: { changes: { PCV: 1.15, TP: 1.15, BUN: 1.4 }, meaning: "Raised PCV, total protein and BUN together = haemoconcentration from dehydration (pre-renal azotaemia). Rehydrate with IV crystalloids for several hours before anaesthesia.", options: ["Dehydration (pre-renal) — IV fluids before anaesthesia", "Polycythaemia — phlebotomy", "Normal — proceed"], correct: 0 },
  anaemia: { changes: { PCV: 0.6, TP: 0.9 }, meaning: "Low PCV = anaemia. Below ~20 % the patient needs a transfusion before anaesthesia; find the cause (blood loss, haemolysis, chronic disease, fleas in kittens).", options: ["Anaemia — investigate and consider transfusion before surgery", "Dehydration — give fluids", "Normal variation"], correct: 0 },
  renal: { changes: { BUN: 2.2, Creatinine: 2.4, PCV: 0.85 }, meaning: "Raised BUN and creatinine with a normal/low PCV and dilute urine = renal azotaemia. ASA III–IV: fluids, avoid NSAIDs, reduce drug doses, consider postponing elective surgery.", options: ["Renal disease — ASA III, avoid NSAIDs, fluids, postpone elective surgery", "Dehydration — proceed after a bolus", "Liver disease — give antibiotics"], correct: 0 },
  infection: { changes: { WBC: 2.3, Glucose: 0.8 }, meaning: "Marked leukocytosis (neutrophilia with left shift) = inflammation/infection — typical for pyometra or an abscess. Start IV fluids and antibiotics; surgery is still indicated (source control).", options: ["Inflammatory leukogram — stabilise and proceed to source control surgery", "Leukaemia — refer oncology", "Lab error — repeat"], correct: 0 },
  hepatic: { changes: { ALT: 4, TP: 0.85, Glucose: 0.75 }, meaning: "Very high ALT with low protein and glucose points to hepatic dysfunction: choose drugs that do not rely on liver metabolism, check clotting before surgery.", options: ["Hepatopathy — check clotting, adjust anaesthetic drugs", "Pancreatitis — fast for 48 h", "Normal for breed"], correct: 0 }
};

/* --- Dental (modified Triadan numbering) --- */
const DENTAL = {
  dog: { quadrants: { 1: "Upper right (100s)", 2: "Upper left (200s)", 3: "Lower left (300s)", 4: "Lower right (400s)" }, teeth: { upper: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], lower: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }, names: { 1: "1st incisor", 2: "2nd incisor", 3: "3rd incisor", 4: "canine", 5: "1st premolar", 6: "2nd premolar", 7: "3rd premolar", 8: "4th premolar (upper carnassial)", 9: "1st molar (lower carnassial)", 10: "2nd molar", 11: "3rd molar" } },
  cat: { quadrants: { 1: "Upper right (100s)", 2: "Upper left (200s)", 3: "Lower left (300s)", 4: "Lower right (400s)" }, teeth: { upper: [1, 2, 3, 4, 6, 7, 8, 9], lower: [1, 2, 3, 4, 7, 8, 9] }, names: { 1: "1st incisor", 2: "2nd incisor", 3: "3rd incisor", 4: "canine", 6: "2nd premolar", 7: "3rd premolar", 8: "4th premolar (upper carnassial)", 9: "1st molar" } },
  stages: ["Stage 0 — clinically normal", "Stage 1 — gingivitis only, no attachment loss (reversible with scaling + home care)", "Stage 2 — early periodontitis, < 25 % attachment loss", "Stage 3 — moderate periodontitis, 25–50 % attachment loss", "Stage 4 — advanced periodontitis, > 50 % loss; extraction usually indicated"],
  lesions: { calculus: { label: "Calculus & gingivitis", action: "scale", why: "Supragingival and subgingival scaling with an ultrasonic scaler, then polish to remove the micro-scratches that re-attract plaque." }, fracture: { label: "Complicated crown fracture (pulp exposed)", action: "extract", why: "An exposed pulp is painful and will abscess; options are root canal (referral) or surgical extraction — never 'leave it and see'." }, forl: { label: "Tooth resorption (feline resorptive lesion)", action: "extract", why: "Progressive, very painful lesion in cats; extraction (or crown amputation for type 2 with root replacement) is the treatment." }, mobile: { label: "Grade 3 mobility, stage 4 periodontitis", action: "extract", why: "More than 50 % attachment loss and marked mobility: the tooth cannot be saved; extract and close the gingiva with absorbable suture." }, healthy: { label: "Healthy", action: "leave", why: "A healthy tooth with no probing depth is left alone — unnecessary extraction is malpractice." } }
};

/* --- Microscope fields --- */
const CYTOLOGY = {
  yeast: { label: "Malassezia yeast (peanut / footprint shapes)", dx: "Yeast otitis externa — topical antifungal (e.g. miconazole-based ear drops) + cleaning.", draw: "yeast" },
  cocci: { label: "Cocci in clusters (Staphylococcus)", dx: "Bacterial otitis/pyoderma — topical antibacterial, culture if recurrent.", draw: "cocci" },
  rods: { label: "Rod-shaped bacteria (Pseudomonas, E. coli)", dx: "Rods in an ear = culture and sensitivity before choosing an antibiotic; often resistant.", draw: "rods" },
  mites: { label: "Otodectes cynotis (ear mites) with eggs", dx: "Ear mites — treat all in-contact animals with a systemic isoxazoline or topical acaricide.", draw: "mites" },
  eggs: { label: "Toxocara eggs on faecal float (thick-shelled, round)", dx: "Roundworm infection — deworm with pyrantel/fenbendazole, repeat in 2–3 weeks; zoonotic, advise hygiene.", draw: "eggs" },
  demodex: { label: "Demodex canis (cigar-shaped mites) on skin scrape", dx: "Demodicosis — isoxazoline treatment, check for underlying immunosuppression.", draw: "demodex" }
};
/* --- ECG rhythms --- */
const ECG = {
  sinus: { label: "Normal sinus rhythm", action: "Continue monitoring.", draw: "sinus" },
  rsa: { label: "Respiratory sinus arrhythmia (normal in dogs)", action: "No treatment — rate varies with breathing; normal in dogs, abnormal in cats.", draw: "rsa" },
  brady: { label: "Sinus bradycardia", action: "Lighten the anaesthetic plane, check temperature; atropine/glycopyrrolate if MAP is falling (unless from an α2 agonist — reverse it instead).", draw: "brady" },
  vpc: { label: "Ventricular premature complexes (wide, bizarre QRS)", action: "Check oxygenation and depth; if runs > 160 bpm or multiform: lidocaine 2 mg/kg IV (dog). Common after splenic surgery and GDV.", draw: "vpc" },
  av2: { label: "Second-degree AV block (dropped QRS after a P wave)", action: "Often vagal or α2-induced; atropine response test; stop surgery if haemodynamically significant.", draw: "av2" },
  vfib: { label: "Ventricular fibrillation — no pulse", action: "Start CPR immediately: compressions 100–120/min, defibrillate 4–6 J/kg, adrenaline low-dose after the 2nd cycle.", draw: "vfib" }
};

/* --- New cases --- */
CASES.push(
  { id: "heat_dog", species: "dog", level: 2, outcome: "checkup", emergency: true, complaint: "Collapsed after running in the midday heat — panting hard, drooling.", findings: "T 41.6 °C, HR 170, RR panting, MM brick-red, CRT < 1 s, dull mentation.", options: ["Heat stroke — active cooling to 39.5 °C (tepid water + fan), IV fluids, monitor for DIC/AKI for 48 h", "Ice bath until 37 °C", "Send home to rest"], correct: 0, why: "Cool actively but stop at 39.5 °C to avoid rebound hypothermia; never ice-water (vasoconstriction traps heat). Heat stroke patients need 24–72 h monitoring for kidney injury and clotting disorders.", fee: 120, season: "heatwave" },
  { id: "parvo_pup", species: "dog", level: 2, outcome: "checkup", emergency: true, isolation: true, complaint: "Puppy with foul bloody diarrhoea and vomiting since yesterday, unvaccinated.", findings: "12-week puppy, 8 % dehydrated, T 39.8 °C, HR 160, painful abdomen, neutropenia on in-house CBC. Parvo SNAP positive.", options: ["Parvovirus — ISOLATE, barrier nursing, IV fluids, anti-emetics, antibiotics for sepsis, nutrition", "Vaccinate now and send home", "Treat as dietary upset"], correct: 0, why: "Parvo is highly contagious and survives in the environment for months. The patient goes to isolation with dedicated PPE; everything that touches it is disinfected (bleach 1:30 or accelerated hydrogen peroxide). Survival with intensive care is 80–90 %.", fee: 260, season: "parvo" },
  { id: "tick_dog", species: "dog", level: 2, outcome: "checkup", complaint: "Lethargic, off food, dark urine after a hike; owner removed ticks.", findings: "T 40.1 °C, pale MM, enlarged lymph nodes, platelets low on smear.", options: ["Tick-borne disease (Ehrlichia/Babesia) — blood smear & PCR, doxycycline / imidocarb, tick prevention for all pets", "Vaccine reaction — antihistamine", "Nothing — ticks were removed"], correct: 0, why: "Fever, thrombocytopenia and pallor after tick exposure = test for Ehrlichia, Anaplasma and Babesia. Treatment differs (doxycycline vs imidocarb), so confirm before treating.", fee: 110, season: "ticks" },
  { id: "pyometra", species: "dog", level: 3, outcome: "surgery", procedure: "pyometra", emergency: true, complaint: "Older intact female, drinking a lot, vomiting, purulent discharge from the vulva 4 weeks after heat.", findings: "T 39.9 °C, HR 140, depressed, distended painful abdomen, PU/PD. WBC 38 ×10³. Ultrasound: fluid-filled uterus.", options: ["Pyometra — IV fluids, antibiotics, emergency ovariohysterectomy", "Antibiotics only and recheck next week", "Induce heat with hormones"], correct: 0, why: "Pyometra is a life-threatening uterine infection; the uterus can rupture. Stabilise for a few hours with fluids and antibiotics, then OHE the same day. The friable uterus must be handled gently.", fee: 420, lab: "infection" },
  { id: "stones_dog", species: "dog", level: 4, outcome: "surgery", procedure: "cystotomy", complaint: "Straining to urinate, blood in urine, recurrent for months.", findings: "Painful distended bladder, haematuria; male. Radiograph: multiple radio-opaque calculi in the bladder.", options: ["Radiograph, then cystotomy to remove the stones; send stones for analysis; dietary prevention", "Antibiotics alone", "Squeeze the bladder to express them"], correct: 0, why: "Struvite and calcium oxalate stones are radio-opaque. Cystotomy removes them; analysing the stones guides the diet that prevents recurrence. Always check the urethra for stones too.", xray: { view: "dog", finding: "bladder_stones", label: "Multiple radio-opaque cystic calculi" }, fee: 380 },
  { id: "spleen_dog", species: "dog", level: 5, outcome: "surgery", procedure: "splenectomy", emergency: true, complaint: "Old large-breed dog, sudden weakness and pale gums, collapsed.", findings: "Pale MM, CRT 3 s, HR 160, weak pulses, distended abdomen with fluid wave. PCV 22 %. Ultrasound: splenic mass with free fluid.", options: ["Haemoabdomen from a splenic mass — stabilise (fluids ± transfusion), emergency splenectomy, histopathology", "Drain the abdomen and send home", "Antibiotics for peritonitis"], correct: 0, why: "A bleeding splenic mass (haemangiosarcoma or haematoma) is a surgical emergency. Watch for ventricular arrhythmias for 24–48 h after splenectomy.", fee: 650, lab: "anaemia" },
  { id: "rabbit_stasis", species: "rabbit", level: 2, outcome: "checkup", emergency: true, needs: "ward", complaint: "Rabbit hasn't eaten or passed droppings for 24 hours, hunched and grinding teeth.", findings: "Hunched, bruxism, T 38.2 °C (low), HR 240, doughy stomach, no gut sounds, small dry droppings.", options: ["GI stasis — warmth, fluids, syringe feeding, analgesia (meloxicam/buprenorphine), prokinetics, find the cause (teeth, pain, diet)", "Fast for 24 h to rest the gut", "Surgery immediately"], correct: 0, why: "Rabbit gut stasis is an emergency — gut flora die and the rabbit decompensates within 24–48 h. Supportive care reverses most cases; surgery is reserved for confirmed obstruction. Check the molars for spurs.", fee: 140 },
  { id: "rabbit_teeth", species: "rabbit", level: 3, outcome: "checkup", needs: "dental", complaint: "Rabbit drooling, dropping food, wet chin.", findings: "Molar spurs lacerating the tongue on oral exam, incisors overgrown and misaligned, weight loss.", options: ["Dental disease — molar burring under anaesthesia, incisor trim, hay-based diet", "Clip incisors with nail clippers", "Antibiotics for drooling"], correct: 0, why: "Rabbit teeth grow continuously; a low-fibre diet causes overgrowth. Molar spurs are burred with a dental drill under anaesthesia; clipping shatters teeth.", fee: 160 },
  { id: "tortoise_rhino", species: "tortoise", level: 3, outcome: "checkup", needs: "ward", complaint: "Tortoise with bubbles from the nose and swollen eyes after a cold winter.", findings: "Nasal discharge, closed swollen eyelids, lethargic, enclosure temperature only 18 °C, no UVB lamp. Weight low for shell length.", options: ["Husbandry disease — correct temperature to POTZ (26–32 °C) + UVB, fluids, nasal flush, antibiotics if bacterial; vitamin A assessment", "Give a dog antibiotic and send home", "Keep it cooler to slow the infection"], correct: 0, why: "Most reptile illness is husbandry: too cold, no UVB, poor diet. Drugs don't work in a cold reptile because metabolism is temperature-dependent. Hypovitaminosis A causes the swollen eyelids.", fee: 120 },
  { id: "dental_dog", species: "dog", level: 3, outcome: "dental", needs: "dental", complaint: "Bad breath, dropping food, red gums.", findings: "Heavy calculus, stage 3 periodontitis, a fractured upper 4th premolar with pulp exposure, loose lower incisor.", options: ["Dental under anaesthesia: full-mouth radiographs, scale & polish, extract the fractured carnassial and the mobile incisor", "Anaesthesia-free scaling", "Antibiotics only"], correct: 0, why: "Anaesthesia-free scaling is cosmetic and dangerous; disease is below the gumline. Dental radiographs find hidden root pathology.", fee: 320 },
  { id: "dental_cat", species: "cat", level: 3, outcome: "dental", needs: "dental", complaint: "Cat chattering its jaw when eating, pawing at the mouth.", findings: "Gingivitis, tooth resorption lesions on 307 and 407, calculus.", options: ["Dental radiographs, scale & polish, extract the resorptive lesions", "Steroids for the gums", "Soft food only"], correct: 0, why: "Feline tooth resorption is extremely painful (jaw chattering is the tell-tale sign). Radiographs decide extraction vs crown amputation.", fee: 300 },
  { id: "blocked_cat", species: "cat", level: 3, outcome: "checkup", emergency: true, complaint: "Male cat straining in the litter tray, crying, nothing comes out.", findings: "Large, hard, painful bladder; HR 120 (bradycardia!), weak, T 36.8 °C. Potassium 8.1 mmol/L.", options: ["Urethral obstruction — ECG, treat hyperkalaemia (calcium gluconate, insulin/dextrose), sedate and unblock with a urinary catheter, fluids", "Send home with antibiotics", "Express the bladder forcefully"], correct: 0, why: "A blocked tom is a true emergency — hyperkalaemia stops the heart (bradycardia, absent P waves). Stabilise the potassium first, then relieve the obstruction. Never squeeze a blocked bladder: it ruptures.", fee: 350, lab: "renal" },
  { id: "mystery_addison", species: "dog", level: 3, outcome: "checkup", mystery: true, complaint: "Young female dog, vague waxing-and-waning illness: vomiting, weakness, 'just not right' for weeks.", findings: "Weak, HR 60 (too slow for a sick dog), mild dehydration. Needs tests.", options: ["Hypoadrenocorticism (Addison's) — confirm with ACTH stimulation, treat with fluids and steroid/mineralocorticoid", "Pancreatitis", "Behavioural"], correct: 0, why: "The 'great pretender': waxing-waning GI signs, bradycardia in a sick dog and a Na:K ratio < 27 on bloods point to Addison's. ACTH stimulation test confirms.", fee: 200, ddx: { symptoms: ["Intermittent vomiting", "Weakness", "Bradycardia", "Weight loss"], tests: { cbc: "No stress leukogram (lymphocytes normal — unusual in a sick dog)", chem: "Na 132, K 6.4 → Na:K ratio 20.6; mild azotaemia", xray: "Microcardia", ultrasound: "Small adrenal glands", cytology: "Unremarkable", urinalysis: "USG 1.012 (dilute despite dehydration)" }, needed: ["cbc", "chem"], dx: ["Addison's disease", "Pancreatitis", "Kidney failure", "Foreign body"], correct: 0 } },
  { id: "mystery_fb_cat", species: "cat", level: 3, outcome: "surgery", procedure: "gastrotomy", mystery: true, complaint: "Cat vomiting intermittently for a week, plays with hair ties.", findings: "Mild abdominal discomfort, slightly dehydrated. Needs tests.", options: ["Linear/gastric foreign body — imaging then surgery", "Hairballs — laxative", "Dietary indiscretion"], correct: 0, why: "Hair ties and string are classic feline foreign bodies; a linear foreign body can plicate the intestine. Imaging first, surgery to remove.", xray: { view: "cat", finding: "foreign_body", label: "Gastric foreign body with plication pattern" }, fee: 380, ddx: { symptoms: ["Intermittent vomiting", "Reduced appetite", "Mild abdominal pain"], tests: { cbc: "Mild dehydration pattern", chem: "Mild hypokalaemia from vomiting", xray: "Bunched, plicated intestines; radio-opaque object in the stomach", ultrasound: "Hyperechoic shadowing object in the stomach, plicated bowel", cytology: "Unremarkable", urinalysis: "Concentrated urine" }, needed: ["xray"], dx: ["Foreign body", "Hairball", "Inflammatory bowel disease", "Pancreatitis"], correct: 0 } },
  { id: "farm_goat", species: "dog", level: 4, outcome: "checkup", farm: true, complaint: "FARM CALL — goat lame on a front foot, hot swollen hoof.", findings: "Severe lameness, heat and pain over the sole, black pus when the sole is pared.", options: ["Foot abscess — pare out the sole to drain, flush, bandage, NSAID; check the rest of the flock's feet", "Amputate the leg", "Wait for it to burst"], correct: 0, why: "Hoof abscesses drain through the sole with a hoof knife; once drained the relief is immediate. Foot bathing the flock prevents footrot spread.", fee: 150 },
  { id: "farm_horse", species: "dog", level: 5, outcome: "checkup", farm: true, emergency: true, complaint: "FARM CALL — horse rolling and pawing, sweating, off feed since morning.", findings: "HR 56, no gut sounds in two quadrants, MM tacky, mild distension. Nasogastric tube: 4 L reflux.", options: ["Colic — analgesia (flunixin), nasogastric decompression, rectal exam, IV fluids; refer for surgery if pain is uncontrolled", "Walk it for 6 hours", "Give oral oil and leave"], correct: 0, why: "Reflux on the stomach tube means decompression is life-saving (horses cannot vomit). Heart rate above 60 and uncontrolled pain are referral criteria for surgical colic.", fee: 260 }
);

/* --- New procedures --- */
PROCEDURES.pyometra = { name: "Emergency ovariohysterectomy (pyometra)", species: ["dog", "cat"], level: 3, duration: "45–75 min", approach: null,
  intro: "Like an elective spay but the uterus is distended, friable and full of pus: handle gently, pack off, and never let it rupture into the abdomen.",
  steps: [
    { text: "Drape widely — the incision runs from umbilicus to pubis for a distended uterus.", tool: "towel", choices: ["towel", "kelly", "snook"], why: "Four quarter drapes and clamps; a long incision needs a wide sterile field." },
    { text: "Long ventral midline skin incision.", tool: "scalpel", choices: ["scalpel", "mayo", "metz"], why: "You need room to lift the uterus out without tearing it." },
    { text: "Open the linea alba and place a self-retaining retractor.", tool: "balfour", choices: ["balfour", "allis", "adson"], why: "Exposure matters more than ever — a rupture would spill pus into the abdomen." },
    { text: "Pack moistened laparotomy sponges around the uterus before exteriorising it.", tool: "gauze", choices: ["gauze", "suction", "cautery"], why: "Packing isolates the friable uterus from the rest of the abdomen in case it leaks." },
    { text: "Clamp and ligate the ovarian pedicles (triple clamp, transfixing ligatures).", tool: "carmalt", choices: ["carmalt", "adson", "towel"], why: "Vessels are enlarged and the tissue oedematous: use heavier suture (0 or 2-0) and double ligatures." },
    { text: "Ligate the uterine body just cranial to the cervix with two transfixing ligatures; transect; do NOT milk pus toward the cervix.", tool: "absorb", choices: ["absorb", "nylon", "metz"], why: "The stump is lavaged but not oversewn into the lumen; culture the pus." },
    { text: "Change gloves and instruments; lavage the abdomen with warm sterile saline.", tool: "saline", choices: ["saline", "cautery", "allis"], why: "Anything that touched the uterus is now contaminated." },
    { text: "Close linea alba, subcutis and skin.", tool: "needle", choices: ["needle", "kelly", "suction"], why: "Continue IV fluids and antibiotics post-op; most patients are dramatically better within 24 h." }
  ] };
PROCEDURES.cystotomy = { name: "Cystotomy (bladder stone removal)", species: ["dog", "cat"], level: 4, duration: "40–60 min",
  intro: "The bladder is opened on its ventral surface, the stones removed, and the urethra flushed to make sure none remain.",
  steps: [
    { text: "Caudal ventral midline incision (parapreputial in male dogs).", tool: "scalpel", choices: ["scalpel", "snook", "mayo"], why: "In male dogs the incision curves around the prepuce." },
    { text: "Exteriorise the bladder and pack it off with moistened sponges.", tool: "gauze", choices: ["gauze", "balfour", "cautery"], why: "Urine is contaminated — isolate the bladder from the abdomen." },
    { text: "Place stay sutures and incise the ventral bladder wall away from the ureters.", tool: "scalpel", choices: ["scalpel", "carmalt", "allis"], why: "Stay sutures lift the wall; the ventral surface avoids the trigone and ureteral openings." },
    { text: "Remove the stones with a spoon or forceps; flush the urethra normograde and retrograde with saline.", tool: "saline", choices: ["saline", "suction", "nylon"], why: "Stones hide in the urethra — flushing both ways plus a post-op radiograph confirms none remain. Send stones for analysis." },
    { text: "Close the bladder in a single or double appositional layer with absorbable monofilament (do not penetrate the mucosa).", tool: "absorb", choices: ["absorb", "nylon", "towel"], why: "Suture in the lumen becomes a nidus for new stones; 3-0/4-0 poliglecaprone or PDS." },
    { text: "Lavage, close linea alba, subcutis and skin.", tool: "needle", choices: ["needle", "kelly", "snook"], why: "Dietary dissolution/prevention plan based on stone analysis." }
  ] };
PROCEDURES.splenectomy = { name: "Splenectomy (bleeding splenic mass)", species: ["dog"], level: 5, duration: "45–90 min",
  intro: "The whole spleen is removed by ligating or sealing the hilar vessels. The patient is unstable — speed and haemostasis are everything.",
  steps: [
    { text: "Xiphoid-to-pubis ventral midline incision.", tool: "scalpel", choices: ["scalpel", "metz", "snook"], why: "Maximum exposure; suction ready for the haemoabdomen." },
    { text: "Suction the free blood and exteriorise the spleen gently onto moistened sponges.", tool: "suction", choices: ["suction", "cautery", "nylon"], why: "Poole suction tip; avoid rupturing the mass further." },
    { text: "Clamp and ligate the hilar splenic vessels close to the spleen (preserve the short gastric and left gastroepiploic supply to the stomach).", tool: "carmalt", choices: ["carmalt", "adson", "towel"], why: "Ligate vessel by vessel at the hilus (or use a vessel-sealing device) to avoid devascularising the stomach." },
    { text: "Double-ligate each pedicle with absorbable suture and transect.", tool: "absorb", choices: ["absorb", "nylon", "gauze"], why: "Large vessels get double ligatures; check every stump before releasing." },
    { text: "Explore the liver and abdomen for metastases; biopsy anything suspicious.", tool: "allis", choices: ["allis", "snook", "balfour"], why: "Haemangiosarcoma commonly spreads to the liver — staging changes the prognosis you give the owner." },
    { text: "Lavage, count sponges, close in three layers.", tool: "needle", choices: ["needle", "kelly", "suction"], why: "ECG monitoring for 24–48 h: ventricular arrhythmias are common after splenectomy." }
  ] };
PROCEDURES.robert_jones = { name: "Robert Jones bandage (fracture first-aid)", species: ["dog", "cat"], level: 2, duration: "15 min", nonsterile: true,
  intro: "A thick, padded bandage that immobilises a fracture distal to the elbow or stifle until definitive repair.",
  steps: [
    { text: "Place adhesive tape stirrups on the paw.", tool: "bandage", choices: ["bandage", "scalpel", "towel"], why: "Stirrups stop the bandage sliding off the limb." },
    { text: "Apply thick layers of cotton wool padding from toes to above the joint proximal to the fracture.", tool: "bandage", choices: ["bandage", "gauze", "saline"], why: "The padding is what gives rigidity once compressed; include the joint above and below." },
    { text: "Compress firmly with conforming gauze, then an outer cohesive layer; leave the two middle toes visible.", tool: "bandage", choices: ["bandage", "nylon", "clipper"], why: "The toes let the owner check for swelling or coldness daily. A good Robert Jones 'thumps' like a ripe melon." }
  ] };
PROCEDURES.hoof = { name: "Hoof abscess drainage (goat)", species: ["dog"], level: 4, duration: "15 min", nonsterile: true,
  intro: "Field procedure: find the black tract in the sole, pare it open, drain and protect.",
  steps: [
    { text: "Clean the foot and locate the painful point with hoof testers.", tool: "saline", choices: ["saline", "cautery", "carmalt"], why: "Pain on pressure localises the abscess." },
    { text: "Pare the sole with a hoof knife until the black tract opens and pus drains.", tool: "scalpel", choices: ["scalpel", "metz", "snook"], why: "Open a cone-shaped hole wide enough not to seal over." },
    { text: "Flush, apply poultice and a waterproof bandage; NSAID; recheck in 3 days.", tool: "bandage", choices: ["bandage", "nylon", "towel"], why: "Tetanus cover for horses; check the rest of the herd." }
  ] };
/* approach choices for elective procedures */
PROCEDURES.ohe.approaches = [{ id: "midline", label: "Ventral midline", why: "Standard approach; best access to both ovaries and the uterine body; essential if pyometra or pregnancy is suspected." }, { id: "flank", label: "Left flank (cats)", why: "Common in the UK for cats: small incision, easy to monitor without turning the cat over; harder to reach the right ovary and not suitable for pregnant or pyometra cases.", species: ["cat"] }];
PROCEDURES.castration.approaches = [{ id: "closed", label: "Closed (tunic intact)", why: "The vaginal tunic is ligated with the cord — no communication with the abdomen, preferred in small dogs and cats." }, { id: "open", label: "Open (tunic incised)", why: "The tunic is opened so each structure is ligated individually; better control in large dogs with big cords; the tunic is then closed." }];

/* --- Owner personalities --- */
const OWNER_TYPES = {
  anxious: { label: "anxious", intro: (p) => `“Is ${p.name} going to be okay? I read it could be something terrible…”`, options: [["Explain calmly what you'll check and give a realistic plan", 2], ["Tell them not to worry, it's nothing", -1], ["List every possible worst case", -2]], why: "Anxious owners need structure and honesty, not false reassurance or a lecture of worst cases." },
  budget: { label: "budget-conscious", intro: (p) => `“Doctor, I love ${p.name} but money is tight this month. What do we really need?”`, options: [["Offer a tiered plan: essential now, optional later, with costs", 2], ["Insist on the full work-up or nothing", -2], ["Skip diagnostics entirely", -1]], why: "Tiered, transparent options keep care going and keep the client. Hiding costs or shaming them loses both." },
  google: { label: "'Dr Google'", intro: (p) => `“I already know what it is — the internet says ${p.name} needs antibiotics. Just give them.”`, options: [["Acknowledge their research, explain what the exam shows and why the plan differs", 2], ["Agree and prescribe to avoid an argument", -2], ["Dismiss the internet entirely", -1]], why: "Respect the effort, correct the facts, and anchor the plan in your exam findings. Prescribing antibiotics on demand drives resistance." },
  breeder: { label: "experienced breeder", intro: (p) => `“I've bred this line for 20 years. I just need the paperwork done properly.”`, options: [["Be efficient and precise; confirm details and document thoroughly", 2], ["Over-explain the basics", -1], ["Cut corners because they know what they're doing", -2]], why: "Experienced clients value competence and speed — but your clinical standards never drop for anyone." },
  calm: { label: "easy-going", intro: (p) => `“Whatever ${p.name} needs, doctor — you're the expert.”`, options: [["Explain the plan clearly anyway and confirm consent", 2], ["Just do it without explaining", -1], ["Add unnecessary extras since they'll say yes", -2]], why: "Trust is not a reason to skip informed consent, and never a reason to upsell." }
};

/* --- Daily goals pool --- */
const GOAL_POOL = [
  { id: "see4", text: "See 4 patients", key: "patients", target: 4, reward: 60 },
  { id: "noerr", text: "Finish the day with no handling errors", key: "handlingErrorsZero", target: 1, reward: 80 },
  { id: "surg1", text: "Complete a surgery", key: "surgeries", target: 1, reward: 90, level: 3 },
  { id: "flawless", text: "A flawless surgery (no instrument errors)", key: "flawless", target: 1, reward: 150, level: 3 },
  { id: "sell5", text: "Sell 5 shop items", key: "sales", target: 5, reward: 50 },
  { id: "xray2", text: "Read 2 radiographs", key: "xrays", target: 2, reward: 60, level: 2 },
  { id: "dose3", text: "Calculate 3 drug doses correctly", key: "doses", target: 3, reward: 70 },
  { id: "read2", text: "Read 2 references in the library", key: "refs", target: 2, reward: 40 },
  { id: "rep", text: "End the day with reputation ≥ 4.0", key: "repHigh", target: 1, reward: 100 },
  { id: "wait", text: "No patient waits more than 8 minutes", key: "noLongWait", target: 1, reward: 80 },
  { id: "lab2", text: "Interpret 2 lab panels correctly", key: "labs", target: 2, reward: 70 },
  { id: "emerg", text: "Treat an emergency in time", key: "emergencies", target: 1, reward: 120, level: 2 }
];

/* --- Staff roles --- */
const STAFF_ROLES = {
  receptionist: { label: "Receptionist", desc: "Registers arriving patients automatically (you still review the file). Greets and calms anxious owners.", wage: { junior: 25, senior: 40 } },
  nurse: { label: "Veterinary nurse", desc: "Runs routine checkups (vaccines, nail trims) in the exam room without you; a junior nurse occasionally mis-records weight.", wage: { junior: 35, senior: 60 } },
  assistant: { label: "Surgical assistant", desc: "Scrubs in with you: fewer anaesthetic events, instruments handed faster, swab counts double-checked.", wage: { junior: 40, senior: 70 } },
  shopkeeper: { label: "Shop assistant", desc: "Sells to walk-in shop customers while you work.", wage: { junior: 20, senior: 30 } },
  cleaner: { label: "Cleaner", desc: "Keeps the hygiene score high — fewer post-op infections and a better inspection result.", wage: { junior: 18, senior: 28 } }
};
const STAFF_NAMES = ["Nadia", "Bilal", "Rawan", "Hamza", "Leen", "Zaid", "Aya", "Karim", "Dima", "Laith"];

/* --- Equipment & expansions --- */
const EQUIPMENT = [
  { id: "ultrasound", name: "Ultrasound machine", price: 900, desc: "Unlocks the ultrasound mini-game and abdominal cases (pyometra, splenic mass, foreign bodies).", icon: "monitor" },
  { id: "analyser", name: "In-house blood analyser", price: 700, desc: "Lab panels return instantly; unlocks lab-reading quizzes and ASA refinement.", icon: "tray" },
  { id: "monitor2", name: "Multiparameter anaesthesia monitor", price: 600, desc: "Capnography + invasive BP: anaesthetic events are announced earlier (easier to manage).", icon: "monitor" },
  { id: "dentalmachine", name: "Dental unit & intra-oral X-ray", price: 1200, desc: "Needed to use the Dental Suite.", icon: "scalpel", needs: "dental" },
  { id: "van", name: "Mobile vet van", price: 1500, desc: "Unlocks farm calls and the vaccination-camp event.", icon: "home" }
];
const EXPANSIONS = [
  { id: "dental", name: "Dental Suite", price: 2500, desc: "A new room east of the staff room: dental cases for dogs, cats and rabbits.", icon: "scalpel" },
  { id: "ward", name: "Exotics & Isolation Ward", price: 3000, desc: "A new room with heated kennels and an isolation bay: rabbits, tortoises and infectious cases (parvo).", icon: "bed" }
];

/* --- World events (one active per in-game week) --- */
const EVENTS = [
  { id: "heatwave", name: "Heatwave week", desc: "Temperatures over 40 °C — expect heat-stroke emergencies. Advise owners: walk at dawn/dusk, water always, never leave pets in cars.", weather: "clear", caseBias: "heatwave" },
  { id: "parvo", name: "Parvovirus outbreak", desc: "Cases in the neighbourhood. Isolation protocol: gloves + gown for suspect patients, dedicated kennels, bleach disinfection. Unvaccinated puppies are at risk.", weather: "rain", caseBias: "parvo" },
  { id: "ticks", name: "Tick season", desc: "Warm, wet weather brings ticks: tick-borne disease cases rise; every discharge should include prevention advice.", weather: "rain", caseBias: "ticks" },
  { id: "shortage", name: "Supply shortage", desc: "The suture supplier is out of monofilament this week — braided absorbable suture is accepted as an alternative on ligatures, but it carries slightly more infection risk.", weather: "clear", shortage: "absorb" },
  { id: "eid", name: "Holiday rush", desc: "Families travelling: boarding checks, vaccination certificates, and more walk-ins than usual. Rush hours are busier.", weather: "clear", rush: 1.5 },
  { id: "calm", name: "Quiet week", desc: "A calm week — a good time to study, restock and train staff.", weather: "clear", rush: 0.8 }
];

/* --- Story arcs --- */
const STORY = [
  { id: "rival", day: 4, title: "A rival opens across the street", text: "“PawFect Clinic” opens opposite with a flashy sign and discount vaccines. Fewer walk-ins until your reputation climbs above 4 stars — then clients come back for quality.", effect: "rival" },
  { id: "charity", day: 6, title: "The shelter asks for help", text: "The city animal shelter asks you to spay stray cats at cost (no fee, +reputation, +XP) a few times a week. You can accept or decline each time one arrives.", effect: "charity" },
  { id: "inspector", day: 8, title: "Veterinary board inspection", text: "An inspector arrives unannounced and audits your sterile technique with five questions. Pass and you earn the 'Accredited' badge and a reputation boost; fail and reputation drops.", effect: "inspector" },
  { id: "referral", day: 12, title: "You are the specialist now", text: "Neighbouring clinics start referring their difficult surgical cases to you: higher fees, harder cases, more anaesthetic events.", effect: "referral" },
  { id: "board", day: 16, title: "Board certification", text: "You are eligible to sit the board exam (20 questions drawn from everything in the game). Pass to unlock Prestige mode.", effect: "board" }
];

/* --- Inspector / board quiz bank (asepsis + anaesthesia + pharmacology + anatomy) --- */
const QUIZ_BANK = [
  { q: "Which antiseptic combination is superior for preventing surgical-site infection?", a: ["Chlorhexidine-alcohol", "Povidone-iodine alone", "Plain water", "Hydrogen peroxide"], c: 0, topic: "asepsis" },
  { q: "When do cap and mask go on relative to the surgical hand scrub?", a: ["Before the scrub", "After the scrub", "Only during the incision", "It doesn't matter"], c: 0, topic: "asepsis" },
  { q: "Where should the patient be clipped?", a: ["In the prep room, never in theatre", "On the operating table", "In the waiting room", "Anywhere convenient"], c: 0, topic: "asepsis" },
  { q: "Which part of a sterile gown is considered sterile?", a: ["Chest to waist, sleeves to 5 cm above the elbow", "The whole gown", "Only the gloves", "The back ties"], c: 0, topic: "asepsis" },
  { q: "Steam autoclave standard cycle?", a: ["121 °C for 15 min (or 134 °C for 3 min)", "100 °C for 5 min", "70 °C for 60 min", "Dry heat 50 °C"], c: 0, topic: "asepsis" },
  { q: "Target SpO₂ under anaesthesia?", a: ["≥ 95 %", "≥ 80 %", "≥ 70 %", "≥ 60 %"], c: 0, topic: "anaesthesia" },
  { q: "Normal end-tidal CO₂ under anaesthesia?", a: ["35–45 mmHg", "10–20 mmHg", "60–80 mmHg", "0–5 mmHg"], c: 0, topic: "anaesthesia" },
  { q: "Minimum mean arterial pressure to protect organ perfusion?", a: ["60 mmHg", "30 mmHg", "100 mmHg", "120 mmHg"], c: 0, topic: "anaesthesia" },
  { q: "Why are birds intubated with an UNcuffed tube?", a: ["Complete tracheal rings — a cuff causes pressure necrosis", "Birds have no trachea", "Cuffs are too expensive", "Birds breathe through the skin"], c: 0, topic: "anaesthesia" },
  { q: "Fasting time for a healthy adult dog before anaesthesia (AAHA 2020)?", a: ["4–6 hours", "24 hours", "48 hours", "None"], c: 0, topic: "anaesthesia" },
  { q: "Should a rabbit be fasted before surgery?", a: ["No — rabbits cannot vomit and fasting causes gut stasis", "Yes, 12 hours", "Yes, 24 hours", "Only water"], c: 0, topic: "anaesthesia" },
  { q: "First response to hypotension caused by inhalant anaesthesia?", a: ["Reduce the vaporiser setting", "Increase the vaporiser", "Stop oxygen", "Give adrenaline"], c: 0, topic: "anaesthesia" },
  { q: "Permethrin spot-on is safe for:", a: ["Dogs only — toxic to cats", "Cats only", "Both dogs and cats", "Birds"], c: 0, topic: "pharmacology" },
  { q: "Maximum enrofloxacin dose in cats?", a: ["5 mg/kg/day (retinal toxicity above)", "20 mg/kg/day", "50 mg/kg/day", "No limit"], c: 0, topic: "pharmacology" },
  { q: "Penicillins in rabbits and guinea pigs:", a: ["Contraindicated — fatal dysbiosis", "First-line antibiotic", "Safe at double dose", "Only orally"], c: 0, topic: "pharmacology" },
  { q: "Volume of a 5 mg/mL drug to give 0.2 mg/kg to a 10 kg dog?", a: ["0.4 mL", "4 mL", "0.04 mL", "1 mL"], c: 0, topic: "pharmacology" },
  { q: "How many thoracic vertebrae and rib pairs do dogs and cats have?", a: ["13 and 13", "12 and 12", "7 and 7", "18 and 18"], c: 0, topic: "anatomy" },
  { q: "The fused wrist/hand bone of a bird is the:", a: ["Carpometacarpus", "Tibiotarsus", "Synsacrum", "Furcula"], c: 0, topic: "anatomy" },
  { q: "Which species keeps a tiny floating clavicle?", a: ["Cat", "Dog", "Horse", "Goat"], c: 0, topic: "anatomy" },
  { q: "Which instrument is used to retrieve the uterine horn during a spay?", a: ["Snook hook", "Allis forceps", "Backhaus towel clamp", "Poole suction"], c: 0, topic: "instruments" },
  { q: "Which scissors are correct for cutting suture?", a: ["Mayo scissors", "Metzenbaum scissors", "Iris scissors", "Any"], c: 0, topic: "instruments" },
  { q: "Heavy forceps with longitudinal serrations for ovarian pedicles:", a: ["Rochester-Carmalt", "Adson", "Kelly", "Olsen-Hegar"], c: 0, topic: "instruments" },
  { q: "Normal rectal temperature of a cat?", a: ["38.1–39.2 °C", "35–36 °C", "40–42 °C", "36.5–37.5 °C"], c: 0, topic: "vitals" },
  { q: "Capillary refill time should be:", a: ["Under 2 seconds", "5 seconds", "10 seconds", "Over 3 seconds"], c: 0, topic: "vitals" },
  { q: "Why must you never squeeze a bird's chest?", a: ["No diaphragm — the sternum must move to breathe", "Birds have hollow bones", "It makes them bite", "It is fine to squeeze gently"], c: 0, topic: "handling" },
  { q: "Safest restraint for a fractious cat?", a: ["Towel wrap", "Heavy scruffing", "Holding all four legs tightly", "Letting it roam"], c: 0, topic: "handling" },
  { q: "A blocked tomcat with HR 120 and K⁺ 8 mmol/L — first priority?", a: ["Treat the hyperkalaemia and stabilise the heart", "Express the bladder", "Send home", "Antibiotics"], c: 0, topic: "emergency" },
  { q: "Stop active cooling of a heat-stroke dog at:", a: ["39.5 °C", "37 °C", "35 °C", "41 °C"], c: 0, topic: "emergency" }
];

/* --- Textbook pages unlocked by cases --- */
const TEXTBOOK = {
  heat_dog: "Heat stroke: core temp > 41 °C; cool with tepid water + airflow, stop at 39.5 °C; monitor for AKI, DIC, GI translocation for 48–72 h.",
  parvo_pup: "Canine parvovirus: faecal-oral; 3–7 day incubation; neutropenia + haemorrhagic enteritis; isolation, fluids, anti-emetics, antibiotics, early nutrition. Vaccinate at 6–8, 10–12, 14–16 weeks.",
  pyometra: "Pyometra: 4–8 weeks post-oestrus; open (discharge) or closed (more toxic); PU/PD from E. coli endotoxin; OHE is curative.",
  stones_dog: "Uroliths: struvite (infection-related, dissolvable by diet) vs calcium oxalate (not dissolvable, surgical). Always analyse the stones.",
  spleen_dog: "Haemoabdomen: 2/3 of splenic masses in dogs are malignant and 2/3 of those are haemangiosarcoma. Post-op arrhythmia watch 48 h.",
  rabbit_stasis: "Rabbit GI stasis: pain → ileus → dehydration of gut contents → more pain. Analgesia, warmth, fluids, syringe feeding, prokinetics; identify the trigger.",
  blocked_cat: "Feline urethral obstruction: hyperkalaemia → bradycardia, spiked T waves, absent P waves. Calcium gluconate protects the heart while insulin/dextrose shifts K⁺.",
  mystery_addison: "Hypoadrenocorticism: Na:K < 27, lack of stress leukogram, bradycardia in a sick dog, microcardia; ACTH stimulation test; lifelong mineralocorticoid.",
  dental_dog: "Periodontal disease stages 1–4; dental radiographs find 30–40 % more pathology than visual exam; fractured carnassials with pulp exposure always need treatment.",
  tortoise_rhino: "Reptile husbandry: POTZ, UVB for vitamin D3 and calcium, hypovitaminosis A (swollen eyelids), weight by Jackson ratio."
};

/* --- Arabic UI strings (UI chrome; clinical content remains English) --- */
const I18N = {
  ar: { "Start shift": "ابدأ الوردية", "End shift": "أنهِ الوردية", "Reception desk": "مكتب الاستقبال", "Shift board": "لوحة الوردية", "Patients": "المرضى", "Interact": "تفاعل", "Help": "مساعدة", "Settings": "الإعدادات", "Close": "إغلاق", "Continue": "متابعة", "Next step": "الخطوة التالية", "Back": "رجوع", "Day": "اليوم", "Reputation": "السمعة", "Money": "المال", "Level": "المستوى", "Staff room": "غرفة الموظفين", "Office": "المكتب", "Shop": "المتجر", "Library": "المكتبة", "Exam room": "غرفة الفحص", "Operating room": "غرفة العمليات", "Pharmacy": "الصيدلية", "Laboratory": "المختبر", "X-ray suite": "غرفة الأشعة", "Prep room": "غرفة التحضير", "Waiting room": "غرفة الانتظار", "Walk to the patient": "امشِ إلى المريض", "Camera": "الكاميرا", "First person": "منظور الشخص الأول", "Third person": "منظور الشخص الثالث", "Language": "اللغة", "Sound": "الصوت", "Photo mode": "وضع التصوير", "Save code": "رمز الحفظ", "Daily goals": "أهداف اليوم", "Hire": "توظيف", "Wage": "الأجر اليومي", "Fire": "إنهاء الخدمة", "Buy": "شراء", "Owned": "مملوك", "Reset all progress": "إعادة تعيين كل التقدم" }
};

/* ============================================================
   v2.2 — harder, plausible answer sets (correct is always index 0 here;
   the UI shuffles at display time)
   ============================================================ */
const HARD_OPTIONS = {
  vax_dog: ["Healthy: core vaccines (DHPP ± rabies per schedule), broad-spectrum dewormer, book a dental scale in the coming months and start home brushing", "Healthy: core vaccines, a 7-day course of amoxicillin-clavulanate for the gingivitis under the calculus, recheck in 2 weeks", "Postpone vaccines until the calculus is removed — vaccinating with oral inflammation reduces the immune response"],
  vax_cat: ["FVRCP now, kitten-safe flea product and dewormer (tapeworm cover), booster every 3–4 weeks until ≥16 weeks, FeLV test before FeLV vaccine", "FVRCP + rabies + FeLV all today to catch up, dewormer; next visit at 1 year", "Treat the fleas first and vaccinate in 2 weeks — parasites interfere with vaccine take"],
  ear_dog: ["Ear cytology to classify (yeast vs cocci vs rods), clean the canal, topical combination drops, recheck 10–14 days; investigate allergy if recurrent", "Culture and sensitivity first, then 3 weeks of systemic antibiotics — topicals won't reach the vertical canal", "Clean the ear and dispense an ear-mite spot-on; most unilateral otitis in dogs is Otodectes"],
  bird_well: ["Hospitalise in a heated cage (28–30 °C), weigh daily, crop/faecal exam and gram stain, supportive feeding; birds hide illness until late", "Vitamin A and probiotics, send home with instructions to cover the cage; recheck if not eating in 3 days", "Start enrofloxacin empirically and send home — fluffed birds are usually bacterial"],
  bird_nails: ["Trim the overgrown nail tips only, styptic ready, leave the normal beak alone; check perches are varied in diameter", "Trim nails and shape the beak lightly to prevent future overgrowth, file smooth", "Sedate with midazolam for the trim — awake trimming stresses cockatiels dangerously"],
  limp_cat: ["Analgesia (opioid), then two orthogonal radiographs of the antebrachium plus thoracic films — falls from height cause chest injury too", "Radiograph the whole cat under general anaesthesia straight away; pain relief after imaging so it doesn't mask findings", "Splint the leg and re-examine in 48 h once swelling settles; radiograph only if still non-weight-bearing"],
  limp_dog: ["Treat shock first, analgesia, then pelvis and femur radiographs (orthogonal views) before any fixation plan", "Immediate radiographs of the femur under sedation, then splint and send home with NSAIDs pending surgery", "Rest and NSAIDs for 5 days; radiograph only if lameness persists — most post-trauma lameness is soft tissue"],
  vomit_dog: ["IV fluids, abdominal radiographs ± ultrasound; a palpable firm object with persistent vomiting is surgical — induce nothing", "Apomorphine to induce vomiting since the toy was swallowed recently, then anti-emetic and bland diet", "Maropitant, 24 h fast and recheck tomorrow; most toy pieces pass within 48 h"],
  bird_wing: ["Whole-body ventrodorsal + lateral radiographs (checks coelom and air sacs too), then stabilise the wing", "Palpate and apply a figure-of-eight bandage; radiograph only if there is crepitus", "Cage rest for 2 weeks with the wing taped — radiographs in a 90 g bird are low-yield"],
  spay_dog: ["Proceed: day-of pre-anaesthetic exam, minimum database (PCV/TS, glucose, BUN), IV catheter, premed with opioid, ASA I protocol", "Proceed, but skip bloodwork — a 7-month ASA I dog needs no minimum database and it adds cost", "Postpone until after the first heat; spaying before puberty increases orthopaedic and urinary problems in all breeds"],
  spay_cat: ["Proceed with the standard pathway; midline or flank approach both acceptable in a non-pregnant cat", "Postpone — cats should have one litter or one heat before spay for behavioural maturity", "Proceed but use a mask induction only; cats do not need intubation for a 20-minute spay"],
  neuter_dog: ["Proceed: confirm both testes are scrotal, pre-scrotal approach, closed or open technique by size", "Proceed with a scrotal approach as in cats — faster and fewer sutures", "Delay castration in a 1-year-old 20 kg dog until 2 years for orthopaedic reasons, offer a GnRH implant meanwhile"],
  lac_dog: ["Analgesia and sedation/GA, clip wide, copious saline lavage, debride, close with a drain if dead space; antibiotics for bite wounds", "Clip and flush with dilute chlorhexidine, leave open to heal by second intention — bite wounds should never be sutured", "Clean and close primarily under local anaesthetic only; systemic antibiotics are not indicated for fresh bites"],
  crop_bird: ["Warm and stabilise, then ingluviotomy under isoflurane with uncuffed tube; soft food afterwards", "Give a small dose of mineral oil orally and massage the crop to move the object into the proventriculus", "Retrieve with alligator forceps through the mouth under isoflurane; crop surgery only if that fails after several attempts"],
  heat_dog: ["Active cooling (tepid water + fan) until 39.5 °C then stop, IV fluids, monitor 48 h for AKI/DIC", "Ice-water immersion until 38 °C, then send home with instructions to rest in air-conditioning", "Cool slowly with wet towels to avoid shock, oral fluids, antipyretic NSAID to bring the temperature down"],
  parvo_pup: ["Isolate immediately, barrier nursing, IV crystalloids, anti-emetic, broad-spectrum antibiotics for translocation, early enteral nutrition", "Hospitalise in the main ward with fluids and antibiotics; vaccinate now to boost immunity", "Treat as outpatient: SC fluids, anti-emetic injection, recheck daily — isolation wards increase stress"],
  tick_dog: ["Blood smear + PCR/serology for Ehrlichia/Anaplasma/Babesia, start doxycycline pending results (imidocarb if Babesia), tick control for all pets", "Doxycycline and imidocarb together immediately without testing — delay is dangerous", "Supportive care only; tick-borne disease is self-limiting once the ticks are removed"],
  pyometra: ["IV fluids and antibiotics for a few hours, then emergency ovariohysterectomy today; gentle handling of the friable uterus", "Aglepristone/prostaglandin medical management and antibiotics; surgery only if she fails to respond in 72 h", "Antibiotics for a week and spay once she is stable and no longer septic"],
  stones_dog: ["Radiographs, urinalysis ± culture, cystotomy with normograde and retrograde urethral flushing, stone analysis, preventive diet", "Dissolution diet for 8–12 weeks regardless of stone type; surgery only if obstruction occurs", "Urohydropropulsion to flush the stones out through the urethra under sedation; no surgery needed in males"],
  spleen_dog: ["Stabilise (fluids ± transfusion), emergency splenectomy, histopathology of the mass, ECG monitoring 48 h post-op", "Abdominocentesis to drain the blood, pressure bandage on the abdomen, recheck tomorrow", "Splenic biopsy under ultrasound guidance before deciding on surgery, since many masses are benign"],
  rabbit_stasis: ["Analgesia, warmth, fluids, syringe feeding, prokinetics, check molars; surgery only for a confirmed obstruction", "Fast 24 h to rest the gut and give metoclopramide; feeding a static gut causes bloat", "Exploratory laparotomy today — 24 h without droppings means a mechanical obstruction"],
  rabbit_teeth: ["General anaesthesia, burr the molar spurs with a low-speed dental burr, trim/realign incisors, hay-based diet", "Clip the incisors with nail clippers conscious, dispense antibiotics for the drooling, recheck in 4 weeks", "Extract all incisors to stop the problem permanently; molars rarely need attention in rabbits"],
  tortoise_rhino: ["Correct husbandry (26–32 °C gradient, UVB), warm soaks, nasal flush and cytology, systemic antibiotics if indicated, vitamin A review", "Enrofloxacin injection and send home; keep the tortoise cooler to slow the infection", "Vitamin A injection at high dose and nasal decongestant drops; husbandry can be reviewed later"],
  dental_dog: ["Dental under GA with full-mouth radiographs, scale & polish, extract the pulp-exposed carnassial and the mobile incisor, home care plan", "Anaesthesia-free scaling by the nurse plus a 10-day antibiotic course; extraction only if abscess develops", "Scale & polish under GA; leave the fractured carnassial if the dog is eating — monitor every 6 months"],
  dental_cat: ["Dental radiographs, scale & polish, extract the resorptive lesions (crown amputation only for type 2 with root replacement)", "Steroid course for stomatitis and soft food; resorptive lesions are not painful once the crown is gone", "Fluoride varnish and chlorhexidine gel to arrest the resorption; recheck in 6 months"],
  blocked_cat: ["ECG, treat hyperkalaemia (calcium gluconate, insulin/dextrose), sedate and pass a urinary catheter, IV fluids, hospitalise", "Sedate and gently express the bladder to relieve pressure, then start antibiotics and a urinary diet", "Cystocentesis to decompress, then send home with anti-spasmodics and recheck tomorrow"],
  mystery_addison: ["Hypoadrenocorticism — ACTH stimulation test to confirm; IV fluids, steroids, long-term mineralocorticoid", "Chronic pancreatitis — cPL test, low-fat diet, analgesia", "Inflammatory bowel disease — diet trial, endoscopic biopsies"],
  mystery_fb_cat: ["Imaging (radiographs ± ultrasound), then surgery to remove the foreign body; check for linear plication", "Trichobezoar — laxative paste, high-fibre diet, recheck in a week", "Dietary indiscretion — maropitant, bland diet, recheck if vomiting persists"],
  farm_goat: ["Pare the sole to open and drain the abscess, flush, poultice and bandage, NSAID; check the flock's feet and foot-bath", "Systemic penicillin for 5 days and rest; opening the sole invites deeper infection", "Trim the hoof wall only and apply topical antibiotic spray — abscesses drain on their own at the coronary band"],
  farm_horse: ["Flunixin, nasogastric decompression (reflux!), rectal exam, IV fluids; refer for surgery if pain or heart rate stay high", "Walk the horse continuously and give oral mineral oil by stomach tube; most colic resolves", "Give a sedative and leave the horse in a padded stall overnight; reassess in the morning"]
};
CASES.forEach(c => { if (HARD_OPTIONS[c.id]) { c.options = HARD_OPTIONS[c.id]; c.correct = 0; } });
/* harder pre-op quiz distractors */
const PREOP_QUIZ_V2 = {
  fasting: { dog: ["Food 4–6 h, water until premedication", "Food and water 12 h — reduces regurgitation risk", "Food 2 h only — longer fasting increases reflux"], cat: ["Food 4–6 h, water until premedication", "Food and water 12 h", "No fasting — cats rarely regurgitate"], bird: ["1–3 h, confirm the crop is empty", "6–8 h like a small dog", "No fasting — hypoglycaemia risk outweighs everything"], rabbit: ["None — remove food 30–60 min to clear the mouth only", "4–6 h like a cat", "12 h — a full stomach causes aspiration"], tortoise: ["Warm to POTZ; 24–48 h fast in large species", "No preparation; reptiles don't vomit", "6 h fast, keep cool to lower metabolic demand"], correct: 0 },
  induce: { dog: ["Cuffed tube; inflate to seal at ~20 cmH₂O, no more", "Uncuffed tube to avoid tracheal injury", "Cuffed tube inflated firmly — leaks waste anaesthetic"], cat: ["Cuffed/low-pressure tube after lidocaine on the larynx; disconnect before turning", "Uncuffed tube — cuffs are contraindicated in cats", "Cuffed tube; turn the cat freely, the cuff holds the tube"], bird: ["Uncuffed tube (complete tracheal rings) or mask", "Cuffed tube inflated gently — birds leak otherwise", "Laryngeal mask airway sized for cats"], rabbit: ["Small uncuffed tube or V-gel; obligate nasal breathers", "Standard cuffed 4 mm tube", "Mask only — rabbits cannot be intubated"], tortoise: ["Uncuffed tube + IPPV (no diaphragm)", "Cuffed tube, spontaneous breathing", "Mask only; shelled reptiles breathe passively"], correct: 0 },
  scrub: { all: ["Chlorhexidine alternated with alcohol, target pattern outward, ≥2–5 min contact", "Povidone-iodine scrub inward toward the incision so dirt moves away from the edges", "Single alcohol wipe — chlorhexidine irritates clipped skin"], correct: 0 }
};

/* --- Outdoor points of interest (foundation for the world outside the clinic) --- */
const OUTDOOR_POIS = [
  { id: "clinic", name: "Batman Clinic", sub: "you work here", x: 205, y: 120, w: 200, h: 110, open: true },
  { id: "home", name: "Home", sub: "front door · rest", x: 230, y: 320, w: 110, h: 70, open: true },
  { id: "garden", name: "Garden", sub: "bench · fresh air", x: 360, y: 320, w: 120, h: 70, open: true },
  { id: "market", name: "Pet Market", sub: "", x: 100, y: 320, w: 110, h: 70, open: false },
  { id: "shelter", name: "Animal Shelter", sub: "", x: 440, y: 130, w: 110, h: 60, open: false },
  { id: "school", name: "Vet School", sub: "", x: 100, y: 40, w: 120, h: 60, open: false },
  { id: "bus", name: "Bus stop", sub: "farm calls", x: 500, y: 240, w: 70, h: 40, open: true }
];
