import React from "react";
import EmailShell, { EKicker, EH1, EP, EButton, EDetailCard, ERow, EDivider, ESignoff } from "./EmailShell";

export default function PaymentFailedEmail({
  firstName = "Priya",
  tier = "Growth",
  amount = 325,
  reason = "Card declined by issuer",
  cardBrand = "Visa",
  cardLast4 = "4242",
  retryOn = "February 17, 2026",
  gracePeriod = "3 days",
}) {
  return (
    <EmailShell
      preheader={`We couldn't charge your card for $${amount}. Update it within ${gracePeriod} to keep RouteMe running.`}
      accent="#D95D39"
      category="billing alerts"
    >
      <EKicker tone="amber">Oops · we hit a snag with your payment</EKicker>
      <EH1>
        A small <span className="font-serif italic text-[#D95D39]" style={{ fontFamily: "'Playfair Display', serif" }}>
          bump
        </span> in the road, {firstName}.
      </EH1>
      <EP>
        We tried to renew your <strong className="text-stone-900">RouteMe {tier}</strong> subscription for{" "}
        <strong className="text-stone-900">${amount}</strong> today, but the charge didn&apos;t go through. Nothing&apos;s
        broken — just a quick fix on your end and you&apos;re back on the road.
      </EP>

      {/* Alert card */}
      <div className="mt-6 rounded-2xl border-l-4 border-[#D95D39] bg-[#FDF1EC] p-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a3a24] font-semibold">Reason from your bank</p>
        <p className="mt-2 text-sm text-stone-800 font-medium">{reason}</p>
        <p className="mt-1 text-xs text-stone-600">
          {cardBrand} ending in <span className="font-mono font-semibold">{cardLast4}</span> · this is the most common
          fix: an expired card, insufficient funds, or a bank fraud check.
        </p>
      </div>

      <EButton href="#" testId="failed-update-payment">
        Update payment method
      </EButton>

      <EDetailCard title="What happens next">
        <ERow label="Automatic retry" value={retryOn} />
        <ERow label="Grace period" value={`${gracePeriod} to fix`} tone="amber" />
        <ERow label="After grace" value="Read-only mode" tone="red" />
      </EDetailCard>

      <EP dim>
        <strong className="text-stone-700">Your data is safe.</strong> If we can&apos;t collect payment within the
        grace window, your account moves to read-only — you&apos;ll still see everything, and nothing gets deleted.
        Reactivate anytime by paying the outstanding invoice.
      </EP>

      <EDivider />
      <EP dim>
        Talking to a human helps? Reply here or email{" "}
        <a href="mailto:billing@routeme.app" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">
          billing@routeme.app
        </a>{" "}
        — a real person on our team responds within 4 hours.
      </EP>

      <ESignoff author="The RouteMe billing team" />
    </EmailShell>
  );
}
