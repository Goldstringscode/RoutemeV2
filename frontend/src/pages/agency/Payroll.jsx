import React from "react";
import { DollarSign, Download, Users, Clock } from "lucide-react";

const PAYROLL = [
  { id: "p1", nurse: "Amara Okafor", role: "RN", hours: 168.5, mileage: 342, rate: 45, mileageRate: 0.67 },
  { id: "p2", nurse: "Marcus Bell", role: "LPN", hours: 152.0, mileage: 218, rate: 35, mileageRate: 0.67 },
  { id: "p3", nurse: "Devi Rao", role: "RN", hours: 162.0, mileage: 289, rate: 45, mileageRate: 0.67 },
  { id: "p4", nurse: "Theo Kim", role: "NP", hours: 140.0, mileage: 267, rate: 62, mileageRate: 0.67 },
  { id: "p5", nurse: "Brianna Ortiz", role: "RN", hours: 175.5, mileage: 401, rate: 45, mileageRate: 0.67 },
];

export default function Payroll() {
  const rows = PAYROLL.map((p) => ({ ...p, wages: p.hours * p.rate, reimb: p.mileage * p.mileageRate, total: p.hours * p.rate + p.mileage * p.mileageRate }));
  const totalWages = rows.reduce((s, r) => s + r.wages, 0);
  const totalReimb = rows.reduce((s, r) => s + r.reimb, 0);
  const grand = totalWages + totalReimb;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Payroll · Feb 2026</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">The <span className="font-serif-i text-[#D95D39]">envelope</span>.</h1>
          <p className="mt-2 text-stone-600">Hours + mileage · export-ready for QuickBooks, Gusto, or ADP.</p>
        </div>
        <div className="flex gap-2">
          <button data-testid="payroll-export" className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold">
            <Download className="h-4 w-4" /> Export payroll CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Total wages" value={`$${totalWages.toLocaleString()}`} icon={DollarSign} />
        <Kpi label="Mileage reimb." value={`$${totalReimb.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={DollarSign} />
        <Kpi label="Total hours" value={rows.reduce((s, r) => s + r.hours, 0).toFixed(1)} icon={Clock} />
        <Kpi label="Nurses paid" value={rows.length} icon={Users} tone="terra" />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 font-semibold border-b border-stone-100 bg-stone-50">
              <th className="py-3 px-6">Nurse</th><th className="py-3 px-6">Hours</th><th className="py-3 px-6">Rate</th><th className="py-3 px-6">Wages</th><th className="py-3 px-6">Miles</th><th className="py-3 px-6">Reimb</th><th className="py-3 px-6 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((r) => (
              <tr key={r.id} data-testid={`payroll-${r.id}`} className="hover:bg-stone-50">
                <td className="py-3 px-6"><p className="font-semibold">{r.nurse}</p><p className="text-xs text-stone-500">{r.role}</p></td>
                <td className="py-3 px-6 tabular-nums">{r.hours}</td>
                <td className="py-3 px-6 tabular-nums text-stone-500">${r.rate}/h</td>
                <td className="py-3 px-6 tabular-nums font-semibold">${r.wages.toLocaleString()}</td>
                <td className="py-3 px-6 tabular-nums">{r.mileage}</td>
                <td className="py-3 px-6 tabular-nums text-stone-500">${r.reimb.toFixed(0)}</td>
                <td className="py-3 px-6 tabular-nums text-right font-display text-lg">${r.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-200 bg-stone-50">
              <td className="py-4 px-6 font-semibold uppercase text-xs tracking-widest text-stone-500">Grand total</td>
              <td colSpan="5" className="py-4 px-6"></td>
              <td className="py-4 px-6 tabular-nums text-right font-display text-2xl text-[#D95D39]">${grand.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tone }) {
  const cls = tone === "terra" ? "bg-[#F7E5DD] border-[#D95D39]/30" : "bg-white border-stone-200";
  return (
    <div className={`rounded-2xl border p-5 ${cls}`}>
      {Icon && <Icon className="h-4 w-4 text-stone-500" />}
      <p className="mt-3 text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</p>
      <p className="font-display text-3xl mt-1 leading-none">{value}</p>
    </div>
  );
}
