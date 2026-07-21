import React from "react";
import { Cpu, Database, Wifi, Server, AlertOctagon, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function SuperAdminSystem() {
  const { systemMetrics, toggleFeatureFlag, featureFlags, maintenanceMode, toggleMaintenance } = useRouteMe();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">System health</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
            The <span className="font-serif-i text-[#D95D39]">machine room</span>.
          </h1>
          <p className="mt-2 text-white/60">
            Uptime, latency, workers, and platform-wide feature toggles.
          </p>
        </div>
        <button
          onClick={toggleMaintenance}
          data-testid="sa-maintenance-toggle"
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${
            maintenanceMode
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
              : "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          {maintenanceMode ? "Exit maintenance mode" : "Enable maintenance mode"}
        </button>
      </div>

      {/* Health cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card icon={Wifi} label="Uptime · 30d" value={systemMetrics.uptime} tone="emerald" />
        <Card icon={Server} label="API p95 / p99" value={`${systemMetrics.apiP95Ms} / ${systemMetrics.apiP99Ms} ms`} />
        <Card icon={Database} label="Database" value={systemMetrics.dbStatus} tone="emerald" cap />
        <Card icon={Cpu} label="Workers" value={`${systemMetrics.workersHealthy}/${systemMetrics.workers}`} sub={`queue: ${systemMetrics.queueDepth} jobs`} />
      </div>

      {/* Uptime bar */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Uptime · last 90 days</p>
        <h3 className="font-display text-2xl text-white mt-1 mb-4">Every incident, remembered.</h3>
        <div className="flex items-end gap-[3px] h-16">
          {Array.from({ length: 90 }).map((_, i) => {
            const bad = [22, 47, 68].includes(i);
            return (
              <div
                key={i}
                title={`Day -${89 - i}${bad ? " · minor incident" : ""}`}
                className={`flex-1 rounded-sm ${bad ? "bg-amber-400/70" : "bg-emerald-400/60"}`}
                style={{ height: bad ? "60%" : "100%" }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-white/40 mt-3">
          <span>90d ago</span>
          <span className="text-emerald-300">99.98% availability</span>
          <span>today</span>
        </div>
      </div>

      {/* Feature flags */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Feature flags</p>
        <h3 className="font-display text-2xl text-white mt-1 mb-4">Runtime configuration</h3>
        <ul className="divide-y divide-white/5">
          {featureFlags.map((f) => (
            <li key={f.key} data-testid={`sa-flag-${f.key}`} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-sm text-white">{f.key}</p>
                <p className="text-xs text-white/50 truncate">{f.description}</p>
              </div>
              <button
                onClick={() => toggleFeatureFlag(f.key)}
                data-testid={`sa-flag-toggle-${f.key}`}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest ${
                  f.enabled
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : "border-white/20 text-white/60"
                }`}
              >
                {f.enabled ? <><ToggleRight className="h-4 w-4" /> On</> : <><ToggleLeft className="h-4 w-4" /> Off</>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Build info */}
      <div className="rounded-3xl border border-white/10 bg-black/30 p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Meta label="Version" value="v1.4.2" />
        <Meta label="Build" value="6f2a91c" />
        <Meta label="Region" value="us-central-1" />
        <Meta label="Env" value="production" />
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value, sub, tone, cap }) {
  const styles = tone === "emerald" ? "bg-emerald-400/10 border-emerald-400/30" : "bg-white/5 border-white/10";
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <Icon className="h-4 w-4 text-white/60" />
      <div className="mt-4 text-[10px] uppercase tracking-widest text-white/50 font-semibold">{label}</div>
      <div className={`font-display text-3xl text-white mt-1 leading-none ${cap ? "capitalize" : ""}`}>{value}</div>
      {sub && <div className="text-xs text-white/50 mt-2">{sub}</div>}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{label}</div>
      <div className="font-mono text-sm text-white mt-1">{value}</div>
    </div>
  );
}
