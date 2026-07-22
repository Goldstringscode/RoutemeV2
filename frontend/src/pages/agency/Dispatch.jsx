import React, { useState } from "react";
import { Users, Clock, ArrowLeftRight, Calendar } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const HOURS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const VISITS_SEED = {
  n_amara: [
    { id: "v1", client: "Eleanor Mabry", start: "08:00", duration: 1, priority: "high" },
    { id: "v2", client: "Rafael Torres", start: "10:00", duration: 1, priority: "medium" },
    { id: "v3", client: "Alma Herrera", start: "13:00", duration: 1, priority: "high" },
  ],
  n_marcus: [
    { id: "v4", client: "Diego Ruiz", start: "09:00", duration: 1, priority: "medium" },
    { id: "v5", client: "Meera Patel", start: "14:00", duration: 1, priority: "low" },
  ],
  n_devi: [
    { id: "v6", client: "Grace Lee", start: "08:00", duration: 2, priority: "high" },
  ],
};

const PRIORITY_STYLE = {
  high: "bg-[#D95D39]/15 border-[#D95D39]/50 text-[#8a3a24]",
  medium: "bg-[#7FA08B]/15 border-[#7FA08B]/50 text-[#4a6f5c]",
  low: "bg-stone-100 border-stone-300 text-stone-600",
};

export default function Dispatch() {
  const { nurses } = useRouteMe();
  const [visits] = useState(VISITS_SEED);
  const [selectedDate] = useState(new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }));

  const activeNurses = nurses.filter(n => n.status === "active").slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Dispatch board</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight"><span className="font-serif-i text-[#D95D39]">Today&apos;s</span> board.</h1>
          <p className="mt-2 text-stone-600 flex items-center gap-2"><Calendar className="h-4 w-4" /> {selectedDate} · drag visits between nurses to reassign</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-500 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live · {activeNurses.length} nurses active
        </div>
      </div>

      {/* Board */}
      <div className="rounded-3xl border border-stone-200 bg-white overflow-x-auto" data-testid="dispatch-board">
        <div className="min-w-[900px]">
          {/* Header row */}
          <div className="grid grid-cols-[140px_1fr] border-b border-stone-200 bg-stone-50">
            <div className="p-3 text-[10px] uppercase tracking-widest text-stone-500 font-semibold border-r border-stone-200">Nurse</div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${HOURS.length}, 1fr)` }}>
              {HOURS.map((h) => <div key={h} className="p-3 text-[10px] uppercase tracking-widest text-stone-400 font-mono text-center border-r border-stone-100 last:border-r-0">{h}</div>)}
            </div>
          </div>
          {/* Rows */}
          {activeNurses.map((n) => (
            <div key={n.id} className="grid grid-cols-[140px_1fr] border-b border-stone-100 last:border-b-0 min-h-[80px]" data-testid={`dispatch-row-${n.id}`}>
              <div className="p-3 border-r border-stone-200 flex items-center gap-2 bg-stone-50/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D95D39] to-[#8a3a24] text-white text-[10px] font-semibold flex items-center justify-center">
                  {n.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{n.name.split(",")[0]}</p>
                  <p className="text-[10px] text-stone-500 truncate">{n.zone}</p>
                </div>
              </div>
              <div className="relative grid" style={{ gridTemplateColumns: `repeat(${HOURS.length}, 1fr)` }}>
                {HOURS.map((_, i) => <div key={i} className="border-r border-stone-100 last:border-r-0" />)}
                {(visits[n.id] ?? []).map((v) => {
                  const startIdx = HOURS.indexOf(v.start);
                  if (startIdx < 0) return null;
                  return (
                    <div
                      key={v.id}
                      data-testid={`visit-${v.id}`}
                      draggable
                      className={`absolute top-2 bottom-2 rounded-lg border-2 px-3 py-2 cursor-grab active:cursor-grabbing text-xs font-semibold ${PRIORITY_STYLE[v.priority]}`}
                      style={{ left: `${(startIdx / HOURS.length) * 100}%`, width: `${(v.duration / HOURS.length) * 100}%` }}
                    >
                      <p className="truncate">{v.client}</p>
                      <p className="text-[10px] font-normal opacity-70 mt-0.5">{v.start} · {v.duration}h · {v.priority}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#D95D39]" /> High priority</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#7FA08B]" /> Medium</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-stone-400" /> Low</span>
        <span className="ml-auto flex items-center gap-1.5"><ArrowLeftRight className="h-3.5 w-3.5" /> Drag between rows to reassign</span>
      </div>
    </div>
  );
}
