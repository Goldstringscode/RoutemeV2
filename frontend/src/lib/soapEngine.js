// SOAP AI Generation — calls OpenRouter API with a structured prompt
// Uses the 2026 SOAP formatting standards from ROUTEME_SOAP_STANDARDS_2026.md

const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SOAP_SYSTEM_PROMPT = `You are a medical documentation specialist for home health nursing. Your role is to format clinical notes into professionally correct, legally defensible SOAP notes following 2026 standards.

Rules:
1. S (Subjective) — Patient's own words, quoted. Present tense. Include pain scale, symptom description, adherence reports.
2. O (Objective) — Vitals, measurements, observations. Past tense. Include all measurable data: BP, HR, Temp, O2, glucose, wound measurements, functional assessment.
3. A (Assessment) — Clinical judgment synthesizing S+O. Present tense. Compare to baseline, identify risks, note changes.
4. P (Plan) — Action items, next visit, MD notification. Future tense. Include specific interventions, education provided, follow-up schedule.
5. Maintain proper medical terminology. Use approved abbreviations only.
6. Never add data that wasn't provided. Never fabricate vitals or findings.
7. Follow HIPAA/Joint Commission standards: factual, complete, chronological, no opinions as fact.
8. Include ICD-10 codes when appropriate in the Assessment section.
9. For home health: document home environment, caregiver availability, safety assessment when mentioned.
10. Output ONLY valid JSON with keys: subjective, objective, assessment, plan`;

export async function generateSOAPFromLLM({ template, freeForm, client, vitals }) {
  if (!API_KEY) {
    console.warn("[SOAP AI] No REACT_APP_OPENROUTER_API_KEY set — falling back to mock");
    return generateSOAPMockFallback({ template, freeForm, client, vitals });
  }

  const userPrompt = buildPrompt({ template, freeForm, client, vitals });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SOAP_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.error("[SOAP AI] API error:", res.status, res.statusText);
      return generateSOAPMockFallback({ template, freeForm, client, vitals });
    }

    const data = await res.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      subjective: content.subjective || "",
      objective: content.objective || "",
      assessment: content.assessment || "",
      plan: content.plan || "",
    };
  } catch (err) {
    console.error("[SOAP AI] Fetch error:", err);
    return generateSOAPMockFallback({ template, freeForm, client, vitals });
  }
}

function buildPrompt({ template, freeForm, client, vitals }) {
  const sections = [];

  sections.push("Format the following clinical notes into a properly structured SOAP note.");
  sections.push("");

  if (client) {
    sections.push(`Patient: ${client.fullName || "Unknown"}`);
    if (client.dob) sections.push(`DOB: ${client.dob}`);
    if (client.condition) sections.push(`Primary condition: ${client.condition}`);
    if (client.medications?.length) {
      sections.push(`Medications: ${client.medications.map(m => `${m.name} — ${m.freq}`).join(", ")}`);
    }
    if (client.flags?.length) {
      sections.push(`Care flags: ${Array.isArray(client.flags) ? client.flags.join(", ") : client.flags}`);
    }
    sections.push("");
  }

  if (vitals) {
    const v = [];
    if (vitals.bpSys && vitals.bpDia) v.push(`BP ${vitals.bpSys}/${vitals.bpDia}`);
    if (vitals.hr) v.push(`HR ${vitals.hr}`);
    if (vitals.temp) v.push(`Temp ${vitals.temp}°F`);
    if (vitals.spo2) v.push(`SpO₂ ${vitals.spo2}%`);
    if (vitals.glucose) v.push(`Glucose ${vitals.glucose} mg/dL`);
    if (v.length) sections.push(`Vitals: ${v.join(", ")}`);
    sections.push("");
  }

  if (template) {
    sections.push(`Template used: ${template.label}`);
    sections.push(`Template S: ${template.subjective}`);
    sections.push(`Template O: ${template.objective}`);
    sections.push(`Template A: ${template.assessment}`);
    sections.push(`Template P: ${template.plan}`);
    sections.push("");
  }

  if (freeForm) {
    sections.push("Additional nurse notes:");
    if (freeForm.subjective) sections.push(`S: ${freeForm.subjective}`);
    if (freeForm.objective) sections.push(`O: ${freeForm.objective}`);
    if (freeForm.assessment) sections.push(`A: ${freeForm.assessment}`);
    if (freeForm.plan) sections.push(`P: ${freeForm.plan}`);
    sections.push("");
  }

  sections.push("Format into clean SOAP note JSON. Each section should be a complete, clinically appropriate paragraph following 2026 home health documentation standards.");
  return sections.join("\n");
}

// Fallback mock (same as soapMockData.js generateSOAPFromInputs) when API key is missing
function generateSOAPMockFallback({ template, freeForm, client, vitals }) {
  const v = vitals || {};
  const conditions = client?.conditions?.join(", ") || client?.condition || "the presenting condition";

  const s = template?.subjective
    ? `${template.subjective}\n\n${freeForm?.subjective ? "Additionally, patient states, \"" + freeForm.subjective.trim() + ".\"" : ""}`.trim()
    : freeForm?.subjective
      ? `Patient states, "${freeForm.subjective.trim()}." Reports adherence to current plan of care.`
      : "Patient states, \"[record patient's own words here].\" Reports no acute changes since last visit.";

  const o = [
    v.bpSys && v.bpDia ? `BP was ${v.bpSys}/${v.bpDia} mmHg.` : "BP was [ ]/[ ] mmHg.",
    v.hr ? `HR was ${v.hr} bpm.` : "",
    v.temp ? `T was ${v.temp}°F.` : "",
    v.spo2 ? `SpO₂ was ${v.spo2}%.` : "",
    v.glucose ? `Blood glucose was ${v.glucose} mg/dL.` : "",
  ].filter(Boolean).join(" ") + (template?.objective ? `\n\n${template.objective}` : "") + (freeForm?.objective ? `\n\nAdditional observations: ${freeForm.objective.trim()}.` : "");

  const a = template?.assessment
    ? `${template.assessment.replace("[procedure]", conditions)}${freeForm?.assessment ? "\n\nClinical impression: " + freeForm.assessment.trim() + "." : ""}`
    : `Patient is presenting with ${conditions}. Clinical status is stable at this time.${freeForm?.assessment ? " " + freeForm.assessment.trim() + "." : ""}`;

  const p = template?.plan
    ? `${template.plan}${freeForm?.plan ? "\n\nAdditional plan: " + freeForm.plan.trim() + "." : ""}`
    : `Will continue current plan of care as ordered.${freeForm?.plan ? " " + freeForm.plan.trim() + "." : ""} Next visit scheduled per care plan.`;

  return {
    subjective: s,
    objective: o,
    assessment: a,
    plan: p,
  };
}