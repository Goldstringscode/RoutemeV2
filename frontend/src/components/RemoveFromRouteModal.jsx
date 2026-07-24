import React from "react";
import { X, AlertTriangle } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function RemoveFromRouteModal({ open, onClose, client }) {
  const { removeFromRoute } = useRouteMe();

  if (!open || !client) return null;

  const handleRemove = () => {
    removeFromRoute(client.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg">Remove from route?</h3>
            <p className="text-sm text-stone-600 mt-1">
              Remove <strong>{client.fullName}</strong> from today's route. This won't delete the client — just removes them from the schedule.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleRemove}
            className="flex-1 rounded-xl bg-red-500 text-white py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}