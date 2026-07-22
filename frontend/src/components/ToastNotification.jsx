import React, { useEffect } from "react";
import { Bell, Route, ShieldAlert, MessageCircle, X } from "lucide-react";

const TYPE_ICONS = {
  route: Route,
  compliance: ShieldAlert,
  message: MessageCircle,
};
const TYPE_COLORS = {
  route: "#D95D39",
  compliance: "#F59E0B",
  message: "#7FA08B",
};

export default function ToastNotification({ notification, onDismiss }) {
  const Icon = TYPE_ICONS[notification?.type] || Bell;
  const color = TYPE_COLORS[notification?.type] || "#D95D39";

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => onDismiss?.(notification.id), 4000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white shadow-xl p-4 max-w-sm rm-lift">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, color }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-stone-900 truncate">{notification.title}</p>
          <p className="text-xs text-stone-600 mt-0.5">{notification.body}</p>
        </div>
        <button
          onClick={() => onDismiss?.(notification.id)}
          className="h-6 w-6 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}