import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Clock, MapPin, Route, X, ArrowUpRight, Trash2, Loader, CheckCircle } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function Routes() {
  const { savedRoutes, loadRoute, deleteSavedRoute, schedule } = useRouteMe();
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [justDeleted, setJustDeleted] = useState(null);

  const handleLoad = (r) => {
    setLoadingId(r.id);
    setTimeout(() => {
      loadRoute(r.id);
      setLoadingId(null);
      navigate("/app/route");
    }, 300);
  };

  const handleDelete = async (r) => {
    setJustDeleted(r.id);
    await deleteSavedRoute(r.id);
    setTimeout(() => setJustDeleted(null), 1500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
          Saved routes
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          Your <span className="font-serif-i text-[#D95D39]">saved routes</span>.
        </h1>
        <p className="mt-2 text-stone-500 text-sm">
          {savedRoutes.length} saved route{savedRoutes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {savedRoutes.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#F7E5DD] flex items-center justify-center mx-auto">
            <Bookmark className="h-6 w-6 text-[#D95D39]" />
          </div>
          <h3 className="font-display text-2xl mt-4">No saved routes yet</h3>
          <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">
            Optimize a route and save it to revisit later. Saved routes are stored securely in your workspace.
          </p>
          <button
            onClick={() => navigate("/app/route")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-3 text-sm font-semibold transition-colors"
          >
            <Route className="h-4 w-4" /> Go to route planner
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedRoutes.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-stone-200 bg-white p-5 rm-lift transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] flex items-center justify-center shrink-0">
                      <Bookmark className="h-5 w-5 text-[#D95D39]" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl truncate">{r.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {r.stops?.length || 0} stops
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Saved {formatDate(r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedRoute(r)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    View details
                  </button>
                  <button
                    onClick={() => handleLoad(r)}
                    disabled={loadingId === r.id}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                      loadingId === r.id
                        ? "bg-stone-400 text-white cursor-wait"
                        : "bg-stone-900 hover:bg-stone-800 text-white"
                    }`}
                  >
                    {loadingId === r.id ? (
                      <><Loader className="h-3 w-3 animate-spin" /> Loading</>
                    ) : (
                      <><ArrowUpRight className="h-3 w-3" /> Load route</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    data-testid={`delete-route-${r.id}`}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      justDeleted === r.id
                        ? "bg-[#E3ECE5] text-emerald-600"
                        : "text-stone-400 hover:text-[#D95D39] hover:bg-[#F7E5DD]"
                    }`}
                  >
                    {justDeleted === r.id ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedRoute(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-display text-2xl">{selectedRoute.name}</h2>
                <p className="text-xs text-stone-500 mt-1">
                  {selectedRoute.stops?.length || 0} stops · Saved {formatDate(selectedRoute.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedRoute(null)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            <div className="px-6 py-4 max-h-[55vh] overflow-y-auto">
              {(!selectedRoute.stops || selectedRoute.stops.length === 0) ? (
                <div className="rounded-xl bg-stone-50 border border-stone-200 p-6 text-center">
                  <p className="text-sm text-stone-500">No stops in this route.</p>
                </div>
              ) : (
                <ol className="relative">
                  <span className="absolute left-[19px] top-3 bottom-3 w-px bg-stone-200" />
                  {selectedRoute.stops.map((stopId, idx) => {
                    // Try to find a matching client from the current schedule
                    const stop = schedule.find(s => s.id === stopId);
                    return (
                      <li key={stopId} className="relative flex items-start gap-3 pb-4 last:pb-0">
                        <span className="relative z-10 h-9 w-9 shrink-0 rounded-full flex items-center justify-center font-semibold text-xs bg-white border border-stone-300 text-stone-800">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 pt-1.5">
                          <p className="font-semibold text-sm text-stone-800">
                            {stop?.fullName || `Stop ${idx + 1}`}
                          </p>
                          {stop && (
                            <>
                              <p className="text-xs text-stone-500 mt-0.5">{stop.address}</p>
                              <p className="text-xs text-stone-400 mt-0.5">{stop.condition}</p>
                            </>
                          )}
                          {!stop && (
                            <p className="text-xs text-stone-400 mt-0.5 italic">Client data unavailable</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <div className="px-6 py-4 border-t border-stone-100 bg-[#F9F8F6] flex items-center gap-3">
              <button
                onClick={() => { handleLoad(selectedRoute); setSelectedRoute(null); }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full h-11 text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors"
              >
                <ArrowUpRight className="h-4 w-4" /> Load this route
              </button>
              <button
                onClick={() => setSelectedRoute(null)}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 h-11 px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
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