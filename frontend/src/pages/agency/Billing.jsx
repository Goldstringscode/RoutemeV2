import React from "react";
import { useRouteMe } from "@/context/RouteMeContext";
import { CreditCard, Check, ArrowUpRight, Download } from "lucide-react";

const PLANS = [
  {
    name: "Solo",
    price: 0,
    priceLabel: "Free",
    seats: 1,
    features: ["Route optimization", "Voice notes", "Personal audit trail"],
  },
  {
    name: "Growth",
    price: 65,
    seats: 20,
    features: ["Everything in Solo", "Agency admin console", "Live Command Center map", "Full HIPAA audit trail", "Priority support"],
    current: true,
  },
  {
    name: "Scale",
    price: 55,
    seats: 100,
    features: ["Everything in Growth", "SSO / SAML", "Custom BAA", "API access", "Dedicated CSM"],
  },
  {
    name: "Enterprise",
    price: null,
    priceLabel: "Custom",
    seats: "unlimited",
    features: ["Everything in Scale", "White-label branding", "24/7 phone support", "Custom integrations", "Named security officer"],
  },
];

const INVOICES = [
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: 780, status: "paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: 780, status: "paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: 715, status: "paid" },
  { id: "INV-2025-011", date: "Nov 1, 2025", amount: 650, status: "paid" },
];

export default function AgencyBilling() {
  const { agency, nurses } = useRouteMe();
  const usedSeats = nurses.filter((n) => n.status !== "inactive").length;
  const pct = Math.round((usedSeats / agency.seatsTotal) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
          Billing & plan
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight">
          Simple, <span className="font-serif-i text-[#D95D39]">seat-based</span>.
        </h1>
      </div>

      {/* Current plan */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full bg-[#F7E5DD] text-[#D95D39] border border-[#F0D2C4]">
                Current plan
              </span>
              <span className="text-xs text-stone-500">renews Mar 1, 2026</span>
            </div>
            <h3 className="font-display text-3xl">{agency.plan}</h3>
            <p className="text-sm text-stone-600 mt-1">
              ${agency.monthlyCost}/mo · {usedSeats} of {agency.seatsTotal} seats in use
            </p>

            <div className="mt-5 max-w-md">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-stone-500 font-semibold">Seat utilization</span>
                <span className="text-stone-700 tabular-nums">
                  {usedSeats}/{agency.seatsTotal} · {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#D95D39]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {pct >= 75 && (
                <p className="mt-2 text-xs text-amber-700">
                  You&apos;re approaching your seat limit. Upgrade to Scale for 100 seats.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#F9F8F6] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Visa ····8842</p>
                <p className="text-xs text-stone-500">Exp 09/28</p>
              </div>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white h-9 text-xs font-semibold hover:bg-stone-50">
              Update method
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="font-display text-2xl mb-4">Plans</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl border p-6 rm-lift relative overflow-hidden ${
                p.current
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-900"
              }`}
            >
              {p.current && (
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-[#D95D39]/40 blur-3xl" />
              )}
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-2xl">{p.name}</h4>
                  {p.current && (
                    <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full bg-[#D95D39] text-white">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl">
                    {p.price === null ? p.priceLabel : p.price === 0 ? "Free" : `$${p.price}`}
                  </span>
                  {p.price !== null && p.price > 0 && (
                    <span className={`text-sm ${p.current ? "text-white/60" : "text-stone-500"}`}>
                      /seat/mo
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${p.current ? "text-white/60" : "text-stone-500"}`}>
                  {p.seats === "unlimited" ? "Unlimited seats" : `Up to ${p.seats} seat${p.seats === 1 ? "" : "s"}`}
                </p>

                <ul className="mt-6 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          p.current ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                      <span className={p.current ? "text-white/90" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  data-testid={`plan-${p.name.toLowerCase()}-btn`}
                  disabled={p.current}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full h-11 text-sm font-semibold transition-colors ${
                    p.current
                      ? "bg-white/10 text-white/60 cursor-default"
                      : p.price === null
                        ? "bg-stone-900 hover:bg-stone-800 text-white"
                        : "bg-[#D95D39] hover:bg-[#C05030] text-white"
                  }`}
                >
                  {p.current
                    ? "Current plan"
                    : p.price === null
                      ? "Contact sales"
                      : "Switch to " + p.name}
                  {!p.current && <ArrowUpRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl">Invoices</h3>
          <button className="text-xs font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
            <Download className="h-3 w-3" /> Export all
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 font-semibold bg-[#F9F8F6] border-b border-stone-200">
                <th className="py-3 px-5">Invoice</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {INVOICES.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 px-5 font-mono text-xs">{inv.id}</td>
                  <td className="py-3 px-5 text-stone-700">{inv.date}</td>
                  <td className="py-3 px-5 font-semibold tabular-nums">${inv.amount}</td>
                  <td className="py-3 px-5">
                    <span className="inline-block text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[#E3ECE5] text-emerald-800 border border-emerald-100">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button className="text-xs font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
