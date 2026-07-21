import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Building2, Users, Zap, Crown } from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";
import { useRouteMe } from "@/context/RouteMeContext";

const TIERS = [
  {
    id: "solo",
    name: "Solo",
    kicker: "For the independent nurse",
    icon: Users,
    price: 0,
    priceLabel: "Free",
    priceSub: "forever · 1 seat",
    cta: "Start free",
    ctaLink: "/login",
    features: [
      "Route optimization for up to 8 daily stops",
      "Voice-to-text visit notes",
      "Personal HIPAA audit trail",
      "Care flag templates",
      "Email support",
    ],
    limits: "Solo license · no team features",
  },
  {
    id: "growth",
    name: "Growth",
    kicker: "For small home health teams",
    icon: Sparkles,
    price: 65,
    priceLabel: "$65",
    priceSub: "per seat / month · up to 20 seats",
    cta: "Start Growth trial",
    ctaLink: "/agency/login",
    highlight: true,
    features: [
      "Everything in Solo",
      "Agency admin console",
      "Live Command Center map",
      "Full HIPAA audit trail & exports",
      "Nurse invites via secure link",
      "Priority email + chat support",
    ],
    limits: "14-day free trial · no credit card required",
  },
  {
    id: "scale",
    name: "Scale",
    kicker: "For multi-region agencies",
    icon: Zap,
    price: 55,
    priceLabel: "$55",
    priceSub: "per seat / month · up to 100 seats",
    cta: "Talk to sales",
    ctaLink: "/agency/login",
    features: [
      "Everything in Growth",
      "SSO / SAML authentication",
      "Custom Business Associate Agreement",
      "Dedicated Customer Success Manager",
      "API access & webhooks",
      "Advanced compliance reports",
      "Zone-based dispatch tools",
    ],
    limits: "Volume discount available at 50+ seats",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    kicker: "For hospital networks & MSOs",
    icon: Crown,
    price: null,
    priceLabel: "Custom",
    priceSub: "Call for a tailored quote",
    cta: "Book a call",
    ctaLink: "mailto:sales@routeme.app?subject=Enterprise inquiry",
    features: [
      "Everything in Scale",
      "Unlimited seats & agencies",
      "White-label branding",
      "Custom on-prem or private-cloud deploy",
      "24/7 phone support & 99.99% SLA",
      "Dedicated implementation team",
      "Custom integrations (EHR, HRIS, payroll)",
      "Named security & compliance officer",
    ],
    limits: "1-week response · dedicated onboarding",
  },
];

