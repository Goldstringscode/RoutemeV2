import React, { useState, useMemo } from "react";
import { GripVertical, Sparkles, Clock, MapPin, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sun, Moon, ChevronDown, X } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { formatTimeWindow } from "@/lib/utils";

/* ─── Helpers ─────────────────────────────────────────── */

function parseWindowHour(windowStr) {
  if (!windowStr) return null;
  const match = windowStr.match(/(\d{1,2}):\d{2}/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

function isMorning(windowStr) {
  const h = parseWindowHour(windowStr);
  return h !== null && h < 12;
}

function isAfternoon(windowStr) {
  const h = parseWindowHour(windowStr);
  return h !== null && h >= 12;
}

function isWeekend(windowStr) {
  if (!windowStr) return false;
  const lower = windowStr.toLowerCase();
  return lower.includes("sat") || lower.includes("sun") || lower.includes("weekend");
}

/* ─── Calendar component ──────────────────────────────── */

function CalendarPicker({ selected, onSelect, onClose }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (d) =>
    selected && d === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();

  const isToday = (d) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const handleDayClick = (d) => {
    const picked = new Date(viewYear, viewMonth, d);
    onSelect(picked);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-lg p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors">
          <ChevronLeft className="h-4 w-4 text-stone-600" />
        </button>
        <span className="font-display text-base font-semibold">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors">
          <ChevronRight className="h-4 w-4 text-stone-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] uppercase tracking-widest text-stone-400 font-semibold py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const sel = isSelected(d);
          const tod = isToday(d);
          return (
            <button
              key={d}
              onClick={() => handleDayClick(d)}
              className={`h-9 w-9 rounded-full text-sm font-medium transition-colors flex items-center justify-center mx-auto ${
                sel
                  ? "bg-[#D95D39] text-white"
                  : tod
                    ? "bg-[#F7E5DD] text-[#D95D39]"
                    : "hover:bg-stone-100 text-stone-700"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Schedule ───────────────────────────────────── */

const FILTERS = [
  { id: "today", label: "Today", icon: Clock },
  { id: "all-week", label: "All Week", icon: CalendarIcon },
  { id: "mon-sun", label: "Mon\u2013Sun", icon: ChevronDown },
  { id: "morning", label: "Morning", icon: Sun },
  { id: "afternoon", label: "Afternoon", icon: Moon },
  { id: "weekends", label: "Weekends", icon: Sparkles },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
];

export default function Schedule() {
  const { schedule, clients, reorder, optimize, optimized } = useRouteMe();
  const [dragId, setDragId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("today");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(null);

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

  /* ─── Filtered list ───────────────────────────────────── */
  const filtered = useMemo(() => {
    const f = activeFilter;
    if (f === "today" || f === "calendar") {
      return schedule;
    }
    if (f === "all-week" || f === "mon-sun") {
      return clients;
    }
    if (f === "morning") {
      return schedule.filter(c => isMorning(c.window));
    }
    if (f === "afternoon") {
      return schedule.filter(c => isAfternoon(c.window));
    }
    if (f === "weekends") {
      return schedule.filter(c => isWeekend(c.window));
    }
    return schedule;
  }, [activeFilter, schedule, clients, calendarDate]);

  /* ─── Stats ────────────────────────────────────────────── */
  const totalMin = filtered.reduce((s, c) => s + (c.duration || 30), 0);
  const morningCount = schedule.filter(c => isMorning(c.window)).length;
  const afternoonCount = schedule.filter(c => isAfternoon(c.window)).length;

  const handleFilterClick = (id) => {
    if (id === "calendar") {
      setCalendarOpen(!calendarOpen);
      return;
    }
    setActiveFilter(id);
    setCalendarOpen(false);
  };

  const handleCalendarSelect = (date) => {
    setCalendarDate(date);
    setActiveFilter("calendar");
    setCalendarOpen(false);
  };

  const formatCalendarDate = (d) => {
    if (!d) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Schedule · {FILTERS.find(f => f.id === activeFilter)?.label || "Today"}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Drag the day into <span className="font-serif-i text-[#7FA08B]">shape</span>.
          </h1>
          <p className="mt-2 text-stone-600">
            {activeFilter === "calendar" && calendarDate
              ? formatCalendarDate(calendarDate)
              : activeFilter === "morning"
                ? `${filtered.length} morning visits`
                : activeFilter === "afternoon"
                  ? `${filtered.length} afternoon visits`
                  : activeFilter === "weekends"
                    ? `${filtered.length} weekend visits`
                    : activeFilter === "all-week" || activeFilter === "mon-sun"
                      ? `${filtered.length} total clients`
                      : `${filtered.length} visits today`}
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

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => handleFilterClick(f.id)}
              data-testid={`schedule-filter-${f.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-stone-900 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Calendar picker */}
      {calendarOpen && (
        <div className="relative max-w-sm">
          <CalendarPicker
            selected={calendarDate}
            onSelect={handleCalendarSelect}
            onClose={() => setCalendarOpen(false)}
          />
        </div>
      )}

      {/* Stats bar */}
      {activeFilter === "today" && (
        <div className="flex items-center gap-6 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Sun className="h-3.5 w-3.5 text-amber-500" /> {morningCount} morning
          </span>
          <span className="flex items-center gap-1">
            <Moon className="h-3.5 w-3.5 text-indigo-400" /> {afternoonCount} afternoon
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {Math.floor(totalMin / 60)}h {totalMin % 60}m care time
          </span>
        </div>
      )}

      {/* Schedule list */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
          <p className="font-display text-xl text-stone-400">No visits match this filter.</p>
          <p className="text-sm text-stone-400 mt-1">Try a different filter view.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c, idx) => {
            const isScheduled = schedule.some(s => s.id === c.id);
            return (
              <li
                key={c.id}
                draggable={isScheduled}
                onDragStart={() => isScheduled && onDragStart(c.id)}
                onDragOver={(e) => isScheduled && onDragOver(e, c.id)}
                onDragEnd={onDragEnd}
                data-testid={`schedule-item-${idx + 1}`}
                className={`group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-4 rm-lift ${
                  isScheduled ? "cursor-grab active:cursor-grabbing" : "opacity-70"
                }`}
              >
                {isScheduled ? (
                  <GripVertical className="h-5 w-5 text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                ) : (
                  <span className="h-5 w-5 shrink-0" />
                )}
                <span className={`h-10 w-10 shrink-0 rounded-full font-semibold flex items-center justify-center text-sm ${
                  isScheduled
                    ? "bg-[#F7E5DD] text-[#D95D39]"
                    : "bg-stone-100 text-stone-400"
                }`}>
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-semibold truncate">{c.fullName}</p>
                    <span className="text-xs text-stone-500">· {c.condition}</span>
                    {!isScheduled && (
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
                        · unscheduled
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTimeWindow(c.window)}</span>
                    <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {c.address}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full border shrink-0 ${
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
            );
          })}
        </ul>
      )}
    </div>
  );
}