/* =====================================================================
   Batman Clinic — v2.5 researched cases, procedures, drugs, storylines.
   Plans follow current small-animal / exotic references (see the
   "Case sources" book in the library). Option 0 is the correct plan;
   the UI shuffles the order.
   ===================================================================== */

DRUGS.push(
  { id: "fenbendazole", name: "Fenbendazole", cls: "Antiparasitic", conc: 25, unit: "mg/mL", form: "oral suspension 25 mg/mL (2.5 %)", dose: { dog: 50, cat: 50, rabbit: 20 }, route: "PO q24h", note: "Dog/cat: 50 mg/kg daily for 3–5 days (hookworm, roundworm, Giardia). Rabbit: 20 mg/kg daily for 28 days for Encephalitozoon cuniculi (9 days as prevention)." },
  { id: "doxycycline", name: "Doxycycline", cls: "Antibiotic", conc: 10, unit: "mg/mL", form: "oral suspension 10 mg/mL", dose: { bird: 25, dog: 5, cat: 5 }, route: "PO", note: "Psittacosis in birds: 45 consecutive days. In cats always follow tablets with water — oesophageal strictures. Wear gloves and a mask handling suspected psittacosis birds." },
  { id: "calcium", name: "Calcium gluconate 10 %", cls: "Electrolyte", conc: 100, unit: "mg/mL", form: "injection 100 mg/mL (10 %)", dose: { bird: 50, tortoise: 100, dog: 50, cat: 50 }, route: "SC/IM diluted (birds, reptiles); slow IV with ECG (dog/cat)", note: "Dilute 1:1 with saline for SC/IM use. Given before oxytocin in egg binding — the oviduct needs calcium to contract. Never mix with bicarbonate." },
  { id: "dextrose", name: "Dextrose 50 %", cls: "Glucose", conc: 500, unit: "mg/mL", form: "injection 500 mg/mL (50 %)", dose: { dog: 250, cat: 250 }, route: "IV slowly, diluted 1:2–1:4", note: "0.5 mL/kg of 50 % dextrose = 250 mg/kg. Always dilute before IV (hypertonic — phlebitis). No IV access: rub on the gums. Follow with food once the patient can swallow." },
  { id: "caedta", name: "Calcium EDTA", cls: "Chelator", conc: 200, unit: "mg/mL", form: "injection 200 mg/mL (dilute before use)", dose: { bird: 35 }, route: "IM q12h", note: "Lead and zinc toxicosis in birds: 35 mg/kg IM twice daily for 5 days, rest, repeat if blood lead is still high. Keep the patient hydrated (nephrotoxic)." },
  { id: "terbutaline", name: "Terbutaline", cls: "Bronchodilator", conc: 1, unit: "mg/mL", form: "injection 1 mg/mL", dose: { cat: 0.01, dog: 0.01 }, route: "SC/IM", note: "Feline asthma crisis: 0.01 mg/kg SC/IM with oxygen; effect within 15–30 min. Long-term control is an inhaled corticosteroid (fluticasone) through a spacer." }
);

PROCEDURES.gdv = { name: "Gastric dilatation-volvulus: derotation & right gastropexy", species: ["dog"], level: 5, duration: "60–90 min", intro: "The stomach has twisted on its axis. After decompression and shock fluids, it is turned back, checked for necrosis, and fixed to the right body wall so it cannot twist again.",
  steps: [
    { text: "Ventral midline celiotomy from the xiphoid to caudal to the umbilicus.", tool: "scalpel", choices: ["scalpel", "metz", "towel"], why: "A long incision is needed to reach and derotate a heavy, distended stomach." },
    { text: "Place a self-retaining retractor to hold the body wall open.", tool: "balfour", choices: ["balfour", "allis", "kelly"], why: "Balfour retractors free both your hands for derotation." },
    { text: "Decompress any remaining gas with a needle and suction before turning the stomach.", tool: "suction", choices: ["suction", "gauze", "saline"], why: "A smaller, lighter stomach is easier to derotate and less likely to tear." },
    { text: "Derotate: pull the pylorus up from the left, push the fundus down on the right. Assess gastric wall colour and the spleen.", tool: "gauze", choices: ["gauze", "carmalt", "snook"], why: "Moist gauze protects the serosa. Grey, thin or green wall that does not bleed means necrosis — resect it (or invaginate it). Splenic torsion or infarcts may need a splenectomy." },
    { text: "Right incisional gastropexy: incise the seromuscular layer of the pyloric antrum and the right transversus abdominis.", tool: "metz", choices: ["metz", "mayo", "cautery"], why: "Matching 4–5 cm incisions through the stomach's outer layers and the body-wall muscle (not the mucosa)." },
    { text: "Suture the two incisions together with two continuous absorbable lines.", tool: "absorb", choices: ["absorb", "nylon", "cautery"], why: "A permanent adhesion forms; gastropexy reduces the recurrence rate from about 80 % to under 5 %." },
    { text: "Lavage the abdomen with warm saline and check every organ.", tool: "saline", choices: ["saline", "chx", "gauze"], why: "Warm isotonic lavage; never chlorhexidine or iodine inside the abdomen." },
    { text: "Close the linea alba with absorbable suture.", tool: "absorb", choices: ["absorb", "nylon", "adson"], why: "The linea gives the strength; take 5–10 mm bites." },
    { text: "Close skin; monitor ECG for 48–72 h — ventricular arrhythmias are common after GDV.", tool: "nylon", choices: ["nylon", "absorb", "bandage"], why: "Reperfusion injury causes arrhythmias, so keep monitoring (and check lactate) after surgery." }
  ] };