const FAQ = [
  {
    q: "Is there a free trial for paid tiers?",
    a: "Yes — Growth includes a 14-day free trial, no credit card required. Scale trials are arranged during your intro call.",
  },
  {
    q: "Do you charge per seat or per visit?",
    a: "Per active seat, billed monthly. Deactivated nurses don't count. You can right-size at any time.",
  },
  {
    q: "Is a Business Associate Agreement included?",
    a: "Every paid tier includes a standard BAA. Scale and Enterprise plans can execute custom BAAs to match your compliance posture.",
  },
  {
    q: "Can I switch plans later?",
    a: "Anytime. Upgrades apply instantly; downgrades take effect at the next billing cycle. No hidden fees.",
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");
  const { setAuthed, setAgencyAuthed } = useRouteMe();
  const navigate = useNavigate();

  const handleCta = (tier) => {
    navigate(`/signup?plan=${tier.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-stone-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D95D39] border-2 border-[#F9F8F6]" />
            </div>
            <span className="font-display text-xl font-semibold">RouteMe</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-600">
            <Link to="/" className="hover:text-stone-900">Home</Link>
            <Link to="/pricing" className="text-stone-900 font-semibold">Pricing</Link>
            <Link to="/agency/login" className="hover:text-stone-900">For agencies</Link>
          </nav>

          <div className="flex items-center gap-3">
            <HipaaBadge compact />
            <Link
              to="/login"
              data-testid="pricing-signin-btn"
              className="rounded-full bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 text-sm font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 lg:pt-24 pb-10 lg:pb-14">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-6">
            Pricing · fair by design
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
            Priced the way <span className="font-serif-i text-[#D95D39]">care</span> should be.
          </h1>
          <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-2xl">
            Simple, seat-based, and honest. Start free as a solo nurse — grow into an agency console when you&apos;re ready.
            No visit fees, no route surcharges, no hidden compliance line-items.
          </p>
        </div>

        {/* Toggle (decorative) */}
        <div className="mt-10 flex items-center gap-3">
          <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
            {["monthly", "annual"].map((b) => (
              <button
                key={b}
                data-testid={`billing-${b}`}
                onClick={() => setBilling(b)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                  billing === b ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {b}
                {b === "annual" && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#F7E5DD] text-[#D95D39]">
                    save 15%
                  </span>
                )}
              </button>
            ))}
          </div>
          <span className="text-xs text-stone-500">All plans include BAA · SOC2-aligned</span>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((t) => {
            const Icon = t.icon;
            const displayPrice =
              t.price === null
                ? t.priceLabel
                : t.price === 0
                  ? "$0"
                  : billing === "annual"
                    ? `$${Math.round(t.price * 0.85)}`
                    : `$${t.price}`;
            const priceUnit = t.price === null || t.price === 0 ? "" : "/seat/mo";

            return (
              <div
                key={t.id}
                data-testid={`tier-${t.id}`}
                className={`relative rounded-3xl p-6 rm-lift flex flex-col overflow-hidden ${
                  t.highlight
                    ? "bg-stone-900 text-white border-2 border-stone-900"
                    : "bg-white text-stone-900 border border-stone-200"
                }`}
              >
                {t.highlight && (
                  <>
                    <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[#D95D39]/40 blur-3xl" />
                    <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-full bg-[#D95D39] text-white">
                      Most loved
                    </span>
                  </>
                )}

                <div className="relative">
                  <Icon
                    className={`h-6 w-6 ${t.highlight ? "text-[#F7E5DD]" : "text-[#D95D39]"}`}
                    strokeWidth={1.8}
                  />
                  <h3 className="font-display text-2xl mt-4">{t.name}</h3>
                  <p className={`text-sm mt-1 ${t.highlight ? "text-white/60" : "text-stone-500"}`}>
                    {t.kicker}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-5xl leading-none">{displayPrice}</span>
                    {priceUnit && (
                      <span className={`text-sm ${t.highlight ? "text-white/60" : "text-stone-500"}`}>
                        {priceUnit}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${t.highlight ? "text-white/60" : "text-stone-500"}`}>
                    {t.priceSub}
                  </p>

                  <button
                    data-testid={`tier-cta-${t.id}`}
                    onClick={() => handleCta(t)}
                    className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full h-11 text-sm font-semibold transition-colors ${
                      t.highlight
                        ? "bg-[#D95D39] hover:bg-[#C05030] text-white"
                        : t.id === "enterprise"
                          ? "bg-stone-900 hover:bg-stone-800 text-white"
                          : "border border-stone-300 hover:bg-stone-50 text-stone-900"
                    }`}
                  >
                    {t.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <ul className={`relative mt-6 space-y-2.5 text-sm flex-1 ${t.highlight ? "text-white/90" : ""}`}>
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          t.highlight ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <p className={`relative mt-6 pt-4 border-t text-xs ${
                  t.highlight ? "border-white/10 text-white/60" : "border-stone-200 text-stone-500"
                }`}>
                  {t.limits}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison strip */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-16">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Every plan includes
              </p>
              <h3 className="font-display text-2xl mt-2">The non-negotiables.</h3>
              <p className="text-sm text-stone-600 mt-3">
                Because HIPAA compliance and route optimization shouldn&apos;t be up-charged.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-sm">
              {[
                "Encrypted PHI at rest & in transit",
                "Persistent HIPAA audit trail",
                "Voice-to-text visit notes",
                "Fuel-efficient multi-stop routing",
                "Care flags & time windows",
                "Fatigue-aware break reminders",
              ].map((x) => (
                <div key={x} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 lg:px-10 pb-24">
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-4">
          Questions we hear a lot
        </p>
        <h2 className="font-display text-4xl mb-10">
          Common <span className="font-serif-i text-[#7FA08B]">questions</span>.
        </h2>
        <div className="divide-y divide-stone-200 border-t border-stone-200">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h4 className="font-semibold text-base">{f.q}</h4>
                <span className="text-2xl text-stone-400 group-open:rotate-45 transition-transform duration-200">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24">
        <div className="rounded-3xl bg-stone-900 text-white p-10 md:p-14 relative overflow-hidden rm-grain">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#D95D39]/40 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold mb-4">
                Not sure which plan?
              </p>
              <h3 className="font-display text-4xl md:text-5xl leading-[1.05]">
                Let&apos;s size it together, <span className="font-serif-i text-[#F7E5DD]">honestly</span>.
              </h3>
              <p className="mt-4 text-white/70 max-w-md text-sm">
                A 15-minute call with our care operations lead — no sales pressure.
              </p>
            </div>
            <div className="md:justify-self-end">
              <a
                href="mailto:sales@routeme.app?subject=Plan sizing"
                data-testid="pricing-book-call-btn"
                className="inline-flex items-center gap-2 rounded-full bg-white text-stone-900 pl-5 pr-4 py-3.5 text-sm font-semibold hover:bg-stone-100"
              >
                <Building2 className="h-4 w-4" /> Book a call
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 RouteMe · Built with care for traveling nurses.</p>
          <p>Prototype · demo data only</p>
        </div>
      </footer>
    </div>
  );
}
