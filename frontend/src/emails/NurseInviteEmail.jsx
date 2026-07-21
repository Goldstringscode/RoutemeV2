import React from "react";
import EmailShell, { EKicker, EH1, EP, EButton, EDivider, ESignoff } from "./EmailShell";

export default function NurseInviteEmail({
  nurseName = "Amara Okafor",
  inviterName = "Priya Nair",
  agencyName = "Sunrise Home Health",
  role = "Registered Nurse",
  zone = "Zone 3 · Austin",
  expiresIn = "72 hours",
}) {
  return (
    <EmailShell
      preheader={`${inviterName} invited you to join ${agencyName} on RouteMe — link expires in ${expiresIn}.`}
      accent="#7FA08B"
      category="account emails"
    >
      <EKicker tone="sage">You&apos;re invited</EKicker>
      <EH1>
        Welcome to <span className="font-serif italic text-[#7FA08B]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {agencyName}
        </span>.
      </EH1>
      <EP>
        <strong className="text-stone-900">{inviterName}</strong> invited you to join {agencyName} on RouteMe as{" "}
        <strong className="text-stone-900">{role}</strong>, {zone}. Accept the invite and you&apos;ll be up and running with your route, your clients, and your voice notes — all in about 3 minutes.
      </EP>

      <EButton href="#" testId="invite-accept">
        Accept invite & set password
      </EButton>

      <p className="mt-2 text-xs text-stone-500">Invite expires in {expiresIn}.</p>

      <div className="mt-8 rounded-2xl bg-[#EFEDE8] p-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500 font-semibold mb-3">
          What you&apos;ll get on day one
        </p>
        <ul className="space-y-2.5">
          {[
            "Tomorrow's optimized route — every stop, in the right order",
            "One-tap voice-to-text notes (transcribed in under 2 seconds)",
            "Care flags that keep gate codes, allergies, pets in view",
            "Your own HIPAA audit trail — signed with your license #",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
              <span className="text-[#7FA08B] shrink-0 mt-1">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <EDivider />
      <EP dim>
        Not <strong className="text-stone-700">{nurseName}</strong>, or think this was sent by mistake? Just ignore it —
        the invite expires automatically and no account will be created without your explicit confirmation.
      </EP>

      <ESignoff author={`${inviterName} & the RouteMe team`} />
    </EmailShell>
  );
}
