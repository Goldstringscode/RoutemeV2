import React from "react";
import DocLayout, { DocSection } from "@/components/DocLayout";
import { ShieldCheck, Lock, Server, KeyRound, ScrollText, Clock } from "lucide-react";

const TOC = [
  { id: "posture", label: "Security posture" },
  { id: "encryption", label: "Encryption" },
  { id: "access", label: "Access controls" },
  { id: "monitoring", label: "Monitoring & audit" },
  { id: "infra", label: "Infrastructure" },
  { id: "sdlc", label: "Secure SDLC" },
  { id: "compliance", label: "Compliance" },
  { id: "disclosure", label: "Responsible disclosure" },
];

export default function Security() {
  return (
    <DocLayout
      testId="security-page"
      kicker="Legal · Security"
      title="Built for the highest standard of care."
      updated="February 1, 2026"
      tocItems={TOC}
    >
      <div className="not-prose grid md:grid-cols-4 gap-3 my-8">
        {[
          { icon: Lock, label: "AES-256 at rest" },
          { icon: ShieldCheck, label: "TLS 1.3 in transit" },
          { icon: KeyRound, label: "MFA enforced" },
          { icon: ScrollText, label: "Immutable audit" },
        ].map(({ icon: I, label }) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#F7E5DD] text-[#D95D39] flex items-center justify-center">
              <I className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-stone-900">{label}</span>
          </div>
        ))}
      </div>

      <DocSection id="posture" title="Our posture">
        <p>RouteMe holds PHI to the same standard hospitals and clinical practices are held to — because that&apos;s exactly what it is. Security is not a feature at RouteMe. It is the product.</p>
      </DocSection>

      <DocSection id="encryption" title="Encryption">
        <p>All PHI is encrypted at rest using AES-256 with keys managed by our HIPAA-eligible cloud KMS. All data in transit uses TLS 1.3 with modern cipher suites (ECDHE-AES-GCM). Voice notes and file attachments are encrypted client-side before upload where possible.</p>
      </DocSection>

      <DocSection id="access" title="Access controls">
        <ul>
          <li><strong>MFA required</strong> for all admin, agency director, and super admin accounts. Optional (recommended) for nurses.</li>
          <li><strong>Role-based access</strong> at the API level — nurses cannot access records outside their assigned zone.</li>
          <li><strong>Least-privilege</strong> for RouteMe employees. Two staff members can view PHI (Compliance + Owner roles) and every access is logged, reason-required.</li>
          <li><strong>SSO / SAML</strong> for Scale & Enterprise plans.</li>
        </ul>
      </DocSection>

      <DocSection id="monitoring" title="Monitoring & audit">
        <p>Every PHI access — read, write, export, print — is logged with actor, resource, timestamp, IP, and reason. The audit log is append-only and cryptographically chained so tampering is detectable. Directors can export the log at any time; regulators can too.</p>
      </DocSection>

      <DocSection id="infra" title="Infrastructure">
        <p>Hosted on a HIPAA-eligible US cloud with signed BAAs. Multi-AZ deployment, 99.98% uptime SLA (target), automated backups every 6 hours with 30-day retention, encrypted with separate keys. Quarterly disaster-recovery drills.</p>
      </DocSection>

      <DocSection id="sdlc" title="Secure software development">
        <ul>
          <li>Peer code review for every production change.</li>
          <li>Automated dependency scanning (Dependabot + Snyk) and CVE alerts.</li>
          <li>Static + dynamic security testing in CI.</li>
          <li>Quarterly third-party penetration testing — reports available under NDA.</li>
          <li>Zero-trust internal network — no VPN backdoors.</li>
        </ul>
      </DocSection>

      <DocSection id="compliance" title="Compliance">
        <ul>
          <li><strong>HIPAA</strong> — full alignment with Privacy, Security, and Breach Notification Rules. BAA signed at account creation.</li>
          <li><strong>SOC 2 Type II</strong> — audit in progress, expected Q3 2026.</li>
          <li><strong>CCPA / CPRA</strong> — California resident rights supported.</li>
          <li><strong>Data residency</strong> — US-only for all storage & processing.</li>
        </ul>
      </DocSection>

      <DocSection id="disclosure" title="Responsible disclosure">
        <p>Found a security issue? We want to know. Email <a href="mailto:security@routeme.app">security@routeme.app</a> or use our PGP key (0xD95D3900). We commit to a first response within 24 hours and coordinated disclosure. We pay bounties for qualifying reports.</p>
      </DocSection>
    </DocLayout>
  );
}
