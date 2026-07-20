import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Users,
  Route,
  ShieldCheck,
  Clock,
  Fuel,
  Activity,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function AgencyOverview() {
  const { agency, nurses, liveActivity, agencyClients } = useRouteMe();

  const activeNurses = nurses.filter((n) => n.status === "active");
  const visitsToday = nurses.reduce((s, n) => s + n.visitsToday, 0);
  const totalWeeklySaved = nurses.reduce((s, n) => s + n.weeklySaved, 0);
  const hoursSaved = Math.floor(totalWeeklySaved / 60);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            {agency.name} · {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Good morning, <span className="font-serif-i text-[#D95D39]">{agency.admin.name.split(" ")[0]}</span>.
          </h1>
          <p className="mt-2 text-stone-600">
            {activeNurses.length} nurses on shift · {visitsToday} visits in motion · {agency.hipaaScore}% HIPAA score.
          </p>
        </div>
        <Link
          to="/agency/nurses"
          data-testid="overview-invite-btn"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 text-sm font-semibold transition-colors self-start"
        >
          <Plus className="h-4 w-4" /> Invite nurse
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Active nurses" value={activeNurses.length} sub={`of ${nurses.length} total`} tone="ink" />
        <KpiCard icon={Route} label="Visits today" value={visitsToday} sub="across 6 zones" tone="terra" />
        <KpiCard icon={Clock} label="Weekly time saved" value={`${hoursSaved}h`} sub={`${totalWeeklySaved % 60}m across team`} tone="sage" />
        <KpiCard icon={ShieldCheck} label="HIPAA score" value={`${agency.hipaaScore}%`} sub="no incidents 30d" tone="emerald" />
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        {/* On-shift nurses */}
        <div className="md:col-span-5 rounded-3xl border border-stone-200 bg-white p-6 rm-lift">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                On shift right now
              </p>
              <h3 className="font-display text-2xl mt-1">Your field team</h3>
            </div>
            <Link
              to="/agency/nurses"
              className="text-sm font-semibold text-[#D95D39] hover:underline underline-offset-4"
            >
              Manage roster →
            </Link>
          </div>

          <ul className="divide-y divide-stone-200">
            {activeNurses.slice(0, 5).map((n) => (
              <li key={n.id} className="py-3 flex items-center gap-4">
                <NurseAvatar nurse={n} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{n.name}</p>
                    <span className="text-[10px] uppercase tracking-widest text-stone-400">· {n.zone.split("·")[0]}</span>
                  </div>
                  <p className="text-xs text-stone-500 truncate flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {n.currentStop || "Idle"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-lg tabular-nums">{n.visitsToday}</div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-widest">visits</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Fuel/time saved */}
        <div className="md:col-span-3 rounded-3xl border border-stone-200 bg-stone-900 text-white p-6 rm-lift relative overflow-hidden">
          <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#D95D39]/40 blur-3xl" />
          <Fuel className="relative h-6 w-6 text-[#F7E5DD]" strokeWidth={1.8} />
          <p className="relative text-xs uppercase tracking-[0.22em] text-white/60 font-semibold mt-4">
            Agency-wide savings · this week
          </p>
          <div className="relative mt-3">
            <div className="font-display text-6xl leading-none">+9.2%</div>
            <div className="text-sm text-white/70 mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> vs. baseline
            </div>
          </div>
          <div className="relative mt-6 space-y-2 text-sm">
            <Row label="Miles saved" value="284 mi" />
            <Row label="Fuel saved" value="~$118" />
            <Row label="Care hours reclaimed" value={`${hoursSaved}h ${totalWeeklySaved % 60}m`} />
          </div>
        </div>

        {/* Live activity */}
        <div className="md:col-span-4 rounded-3xl border border-stone-200 bg-white p-6 rm-lift">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Live activity
              </p>
              <h3 className="font-display text-2xl mt-1">Right now, across the field.</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="rm-pulse-dot absolute h-2 w-2 rounded-full bg-emerald-500" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              live
            </span>
          </div>

          <ul className="space-y-3">
            {liveActivity.slice(0, 6).map((a, i) => {
              const nurse = nurses.find((n) => n.id === a.nurseId);
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="tabular-nums text-xs text-stone-500 w-14 shrink-0">{a.t}</span>
                  {nurse && <NurseAvatar nurse={nurse} size={7} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-stone-800 truncate">
                      <span className="font-semibold">{nurse?.name.split(",")[0] ?? "Unknown"}</span>
                      <span className="text-stone-500"> · {a.label}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link
            to="/agency/activity"
            className="mt-4 inline-block text-sm font-semibold text-[#D95D39] hover:underline underline-offset-4"
          >
            View full stream →
          </Link>
        </div>

        {/* Zones distribution */}
        <div className="md:col-span-4 rounded-3xl border border-stone-200 bg-[#EFE9DF] p-6 rm-lift">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
            Coverage by zone
          </p>
          <h3 className="font-display text-2xl mt-1 mb-5">
            {agencyClients.length} clients, <span className="font-serif-i text-[#7FA08B]">6 zones</span>.
          </h3>

          <div className="space-y-3">
            {["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6"].map((z, i) => {
              const count = nurses.filter((n) => n.zone.startsWith(z)).length;
              const clients = agencyClients.filter((c) =>
                nurses.find((n) => n.id === c.nurseId)?.zone.startsWith(z)
              ).length;
              const pct = Math.min(100, clients * 12 + 20);
              return (
                <div key={z}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-stone-700">{z}</span>
                    <span className="text-stone-500 tabular-nums">
                      {count} nurse{count === 1 ? "" : "s"} · {clients} clients
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white overflow-hidden border border-stone-200">
                    <div
                      className="h-full rounded-full bg-[#D95D39]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compliance summary strip */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 rm-lift">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                HIPAA compliance
              </p>
              <h3 className="font-display text-2xl">
                {agency.hipaaScore}% — <span className="font-serif-i text-[#7FA08B]">strong</span>
              </h3>
            </div>
          </div>
          <div className="hidden md:block h-14 w-px bg-stone-200" />
          <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
            <Chip label="Encrypted sessions" val="12/12" />
            <Chip label="MFA enrolled" val="10/12" />
            <Chip label="Audit events (24h)" val="47" />
          </div>
          <Link
            to="/agency/compliance"
            className="inline-flex items-center gap-1 text-sm font-semibold text-stone-800 hover:underline"
          >
            Review <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone }) {
  const styles =
    tone === "terra"
      ? "bg-[#F7E5DD] border-[#F0D2C4] text-[#D95D39]"
      : tone === "sage"
        ? "bg-[#E3ECE5] border-emerald-100 text-emerald-800"
        : tone === "emerald"
          ? "bg-emerald-50 border-emerald-100 text-emerald-800"
          : "bg-white border-stone-200 text-stone-900";
  return (
    <div className={`rounded-2xl border p-5 rm-lift ${styles}`}>
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 opacity-80" />
        <Activity className="h-3 w-3 opacity-30" />
      </div>
      <div className="mt-4 text-[10px] uppercase tracking-widest opacity-70 font-semibold">
        {label}
      </div>
      <div className="font-display text-4xl mt-1 leading-none">{value}</div>
      <div className="text-xs opacity-70 mt-2">{sub}</div>
    </div>
  );
}

function NurseAvatar({ nurse, size = 9 }) {
  const initials = nurse.name
    .split(" ")
    .map((s) => s[0])
    .filter((c) => /[A-Z]/i.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (nurse.avatar) {
    return (
      <img
        src={nurse.avatar}
        alt=""
        className={`h-${size} w-${size} rounded-full object-cover border border-stone-200 shrink-0`}
      />
    );
  }
  return (
    <div className={`h-${size} w-${size} rounded-full bg-[#EFE9DF] border border-stone-200 text-stone-800 flex items-center justify-center text-[11px] font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60">{label}</span>
      <span className="tabular-nums font-semibold">{value}</span>
    </div>
  );
}

function Chip({ label, val }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</div>
      <div className="font-display text-xl tabular-nums mt-0.5">{val}</div>
    </div>
  );
}
