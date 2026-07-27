import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, ChevronDown, ChevronUp, Search, Fingerprint, Clock, Edit3, Lock } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function SOAPHub() {
  const { soapNotes, clients, addSOAPAddendum } = useRouteMe();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [addOpen, setAddOpen] = useState(null);
  const [addReason, setAddReason] = useState("correction");
  const [addText, setAddText] = useState("");

  const enriched = useMemo(() => soapNotes.map((n) => ({
    ...n,
    client: clients.find((c) => c.id === n.clientId),
  })).sort((a, b) => new Date(b.serviceAt) - new Date(a.serviceAt)), [soapNotes, clients]);

  const filtered = enriched.filter((n) => {
    if (statusFilter === "signed" && !n.signed) return false;
    if (statusFilter === "draft" && n.signed) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (n.client?.fullName || "").toLowerCase().includes(s) || n.templateLabel.toLowerCase().includes(s);
  });

  const submitAddendum = (noteId) => {
    if (!addText.trim()) return;
    addSOAPAddendum(noteId, { reason: addReason, text: addText });
    setAddText("");
    setAddOpen(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">SOAP notes</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            The <span className="font-serif-i text-[#D95D39]">chart</span>, structured.
          </h1>
          <p className="mt-2 text-stone-600">{enriched.length} notes · {enriched.filter(n => n.signed).length} signed · legally defensible</p>
        </div>
        <Link to="/app/soap/new" data-testid="soap-new-btn" className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-3 text-sm font-semibold">
          <Plus className="h-4 w-4" /> New SOAP note
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input data-testid="soap-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by client name or template…" className="w-full h-11 rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-stone-500" />
        </div>
        <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
          {[["all", "All"], ["signed", "Signed"], ["draft", "Drafts"]].map(([id, l]) => (
            <button key={id} onClick={() => setStatusFilter(id)} data-testid={`soap-filter-${id}`} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${statusFilter === id ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {filtered.map((n) => {
          const isOpen = expanded === n.id;
          return (
            <li key={n.id} data-testid={`soap-card-${n.id}`} className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : n.id)} className="w-full flex items-start gap-4 p-5 text-left hover:bg-stone-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/app/clients/${n.clientId}`} className="font-semibold text-stone-900 hover:text-[#D95D39] transition-colors">{n.client?.fullName || "Unknown client"}</Link>
                    <span className="text-xs text-stone-500">·</span>
                    <span className="text-xs text-stone-500">{n.templateLabel}</span>
                    {n.signed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold rounded-full bg-[#E3ECE5] text-emerald-800 border border-emerald-200 px-2 py-0.5"><Lock className="h-2.5 w-2.5" /> Signed</span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5">Draft</span>
                    )}
                    {n.addendums?.length > 0 && (
                      <span className="text-[10px] uppercase tracking-widest font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5">
                        +{n.addendums.length} addendum{n.addendums.length === 1 ? "" : "s"}
                      </span>
                    )}
                    {n.carriedFromId && (
                      <span data-testid={`soap-carried-badge-${n.id}`} className="text-[10px] uppercase tracking-widest font-semibold rounded-full bg-[#F7E5DD] text-[#8a3a24] border border-[#D95D39]/30 px-2 py-0.5">
                        Carried forward
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(n.serviceAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                    <span>·</span>
                    <span>{n.author}</span>
                  </p>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-stone-100 p-5 space-y-4 bg-[#FDFAF4]">
                  <SoapSection letter="S" label="Subjective" color="#D95D39" text={n.subjective} />
                  <SoapSection letter="O" label="Objective" color="#7FA08B" text={n.objective} />
                  <SoapSection letter="A" label="Assessment" color="#8a3a24" text={n.assessment} icd10={n.icd10Codes} />
                  <SoapSection letter="P" label="Plan" color="#4a6f5c" text={n.plan} />

                  {/* Addendum thread */}
                  {n.addendums?.length > 0 && (
                    <div className="rounded-xl border border-stone-200 bg-white p-4" data-testid={`soap-addendums-${n.id}`}>
                      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-3">Addendum thread · immutable</p>
                      <ul className="space-y-3">
                        {n.addendums.map((a) => (
                          <li key={a.id} className="border-l-2 border-[#D95D39] pl-4">
                            <p className="text-xs text-stone-500">
                              <span className="uppercase tracking-widest font-semibold text-[#D95D39]">{a.reason}</span> · {new Date(a.addedAt).toLocaleString()} · {a.author}
                            </p>
                            <p className="mt-1 text-sm text-stone-800 leading-relaxed">{a.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {!n.signed && (
                      <Link to={`/app/soap/${n.id}`} data-testid={`soap-edit-${n.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-stone-300 hover:bg-white px-3 py-1.5">
                        <Edit3 className="h-3.5 w-3.5" /> Continue draft
                      </Link>
                    )}
                    {n.signed && (
                      <>
                        <Link to={`/app/soap/${n.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-stone-300 hover:bg-white px-3 py-1.5">
                          <Fingerprint className="h-3.5 w-3.5" /> View signed note
                        </Link>
                        <button onClick={() => setAddOpen(addOpen === n.id ? null : n.id)} data-testid={`soap-addendum-open-${n.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-[#D95D39]/40 text-[#D95D39] hover:bg-[#F7E5DD] px-3 py-1.5">
                          <Edit3 className="h-3.5 w-3.5" /> Add addendum
                        </button>
                      </>
                    )}
                  </div>

                  {/* Addendum inline form */}
                  {addOpen === n.id && (
                    <div className="rounded-xl border border-[#D95D39]/30 bg-white p-4 space-y-3" data-testid={`soap-addendum-form-${n.id}`}>
                      <p className="text-xs text-stone-600">Per HIPAA + Joint Commission: no deletions. Every correction is an appended addendum with full audit trail.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <select data-testid="addendum-reason" value={addReason} onChange={(e) => setAddReason(e.target.value)} className="h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm">
                          <option value="correction">Correction</option>
                          <option value="clarification">Clarification</option>
                          <option value="late_entry">Late entry</option>
                          <option value="additional_information">Additional information</option>
                        </select>
                        <div className="text-xs text-stone-500 self-center">Author: <span className="font-semibold text-stone-900">{n.author}</span></div>
                      </div>
                      <textarea data-testid="addendum-text" rows={3} value={addText} onChange={(e) => setAddText(e.target.value)} placeholder="State the correction/clarification clearly. This becomes part of the permanent record." className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100" />
                      <div className="flex items-center gap-2">
                        <button onClick={() => setAddOpen(null)} className="text-sm text-stone-500 hover:text-stone-900">Cancel</button>
                        <button data-testid="addendum-submit" onClick={() => submitAddendum(n.id)} disabled={!addText.trim()} className={`ml-auto rounded-full px-4 py-2 text-xs font-semibold ${addText.trim() ? "bg-[#D95D39] hover:bg-[#C05030] text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}>
                          Sign & append addendum
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-stone-300 p-10 text-center">
            <FileText className="h-8 w-8 text-stone-300 mx-auto" />
            <p className="mt-3 text-sm text-stone-500">No SOAP notes match your filters.</p>
          </li>
        )}
      </ul>
    </div>
  );
}

function SoapSection({ letter, label, color, text, icd10 }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded font-display text-xs text-white flex items-center justify-center" style={{ background: color }}>{letter}</div>
        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</p>
      </div>
      <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">{text || <em className="text-stone-400">Not documented</em>}</p>
      {icd10?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {icd10.map((c) => (
            <span key={c.code} className="inline-flex items-center gap-1 rounded-md bg-white border border-stone-200 px-2 py-0.5 text-[11px]">
              <code className="font-mono font-semibold text-[#D95D39]">{c.code}</code>
              <span className="text-stone-600 max-w-[200px] truncate">{c.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
