import React from "react";
import EmailShell, { EKicker, EH1, EH2, EP, EButton, EDetailCard, ERow, EDivider, ESignoff } from "./EmailShell";

const TIER_COPY = {
  Solo: { badge: "Free · forever", features: ["Route optimization for 8 daily stops", "Voice-to-text visit notes", "Personal HIPAA audit trail"], cta: "Open your nurse dashboard", href: "/app/dashboard" },
  Growth: { badge: "14-day trial · then $65/seat/mo", features: ["Agency admin console", "Live Command Center map", "Full HIPAA audit exports", "Secure-link nurse invites"], cta: "Enter your agency console", href: "/agency/overview" },
  Scale: { badge: "$55/seat/mo · up to 100 seats", features: ["SSO / SAML authentication", "Dedicated CSM", "API access & webhooks", "Zone-based dispatch"], cta: "Enter your agency console", href: "/agency/overview" },
  Enterprise: { badge: "Custom · we&#39;ll be in touch", features: ["Unlimited seats", "White-label branding", "Custom BAA", "Dedicated implementation team"], cta: "See what&#39;s in your account", href: "/agency/overview" },
};

export default function WelcomeEmail({ firstName = "Priya", tier = "Growth", email = "priya@sunrisehh.demo" }) {
  const info = TIER_COPY[tier] ?? TIER_COPY.Growth;
  return (
    <EmailShell
      preheader={`Welcome to RouteMe — your ${tier} account is ready. Read on for your BAA and first steps.`}
      category="account emails"
      showBaa
    >
      <EKicker>Welcome to RouteMe</EKicker>
      <EH1>
        You&apos;re in, <span className="font-serif italic text-[#D95D39]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {firstName}
        </span>.
      </EH1>
      <EP>
        Thank you for joining RouteMe. You&apos;re officially on our <strong className="text-stone-900">{tier}</strong> tier — {info.badge}. Every mile, every note, and every visit is now protected by end-to-end encryption and an immutable HIPAA audit trail.
      </EP>

      <EButton href={info.href} testId="welcome-email-cta">
        {info.cta}
      </EButton>

      <EH2>Three things to try first</EH2>
      <ol className="mt-3 space-y-3">
        {info.features.map((f, i) => (
          <li key={f} className="flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-[#F7E5DD] text-[#D95D39] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-[15px] text-stone-700 leading-relaxed">{f}</span>
          </li>
        ))}
      </ol>

      <EDetailCard title="Your account">
        <ERow label="Signed in as" value={email} />
        <ERow label="Plan" value={tier} />
        <ERow label="HIPAA status" value="Active · BAA on file" tone="emerald" />
      </EDetailCard>

      <EDivider />
      <EP dim>
        Want a hand getting started? Book a free 15-minute onboarding call and we&apos;ll walk you through your first
        route, your first voice note, and your first audit export.{" "}
        <a href="#" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">
          Book onboarding →
        </a>
      </EP>

      <ESignoff />
    </EmailShell>
  );
}
