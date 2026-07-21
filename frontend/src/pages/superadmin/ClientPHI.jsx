import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, Phone, Mail, MapPin, Cake, Pill, AlertTriangle, HeartPulse, User } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function SuperAdminClientPHI() {
  const { id } = useParams();
  const { globalClients, agencies, globalNurses, phiRevealed, revealClientPHI, hideClientPHI } = useRouteMe();
  const client = globalClients.find((c) => c.id === id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!client) {
    return (
      <div className="max-w-3xl mx-auto text-white">
        <Link to="/superadmin/clients" className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> All clients
        </Link>
        <p className="mt-6">Client not found.</p>
      </div>
    );
  }

  const agency = agencies.find((a) => a.id === client.agencyId);
  const nurse = globalNurses.find((n) => n.id === client.nurseId);
  const revealed = phiRevealed[client.id];

  const mask = (val, len = 6) => "•".repeat(len);
  const maskName = (name) => {
    const parts = name.split(" ");
    return `${parts[0][0]}${"•".repeat(Math.max(3, parts[0].length - 1))} ${parts.slice(1).map(p => p[0] + ".").join(" ")}`;
  };

  const submitReveal = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    revealClientPHI(client.id, reason);
    setReason("");
    setDialogOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to="/superadmin/clients" className="text-sm text-white/60 hover:text-white inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>

      {/* Watermark ribbon */}
      <div className="rounded-2xl border border-[#D95D39]/30 bg-[#D95D39]/10 px-5 py-3 flex flex-wrap items-center gap-3 justify-between text-xs">
        <span className="flex items-center gap-2 text-[#F7E5DD] font-semibold uppercase tracking-widest">
          <ShieldCheck className="h-4 w-4" /> HIPAA · PHI form · view watermarked to your session
        </span>
        {revealed ? (
          <button
            onClick={() => hideClientPHI(client.id)}
            data-testid={`sa-phi-hide-${client.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 font-semibold"
          >
            <EyeOff className="h-3.5 w-3.5" /> Hide PHI
          </button>
        ) : (
          <button
            onClick={() => setDialogOpen(true)}
            data-testid={`sa-phi-reveal-${client.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-3 py-1.5 font-semibold"
          >
            <Eye className="h-3.5 w-3.5" /> Reveal PHI (requires reason)
          </button>
        )}
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 to-black p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#D95D39]/20 blur-3xl" />
        {revealed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] select-none">
            <span className="font-display text-white text-[10rem] rotate-[-24deg]">PHI</span>
          </div>
        )}
        <div className="relative flex flex-col md:flex-row md:items-end gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-[#D95D39]/20 border border-[#D95D39]/30 text-[#F7E5DD] font-display font-semibold flex items-center justify-center text-2xl">
              {client.fullName.split(" ").map(s => s[0]).join("").slice(0,2)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#D95D39] font-semibold">
                {client.mrn} · {client.sex} · DOB {revealed ? client.dob : "••••-••-••"}
              </p>
              <h1 className="font-display text-4xl md:text-5xl leading-tight text-white mt-1">
                {revealed ? client.fullName : maskName(client.fullName)}
              </h1>
              <p className="mt-2 text-white/60 flex flex-wrap items-center gap-3 text-sm">
                {agency ? (
                  <Link to={`/superadmin/agencies/${agency.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                    {agency.name}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7FA08B]/40 bg-[#7FA08B]/10 text-[#a8c4b1] px-2.5 py-0.5 text-xs font-semibold">
                    Independent client
                  </span>
                )}
                {nurse && (
                  <Link to={`/superadmin/nurses/${nurse.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-0.5 text-xs">
                    <User className="h-3 w-3" /> {nurse.name}
                  </Link>
                )}
                <span className="text-xs">Last visit · {client.lastVisit}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PHI form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section icon={User} title="Identity">
          <Row label="Full legal name" value={revealed ? client.fullName : maskName(client.fullName)} phi />
          <Row label="Date of birth" value={revealed ? client.dob : "••••-••-••"} phi icon={Cake} />
          <Row label="Sex" value={client.sex} />
          <Row label="MRN" value={client.mrn} />
          <Row label="SSN (last 4)" value={revealed ? `•••-••-${client.ssnLast4}` : "•••-••-••••"} phi />
        </Section>

        <Section icon={Phone} title="Contact">
          <Row label="Phone" value={revealed ? client.phone : mask("", 10)} phi icon={Phone} />
          <Row label="Email" value={revealed ? (client.email || "—") : "••••••@••••.com"} phi icon={Mail} />
          <Row label="Address" value={revealed ? client.address : "••••••••••••••••"} phi icon={MapPin} />
        </Section>

        <Section icon={ShieldCheck} title="Insurance">
          <Row label="Provider" value={revealed ? client.insurance.provider : "••••••••"} phi />
          <Row label="Policy #" value={revealed ? client.insurance.policyNo : "••••-••••-••••"} phi />
          <Row label="Group" value={revealed ? client.insurance.group : "•••••"} phi />
        </Section>

        <Section icon={AlertTriangle} title="Emergency contact">
          <Row label="Name" value={revealed ? client.emergencyContact.name : maskName(client.emergencyContact.name)} phi />
          <Row label="Relation" value={client.emergencyContact.relation} />
          <Row label="Phone" value={revealed ? client.emergencyContact.phone : mask("", 10)} phi />
        </Section>

        <Section icon={HeartPulse} title="Clinical">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {client.conditions.map((c) => (
                <span key={c} className="rounded-full border border-white/15 bg-white/5 text-white/80 text-xs px-3 py-1">
                  {revealed ? c : "•".repeat(c.length)}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {client.allergies.map((a) => (
                <span key={a} className="rounded-full border border-red-400/30 bg-red-400/10 text-red-200 text-xs px-3 py-1">
                  ⚠ {revealed ? a : "•".repeat(a.length)}
                </span>
              ))}
            </div>
          </div>
        </Section>

        <Section icon={Pill} title="Medications">
          <ul className="space-y-2">
            {client.medications.map((m, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                <Pill className="h-3.5 w-3.5 text-[#D95D39]" />
                <span>{revealed ? m : "•".repeat(m.length)}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-stone-900/60 p-6">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Care notes</p>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            {revealed ? client.notes : "•".repeat(client.notes.length)}
          </p>
        </div>
      </div>

      {/* Reveal reason dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none">
          <div className="rounded-2xl bg-stone-900 border border-white/10 p-6 text-white">
            <DialogTitle className="font-display text-2xl">Reveal PHI</DialogTitle>
            <DialogDescription className="text-white/60 text-sm mt-1">
              Under 45 CFR § 164.312, please state the operational reason for viewing this record. This will be immutably logged.
            </DialogDescription>
            <form onSubmit={submitReveal} className="mt-4 space-y-3">
              <textarea
                data-testid="sa-phi-reason"
                required
                minLength={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Investigating access anomaly reported by Compliance"
                className="w-full min-h-[100px] rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D95D39]"
              />
              <div className="flex items-center gap-2 text-[11px] text-white/40">
                <Lock className="h-3 w-3" /> Logged as {`{{sa_root}}`} · IP 10.0.14.22 · {new Date().toLocaleTimeString()}
              </div>
              <button
                data-testid="sa-phi-confirm"
                type="submit"
                className="w-full h-11 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white text-sm font-semibold"
              >
                Reveal & log access
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-stone-900/60 p-6">
      <div className="flex items-center gap-2 text-white/60">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] uppercase tracking-widest font-semibold">{title}</p>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value, phi, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/50 shrink-0 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
        {phi && <span className="text-[9px] uppercase tracking-widest text-[#D95D39] font-semibold">PHI</span>}
      </span>
      <span className="text-white font-medium text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}
