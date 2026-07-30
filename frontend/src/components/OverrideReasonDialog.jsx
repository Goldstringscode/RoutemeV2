import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { OVERRIDE_REASONS } from "@/lib/evvService";

export default function OverrideReasonDialog({ open, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;
    onSubmit({ reason, details, timestamp: new Date().toISOString() });
    setReason("");
    setDetails("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-stone-800">EVV Override Reason</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          GPS or timestamp verification could not be captured normally. Select a reason and provide details to maintain EVV compliance.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 tracking-wide">Override category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
            >
              <option value="">Select a reason...</option>
              {OVERRIDE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 tracking-wide">Details (required)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              rows={3}
              placeholder="Describe what happened..."
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || !details.trim()}
              className="rounded-full px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white transition-colors"
            >
              Submit Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}