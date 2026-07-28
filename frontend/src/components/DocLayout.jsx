import React from "react";
import { Link } from "react-router-dom";
import HipaaBadge from "@/components/HipaaBadge";
import { ArrowLeft, Printer, Download } from "lucide-react";

// Shared chrome for all long-form legal & doc pages.
export default function DocLayout({ kicker, title, updated, tocItems = [], children, testId }) {
  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900" data-testid={testId}>
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

      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-14 lg:py-20">
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">{kicker}</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-[1.05] tracking-tight max-w-3xl">
          {title}
        </h1>
        {updated && (
          <p className="mt-4 text-sm text-stone-500">Last updated {updated}</p>
        )}
        <div className="mt-6 flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 hover:bg-stone-100 text-stone-700 px-3 py-1.5 text-xs font-semibold">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <a href="#" className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 hover:bg-stone-100 text-stone-700 px-3 py-1.5 text-xs font-semibold">
            <Download className="h-3.5 w-3.5" /> Download PDF
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 lg:px-10 pb-24 grid lg:grid-cols-12 gap-10">
        {tocItems.length > 0 && (
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-3">Contents</p>
              <ol className="space-y-1.5 text-sm">
                {tocItems.map((t, i) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-stone-600 hover:text-[#D95D39] block py-1 border-l-2 border-stone-100 hover:border-[#D95D39] pl-3">
                      <span className="text-stone-400 mr-2 tabular-nums">{String(i + 1).padStart(2, "0")}</span>{t.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        )}
        <article className={tocItems.length > 0 ? "lg:col-span-9" : "lg:col-span-12"}>
          <div className="prose prose-stone max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-p:text-stone-700 prose-p:leading-relaxed prose-a:text-[#D95D39] prose-a:no-underline hover:prose-a:underline prose-strong:text-stone-900 prose-li:text-stone-700">
            {children}
          </div>
        </article>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2026 RouteMe · Built with care for traveling nurses.</p>
          <div className="flex items-center gap-4">
            <Link to="/legal/terms" className="hover:text-stone-900">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-stone-900">Privacy</Link>
            <Link to="/legal/baa" className="hover:text-stone-900">BAA</Link>
            <Link to="/legal/security" className="hover:text-stone-900">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Section header component with anchor
export function DocSection({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
