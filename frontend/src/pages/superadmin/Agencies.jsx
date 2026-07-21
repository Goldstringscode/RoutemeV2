import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, MoreHorizontal, Building2, ArrowUpRight, Radio } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const STATUS_STYLES = {
  active: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  trial: "bg-[#7FA08B]/10 text-[#a8c4b1] border-[#7FA08B]/30",
  attention: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  suspended: "bg-red-400/10 text-red-300 border-red-400/30",
};

export default function SuperAdminAgencies() {
  const { agencies, setAgencyStatus, impersonateAgency, pushGlobalAudit } = useRouteMe();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => agencies.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return a.name.toLowerCase().includes(s) || a.city.toLowerCase().includes(s) || a.director.name.toLowerCase().includes(s);
    }),
    [agencies, q, filter]
  );

  const impersonate = (a) => {
    impersonateAgency(a);
    navigate("/agency/overview");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">Agencies</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
            Every <span className="font-serif-i text-[#D95D39]">tenant</span>, one console.
          </h1>
          <p className="mt-2 text-white/60">Provision, suspend, impersonate, or audit any agency from here.</p>
        </div>
        <button
          data-testid="sa-new-agency"
          className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-3 text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> Provision agency
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            data-testid="sa-agency-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by agency, director, city…"
            className="w-full h-11 rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:border-[#D95D39]"
          />
        </div>
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          {["all", "active", "trial", "attention", "suspended"].map((f) => (
            <button
              key={f}
              data-testid={`sa-filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-white text-stone-900" : "text-white/60 hover:text-white"
              }`}
            >
              {f}
              {f !== "all" && (
                <span className="ml-1 opacity-60">· {agencies.filter((a) => a.status === f).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 font-semibold bg-black/30 border-b border-white/10">
              <th className="py-3 px-5">Agency</th>
              <th className="py-3 px-5">Director</th>
              <th className="py-3 px-5">Plan · Seats</th>
              <th className="py-3 px-5">Nurses · Clients</th>
              <th className="py-3 px-5">HIPAA</th>
              <th className="py-3 px-5">MRR</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((a) => (
              <tr key={a.id} data-testid={`sa-agency-row-${a.id}`} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-5">
                  <Link to={`/superadmin/agencies/${a.id}`} className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D95D39] to-[#8a3a24] text-white font-display font-semibold flex items-center justify-center text-sm">
                      {a.logo}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate flex items-center gap-1.5 group-hover:text-[#D95D39] transition-colors">
                        {a.name}
                        <ArrowUpRight className="h-3 w-3 opacity-40" />
                      </p>
                      <p className="text-xs text-white/50 truncate">{a.city}</p>
                    </div>
                  </Link>
                </td>
                <td className="py-4 px-5">
                  <div className="text-white/80">{a.director.name}</div>
                  <div className="text-xs text-white/40">{a.director.email}</div>
                </td>
                <td className="py-4 px-5">
                  <div className="text-white/80">{a.plan}</div>
                  <div className="text-xs text-white/40">{a.seatsUsed}/{a.seatsTotal} seats</div>
                </td>
                <td className="py-4 px-5">
                  <div className="text-white/80 tabular-nums">{a.nurses} · {a.clients}</div>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full ${a.hipaaScore >= 95 ? "bg-emerald-400" : a.hipaaScore >= 90 ? "bg-[#7FA08B]" : "bg-amber-400"}`}
                        style={{ width: `${a.hipaaScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/70 tabular-nums">{a.hipaaScore}%</span>
                  </div>
                </td>
                <td className="py-4 px-5 tabular-nums text-white">${a.mrr}</td>
                <td className="py-4 px-5">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="py-4 px-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        data-testid={`sa-agency-menu-${a.id}`}
                        className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                      >
                        <MoreHorizontal className="h-4 w-4 text-white/60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl bg-stone-900 border border-white/10 text-white">
                      <DropdownMenuItem onClick={() => navigate(`/superadmin/agencies/${a.id}`)}>
                        View agency detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => impersonate(a)} data-testid={`sa-impersonate-${a.id}`}>
                        <Radio className="h-3.5 w-3.5 mr-2" /> Impersonate director
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => pushGlobalAudit("Plan change dialog opened", `Agency · ${a.name}`, a.id, "info")}>
                        Change plan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      {a.status === "active" ? (
                        <DropdownMenuItem
                          className="text-red-300 focus:text-red-200"
                          onClick={() => setAgencyStatus(a.id, "suspended")}
                        >
                          Suspend agency
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => setAgencyStatus(a.id, "active")}>
                          Reactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="py-12 text-center text-white/40">
                  No agencies match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