PROCEDURES.cherry_eye = { name: "Cherry eye: pocket (Morgan) technique", species: ["dog"], level: 3, duration: "20–30 min", intro: "The gland of the third eyelid has prolapsed. It makes 30–50 % of the tear film, so it is replaced into a pocket, never removed.",
  steps: [
    { text: "Gently evert the third eyelid with fine thumb forceps.", tool: "adson", choices: ["adson", "allis", "carmalt"], why: "Fine, atraumatic handling — the conjunctiva is delicate." },
    { text: "Make two parallel conjunctival incisions on the bulbar side, one above and one below the gland.", tool: "metz", choices: ["metz", "scalpel", "mayo"], why: "Fine scissors create the pocket edges without cutting into the gland." },
    { text: "Bury the gland and close the outer edges over it with fine absorbable suture; keep the knots off the cornea.", tool: "absorb", choices: ["absorb", "nylon", "cautery"], why: "A continuous 6-0 absorbable suture with buried knots — an exposed knot would ulcerate the cornea." },
    { text: "E-collar and topical antibiotic drops for 10–14 days.", tool: "ecollar", choices: ["ecollar", "bandage", "nylon"], why: "Rubbing pulls the gland out again. Recurrence rate is about 5–10 %." }
  ] };
PROCEDURES.aural = { name: "Aural haematoma drainage & mattress sutures", species: ["dog", "cat"], level: 3, duration: "20–30 min", intro: "Head shaking has torn a vessel inside the ear flap and blood has filled the space between the cartilage layers. Drain it, hold the layers together, and treat the ear disease behind it.",
  steps: [
    { text: "Make an S-shaped or linear incision on the concave (inner) surface of the pinna.", tool: "scalpel", choices: ["scalpel", "metz", "snook"], why: "Along the length of the swelling, avoiding the large vessels on the convex side." },
    { text: "Remove the clot and fibrin and flush the cavity.", tool: "saline", choices: ["saline", "chx", "cautery"], why: "Fibrin left behind keeps the layers apart and causes a crinkled 'cauliflower ear'." },
    { text: "Place full-thickness mattress sutures parallel to the vessels, leaving the incision open to drain.", tool: "nylon", choices: ["nylon", "absorb", "kelly"], why: "Non-absorbable sutures hold the layers together for about 3 weeks. They run parallel to the big vessels so they don't cut off the blood supply." },
    { text: "Bandage the ear over the head and treat the otitis (cytology + ear drops).", tool: "bandage", choices: ["bandage", "ecollar", "gauze"], why: "Without treating the cause (usually otitis externa), the haematoma comes back." }
  ] };

