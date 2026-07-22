import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Book, PlayCircle, ShieldCheck, Users, Map, CreditCard, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import HipaaBadge from "@/components/HipaaBadge";

const CATEGORIES = [
  { id: "getting-started", label: "Getting started", icon: Sparkles, color: "#D95D39", articles: 12 },
  { id: "routes", label: "Routes & optimization", icon: Map, color: "#7FA08B", articles: 18 },
  { id: "voice-notes", label: "Voice notes & PHI", icon: ShieldCheck, color: "#D95D39", articles: 9 },
  { id: "team", label: "Team & nurses", icon: Users, color: "#7FA08B", articles: 14 },
  { id: "billing", label: "Billing & plans", icon: CreditCard, color: "#D95D39", articles: 8 },
  { id: "security", label: "Security & HIPAA", icon: ShieldCheck, color: "#7FA08B", articles: 11 },
];

const ARTICLES = [
  { id: "a1", cat: "getting-started", title: "Your first route in under 2 minutes", updated: "Feb 12, 2026", minutes: 2 },
  { id: "a2", cat: "getting-started", title: "Inviting your first nurse (agency plan)", updated: "Feb 10, 2026", minutes: 3 },
  { id: "a3", cat: "getting-started", title: "Onboarding your first client", updated: "Feb 08, 2026", minutes: 4 },
  { id: "a4", cat: "routes", title: "How the route optimizer picks stops", updated: "Feb 11, 2026", minutes: 5 },
  { id: "a5", cat: "routes", title: "Reordering stops manually + saving the change", updated: "Feb 09, 2026", minutes: 3 },
  { id: "a6", cat: "routes", title: "Traffic-aware re-optimization (Beta)", updated: "Feb 07, 2026", minutes: 4 },
  { id: "a7", cat: "voice-notes", title: "Recording, editing, and locking a voice note", updated: "Feb 13, 2026", minutes: 3 },
  { id: "a8", cat: "voice-notes", title: "What NEVER to say aloud in a voice note (PHI hygiene)", updated: "Feb 06, 2026", minutes: 4 },
  { id: "a9", cat: "team", title: "Roles & permissions matrix", updated: "Feb 11, 2026", minutes: 5 },
  { id: "a10", cat: "team", title: "Suspending a nurse (with license expiry)", updated: "Feb 04, 2026", minutes: 3 },
  { id: "a11", cat: "billing", title: "Switching from monthly to annual (save 15%)", updated: "Feb 05, 2026", minutes: 2 },
  { id: "a12", cat: "billing", title: "Understanding your invoice", updated: "Feb 02, 2026", minutes: 4 },
  { id: "a13", cat: "security", title: "Enabling MFA (recommended)", updated: "Feb 10, 2026", minutes: 3 },
  { id: "a14", cat: "security", title: "Exporting the HIPAA audit log for regulators", updated: "Feb 09, 2026", minutes: 5 },
  { id: "a15", cat: "security", title: "Break-glass PHI access (super admin)", updated: "Feb 03, 2026", minutes: 4 },
];

export default function HelpCenter() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = useMemo(() => ARTICLES.filter((a) => {
    if (cat !== "all" && a.cat !== cat) return false;
    if (!q) return true;
    return a.title.toLowerCase().includes(q.toLowerCase());
  }), [q, cat]);

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
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
            <Link to="/" className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero + search */}
      <section className="mx-auto max-w-4xl px-6 lg:px-10 pt-16 lg:pt-24 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">Help center</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
          How can we <span className="font-serif-i text-[#D95D39]">help</span>?
        </h1>
        <p className="mt-4 text-stone-600">72 articles · updated weekly · avg 3-minute read.</p>

        <div className="mt-8 relative max-w-2xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            data-testid="help-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search — try 'voice notes' or 'MFA'"
            className="w-full h-14 rounded-full border border-stone-200 bg-white pl-14 pr-4 text-base outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setCat("all")}
            data-testid="help-cat-all"
            className={`rounded-2xl border p-4 text-left transition-colors ${
              cat === "all" ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 hover:border-stone-400"
            }`}
          >
            <div className="text-[10px] uppercase tracking-widest font-semibold opacity-70">All</div>
            <div className="font-display text-2xl mt-1">{ARTICLES.length}</div>
            <div className="text-xs opacity-70">articles</div>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              data-testid={`help-cat-${c.id}`}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                cat === c.id ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 hover:border-stone-400"
              }`}
            >
              <c.icon className="h-4 w-4" style={{ color: cat === c.id ? "white" : c.color }} />
              <div className="mt-3 text-sm font-semibold leading-tight">{c.label}</div>
              <div className="text-xs mt-1 opacity-70">{c.articles} articles</div>
            </button>
          ))}
        </div>
      </section>

      {/* Articles list */}
      <section className="mx-auto max-w-4xl px-6 lg:px-10 pb-16">
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
          {filtered.length} article{filtered.length === 1 ? "" : "s"} {cat !== "all" && `· ${CATEGORIES.find(c => c.id === cat)?.label}`}
        </p>
        <ul className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {filtered.map((a) => {
            const c = CATEGORIES.find((x) => x.id === a.cat);
            return (
              <li key={a.id}>
                <a href="#" data-testid={`help-article-${a.id}`} className="flex items-center gap-4 p-5 hover:bg-stone-50 transition-colors">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}15`, color: c.color }}>
                    <Book className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900 truncate">{a.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{c.label} · {a.minutes} min read · updated {a.updated}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-300" />
                </a>
              </li>
            );
          })}
          {filtered.length === 0 && <li className="p-8 text-center text-stone-400">No articles match. Try a different search.</li>}
        </ul>
      </section>

      {/* Still stuck strip */}
      <section className="mx-auto max-w-4xl px-6 lg:px-10 pb-16">
        <div className="rounded-2xl bg-stone-900 text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold mb-2">Still stuck?</p>
            <h3 className="font-display text-2xl">Talk to a real human in under 4 hours.</h3>
          </div>
          <Link to="/contact" data-testid="help-contact-btn" className="inline-flex items-center gap-2 rounded-full bg-white text-stone-900 px-5 py-3 text-sm font-semibold hover:bg-stone-100">
            <MessageCircle className="h-4 w-4" /> Contact support
          </Link>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 text-center text-xs text-stone-500">
          © 2026 RouteMe · Built with care for traveling nurses.
        </div>
      </footer>
    </div>
  );
}
