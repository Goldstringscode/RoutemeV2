import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, MapPin, FileText, Clock, Fuel, Building2 } from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";
import { useRouteMe } from "@/context/RouteMeContext";

const HIGHLIGHTS = [
  {
    kicker: "01 · Optimization",
    title: "5–10% fewer miles.",
    body: "Multi-stop routing tuned for time-windows, priority, and traffic — not just distance.",
    icon: Fuel,
  },
  {
    kicker: "02 · Privacy",
    title: "HIPAA at every touch.",
    body: "PHI stays encrypted end-to-end. Every access is logged in a tamper-proof audit trail.",
    icon: ShieldCheck,
  },
  {
    kicker: "03 · Field-first",
    title: "Visit notes.",
        body: "Type visit notes between homes. Encrypted on-device — never leaves your session.",
        icon: FileText,
  },
];

export default function Landing() {
  const { setAgencyAuthed } = useRouteMe();
  const navigate = useNavigate();

  const enterAgency = () => {
    setAgencyAuthed(true);
    navigate("/agency/overview");
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-xl bg-stone-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D95D39] border-2 border-[#F9F8F6]" />
            </div>
            <span className="font-display text-xl font-semibold">RouteMe</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-600">
            <a href="#features" className="hover:text-stone-900">Features</a>
            <Link to="/pricing" className="hover:text-stone-900" data-testid="landing-pricing-link">Pricing</Link>
            <a href="#nurses" className="hover:text-stone-900">For nurses</a>
            <a href="#privacy" className="hover:text-stone-900">Privacy</a>
            <Link to="/agency/login" className="hover:text-stone-900" data-testid="landing-agency-link">For agencies</Link>
          </nav>
          <div className="flex items-center gap-3">
            <HipaaBadge compact />
            <button
              onClick={enterAgency}
              data-testid="landing-agency-signin-btn"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 px-4 py-2 text-sm font-semibold transition-colors"
            >
              <Building2 className="h-4 w-4" /> Agency console
            </button>
            <Link
              to="/login"
              data-testid="landing-signin-btn"
              className="rounded-full bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 text-sm font-semibold transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-14 pb-16 lg:pt-24 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7 rm-fade-up">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-6">
              Routing · Home Health · HIPAA
            </p>
            <h1 className="font-display text-[46px] leading-[1.02] sm:text-6xl lg:text-7xl font-medium tracking-tight">
              The road between visits,{" "}
              <span className="font-serif-i text-[#D95D39]">softened.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-600 leading-relaxed">
              RouteMe plans the day for traveling home health nurses — optimizing every mile,
              protecting every record, and giving you back 30 minutes to the visits that matter most.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                              to="/signup?plan=solo"
                              data-testid="landing-cta-primary"
                              className="group inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white pl-5 pr-4 py-3.5 text-sm font-semibold transition-colors"
                            >
                              Start today&apos;s route
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <button
                onClick={enterAgency}
                data-testid="landing-agency-cta"
                className="group inline-flex items-center gap-2 rounded-full border border-stone-900 hover:bg-stone-900 hover:text-white text-stone-900 pl-5 pr-4 py-3.5 text-sm font-semibold transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Enter agency console
                <span className="text-[10px] font-semibold rounded-full bg-[#F7E5DD] text-[#D95D39] px-2 py-0.5 group-hover:bg-white/15 group-hover:text-white transition-colors">
                  DEMO
                </span>
              </button>
              <a
                href="#features"
                className="text-sm font-semibold text-stone-800 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-800"
              >
                See how it works
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 max-w-lg gap-6">
              <Stat n="+27 min" label="saved / day" />
              <Stat n="38.4 mi" label="fewer / week" />
              <Stat n="100%" label="HIPAA audit" />
            </div>
          </div>

          {/* Hero preview card */}
          <div className="lg:col-span-5 rm-fade-up" style={{ animationDelay: "0.15s" }}>
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-stone-200 bg-white overflow-hidden">
        <div className="flex whitespace-nowrap py-4 rm-marquee">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center gap-16 pr-16 shrink-0">
              {["Route optimization", "Visit notes", "PHI encryption", "Audit trail", "Fatigue-aware breaks", "Care flags", "Offline first", "Family alerts"].map((t) => (
                <span key={t} className="text-sm text-stone-500 tracking-wide">
                  · {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-4">
              What&apos;s different
            </p>
            <h2 className="font-display text-4xl lg:text-5xl leading-tight">
              Not another <span className="font-serif-i text-[#7FA08B]">routing app</span>.
            </h2>
            <p className="mt-5 text-stone-600 leading-relaxed">
              Built for the way home health actually happens — care flags, family logistics,
              and privacy woven into every screen.
            </p>
          </div>
          <div className="lg:col-span-8 grid md:grid-cols-3 gap-4">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="rm-lift rounded-2xl border border-stone-200 bg-white p-6 flex flex-col"
              >
                <h.icon className="h-6 w-6 text-[#D95D39]" strokeWidth={1.8} />
                <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold">
                  {h.kicker}
                </p>
                <h3 className="font-display text-2xl mt-2 leading-tight">{h.title}</h3>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="privacy" className="mx-auto max-w-7xl px-6 lg:px-10 pb-24">
        <div className="rounded-3xl border border-stone-200 bg-stone-900 text-white p-10 lg:p-16 relative overflow-hidden rm-grain">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#D95D39]/40 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold mb-4">
                Ready when you are
              </p>
              <h2 className="font-display text-4xl lg:text-6xl leading-[1.05]">
                Let&apos;s make today&apos;s route <span className="font-serif-i text-[#F7E5DD]">calmer</span>.
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <Link
                to="/login"
                data-testid="landing-cta-final"
                className="inline-flex items-center gap-2 rounded-full bg-white text-stone-900 pl-5 pr-4 py-3.5 text-sm font-semibold hover:bg-stone-100"
              >
                Sign in to RouteMe
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <p className="text-xs text-white/50 mt-3">Prototype — mocked authentication</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 RouteMe · Built with care for traveling nurses.</p>
          <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Prototype · demo data only
            <Link
              to="/superadmin/login"
              data-testid="landing-superadmin-link"
              aria-label="Platform operator access"
              className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-stone-300 hover:bg-[#D95D39] transition-colors"
              title="·"
            />
            <Link
              to="/emails"
              data-testid="landing-emails-link"
              aria-label="Email template library"
              className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-stone-300 hover:bg-[#7FA08B] transition-colors"
              title="·"
            />
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="font-display text-3xl leading-none">{n}</div>
      <div className="text-xs text-stone-500 mt-2 tracking-wide">{label}</div>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="rounded-2xl bg-[#EFE9DF] p-4 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 font-semibold">
            Today&apos;s route · optimized
          </p>
        </div>
        <div className="space-y-2">
          {[
            { n: "1", who: "Eleanor M.", w: "08:00 – 09:30", t: "Post-op knee" },
            { n: "2", who: "Rafael T.", w: "10:00 – 11:00", t: "Wound care" },
            { n: "3", who: "Margaret K.", w: "11:45 – 12:45", t: "COPD" },
          ].map((r) => (
            <div key={r.n} className="flex items-center gap-3 rounded-xl bg-white border border-stone-200 px-3 py-2.5">
              <span className="h-7 w-7 rounded-full bg-[#D95D39] text-white text-xs font-semibold flex items-center justify-center">
                {r.n}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{r.who}</p>
                <p className="text-[11px] text-stone-500 truncate">{r.t}</p>
              </div>
              <div className="ml-auto text-xs text-stone-500 tabular-nums">{r.w}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-stone-500 flex items-center gap-1"><Clock className="h-3 w-3" /> 27 min saved</span>
          <span className="text-[#D95D39] font-semibold">6 stops · 34.2 mi</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 rotate-3">
        <HipaaBadge />
      </div>
    </div>
  );
}
