import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, ShieldCheck, ShieldAlert, Award, KeyRound, LogOut, Pause, Play } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function SuperAdminNurseDetail() {
  const { id } = useParams();
  const { globalNurses, agencies, globalAudit, globalClients, setGlobalNurseStatus, pushGlobalAudit } = useRouteMe();
  const nurse = globalNurses.find((n) => n.id === id);

  if (!nurse) {
    return (
      <div className="max-w-3xl mx-auto text-white">
        <Link to="/superadmin/nurses" className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> All nurses
        </Link>
        <p className="mt-6">Nurse not found.</p>
      </div>
    );
  }

  const agency = agencies.find((a) => a.id === nurse.agencyId);
  const clients = globalClients.filter((c) => c.nurseId === nurse.id);
  const events = globalAudit.filter((e) => e.actorId === nurse.id).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to="/superadmin/nurses" className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> All nurses
      </Link>

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 to-black p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#D95D39]/25 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-white/10 border border-white/10 text-white font-display font-semibold flex items-center justify-center text-2xl">
              {nurse.name.split(" ").map(s => s[0]).filter(c => /[A-Z]/.test(c)).slice(0,2).join("")}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#D95D39] font-semibold">
                {nurse.role}
              </p>
              <h1 className="font-display text-4xl md:text-5xl leading-tight text-white mt-1">{nurse.name}</h1>
              <p className="mt-2 text-white/60 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {nurse.email}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {nurse.zone}</span>
                {agency ? (
                  <Link to={`/superadmin/agencies/${agency.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                    {agency.name}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7FA08B]/40 bg-[#7FA08B]/10 text-[#a8c4b1] px-2.5 py-0.5 text-xs font-semibold">
                    <Award className="h-3 w-3" /> Independent
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => pushGlobalAudit("Force logout", `Nurse · ${nurse.name}`, nurse.agencyId, "warn")}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/5 text-white px-4 py-2.5 text-sm font-semibold"
              data-testid={`sa-nurse-logout-${nurse.id}`}
            >
              <LogOut className="h-4 w-4" /> Force logout
            </button>
            <button
              onClick={() => pushGlobalAudit("MFA reset", `Nurse · ${nurse.name}`, nurse.agencyId, "info")}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/5 text-white px-4 py-2.5 text-sm font-semibold"
            >
              <KeyRound className="h-4 w-4" /> Reset MFA
            </button>
            <button
              onClick={() => setGlobalNurseStatus(nurse.id, nurse.status === "suspended" ? "active" : "suspended")}
              data-testid={`sa-nurse-toggle-${nurse.id}`}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${
                nurse.status === "suspended"
                  ? "border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10"
                  : "border-red-400/40 text-red-300 hover:bg-red-400/10"
              }`}
            >
              {nurse.status === "suspended" ? <><Play className="h-4 w-4" /> Reactivate</> : <><Pause className="h-4 w-4" /> Suspend</>}
            </button>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard title="License">
          <Row label="License #" value={nurse.license} />
          <Row label="State" value={nurse.licenseState} />
          <Row label="Expires" value={nurse.licenseExpires} />
        </InfoCard>
        <InfoCard title="Compliance">
          <Row label="MFA" value={nurse.mfaEnabled ? "Enrolled" : "Not enrolled"} good={nurse.mfaEnabled} bad={!nurse.mfaEnabled} />
          <Row label="HIPAA training" value={nurse.complianceOk ? "Current" : "Overdue"} good={nurse.complianceOk} bad={!nurse.complianceOk} />
          <Row label="Status" value={nurse.status} />
        </InfoCard>
        <InfoCard title="Today">
          <Row label="Visits" value={nurse.visitsToday} />
          <Row label="Last active" value={nurse.lastActive} />
          <Row label="Clients assigned" value={clients.length} />
        </InfoCard>
      </div>

      {/* Clients + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <div className="md:col-span-5 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Assigned clients</p>
          <h3 className="font-display text-2xl text-white mt-1 mb-4">{clients.length} people under care</h3>
          <ul className="divide-y divide-white/5">
            {clients.map((c) => (
              <li key={c.id} className="py-3">
                <Link to={`/superadmin/clients/${c.id}`} className="flex items-center gap-3 group">
                  <div className="h-9 w-9 rounded-lg bg-[#D95D39]/20 border border-[#D95D39]/30 text-[#F7E5DD] flex items-center justify-center text-xs font-semibold">
                    {c.fullName.split(" ").map(s => s[0]).join("").slice(0,2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#D95D39]">{c.fullName}</p>
                    <p className="text-xs text-white/50 truncate">{c.mrn} · {c.conditions[0]}</p>
                  </div>
                  <span className="text-xs text-white/40 shrink-0">{c.lastVisit}</span>
                </Link>
              </li>
            ))}
            {clients.length === 0 && <li className="py-6 text-white/40 text-sm">No clients assigned.</li>}
          </ul>
        </div>

        <div className="md:col-span-3 rounded-3xl border border-white/10 bg-stone-900/60 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Recent activity</p>
          <h3 className="font-display text-2xl text-white mt-1 mb-4">Audit</h3>
          <ul className="space-y-3">
            {events.map((e, i) => (
              <li key={i} className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white/40 tabular-nums w-10">{e.t}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${e.severity === "critical" ? "bg-red-400" : e.severity === "warn" ? "bg-amber-400" : "bg-emerald-400"}`} />
                  <span className="text-white truncate">{e.action}</span>
                </div>
                <div className="ml-12 text-white/40 truncate">{e.resource}</div>
              </li>
            ))}
            {events.length === 0 && <li className="text-white/40 text-xs">No recent activity for this nurse.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-5">
      <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{title}</p>
      <div className="mt-3 space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value, good, bad }) {
  const c = good ? "text-emerald-300" : bad ? "text-amber-300" : "text-white";
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className={`font-semibold tabular-nums capitalize ${c}`}>{value}</span>
    </div>
  );
}
