import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Fuel, Car, Play, Pause, StopCircle, Download } from "lucide-react";

const ENTRIES_SEED = [
  { id: "e1", date: "Feb 14", client: "Eleanor Mabry", start: "08:20", stop: "09:15", minutes: 55, miles: 6.2, status: "completed" },
  { id: "e2", date: "Feb 14", client: "Rafael Torres", start: "10:15", stop: "11:05", minutes: 50, miles: 4.8, status: "completed" },
  { id: "e3", date: "Feb 14", client: "Alma Herrera", start: "12:45", stop: "13:40", minutes: 55, miles: 7.1, status: "completed" },
  { id: "e4", date: "Feb 13", client: "Eleanor Mabry", start: "08:20", stop: "09:10", minutes: 50, miles: 6.2, status: "completed" },
  { id: "e5", date: "Feb 13", client: "Rafael Torres", start: "10:12", stop: "11:00", minutes: 48, miles: 4.9, status: "completed" },
];

export default function TimeMileage() {
  const [entries, setEntries] = useState(ENTRIES_SEED);
  const [tracking, setTracking] = useState(false);
  const [currentClient, setCurrentClient] = useState("");

  const totalMinutes = entries.reduce((s, e) => s + e.minutes, 0);
  const totalMiles = entries.reduce((s, e) => s + e.miles, 0);
  const reimbursement = (totalMiles * 0.67).toFixed(2); // IRS 2026 rate

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Time & mileage</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Every mile, <span className="font-serif-i text-[#D95D39]">counted</span>.
          </h1>
          <p className="mt-2 text-stone-600">Automatic GPS tracking · IRS-ready log · one-click export for payroll.</p>
        </div>
        <button data-testid="mileage-export" className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-900 px-4 py-2.5 text-sm font-semibold">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Live tracker */}
      <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-900 to-black text-white p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#D95D39]/30 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center ${tracking ? "bg-emerald-500 animate-pulse" : "bg-white/10"}`}>
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/60 font-semibold">
                {tracking ? "Tracking active" : "Ready to track"}
              </p>
              <h2 className="font-display text-2xl leading-tight mt-1">
                {tracking ? currentClient || "Between stops…" : "Start your next visit"}
              </h2>
              {tracking && (
                <p className="text-xs text-white/60 mt-1">Started 08:20 · 4.2 mi · 34 min elapsed</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!tracking ? (
              <button
                data-testid="mileage-start"
                onClick={() => { setTracking(true); setCurrentClient("Visit → Eleanor Mabry"); }}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold"
              >
                <Play className="h-4 w-4" /> Start visit
              </button>
            ) : (
              <>
                <button data-testid="mileage-pause" className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-semibold">
                  <Pause className="h-4 w-4" /> Pause
                </button>
                <button data-testid="mileage-stop" onClick={() => setTracking(false)} className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold">
                  <StopCircle className="h-4 w-4" /> Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Today · minutes" value={entries.filter(e => e.date === "Feb 14").reduce((s, e) => s + e.minutes, 0)} sub="worked" />
        <Kpi label="Today · miles" value={entries.filter(e => e.date === "Feb 14").reduce((s, e) => s + e.miles, 0).toFixed(1)} sub="driven" />
        <Kpi label="Week · miles" value={totalMiles.toFixed(1)} sub="all visits" />
        <Kpi label="Reimbursement" value={`$${reimbursement}`} sub="@ $0.67/mi (IRS 2026)" tone="terra" />
      </div>

      {/* Log */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">Trip log</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 font-semibold border-b border-stone-100">
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Client</th>
              <th className="py-3 px-6">Start</th>
              <th className="py-3 px-6">Stop</th>
              <th className="py-3 px-6">Minutes</th>
              <th className="py-3 px-6">Miles</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {entries.map((e) => (
              <tr key={e.id} data-testid={`trip-${e.id}`} className="hover:bg-stone-50">
                <td className="py-3 px-6 text-stone-500 text-xs">{e.date}</td>
                <td className="py-3 px-6 font-medium">{e.client}</td>
                <td className="py-3 px-6 font-mono text-xs">{e.start}</td>
                <td className="py-3 px-6 font-mono text-xs">{e.stop}</td>
                <td className="py-3 px-6 tabular-nums">{e.minutes}</td>
                <td className="py-3 px-6 tabular-nums">{e.miles}</td>
                <td className="py-3 px-6">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold">
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, tone }) {
  const cls = tone === "terra" ? "bg-[#F7E5DD] border-[#D95D39]/30" : "bg-white border-stone-200";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</p>
      <p className="font-display text-3xl mt-1 leading-none">{value}</p>
      <p className="text-xs text-stone-500 mt-2">{sub}</p>
    </div>
  );
}
