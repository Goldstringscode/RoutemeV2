import React from "react";
import EmailShell, { EKicker, EH1, EP, EButton, EDivider, ESignoff } from "./EmailShell";

const UPDATES = [
  {
    tag: "New",
    title: "Live Command Center map — v2",
    body: "Now with real-time nurse ETAs powered by traffic data, plus a new ‘reassign visit’ shortcut you can trigger straight from a pin.",
    href: "#",
    accent: "#D95D39",
  },
  {
    tag: "Improved",
    title: "Voice notes are 40% faster",
    body: "We updated the notes interface for faster entry — quicker typing, instant save.",
    href: "#",
    accent: "#7FA08B",
  },
  {
    tag: "New",
    title: "Weekly HIPAA digest",
    body: "A single email every Monday summarizing your agency&apos;s audit posture — access anomalies, license expiries, MFA coverage.",
    href: "#",
    accent: "#D95D39",
  },
];

export default function NewsletterEmail({ firstName = "Priya", month = "February 2026" }) {
  return (
    <EmailShell
      preheader={`RouteMe · What's new in ${month} — 3 updates you asked for, and one field story.`}
      category="product updates"
    >
      <EKicker>The Route · {month}</EKicker>
      <EH1>
        What&apos;s new, <span className="font-serif italic text-[#D95D39]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {firstName}
        </span>.
      </EH1>
      <EP>
        A short letter every month. Three product updates, one field story from a nurse who uses RouteMe every day, and zero fluff. Read time: 90 seconds.
      </EP>

      {/* Updates */}
      <div className="mt-8 space-y-4">
        {UPDATES.map((u) => (
          <a
            key={u.title}
            href={u.href}
            className="block rounded-2xl border border-stone-200 hover:border-stone-400 bg-white p-5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold"
                style={{ background: `${u.accent}15`, color: u.accent }}
              >
                {u.tag}
              </span>
              <span className="text-[11px] text-stone-400">2 min read</span>
            </div>
            <h3 className="font-display text-xl mt-2 leading-tight text-stone-900">{u.title}</h3>
            <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{u.body}</p>
            <p className="mt-3 text-xs font-semibold" style={{ color: u.accent }}>
              Read the full story →
            </p>
          </a>
        ))}
      </div>

      {/* Field story */}
      <div className="mt-8 rounded-2xl bg-stone-900 text-white p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[#D95D39]/40 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-semibold">Field story</p>
          <h3 className="font-display text-2xl mt-2 leading-tight">
            &ldquo;I got 40 minutes of my day back — every day.&rdquo;
          </h3>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Amara Okafor, RN, sees 7 clients a day across Austin&apos;s east side. Her route used to be a paper map and a prayer. Now it&apos;s a swipe.
          </p>
          <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F7E5DD] hover:text-white">
            Read Amara&apos;s story →
          </a>
        </div>
      </div>

      <EButton href="/pricing" testId="newsletter-cta" tone="dark">
        See what&apos;s new inside
      </EButton>

      <EDivider />
      <EP dim>
        We publish The Route once a month. Not spam. Not sales-heavy. If you&apos;d rather only get billing and account
        emails,{" "}
        <a href="#" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">
          update your preferences
        </a>{" "}
        anytime.
      </EP>

      <ESignoff />
    </EmailShell>
  );
}
