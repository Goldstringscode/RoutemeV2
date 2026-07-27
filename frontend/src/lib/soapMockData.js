// SOAP notes mock data & template library. Frontend-only — backend deferred.

export const SOAP_TEMPLATES = {
  post_op: {
    id: "post_op",
    label: "Post-op recovery",
    icon: "🔪",
    subjective: "Patient states, \"[chief complaint / pain level / current concerns].\" Reports [sleep quality, appetite, mobility since surgery]. Denies fever, chills, or unusual drainage.",
    objective: "Vitals: BP was [ ]/[ ] mmHg, HR was [ ] bpm, T was [ ]°F, SpO₂ was [ ]%. Surgical incision was [clean/dry/intact | erythematous | draining] with sutures/staples intact. No signs of infection. Range of motion was assessed at [ ]° flexion.",
    assessment: "Patient is [post-operative day X] following [procedure]. Healing is progressing [as expected / with mild concerns for X]. Patient is at risk for [DVT / infection / falls] and requires continued monitoring.",
    plan: "Will continue prescribed dressing changes M/W/F. Will reinforce PT exercises 3× daily as tolerated. Will monitor incision at each visit and notify Dr. [ ] if erythema increases, drainage becomes purulent, or fever > 101°F. Next visit scheduled [date/time].",
  },
  wound: {
    id: "wound",
    label: "Wound care",
    icon: "🩹",
    subjective: "Patient states, \"[pain at wound site 0-10, itching, changes noticed since last visit].\" Reports adherence to dressing schedule [yes/no]. Denies fever or increased pain.",
    objective: "Wound at [location] measured [ ] cm × [ ] cm × [ ] cm (L×W×D). Wound bed was [red granulation / yellow slough / black eschar / mixed]. Exudate was [none / serous / sanguineous / purulent], amount [none/scant/moderate/copious]. Peri-wound skin was [intact / macerated / erythematous]. Odor was [absent / present]. Vitals: BP [ ]/[ ] mmHg, HR [ ] bpm, T [ ]°F.",
    assessment: "Wound is [improving / stable / declining] compared to last assessment. Patient is at risk for [infection / delayed healing / MRSA]. Pressure ulcer stage remains [ I / II / III / IV / unstageable ].",
    plan: "Will continue dressing regimen: [cleanse with normal saline, apply hydrocolloid, cover with foam]. Will re-measure and photograph weekly. Will notify Dr. [ ] if wound expands > 10% or shows signs of infection. Next dressing change [date].",
  },
  diabetes: {
    id: "diabetes",
    label: "Diabetes management",
    icon: "💉",
    subjective: "Patient states, \"[energy level, thirst, appetite, hypoglycemic episodes since last visit].\" Reports medication compliance [as prescribed / with lapses]. Denies polyuria, blurred vision, or numbness.",
    objective: "Fasting blood glucose was [ ] mg/dL. Vitals: BP was [ ]/[ ] mmHg, HR was [ ] bpm. Feet were inspected — no ulcerations, calluses noted at [ ]. Insulin injection sites were rotated appropriately. Weight was [ ] lb ([+/-] from last visit).",
    assessment: "Glycemic control is [well-controlled / suboptimal] with fasting glucose trending [downward / upward / stable]. Patient is at risk for [hypoglycemia / diabetic neuropathy / retinopathy]. Understanding of carb-counting is [good / needs reinforcement].",
    plan: "Will continue current insulin regimen ([ ]U basal, [ ]U bolus per meal). Will reinforce carb-counting and foot care education. Will notify Dr. [ ] if two consecutive readings > 250 mg/dL or hypoglycemia < 70 mg/dL. Next A1C draw scheduled [date].",
  },
  copd: {
    id: "copd",
    label: "COPD / respiratory",
    icon: "🫁",
    subjective: "Patient states, \"[dyspnea on exertion, cough, sputum, sleep quality].\" Reports using rescue inhaler [ ] times since last visit. Denies chest pain or hemoptysis.",
    objective: "Vitals: SpO₂ was [ ]% on room air, RR was [ ]/min, HR was [ ] bpm. Breath sounds were [clear / with wheezing / with rhonchi] bilaterally. Peak flow was [ ] L/min. Patient walked [ ] feet before requesting rest. No accessory muscle use observed.",
    assessment: "COPD is [stable / with mild exacerbation]. Patient is at risk for [respiratory failure / infection / falls due to dyspnea]. Inhaler technique was [correct / requires reinforcement].",
    plan: "Will continue LABA + ICS combination therapy. Will reinforce pursed-lip breathing and energy conservation. Will notify Dr. [ ] if SpO₂ < 88% at rest, RR > 24, or if patient reports doubling of baseline dyspnea. Next visit [date].",
  },
  cardiac: {
    id: "cardiac",
    label: "Cardiac / CHF",
    icon: "❤️",
    subjective: "Patient states, \"[chest pain, palpitations, edema, orthopnea, energy level].\" Reports weight change of [ ] lb over the last week. Denies syncope or new SOB.",
    objective: "Vitals: BP was [ ]/[ ] mmHg, HR was [ ] bpm (rhythm [regular / irregular]), SpO₂ was [ ]%. Weight was [ ] lb. Lower-extremity edema was [absent / +1 / +2 / +3] bilaterally. Lung sounds were [clear / with bibasilar crackles]. JVP was [ ] cm.",
    assessment: "CHF is [compensated / decompensated]. Patient is at risk for [fluid overload / arrhythmia / re-hospitalization]. Understanding of daily weights and sodium restriction is [good / needs reinforcement].",
    plan: "Will continue current diuretic and ACE-I regimen. Will reinforce daily weights and 2 g sodium restriction. Will notify Dr. [ ] if weight increases > 3 lb in 24 h or > 5 lb in a week, or if new edema/SOB develops. Next visit [date].",
  },
  chemo: {
    id: "chemo",
    label: "Chemo aftercare",
    icon: "🌸",
    subjective: "Patient states, \"[nausea, fatigue, mouth sores, appetite, mood since last cycle].\" Reports last chemo cycle on [date]. Denies fever, chills, or unusual bleeding.",
    objective: "Vitals: T was [ ]°F, BP was [ ]/[ ] mmHg, HR was [ ] bpm. Oral mucosa was [intact / with mild mucositis / with ulcerations]. Central line / port site was [clean, dry, intact / with erythema]. Weight was [ ] lb ([+/-] from last visit). No petechiae or bruising noted.",
    assessment: "Patient is [tolerating / struggling with] chemotherapy regimen. Patient is at risk for [neutropenic fever / dehydration / thromboembolism]. Nadir period is expected [date range].",
    plan: "Will monitor temperature every 4 hours and instruct patient to call immediately for T > 100.4°F. Will encourage oral hygiene with saline rinse QID and adequate fluids. Will notify oncologist for signs of infection or intractable nausea. Next visit [date].",
  },
};

