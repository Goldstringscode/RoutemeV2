import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Clock, MessageCircle, ShieldAlert, Route, ArrowLeft } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const NOTIF_TYPE_META = {
  route: { icon: Route, color: "#D95D39" },
  compliance: { icon: ShieldAlert, color: "#F59E0B" },
  message: { icon: MessageCircle, color: "#7FA08B" },
  visit: { icon: Bell, color: "#7FA08B" },
  write: { icon: Bell, color: "#D95D39" },
  auth: { icon: ShieldAlert, color: "#7FA08B" },
  error: { icon: ShieldAlert, color: "#DC2626" },
  addendum: { icon: Bell, color: "#7FA08B" },
  system: { icon: ShieldAlert, color: "#7FA08B" },
};

export default function Notifications() {
  const { notifications, dismissNotification, markAllNotificationsRead } = useRouteMe();
  const [filter, setFilter] = useState("all");

  const unread = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) =>
    filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter
  );

  const typeCounts = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Notifications</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Your <span className="font-serif-i text-[#D95D39]">inbox</span>.
          </h1>
          <p className="mt-2 text-stone-600">
            {unread > 0 ? <><strong>{unread}</strong> unread</> : "All caught up."}
          </p>
        </div>
        <button
          data-testid="notif-mark-all-read"
          onClick={markAllNotificationsRead}
          disabled={unread === 0}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${
            unread > 0
              ? "border border-stone-300 hover:bg-stone-100 text-stone-900"
              : "border border-stone-200 text-stone-400 cursor-not-allowed"
          }`}
        >
          <Check className="h-4 w-4" /> Mark all read
        </button>
      </div>

      {/* Filter */}
      <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
        {[
          ["all", "All", notifications.length],
          ["unread", "Unread", unread],
          ...Object.entries(typeCounts).map(([type, count]) => [type, type.charAt(0).toUpperCase() + type.slice(1), count]),
        ].map(([id, label, c]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            data-testid={`notif-filter-${id}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === id ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {label} {c > 0 && <span className="opacity-60">· {c}</span>}
          </button>
        ))}
      </div>

      {/* List */}
      <ul className="rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100 overflow-hidden">
        {filtered.map((n) => {
          const meta = NOTIF_TYPE_META[n.type] || { icon: Bell, color: "#7FA08B" };
          const Icon = meta.icon;
          return (
            <li
              key={n.id}
              data-testid={`notif-${n.id}`}
              className={`p-5 flex gap-4 hover:bg-stone-50 transition-colors ${!n.read ? "bg-[#FDFAF4]" : ""}`}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${meta.color}15`, color: meta.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-stone-900 truncate">{n.title || n.label}</p>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#D95D39]" />}
                </div>
                <p className="text-sm text-stone-600 mt-0.5">{n.body || n.label}</p>
                <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {n.t || "just now"}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => dismissNotification(n.id)}
                  data-testid={`notif-read-${n.id}`}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-900 shrink-0"
                >
                  Mark read
                </button>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && <li className="p-10 text-center text-stone-400">No notifications match.</li>}
      </ul>

      <p className="text-xs text-stone-500 text-center">
        <Link to="/app/settings" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">
          Adjust notification preferences →
        </Link>
      </p>
    </div>
  );
}