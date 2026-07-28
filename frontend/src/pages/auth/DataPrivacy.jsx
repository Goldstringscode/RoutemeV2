import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Trash2, ShieldCheck, AlertTriangle, ArrowLeft, Check, Loader } from "lucide-react";

export default function DataPrivacy() {
  const [exportState, setExportState] = useState("idle"); // idle | preparing | ready
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");

  const startExport = () => {
    setExportState("preparing");
    setTimeout(() => setExportState("ready"), 2200);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      <header className="border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-stone-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold">RouteMe</span>
          </Link>
          <Link to="/app/profile" className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Profile
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 lg:px-10 py-14">
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">Settings · Data & privacy</p>
        <h1 className="mt-4 font-display text-5xl leading-tight">
          Your data, <span className="font-serif-i text-[#D95D39]">on demand</span>.
        </h1>
        <p className="mt-3 text-stone-600 max-w-xl">
          Export a copy of everything RouteMe holds for you, or ask us to delete it. Both are your right under HIPAA, GDPR, and CCPA.
        </p>

        {/* EXPORT */}
        <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-8" data-testid="data-export-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Export my data</p>
              <h2 className="font-display text-xl">Download everything</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            You&apos;ll receive a ZIP containing JSON exports of your profile, clients, visit notes, audit trail, and voice-note transcripts. PHI is included and encrypted with a password we send separately.
          </p>
          <div className="mt-6">
            {exportState === "idle" && (
              <button onClick={startExport} data-testid="data-export-btn" className="inline-flex items-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 text-sm font-semibold">
                <Download className="h-4 w-4" /> Prepare export
              </button>
            )}
            {exportState === "preparing" && (
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 text-stone-700 px-5 py-2.5 text-sm font-semibold" data-testid="data-export-preparing">
                <Loader className="h-4 w-4 animate-spin" /> Preparing… we&apos;ll email you when it&apos;s ready (~5 min)
              </div>
            )}
            {exportState === "ready" && (
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-semibold" data-testid="data-export-ready">
                <Check className="h-4 w-4" /> Download routeme-export.zip (4.2 MB)
              </a>
            )}
          </div>
          <p className="mt-4 text-xs text-stone-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Export links expire 72 hours after creation
          </p>
        </div>

        {/* DELETE */}
        <div className="mt-6 rounded-3xl border border-red-200 bg-white p-8" data-testid="data-delete-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-red-600 font-semibold">Danger zone</p>
              <h2 className="font-display text-xl">Delete my account</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            We&apos;ll immediately anonymize your account. PHI is retained for 6 years per HIPAA minimum, then permanently destroyed with certification. You&apos;ll get an email confirmation.
          </p>
          {!deleteOpen ? (
            <button onClick={() => setDeleteOpen(true)} data-testid="data-delete-open" className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-300 text-red-700 hover:bg-red-50 px-5 py-2.5 text-sm font-semibold">
              <Trash2 className="h-4 w-4" /> I want to delete my account
            </button>
          ) : (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5" data-testid="data-delete-form">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 text-sm">This cannot be undone.</p>
                  <p className="text-xs text-red-800 mt-1">
                    Type <span className="font-mono font-semibold">DELETE MY ACCOUNT</span> below and tell us why.
                  </p>
                </div>
              </div>
              <input
                data-testid="data-delete-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="mt-4 w-full h-11 rounded-xl border border-red-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-red-100"
              />
              <textarea
                data-testid="data-delete-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional — help us improve"
                rows={2}
                className="mt-3 w-full rounded-xl border border-red-200 bg-white p-3 text-sm outline-none focus:ring-4 focus:ring-red-100"
              />
              <div className="mt-4 flex gap-3">
                <button onClick={() => { setDeleteOpen(false); setConfirm(""); }} className="text-sm text-stone-600 hover:text-stone-900">Cancel</button>
                <button
                  data-testid="data-delete-submit"
                  disabled={confirm !== "DELETE MY ACCOUNT"}
                  className={`ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${
                    confirm === "DELETE MY ACCOUNT"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  <Trash2 className="h-4 w-4" /> Permanently delete
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