export const ICD10_CATALOG = [
  { code: "E11.9", label: "Type 2 diabetes mellitus, without complications" },
  { code: "E11.65", label: "Type 2 diabetes mellitus with hyperglycemia" },
  { code: "I10", label: "Essential (primary) hypertension" },
  { code: "I50.9", label: "Heart failure, unspecified" },
  { code: "I50.32", label: "Chronic diastolic (congestive) heart failure" },
  { code: "J44.9", label: "COPD, unspecified" },
  { code: "J44.1", label: "COPD with acute exacerbation" },
  { code: "Z96.651", label: "Presence of right artificial knee joint" },
  { code: "Z96.652", label: "Presence of left artificial knee joint" },
  { code: "L89.90", label: "Pressure ulcer of unspecified site, unspecified stage" },
  { code: "L89.153", label: "Pressure ulcer of sacral region, stage 3" },
  { code: "T81.4XXA", label: "Infection following a procedure, initial encounter" },
  { code: "C50.911", label: "Malignant neoplasm of unspecified site, right female breast" },
  { code: "C25.9", label: "Malignant neoplasm of pancreas, unspecified" },
  { code: "G30.9", label: "Alzheimer's disease, unspecified" },
  { code: "F33.1", label: "Major depressive disorder, recurrent, moderate" },
  { code: "N18.3", label: "Chronic kidney disease, stage 3 (moderate)" },
  { code: "I48.91", label: "Unspecified atrial fibrillation" },
  { code: "R26.2", label: "Difficulty in walking, not elsewhere classified" },
  { code: "Z79.01", label: "Long term (current) use of anticoagulants" },
];

