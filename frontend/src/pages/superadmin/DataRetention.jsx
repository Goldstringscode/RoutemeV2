import React, { useState } from "react";
import { Trash2, Save, ShieldCheck, AlertTriangle, Clock } from "lucide-react";

const DEFAULTS = {
  phiRetention: 6, // years, HIPAA min
  auditRetention: 6,
  voiceNotes: 2,
  inactiveNurse: 2,
  deletedAgency: 30, // days
  logs: 90, // days
};

export default function DataRetention() {
  const [p, setP] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const upd = (k, v) => setP({ ...p, [k]: parseInt(v, 10) });

  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">Data retention & PHI lifecycle</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">How long we <span className="font-serif-i text-[#D95D39]">remember</span>.</h1>
        <p className="mt-2 text-white/60">Platform-wide policies. Applies to all agencies. Cannot go below HIPAA minimums.</p>
      </div>

      <form onSubmit={save} className="space-y-4">
        <Card icon={ShieldCheck} title="PHI retention">
          <RetentionSlider label="Protected Health Information" val={p.phiRetention} min={6} max={20} unit="years" onChange={(v) => upd("phiRetention", v)} note="HIPAA minimum: 6 years from last touch" testId="ret-phi" />
          <RetentionSlider label="HIPAA audit log" val={p.auditRetention} min={6} max={20} unit="years" onChange={(v) => upd("auditRetention", v)} note="HIPAA minimum: 6 years" testId="ret-audit" />
          <RetentionSlider label="Voice notes & transcripts" val={p.voiceNotes} min={1} max={10} unit="years" onChange={(v) => upd("voiceNotes", v)} note="Encrypted with client-specific keys" testId="ret-voice" />
        </Card>

        <Card icon={Clock} title="Account lifecycle">
          <RetentionSlider label="Inactive nurse profile" val={p.inactiveNurse} min={1} max={10} unit="years" onChange={(v) => upd("inactiveNurse", v)} note="Anonymized after this period" testId="ret-nurse" />
          <RetentionSlider label="Deleted agency data" val={p.deletedAgency} min={7} max={90} unit="days" onChange={(v) => upd("deletedAgency", v)} note="Grace window for restoration" testId="ret-agency" />
          <RetentionSlider label="Non-PHI logs (traffic, errors)" val={p.logs} min={30} max={365} unit="days" onChange={(v) => upd("logs", v)} note="Rolling window" testId="ret-logs" />
        </Card>

        <button type="submit" data-testid="retention-save" className="ml-auto flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold">
          <Save className="h-4 w-4" /> {saved ? "Saved · propagating" : "Save policies"}
        </button>
      </form>

      {/* Danger */}
      <div className="rounded-3xl border border-red-400/30 bg-red-400/5 p-6" data-testid="retention-danger">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-400/20 text-red-300 flex items-center justify-center"><Trash2 className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-red-300 font-semibold">Manual PHI deletion</p>
            <h3 className="font-display text-xl text-white">Purge specific record</h3>
          </div>
        </div>
        <p className="mt-3 text-sm text-white/70">
          For legal holds, right-to-be-forgotten (CCPA/GDPR), or breach remediation. Requires signed authorization. Every purge is logged, cryptographically signed, and irreversible.
        </p>
        <button onClick={() => setPurgeOpen(!purgeOpen)} data-testid="retention-purge-open" className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-400/40 text-red-300 hover:bg-red-400/10 px-4 py-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4" /> Start purge request
        </button>
        {purgeOpen && (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-black/40 p-4 space-y-3">
            <input data-testid="purge-record-id" placeholder="Record ID or MRN (e.g. gc_eleanor, MRN-A0421-EL)" className="w-full h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D95D39]" />
            <textarea data-testid="purge-reason" rows={3} placeholder="Legal basis (signed authorization ID, court order, CCPA request ID…)" className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D95D39]" />
            <button data-testid="purge-submit" className="w-full h-11 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">
              Submit for compliance review
            </button>
            <p className="text-[10px] text-white/40">Two-eyes rule: request opens a review queue for the Compliance Officer to approve within 48 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6">
      <div className="flex items-center gap-2 mb-5"><Icon className="h-4 w-4 text-[#D95D39]" /><p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">{title}</p></div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function RetentionSlider({ label, val, min, max, unit, onChange, note, testId }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-white">{label}</label>
        <div><span className="font-display text-2xl text-[#D95D39] tabular-nums" data-testid={`${testId}-val`}>{val}</span> <span className="text-xs text-white/50">{unit}</span></div>
      </div>
      <input type="range" min={min} max={max} value={val} onChange={(e) => onChange(e.target.value)} data-testid={testId} className="mt-2 w-full accent-[#D95D39]" />
      <p className="mt-1 text-xs text-white/40">{note}</p>
    </div>
  );
}
