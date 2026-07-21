import React, { useState, useEffect } from "react";
import { X, Calendar, Trash2, ArrowRight, ArrowLeft, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS = [
  { index: 0, label: "Monday", short: "Mon" },
  { index: 1, label: "Tuesday", short: "Tue" },
  { index: 2, label: "Wednesday", short: "Wed" },
  { index: 3, label: "Thursday", short: "Thu" },
  { index: 4, label: "Friday", short: "Fri" },
  { index: 5, label: "Saturday", short: "Sat" },
  { index: 6, label: "Sunday", short: "Sun" },
];

export default function RemoveFromRouteModal({ open, onClose, client, onRemoveFromRoute, onReschedule }) {
  const [step, setStep] = useState("choose"); // "choose" | "dayPicker"
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulate loading when modal opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      setStep("choose");
      setSelectedDay(null);
      const t = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open || !client) return null;

  const handleRemove = () => {
    onRemoveFromRoute(client.id);
    onClose();
    setStep("choose");
    setSelectedDay(null);
  };

  const handleReschedule = () => {
    if (selectedDay) {
      onReschedule(client.id, selectedDay.label);
      onClose();
      setStep("choose");
      setSelectedDay(null);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep("choose");
      setSelectedDay(null);
    }, 200);
  };

  // Get today's day index to filter out today
  const todayIndex = new Date().getDay();
  const todayLabel = DAYS[todayIndex === 0 ? 6 : todayIndex - 1]?.label;

  // Get the next 7 days starting from today
  const weekDays = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayIndex = d.getDay(); // 0=Sun, 1=Mon, ...
    const dayLabel = DAYS[dayIndex === 0 ? 6 : dayIndex - 1]?.label;
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    weekDays.push({ label: dayLabel, date: dateStr, isToday: i === 0, dayIndex });
  }

  // Filter out today (can't reschedule to today)
  const futureDays = weekDays.filter((d, i) => i > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-display text-2xl">
              {step === "choose" ? "Remove from route?" : "Visit another day"}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {step === "choose"
                ? `What would you like to do with ${client.fullName}?`
                : `Which day should ${client.fullName.split(" ")[0]} be visited?`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
          >
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="space-y-5">
              {/* Skeleton: client info card */}
              <div className="rounded-2xl bg-[#F9F8F6] border border-stone-200 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
              {/* Skeleton: action buttons */}
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : (
            <>
              {/* Client info card */}
          <div className="rounded-2xl bg-[#F9F8F6] border border-stone-200 p-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-stone-200 flex items-center justify-center text-sm font-semibold text-stone-600">
                {(client.fullName || "").split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("")}
              </div>
              <div>
                <p className="font-semibold text-stone-900">{client.fullName}</p>
                <p className="text-xs text-stone-500">{client.condition}</p>
                <p className="text-xs text-stone-400 mt-0.5">{client.window} · {client.duration} min</p>
              </div>
            </div>
          </div>

          {step === "choose" ? (
            <div className="space-y-3">
              {/* Remove from route */}
              <button
                onClick={handleRemove}
                data-testid="remove-from-route-btn"
                className="w-full flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 hover:bg-stone-50 hover:border-stone-300 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center group-hover:bg-[#D95D39] group-hover:text-white transition-colors">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-semibold text-sm text-stone-900">Remove from route</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {client.fullName} won&apos;t be visited today
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-[#D95D39] transition-colors" />
              </button>

              {/* Visit another day */}
              <button
                onClick={() => setStep("dayPicker")}
                data-testid="visit-another-day-btn"
                className="w-full flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 hover:bg-stone-50 hover:border-stone-300 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-[#E3ECE5] text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-semibold text-sm text-stone-900">Visit another day</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Move to a different day this week
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-emerald-700 transition-colors" />
              </button>
            </div>
          ) : (
            /* Day picker */
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-3">
                Pick a day this week
              </p>
              <div className="grid grid-cols-3 gap-2">
                {futureDays.map((d) => {
                  const isSelected = selectedDay?.label === d.label;
                  return (
                    <button
                      key={d.label}
                      onClick={() => setSelectedDay(d)}
                      disabled={d.isToday}
                      className={`rounded-2xl border p-3 text-center transition-all ${
                        isSelected
                          ? "bg-stone-900 text-white border-stone-900 ring-4 ring-stone-100"
                          : "bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-900"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-widest font-semibold block">
                        {d.label.slice(0, 3)}
                      </span>
                      <span className="text-xs mt-1 block font-semibold">{d.date}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => { setStep("choose"); setSelectedDay(null); }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 h-10 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={!selectedDay}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full h-10 text-sm font-semibold transition-colors ${
                    selectedDay
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  Move to {selectedDay?.label || "..."}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          </>)}
        </div>
      </div>
    </div>
  );
}