import React from "react";
import EmailShell, { EKicker, EH1, EP, EButton, EDivider, ESignoff } from "./EmailShell";

export default function HipaaWeeklyEmail({
  directorFirstName = "Priya",
  agencyName = "Sunrise Home Health",
  weekLabel = "Feb 8 – Feb 14, 2026",
  score = 98,
  visits = 214,
  audits = 812,
  mfaCoverage = 94,
  anomalies = 1,
  licenseExpiring = 2,
}) {
  return (
    <EmailShell
      preheader={`Your weekly HIPAA digest — ${score}% compliance score, ${audits} audit events, ${anomalies} anomaly to review.`}
      accent="#7FA08B"
      category="compliance digests"
    >
      <EKicker tone="sage">Weekly HIPAA digest · {weekLabel}</EKicker>
      <EH1>
        {agencyName} is at{" "}
        <span className="font-serif italic text-[#7FA08B]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {score}%
        </span>{" "}
        compliance, {directorFirstName}.
      </EH1>
      <EP>
        Here&apos;s the week in one screen. Anything that needs your attention is at the top — everything else is
        healthy and running.
      </EP>

      {/* Big number */}
      <div className="mt-8 rounded-2xl bg-stone-900 text-white p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-[#7FA08B]/40 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-semibold">
            HIPAA compliance score
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-6xl leading-none">{score}%</span>
            <span className="text-sm text-emerald-300">↑ 2 pts vs last week</span>
          </div>
          <p className="mt-2 text-xs text-white/60">across 12 nurses · {visits} visits · {audits} audit events</p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Kpi label="Visits completed" value={visits} sub="on-time rate 96%" />
        <Kpi label="Audit events" value={audits.toLocaleString()} sub="immutable · signed" />
        <Kpi label="MFA coverage" value={`${mfaCoverage}%`} sub="12/13 nurses" tone={mfaCoverage >= 90 ? "sage" : "amber"} />
        <Kpi label="Voice notes stored" value="147" sub="AES-256 · encrypted" />
      </div>

      {/* Attention */}
      {(anomalies > 0 || licenseExpiring > 0) && (
        <div className="mt-6 rounded-2xl border-l-4 border-amber-400 bg-amber-50 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-amber-800 font-semibold">
            Needs your attention · {anomalies + licenseExpiring} item{anomalies + licenseExpiring === 1 ? "" : "s"}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-stone-800">
            {anomalies > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-600 shrink-0 mt-1">●</span>
                <span>
                  <strong>{anomalies} PHI access anomaly</strong> — Hank Ellis viewed 8 records outside their zone on Feb 12. Review recommended.
                </span>
              </li>
            )}
            {licenseExpiring > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-600 shrink-0 mt-1">●</span>
                <span>
                  <strong>{licenseExpiring} licenses</strong> expire in the next 30 days (Ori L., Devi R.).
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      <EButton href="/agency/compliance" testId="digest-open-report" tone="dark">
        Open full compliance report
      </EButton>

      <EDivider />
      <EP dim>
        Prefer this digest daily, or want to add a compliance officer to the recipient list?{" "}
        <a href="#" className="underline underline-offset-2 decoration-stone-300 hover:text-stone-900">
          Adjust digest settings →
        </a>
      </EP>

      <ESignoff author="The RouteMe compliance engine" />
    </EmailShell>
  );
}

function Kpi({ label, value, sub, tone }) {
  const cls = tone === "sage" ? "bg-[#E3ECE5] border-emerald-100 text-emerald-900" :
    tone === "amber" ? "bg-amber-50 border-amber-100 text-amber-900" :
    "bg-white border-stone-200 text-stone-900";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</p>
      <p className="font-display text-3xl leading-none mt-1 tabular-nums">{value}</p>
      <p className="text-xs mt-2 opacity-70">{sub}</p>
    </div>
  );
}
