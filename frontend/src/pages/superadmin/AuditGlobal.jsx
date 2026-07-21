import React, { useMemo, useState } from "react";
import { Download, Search, ScrollText } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const SEV_STYLES = {
  info: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  warn: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  critical: "bg-red-400/10 text-red-300 border-red-400/30",
};

export default function SuperAdminAudit() {
  const { globalAudit, agencies } = useRouteMe();
  const [q, setQ] = useState("");
  const [sev, setSev] = useState("all");
  const [agencyFilter, setAgencyFilter] = useState("all");

  const filtered = useMemo(() => globalAudit.filter((e) => {
    if (sev !== "all" && e.severity !== sev) return false;
    if (agencyFilter !== "all" && e.agencyId !== agencyFilter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      e.actorName.toLowerCase().includes(s) ||
      e.action.toLowerCase().includes(s) ||
      e.resource.toLowerCase().includes(s) ||
      e.ip?.includes(s)
    );
  }), [globalAudit, q, sev, agencyFilter]);

  const exportCSV = () => {
    const rows = ["time,actor,role,action,resource,agency,severity,ip"];
    filtered.forEach((e) => {
      const ag = agencies.find(a => a.id === e.agencyId);
      rows.push([e.t, e.actorName, e.actorRole, e.action, e.resource, ag?.name ?? "—", e.severity, e.ip].map(v => `"${v}"`).join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `routeme-audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">HIPAA audit log</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
            Every action, <span className="font-serif-i text-[#D95D39]">forever</span>.
          </h1>
          <p className="mt-2 text-white/60">
            Immutable · tamper-evident hash chain · exportable for regulators.
          </p>
        </div>
        <button
          onClick={exportCSV}
          data-testid="sa-audit-export"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/5 text-white px-4 py-2.5 text-sm font-semibold"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            data-testid="sa-audit-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search actor, action, resource, IP…"
            className="w-full h-11 rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:border-[#D95D39]"
          />
        </div>
        <select
          data-testid="sa-audit-severity"
          value={sev}
          onChange={(e) => setSev(e.target.value)}
          className="h-11 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none capitalize"
        >
          <option value="all">All severities</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="critical">Critical</option>
        </select>
        <select
          data-testid="sa-audit-agency"
          value={agencyFilter}
          onChange={(e) => setAgencyFilter(e.target.value)}
          className="h-11 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
        >
          <option value="all">All scopes</option>
          {agencies.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Log */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 bg-black/30 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
          <ScrollText className="h-3.5 w-3.5" /> {filtered.length} events
        </div>
        <ul className="divide-y divide-white/5">
          {filtered.map((e, i) => {
            const ag = agencies.find(a => a.id === e.agencyId);
            return (
              <li key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors font-mono">
                <span className="text-xs text-white/40 tabular-nums w-14 shrink-0">{e.t}</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest font-semibold ${SEV_STYLES[e.severity]}`}>
                  {e.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate font-sans">
                    <span className="font-semibold">{e.actorName}</span>
                    <span className="text-white/40 font-normal"> ({e.actorRole})</span>
                    <span className="text-white/50 font-normal"> · {e.action}</span>
                  </p>
                  <p className="text-xs text-white/40 truncate font-sans">
                    {e.resource} {ag ? `· ${ag.name}` : ""} · {e.ip}
                  </p>
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="py-12 text-center text-white/40 text-sm">No events match your filters.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
