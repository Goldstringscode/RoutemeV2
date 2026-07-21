import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Sparkles,
  Users,
  Zap,
  Crown,
  ShieldCheck,
  Map,
  Mic,
  ScrollText,
  Radio,
} from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import HipaaBadge from "@/components/HipaaBadge";

const TIER_INFO = {
  solo: {
    name: "Solo",
    icon: Users,
    audience: "nurse",
    dashboardPath: "/app/dashboard",
    dashboardLabel: "Nurse dashboard",
    kicker: "The independent nurse's toolkit",
    newest: [
      { icon: Map, title: "Fuel-efficient multi-stop routing", desc: "Up to 8 stops · re-optimized as clients confirm." },
      { icon: Mic, title: "Voice-to-text visit notes", desc: "Speak. We transcribe, timestamp, and lock." },
      { icon: ScrollText, title: "Personal HIPAA audit trail", desc: "Every view, every note — signed with your license #." },
    ],
  },
  growth: {
    name: "Growth",
    icon: Sparkles,
    audience: "agency",
    dashboardPath: "/agency/overview",
    dashboardLabel: "Agency console",
    kicker: "Your agency, orchestrated",
    newest: [
      { icon: Radio, title: "Live Command Center map", desc: "Every nurse, every visit, in real time." },
      { icon: Users, title: "Secure-link nurse invites", desc: "One-click onboarding with automatic HIPAA training." },
      { icon: ScrollText, title: "Full HIPAA audit exports", desc: "Regulator-ready CSVs in a single click." },
    ],
  },
  scale: {
    name: "Scale",
    icon: Zap,
    audience: "agency",
    dashboardPath: "/agency/overview",
    dashboardLabel: "Agency console",
    kicker: "Multi-region, no compromises",
    newest: [
      { icon: ShieldCheck, title: "SSO / SAML authentication", desc: "Single sign-on tied to your identity provider." },
      { icon: Radio, title: "Zone-based dispatch tools", desc: "Route by geography, seniority, or care specialty." },
      { icon: ScrollText, title: "Advanced compliance reports", desc: "Automated monthly HIPAA + payroll reconciliation." },
    ],
  },
  enterprise: {
    name: "Enterprise",
    icon: Crown,
    audience: "agency",
    dashboardPath: "/agency/overview",
    dashboardLabel: "Enterprise console",
    kicker: "Hospital networks & MSOs",
    newest: [
      { icon: Crown, title: "White-label branding", desc: "Your logo, your colors, your terms." },
      { icon: ShieldCheck, title: "Custom BAA + named security officer", desc: "Bespoke compliance posture." },
      { icon: Zap, title: "Custom EHR / HRIS integrations", desc: "Native Epic, Cerner, Workday connectors." },
    ],
  },
};

