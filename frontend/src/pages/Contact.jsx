import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MessageCircle, ShieldCheck, Send, CheckCircle2 } from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";

const REASONS = [
  { id: "sales", label: "Talk to sales · new agency inquiry" },
  { id: "support", label: "Get help with my account" },
  { id: "billing", label: "Question about billing or invoicing" },
  { id: "security", label: "Report a security issue" },
  { id: "press", label: "Press / media inquiry" },
  { id: "other", label: "Something else" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", org: "", reason: "sales", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#F9F8F6]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-4 flex items-center justify-between">
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
            <Link to="/" className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
        {/* LEFT — copy + channels */}
        <div className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">Contact</p>
          <h1 className="mt-4 font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
            Real <span className="font-serif-i text-[#D95D39]">people</span>, real fast.
          </h1>
          <p className="mt-5 text-lg text-stone-600 leading-relaxed">
            A human on our team responds to every message within 4 business hours. No bots, no ticket queues. If it&apos;s urgent, use the phone line below.
          </p>

          <div className="mt-10 space-y-3">
            <Channel icon={Mail} title="Support email" body="hello@routeme.app" href="mailto:hello@routeme.app" testId="contact-email" />
            <Channel icon={Phone} title="Sales & partnerships" body="+1 (512) 555-ROUTE · Mon–Fri 8a–6p CT" href="tel:+15125557688" testId="contact-phone" />
            <Channel icon={MessageCircle} title="In-app chat" body="Fastest for logged-in users" href="/app" testId="contact-inapp" />
            <Channel icon={ShieldCheck} title="Security issues" body="security@routeme.app · PGP: 0xD95D3900" href="mailto:security@routeme.app" testId="contact-security" />
          </div>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">HQ</p>
            <p className="mt-2 text-sm text-stone-700">
              RouteMe Inc.<br/>
              1204 Congress Ave, Suite 300<br/>
              Austin, TX 78701, USA
            </p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="lg:col-span-7">
          {sent ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center" data-testid="contact-success">
              <div className="mx-auto h-16 w-16 rounded-full bg-[#E3ECE5] flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="font-display text-3xl mt-5">Message received.</h2>
              <p className="text-stone-600 mt-2">Thanks, {form.name.split(" ")[0]}. A human on our team will reply within 4 business hours to <span className="font-semibold text-stone-900">{form.email}</span>.</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 text-sm font-semibold">
                Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-3xl border border-stone-200 bg-white p-8" data-testid="contact-form">
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Send a message</p>
              <h2 className="font-display text-2xl mt-2 mb-6">Tell us what you need.</h2>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Your name" required>
                  <input
                    data-testid="contact-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
                  />
                </Field>
                <Field label="Your organization">
                  <input
                    data-testid="contact-org"
                    value={form.org}
                    onChange={(e) => setForm({ ...form, org: e.target.value })}
                    className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
                  />
                </Field>
              </div>

              <Field label="Work email" required className="mt-4">
                <input
                  data-testid="contact-email-input"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
                />
              </Field>

              <Field label="What can we help with?" required className="mt-4">
                <select
                  data-testid="contact-reason"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none"
                >
                  {REASONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </Field>

              <Field label="Your message" required className="mt-4" hint="Please do not include any Protected Health Information (PHI) — email is not a secure channel for PHI.">
                <textarea
                  data-testid="contact-message"
                  required
                  minLength={20}
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="What&apos;s on your mind? The more context you share, the faster we can help."
                  className="w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
                />
              </Field>

              <button
                type="submit"
                data-testid="contact-submit"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-12 text-sm font-semibold"
              >
                <Send className="h-4 w-4" /> Send message
              </button>

              <p className="mt-4 text-xs text-stone-500 text-center">
                By sending, you agree to our <Link to="/legal/privacy" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 text-center text-xs text-stone-500">
          © 2026 RouteMe · Built with care for traveling nurses.
        </div>
      </footer>
    </div>
  );
}

function Channel({ icon: Icon, title, body, href, testId }) {
  return (
    <a href={href} data-testid={testId} className="group flex items-start gap-4 rounded-2xl border border-stone-200 hover:border-stone-400 bg-white p-4 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] text-[#D95D39] group-hover:bg-[#D95D39] group-hover:text-white flex items-center justify-center transition-colors">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{title}</p>
        <p className="mt-1 text-sm text-stone-900 font-medium">{body}</p>
      </div>
    </a>
  );
}

function Field({ label, required, hint, className, children }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-stone-700 tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-[#D95D39]">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
    </div>
  );
}
