import React from "react";
import { useRouteMe } from "@/context/RouteMeContext";
import { ShieldCheck, Download, AlertTriangle, Lock, KeyRound, ScrollText } from "lucide-react";

const SEV_STYLES = {
  info: "bg-emerald-50 text-emerald-800 border-emerald-100",
  warn: "bg-amber-50 text-amber-800 border-amber-100",
  crit: "bg-red-50 text-red-800 border-red-100",
};

export default function AgencyCompliance() {
  const { agency, nurses, complianceLog } = useRouteMe();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Compliance & audit
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Trust, <span className="font-serif-i text-[#7FA08B]">receipted</span>.
          </h1>
        </div>
        <button
          data-testid="export-audit-btn"
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-stone-50 self-start"
        >
          <Download className="h-4 w-4" /> Export audit (CSV)
        </button>
      </div>

      {/* Score hero */}
      <div className="rounded-3xl border border-stone-200 bg-stone-900 text-white p-6 md:p-8 relative overflow-hidden rm-grain">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold">
              HIPAA compliance score
            </p>
            <div className="mt-3 flex items-end gap-3">
              <span className="font-display text-7xl md:text-8xl leading-none">{agency.hipaaScore}</span>
              <span className="font-display text-4xl text-white/50">/100</span>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Last audit passed 30 days ago · zero PHI incidents recorded.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={Lock} label="Encryption" val="AES-256" ok />
            <MetricCard icon={KeyRound} label="MFA enrolled" val={`${nurses.filter((n) => n.status !== "pending").length - 2}/${nurses.filter((n) => n.status !== "pending").length}`} />
            <MetricCard icon={ScrollText} label="Audit events (24h)" val="47" ok />
            <MetricCard icon={ShieldCheck} label="BAAs signed" val={`${nurses.filter((n) => n.status === "active").length}/${nurses.length}`} ok />
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900">2 nurses missing MFA</h4>
            <p className="text-sm text-amber-800 mt-0.5">
              Marcus Bell and Jonah Reyes haven&apos;t enrolled multi-factor auth. Send a reminder to close this gap.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-amber-900 text-white px-4 py-2 text-xs font-semibold">
            Send reminder
          </button>
        </div>
      </div>

      {/* Log */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <h3 className="font-display text-2xl mb-1">Audit log</h3>
        <p className="text-sm text-stone-500 mb-5">
          Every PHI access, route change, and note capture — searchable, immutable.
        </p>

        <div className="overflow-hidden rounded-2xl border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 font-semibold bg-[#F9F8F6] border-b border-stone-200">
                <th className="py-3 px-5">Time</th>
                <th className="py-3 px-5">Nurse</th>
                <th className="py-3 px-5">Event</th>
                <th className="py-3 px-5">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {complianceLog.map((row, i) => {
                const nurse = nurses.find((n) => n.id === row.nurseId);
                return (
                  <tr key={i}>
                    <td className="py-3 px-5 text-stone-500 tabular-nums text-xs">{row.t}</td>
                    <td className="py-3 px-5 font-semibold">{nurse?.name.split(",")[0] ?? "—"}</td>
                    <td className="py-3 px-5 text-stone-700">{row.event}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-block text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border ${SEV_STYLES[row.severity]}`}
                      >
                        {row.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, val, ok = false }) {
  return (
    <div className={`rounded-2xl border p-4 ${ok ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
      <Icon className={`h-4 w-4 ${ok ? "text-emerald-300" : "text-white/70"}`} />
      <div className="text-[10px] uppercase tracking-widest text-white/60 font-semibold mt-3">
        {label}
      </div>
      <div className="font-display text-xl mt-0.5 tabular-nums">{val}</div>
    </div>
  );
}
