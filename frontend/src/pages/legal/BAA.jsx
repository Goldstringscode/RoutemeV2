import React from "react";
import DocLayout, { DocSection } from "@/components/DocLayout";

const TOC = [
  { id: "definitions", label: "Definitions" },
  { id: "obligations", label: "Business Associate obligations" },
  { id: "subcontractors", label: "Subcontractors" },
  { id: "breach", label: "Breach notification" },
  { id: "termination", label: "Termination & data return" },
  { id: "governing", label: "Governing law" },
];

export default function BAA() {
  return (
    <DocLayout
      testId="baa-page"
      kicker="Legal · HIPAA Business Associate Agreement"
      title="The BAA between us."
      updated="February 1, 2026"
      tocItems={TOC}
    >
      <p>This Business Associate Agreement ("BAA") supplements our <a href="/legal/terms">Terms of Service</a> and applies whenever you upload Protected Health Information ("PHI") to RouteMe. It complies with 45 CFR §§ 160, 162, and 164 (the HIPAA Privacy, Security, and Breach Notification Rules).</p>

      <DocSection id="definitions" title="1. Definitions">
        <p><strong>"Covered Entity" (CE)</strong> means you or your agency, as defined at 45 CFR § 160.103.<br/>
        <strong>"Business Associate" (BA)</strong> means RouteMe Inc., providing services on behalf of the Covered Entity.<br/>
        <strong>"PHI"</strong> means Protected Health Information, as defined at 45 CFR § 160.103.<br/>
        All other capitalized terms have the meanings given by HIPAA.</p>
      </DocSection>

      <DocSection id="obligations" title="2. Business Associate obligations">
        <p>RouteMe agrees to:</p>
        <ol>
          <li><strong>Use PHI only</strong> for the services described in the Terms, or as Required by Law.</li>
          <li><strong>Implement safeguards</strong> — administrative, physical, and technical — to prevent unauthorized use or disclosure (§ 164.308, 310, 312). Specifically:
            <ul>
              <li>Encryption at rest (AES-256) and in transit (TLS 1.3).</li>
              <li>Access controls with MFA required for all administrator accounts.</li>
              <li>Immutable audit logs of every PHI access, retained for 6 years.</li>
              <li>Annual HIPAA training for all RouteMe personnel with PHI access.</li>
            </ul>
          </li>
          <li><strong>Report</strong> any Use or Disclosure not permitted, including Breaches of Unsecured PHI and Security Incidents, per Section 4.</li>
          <li><strong>Make PHI available</strong> to the Covered Entity to fulfill Individual access requests (§ 164.524) within 30 days.</li>
          <li><strong>Make amendments</strong> to PHI as directed by the Covered Entity (§ 164.526).</li>
          <li><strong>Provide accounting</strong> of Disclosures upon request (§ 164.528).</li>
          <li><strong>Make internal practices available</strong> to HHS if requested for compliance investigations.</li>
        </ol>
      </DocSection>

      <DocSection id="subcontractors" title="3. Subcontractors">
        <p>RouteMe will ensure that any subcontractor to which it provides PHI agrees in writing to the same restrictions and conditions applicable to RouteMe. Current subcontractors: our hosting provider (US-only, HIPAA-eligible), and encrypted backup storage. Payment processing (Stripe) and email delivery (Resend) do <strong>not</strong> receive PHI.</p>
      </DocSection>

      <DocSection id="breach" title="4. Breach notification">
        <p>Upon discovery of a Breach of Unsecured PHI, RouteMe will notify the Covered Entity <strong>without unreasonable delay and in no case later than 30 days</strong> after Discovery. The notification will include the identification of each Individual whose PHI was involved, a description of the incident, mitigation steps, and preventive measures.</p>
      </DocSection>

      <DocSection id="termination" title="5. Termination & data return">
        <p>Upon termination of the underlying Terms, RouteMe will, at the Covered Entity&apos;s option: (a) return all PHI in a mutually agreed format within 30 days, or (b) securely destroy the PHI and certify destruction in writing. Retention beyond this window will only occur if required by law, and the protections of this BAA will continue to apply.</p>
      </DocSection>

      <DocSection id="governing" title="6. Governing law">
        <p>This BAA is governed by the laws of the State of Texas and by HIPAA and its implementing regulations. In case of conflict, HIPAA controls.</p>
        <p>Executed electronically upon your acceptance during account creation. A countersigned copy is available on request from <a href="mailto:legal@routeme.app">legal@routeme.app</a>.</p>
      </DocSection>
    </DocLayout>
  );
}
