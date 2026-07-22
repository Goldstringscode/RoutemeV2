import React from "react";
import DocLayout, { DocSection } from "@/components/DocLayout";

const TOC = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "accounts", label: "Accounts & eligibility" },
  { id: "phi", label: "Protected Health Information" },
  { id: "subscriptions", label: "Subscriptions & billing" },
  { id: "acceptable", label: "Acceptable use" },
  { id: "ip", label: "Intellectual property" },
  { id: "termination", label: "Termination" },
  { id: "disclaimer", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "changes", label: "Changes to terms" },
  { id: "law", label: "Governing law" },
  { id: "contact", label: "Contact" },
];

export default function TermsOfService() {
  return (
    <DocLayout
      testId="terms-page"
      kicker="Legal · Terms of Service"
      title="The rules of the road."
      updated="February 1, 2026"
      tocItems={TOC}
    >
      <p><strong>These Terms of Service ("Terms")</strong> govern your access to and use of RouteMe, a HIPAA-aligned platform provided by RouteMe Inc. ("we", "us", or "our"). By creating an account, you agree to these Terms.</p>

      <DocSection id="acceptance" title="1. Acceptance of terms">
        <p>By accessing RouteMe you agree to be bound by these Terms and our <a href="/legal/privacy">Privacy Policy</a>. If you use RouteMe on behalf of an organization, you represent that you have authority to bind that organization.</p>
      </DocSection>

      <DocSection id="accounts" title="2. Accounts & eligibility">
        <p>You must be at least 18 years old and legally authorized to provide or manage home health services in your jurisdiction. You are responsible for maintaining the confidentiality of your credentials and MFA devices.</p>
        <ul>
          <li>One person per account — no shared logins.</li>
          <li>You must promptly notify us of unauthorized access at <a href="mailto:security@routeme.app">security@routeme.app</a>.</li>
          <li>Agency plans may add nurses and admins via secure invite links only.</li>
        </ul>
      </DocSection>

      <DocSection id="phi" title="3. Protected Health Information (PHI)">
        <p>You retain full ownership of any Protected Health Information ("PHI") you upload. RouteMe acts as a HIPAA Business Associate under our separate <a href="/legal/baa">Business Associate Agreement</a>. We will:</p>
        <ul>
          <li>Encrypt PHI at rest (AES-256) and in transit (TLS 1.3).</li>
          <li>Log every access to PHI in an immutable audit trail.</li>
          <li>Not disclose PHI except as permitted by the BAA or required by law.</li>
          <li>Return or destroy PHI upon account termination per the BAA.</li>
        </ul>
      </DocSection>

      <DocSection id="subscriptions" title="4. Subscriptions & billing">
        <p>Paid plans auto-renew until canceled. You can cancel from your account settings; access continues through the end of the paid period. Fees are non-refundable except within the 14-day money-back window on your initial payment.</p>
      </DocSection>

      <DocSection id="acceptable" title="5. Acceptable use">
        <p>You will not: (a) upload malware, (b) attempt to reverse-engineer or bypass access controls, (c) use RouteMe to harass or discriminate against patients or nurses, (d) send PHI over channels not designed for it (email, SMS, plain phone messages), or (e) violate any applicable law including HIPAA, GDPR, or state privacy laws.</p>
      </DocSection>

      <DocSection id="ip" title="6. Intellectual property">
        <p>RouteMe and its underlying software are our intellectual property. You retain rights to your own content and PHI. We grant you a limited, non-transferable license to use RouteMe during your active subscription.</p>
      </DocSection>

      <DocSection id="termination" title="7. Termination">
        <p>Either party may terminate for convenience with 30 days notice, or for cause immediately upon material breach. Upon termination we will provide a 30-day PHI export window before deletion, per our BAA obligations.</p>
      </DocSection>

      <DocSection id="disclaimer" title="8. Disclaimers">
        <p>RouteMe is provided "as is". We are a software platform — <strong>we do not provide medical advice or clinical decision-making</strong>. Nurses and directors remain solely responsible for clinical judgment, licensure, and patient safety.</p>
      </DocSection>

      <DocSection id="liability" title="9. Limitation of liability">
        <p>To the maximum extent permitted by law, our aggregate liability under these Terms is limited to the amount you paid us in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.</p>
      </DocSection>

      <DocSection id="changes" title="10. Changes to these Terms">
        <p>We may update these Terms. Material changes will be announced via email and an in-app banner at least 30 days before taking effect. Continued use after that date constitutes acceptance.</p>
      </DocSection>

      <DocSection id="law" title="11. Governing law">
        <p>These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles. Disputes will be resolved in the state and federal courts located in Travis County, Texas.</p>
      </DocSection>

      <DocSection id="contact" title="12. Contact">
        <p>Questions about these Terms? Email <a href="mailto:legal@routeme.app">legal@routeme.app</a> or write to RouteMe Inc., 1204 Congress Ave, Austin, TX 78701, USA.</p>
      </DocSection>
    </DocLayout>
  );
}