const NEW_CASES = [
  { id: "ulcer_dog", species: "dog", level: 2, outcome: "checkup", arcOnly: false, complaint: "Squinting the right eye since playing in the garden yesterday; the eye is watering.",
    findings: "Blepharospasm and tearing, right eye. Fluorescein stain: a superficial green patch with adherent edges. No stromal loss, no foreign body under the third eyelid. Schirmer tear test 18 mm/min (normal).",
    options: ["Superficial corneal ulcer: broad-spectrum antibiotic eye drops q6–8 h, pain relief, e-collar, NO steroid drops; recheck and re-stain in 3–5 days", "Antibiotic–steroid combination drops so the inflammation settles faster; recheck in 2 weeks", "Debride with a diamond burr and perform a grid keratotomy today — all ulcers heal faster that way"],
    correct: 0, why: "Fluorescein binds exposed corneal stroma, so it shows the defect. Simple ulcers heal within about a week with antibiotic drops and protection. Steroids slow healing and can let the cornea 'melt'. Grid keratotomy is only for non-healing (indolent) ulcers — never for fresh or infected ones.", fee: 45, rx: null },
  { id: "ulcer_indolent", species: "dog", level: 2, outcome: "checkup", arcOnly: true, complaint: "Recheck: the eye is still half-closed after a week of drops.",
    findings: "Fluorescein still stains, and the stain creeps under a loose lip of epithelium at the edge. A cotton swab lifts the loose epithelium easily. No infection, no stromal loss. Middle-aged boxer.",
    options: ["Spontaneous chronic corneal epithelial defect (indolent ulcer): topical anaesthetic, debride the loose epithelium with a cotton swab, then a diamond-burr debridement or grid keratotomy, bandage contact lens, keep the antibiotic drops", "Double the antibiotic drops and wait another 2 weeks", "Third-eyelid flap for 3 weeks and steroid drops"],
    correct: 0, why: "Boxers are prone to indolent ulcers (SCCEDs): the new epithelium cannot stick to an abnormal stromal surface. Removing the loose edge and roughening the stroma lets it adhere — and now grid keratotomy is the right choice. Context changes the plan.", fee: 90, rx: null },
  { id: "cherry_eye", species: "dog", level: 3, outcome: "surgery", procedure: "cherry_eye", complaint: "Young French bulldog with a red swelling in the inner corner of the left eye.",
    findings: "Smooth, pink, non-painful mass protruding from behind the left third eyelid. Rest of the eye normal; tear production normal.",
    options: ["Prolapsed gland of the third eyelid (cherry eye): replace it with the pocket (Morgan) technique; never remove the gland", "Excise the gland — quick, cosmetic and curative", "Steroid eye ointment for 2 weeks; surgery only if it is still out"],
    correct: 0, why: "The third-eyelid gland makes 30–50 % of the tears. Removing it predisposes to dry eye (KCS) later in life. Replacing it in a conjunctival pocket keeps the function.", fee: 260, rx: "meloxicam" },
  { id: "gdv", species: "dog", level: 5, outcome: "surgery", procedure: "gdv", emergency: true, complaint: "Great Dane retching with nothing coming up, belly swelling, two hours after a big meal and a run.",
    findings: "HR 160, weak pulses, pale gums, CRT 3 s, tight drum-like cranial abdomen. Lactate 6.5 mmol/L. Right lateral radiograph: gas-distended stomach with the pylorus displaced dorsally and a soft-tissue band dividing it.",
    options: ["Shock-rate IV fluids through two large cephalic catheters, ECG, decompress (orogastric tube or trocarisation), then emergency surgery: derotate, check stomach and spleen, right incisional gastropexy", "Decompress with an orogastric tube; if he is stable, monitor overnight and operate only if it recurs", "Metoclopramide and repeat the radiograph in 2 hours to see whether the gas moves on"],
    correct: 0, why: "A 'double bubble' (compartmentalisation) radiograph means volvulus, not just bloat. A twisted stomach strangles its own blood supply and needs surgery as soon as the patient is stabilised. Without a gastropexy about 80 % recur. Avoid NSAIDs and prokinetics.", fee: 900, xray: { view: "dog", finding: "gdv", label: "Gastric dilatation-volvulus: compartmentalised gas-filled stomach" , plan: "Volvulus confirmed: stabilise, decompress, then emergency derotation and gastropexy." }, rx: "methadone" },
  { id: "choc_dog", species: "dog", level: 2, outcome: "checkup", emergency: true, complaint: "10 kg beagle ate a 100 g bar of dark chocolate about an hour ago.",
    findings: "Restless and panting, HR 150 (sinus tachycardia), T 39.2 °C. Not vomited yet. Wrapper confirms dark chocolate (~5.5 mg methylxanthines per gram).",
    calc: { prompt: "Dose of methylxanthines in mg/kg: 100 g × 5.5 mg/g ÷ 10 kg", answer: 55, unit: "mg/kg", tol: 0.1, explain: "100 × 5.5 = 550 mg total; 550 ÷ 10 kg = 55 mg/kg — above the 40–50 mg/kg cardiotoxic level and close to the ≥ 60 mg/kg seizure level." },
    options: ["≈ 55 mg/kg — cardiotoxic range: induce vomiting (apomorphine) now, repeated activated charcoal, IV fluids, ECG monitoring, frequent walks or a urinary catheter (theobromine is reabsorbed from the bladder)", "Under the toxic dose for a dog this size — monitor at home and call if he vomits", "Give milk to dilute it and salt water to make him vomit, then send home"],
    correct: 0, why: "Merck Veterinary Manual: mild signs from ~20 mg/kg, cardiotoxic effects at 40–50 mg/kg, seizures at ≥ 60 mg/kg. Within 1–2 h, emesis is worthwhile. Salt water is dangerous (hypernatraemia).", fee: 160, rx: null },
  { id: "aural_dog", species: "dog", level: 3, outcome: "surgery", procedure: "aural", complaint: "Cocker spaniel shaking his head; the left ear flap is suddenly swollen like a pillow.",
    findings: "Soft, fluctuant, warm swelling on the inner surface of the left pinna. Both ear canals red and smelly. Ear cytology: lots of Malassezia yeast.",
    options: ["Aural haematoma from head shaking: drain surgically with mattress sutures (or a drain) AND treat the yeast otitis behind it", "Needle-drain it today and send home — no need to look into the ear", "Cold compresses and an e-collar; it will reabsorb in a few days"],
    correct: 0, why: "Haematomas follow head shaking, usually from otitis externa. Needle drainage alone usually refills. Fix the cause, or it comes back.", fee: 240, rx: "meloxicam" },
  { id: "ccl_dog", species: "dog", level: 3, outcome: "xray", complaint: "Overweight Labrador, suddenly lame on the right hind leg after chasing a ball.",
    findings: "Toe-touching lameness on the right hind limb, stifle effusion, medial thickening ('medial buttress'), positive cranial drawer and tibial thrust. Radiograph: joint effusion, no fracture.",
    options: ["Cranial cruciate ligament rupture: pain relief, weight loss, and stabilisation surgery (TPLO for a large active dog) — offer referral", "Strict rest for 6 weeks — the ligament heals on its own in most large dogs", "Medial patellar luxation: tighten the joint capsule (imbrication)"],
    correct: 0, why: "Cranial drawer / tibial thrust confirm a cruciate tear. Small dogs (< 15 kg) can do well with rest and physio, but large dogs usually need surgery. The meniscus is checked at the same time — about half are torn.", fee: 90, xray: { view: "dog", finding: "stifle_effusion", label: "Stifle effusion — infrapatellar fat pad compressed (cruciate)" , next: "Pain relief, weight plan & surgical referral", plan: "Effusion with a compressed fat pad and no fracture fits a cruciate rupture. Look for osteophytes (chronic partial tear)." }, rx: "meloxicam" },
  { id: "ivdd_dog", species: "dog", level: 3, outcome: "checkup", emergency: true, complaint: "Dachshund cried out after jumping off the sofa; now dragging both back legs.",
    findings: "Paraplegic but deep pain present in both hind limbs. Spinal pain over the thoracolumbar junction, upper-motor-neuron bladder (firm, hard to express). Forelimbs normal.",
    options: ["Thoracolumbar IVDD (Hansen type I), grade 4: strict confinement and analgesia now, urgent MRI/CT and hemilaminectomy at a referral centre — deep pain present means a good prognosis (~90 %) with surgery", "High-dose methylprednisolone and 2 weeks of cage rest", "Radiographs to confirm the disc, then cage rest; surgery only if he loses deep pain"],
    correct: 0, why: "Chondrodystrophic breeds herniate calcified discs. Plain radiographs cannot show the compression, so MRI or CT is needed. High-dose steroids have no proven benefit and cause GI ulcers. Deep pain sensation is the key prognostic sign.", fee: 150, rx: "methadone" },
  { id: "hypo_pup", species: "dog", level: 2, outcome: "checkup", emergency: true, complaint: "8-week-old Chihuahua puppy, wobbly and trembling after a long car trip without food.",
    findings: "Weak, trembling, hypothermic (36.6 °C). Blood glucose 2.1 mmol/L (38 mg/dL). Small for his age, potbellied.",
    options: ["Juvenile hypoglycaemia: 50 % dextrose 0.5 mL/kg diluted 1:2–1:4 slowly IV (or rubbed on the gums), warm him, then small meals every 3–4 h; deworm (parasites make it worse)", "Insulin to help him use the sugar in his blood", "Sugar water at home and recheck tomorrow if he is still wobbly"],
    correct: 0, why: "Toy-breed puppies have tiny glycogen stores and go hypoglycaemic after skipped meals, cold or parasites. Glucose works within minutes. Never give 50 % dextrose undiluted IV.", fee: 80, rx: "dextrose" },
  { id: "pancreatitis_dog", species: "dog", level: 3, outcome: "checkup", mystery: true, complaint: "Miniature schnauzer vomiting since yesterday's barbecue; standing in a 'praying' position.",
    findings: "Painful cranial abdomen, mild dehydration, T 39.4 °C. Needs tests.",
    options: ["Acute pancreatitis: IV fluids, opioid pain relief, maropitant, early low-fat enteral feeding; antibiotics only if there is evidence of infection", "Nothing by mouth for 3–5 days to rest the pancreas, plus broad-spectrum antibiotics", "Exploratory laparotomy for a suspected foreign body"],
    correct: 0, why: "Fatty food is the classic trigger; schnauzers are predisposed (hypertriglyceridaemia). Starving them is outdated — early enteral nutrition improves recovery. Pain relief is essential.", fee: 220, rx: "maropitant",
    ddx: { symptoms: ["Vomiting", "Cranial abdominal pain", "'Praying' posture", "Recent fatty meal"], tests: { cbc: "Mild neutrophilia, haemoconcentration", chem: "Spec cPL markedly increased; triglycerides high", xray: "Loss of detail in the right cranial abdomen, no obstruction pattern", ultrasound: "Hypoechoic, enlarged pancreas with hyperechoic surrounding fat", cytology: "Not indicated", urinalysis: "Concentrated, otherwise normal" }, needed: ["chem", "ultrasound"], dx: ["Acute pancreatitis", "Intestinal foreign body", "Gastroenteritis", "Addison's disease"], correct: 0 } },
  { id: "hookworm_pup", species: "dog", level: 2, outcome: "checkup", lab: "anaemia", complaint: "10-week-old puppy from a breeder: pale, tired, dark tarry diarrhoea.",
    findings: "Pale pink gums, HR 180, thin. Faecal flotation: many strongyle-type (Ancylostoma) eggs. PCV 18 % (normal 37–55 %).",
    options: ["Hookworm anaemia: fenbendazole (or pyrantel) now and again in 2 weeks, good nutrition, transfusion if PCV keeps falling or he collapses; treat the litter, the dam and the environment", "Immune-mediated haemolytic anaemia — start prednisolone", "Parvovirus — isolate and give IV fluids only"],
    correct: 0, why: "Hookworms suck blood from the intestinal wall. Puppies are infected through the dam's milk, so they can be anaemic before eggs even appear. Deworm the whole household.", fee: 85, rx: "fenbendazole" },
  { id: "hyperT_cat", species: "cat", level: 3, outcome: "checkup", complaint: "13-year-old cat eating ravenously but losing weight, vomiting, restless at night.",
    findings: "Weight history: 5.2 → 4.6 → 4.1 kg over 8 months. Palpable thyroid 'slip', HR 240 with a gallop rhythm, unkempt coat. Total T4 82 nmol/L (reference 10–55).",
    options: ["Hyperthyroidism: check kidney values and blood pressure, start methimazole (or plan radioiodine); recheck T4 and creatinine in 3 weeks — treatment can unmask kidney disease", "Diabetes mellitus — start insulin", "Normal ageing and early kidney disease — renal diet only"],
    correct: 0, why: "Weight loss with a big appetite in an older cat is classic hyperthyroidism, and a raised total T4 confirms it. High T4 raises kidney blood flow, so it can hide kidney disease until the cat is treated.", fee: 140, rx: null },
  { id: "renal_unmasked", species: "cat", level: 3, outcome: "checkup", arcOnly: true, lab: "renal", complaint: "Recheck after 3 weeks of methimazole: eating normally again, drinking a bit more.",
    findings: "Weight up 0.3 kg, HR 180. Total T4 now 18 nmol/L (low end). Creatinine up from 150 to 210 µmol/L, USG 1.018. Blood pressure 150 mmHg.",
    options: ["Kidney disease unmasked by treatment: lower the methimazole dose to keep T4 in the upper half of normal, renal diet, IRIS staging and blood-pressure monitoring", "Stop methimazole completely — the kidneys need the hyperthyroidism", "Carry on at the same dose; a creatinine rise is always a lab error"],
    correct: 0, why: "Iatrogenic hypothyroidism worsens azotaemia, so the dose is reduced to keep T4 in the upper half of normal. Kidney disease is then managed on its own (diet, BP, IRIS stage).", fee: 120, rx: null },
  { id: "diabetic_cat", species: "cat", level: 3, outcome: "checkup", mystery: true, complaint: "Overweight 10-year-old neutered male drinking and peeing a lot; walking flat on his hocks.",
    findings: "BCS 8/9, plantigrade hind-limb stance, mild dehydration. Blood glucose on arrival 24 mmol/L — but he was very stressed in the car. Needs tests.",
    options: ["Diabetes mellitus, confirmed by a raised fructosamine and glucose in the urine (not by blood glucose alone): glargine 1 U/cat q12h, low-carbohydrate wet diet, gradual weight loss, home monitoring — remission is possible", "Stress hyperglycaemia — recheck in a month", "Glipizide tablets and a dry weight-loss diet"],
    correct: 0, why: "Stressed cats can reach very high glucose within minutes. Fructosamine reflects the last 1–3 weeks, so it separates stress from diabetes. Long-acting insulin plus a low-carbohydrate diet gives the best chance of remission (ISFM / AAFP).", fee: 180, rx: null,
    ddx: { symptoms: ["Polyuria / polydipsia", "Weight loss", "Plantigrade stance", "Hyperglycaemia"], tests: { cbc: "Mild stress leukogram", chem: "Glucose 24 mmol/L; fructosamine 520 µmol/L (high)", xray: "Unremarkable", ultrasound: "Unremarkable pancreas", cytology: "Not indicated", urinalysis: "Glucosuria 4+, ketones negative" }, needed: ["chem", "urinalysis"], dx: ["Diabetes mellitus", "Stress hyperglycaemia", "Hyperthyroidism", "Chronic kidney disease"], correct: 0 } },
  { id: "lily_cat", species: "cat", level: 3, outcome: "checkup", emergency: true, complaint: "Kitten chewed the leaves of a bouquet of lilies about 2 hours ago and vomited once.",
    findings: "Bright but drooling, one vomit. Photo of the bouquet: Easter lilies (Lilium). Kidney values normal right now.",
    options: ["True-lily (Lilium) exposure: induce vomiting if within ~1–2 h, activated charcoal, IV fluid diuresis for 48 h started well within 18 h, monitor creatinine and urine daily for 3 days", "She has already vomited — monitor at home and come back if she stops eating", "It's a peace lily — only mouth irritation; rinse her mouth"],
    correct: 0, why: "Every part of a Lilium or Hemerocallis plant (even pollen or vase water) can cause acute kidney injury in cats. Treatment started within 18 hours gives an excellent outlook; after that the damage may be permanent. Peace and calla lilies are a different, much milder problem.", fee: 260, rx: null },
  { id: "abscess_cat", species: "cat", level: 2, outcome: "checkup", complaint: "Outdoor intact tomcat, off his food, with a hot painful lump at the base of his tail.",
    findings: "T 40.1 °C. Fluctuant, painful swelling with two small scabbed punctures. Was in a fight 3 days ago.",
    options: ["Cat-bite abscess: sedate, lance, flush and drain, amoxicillin-clavulanate for 5–7 days, pain relief, FIV/FeLV test, and recommend neutering", "Steroid injection to bring the swelling down", "Surgically remove the mass and send it for histopathology"],
    correct: 0, why: "Cat teeth inject Pasteurella and anaerobes deep under the skin. Drainage is the treatment; antibiotics support it. Bites spread FIV, and neutering reduces fighting.", fee: 95, rx: "amoxiclav" },
  { id: "asthma_cat", species: "cat", level: 3, outcome: "xray", complaint: "Coughing fits that look like trying to bring up a hairball; today she breathed with her mouth open.",
    findings: "Expiratory wheezes, abdominal push on expiration, SpO₂ 91 % on room air. Radiograph: bronchial pattern ('doughnuts and tram lines'), hyperinflated lungs, flattened diaphragm.",
    options: ["Feline asthma: oxygen and terbutaline in the crisis, then an airway wash (eosinophils) and a lungworm faecal test (Baermann); long-term inhaled fluticasone through a spacer; reduce dust and smoke", "Heart failure — furosemide and a heart scan only", "Bacterial pneumonia — 6 weeks of antibiotics"],
    correct: 0, why: "A cough mistaken for hairballs is the classic history. Inflammation causes bronchospasm and mucus — bronchodilators relieve it, steroids control it. Lungworm (Aelurostrongylus) can look identical, so test before lifelong steroids.", fee: 150, xray: { view: "cat", finding: "bronchial", label: "Bronchial pattern with hyperinflation (feline asthma)" , next: "Oxygen, terbutaline, airway wash plan & discharge", plan: "Bronchial thickening with air trapping. Before long-term steroids: airway wash cytology and a Baermann faecal test for lungworm." }, rx: "terbutaline" },
  { id: "eggbound_bird", species: "bird", level: 3, outcome: "xray", emergency: true, complaint: "Female cockatiel sitting fluffed on the cage floor, straining, tail bobbing.",
    findings: "Weak, wide-based stance, egg palpable in the caudal coelom, cloaca swollen. Radiograph: a single shelled egg in the caudal coelom; bones look thin.",
    options: ["Egg binding: warm humid oxygen cage, calcium gluconate injection and fluids first, then oxytocin if the egg doesn't move; gentle manual delivery or ovocentesis if it still won't pass; long-term calcium, UVB and fewer laying triggers", "Oxytocin straight away to push the egg out", "Salpingohysterectomy (remove the oviduct) immediately"],
    correct: 0, why: "Low calcium is the usual cause — the oviduct can't contract without it, so calcium comes before oxytocin. Most eggs pass with warmth, calcium and time. Surgery is a last resort in an unstable bird.", fee: 180, xray: { view: "bird", finding: "egg", label: "Retained calcified egg in the caudal coelom" , next: "Warmth, calcium, fluids & monitor the egg", plan: "A single calcified egg — the shell is formed, so calcium and time usually let it pass. Thin cortices hint at chronic calcium deficiency." }, rx: "calcium" },
  { id: "eggs_again", species: "bird", level: 3, outcome: "checkup", arcOnly: true, complaint: "Same cockatiel, three months later: she has laid 14 eggs since the last visit.",
    findings: "Thin, slightly weak, BCS low. Cage has a mirror, a nest box and a soft toy she sits on. Owner removes every egg as soon as it's laid.",
    options: ["Chronic egg laying: deslorelin implant, shorten daylight to 8–10 h, remove the nest box, mirror and 'mate' toys, leave dummy eggs for her to sit on, calcium and UVB", "Keep removing each egg straight away so she doesn't get attached", "Hysterectomy at this visit"],
    correct: 0, why: "Removing eggs triggers her to lay more. Removing the hormonal triggers (long days, nest sites, mirrors) plus a GnRH-agonist implant usually stops it without surgery.", fee: 160, rx: null },
  { id: "lead_bird", species: "bird", level: 4, outcome: "xray", complaint: "African grey parrot regurgitating, wobbly on the perch, with green-tinged droppings; loves chewing old curtain weights.",
    findings: "Depressed, ataxic, biliverdinuria, polyuria. Radiograph: several metal-dense particles in the ventriculus. Blood lead pending.",
    options: ["Heavy-metal (lead/zinc) toxicosis: calcium EDTA injections, remove the particles (bulk diet and grit, or endoscopic retrieval if large), seizure control, fluids, and find and remove the source", "Psittacosis — doxycycline for 45 days", "Proventricular dilatation disease — isolate the bird"],
    correct: 0, why: "Metal densities in the gizzard plus GI and neurological signs mean heavy metals until proven otherwise. Chelation binds the metal; the particles must also be removed. Common sources are old paint, curtain weights, galvanised cages and jewellery.", fee: 260, xray: { view: "bird", finding: "metal", label: "Metallic densities in the ventriculus (heavy-metal toxicosis)" , next: "Start chelation & remove the particles", plan: "Metal-dense particles in the gizzard: start calcium EDTA now, while the blood lead result is pending." }, rx: "caedta" },
  { id: "psittacosis_bird", species: "bird", level: 3, outcome: "checkup", isolation: true, complaint: "New budgie from a pet shop: swollen eyes, sneezing, lime-green droppings. The owner has had a flu-like illness this week.",
    findings: "Bilateral conjunctivitis, serous nasal discharge, fluffed, lime-green urates (liver involvement).",
    options: ["Suspect psittacosis (Chlamydia psittaci): isolate, PCR on a combined conjunctival/choanal/cloacal swab, doxycycline for 45 days, and advise the owner to tell their doctor — it is zoonotic", "Vitamin A deficiency — change the diet only", "Upper respiratory infection — 5 days of enrofloxacin and send home"],
    correct: 0, why: "New birds from shops and aviaries are the classic source. Psittacosis is a zoonosis (it causes pneumonia in people), so the owner's illness matters. Doxycycline for 45 days is the standard course (NASPHV compendium). Wear a mask and gloves.", fee: 140, rx: "doxycycline" },
  { id: "ecun_rabbit", species: "rabbit", level: 3, outcome: "checkup", needs: "ward", complaint: "Dwarf lop rabbit suddenly has her head tilted to one side and keeps rolling.",
    findings: "Head tilt left, horizontal nystagmus, rolling. Ear canals look clean on otoscopy. Still eating if hand-fed.",
    options: ["Probable E. cuniculi vestibular disease: serology (IgG and IgM), fenbendazole 20 mg/kg once daily for 28 days, padded pen, hand-feeding and anti-inflammatories; image the bullae to rule out otitis media", "Bacterial otitis media — oral amoxicillin", "Prognosis is hopeless — recommend euthanasia"],
    correct: 0, why: "E. cuniculi is a major cause of head tilt, especially in dwarf breeds. Fenbendazole for at least 28 days is the treatment with evidence. Oral penicillins are fatal to rabbits (dysbiosis). Many rabbits adapt to a residual tilt and live happily.", fee: 130, rx: "fenbendazole" },
  { id: "mbd_tortoise", species: "tortoise", level: 3, outcome: "checkup", needs: "ward", complaint: "Young Hermann's tortoise kept indoors in a box: soft shell, overgrown beak, struggling to lift his body.",
    findings: "Shell soft when pressed, pyramiding scutes, overgrown rhamphotheca, weak limbs. No UVB lamp; lettuce and fruit diet.",
    options: ["Metabolic bone disease (nutritional secondary hyperparathyroidism): UVB lighting 10–12 h/day with the right basking temperature, calcium (injection now if low, then dietary), high-fibre weed diet, trim the beak, radiograph to assess bone density", "High-dose vitamin D3 injections and no change to the setup", "Shell infection — antifungal soaks"],
    correct: 0, why: "Without UVB tortoises can't make vitamin D3, so they can't absorb calcium and draw it from bone. The fix is husbandry first. Big D3 injections risk toxicity and soft-tissue mineralisation.", fee: 120, rx: "calcium" }
];
NEW_CASES.forEach(c => CASES.push(c));

