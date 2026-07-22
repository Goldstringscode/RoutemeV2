import React, { useState } from "react";
import { Plus, MoreHorizontal, Shield, ShieldCheck, ShieldAlert, KeyRound, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ROLES = {
  Director: { desc: "Full agency access", color: "bg-[#D95D39]/10 text-[#8a3a24] border-[#D95D39]/30" },
  Dispatcher: { desc: "Manage nurses, routes, and clients", color: "bg-blue-50 text-blue-800 border-blue-200" },
  Compliance: { desc: "Read-only + audit exports", color: "bg-[#7FA08B]/10 text-[#4a6f5c] border-[#7FA08B]/30" },
  Billing: { desc: "Invoices, payroll, subscription", color: "bg-amber-50 text-amber-800 border-amber-200" },
};

const TEAM_SEED = [
  { id: "t1", name: "Priya Nair", email: "priya@sunrisehh.demo", role: "Director", mfa: true, initials: "PN", lastActive: "just now" },
  { id: "t2", name: "Sam Ortiz", email: "sam@sunrisehh.demo", role: "Dispatcher", mfa: true, initials: "SO", lastActive: "2h ago" },
  { id: "t3", name: "Talia Reed, CCO", email: "talia@sunrisehh.demo", role: "Compliance", mfa: true, initials: "TR", lastActive: "yesterday" },
  { id: "t4", name: "Jordan Wells", email: "jordan@sunrisehh.demo", role: "Billing", mfa: false, initials: "JW", lastActive: "3 days ago" },
];

export default function Team() {
  const [team, setTeam] = useState(TEAM_SEED);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Dispatcher" });

  const invite = (e) => {
    e.preventDefault();
    const initials = form.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
    setTeam([{ id: `t${Date.now()}`, ...form, mfa: false, initials, lastActive: "invited" }, ...team]);
    setForm({ name: "", email: "", role: "Dispatcher" });
    setInviteOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Team & roles</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">Your <span className="font-serif-i text-[#D95D39]">operators</span>.</h1>
          <p className="mt-2 text-stone-600">{team.length} people · {team.filter(t => t.mfa).length} with MFA · roles enforce permissions.</p>
        </div>
        <button onClick={() => setInviteOpen(true)} data-testid="team-invite-btn" className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" /> Invite team member
        </button>
      </div>

      {/* Roles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {Object.entries(ROLES).map(([r, info]) => (
          <div key={r} className="rounded-2xl border border-stone-200 bg-white p-4">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${info.color}`}>{r}</span>
            <p className="mt-2 text-xs text-stone-600">{info.desc}</p>
            <p className="text-xs text-stone-400 mt-2 tabular-nums">{team.filter(t => t.role === r).length} member{team.filter(t => t.role === r).length === 1 ? "" : "s"}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 font-semibold border-b border-stone-100 bg-stone-50">
              <th className="py-3 px-6">Member</th><th className="py-3 px-6">Role</th><th className="py-3 px-6">MFA</th><th className="py-3 px-6">Active</th><th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {team.map((t) => (
              <tr key={t.id} data-testid={`team-row-${t.id}`} className="hover:bg-stone-50">
                <td className="py-3 px-6"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#D95D39] to-[#8a3a24] text-white text-xs font-semibold flex items-center justify-center">{t.initials}</div><div><p className="font-semibold">{t.name}</p><p className="text-xs text-stone-500">{t.email}</p></div></div></td>
                <td className="py-3 px-6"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${ROLES[t.role].color}`}>{t.role}</span></td>
                <td className="py-3 px-6">{t.mfa ? <ShieldCheck className="h-4 w-4 text-emerald-600 inline" /> : <ShieldAlert className="h-4 w-4 text-amber-500 inline" />}</td>
                <td className="py-3 px-6 text-xs text-stone-500">{t.lastActive}</td>
                <td className="py-3 px-6 text-right">
                  <button data-testid={`team-remove-${t.id}`} onClick={() => setTeam(team.filter(x => x.id !== t.id))} disabled={t.role === "Director"} className="h-8 w-8 rounded-full hover:bg-red-50 text-red-500 flex items-center justify-center ml-auto disabled:opacity-30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none">
          <div className="rounded-2xl bg-white p-6">
            <DialogTitle className="font-display text-2xl">Invite team member</DialogTitle>
            <DialogDescription className="text-stone-600 text-sm mt-1">They&apos;ll get a secure invite link and must enroll MFA before first sign-in.</DialogDescription>
            <form onSubmit={invite} className="mt-4 space-y-3" data-testid="team-invite-form">
              <input data-testid="team-invite-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full h-11 rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100" />
              <input data-testid="team-invite-email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@agency.com" className="w-full h-11 rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100" />
              <select data-testid="team-invite-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-11 rounded-xl border border-stone-200 px-3 text-sm outline-none">
                {Object.keys(ROLES).map(r => <option key={r}>{r}</option>)}
              </select>
              <button data-testid="team-invite-submit" type="submit" className="w-full h-11 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white text-sm font-semibold">Send invite</button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
