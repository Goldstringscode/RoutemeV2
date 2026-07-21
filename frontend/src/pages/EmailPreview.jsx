import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Home,
  ArrowLeft,
  Sparkles,
  CreditCard,
  AlertOctagon,
  Newspaper,
  KeyRound,
  UserPlus,
  BadgeCheck,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";
import WelcomeEmail from "@/emails/WelcomeEmail";
import PaymentReceiptEmail from "@/emails/PaymentReceiptEmail";
import PaymentFailedEmail from "@/emails/PaymentFailedEmail";
import NewsletterEmail from "@/emails/NewsletterEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import NurseInviteEmail from "@/emails/NurseInviteEmail";
import LicenseExpiryEmail from "@/emails/LicenseExpiryEmail";
import HipaaWeeklyEmail from "@/emails/HipaaWeeklyEmail";

const TEMPLATES = [
  {
    id: "welcome",
    label: "Welcome + BAA",
    kicker: "Post-signup",
    subject: "Welcome to RouteMe — your Growth account is ready",
    from: "RouteMe <hello@routeme.app>",
    icon: Sparkles,
    Component: WelcomeEmail,
    props: { firstName: "Priya", tier: "Growth", email: "priya@sunrisehh.demo" },
  },
  {
    id: "receipt",
    label: "Payment receipt",
    kicker: "Monthly subscription",
    subject: "Your $325 RouteMe Growth receipt · inv_2601",
    from: "RouteMe billing <billing@routeme.app>",
    icon: CreditCard,
    Component: PaymentReceiptEmail,
    props: {},
  },
  {
    id: "failed",
    label: "Payment failed",
    kicker: "Oops — retry",
    subject: "Action needed: your RouteMe payment didn't go through",
    from: "RouteMe billing <billing@routeme.app>",
    icon: AlertOctagon,
    Component: PaymentFailedEmail,
    props: {},
  },
  {
    id: "newsletter",
    label: "The Route · newsletter",
    kicker: "Product updates",
    subject: "The Route · February — Command Center v2, faster voice notes",
    from: "RouteMe <team@routeme.app>",
    icon: Newspaper,
    Component: NewsletterEmail,
    props: {},
  },
  {
    id: "reset",
    label: "Password reset",
    kicker: "Security",
    subject: "Reset your RouteMe password (expires in 60 minutes)",
    from: "RouteMe security <security@routeme.app>",
    icon: KeyRound,
    Component: PasswordResetEmail,
    props: {},
  },
  {
    id: "invite",
    label: "Nurse invite",
    kicker: "Agency onboarding",
    subject: "Priya Nair invited you to join Sunrise Home Health on RouteMe",
    from: "Sunrise Home Health via RouteMe <invites@routeme.app>",
    icon: UserPlus,
    Component: NurseInviteEmail,
    props: {},
  },
  {
    id: "license",
    label: "License expiry",
    kicker: "Compliance nudge",
    subject: "Your NP #29118 expires in 12 days — quick renewal steps inside",
    from: "RouteMe compliance <compliance@routeme.app>",
    icon: BadgeCheck,
    Component: LicenseExpiryEmail,
    props: {},
  },
  {
    id: "hipaa-weekly",
    label: "HIPAA weekly digest",
    kicker: "For directors",
    subject: "Sunrise HH · 98% HIPAA score this week — 1 anomaly to review",
    from: "RouteMe compliance <compliance@routeme.app>",
    icon: ShieldCheck,
    Component: HipaaWeeklyEmail,
    props: {},
  },
];

export default function EmailPreview() {
  const [activeId, setActiveId] = useState(TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);
  const active = TEMPLATES.find((t) => t.id === activeId) ?? TEMPLATES[0];
  const Component = active.Component;

  const copySubject = () => {
    navigator.clipboard.writeText(active.subject);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          <div className="flex items-center gap-3">
            <HipaaBadge compact />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
              data-testid="email-preview-home"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
          <Mail className="h-3.5 w-3.5" /> Email templates · {TEMPLATES.length} in library
        </div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">
          Every email a RouteMe user could <span className="font-serif-i text-[#D95D39]">receive</span>.
        </h1>
        <p className="mt-2 text-stone-600 max-w-2xl">
          Same design language as the app · discreet unsubscribe on every send · no PHI in any email body, ever.
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-16 grid lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Templates</p>
            </div>
            <ul className="p-2 space-y-1">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                const active = t.id === activeId;
                return (
                  <li key={t.id}>
                    <button
                      data-testid={`email-tpl-${t.id}`}
                      onClick={() => setActiveId(t.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        active
                          ? "bg-stone-900 text-white"
                          : "hover:bg-stone-100 text-stone-700"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#F7E5DD]" : "text-[#D95D39]"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{t.label}</p>
                        <p className={`text-[10px] uppercase tracking-widest ${active ? "text-white/60" : "text-stone-500"}`}>
                          {t.kicker}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Preview */}
        <div className="lg:col-span-9">
          {/* Meta bar (like an inbox row) */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D95D39]" />
                  {active.kicker}
                </div>
                <p className="mt-1 font-display text-xl text-stone-900 truncate" data-testid="email-subject">
                  {active.subject}
                </p>
                <p className="text-xs text-stone-500 mt-1 truncate">
                  From: <span className="font-mono">{active.from}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copySubject}
                  data-testid="email-copy-subject"
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 px-3 py-1.5 text-xs font-semibold"
                >
                  {copied ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Subject line</>}
                </button>
                <span className="hidden md:inline text-[10px] uppercase tracking-widest text-emerald-700 bg-[#E3ECE5] border border-emerald-100 rounded-full px-2.5 py-1 font-semibold">
                  No PHI · Safe
                </span>
              </div>
            </div>
          </div>

          {/* Email canvas */}
          <div className="rounded-3xl border border-stone-200 overflow-hidden">
            <Component {...active.props} />
          </div>

          {/* Legal footer */}
          <p className="text-xs text-stone-500 mt-4 leading-relaxed">
            Every email includes a discreet unsubscribe + preferences link. Transactional emails (welcome, receipts,
            security, password resets) will continue to send even if a user opts out of marketing — per CAN-SPAM &
            HIPAA rules.
          </p>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 RouteMe · Built with care for traveling nurses.</p>
          <p>Prototype · email templates · not sent in this session</p>
        </div>
      </footer>
    </div>
  );
}