Object.assign(TEXTBOOK, {
  ulcer_dog: "Corneal ulcer: fluorescein stains exposed stroma. Simple ulcers heal in < 7 days with antibiotic drops. No steroids. Recheck and re-stain.",
  ulcer_indolent: "Indolent ulcer (SCCED, boxers): loose epithelial lip; debride + diamond burr or grid keratotomy + bandage lens.",
  cherry_eye: "Cherry eye: prolapsed third-eyelid gland (30–50 % of tears). Pocket technique — never excise (risk of KCS).",
  gdv: "GDV: 'double bubble' radiograph; shock fluids, decompress, derotate, right incisional gastropexy; ECG for arrhythmias 48–72 h.",
  choc_dog: "Chocolate: methylxanthines. 20 mg/kg mild, 40–50 cardiotoxic, ≥ 60 seizures. Emesis, repeated charcoal, fluids, ECG.",
  aural_dog: "Aural haematoma: drain + mattress sutures parallel to vessels; treat the otitis behind it.",
  ccl_dog: "Cruciate rupture: cranial drawer/tibial thrust, effusion; large dogs → TPLO; check the meniscus.",
  ivdd_dog: "IVDD (chondrodystrophic): deep pain is the key prognostic sign; MRI/CT + hemilaminectomy; no high-dose steroids.",
  hypo_pup: "Juvenile hypoglycaemia: 0.5 mL/kg 50 % dextrose diluted; warm; frequent meals; deworm.",
  pancreatitis_dog: "Pancreatitis: cPL + ultrasound; fluids, opioids, antiemetic, EARLY low-fat feeding.",
  hookworm_pup: "Hookworm anaemia: Ancylostoma via milk; fenbendazole/pyrantel repeated; transfuse if needed.",
  hyperT_cat: "Hyperthyroid cat: weight loss + polyphagia, thyroid slip, raised total T4; methimazole or radioiodine; watch kidneys.",
  renal_unmasked: "Treating hyperthyroidism can unmask CKD: keep T4 in the upper half of normal; IRIS staging; BP.",
  diabetic_cat: "Feline diabetes: fructosamine separates stress from DM; glargine 1 U/cat q12h + low-carb diet; remission possible.",
  lily_cat: "Lily (Lilium/Hemerocallis) in cats: AKI; decontaminate + 48 h IV fluids started < 18 h; monitor 3 days.",
  abscess_cat: "Cat-bite abscess: lance, flush, drain; amoxiclav; FIV/FeLV test; neuter.",
  asthma_cat: "Feline asthma: bronchial pattern; terbutaline + O₂ in crisis; airway wash; rule out lungworm; inhaled fluticasone.",
  eggbound_bird: "Egg binding: warmth, calcium BEFORE oxytocin, fluids; ovocentesis/surgery last.",
  eggs_again: "Chronic egg laying: remove triggers, shorten days, dummy eggs, deslorelin implant.",
  lead_bird: "Heavy metals in birds: metal densities in ventriculus; CaEDTA; remove particles and the source.",
  psittacosis_bird: "Psittacosis: zoonotic Chlamydia psittaci; PCR; doxycycline 45 days; isolate; PPE.",
  ecun_rabbit: "E. cuniculi: head tilt, nystagmus; serology; fenbendazole 20 mg/kg × 28 days; NO oral penicillins.",
  mbd_tortoise: "MBD in tortoises: UVB + calcium + correct diet; avoid high-dose D3."
});

