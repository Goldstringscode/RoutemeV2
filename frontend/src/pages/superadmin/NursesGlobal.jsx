import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, MoreHorizontal, ArrowUpRight, Award, ShieldCheck, ShieldAlert } from "lucide-react";
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
  pending: "bg-[#D95D39]/10 text-[#D95D39] border-[#D95D39]/30",
  attention: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  suspended: "bg-red-400/10 text-red-300 border-red-400/30",
};

export default function SuperAdminNurses() {
  const { globalNurses, agencies, setGlobalNurseStatus, pushGlobalAudit } = useRouteMe();
  const [searchParams] = useSearchParams();
  const preAgency = searchParams.get("agency");
  const [q, setQ] = useState("");
  const [affiliation, setAffiliation] = useState(preAgency ?? "all"); // all | independent | ag_id
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return globalNurses.filter((n) => {
      if (affiliation === "independent" && n.agencyId) return false;
      if (affiliation !== "all" && affiliation !== "independent" && n.agencyId !== affiliation) return false;
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return n.name.toLowerCase().includes(s) || n.email.toLowerCase().includes(s) || n.zone.toLowerCase().includes(s);
    });
  }, [globalNurses, q, affiliation, statusFilter]);

  const independentCount = globalNurses.filter(n => !n.agencyId).length;
  const attentionCount = globalNurses.filter(n => n.status === "attention" || !n.complianceOk).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">Global nurse roster</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
          Every nurse, <span className="font-serif-i text-[#D95D39]">agency or independent</span>.
        </h1>
        <p className="mt-2 text-white/60">
          {globalNurses.length} nurses across {agencies.length} agencies · {independentCount} independent · {attentionCount} need attention.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            data-testid="sa-nurse-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search nurses, emails, zones, license…"
            className="w-full h-11 rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:border-[#D95D39]"
          />
        </div>
        <select
          data-testid="sa-nurse-affiliation"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          className="h-11 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
        >
          <option value="all">All affiliations ({globalNurses.length})</option>
          <option value="independent">Independent ({independentCount})</option>
          {agencies.map((a) => (
            <option key={a.id} value={a.id}>{a.name} ({globalNurses.filter(n => n.agencyId === a.id).length})</option>
          ))}
        </select>
        <select
          data-testid="sa-nurse-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none capitalize"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="attention">Attention</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 font-semibold bg-black/30 border-b border-white/10">
              <th className="py-3 px-5">Nurse</th>
              <th className="py-3 px-5">Affiliation</th>
              <th className="py-3 px-5">License</th>
              <th className="py-3 px-5">Zone</th>
              <th className="py-3 px-5">Compliance</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Visits · today</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((n) => {
              const agency = agencies.find((a) => a.id === n.agencyId);
              return (
                <tr key={n.id} data-testid={`sa-nurse-row-${n.id}`} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-5">
                    <Link to={`/superadmin/nurses/${n.id}`} className="flex items-center gap-3 group">
                      <div className="h-9 w-9 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center text-[11px] font-semibold">
                        {n.name.split(" ").map(s => s[0]).filter(c => /[A-Z]/.test(c)).slice(0,2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate flex items-center gap-1.5 group-hover:text-[#D95D39]">
                          {n.name}
                          <ArrowUpRight className="h-3 w-3 opacity-40" />
                        </p>
                        <p className="text-xs text-white/50 truncate">{n.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-5">
                    {agency ? (
                      <div>
                        <div className="text-white/80 truncate">{agency.name}</div>
                        <div className="text-xs text-white/40 truncate">{agency.city}</div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-[#7FA08B]/30 bg-[#7FA08B]/10 text-[#a8c4b1] px-2.5 py-0.5">
                        <Award className="h-3 w-3" /> Independent
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <div className="text-white/80 text-xs tabular-nums">{n.license}</div>
                    <div className="text-xs text-white/40">{n.licenseState} · exp {n.licenseExpires}</div>
                  </td>
                  <td className="py-4 px-5 text-white/70">{n.zone}</td>
                  <td className="py-4 px-5">
                    {n.complianceOk ? (
                      <span className="inline-flex items-center gap-1 text-emerald-300 text-xs">
                        <ShieldCheck className="h-3.5 w-3.5" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-300 text-xs">
                        <ShieldAlert className="h-3.5 w-3.5" /> Flagged
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${STATUS_STYLES[n.status] ?? "bg-white/5 text-white/60 border-white/10"}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-display text-lg text-white tabular-nums">{n.visitsToday}</td>
                  <td className="py-4 px-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          data-testid={`sa-nurse-menu-${n.id}`}
                          className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                        >
                          <MoreHorizontal className="h-4 w-4 text-white/60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl bg-stone-900 border border-white/10 text-white">
                        <DropdownMenuItem asChild>
                          <Link to={`/superadmin/nurses/${n.id}`}>View full profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => pushGlobalAudit("Force logout", `Nurse · ${n.name}`, n.agencyId, "warn")}>
                          Force logout
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => pushGlobalAudit("MFA reset", `Nurse · ${n.name}`, n.agencyId, "info")}>
                          Reset MFA
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {n.status !== "suspended" ? (
                          <DropdownMenuItem
                            className="text-red-300 focus:text-red-200"
                            onClick={() => setGlobalNurseStatus(n.id, "suspended")}
                          >
                            Suspend nurse
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setGlobalNurseStatus(n.id, "active")}>
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="8" className="py-12 text-center text-white/40">No nurses match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
