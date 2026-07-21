import React from "react";
import EmailShell, { EKicker, EH1, EP, EButton, EDivider, ESignoff } from "./EmailShell";

export default function PasswordResetEmail({
  firstName = "Priya",
  requestedFrom = "Chrome on macOS · Austin, TX",
  requestedAt = "Feb 14, 2026 · 10:42 AM CT",
  expiresIn = "60 minutes",
}) {
  return (
    <EmailShell
      preheader={`Password reset requested — this link expires in ${expiresIn}.`}
      category="security emails"
    >
      <EKicker>Security · password reset</EKicker>
      <EH1>
        Let&apos;s get you back <span className="font-serif italic text-[#D95D39]" style={{ fontFamily: "'Playfair Display', serif" }}>
          in
        </span>, {firstName}.
      </EH1>
      <EP>
        Someone (hopefully you) requested a password reset for your RouteMe account. Click the button below to set a new password — the link is single-use and expires in <strong className="text-stone-900">{expiresIn}</strong>.
      </EP>

      <EButton href="#" testId="reset-cta">
        Reset password
      </EButton>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500 font-semibold">Request details</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-stone-500">When</span>
            <span className="font-medium text-stone-900 tabular-nums text-right">{requestedAt}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-stone-500">Device</span>
            <span className="font-medium text-stone-900 text-right">{requestedFrom}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-l-4 border-amber-400 bg-amber-50 p-5">
        <p className="text-sm text-amber-900 font-semibold">Didn&apos;t request this?</p>
        <p className="mt-1 text-xs text-amber-800 leading-relaxed">
          Ignore this email — your password won&apos;t change. If you see repeated reset attempts, please{" "}
          <a href="mailto:security@routeme.app" className="underline underline-offset-2 decoration-amber-500 hover:text-amber-900">
            tell our security team
          </a>{" "}
          so we can investigate.
        </p>
      </div>

      <EDivider />
      <EP dim>
        As always, RouteMe will never ask for your password by email or phone. Your PHI stays encrypted regardless of who
        holds your credentials — MFA is our safety net.
      </EP>

      <ESignoff author="The RouteMe security team" />
    </EmailShell>
  );
}