REFERENCES.push({ id: "sources", title: "Case sources", icon: "book", body: () => `<p>The plans for the newer cases follow these references. Doses and thresholds are teaching values — real patients are always assessed individually.</p><ul class="small">
  <li><b>Chocolate:</b> Merck Veterinary Manual, “Chocolate toxicosis in animals” — mild signs ~20 mg/kg, cardiotoxic 40–50 mg/kg, seizures ≥ 60 mg/kg.</li>
  <li><b>Lilies:</b> ASPCA Animal Poison Control (Volmer, Easter lily toxicosis in cats) and Pet Poison Helpline — Lilium and Hemerocallis; decontamination and 48 h IV fluids; treatment within 18 h.</li>
  <li><b>Feline diabetes:</b> ISFM consensus guidelines (2015) and AAFP Diabetes Toolkit — fructosamine, glargine 1–2 U/cat q12h, low-carbohydrate diet, remission.</li>
  <li><b>E. cuniculi:</b> Veterinary Nursing Journal 38 (2023); Harcourt-Brown, Textbook of Rabbit Medicine — fenbendazole 20 mg/kg for 28 days.</li>
  <li><b>Psittacosis:</b> NASPHV Compendium of Measures to Control Chlamydia psittaci Infection (2017) — 45 days of doxycycline; zoonosis.</li>
  <li><b>GDV:</b> Fossum, Small Animal Surgery (5th ed.) — derotation and right incisional gastropexy; recurrence without gastropexy up to ~80 %.</li>
  <li><b>Cherry eye, corneal ulcers:</b> Gelatt, Essentials of Veterinary Ophthalmology — pocket technique; SCCED management.</li>
  <li><b>IVDD:</b> ACVIM consensus statement on intervertebral disc disease in dogs (2022).</li>
  <li><b>Cruciate:</b> Tobias & Johnston, Veterinary Surgery: Small Animal — TPLO and the meniscus.</li>
  <li><b>Feline asthma:</b> Trzil & Reinero, feline lower airway disease reviews; AAFP — terbutaline, inhaled fluticasone, lungworm testing.</li>
  <li><b>Hyperthyroidism:</b> AAFP/ISFM guidelines (2016) — kidney function after treatment; target T4 in the upper half of normal.</li>
  <li><b>Pancreatitis:</b> ACVIM consensus on canine acute pancreatitis — early enteral nutrition, analgesia.</li>
  <li><b>Birds & reptiles:</b> Harrison & Lightfoot, Clinical Avian Medicine; Mader & Divers, Current Therapy in Reptile Medicine and Surgery.</li>
</ul>` });

