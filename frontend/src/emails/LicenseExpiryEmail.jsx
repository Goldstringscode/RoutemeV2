import React from "react";
import EmailShell, { EKicker, EH1, EP, EButton, EDetailCard, ERow, EDivider, ESignoff } from "./EmailShell";

export default function LicenseExpiryEmail({
  firstName = "Ori",
  licenseType = "NP #29118",
  licenseState = "WA",
  expiresOn = "February 28, 2026",
  daysUntilExpiry = 12,
}) {
  return (
    <EmailShell
      preheader={`Your ${licenseType} expires in ${daysUntilExpiry} days — renew now to stay HIPAA-compliant.`}
      accent="#D95D39"
      category="compliance alerts"
    >
      <EKicker tone="amber">Compliance · action required</EKicker>
      <EH1>
        {firstName}, your license expires in <span className="font-serif italic text-[#D95D39]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {daysUntilExpiry} days
        </span>.
      </EH1>
      <EP>
        A friendly heads-up: your <strong className="text-stone-900">{licenseType}</strong> ({licenseState}) is set to expire on{" "}
        <strong className="text-stone-900">{expiresOn}</strong>. To keep visiting clients under RouteMe&apos;s HIPAA umbrella, please renew and upload the new document before that date.
      </EP>

      {/* Countdown card */}
      <div className="mt-6 rounded-2xl bg-stone-900 text-white p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="relative flex items-end gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-semibold">Days remaining</p>
            <p className="font-display text-6xl leading-none mt-2">{daysUntilExpiry}</p>
          </div>
          <div className="flex-1 pb-1">
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${Math.min(100, (daysUntilExpiry / 90) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/60">
              Expires <span className="text-white font-medium">{expiresOn}</span>
            </p>
          </div>
        </div>
      </div>

      <EButton href="#" testId="license-upload">
        Upload renewed license
      </EButton>

      <EDetailCard title="What happens if you don&#39;t renew in time">
        <ERow label="Day of expiry" value="Route visits paused" tone="red" />
        <ERow label="+ 24 hours" value="Agency director notified" />
        <ERow label="+ 7 days" value="Nurse profile flagged for review" />
      </EDetailCard>

      <EDivider />
      <EP dim>
        We&apos;ll remind you again at 7 days and 3 days — but the sooner you upload, the fewer notifications. Renewal
        takes about 4 minutes, and RouteMe automatically detects state, license #, and expiry from the uploaded PDF.
      </EP>

      <ESignoff author="The RouteMe compliance team" />
    </EmailShell>
  );
}
