import React, { useState, useMemo, useEffect } from "react";
import { X, Check, Plus, Search, Users, ArrowRight, Clock, MapPin, Loader } from "lucide-react";
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

export default function RouteBuilderModal({ open, onClose, clients, scheduleIds, onScheduleIds, onReschedule, rescheduledClients }) {
  const [selected, setSelected] = useState(new Set());
  const [tab, setTab] = useState("add"); // "add" | "rescheduled"
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulate data loading when modal opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      setSelected(new Set());
      setSearch("");
      setTab("add");
      const t = setTimeout(() => setLoading(false), 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Clients not currently on the route
  const available = useMemo(() => {
    const onRoute = new Set(scheduleIds || []);
    return clients.filter(c => !onRoute.has(c.id));
  }, [clients, scheduleIds]);

  // Rescheduled clients (with their data)
  const rescheduledList = useMemo(() => {
    const ids = Object.keys(rescheduledClients || {});
    return ids.map(id => {
      const client = clients.find(c => c.id === id);
      const info = rescheduledClients[id];
      return { ...client, rescheduledDay: info?.day, weekStart: info?.weekStart };
    }).filter(c => c && c.fullName);
  }, [rescheduledClients, clients]);

  const filtered = useMemo(() => {
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter(c =>
      c.fullName?.toLowerCase().includes(q) ||
      c.condition?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  }, [available, search]);

  const toggleClient = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(c => c.id)));
    }
  };

  const addToRoute = () => {
    if (selected.size === 0) return;
    const newIds = [...(scheduleIds || []), ...selected];
    onScheduleIds(newIds);
    setSelected(new Set());
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-display text-2xl">Create route</h2>
            <p className="text-xs text-stone-500 mt-1">
              Select clients to add to today&apos;s route
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
          >
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-stone-100 px-6 pt-3 gap-1">
          <button
            onClick={() => setTab("add")}
            className={`pb-3 px-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-colors ${
              tab === "add"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Plus className="h-3 w-3 inline mr-1.5" />
            Add clients
            {!loading && available.length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
                {available.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("rescheduled")}
            className={`pb-3 px-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-colors ${
              tab === "rescheduled"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Clock className="h-3 w-3 inline mr-1.5" />
            Rescheduled
            {!loading && rescheduledList.length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {rescheduledList.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-3 py-2">
              {/* Skeleton: search bar */}
              <Skeleton className="h-10 w-full rounded-xl" />
              {/* Skeleton: select-all toggle */}
              <Skeleton className="h-9 w-full rounded-xl" />
              {/* Skeleton: client items */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-5 w-5 rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <>{(tab === "add") ? (
              <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search clients by name, condition, or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
                />
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="h-10 w-10 text-stone-300 mx-auto" />
                  <p className="mt-3 text-sm text-stone-500 font-semibold">
                    {search ? "No clients match your search" : "All clients are on the route"}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    {search ? "Try a different search term" : "The route is full — remove some to add more"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Select all toggle */}
                  {filtered.length > 1 && (
                    <button
                      onClick={toggleAll}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-stone-50 text-xs font-semibold text-stone-600 mb-1"
                    >
                      <span className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                        selected.size === filtered.length
                          ? "bg-stone-900 border-stone-900 text-white"
                          : "border-stone-300"
                      }`}>
                        {selected.size === filtered.length && <Check className="h-3 w-3" />}
                      </span>
                      {selected.size === filtered.length ? "Deselect all" : `Select all ${filtered.length}`}
                    </button>
                  )}

                  {/* Client list */}
                  <div className="space-y-1">
                    {filtered.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleClient(c.id)}
                        className={`w-full text-left flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                          selected.has(c.id)
                            ? "bg-[#F7E5DD] border-[#D95D39]/40 ring-1 ring-[#D95D39]/20"
                            : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                        }`}
                      >
                        <span className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          selected.has(c.id)
                            ? "bg-[#D95D39] border-[#D95D39] text-white"
                            : "border-stone-300"
                        }`}>
                          {selected.has(c.id) && <Check className="h-3 w-3" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">{c.fullName}</p>
                            <span className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-full font-semibold ${
                              c.priority === "high"
                                ? "bg-[#F7E5DD] text-[#D95D39]"
                                : c.priority === "low"
                                  ? "bg-stone-100 text-stone-500"
                                  : "bg-[#E3ECE5] text-emerald-800"
                            }`}>
                              {c.priority}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 truncate">{c.condition}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {c.address}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-stone-400">{c.duration}m</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              </>
            ) : (
              /* Rescheduled tab */
              <>
                {rescheduledList.length === 0 ? (
                  <div className="text-center py-10">
                    <Clock className="h-10 w-10 text-stone-300 mx-auto" />
                    <p className="mt-3 text-sm text-stone-500 font-semibold">No rescheduled clients</p>
                    <p className="text-xs text-stone-400 mt-1">
                      When you move a client to another day, they&apos;ll appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rescheduledList.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{c.fullName}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{c.condition}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          → {c.rescheduledDay}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            onReschedule(c.id, null); // clear reschedule
                            // Add back to route
                            const newIds = [...(scheduleIds || []), c.id];
                            onScheduleIds(newIds);
                          }}
                          className="text-xs font-semibold text-[#D95D39] hover:underline underline-offset-2"
                        >
                          Add back to today
                        </button>
                        {c.weekStart && (
                          <span className="text-[10px] text-stone-400">
                            Week of {c.weekStart}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-[#F9F8F6] flex items-center justify-between">
          {loading ? (
            <div className="flex items-center justify-between w-full">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          ) : (
            <>
              <span className="text-xs text-stone-500">
                {tab === "add"
                  ? `${scheduleIds.length || 0} on route · ${selected.size} selected`
                  : `${rescheduledList.length} rescheduled`}
              </span>
              {tab === "add" && (
                <button
                  onClick={addToRoute}
                  disabled={selected.size === 0}
                  className={`inline-flex items-center gap-2 rounded-full h-10 px-5 text-sm font-semibold transition-colors ${
                    selected.size > 0
                      ? "bg-stone-900 hover:bg-stone-800 text-white"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  Add {selected.size > 0 ? `${selected.size} client${selected.size > 1 ? "s" : ""}` : ""}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}