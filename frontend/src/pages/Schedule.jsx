import React, { useState } from "react";
import { GripVertical, Sparkles, Clock, MapPin, Users } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function Schedule() {
  const { schedule, reorder, optimize, optimized } = useRouteMe();
  const [dragId, setDragId] = useState(null);

  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e, overId) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const ids = schedule.map((c) => c.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(overId);
    if (from < 0 || to < 0) return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    reorder(next);
  };
  const onDragEnd = () => setDragId(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Schedule builder
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Drag the day into <span className="font-serif-i text-[#7FA08B]">shape</span>.
          </h1>
          <p className="mt-2 text-stone-600">
            Reorder visits by grabbing a card. RouteMe will re-optimize on demand.
          </p>
        </div>
        <button
          onClick={optimize}
          data-testid="schedule-optimize-btn"
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
            optimized
              ? "bg-white border border-stone-200 text-stone-700"
              : "bg-[#D95D39] hover:bg-[#C05030] text-white"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {optimized ? "Optimized" : "Optimize"}
        </button>
      </div>

      {schedule.length > 0 ? (
        <ul className="space-y-3">
        {schedule.map((c, idx) => (
          <li
            key={c.id}
            draggable
            onDragStart={() => onDragStart(c.id)}
            onDragOver={(e) => onDragOver(e, c.id)}
            onDragEnd={onDragEnd}
            data-testid={`schedule-item-${idx + 1}`}
            className={`group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-4 rm-lift cursor-grab active:cursor-grabbing ${
              dragId === c.id ? "opacity-50" : ""
            }`}
          >
            <GripVertical className="h-5 w-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
            <span className="h-10 w-10 shrink-0 rounded-full bg-[#F7E5DD] text-[#D95D39] font-semibold flex items-center justify-center">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-semibold truncate">{c.fullName}</p>
                <span className="text-xs text-stone-500">· {c.condition}</span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.window}</span>
                <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {c.address}</span>
              </div>
            </div>
            <span
              className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full border ${
                c.priority === "high"
                  ? "bg-[#F7E5DD] text-[#D95D39] border-[#F0D2C4]"
                  : c.priority === "medium"
                    ? "bg-[#E3ECE5] text-emerald-900 border-emerald-100"
                    : "bg-stone-100 text-stone-600 border-stone-200"
              }`}
            >
              {c.priority}
            </span>
          </li>
        ))}
      </ul>
      ) : (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 flex flex-col items-center justify-center text-center min-h-[250px]">
          <div className="h-14 w-14 rounded-2xl bg-[#F9F8F6] border border-stone-200 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-stone-400" />
          </div>
          <h3 className="font-display text-xl">No scheduled visits</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-sm">
            Add clients to your roster first, then their visit windows and priorities will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
