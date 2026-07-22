import React from "react";
import EmailShell, { EKicker, EH1, EP, EButton, EDetailCard, ERow, EDivider, ESignoff } from "./EmailShell";

export default function TrialEndingEmail({
  firstName = "Priya",
  tier = "Growth",
  daysLeft = 2,
  trialEndsOn = "February 28, 2026",
  seats = 5,
  monthlyAmount = 325,
  cardBrand = "Visa",
  cardLast4 = "4242",
}) {
  return (
    <EmailShell
      preheader={`${daysLeft} days left on your RouteMe trial — no action needed to keep going.`}
      accent="#D95D39"
      category="account emails"
    >
      <EKicker>Your RouteMe trial</EKicker>
      <EH1>
        {daysLeft} <span className="font-serif italic text-[#D95D39]" style={{ fontFamily: "'Playfair Display', serif" }}>
          days
        </span> until you&apos;re a full paying customer, {firstName}.
      </EH1>
      <EP>
        Your <strong className="text-stone-900">RouteMe {tier}</strong> trial ends on{" "}
        <strong className="text-stone-900">{trialEndsOn}</strong>. Do nothing and your card is charged{" "}
        <strong className="text-stone-900">${monthlyAmount}</strong> the day after — and everything you&apos;ve set up keeps working exactly as it does today.
      </EP>

      <div className="mt-6 rounded-2xl bg-stone-900 text-white p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[#D95D39]/40 blur-3xl" />
        <div className="relative flex items-end gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-semibold">Days remaining</p>
            <p className="font-display text-6xl leading-none mt-2">{daysLeft}</p>
          </div>
          <div className="flex-1 pb-1">
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#D95D39]" style={{ width: `${(daysLeft / 14) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/60">
              Trial ends <span className="text-white font-medium">{trialEndsOn}</span>
            </p>
          </div>
        </div>
      </div>

      <EDetailCard title="What happens next">
        <ERow label="Trial ends" value={trialEndsOn} />
        <ERow label="First charge" value={`$${monthlyAmount} · ${cardBrand} · ${cardLast4}`} />
        <ERow label="Seats included" value={`${seats}`} />
        <ERow label="Auto-renews" value="Monthly, until canceled" tone="emerald" />
      </EDetailCard>

      <EButton href="#" testId="trial-end-manage">
        Manage your subscription
      </EButton>

      <EP dim>
        Want to switch to annual and save 15%? Add more seats? Cancel? All takes about 20 seconds from the billing screen. And if the trial hasn&apos;t been enough — reply to this email and we&apos;ll extend it by another week, no questions asked.
      </EP>

      <EDivider />
      <EP dim>
        You can also downgrade to the free Solo plan at any time and keep your account (with reduced seats). Nothing gets deleted.
      </EP>

      <ESignoff />
    </EmailShell>
  );
}