ACHIEVEMENTS.push(
  { id: "storyteller", name: "Every Patient Has a Story", desc: "Finish a storyline from first visit to the end.", icon: "book" },
  { id: "toxicologist", name: "Toxicologist", desc: "Work out a toxic dose correctly.", icon: "flask" }
);

/* ---------------- storylines ---------------- */
const STORYLINES = [
  { id: "one_eye", title: "The dog who keeps one eye closed", level: 2, species: "dog", breed: "Boxer", steps: [
      { case: "ulcer_dog", gap: 3, text: "A boxer comes in squinting after a day in the garden." },
      { case: "ulcer_indolent", gap: 0, text: "He's back. The ulcer hasn't healed — something is different about this eye." }],
    ending: "{pet}'s eye is open, clear and healed. His owner says he's started winking at the neighbours on purpose.", reward: { money: 120, xp: 80, rep: 0.1 } },
  { id: "miso", title: "Miso's water bowl", level: 3, species: "cat", breed: "Domestic shorthair", pet: "Miso", steps: [
      { case: "hyperT_cat", gap: 3, text: "Miso's owner noticed he's emptying the water bowl twice a day — and getting thinner." },
      { case: "renal_unmasked", gap: 0, text: "Three weeks on methimazole. Miso looks great, but the bloods tell another story." }],
    ending: "Miso's T4 and kidney values are stable. He's back to stealing food from the counter — a good sign in a cat his age.", reward: { money: 150, xp: 100, rep: 0.1 } },
  { id: "cockatiel", title: "The cockatiel on the cage floor", level: 3, species: "bird", breed: "Cockatiel", pet: "Pip", steps: [
      { case: "eggbound_bird", gap: 4, text: "Pip is sitting on the cage floor, fluffed up and straining." },
      { case: "eggs_again", gap: 0, text: "Pip is back. Fourteen eggs since you saw her — this has to stop." }],
    ending: "Pip hasn't laid an egg in two months and is singing again. Her owner sent a video of her whistling the Batman theme.", reward: { money: 140, xp: 100, rep: 0.1 } }
];

