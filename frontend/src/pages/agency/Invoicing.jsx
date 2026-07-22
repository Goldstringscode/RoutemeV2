import React, { useState } from "react";
import { FileText, Download, Send, Plus, DollarSign, Clock } from "lucide-react";

const INVOICES = [
  { id: "INV-0247", client: "Eleanor Mabry", period: "Feb 1 – Feb 14", visits: 6, amount: 1420, status: "paid" },
  { id: "INV-0248", client: "Rafael Torres", period: "Feb 1 – Feb 14", visits: 5, amount: 1180, status: "paid" },
  { id: "INV-0249", client: "Alma Herrera", period: "Feb 1 – Feb 14", visits: 8, amount: 2240, status: "sent" },
  { id: "INV-0250", client: "Thomas Reyes", period: "Feb 1 – Feb 14", visits: 4, amount: 950, status: "draft" },
  { id: "INV-0251", client: "Yolanda García", period: "Feb 1 – Feb 14", visits: 6, amount: 1620, status: "overdue" },
];

const STATUS = {
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  draft: "bg-stone-100 text-stone-600 border-stone-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
};

export default function Invoicing() {
  const [q, setQ] = useState("");
  const rows = INVOICES.filter((i) => (i.client + i.id).toLowerCase().includes(q.toLowerCase()));

  const total = INVOICES.reduce((s, i) => s + i.amount, 0);
  const paid = INVOICES.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = total - paid;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Invoicing</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">Every visit, <span className="font-serif-i text-[#D95D39]">billed</span>.</h1>
        </div>
        <button data-testid="invoice-new" className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold"><Plus className="h-4 w-4" /> New invoice</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Kpi label="Total billed" value={`$${total.toLocaleString()}`} icon={DollarSign} />
        <Kpi label="Collected" value={`$${paid.toLocaleString()}`} sub="paid" tone="sage" />
        <Kpi label="Outstanding" value={`$${outstanding.toLocaleString()}`} sub={`${INVOICES.filter(i => i.status !== "paid").length} invoices`} tone={outstanding > 0 ? "warn" : ""} />
      </div>

      <input data-testid="invoice-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoices, clients…" className="w-full h-11 rounded-full border border-stone-200 bg-white px-4 text-sm outline-none focus:border-stone-500" />

      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 font-semibold border-b border-stone-100 bg-stone-50">
              <th className="py-3 px-6">Invoice</th><th className="py-3 px-6">Client</th><th className="py-3 px-6">Period</th><th className="py-3 px-6">Visits</th><th className="py-3 px-6">Amount</th><th className="py-3 px-6">Status</th><th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((i) => (
              <tr key={i.id} data-testid={`invoice-${i.id}`} className="hover:bg-stone-50">
                <td className="py-3 px-6 font-mono text-xs">{i.id}</td>
                <td className="py-3 px-6 font-medium">{i.client}</td>
                <td className="py-3 px-6 text-stone-500 text-xs">{i.period}</td>
                <td className="py-3 px-6 tabular-nums">{i.visits}</td>
                <td className="py-3 px-6 tabular-nums font-display text-lg">${i.amount.toLocaleString()}</td>
                <td className="py-3 px-6"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${STATUS[i.status]}`}>{i.status}</span></td>
                <td className="py-3 px-6 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button data-testid={`invoice-download-${i.id}`} className="h-8 w-8 rounded-full hover:bg-stone-100 text-stone-500 flex items-center justify-center" title="Download PDF"><Download className="h-4 w-4" /></button>
                    {i.status === "draft" && <button data-testid={`invoice-send-${i.id}`} className="h-8 w-8 rounded-full hover:bg-stone-100 text-[#D95D39] flex items-center justify-center" title="Send"><Send className="h-4 w-4" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, icon: Icon, tone }) {
  const cls = tone === "sage" ? "bg-[#E3ECE5] border-emerald-100" : tone === "warn" ? "bg-amber-50 border-amber-200" : "bg-white border-stone-200";
  return (
    <div className={`rounded-2xl border p-5 ${cls}`}>
      {Icon && <Icon className="h-4 w-4 text-stone-500" />}
      <p className="mt-3 text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</p>
      <p className="font-display text-3xl mt-1 leading-none">{value}</p>
      {sub && <p className="text-xs text-stone-500 mt-2">{sub}</p>}
    </div>
  );
}
