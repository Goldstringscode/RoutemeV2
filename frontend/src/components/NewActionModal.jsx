import React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, FileText, Route, X } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function NewActionModal({ open, onClose }) {
  const navigate = useNavigate();
  const { openVoice, setBuilderOpen } = useRouteMe();

  if (!open) return null;

  const actions = [
    {
      id: "client",
      label: "New Client",
      desc: "Add a new client to your roster",
      icon: UserPlus,
      color: "bg-[#D95D39]",
      hoverColor: "hover:bg-[#C05030]",
      onClick: () => {
        onClose();
        // Small delay so the modal animates out, then open RouteBuilderModal's add-client flow
        setTimeout(() => {
          setBuilderOpen(true);
        }, 200);
      },
    },
    {
      id: "note",
      label: "New Note",
      desc: "Record a HIPAA-safe visit note",
      icon: FileText,
      color: "bg-stone-900",
      hoverColor: "hover:bg-stone-800",
      onClick: () => {
        onClose();
        setTimeout(() => {
          openVoice();
        }, 200);
      },
    },
    {
      id: "route",
      label: "New Route",
      desc: "Plan and optimize a new route",
      icon: Route,
      color: "bg-[#7FA08B]",
      hoverColor: "hover:bg-[#6E8F7A]",
      onClick: () => {
        onClose();
        navigate("/app/route");
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-display text-2xl">New</h2>
            <p className="text-xs text-stone-500 mt-1">Choose what to create</p>
          </div>
          <button
            onClick={onClose}
            data-testid="new-action-close"
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
          >
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Action cards */}
        <div className="px-6 py-5 space-y-3">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={a.onClick}
                data-testid={`new-action-${a.id}`}
                className="w-full text-left flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:bg-stone-50 transition-all group"
              >
                <div className={`h-12 w-12 rounded-xl ${a.color} ${a.hoverColor} flex items-center justify-center shrink-0 transition-colors`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="font-semibold text-sm text-stone-800 group-hover:text-stone-900">
                    {a.label}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">{a.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-[#F9F8F6]">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center rounded-full h-10 text-sm font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}