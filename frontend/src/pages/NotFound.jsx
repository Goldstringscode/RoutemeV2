import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft, Home, LifeBuoy, Map, Search } from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";

const SUGGESTED_ROUTES = [
  { label: "Home", to: "/", desc: "The RouteMe landing page", icon: Home, testId: "nf-link-home" },
  { label: "Pricing", to: "/pricing", desc: "Plans for solo nurses to enterprise", icon: Map, testId: "nf-link-pricing" },
  { label: "Nurse sign in", to: "/login", desc: "For traveling home health nurses", icon: ArrowRight, testId: "nf-link-nurse" },
  { label: "Agency console", to: "/agency/login", desc: "For agency directors & admins", icon: ArrowRight, testId: "nf-link-agency" },
];

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 relative overflow-hidden flex flex-col">
      {/* Nav */}
      <header className="relative border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="nf-brand">
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

      {/* Main */}
      <main className="relative flex-1 mx-auto max-w-6xl w-full px-6 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: message */}
        <div className="lg:col-span-6">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-6">
            404 · route not found
          </p>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight">
            You&apos;ve driven <span className="font-serif-i text-[#D95D39]">off-route</span>.
          </h1>
          <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-lg">
            This page isn&apos;t on any of our schedules. It might&apos;ve moved, been renamed, or it never existed — even our best routing engine can&apos;t find it.
          </p>

          {location.pathname && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-500 font-mono">
              <Search className="h-3.5 w-3.5 text-stone-400" />
              {location.pathname}
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <Link
              to="/"
              data-testid="nf-home-btn"
              className="group inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white pl-6 pr-5 py-4 text-sm font-semibold transition-colors shadow-[0_10px_40px_-10px_rgba(217,93,57,0.5)]"
            >
              Take me home
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#D95D39] group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <button
              onClick={() => navigate(-1)}
              data-testid="nf-back-btn"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-900 px-6 py-4 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
          </div>

          <a
            href="mailto:support@routeme.app?subject=404 error"
            data-testid="nf-support-link"
            className="mt-6 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 underline underline-offset-4 decoration-stone-300"
          >
            <LifeBuoy className="h-4 w-4" />
            Something should be here? Let us know.
          </a>
        </div>

        {/* Right: stylized off-route map */}
        <div className="lg:col-span-6">
          <div className="relative rounded-3xl border border-stone-200 bg-white p-6 md:p-8 overflow-hidden">
            <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#F7E5DD] blur-3xl" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-[#E3ECE5] blur-3xl" />

            {/* Big 404 */}
            <div className="relative flex items-center justify-center py-4">
              <span className="font-display text-[9rem] md:text-[11rem] leading-none tracking-tight text-stone-900/5 select-none">
                404
              </span>
            </div>

            {/* Map card */}
            <div className="relative -mt-24 md:-mt-32 mx-auto max-w-xs rounded-2xl bg-stone-900 text-white p-5 rotate-[-3deg] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D95D39] rm-pulse-dot" />
                Route calculating…
              </div>
              <svg viewBox="0 0 200 80" className="mt-3 h-20 w-full">
                <defs>
                  <pattern id="grid404" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="200" height="80" fill="url(#grid404)" />
                {/* stray path drifting off */}
                <path
                  d="M10 60 Q 50 30 90 45 T 190 15"
                  fill="none"
                  stroke="#D95D39"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                {/* pin */}
                <circle cx="10" cy="60" r="4" fill="#7FA08B" />
                {/* lost pin off canvas */}
                <circle cx="190" cy="15" r="4" fill="#D95D39" />
                <circle cx="190" cy="15" r="10" fill="none" stroke="#D95D39" strokeOpacity="0.4">
                  <animate attributeName="r" values="4;14;4" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>
              <p className="mt-2 text-xs text-white/60">Destination is <span className="text-[#F7E5DD] font-semibold">off-grid</span></p>
            </div>
          </div>

          {/* Suggested routes */}
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-3">
              Or head to a known destination
            </p>
            <ul className="divide-y divide-stone-100">
              {SUGGESTED_ROUTES.map((r) => (
                <li key={r.to}>
                  <Link
                    to={r.to}
                    data-testid={r.testId}
                    className="flex items-center gap-3 py-3 group hover:bg-stone-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="h-9 w-9 rounded-xl bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center group-hover:bg-[#D95D39] group-hover:text-white transition-colors">
                      <r.icon className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900">{r.label}</p>
                      <p className="text-xs text-stone-500 truncate">{r.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-[#D95D39] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="relative border-t border-stone-200 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 RouteMe · Built with care for traveling nurses.</p>
          <p>Prototype · error {location.pathname ? `at ${location.pathname}` : ""}</p>
        </div>
      </footer>
    </div>
  );
}
