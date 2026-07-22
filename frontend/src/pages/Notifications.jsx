import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Clock, MessageCircle, ShieldAlert, ArrowRight, Route, ArrowLeft } from "lucide-react";

const NOTIFS_SEED = [
  { id: "n1", type: "route", title: "Route optimized for tomorrow", body: "6 stops · saves you 22 minutes", t: "5 min ago", read: false, icon: Route, color: "#D95D39" },
  { id: "n2", type: "compliance", title: "License renewal reminder", body: "Your RN #2418906 expires in 47 days", t: "2 hours ago", read: false, icon: ShieldAlert, color: "#F59E0B" },
  { id: "n3", type: "message", title: "Priya Nair (Sunrise HH)", body: "Please add care flag for Eleanor Mabry (gate code changed)", t: "3 hours ago", read: false, icon: MessageCircle, color: "#7FA08B" },
  { id: "n4", type: "route", title: "Traffic advisory · East Austin", body: "I-35 closure — 2 stops reordered", t: "yesterday", read: true, icon: Route, color: "#D95D39" },
  { id: "n5", type: "system", title: "Signed in on new device", body: "iPhone 15 · Austin, TX · 07:14 AM", t: "yesterday", read: true, icon: ShieldAlert, color: "#7FA08B" },
];

export default function Notifications() {
  const [notifs, setNotifs] = useState(NOTIFS_SEED);
  const [filter, setFilter] = useState("all");

  const unread = notifs.filter((n) => !n.read).length;
  const filtered = notifs.filter((n) => filter === "all" || (filter === "unread" ? !n.read : n.type === filter));

  const markRead = (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));

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
        <button data-testid="notif-mark-all-read" onClick={markAllRead} disabled={unread === 0} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${
          unread > 0 ? "border border-stone-300 hover:bg-stone-100 text-stone-900" : "border border-stone-200 text-stone-400 cursor-not-allowed"
        }`}>
          <Check className="h-4 w-4" /> Mark all read
        </button>
      </div>

      {/* Filter */}
      <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
        {[
          ["all", "All", notifs.length],
          ["unread", "Unread", unread],
          ["route", "Routes", notifs.filter(n => n.type === "route").length],
          ["compliance", "Compliance", notifs.filter(n => n.type === "compliance").length],
          ["message", "Messages", notifs.filter(n => n.type === "message").length],
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
        {filtered.map((n) => (
          <li key={n.id} data-testid={`notif-${n.id}`} className={`p-5 flex gap-4 hover:bg-stone-50 transition-colors ${!n.read ? "bg-[#FDFAF4]" : ""}`}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${n.color}15`, color: n.color }}>
              <n.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-stone-900 truncate">{n.title}</p>
                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#D95D39]" />}
              </div>
              <p className="text-sm text-stone-600 mt-0.5">{n.body}</p>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {n.t}</p>
            </div>
            {!n.read && (
              <button onClick={() => markRead(n.id)} data-testid={`notif-read-${n.id}`} className="text-xs font-semibold text-stone-500 hover:text-stone-900 shrink-0">
                Mark read
              </button>
            )}
          </li>
        ))}
        {filtered.length === 0 && <li className="p-10 text-center text-stone-400">No notifications match.</li>}
      </ul>

      <p className="text-xs text-stone-500 text-center">
        <Link to="/app/settings" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">Adjust notification preferences →</Link>
      </p>
    </div>
  );
}
