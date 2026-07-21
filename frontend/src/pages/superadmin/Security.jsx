import React from "react";
import { Shield, LogOut, ShieldAlert, KeyRound, Users, ShieldCheck } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const SEV_STYLES = {
  info: "text-emerald-300",
  warn: "text-amber-300",
  critical: "text-red-300",
};

export default function SuperAdminSecurity() {
  const { activeSessions, securityEvents, killSession, superAdmins, globalNurses } = useRouteMe();

  const mfaCoverage = Math.round(
    (superAdmins.filter(s => s.mfaEnabled).length + globalNurses.filter(n => n.mfaEnabled).length) /
    (superAdmins.length + globalNurses.length) * 100
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">Security center</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
          The <span className="font-serif-i text-[#D95D39]">perimeter</span>.
        </h1>
        <p className="mt-2 text-white/60">Sessions, MFA, incidents, and access anomalies — one glance.</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SKpi icon={Users} label="Active sessions" value={activeSessions.length} sub="right now" />
        <SKpi icon={ShieldCheck} label="MFA coverage" value={`${mfaCoverage}%`} sub={mfaCoverage >= 90 ? "healthy" : "review"} tone={mfaCoverage >= 90 ? "sage" : "warn"} />
        <SKpi icon={ShieldAlert} label="Critical events 24h" value={securityEvents.filter(e => e.severity === "critical").length} sub="requires review" tone="warn" />
        <SKpi icon={KeyRound} label="Failed logins 24h" value={5} sub="1 IP · blocked" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        {/* Active sessions */}
        <div className="md:col-span-5 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Active sessions</p>
              <h3 className="font-display text-2xl text-white mt-1">Who&apos;s in right now</h3>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 font-semibold border-b border-white/10">
                <th className="py-2">User</th>
                <th className="py-2">Device</th>
                <th className="py-2">Origin</th>
                <th className="py-2">Since</th>
                <th className="py-2 text-right">—</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeSessions.map((s) => (
                <tr key={s.id} data-testid={`sa-session-${s.id}`}>
                  <td className="py-3">
                    <div className="font-semibold text-white">{s.name}</div>
                    <div className="text-xs text-white/50">{s.role}</div>
                  </td>
                  <td className="py-3 text-white/70 text-xs">{s.device}</td>
                  <td className="py-3 text-white/60 text-xs font-mono">{s.ip}</td>
                  <td className="py-3 text-white/60 text-xs tabular-nums">{s.startedAt}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => killSession(s.id)}
                      data-testid={`sa-kill-session-${s.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 text-red-300 hover:bg-red-400/10 px-3 py-1.5 text-xs font-semibold"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Terminate
                    </button>
                  </td>
                </tr>
              ))}
              {activeSessions.length === 0 && (
                <tr><td colSpan="5" className="py-12 text-center text-white/40">No active sessions.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Security events */}
        <div className="md:col-span-3 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Security events</p>
          <h3 className="font-display text-2xl text-white mt-1 mb-4">Last 24 hours</h3>
          <ul className="space-y-3">
            {securityEvents.map((e, i) => (
              <li key={i} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-white/40 tabular-nums">{e.t}</span>
                  <span className={`text-[10px] uppercase tracking-widest font-semibold ${SEV_STYLES[e.severity]}`}>{e.severity}</span>
                </div>
                <p className="text-sm text-white">{e.label}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  IP {e.ip} · outcome: <span className="text-white/70">{e.outcome}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* RBAC matrix */}
        <div className="md:col-span-8 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">RBAC matrix</p>
          <h3 className="font-display text-2xl text-white mt-1 mb-4">Role → permission map</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="py-2 text-left px-3">Permission</th>
                  {["Owner", "Compliance", "Support", "Read-only"].map(r => <th key={r} className="py-2 px-3">{r}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["Provision agencies", "yes", "no", "no", "no"],
                  ["Suspend agencies", "yes", "no", "no", "no"],
                  ["Impersonate directors", "yes", "no", "yes", "no"],
                  ["Reveal PHI (with reason)", "yes", "yes", "no", "no"],
                  ["Export audit log", "yes", "yes", "no", "yes"],
                  ["Reset MFA (any user)", "yes", "yes", "yes", "no"],
                  ["Toggle feature flags", "yes", "no", "no", "no"],
                  ["Kill switch / maintenance", "yes", "no", "no", "no"],
                ].map((row) => (
                  <tr key={row[0]} className="text-white/70">
                    <td className="py-2 px-3 text-white">{row[0]}</td>
                    {row.slice(1).map((v, i) => (
                      <td key={i} className="py-2 px-3 text-center">
                        {v === "yes" ? <span className="text-emerald-300">✓</span> : <span className="text-white/20">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SKpi({ icon: Icon, label, value, sub, tone }) {
  const styles = tone === "sage" ? "bg-[#7FA08B]/10 border-[#7FA08B]/30" :
    tone === "warn" ? "bg-amber-400/10 border-amber-400/30" :
    "bg-white/5 border-white/10";
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <Icon className="h-4 w-4 text-white/60" />
      <div className="mt-4 text-[10px] uppercase tracking-widest text-white/50 font-semibold">{label}</div>
      <div className="font-display text-3xl text-white mt-1 leading-none">{value}</div>
      <div className="text-xs text-white/50 mt-2 capitalize">{sub}</div>
    </div>
  );
}