/* case-specific signalment so the story matches the patient */
Object.entries({
  ulcer_dog: { breed: "Boxer", weight: 29, age: "6 years", sex: "male" }, ulcer_indolent: { breed: "Boxer", weight: 29, age: "6 years", sex: "male" },
  cherry_eye: { breed: "French Bulldog", weight: 11, age: "8 months" }, gdv: { breed: "Great Dane", weight: 58, age: "7 years", sex: "male" },
  choc_dog: { breed: "Beagle", weight: 10, age: "3 years" }, aural_dog: { breed: "Cocker Spaniel", weight: 13.5, age: "6 years" },
  ccl_dog: { breed: "Labrador Retriever", weight: 36, age: "5 years" }, ivdd_dog: { breed: "Dachshund", weight: 7.5, age: "5 years" },
  hypo_pup: { breed: "Chihuahua", weight: 0.9, age: "8 weeks" }, pancreatitis_dog: { breed: "Miniature Schnauzer", weight: 8.2, age: "8 years" },
  hookworm_pup: { breed: "Mixed breed", weight: 3.4, age: "10 weeks" }, hyperT_cat: { breed: "Domestic shorthair", weight: 4.1, age: "13 years", sex: "male (neutered)" },
  renal_unmasked: { breed: "Domestic shorthair", weight: 4.4, age: "13 years", sex: "male (neutered)" }, diabetic_cat: { breed: "Domestic shorthair", weight: 6.8, age: "10 years", sex: "male (neutered)" },
  lily_cat: { weight: 2.1, age: "5 months" }, abscess_cat: { weight: 4.8, age: "3 years", sex: "male (intact)" }, asthma_cat: { breed: "Siamese", weight: 3.9, age: "4 years" },
  eggbound_bird: { breed: "Cockatiel", weight: 0.09, age: "3 years", sex: "female" }, eggs_again: { breed: "Cockatiel", weight: 0.085, age: "3 years", sex: "female" },
  lead_bird: { breed: "African Grey Parrot", weight: 0.45, age: "9 years" }, psittacosis_bird: { breed: "Budgerigar", weight: 0.035, age: "1 year" },
  ecun_rabbit: { breed: "Dwarf Lop", weight: 1.6, age: "4 years", sex: "female" }, mbd_tortoise: { breed: "Hermann's Tortoise", weight: 0.35, age: "2 years" }
}).forEach(([id, v]) => { const c = CASES.find(x => x.id === id); if (c) Object.assign(c, v); });

