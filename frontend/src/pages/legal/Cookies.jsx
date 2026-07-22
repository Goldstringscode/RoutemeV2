import React from "react";
import DocLayout, { DocSection } from "@/components/DocLayout";

const TOC = [
  { id: "essential", label: "Essential cookies" },
  { id: "no-tracking", label: "No tracking" },
  { id: "control", label: "How to control" },
];

export default function CookiePolicy() {
  return (
    <DocLayout
      testId="cookies-page"
      kicker="Legal · Cookie Policy"
      title="Only the essentials."
      updated="February 1, 2026"
      tocItems={TOC}
    >
      <p>RouteMe uses cookies sparingly. Unlike most SaaS products, we do <strong>not</strong> use marketing, advertising, or third-party analytics cookies. Here&apos;s exactly what we do use.</p>

      <DocSection id="essential" title="1. Essential cookies">
        <table className="w-full text-sm border-collapse mt-4">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left py-2 px-3">Cookie</th>
              <th className="text-left py-2 px-3">Purpose</th>
              <th className="text-left py-2 px-3">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            <tr><td className="py-2 px-3 font-mono text-xs">rm_session</td><td className="py-2 px-3">Authentication</td><td className="py-2 px-3">On logout / 12h</td></tr>
            <tr><td className="py-2 px-3 font-mono text-xs">rm_csrf</td><td className="py-2 px-3">CSRF protection</td><td className="py-2 px-3">Session</td></tr>
            <tr><td className="py-2 px-3 font-mono text-xs">rm_prefs</td><td className="py-2 px-3">Locale, PHI masking toggle</td><td className="py-2 px-3">30 days</td></tr>
            <tr><td className="py-2 px-3 font-mono text-xs">rm_mfa_trust</td><td className="py-2 px-3">Skip MFA on trusted device</td><td className="py-2 px-3">30 days</td></tr>
          </tbody>
        </table>
      </DocSection>

      <DocSection id="no-tracking" title="2. No tracking, no ads, no analytics">
        <p>We do not use Google Analytics, Meta Pixel, Segment, Amplitude, Mixpanel, or any similar tool. We do not embed third-party scripts on authenticated pages. Product analytics (feature usage) are computed server-side, aggregated, and de-identified.</p>
      </DocSection>

      <DocSection id="control" title="3. How to control cookies">
        <p>You can block cookies in your browser, but doing so will prevent you from logging in. You can clear all RouteMe cookies from your account settings at any time — see <a href="/settings/data">Data & privacy</a>.</p>
      </DocSection>
    </DocLayout>
  );
}
