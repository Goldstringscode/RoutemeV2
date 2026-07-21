import React from "react";
import EmailShell, { EKicker, EH1, EP, EButton, EDetailCard, ERow, EDivider, ESignoff } from "./EmailShell";

export default function PaymentReceiptEmail({
  firstName = "Priya",
  tier = "Growth",
  amount = 325,
  seats = 5,
  billing = "monthly",
  cycle = "Feb 14 – Mar 14, 2026",
  invoiceId = "inv_2601",
  cardBrand = "Visa",
  cardLast4 = "4242",
  nextChargeOn = "March 14, 2026",
  nextChargeAmount = 325,
}) {
  return (
    <EmailShell
      preheader={`Receipt for $${amount} — your RouteMe ${tier} subscription is active for ${cycle}.`}
      accent="#7FA08B"
      category="billing receipts"
    >
      <EKicker tone="sage">Payment received · thank you</EKicker>
      <EH1>
        A quiet <span className="font-serif italic text-[#7FA08B]" style={{ fontFamily: "'Playfair Display', serif" }}>
          thank you
        </span>, {firstName}.
      </EH1>
      <EP>
        Your subscription to <strong className="text-stone-900">RouteMe {tier}</strong> renewed successfully. Every seat, every audit event, every optimized route — funded and running for another cycle.
      </EP>

      {/* Big amount block */}
      <div className="mt-8 rounded-2xl bg-stone-900 text-white p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[#7FA08B]/40 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-semibold">Paid today</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-5xl leading-none">${amount.toLocaleString()}</span>
            <span className="text-sm text-white/60 capitalize">/ {billing}</span>
          </div>
          <p className="mt-1 text-xs text-white/60">Invoice <span className="font-mono">{invoiceId}</span> · {cycle}</p>
        </div>
      </div>

      <EDetailCard title="Receipt details">
        <ERow label="Plan" value={`RouteMe ${tier}`} />
        <ERow label="Seats" value={`${seats} × active`} />
        <ERow label="Billing cycle" value={billing.charAt(0).toUpperCase() + billing.slice(1)} />
        <ERow label="Payment method" value={`${cardBrand} ending in ${cardLast4}`} />
        <ERow label="Status" value="Paid" tone="emerald" />
      </EDetailCard>

      <EDetailCard title="What's next">
        <ERow label="Next charge" value={nextChargeOn} />
        <ERow label="Next amount" value={`$${nextChargeAmount.toLocaleString()}`} />
      </EDetailCard>

      <EButton href="#" testId="receipt-download-invoice" tone="dark">
        Download PDF invoice
      </EButton>

      <EDivider />
      <EP dim>
        Need to change payment method, add seats, or switch to annual billing (save 15%)?{" "}
        <a href="#" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">
          Manage subscription →
        </a>
      </EP>

      <ESignoff author="The RouteMe billing team" />
    </EmailShell>
  );
}
