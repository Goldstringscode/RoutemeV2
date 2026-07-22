import React from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Download, Calendar } from "lucide-react";

const KPI_ROWS = [
  { label: "Visits · this month", value: "1,247", delta: "+8%", tone: "sage" },
  { label: "Active nurses", value: "12", delta: "+2", tone: "sage" },
  { label: "Avg visits/nurse/day", value: "5.4", delta: "+0.6", tone: "sage" },
  { label: "Route efficiency", value: "94%", delta: "+3pt", tone: "sage" },
];

const CHART_DATA = [180, 220, 195, 240, 260, 245, 280, 300, 310, 295, 320, 340];

export default function Reports() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Reports & analytics</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">Your <span className="font-serif-i text-[#D95D39]">numbers</span>.</h1>
          <p className="mt-2 text-stone-600 flex items-center gap-2"><Calendar className="h-4 w-4" /> Jan 15 – Feb 14, 2026 · 31 days</p>
        </div>
        <div className="flex gap-2">
          <button data-testid="reports-export" className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-100 px-4 py-2.5 text-sm font-semibold">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_ROWS.map((k) => (
          <div key={k.label} className="rounded-2xl border border-stone-200 bg-white p-5" data-testid={`kpi-${k.label.replace(/\s/g, "-")}`}>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{k.label}</p>
            <p className="font-display text-3xl mt-1 leading-none">{k.value}</p>
            <p className={`text-xs mt-2 font-semibold ${k.tone === "sage" ? "text-emerald-600" : "text-amber-600"}`}>{k.delta} vs. last period</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-4 w-4 text-[#D95D39]" />
          <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Visit volume · daily</p>
        </div>
        <div className="flex items-end gap-2 h-56">
          {CHART_DATA.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-gradient-to-t from-[#D95D39] to-[#F7E5DD] hover:opacity-80 transition-opacity" style={{ height: `${(v / 350) * 100}%` }} title={`Day ${i + 1}: ${v} visits`} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[10px] text-stone-400 font-mono">
          <span>Day 1</span><span>Day 12</span>
        </div>
      </div>

      {/* Nurse leaderboard + report shortcuts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4"><Users className="h-4 w-4 text-[#D95D39]" /><p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Top performers</p></div>
          <ul className="divide-y divide-stone-100">
            {[
              { name: "Amara Okafor", visits: 142, tone: "🥇" },
              { name: "Brianna Ortiz", visits: 128, tone: "🥈" },
              { name: "Devi Rao", visits: 121, tone: "🥉" },
              { name: "Marcus Bell", visits: 105, tone: "" },
              { name: "Theo Kim", visits: 98, tone: "" },
            ].map((n, i) => (
              <li key={n.name} className="py-3 flex items-center gap-3">
                <span className="w-6 text-center text-lg">{n.tone || <span className="text-stone-400 text-xs">#{i + 1}</span>}</span>
                <p className="flex-1 text-sm font-medium">{n.name}</p>
                <span className="tabular-nums font-display text-lg text-stone-900">{n.visits}</span>
                <span className="text-xs text-stone-500">visits</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-[#D95D39]" /><p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Ready-to-run reports</p></div>
          <ul className="divide-y divide-stone-100">
            {[
              { name: "HIPAA audit export", desc: "30-day audit trail · CSV" },
              { name: "Nurse mileage & hours", desc: "For payroll · CSV" },
              { name: "Client visit frequency", desc: "By zone, care type" },
              { name: "License expiries · 90d", desc: "Compliance snapshot" },
              { name: "Financial · revenue by client", desc: "Billing period" },
            ].map((r) => (
              <li key={r.name} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{r.name}</p><p className="text-xs text-stone-500">{r.desc}</p></div>
                <button data-testid={`report-${r.name.replace(/\s/g, "-")}`} className="text-sm font-semibold text-[#D95D39] hover:underline">Run →</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
