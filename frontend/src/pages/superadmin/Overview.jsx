import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  UserRound,
  ShieldCheck,
  DollarSign,
  ArrowUpRight,
  Activity,
  Radio,
  AlertTriangle,
  Cpu,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { AGENCY_MAP_PINS } from "@/lib/superAdminMockData";

export default function SuperAdminOverview() {
  const {
    agencies,
    globalNurses,
    globalClients,
    globalAudit,
    systemMetrics,
    superAdminMe,
    billingLedger,
  } = useRouteMe();

  const totalMRR = agencies.reduce((s, a) => s + a.mrr, 0);
  const activeAgencies = agencies.filter((a) => a.status === "active").length;
  const independentNurses = globalNurses.filter((n) => !n.agencyId).length;
  const avgHipaa = Math.round(agencies.reduce((s, a) => s + a.hipaaScore, 0) / agencies.length);
  const attentionAgencies = agencies.filter((a) => a.status === "attention" || a.hipaaScore < 90);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">
            Platform overview · {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
            Welcome back, <span className="font-serif-i text-[#D95D39]">{superAdminMe.name.split(" ").slice(-1)[0]}</span>.
          </h1>
          <p className="mt-2 text-white/60">
            {activeAgencies}/{agencies.length} agencies live · {globalNurses.length} nurses ({independentNurses} independent) · {globalClients.length} clients under care.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> System nominal
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Kpi icon={Building2} label="Agencies" value={agencies.length} sub={`${activeAgencies} active · 1 trial`} tone="terra" />
        <Kpi icon={Users} label="Total nurses" value={globalNurses.length} sub={`${independentNurses} independent`} />
        <Kpi icon={UserRound} label="Clients" value={globalClients.length} sub="PHI encrypted · AES-256" />
        <Kpi icon={DollarSign} label="Platform MRR" value={`$${totalMRR.toLocaleString()}`} sub="+9.2% MoM" tone="sage" />
        <Kpi icon={ShieldCheck} label="Avg HIPAA" value={`${avgHipaa}%`} sub="across all agencies" tone="emerald" />
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        {/* Global map */}
        <div className="md:col-span-5 rounded-3xl border border-white/10 bg-stone-900/60 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">
                Live agency map
              </p>
              <h3 className="font-display text-2xl mt-1 text-white">United States · 6 markets</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="rm-pulse-dot absolute h-2 w-2 rounded-full bg-emerald-400" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              live
            </span>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-stone-800 via-stone-900 to-black h-72 overflow-hidden">
            <svg viewBox="0 0 900 500" className="absolute inset-0 h-full w-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="900" height="500" fill="url(#grid)" />
              {/* rough US outline abstraction */}
              <path
                d="M100 200 Q200 150 350 170 T650 180 T820 220 L820 350 Q700 400 550 380 T300 400 T120 350 Z"
                fill="rgba(217,93,57,0.05)"
                stroke="rgba(217,93,57,0.25)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              {AGENCY_MAP_PINS.map((p) => {
                const ag = agencies.find((a) => a.id === p.id);
                const color = ag?.status === "attention" ? "#F59E0B" : ag?.status === "trial" ? "#7FA08B" : "#D95D39";
                return (
                  <g key={p.id}>
                    <circle cx={p.x} cy={p.y} r="18" fill={color} opacity="0.15" className="rm-pulse-dot" />
                    <circle cx={p.x} cy={p.y} r="7" fill={color} />
                    <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
                    <text x={p.x + 14} y={p.y - 8} fill="white" fontSize="10" fontWeight="600" opacity="0.8">
                      {p.label}
                    </text>
                    <text x={p.x + 14} y={p.y + 5} fill="white" fontSize="9" opacity="0.5">
                      {ag?.nurses} nurses
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <Legend color="#D95D39" label="Active" />
            <Legend color="#7FA08B" label="Trial" />
            <Legend color="#F59E0B" label="Needs attention" />
          </div>
        </div>

        {/* Agencies needing attention */}
        <div className="md:col-span-3 rounded-3xl border border-white/10 bg-gradient-to-br from-[#D95D39]/20 to-stone-900 p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#F7E5DD]">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.22em] font-semibold">
              Requires attention
            </p>
          </div>
          <h3 className="font-display text-2xl mt-2 text-white">{attentionAgencies.length} agencies flagged</h3>
          <ul className="mt-5 space-y-3">
            {attentionAgencies.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/superadmin/agencies/${a.id}`}
                  data-testid={`attention-${a.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 hover:border-white/30 bg-black/30 p-3 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-white/10 text-white font-display font-semibold flex items-center justify-center text-sm">
                    {a.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-white">{a.name}</p>
                    <p className="text-xs text-white/50 truncate">HIPAA {a.hipaaScore}% · {a.status}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40" />
                </Link>
              </li>
            ))}
            {attentionAgencies.length === 0 && (
              <li className="text-sm text-white/50">All agencies healthy.</li>
            )}
          </ul>
        </div>

        {/* Live audit stream */}
        <div className="md:col-span-5 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">
                Live audit stream
              </p>
              <h3 className="font-display text-2xl mt-1 text-white">Every action, timestamped.</h3>
            </div>
            <Link
              to="/superadmin/audit"
              className="text-sm font-semibold text-[#D95D39] hover:underline underline-offset-4"
            >
              Full log →
            </Link>
          </div>
          <ul className="space-y-2">
            {globalAudit.slice(0, 8).map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-none">
                <span className="tabular-nums text-xs text-white/40 w-12 shrink-0 font-mono">{a.t}</span>
                <SeverityDot severity={a.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">
                    <span className="font-semibold">{a.actorName}</span>
                    <span className="text-white/40"> · {a.action}</span>
                  </p>
                  <p className="text-xs text-white/40 truncate">{a.resource}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold hidden md:inline">
                  {a.actorRole}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* System pulse */}
        <div className="md:col-span-3 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <div className="flex items-center gap-2 text-white/60 mb-4">
            <Cpu className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.22em] font-semibold">System pulse</p>
          </div>
          <div className="space-y-4">
            <MetricRow label="Uptime · 30d" value={systemMetrics.uptime} tone="emerald" />
            <MetricRow label="API p95" value={`${systemMetrics.apiP95Ms} ms`} />
            <MetricRow label="DB" value={systemMetrics.dbStatus} tone="emerald" />
            <MetricRow label="Queue" value={`${systemMetrics.queueDepth} jobs`} />
            <MetricRow label="Error rate 24h" value={`${systemMetrics.errorRate24h}%`} />
          </div>
          <Link
            to="/superadmin/system"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#D95D39] hover:underline underline-offset-4"
          >
            System console <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Revenue */}
        <div className="md:col-span-8 rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 to-black p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Revenue · this cycle</p>
              <h3 className="font-display text-2xl text-white mt-1">
                <span className="font-serif-i text-[#7FA08B]">${totalMRR.toLocaleString()}</span> MRR across {agencies.length} agencies
              </h3>
            </div>
            <Link
              to="/superadmin/billing"
              className="text-sm font-semibold text-[#D95D39] hover:underline underline-offset-4"
            >
              Billing ledger →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {agencies.map((a) => {
              const inv = billingLedger.find((i) => i.agencyId === a.id);
              const statusColor =
                inv?.status === "paid" ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" :
                inv?.status === "past_due" ? "text-red-300 bg-red-400/10 border-red-400/20" :
                "text-white/60 bg-white/5 border-white/10";
              return (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{a.logo} · {a.plan}</div>
                  <div className="font-display text-2xl text-white mt-1">${a.mrr}</div>
                  <div className={`mt-2 inline-flex text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                    {inv?.status ?? "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone }) {
  const styles =
    tone === "terra"
      ? "bg-gradient-to-br from-[#D95D39]/20 to-transparent border-[#D95D39]/30"
      : tone === "sage"
        ? "bg-gradient-to-br from-[#7FA08B]/20 to-transparent border-[#7FA08B]/30"
        : tone === "emerald"
          ? "bg-gradient-to-br from-emerald-400/15 to-transparent border-emerald-400/30"
          : "bg-white/5 border-white/10";
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-white/60" />
        <Activity className="h-3 w-3 text-white/20" />
      </div>
      <div className="mt-4 text-[10px] uppercase tracking-widest text-white/50 font-semibold">
        {label}
      </div>
      <div className="font-display text-3xl text-white mt-1 leading-none">{value}</div>
      <div className="text-xs text-white/50 mt-2">{sub}</div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-white/60">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function SeverityDot({ severity }) {
  const c = severity === "critical" ? "bg-red-400" : severity === "warn" ? "bg-amber-400" : "bg-emerald-400";
  return <span className={`h-1.5 w-1.5 rounded-full ${c}`} />;
}

function MetricRow({ label, value, tone }) {
  const c = tone === "emerald" ? "text-emerald-300" : "text-white";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/50">{label}</span>
      <span className={`tabular-nums font-semibold ${c}`}>{value}</span>
    </div>
  );
}
