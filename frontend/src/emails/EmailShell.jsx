import React from "react";

// Shared email chrome — used by every RouteMe email template.
// Designed to look/read like a real HTML email but styled with Tailwind
// so it stays in-sync with the app's design language.
//
// Structure: single-column, max 640px, single-serve layout that renders
// cleanly in preview mode. Discreet unsubscribe lives in the footer.

export default function EmailShell({
  preheader,
  accent = "#D95D39", // terracotta by default
  children,
  category = "notifications",
  showBaa = false,
}) {
  return (
    <div className="bg-[#EFE9DF] py-8" data-testid="email-canvas">
      {preheader && (
        <div className="sr-only" data-testid="email-preheader">
          {preheader}
        </div>
      )}
      <div className="mx-auto max-w-[640px] bg-[#F9F8F6] rounded-2xl border border-stone-200 overflow-hidden shadow-[0_10px_50px_-20px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-xl bg-stone-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#F9F8F6]"
                style={{ background: accent }}
              />
            </div>
            <span className="font-display text-lg font-semibold text-stone-900">RouteMe</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-[#E3ECE5] px-2.5 py-1 text-[10px] uppercase tracking-widest text-emerald-800 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            HIPAA · Secure
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-10">{children}</div>

        {/* BAA reminder (only for welcome/onboarding) */}
        {showBaa && (
          <div className="mx-8 mb-8 rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
              HIPAA Business Associate Agreement
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              By using RouteMe, you agree that RouteMe Inc. acts as a HIPAA Business Associate under 45 CFR §
              160.103, and that Protected Health Information (PHI) you upload is encrypted at rest (AES-256) and
              in transit (TLS 1.3). We will not disclose PHI except as permitted by our BAA or required by law.
              You retain full ownership of your data and may export or delete it at any time.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <a
                href="#"
                className="rounded-full border border-stone-200 hover:border-stone-400 px-2.5 py-1 text-stone-700"
                data-testid="email-baa-full"
              >
                Read the full BAA →
              </a>
              <a
                href="#"
                className="rounded-full border border-stone-200 hover:border-stone-400 px-2.5 py-1 text-stone-700"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-stone-100 bg-[#F1EDE5] px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <div className="h-6 w-6 rounded-lg bg-stone-900 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M4 20 L10 6 L14 14 L20 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span>RouteMe Inc. · 1204 Congress Ave, Austin, TX 78701</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-stone-500">
              <a href="#" className="hover:text-stone-900">Help</a>
              <a href="#" className="hover:text-stone-900">Privacy</a>
              <a href="#" className="hover:text-stone-900">Terms</a>
            </div>
          </div>

          <p className="mt-4 text-[10px] text-stone-500 leading-relaxed">
            You&apos;re receiving this email because you have an active RouteMe account or opted in to {category}.
            This message never contains Protected Health Information (PHI). Please do not reply to PHI in email —
            use the in-app secure notes instead.
          </p>

          {/* Discreet unsubscribe */}
          <p className="mt-3 text-[10px] text-stone-400 leading-relaxed">
            <span>© 2026 RouteMe Inc. · Made with care for traveling nurses. </span>
            <a
              href="#"
              data-testid="email-unsubscribe"
              className="underline underline-offset-2 decoration-stone-300 hover:text-stone-700"
            >
              Unsubscribe
            </a>
            <span> or </span>
            <a
              href="#"
              data-testid="email-manage-prefs"
              className="underline underline-offset-2 decoration-stone-300 hover:text-stone-700"
            >
              manage preferences
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

/* ————— Reusable primitives ————— */

export function EKicker({ children, tone = "terra" }) {
  const color = tone === "sage" ? "text-[#4a6f5c]" : tone === "amber" ? "text-amber-700" : tone === "red" ? "text-red-600" : "text-[#D95D39]";
  return (
    <p className={`text-[11px] uppercase tracking-[0.22em] font-semibold ${color} mb-4`}>
      {children}
    </p>
  );
}

export function EH1({ children }) {
  return (
    <h1 className="font-display text-4xl leading-tight text-stone-900">
      {children}
    </h1>
  );
}

export function EH2({ children }) {
  return <h2 className="font-display text-2xl mt-8 mb-3 text-stone-900">{children}</h2>;
}

export function EP({ children, dim }) {
  return (
    <p className={`mt-3 text-[15px] leading-relaxed ${dim ? "text-stone-500" : "text-stone-700"}`}>
      {children}
    </p>
  );
}

export function EButton({ href = "#", children, testId, tone = "terra" }) {
  const bg = tone === "dark" ? "bg-stone-900 hover:bg-stone-800" : "bg-[#D95D39] hover:bg-[#C05030]";
  return (
    <a
      href={href}
      data-testid={testId}
      className={`inline-flex items-center justify-center gap-2 rounded-full ${bg} text-white px-6 py-3.5 text-sm font-semibold mt-6 transition-colors`}
    >
      {children}
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

export function EDetailCard({ title, children }) {
  return (
    <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
      {title && (
        <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500 font-semibold mb-3">
          {title}
        </p>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function ERow({ label, value, tone }) {
  const c = tone === "emerald" ? "text-emerald-700" : tone === "red" ? "text-red-600" : "text-stone-900";
  return (
    <div className="flex items-baseline justify-between text-sm gap-4">
      <span className="text-stone-500">{label}</span>
      <span className={`font-semibold text-right tabular-nums ${c}`}>{value}</span>
    </div>
  );
}

export function EDivider() {
  return <div className="my-6 h-px bg-stone-200" />;
}

export function ESignoff({ author = "The RouteMe team" }) {
  return (
    <p className="mt-8 text-[15px] text-stone-700 leading-relaxed">
      With care,<br />
      <span className="italic font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
        {author}
      </span>
    </p>
  );
}
