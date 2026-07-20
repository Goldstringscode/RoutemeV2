import React, { useState } from "react";
import { useRouteMe } from "@/context/RouteMeContext";
import { Filter, Circle } from "lucide-react";

const TYPE_STYLES = {
  done: { dot: "bg-emerald-500", label: "Completed" },
  start: { dot: "bg-[#D95D39]", label: "Started" },
  route: { dot: "bg-stone-900", label: "Route" },
  note: { dot: "bg-amber-500", label: "Note" },
  break: { dot: "bg-sky-500", label: "Break" },
  phi: { dot: "bg-emerald-600", label: "PHI" },
  auth: { dot: "bg-stone-500", label: "Auth" },
};

export default function AgencyActivity() {
  const { liveActivity, nurses } = useRouteMe();
  const [nurseFilter, setNurseFilter] = useState("all");

  const filtered = liveActivity.filter((a) => nurseFilter === "all" || a.nurseId === nurseFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Live activity
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            The <span className="font-serif-i text-[#D95D39]">pulse</span> of your agency.
          </h1>
          <p className="mt-2 text-stone-600 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="rm-pulse-dot absolute h-2 w-2 rounded-full bg-emerald-500" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            Streaming in real time · {filtered.length} events
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-stone-500" />
          <select
            data-testid="activity-nurse-filter"
            value={nurseFilter}
            onChange={(e) => setNurseFilter(e.target.value)}
            className="text-sm bg-transparent outline-none pr-2"
          >
            <option value="all">All nurses</option>
            {nurses.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Currently on visit */}
      <div className="grid md:grid-cols-3 gap-4">
        {nurses
          .filter((n) => n.status === "active" && n.currentStop && !n.currentStop.startsWith("On break"))
          .slice(0, 3)
          .map((n) => (
            <div key={n.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <NurseAvatar nurse={n} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{n.name.split(",")[0]}</p>
                  <p className="text-xs text-stone-500">{n.zone.split("·")[0]}</p>
                </div>
                <span className="relative flex h-2 w-2">
                  <span className="rm-pulse-dot absolute h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
                </span>
              </div>
              <div className="mt-4 rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                  Current
                </div>
                <div className="text-sm font-semibold mt-1">{n.currentStop}</div>
              </div>
            </div>
          ))}
      </div>

      {/* Full stream */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl">Event stream</h3>
          <span className="text-xs text-stone-500">Last 24 hours</span>
        </div>

        <ol className="relative">
          <span className="absolute left-[27px] top-4 bottom-4 w-px bg-stone-200" />
          {filtered.map((a, i) => {
            const nurse = nurses.find((n) => n.id === a.nurseId);
            const style = TYPE_STYLES[a.type] || TYPE_STYLES.auth;
            return (
              <li key={i} className="relative flex items-start gap-4 py-3">
                <div className="relative z-10 h-14 w-14 shrink-0 flex items-center justify-center">
                  <span className={`h-3 w-3 rounded-full ${style.dot} ring-4 ring-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-stone-500 tabular-nums">{a.t}</span>
                    <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border border-stone-200 bg-stone-50 text-stone-700`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-800">
                    <span className="font-semibold">{nurse?.name.split(",")[0] ?? "Unknown"}</span>
                    <span className="text-stone-500"> · {a.label}</span>
                  </p>
                </div>
                {nurse && <NurseAvatar nurse={nurse} size={8} />}
              </li>
            );
          })}
        </ol>

        {filtered.length === 0 && (
          <div className="text-center text-stone-500 py-12">
            <Circle className="h-6 w-6 mx-auto text-stone-300 mb-2" />
            No activity for this filter yet.
          </div>
        )}
      </div>
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
  const cls = size === 8 ? "h-8 w-8" : "h-9 w-9";
  if (nurse.avatar) {
    return (
      <img
        src={nurse.avatar}
        alt=""
        className={`${cls} rounded-full object-cover border border-stone-200 shrink-0`}
      />
    );
  }
  return (
    <div className={`${cls} rounded-full bg-[#EFE9DF] border border-stone-200 text-stone-800 flex items-center justify-center text-[11px] font-semibold shrink-0`}>
      {initials}
    </div>
  );
}
