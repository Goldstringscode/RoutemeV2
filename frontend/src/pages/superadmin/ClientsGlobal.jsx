import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Eye, EyeOff, Lock, ArrowUpRight, ShieldCheck, Award } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function SuperAdminClients() {
  const { globalClients, agencies, globalNurses, phiRevealed } = useRouteMe();
  const [searchParams] = useSearchParams();
  const preAgency = searchParams.get("agency");
  const [q, setQ] = useState("");
  const [agencyFilter, setAgencyFilter] = useState(preAgency ?? "all");

  const mask = (name) => {
    const [first, ...rest] = name.split(" ");
    if (!first) return name;
    return `${first[0]}${"•".repeat(Math.max(4, first.length - 1))} ${rest.map(r => r[0] + ".").join(" ")}`;
  };

  const filtered = useMemo(() => globalClients.filter((c) => {
    if (agencyFilter === "independent" && c.agencyId) return false;
    if (agencyFilter !== "all" && agencyFilter !== "independent" && c.agencyId !== agencyFilter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return c.fullName.toLowerCase().includes(s) || c.mrn.toLowerCase().includes(s) || c.address.toLowerCase().includes(s);
  }), [globalClients, q, agencyFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">Clients · PHI vault</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
          Every patient, <span className="font-serif-i text-[#D95D39]">under seal</span>.
        </h1>
        <p className="mt-2 text-white/60 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5" />
          {globalClients.length} clients · masked by default · every reveal is logged.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            data-testid="sa-client-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by MRN, name, address…"
            className="w-full h-11 rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:border-[#D95D39]"
          />
        </div>
        <select
          data-testid="sa-client-agency"
          value={agencyFilter}
          onChange={(e) => setAgencyFilter(e.target.value)}
          className="h-11 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
        >
          <option value="all">All agencies ({globalClients.length})</option>
          <option value="independent">Independent ({globalClients.filter(c => !c.agencyId).length})</option>
          {agencies.map((a) => (
            <option key={a.id} value={a.id}>{a.name} ({globalClients.filter(c => c.agencyId === a.id).length})</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 font-semibold bg-black/30 border-b border-white/10">
              <th className="py-3 px-5">MRN</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Agency</th>
              <th className="py-3 px-5">Nurse</th>
              <th className="py-3 px-5">Primary condition</th>
              <th className="py-3 px-5">Last visit</th>
              <th className="py-3 px-5 text-right">PHI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((c) => {
              const agency = agencies.find((a) => a.id === c.agencyId);
              const nurse = globalNurses.find((n) => n.id === c.nurseId);
              const revealed = phiRevealed[c.id];
              return (
                <tr key={c.id} data-testid={`sa-client-row-${c.id}`} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-white/70">{c.mrn}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#D95D39]/20 border border-[#D95D39]/30 text-[#F7E5DD] flex items-center justify-center text-[10px] font-semibold">
                        {c.fullName.split(" ").map(s => s[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{revealed ? c.fullName : mask(c.fullName)}</p>
                        <p className="text-xs text-white/50">DOB {revealed ? c.dob : "••••-••-••"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {agency ? (
                      <div>
                        <div className="text-white/80 text-sm">{agency.name}</div>
                        <div className="text-xs text-white/40">{c.address.split(",").slice(-2).join(",").trim()}</div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-[#7FA08B]/30 bg-[#7FA08B]/10 text-[#a8c4b1] px-2.5 py-0.5">
                        <Award className="h-3 w-3" /> Independent
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-white/70">{nurse?.name.split(",")[0] ?? <span className="text-amber-300">Unassigned</span>}</td>
                  <td className="py-4 px-5 text-white/70">{c.conditions[0]}</td>
                  <td className="py-4 px-5 text-white/50 text-xs">{c.lastVisit}</td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      to={`/superadmin/clients/${c.id}`}
                      data-testid={`sa-client-view-${c.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-white/20 hover:bg-white/10 text-white px-3 py-1.5"
                    >
                      Open PHI <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="py-12 text-center text-white/40">No clients match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