/* ---------------- dose / toxicity calculation step ---------------- */
function calcHTML(p) { const c = p.caseDef.calc; return `<div class="draft"><h4>${icon("flask", 16)} Work it out first</h4><p>${c.prompt}</p><div class="btnrow tight"><input id="calcIn" type="number" inputmode="decimal" step="any" placeholder="${c.unit}" style="max-width:130px"> <b>${c.unit}</b><button class="btn primary small" onclick="checkCalc(${p.id})">Check</button></div><p id="calcMsg" class="muted small"></p></div>`; }
function checkCalc(id) {
  const p = G.patients.find(x => x.id === id); if (!p) return; const c = p.caseDef.calc; const v = parseFloat(($("#calcIn").value || "").replace(",", "."));
  if (!isFinite(v)) return; const ok = Math.abs(v - c.answer) <= c.answer * (c.tol || 0.1);
  if (ok) { p.calcDone = true; Sound.success(); addXP(20, "toxic dose calculated"); award("toxicologist"); p.record.push(`${clockStr()} — Calculated exposure: ${c.answer} ${c.unit}. ${c.explain}`); toast(`${icon("check", 16)} ${c.explain}`, "good", 6000); renderExam(p); }
  else { Sound.error(); p.calcTries = (p.calcTries || 0) + 1; $("#calcMsg").innerHTML = p.calcTries >= 2 ? `Not quite. ${c.explain}` : "Not quite — check the units: total mg first, then divide by body weight."; if (p.calcTries >= 2) { p.calcDone = true; setTimeout(() => renderExam(p), 2500); } }
}

/* ---------------- storyline engine ---------------- */
function storyState() { if (!G.s.arcs || typeof G.s.arcs !== "object") G.s.arcs = {}; return G.s.arcs; }
function storyDaily() {
  const A = storyState(), s = G.s; G.arcSpawnAt = null;
  const active = Object.entries(A).find(([, a]) => !a.done);
  if (active) { if (active[1].due <= s.day) G.arcSpawnAt = gameNow() + 25000; return; }
  if (s.day < 3) return;
  const cand = STORYLINES.filter(st => { if (A[st.id] || st.level > s.level) return false; const c = CASES.find(x => x.id === st.steps[0].case); return c && !(c.needs && !owns(c.needs)); });
  if (cand.length && Math.random() < 0.6) { const st = cand[0]; A[st.id] = { step: 0, due: s.day, started: s.day }; G.arcSpawnAt = gameNow() + 25000; save(); }
}
function storyTick() { if (!G.arcSpawnAt || !G.s.shiftActive || G.s.closing || G.paused) return; if (gameNow() < G.arcSpawnAt) return; G.arcSpawnAt = null; spawnArcPatient(); }
function spawnArcPatient() {
  const A = storyState(); const e = Object.entries(A).find(([, a]) => !a.done && a.due <= G.s.day); if (!e) return; const [id, a] = e;
  const st = STORYLINES.find(x => x.id === id); if (!st) return; const step = st.steps[a.step]; const c = CASES.find(x => x.id === step.case); if (!c) return;
  const p = spawnPatient(c); if (!p) return;
  if (!a.pet) { a.pet = st.pet || p.name; a.owner = p.ownerName; }
  p.name = a.pet; p.ownerName = a.owner; p.arc = id; p.client = null;
  p.record.push(`${clockStr()} — Storyline “${st.title}” (visit ${a.step + 1} of ${st.steps.length}).`);
  toast(`${icon("book", 16)} <b>${st.title}</b> — ${step.text}`, "info", 5500); a.spawnedDay = G.s.day; save();
}
function storyAdvance(p) {
  if (!p || !p.arc) return; const A = storyState(); const a = A[p.arc]; if (!a || a.done) return; const st = STORYLINES.find(x => x.id === p.arc); if (!st) return;
  const step = st.steps[a.step]; a.step++; a.clean = (a.clean || 0) + (p.mistakes ? 0 : 1);
  if (a.step >= st.steps.length) {
    a.done = true; a.doneDay = G.s.day; const r = st.reward; earn(r.money); addXP(r.xp, `storyline: ${st.title}`); rep(r.rep, "storyline complete"); award("storyteller");
    toast(`${icon("book", 16)} Storyline complete: <b>${st.title}</b> (+${r.money} JD)`, "good", 5000);
    const col = p.npcCfg && p.npcCfg.pet ? "#" + Number(p.npcCfg.pet.color).toString(16).padStart(6, "0") : "#c8873a";
    if (typeof pushMsg === "function") setTimeout(() => pushMsg("c_" + a.owner, a.owner, "client", { text: st.ending.replace(/\{pet\}/g, a.pet), img: petPhotoSVG(st.species, col, {}), petName: a.pet }), 8000);
  } else a.due = G.s.day + step.gap;
  save();
}
function storylinesHTML() {
  const A = storyState();
  return STORYLINES.map(st => { const a = A[st.id]; const lock = st.level > G.s.level; const status = !a ? (lock ? `Unlocks at level ${st.level}` : "Not started — it will find you") : a.done ? `Complete (day ${a.doneDay})` : `Visit ${a.step + 1} of ${st.steps.length}${a.due > G.s.day ? ` — back on day ${a.due}` : " — due today"}`;
    return `<div class="step ${a && a.done ? "done" : ""}"><span class="chk">${a && a.done ? icon("check", 16) : icon(lock ? "tag" : "book", 16)}</span><div><b>${st.title}</b><div class="tip">${status}${a && a.pet ? ` · ${a.pet} (${a.owner})` : ""}</div>${a && a.done ? `<div class="tip">${st.ending.replace(/\{pet\}/g, a.pet)}</div>` : ""}</div></div>`; }).join("") + `<p class="muted small">Storylines bring the same patient back for follow-up visits. Sources for the cases are in References → Case sources.</p>`;
}