// Seed history — chronological, includes an addendum example
export const SOAP_HISTORY_SEED = [
  {
    id: "soap_001",
    clientId: "c1",
    author: "Amara Okafor, RN #2418906",
    authorCredentials: "RN",
    templateId: "post_op",
    templateLabel: "Post-op recovery",
    serviceAt: "2026-02-13T08:20:00Z",
    entryAt: "2026-02-13T09:10:00Z",
    subjective: "Patient states, \"The knee is stiff in the morning but eases after walking around.\" Reports sleeping 6 hours nightly, appetite good, ambulating with walker to bathroom. Denies fever or unusual drainage.",
    objective: "Vitals: BP was 128/76 mmHg, HR was 74 bpm, T was 98.4°F, SpO₂ was 97%. Right knee incision was clean, dry, intact with staples in place. Mild swelling noted. Range of motion at 92° flexion, 5° extension.",
    assessment: "Patient is post-operative day 14 following right total knee arthroplasty. Healing is progressing as expected. Patient is at risk for DVT and falls; requires continued PT and monitoring.",
    plan: "Will continue prescribed dressing changes M/W/F. Will reinforce quad sets, heel slides, ambulation with walker. Will monitor incision at each visit. Will notify Dr. Chen if erythema increases or T > 101°F. Next visit Feb 15 at 08:15.",
    icd10Codes: [{ code: "Z96.651", label: "Presence of right artificial knee joint" }],
    signed: true,
    signedAt: "2026-02-13T09:10:00Z",
    addendums: [],
    quickNote: "Patient upbeat. Cat sitting on couch — noted for future visits.",
  },
  {
    id: "soap_002",
    clientId: "c1",
    author: "Amara Okafor, RN #2418906",
    authorCredentials: "RN",
    templateId: "post_op",
    templateLabel: "Post-op recovery",
    serviceAt: "2026-02-11T08:15:00Z",
    entryAt: "2026-02-11T08:55:00Z",
    subjective: "Patient states, \"I feel much stronger this week.\" Reports mild soreness only after PT sessions. Appetite normal. Denies fever.",
    objective: "Vitals: BP was 130/78 mmHg, HR was 72 bpm, T was 98.2°F. Incision was clean/dry/intact. ROM 88° flexion.",
    assessment: "Post-op day 12. Healing on track. Continued fall risk.",
    plan: "Continue dressing schedule. Reinforce home PT. Next visit Feb 13.",
    icd10Codes: [{ code: "Z96.651", label: "Presence of right artificial knee joint" }],
    signed: true,
    signedAt: "2026-02-11T08:55:00Z",
    addendums: [
      {
        id: "add_001",
        author: "Amara Okafor, RN #2418906",
        addedAt: "2026-02-11T14:32:00Z",
        reason: "correction",
        text: "Correction: BP was 128/76 mmHg (not 130/78 as originally documented). Re-checked in EHR after visit.",
      },
    ],
    quickNote: "",
  },
];

// Mock AI generator — synthesizes clinically-plausible SOAP from inputs.
// In production this will call an LLM; keeping the same signature makes swap-in trivial.
export function generateSOAPFromInputs({ template, freeForm, client, vitals }) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  return wait(1400).then(() => {
    const v = vitals || {};
    const conditions = client?.conditions?.join(", ") || client?.careType || "the presenting condition";
    const flag = (client?.flags || "").split(",").filter(Boolean).slice(0, 2).join("; ");

    const s = template?.subjective
      ? `${template.subjective}\n\n${freeForm.subjective ? "Additionally, patient states, \"" + freeForm.subjective.trim() + ".\"" : ""}`.trim()
      : freeForm.subjective
        ? `Patient states, "${freeForm.subjective.trim()}." Reports adherence to current plan of care.`
        : "Patient states, \"[record patient's own words here].\" Reports no acute changes since last visit.";

    const o = [
      v.bpSys && v.bpDia ? `BP was ${v.bpSys}/${v.bpDia} mmHg.` : "BP was [ ]/[ ] mmHg.",
      v.hr ? `HR was ${v.hr} bpm.` : "",
      v.temp ? `T was ${v.temp}°F.` : "",
      v.spo2 ? `SpO₂ was ${v.spo2}%.` : "",
      v.glucose ? `Blood glucose was ${v.glucose} mg/dL.` : "",
    ].filter(Boolean).join(" ") + (template?.objective ? `\n\n${template.objective}` : "") + (freeForm.objective ? `\n\nAdditional observations: ${freeForm.objective.trim()}.` : "");

    const a = template?.assessment
      ? `${template.assessment.replace("[procedure]", conditions).replace("post-operative day X", "post-operative day 14")}${freeForm.assessment ? "\n\nClinical impression: " + freeForm.assessment.trim() + "." : ""}`
      : `Patient is presenting with ${conditions}. Clinical status is stable at this time. Patient is at risk for complications related to underlying diagnosis and requires continued monitoring.${freeForm.assessment ? " " + freeForm.assessment.trim() + "." : ""}`;

    const p = template?.plan
      ? `${template.plan}${freeForm.plan ? "\n\nAdditional plan: " + freeForm.plan.trim() + "." : ""}`
      : `Will continue current plan of care as ordered. Will monitor vital signs at each visit. Will notify the primary care physician of any acute changes.${freeForm.plan ? " " + freeForm.plan.trim() + "." : ""} Next visit scheduled per care plan.`;

    return { subjective: s, objective: o, assessment: a, plan: p, careFlagNote: flag };
  });
}
