import React from "react";
import { useRouteMe } from "@/context/RouteMeContext";
import { CreditCard, TrendingUp, Download } from "lucide-react";

const STATUS_STYLES = {
  paid: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  trial: "bg-[#7FA08B]/10 text-[#a8c4b1] border-[#7FA08B]/30",
  past_due: "bg-red-400/10 text-red-300 border-red-400/30",
};

const PLAN_PRICING = {
  Starter: { seats: 10, price: 320 },
  Growth: { seats: 20, price: 780 },
  Scale: { seats: 60, price: 2890 },
  Enterprise: { seats: 250, price: 8900 },
};

export default function SuperAdminBilling() {
  const { agencies, billingLedger } = useRouteMe();

  const totalMRR = agencies.reduce((s, a) => s + a.mrr, 0);
  const totalARR = totalMRR * 12;
  const paidCount = billingLedger.filter(i => i.status === "paid").length;
  const pastDueCount = billingLedger.filter(i => i.status === "past_due").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">Platform billing</p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
          The <span className="font-serif-i text-[#D95D39]">ledger</span>.
        </h1>
        <p className="mt-2 text-white/60">Revenue across every agency, every plan, every cycle.</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BKpi label="MRR" value={`$${totalMRR.toLocaleString()}`} sub="+9.2% MoM" tone="terra" />
        <BKpi label="ARR" value={`$${totalARR.toLocaleString()}`} sub="run-rate" tone="sage" />
        <BKpi label="Paid this cycle" value={`${paidCount}/${billingLedger.length}`} sub="on time" />
        <BKpi label="Past due" value={pastDueCount} sub={pastDueCount ? "collections needed" : "clear"} tone={pastDueCount ? "warn" : ""} />
      </div>

      {/* Plans breakdown */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Plan mix</p>
        <h3 className="font-display text-2xl text-white mt-1 mb-5">Distribution across agencies</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {["Starter", "Growth", "Scale", "Enterprise"].map((plan) => {
            const count = agencies.filter(a => a.plan === plan).length;
            const pct = Math.round(count / agencies.length * 100) || 0;
            return (
              <div key={plan} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{plan}</div>
                <div className="font-display text-3xl text-white mt-1">{count}</div>
                <div className="text-xs text-white/50 mt-1">${PLAN_PRICING[plan].price}/mo · {PLAN_PRICING[plan].seats} seats</div>
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#D95D39]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice ledger */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold">Invoice ledger</p>
            <h3 className="font-display text-xl text-white mt-1">Feb 2026 cycle</h3>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/5 text-white px-3 py-1.5 text-xs font-semibold">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 font-semibold bg-black/30 border-b border-white/10">
              <th className="py-3 px-6">Invoice</th>
              <th className="py-3 px-6">Agency</th>
              <th className="py-3 px-6">Period</th>
              <th className="py-3 px-6">Amount</th>
              <th className="py-3 px-6">Paid</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {billingLedger.map((inv) => {
              const ag = agencies.find(a => a.id === inv.agencyId);
              return (
                <tr key={inv.id} data-testid={`sa-invoice-${inv.id}`} className="hover:bg-white/5">
                  <td className="py-4 px-6 font-mono text-xs text-white/70">{inv.id}</td>
                  <td className="py-4 px-6">
                    <div className="text-white">{ag?.name}</div>
                    <div className="text-xs text-white/40">{ag?.plan}</div>
                  </td>
                  <td className="py-4 px-6 text-white/70">{inv.period}</td>
                  <td className="py-4 px-6 tabular-nums text-white font-display text-lg">${inv.amount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-white/50 text-xs">{inv.paidAt ?? "—"}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${STATUS_STYLES[inv.status]}`}>
                      {inv.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BKpi({ label, value, sub, tone }) {
  const styles = tone === "terra" ? "bg-[#D95D39]/10 border-[#D95D39]/30" :
    tone === "sage" ? "bg-[#7FA08B]/10 border-[#7FA08B]/30" :
    tone === "warn" ? "bg-amber-400/10 border-amber-400/30" :
    "bg-white/5 border-white/10";
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <div className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">{label}</div>
      <div className="font-display text-3xl text-white mt-1 leading-none">{value}</div>
      <div className="text-xs text-white/50 mt-2">{sub}</div>
    </div>
  );
}
