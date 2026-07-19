import React, { useState } from "react";
import { GripVertical, Sparkles, Clock, MapPin, Users, Save, FolderOpen, Trash2, X, Check, Bookmark } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function Schedule() {
  const { schedule, reorder, optimize, optimized, savedRoutes, saveRoute, loadRoute, deleteSavedRoute } = useRouteMe();
  const [dragId, setDragId] = useState(null);

  // Save route modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routeName, setRouteName] = useState("");

  // Load route modal
  const [showLoadModal, setShowLoadModal] = useState(false);

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

  const handleSaveRoute = () => {
    const name = routeName.trim() || `Route — ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    saveRoute(name);
    setShowSaveModal(false);
    setRouteName("");
  };

  const handleLoadRoute = (routeId) => {
    loadRoute(routeId);
    setShowLoadModal(false);
  };

  const openSaveModal = () => {
    // Auto-generate a name based on today's date
    setRouteName(`Route — ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}`);
    setShowSaveModal(true);
  };

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

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Load Route button */}
          {savedRoutes.length > 0 && (
            <button
              onClick={() => setShowLoadModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-700 px-4 py-3 text-sm font-semibold transition-colors"
            >
              <FolderOpen className="h-4 w-4" />
              Load route
            </button>
          )}

          {/* Save Route button */}
          {schedule.length > 0 && (
            <button
              onClick={openSaveModal}
              className="inline-flex items-center gap-2 rounded-full border border-[#D95D39]/30 hover:border-[#D95D39] text-[#D95D39] hover:bg-[#F7E5DD] px-4 py-3 text-sm font-semibold transition-colors"
            >
              <Save className="h-4 w-4" />
              Save route
            </button>
          )}

          {/* Optimize button */}
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

      {/* ============ Save Route Modal ============ */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl w-full max-w-md mx-4 p-6 rm-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl">Save this route</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            <p className="text-sm text-stone-600 mb-4">
              Name this route so you can load it on any day. Leave blank for an auto-name.
            </p>

            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g. Monday North County"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D95D39]/30 focus:border-[#D95D39] transition-colors"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRoute(); }}
            />

            <p className="mt-3 text-xs text-stone-500 flex items-center gap-1">
              <Bookmark className="h-3 w-3" />
              {schedule.length} stop{schedule.length !== 1 ? 's' : ''} will be saved
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoute}
                className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold transition-colors"
              >
                <Check className="h-4 w-4" />
                Save route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Load Route Modal ============ */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl w-full max-w-lg mx-4 p-6 rm-fade-up max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="font-display text-xl">Load a saved route</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            <p className="text-sm text-stone-600 mb-4 shrink-0">
              Select a saved route to replace today's schedule. The current schedule will be cleared.
            </p>

            <div className="overflow-y-auto flex-1 -mx-2 px-2 space-y-2">
              {savedRoutes.length === 0 ? (
                <div className="text-center py-10">
                  <Bookmark className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">No saved routes yet.</p>
                  <p className="text-xs text-stone-400 mt-1">Save a route from the schedule page first.</p>
                </div>
              ) : (
                savedRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 hover:border-[#D95D39]/40 hover:bg-[#F9F8F6] transition-colors cursor-pointer"
                    onClick={() => handleLoadRoute(route.id)}
                  >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-[#E3ECE5] flex items-center justify-center">
                      <Bookmark className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{route.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {route.stop_count} stop{route.stop_count !== 1 ? 's' : ''} · saved {new Date(route.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${route.name}"?`)) {
                          deleteSavedRoute(route.id);
                        }
                      }}
                      className="h-8 w-8 shrink-0 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 flex items-center justify-center transition-all"
                      title="Delete saved route"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200 shrink-0 flex justify-end">
              <button
                onClick={() => setShowLoadModal(false)}
                className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}