export default function Welcome() {
  const [params] = useSearchParams();
  const planId = params.get("plan") ?? "growth";
  const tier = TIER_INFO[planId] ?? TIER_INFO.growth;
  const nameParam = params.get("name") ?? "";
  const firstName = nameParam.split(" ")[0] || "there";
  const Icon = tier.icon;
  const { setAuthed, setAgencyAuthed } = useRouteMe();
  const navigate = useNavigate();

  // Auto-authenticate on landing so the "Go to dashboard" button is one click
  useEffect(() => {
    if (tier.audience === "nurse") setAuthed(true);
    else setAgencyAuthed(true);
  }, [tier.audience, setAuthed, setAgencyAuthed]);

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 relative overflow-hidden">
      {/* Ambient confetti dots */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => {
          const seed = (i * 137) % 100;
          const size = 4 + (i % 4) * 2;
          const colors = ["#D95D39", "#F7E5DD", "#7FA08B", "#E3ECE5", "#EFE9DF"];
          const color = colors[i % colors.length];
          return (
            <span
              key={i}
              className="absolute rounded-full opacity-50 rm-float"
              style={{
                left: `${(seed * 1.7) % 100}%`,
                top: `${(i * 13) % 90 + 5}%`,
                width: size,
                height: size,
                background: color,
                animationDelay: `${(i % 5) * 0.4}s`,
              }}
            />
          );
        })}
      </div>

      {/* Nav */}
      <header className="relative sticky top-0 z-30 border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="welcome-home-link">
            <div className="relative h-8 w-8 rounded-xl bg-stone-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D95D39] border-2 border-[#F9F8F6]" />
            </div>
            <span className="font-display text-xl font-semibold">RouteMe</span>
          </Link>
          <div className="flex items-center gap-3">
            <HipaaBadge compact />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 lg:px-10 pt-16 lg:pt-24 pb-10 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-white border border-emerald-100 shadow-[0_10px_40px_-15px_rgba(217,93,57,0.4)] flex items-center justify-center rm-pop">
          <div className="h-14 w-14 rounded-full bg-[#E3ECE5] flex items-center justify-center">
            <Check className="h-7 w-7 text-emerald-600" strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5">
          <Icon className="h-3.5 w-3.5 text-[#D95D39]" strokeWidth={2} />
          <span className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-600">
            You&apos;re now on RouteMe <span className="text-[#D95D39]">{tier.name}</span> tier
          </span>
        </div>

        <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
          Thanks for joining, <span className="font-serif-i text-[#D95D39]">{firstName}</span>.
        </h1>

        <p className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          You&apos;re officially inside the RouteMe system. Every mile you drive, every note you capture, and every audit event is now protected — HIPAA-aligned end to end.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(tier.dashboardPath)}
            data-testid="welcome-go-dashboard"
            className="group inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white pl-6 pr-5 py-4 text-sm font-semibold transition-colors shadow-[0_10px_40px_-10px_rgba(217,93,57,0.5)]"
          >
            Go to your dashboard now
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#D95D39] group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
          <Link
            to="/"
            data-testid="welcome-home-btn"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-900 px-6 py-4 text-sm font-semibold"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-5 text-xs text-stone-500">
          Signed in as <span className="font-semibold text-stone-700">{tier.dashboardLabel.toLowerCase()}</span> · You can sign out anytime from your profile
        </p>
      </section>

      {/* Newest features */}
      <section className="relative mx-auto max-w-5xl px-6 lg:px-10 pb-16">
        <div className="rounded-3xl bg-white border border-stone-200 p-8 md:p-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D95D39]" />
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
              Newest features · unlocked on {tier.name}
            </p>
          </div>
          <h2 className="font-display text-3xl md:text-4xl leading-tight">
            {tier.kicker}
          </h2>
          <p className="mt-3 text-stone-600 max-w-xl">
            Here&apos;s what&apos;s waiting for you inside — start with any one and the rest will click into place.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {tier.newest.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-stone-200 hover:border-stone-400 hover:shadow-[0_20px_40px_-25px_rgba(0,0,0,0.15)] transition-all p-5 bg-white"
                data-testid={`welcome-feature-${i}`}
              >
                <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center group-hover:bg-[#D95D39] group-hover:text-white transition-colors">
                  <f.icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-lg mt-4 leading-tight">{f.title}</h3>
                <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <section className="relative mx-auto max-w-5xl px-6 lg:px-10 pb-16">
        <div className="rounded-2xl bg-stone-900 text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold mb-2">
              Need a hand?
            </p>
            <h3 className="font-display text-2xl">Your 15-minute onboarding is free.</h3>
            <p className="text-sm text-white/70 mt-1">Book a call with our care ops lead — get a tailored setup in one sitting.</p>
          </div>
          <a
            href="mailto:onboarding@routeme.app?subject=New account onboarding"
            data-testid="welcome-onboarding-btn"
            className="inline-flex items-center gap-2 rounded-full bg-white text-stone-900 px-5 py-3 text-sm font-semibold hover:bg-stone-100"
          >
            Book onboarding
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="relative border-t border-stone-200 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 RouteMe · Built with care for traveling nurses.</p>
          <p>Prototype · no real charges applied</p>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes rm-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .rm-pop { animation: rm-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes rm-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .rm-float { animation: rm-float 4.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}