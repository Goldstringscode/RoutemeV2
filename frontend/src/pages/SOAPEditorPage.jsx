import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Save, Sparkles, Search, X, ShieldCheck, Fingerprint,
  Info, ChevronDown, ChevronUp, Loader, AlertTriangle, Copy, RotateCcw,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { SOAP_TEMPLATES, ICD10_CATALOG } from "@/lib/soapMockData";

const SECTION_META = {
  subjective: { label: "S — Subjective", tone: "Patient's own words, quoted · present tense", color: "#D95D39" },
  objective: { label: "O — Objective", tone: "Vitals, measurements, observations · past tense", color: "#7FA08B" },
  assessment: { label: "A — Assessment", tone: "Clinical judgment synthesizing S+O · present tense", color: "#8a3a24" },
  plan: { label: "P — Plan", tone: "Action items, next visit, MD notification · future tense", color: "#4a6f5c" },
};

export default function SOAPEditorPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const preselectClientId = params.get("client");
  const navigate = useNavigate();
  const { nurse, clients, soapNotes, addSOAPNote, updateSOAPNote, generateSOAPMock } = useRouteMe();

  const existing = id ? soapNotes.find((n) => n.id === id) : null;
  const [clientId, setClientId] = useState(existing?.clientId || preselectClientId || clients[0]?.id);
  const client = clients.find((c) => c.id === clientId) ?? clients[0];

  const [templateId, setTemplateId] = useState(existing?.templateId || "");
  const template = SOAP_TEMPLATES[templateId];

  const [sections, setSections] = useState({
    subjective: existing?.subjective || "",
    objective: existing?.objective || "",
    assessment: existing?.assessment || "",
    plan: existing?.plan || "",
  });
  const [vitals, setVitals] = useState({ bpSys: "", bpDia: "", hr: "", temp: "", spo2: "", glucose: "" });
  const [icd10Codes, setIcd10Codes] = useState(existing?.icd10Codes || []);
  const [quickNote, setQuickNote] = useState(existing?.quickNote || "");
  const [generating, setGenerating] = useState(false);
  const [icdSearch, setIcdSearch] = useState("");
  const [showAutopop, setShowAutopop] = useState(true);
  const [carriedFromId, setCarriedFromId] = useState(existing?.carriedFromId || null);
  const readOnly = existing?.signed;

  // Find most recent signed note for the currently-selected client (excluding this draft if editing)
  const priorSignedNote = useMemo(() => {
    if (!clientId) return null;
    return soapNotes
      .filter((n) => n.clientId === clientId && n.signed && n.id !== id)
      .sort((a, b) => new Date(b.serviceAt) - new Date(a.serviceAt))[0] || null;
  }, [soapNotes, clientId, id]);

  const duplicatePriorNote = () => {
    if (!priorSignedNote) return;
    setTemplateId(priorSignedNote.templateId || "");
    setSections({
      subjective: priorSignedNote.subjective || "",
      objective: priorSignedNote.objective || "",
      assessment: priorSignedNote.assessment || "",
      plan: priorSignedNote.plan || "",
    });
    setIcd10Codes(priorSignedNote.icd10Codes || []);
    setCarriedFromId(priorSignedNote.id);
  };

  const clearCarriedForward = () => {
    setSections({ subjective: "", objective: "", assessment: "", plan: "" });
    setIcd10Codes([]);
    setTemplateId("");
    setCarriedFromId(null);
  };

  const applyTemplate = (tId) => {
    setTemplateId(tId);
    const t = SOAP_TEMPLATES[tId];
    if (!t) return;
    setSections({ subjective: t.subjective, objective: t.objective, assessment: t.assessment, plan: t.plan });
  };

  const generate = async () => {
    setGenerating(true);
    const result = await generateSOAPMock({ template, freeForm: sections, client, vitals });
    setSections({ subjective: result.subjective, objective: result.objective, assessment: result.assessment, plan: result.plan });
    setGenerating(false);
  };

  const filteredICD = useMemo(() => {
    if (!icdSearch) return [];
    const s = icdSearch.toLowerCase();
    return ICD10_CATALOG.filter((c) => (c.code + c.label).toLowerCase().includes(s)).slice(0, 6);
  }, [icdSearch]);

  const addICD = (c) => {
    if (icd10Codes.some((x) => x.code === c.code)) return;
    setIcd10Codes([...icd10Codes, c]);
    setIcdSearch("");
  };
  const removeICD = (code) => setIcd10Codes(icd10Codes.filter((x) => x.code !== code));

  const signAndLock = () => {
    const payload = {
      clientId: client.id,
      author: `${nurse.name}, ${nurse.license || "RN"}`,
      authorCredentials: nurse.role || "RN",
      templateId,
      templateLabel: template?.label || "General",
      serviceAt: new Date().toISOString(),
      entryAt: new Date().toISOString(),
      ...sections,
      icd10Codes,
      quickNote,
      signed: true,
      signedAt: new Date().toISOString(),
      addendums: [],
      carriedFromId: carriedFromId || null,
    };
    if (existing) updateSOAPNote(existing.id, payload);
    else addSOAPNote(payload);
    navigate("/app/soap");
  };

  const saveDraft = () => {
    const payload = {
      clientId: client.id,
      author: `${nurse.name}, ${nurse.license || "RN"}`,
      authorCredentials: nurse.role || "RN",
      templateId,
      templateLabel: template?.label || "General",
      serviceAt: existing?.serviceAt || new Date().toISOString(),
      entryAt: new Date().toISOString(),
      ...sections,
      icd10Codes,
      quickNote,
      signed: false,
      addendums: [],
      carriedFromId: carriedFromId || null,
    };
    if (existing) updateSOAPNote(existing.id, payload);
    else addSOAPNote(payload);
    navigate("/app/soap");
  };

  const anyContent = Object.values(sections).some((v) => v.trim().length > 0);
  const now = new Date();
  const serviceTime = existing?.serviceAt ? new Date(existing.serviceAt) : now;
  const lateEntry = (now - serviceTime) / 36e5 > 24;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/app/soap" className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> SOAP notes
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
          {existing ? (readOnly ? "View signed note" : "Edit draft") : "New SOAP note"}
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          <span className="font-serif-i text-[#D95D39]">Structured</span> SOAP note
        </h1>
      </div>

      {/* Client + timestamps */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Client</p>
            <select
              data-testid="soap-client-select" value={clientId} onChange={(e) => setClientId(e.target.value)}
              disabled={readOnly}
              className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none disabled:bg-stone-50"
            >
              {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Service time</p>
            <p className="mt-1.5 text-sm font-mono">{serviceTime.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Entered</p>
            <p className="mt-1.5 text-sm font-mono">{now.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
            {lateEntry && !existing && (
              <p className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Late entry (&gt;24h)</p>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate prior note (new drafts only, when prior signed note exists) */}
      {!existing && !readOnly && priorSignedNote && !carriedFromId && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5" data-testid="soap-duplicate-prior-block">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center shrink-0">
              <Copy className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900">Duplicate prior note</p>
              <p className="text-xs text-stone-600 mt-0.5">
                Carry forward the last signed note for <span className="font-semibold text-stone-800">{client?.fullName}</span> — {priorSignedNote.templateLabel} · {new Date(priorSignedNote.serviceAt).toLocaleDateString([], { dateStyle: "medium" })}. You must review and update before signing.
              </p>
            </div>
            <button
              onClick={duplicatePriorNote}
              data-testid="soap-duplicate-prior-btn"
              className="inline-flex items-center gap-2 rounded-full border border-[#D95D39]/40 text-[#D95D39] hover:bg-[#F7E5DD] px-4 py-2 text-xs font-semibold whitespace-nowrap"
            >
              <Copy className="h-3.5 w-3.5" /> Carry forward
            </button>
          </div>
        </div>
      )}

      {/* Carried-forward banner */}
      {carriedFromId && !readOnly && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4" data-testid="soap-carried-banner">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 text-sm">Carried forward from prior note — please review</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Content was duplicated from a prior signed note. Review every section, update vitals, and revise findings to reflect today's visit before signing. Copy-forward is tracked in the audit trail.
              </p>
            </div>
            <button
              onClick={clearCarriedForward}
              data-testid="soap-carried-clear"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 text-amber-900 hover:bg-amber-100 px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3" /> Start blank
            </button>
          </div>
        </div>
      )}

      {/* Auto-populated context */}
      <div className="rounded-2xl border border-stone-200 bg-[#FDFAF4] overflow-hidden" data-testid="soap-autopop">
        <button onClick={() => setShowAutopop((s) => !s)} className="w-full flex items-center justify-between px-5 py-3">
          <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-2"><Info className="h-3.5 w-3.5" /> Auto-populated from client record</span>
          {showAutopop ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
        </button>
        {showAutopop && (
          <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <AutoRow label="Name" value={client?.fullName} />
            <AutoRow label="MRN" value={client?.mrn || "—"} />
            <AutoRow label="Care type" value={client?.careType || client?.conditions?.[0]} />
            <AutoRow label="Last visit" value={client?.lastVisit || "—"} />
            <AutoRow label="Care flags" value={client?.flags || client?.notes || "None"} full />
          </div>
        )}
      </div>

      {/* Template picker */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Condition template</p>
          {template && <span className="text-[10px] text-emerald-700 bg-[#E3ECE5] border border-emerald-200 rounded-full px-2 py-0.5 uppercase tracking-widest font-semibold">Applied</span>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {Object.values(SOAP_TEMPLATES).map((t) => (
            <button
              key={t.id}
              data-testid={`soap-tpl-${t.id}`}
              disabled={readOnly}
              onClick={() => applyTemplate(t.id)}
              className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                templateId === t.id
                  ? "border-[#D95D39] bg-[#F7E5DD]"
                  : "border-stone-200 hover:border-stone-400 bg-white disabled:opacity-50"
              }`}
            >
              <div className="text-lg">{t.icon}</div>
              <p className="mt-1 font-semibold leading-tight">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Vitals (feeds AI generate) */}
      {!readOnly && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5" data-testid="soap-vitals">
          <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-3">Vitals (used by AI generate to fill Objective)</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              ["bpSys", "BP sys"], ["bpDia", "BP dia"], ["hr", "HR"],
              ["temp", "Temp °F"], ["spo2", "SpO₂"], ["glucose", "Glucose"],
            ].map(([k, label]) => (
              <div key={k}>
                <label className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">{label}</label>
                <input
                  data-testid={`soap-vital-${k}`}
                  value={vitals[k]} onChange={(e) => setVitals({ ...vitals, [k]: e.target.value })}
                  className="mt-1 w-full h-10 rounded-lg border border-stone-200 px-2 text-sm outline-none focus:border-stone-500 tabular-nums"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI generate */}
      {!readOnly && (
        <button
          onClick={generate} disabled={generating} data-testid="soap-generate"
          className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl h-14 text-sm font-semibold border-2 transition-colors ${
            generating
              ? "bg-stone-100 text-stone-500 border-stone-200 cursor-wait"
              : "bg-gradient-to-r from-[#F7E5DD] to-white text-stone-900 border-[#D95D39]/40 hover:border-[#D95D39]"
          }`}
        >
          {generating ? (
            <><Loader className="h-4 w-4 animate-spin" /> Generating professional SOAP note…</>
          ) : (
            <><Sparkles className="h-4 w-4 text-[#D95D39]" /> AI Generate · combines template + your input + patient data</>
          )}
        </button>
      )}

      {/* 4 sections */}
      {Object.entries(SECTION_META).map(([key, meta]) => (
        <div key={key} className="rounded-2xl border border-stone-200 bg-white p-6" data-testid={`soap-section-${key}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-lg font-display text-lg text-white flex items-center justify-center" style={{ background: meta.color }}>
              {key[0].toUpperCase()}
            </div>
            <div>
              <p className="font-display text-lg leading-tight">{meta.label}</p>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{meta.tone}</p>
            </div>
          </div>
          <textarea
            data-testid={`soap-input-${key}`}
            rows={key === "objective" ? 6 : 5}
            disabled={readOnly}
            value={sections[key]} onChange={(e) => setSections({ ...sections, [key]: e.target.value })}
            placeholder={`Write the ${key} section — or apply a template above and let AI Generate fill this in.`}
            className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100 disabled:bg-stone-50 leading-relaxed"
          />
        </div>
      ))}

      {/* ICD-10 */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6" data-testid="soap-icd">
        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-1">ICD-10 codes (Assessment)</p>
        <p className="text-xs text-stone-400 mb-3">Optional. Codes appear in Assessment section per 2026 standards.</p>
        {!readOnly && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              data-testid="soap-icd-search" value={icdSearch} onChange={(e) => setIcdSearch(e.target.value)}
              placeholder="Search codes or diagnoses — e.g. &quot;diabetes&quot; or &quot;E11&quot;"
              className="w-full h-11 rounded-xl border border-stone-200 pl-10 pr-3 text-sm outline-none focus:border-stone-500"
            />
            {filteredICD.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-stone-200 bg-white shadow-lg max-h-60 overflow-auto">
                {filteredICD.map((c) => (
                  <button key={c.code} onClick={() => addICD(c)} data-testid={`soap-icd-add-${c.code}`} className="w-full text-left px-3 py-2 hover:bg-stone-50 flex items-center gap-3 text-sm">
                    <code className="font-mono text-xs font-semibold text-[#D95D39] w-20">{c.code}</code>
                    <span className="text-stone-700 truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {icd10Codes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {icd10Codes.map((c) => (
              <span key={c.code} data-testid={`soap-icd-chip-${c.code}`} className="inline-flex items-center gap-2 rounded-full border border-[#D95D39]/30 bg-[#F7E5DD] text-[#8a3a24] px-3 py-1 text-xs font-semibold">
                <code className="font-mono">{c.code}</code>
                <span className="max-w-[240px] truncate">{c.label}</span>
                {!readOnly && <button onClick={() => removeICD(c.code)} className="hover:text-red-600"><X className="h-3 w-3" /></button>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick note */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-1">Quick note (private · not in official record)</p>
        <textarea
          data-testid="soap-quicknote" rows={2} disabled={readOnly}
          value={quickNote} onChange={(e) => setQuickNote(e.target.value)}
          placeholder="Reminders to yourself. Gate codes, pet names, personality quirks. Not shared with the physician."
          className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100 disabled:bg-stone-50"
        />
      </div>

      {/* Signature / actions */}
      {readOnly ? (
        <div className="rounded-2xl border border-emerald-200 bg-[#E3ECE5] p-5" data-testid="soap-signed-block">
          <div className="flex items-center gap-3">
            <Fingerprint className="h-6 w-6 text-emerald-700" />
            <div>
              <p className="font-semibold text-emerald-900">Signed & locked</p>
              <p className="text-xs text-emerald-800">{existing.author} · {new Date(existing.signedAt).toLocaleString()}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-800">
            This note is legally locked. To correct or amend, use the Addendum feature from the SOAP history.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white p-5" data-testid="soap-sign-block">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Signing locks this note. Corrections require an addendum — no deletions per HIPAA + Joint Commission.
          </div>
          <div className="flex items-center gap-3">
            <button onClick={saveDraft} disabled={!anyContent} data-testid="soap-save-draft" className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${anyContent ? "border-stone-300 hover:bg-stone-100 text-stone-900" : "border-stone-200 text-stone-400 cursor-not-allowed"}`}>
              <Save className="h-4 w-4" /> Save draft
            </button>
            <button onClick={signAndLock} disabled={!anyContent} data-testid="soap-sign" className={`ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${anyContent ? "bg-[#D95D39] hover:bg-[#C05030] text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}>
              <Fingerprint className="h-4 w-4" /> Sign electronically · {nurse.name.split(" ")[0]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AutoRow({ label, value, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</p>
      <p className="mt-0.5 text-sm text-stone-900">{value || "—"}</p>
    </div>
  );
}
