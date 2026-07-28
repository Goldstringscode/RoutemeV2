import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Save, Sparkles, Search, X, ShieldCheck, Fingerprint,
  Info, ChevronDown, ChevronUp, Loader, AlertTriangle, Copy, RotateCcw, Printer, Eye,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { SOAP_TEMPLATES, ICD10_CATALOG } from "@/lib/soapMockData";
import { openPrintWindow } from "@/lib/soapPrint";

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

    const preselectQuickNote = params.get("quickNote");

    const [templateId, setTemplateId] = useState(existing?.templateId || "");
    const template = SOAP_TEMPLATES[templateId];

    const [sections, setSections] = useState({
      subjective: existing?.subjective || preselectQuickNote || "",
      objective: existing?.objective || "",
      assessment: existing?.assessment || "",
      plan: existing?.plan || "",
    });
  const [vitals, setVitals] = useState({ bpSys: "", bpDia: "", hr: "", temp: "", spo2: "", glucose: "" });
  const [vitalWarnings, setVitalWarnings] = useState({});
  const VITAL_CONFIG = [
    { key: "bpSys", label: "BP sys", min: 60, max: 250, alertLow: 90, alertHigh: 180, step: 1 },
    { key: "bpDia", label: "BP dia", min: 30, max: 150, alertLow: 60, alertHigh: 120, step: 1 },
    { key: "hr", label: "HR", min: 30, max: 220, alertLow: 50, alertHigh: 120, step: 1 },
    { key: "temp", label: "Temp °F", min: 94, max: 108, alertLow: 96.5, alertHigh: 102, step: 0.1 },
    { key: "spo2", label: "SpO₂", min: 50, max: 100, alertLow: 92, alertHigh: null, step: 1 },
    { key: "glucose", label: "Glucose", min: 30, max: 800, alertLow: 70, alertHigh: 300, step: 1 },
  ];
  const validateVital = (key, value) => {
    if (!value) return false;
    const cfg = VITAL_CONFIG.find(v => v.key === key);
    if (!cfg) return false;
    const num = parseFloat(value);
    if (isNaN(num)) return true;
    if (num < cfg.alertLow) return true;
    if (cfg.alertHigh !== null && num > cfg.alertHigh) return true;
    return false;
  };
  const [icd10Codes, setIcd10Codes] = useState(existing?.icd10Codes || []);
  const [quickNote, setQuickNote] = useState(existing?.quickNote || "");
  const [generating, setGenerating] = useState(false);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [icdSearch, setIcdSearch] = useState("");
  const [showAutopop, setShowAutopop] = useState(true);
  const [carriedFromId, setCarriedFromId] = useState(existing?.carriedFromId || null);
    const [flashingSections, setFlashingSections] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);
      const [pendingTemplateId, setPendingTemplateId] = useState(null);
      const [showPreview, setShowPreview] = useState(false);
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
      const hasContent = Object.values(sections).some((v) => v.trim().length > 0);
      if (hasContent && tId !== templateId) {
        setPendingTemplateId(tId);
        return;
      }
      doApplyTemplate(tId);
    };

    const doApplyTemplate = (tId) => {
      setTemplateId(tId);
      setPendingTemplateId(null);
      const t = SOAP_TEMPLATES[tId];
      if (!t) return;
      setSections({ subjective: t.subjective, objective: t.objective, assessment: t.assessment, plan: t.plan });
      // Flash highlight on all sections
      setFlashingSections(true);
      setTimeout(() => setFlashingSections(false), 1200);
      // Toast
      setToastMsg(`${t.label} template applied`);
      setTimeout(() => setToastMsg(null), 3000);
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

  const executeSign = () => {
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
                addendums: existing?.addendums || [],
                carriedFromId: carriedFromId || null,
                lateEntry,
      };
      if (existing) updateSOAPNote(existing.id, payload);
      else addSOAPNote(payload);
      navigate("/app/soap");
    };

    const signAndLock = () => {
      setShowSignConfirm(true);
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
                        addendums: existing?.addendums || [],
                        carriedFromId: carriedFromId || null,
                        lateEntry,
          };
          if (existing) updateSOAPNote(existing.id, payload);
          else addSOAPNote(payload);
          navigate("/app/soap");
        };

  const anyContent = Object.values(sections).some((v) => v.trim().length > 0)
    || Object.values(vitals).some((v) => v.trim().length > 0);
  const canSign = (sections.subjective.trim().length > 0 || sections.objective.trim().length > 0)
    && clientId;
  const signDisabledReason = !clientId
    ? "Select a client first"
    : !sections.subjective.trim() && !sections.objective.trim()
      ? "Add content to Subjective or Objective before signing"
      : null;
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

                  {/* Toast notification */}
                  {toastMsg && (
                    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-2 fade-in duration-300">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-900">{toastMsg}</p>
                      </div>
                    </div>
                  )}
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
            <AutoRow label="Medications" value={client?.medications?.map(m => `${m.name} — ${m.freq}`).join("; ") || "None on record"} full />
          </div>
        )}
      </div>

      {/* Template picker */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Condition template</p>
                  {template && <span className="text-[10px] text-emerald-700 bg-[#E3ECE5] border border-emerald-200 rounded-full px-2 py-0.5 uppercase tracking-widest font-semibold animate-in fade-in zoom-in-95 duration-300">Applied</span>}
                </div>
                {/* Overwrite confirmation */}
                {pendingTemplateId && (
                  <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 animate-in slide-in-from-top-2 duration-200">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                    <p className="text-xs text-amber-900 flex-1">Sections have content. Replace with this template?</p>
                    <button
                      onClick={() => { doApplyTemplate(pendingTemplateId); }}
                      className="rounded-full bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 text-xs font-semibold transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => setPendingTemplateId(null)}
                      className="rounded-full border border-amber-300 text-amber-800 hover:bg-white px-3 py-1 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {VITAL_CONFIG.map((cfg) => {
                        const hasWarning = vitalWarnings[cfg.key];
                        return (
                          <div key={cfg.key}>
                            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">{cfg.label}</label>
                            <input
                              type="number"
                              min={cfg.min}
                              max={cfg.max}
                              step={cfg.step}
                              data-testid={`soap-vital-${cfg.key}`}
                              value={vitals[cfg.key]}
                              onChange={(e) => setVitals({ ...vitals, [cfg.key]: e.target.value })}
                              onBlur={() => {
                                setVitalWarnings(prev => ({ ...prev, [cfg.key]: validateVital(cfg.key, vitals[cfg.key]) }));
                              }}
                              className={`mt-1 w-full h-10 rounded-lg border px-2 text-sm outline-none focus:border-stone-500 tabular-nums ${
                                hasWarning ? "border-red-400 bg-red-50" : "border-stone-200"
                              }`}
                            />
                            {hasWarning && (
                              <p className="text-[10px] text-red-600 mt-0.5">
                                {parseFloat(vitals[cfg.key]) < cfg.alertLow ? `Low (<${cfg.alertLow})` : `High (>${cfg.alertHigh})`}
                              </p>
                            )}
                          </div>
                        );
                      })}
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
        <div key={key} className={`rounded-2xl border bg-white p-6 transition-all duration-500 ${flashingSections ? "border-emerald-400 ring-4 ring-emerald-200 bg-[#F0FDF4]" : "border-stone-200"}`} data-testid={`soap-section-${key}`}>
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
                        className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100 disabled:bg-stone-50 leading-relaxed min-h-[120px]"
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
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    <Fingerprint className="h-6 w-6 text-emerald-700" />
                    <div>
                      <p className="font-semibold text-emerald-900">Signed & locked</p>
                      <p className="text-xs text-emerald-800">{existing.author} · {new Date(existing.signedAt).toLocaleString()}</p>
                    </div>
                    </div>
                    <button
                      onClick={() => openPrintWindow(existing, client)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-emerald-400 hover:bg-white px-3 py-1.5 text-emerald-800 transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print / PDF
                    </button>
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
          <div className="flex flex-col sm:flex-row items-center gap-3">
                                <button onClick={saveDraft} disabled={!anyContent} data-testid="soap-save-draft" className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${anyContent ? "border-stone-300 hover:bg-stone-100 text-stone-900" : "border-stone-200 text-stone-400 cursor-not-allowed"}`}>
                                  <Save className="h-4 w-4" /> Save draft
                                </button>
                                <button onClick={() => setShowPreview(true)} disabled={!anyContent} className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${anyContent ? "border-stone-300 hover:bg-stone-100 text-stone-900" : "border-stone-200 text-stone-400 cursor-not-allowed"}`}>
                                  <Eye className="h-4 w-4" /> Preview
                                </button>
                                <div className="relative group w-full sm:w-auto">
                                  <button onClick={signAndLock} disabled={!canSign} data-testid="soap-sign" className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${canSign ? "bg-[#D95D39] hover:bg-[#C05030] text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}>
                                    <Fingerprint className="h-4 w-4" /> Sign electronically · {nurse.name.split(" ")[0]}
                                  </button>
                                  {!canSign && signDisabledReason && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                      {signDisabledReason}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900" />
                                    </div>
                                  )}
                                </div>
                              </div>
        </div>
      )}

            {/* Sign confirmation modal */}
            {showSignConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSignConfirm(false)} />
                <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-stone-100">
                    <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center shrink-0">
                      <Fingerprint className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl">Confirm signature</h2>
                      <p className="text-xs text-stone-500">This locks the note permanently</p>
                    </div>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Client</p>
                        <p className="mt-1 font-semibold text-stone-900 truncate">{client?.fullName || "—"}</p>
                      </div>
                      <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Author</p>
                        <p className="mt-1 font-semibold text-stone-900 truncate">{nurse.name}</p>
                      </div>
                      <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Template</p>
                        <p className="mt-1 font-semibold text-stone-900 truncate">{template?.label || "General"}</p>
                      </div>
                      <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Date</p>
                        <p className="mt-1 text-sm text-stone-900">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                          <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-xs font-semibold text-amber-900">Signing locks this note</p>
                                              <p className="text-[11px] text-amber-800 mt-0.5">
                                                Per HIPAA + Joint Commission standards, signed notes cannot be edited or deleted. Corrections require an appended addendum with full audit trail.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        {lateEntry && (
                                          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                                            <div className="flex items-start gap-2">
                                              <AlertTriangle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                                              <div>
                                                <p className="text-xs font-semibold text-red-900">Late entry detected</p>
                                                <p className="text-[11px] text-red-800 mt-0.5">
                                                  This note is being signed over 24 hours after the service time. The record will be flagged as a late entry in the audit trail per HIPAA guidelines.
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                  </div>
                  <div className="flex items-center gap-3 px-6 pb-6">
                    <button
                      onClick={() => setShowSignConfirm(false)}
                      className="flex-1 rounded-full border border-stone-300 hover:bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeSign}
                      data-testid="soap-confirm-sign"
                      className="flex-1 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Fingerprint className="h-4 w-4" /> Sign & lock
                    </button>
                  </div>
                </div>
              </div>
            )}
                        {/* Preview modal */}
                        {showPreview && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowPreview(false)} />
                            <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-stone-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                              {/* Header */}
                              <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center shrink-0">
                                    <Eye className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h2 className="font-display text-xl">Preview SOAP note</h2>
                                    <p className="text-xs text-stone-500">Full rendered note — {existing?.signed ? "signed" : "draft"}</p>
                                  </div>
                                </div>
                                <button onClick={() => setShowPreview(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors">
                                  <X className="h-4 w-4 text-stone-500" />
                                </button>
                              </div>

                              {/* Content */}
                              <div className="px-6 py-6 space-y-6">
                                {/* Client info header */}
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-display text-2xl">{client?.fullName || "Unknown client"}</h3>
                                    <p className="text-sm text-stone-500 mt-0.5">{client?.condition || ""}</p>
                                  </div>
                                  <div className="text-right text-xs text-stone-500 space-y-0.5">
                                    <p>{new Date().toLocaleDateString()}</p>
                                    <p>{nurse.name}</p>
                                    <p>{template?.label || "General"}</p>
                                  </div>
                                </div>

                                {/* Vitals summary */}
                                {Object.values(vitals).some(v => v.trim()) && (
                                  <div className="flex flex-wrap gap-2">
                                    {VITAL_CONFIG.map(cfg => vitals[cfg.key]?.trim() ? (
                                      <span key={cfg.key} className="inline-flex items-center gap-1 rounded-md bg-[#F9F8F6] border border-stone-200 px-2 py-1 text-xs">
                                        <span className="text-stone-500">{cfg.label}:</span>
                                        <span className="font-semibold tabular-nums">{vitals[cfg.key]}</span>
                                      </span>
                                    ) : null)}
                                  </div>
                                )}

                                {/* ICD-10 chips */}
                                {icd10Codes.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {icd10Codes.map(c => (
                                      <span key={c.code} className="inline-flex items-center gap-1 rounded-md bg-[#F7E5DD] border border-[#D95D39]/30 px-2 py-0.5 text-[11px]">
                                        <code className="font-mono font-semibold text-[#D95D39]">{c.code}</code>
                                        <span className="text-stone-600">{c.label}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* 4 sections */}
                                {Object.entries(SECTION_META).map(([key, meta]) => (
                                  <div key={key}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-6 w-6 rounded font-display text-xs text-white flex items-center justify-center" style={{ background: meta.color }}>
                                        {key[0].toUpperCase()}
                                      </div>
                                      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{meta.label}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#FDFAF4] border border-stone-200 p-4">
                                      <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                                        {sections[key] || <em className="text-stone-400">Not documented</em>}
                                      </p>
                                    </div>
                                  </div>
                                ))}

                                {/* Addendums */}
                                {existing?.addendums?.length > 0 && (
                                  <div className="rounded-xl border border-stone-200 bg-white p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-3">Addendum thread · immutable</p>
                                    {existing.addendums.map(a => (
                                      <div key={a.id} className="border-l-2 border-[#D95D39] pl-4 mb-3 last:mb-0">
                                        <p className="text-xs text-stone-500">
                                          <span className="uppercase tracking-widest font-semibold text-[#D95D39]">{a.reason}</span> · {new Date(a.addedAt).toLocaleString()} · {a.author}
                                        </p>
                                        <p className="mt-1 text-sm text-stone-800 leading-relaxed">{a.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Signature block */}
                                {existing?.signed ? (
                                  <div className="rounded-xl border border-emerald-200 bg-[#E3ECE5] p-4">
                                    <div className="flex items-center gap-2">
                                      <Fingerprint className="h-4 w-4 text-emerald-700" />
                                      <p className="text-sm font-semibold text-emerald-900">Signed & locked — {existing.author} · {new Date(existing.signedAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                                      <p className="text-sm text-amber-900">Draft — not yet signed</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer */}
                              <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100 bg-white">
                                <button onClick={() => setShowPreview(false)} className="rounded-full border border-stone-300 hover:bg-stone-50 px-5 py-2.5 text-sm font-semibold text-stone-800 transition-colors">
                                  Close
                                </button>
                                <button onClick={() => { setShowPreview(false); openPrintWindow(existing || { ...sections, icd10Codes, templateLabel: template?.label || "General", author: `${nurse.name}, ${nurse.license || "RN"}`, serviceAt: new Date().toISOString(), entryAt: new Date().toISOString(), signed: false }, client); }} className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold transition-colors">
                                  <Printer className="h-4 w-4" /> Print / PDF
                                </button>
                              </div>
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
