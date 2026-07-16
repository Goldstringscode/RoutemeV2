import React from "react";
import { ShieldCheck } from "lucide-react";

export default function HipaaBadge({ compact = false }) {
  return (
    <div
      data-testid="hipaa-badge"
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#D1FAE5]/80 backdrop-blur-sm px-3 py-1.5 text-emerald-900 shadow-sm ${
        compact ? "text-xs" : "text-xs md:text-sm"
      }`}
      title="HIPAA-compliant session · PHI encrypted end-to-end"
    >
      <span className="relative flex h-2 w-2">
        <span className="rm-pulse-dot absolute h-2 w-2 rounded-full bg-emerald-500" />
        <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
      <span className="font-semibold tracking-tight">HIPAA · Secure</span>
      {!compact && (
        <span className="hidden md:inline text-emerald-800/70 font-medium">
          · session encrypted
        </span>
      )}
    </div>
  );
}
