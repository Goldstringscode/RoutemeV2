import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Mail, MapPin, ShieldCheck, Users, DollarSign, Radio, Pause, Play } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function SuperAdminAgencyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agencies, globalNurses, globalClients, globalAudit, setAgencyStatus, impersonateAgency, billingLedger } = useRouteMe();
  const agency = agencies.find((a) => a.id === id);

  if (!agency) {
    return (
      <div className="max-w-3xl mx-auto text-white">
        <Link to="/superadmin/agencies" className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> All agencies
        </Link>
        <p className="mt-6">Agency not found.</p>
      </div>
    );
  }

  const nurses = globalNurses.filter((n) => n.agencyId === agency.id);
  const clients = globalClients.filter((c) => c.agencyId === agency.id);
  const events = globalAudit.filter((e) => e.agencyId === agency.id).slice(0, 8);
  const invoice = billingLedger.find((i) => i.agencyId === agency.id);

  const toggleStatus = () => {
    setAgencyStatus(agency.id, agency.status === "active" ? "suspended" : "active");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Link to="/superadmin/agencies" className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> All agencies
      </Link>

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 to-black p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-[#D95D39]/25 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#D95D39] to-[#8a3a24] text-white font-display font-semibold flex items-center justify-center text-3xl">
              {agency.logo}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#F7E5DD] font-semibold">
                {agency.plan} plan · created {agency.createdAt}
              </p>
              <h1 className="font-display text-4xl md:text-5xl leading-tight text-white mt-1">{agency.name}</h1>
              <p className="mt-2 text-white/60 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {agency.city}</span>
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {agency.director.email}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { impersonateAgency(agency); navigate("/agency/overview"); }}
              data-testid={`sa-detail-impersonate-${agency.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold"
            >
              <Radio className="h-4 w-4" /> Impersonate {agency.director.name.split(" ")[0]}
            </button>
            <button
              onClick={toggleStatus}
              data-testid={`sa-detail-toggle-${agency.id}`}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${
                agency.status === "active"
                  ? "border-red-400/40 text-red-300 hover:bg-red-400/10"
                  : "border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10"
              }`}
            >
              {agency.status === "active" ? <><Pause className="h-4 w-4" /> Suspend</> : <><Play className="h-4 w-4" /> Reactivate</>}
            </button>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Kpi icon={Users} label="Nurses" value={agency.nurses} sub={`${agency.seatsUsed}/${agency.seatsTotal} seats`} />
        <Kpi icon={Users} label="Clients" value={agency.clients} sub="under care" />
        <Kpi icon={ShieldCheck} label="HIPAA" value={`${agency.hipaaScore}%`} sub="score" tone="emerald" />
        <Kpi icon={DollarSign} label="MRR" value={`$${agency.mrr}`} sub={invoice?.status ?? "—"} tone="terra" />
        <Kpi icon={Building2} label="Status" value={agency.status} sub={agency.status === "active" ? "Live" : "Paused"} />
      </div>

      {/* Bento */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        {/* Nurses roster */}
        <div className="md:col-span-5 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Roster</p>
              <h3 className="font-display text-2xl text-white mt-1">{nurses.length} nurses on payroll</h3>
            </div>
            <Link to={`/superadmin/nurses?agency=${agency.id}`} className="text-sm font-semibold text-[#D95D39] hover:underline">Manage →</Link>
          </div>
          <ul className="divide-y divide-white/5">
            {nurses.slice(0, 8).map((n) => (
              <li key={n.id} className="py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/10 border border-white/10 text-white flex items-center justify-center text-[11px] font-semibold">
                  {n.name.split(" ").map(s => s[0]).filter(c => /[A-Z]/.test(c)).slice(0,2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{n.name}</p>
                  <p className="text-xs text-white/50 truncate">{n.zone} · {n.role}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border ${
                  n.status === "active" ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" :
                  n.status === "suspended" ? "bg-red-400/10 text-red-300 border-red-400/30" :
                  "bg-white/5 text-white/60 border-white/10"
                }`}>
                  {n.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Audit trail */}
        <div className="md:col-span-3 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Recent audit</p>
          <h3 className="font-display text-2xl text-white mt-1 mb-4">Activity</h3>
          <ul className="space-y-2">
            {events.map((e, i) => (
              <li key={i} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white/40 tabular-nums w-10 shrink-0">{e.t}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${e.severity === "critical" ? "bg-red-400" : e.severity === "warn" ? "bg-amber-400" : "bg-emerald-400"}`} />
                  <span className="text-white truncate">{e.action}</span>
                </div>
                <div className="ml-12 text-white/40 truncate">{e.resource} · {e.actorName}</div>
              </li>
            ))}
            {events.length === 0 && <li className="text-white/40 text-xs">No recent activity.</li>}
          </ul>
        </div>

        {/* Clients */}
        <div className="md:col-span-8 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Clients under care</p>
              <h3 className="font-display text-2xl text-white mt-1">{clients.length} people served</h3>
            </div>
            <Link to={`/superadmin/clients?agency=${agency.id}`} className="text-sm font-semibold text-[#D95D39] hover:underline">All clients →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {clients.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/superadmin/clients/${c.id}`} className="rounded-2xl border border-white/10 hover:border-white/30 bg-black/30 p-4 transition-colors">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{c.mrn}</div>
                <p className="font-semibold text-white mt-1 truncate">{c.fullName}</p>
                <p className="text-xs text-white/50 truncate">{c.conditions[0]}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone }) {
  const styles =
    tone === "terra" ? "bg-[#D95D39]/10 border-[#D95D39]/30" :
    tone === "emerald" ? "bg-emerald-400/10 border-emerald-400/30" :
    "bg-white/5 border-white/10";
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <Icon className="h-4 w-4 text-white/60" />
      <div className="mt-4 text-[10px] uppercase tracking-widest text-white/50 font-semibold">{label}</div>
      <div className="font-display text-3xl text-white mt-1 leading-none capitalize">{value}</div>
      <div className="text-xs text-white/50 mt-2">{sub}</div>
    </div>
  );
}
