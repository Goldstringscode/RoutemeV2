import React from "react";
import DocLayout, { DocSection } from "@/components/DocLayout";

const TOC = [
  { id: "collect", label: "What we collect" },
  { id: "how", label: "How we use it" },
  { id: "phi", label: "PHI handling" },
  { id: "share", label: "How we share data" },
  { id: "rights", label: "Your rights" },
  { id: "retention", label: "Retention & deletion" },
  { id: "security", label: "Security" },
  { id: "cookies", label: "Cookies & tracking" },
  { id: "children", label: "Children's privacy" },
  { id: "contact", label: "Contact us" },
];

export default function PrivacyPolicy() {
  return (
    <DocLayout
      testId="privacy-page"
      kicker="Legal · Privacy Policy"
      title="What we collect, and what we don't."
      updated="February 1, 2026"
      tocItems={TOC}
    >
      <p>This Privacy Policy explains how RouteMe Inc. collects, uses, and protects your information. We are committed to the principle of <strong>collecting the minimum data required</strong> to make the product work — no behavioral advertising, no data brokers, ever.</p>

      <DocSection id="collect" title="1. What we collect">
        <h3>Account information</h3>
        <p>Name, email, phone, organization, role, license number & state, password (hashed with bcrypt).</p>
        <h3>Usage data</h3>
        <p>Pages visited, features used, device/browser type, IP address, session timestamps. Retained for 90 days.</p>
        <h3>Protected Health Information (PHI)</h3>
        <p>Client demographics, MRN, insurance, medications, allergies, care notes, visit records. <strong>PHI is governed by our <a href="/legal/baa">Business Associate Agreement</a></strong> — see Section 3.</p>
      </DocSection>

      <DocSection id="how" title="2. How we use it">
        <ul>
          <li>To operate RouteMe (routing, scheduling, notes, audit logs).</li>
          <li>To send transactional emails (receipts, security alerts, license reminders).</li>
          <li>To improve product performance — <strong>aggregated & de-identified only</strong>.</li>
          <li>To comply with legal obligations (HIPAA breach reporting, subpoenas).</li>
        </ul>
        <p><strong>We do not sell data.</strong> We do not use PHI to train AI models. We do not run behavioral ads.</p>
      </DocSection>

      <DocSection id="phi" title="3. PHI handling under HIPAA">
        <p>When you upload PHI, we act as a <em>HIPAA Business Associate</em> to you. Full obligations are in our <a href="/legal/baa">BAA</a>. Highlights:</p>
        <ul>
          <li>PHI is encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
          <li>Every PHI access is logged in an immutable audit trail with actor, resource, timestamp, and IP.</li>
          <li>PHI is stored in HIPAA-eligible US data centers.</li>
          <li>Sub-processors (e.g., our infrastructure provider) sign their own BAAs.</li>
        </ul>
      </DocSection>

      <DocSection id="share" title="4. How we share data">
        <p>We share data only with: (a) sub-processors who help us operate under written BAAs, (b) auditors and regulators when legally compelled, and (c) parties you explicitly authorize. Current sub-processors:</p>
        <ul>
          <li><strong>Hosting infrastructure</strong> — HIPAA-eligible cloud (US region only).</li>
          <li><strong>Stripe</strong> — payment processing (never receives PHI).</li>
          <li><strong>Resend</strong> — transactional email delivery (subject lines and metadata only, never PHI body).</li>
        </ul>
      </DocSection>

      <DocSection id="rights" title="5. Your rights">
        <p>You may request to <strong>access</strong>, <strong>correct</strong>, <strong>export</strong>, or <strong>delete</strong> your personal data. Nurse-employees should contact their agency; agency directors may email <a href="mailto:privacy@routeme.app">privacy@routeme.app</a>. We respond within 30 days.</p>
      </DocSection>

      <DocSection id="retention" title="6. Retention & deletion">
        <p>PHI is retained for as long as your subscription is active plus 6 years (per HIPAA minimum), unless you request earlier deletion. Non-PHI account data is deleted 90 days after account closure. See our <a href="/settings/data">Data & privacy</a> page for one-click export & delete tools.</p>
      </DocSection>

      <DocSection id="security" title="7. Security">
        <p>Overview at <a href="/legal/security">Security</a>. TL;DR: encryption at rest & in transit, MFA required for admins, immutable audit logs, quarterly penetration tests, SOC2 Type II in progress (Q3 2026).</p>
      </DocSection>

      <DocSection id="cookies" title="8. Cookies & tracking">
        <p>We use essential cookies for authentication and CSRF protection only. We do not use marketing or analytics cookies. Details in our <a href="/legal/cookies">Cookie Policy</a>.</p>
      </DocSection>

      <DocSection id="children" title="9. Children's privacy">
        <p>RouteMe is not directed to individuals under 18. We do not knowingly collect information from children. Pediatric PHI processed for legitimate home health care remains subject to HIPAA.</p>
      </DocSection>

      <DocSection id="contact" title="10. Contact us">
        <p>Privacy questions: <a href="mailto:privacy@routeme.app">privacy@routeme.app</a>. Data Protection Officer: <a href="mailto:dpo@routeme.app">dpo@routeme.app</a>.</p>
      </DocSection>
    </DocLayout>
  );
}
