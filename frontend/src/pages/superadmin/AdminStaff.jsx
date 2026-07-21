import React, { useState } from "react";
import { Plus, Trash2, KeyRound, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ROLE_STYLES = {
  Owner: "bg-[#D95D39]/20 text-[#F7E5DD] border-[#D95D39]/40",
  Compliance: "bg-[#7FA08B]/20 text-[#a8c4b1] border-[#7FA08B]/40",
  Support: "bg-blue-400/10 text-blue-300 border-blue-400/30",
  "Read-only": "bg-white/10 text-white/70 border-white/20",
};

const PERMISSIONS = {
  Owner: ["Full platform access", "Impersonate anyone", "Suspend agencies", "Reveal PHI (audited)", "Kill switch"],
  Compliance: ["Audit log export", "PHI reveal (audited)", "Force logout", "MFA reset"],
  Support: ["View agencies", "Impersonate directors", "Reset MFA", "Route incidents"],
  "Read-only": ["View dashboards only"],
};

export default function SuperAdminStaff() {
  const { superAdmins, addSuperAdmin, removeSuperAdmin } = useRouteMe();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Support" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    addSuperAdmin(form);
    setForm({ name: "", email: "", role: "Support" });
    setAddOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">Admin staff</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-white">
            The <span className="font-serif-i text-[#D95D39]">operators</span> behind the platform.
          </h1>
          <p className="mt-2 text-white/60">
            {superAdmins.length} staff · {superAdmins.filter(s => s.mfaEnabled).length} with MFA enrolled.
          </p>
        </div>
        <button
          data-testid="sa-add-staff"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-3 text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" /> Invite staff
        </button>
      </div>

      {/* Roles legend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {Object.entries(PERMISSIONS).map(([role, perms]) => (
          <div key={role} className="rounded-2xl border border-white/10 bg-stone-900/60 p-4">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${ROLE_STYLES[role]}`}>
              {role}
            </span>
            <ul className="mt-3 space-y-1">
              {perms.map((p) => (
                <li key={p} className="text-xs text-white/60 flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-white/40" /> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 font-semibold bg-black/30 border-b border-white/10">
              <th className="py-3 px-5">Staff</th>
              <th className="py-3 px-5">Role</th>
              <th className="py-3 px-5">MFA</th>
              <th className="py-3 px-5">Last active</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {superAdmins.map((s) => (
              <tr key={s.id} data-testid={`sa-staff-row-${s.id}`} className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#D95D39] to-[#8a3a24] text-white flex items-center justify-center text-xs font-semibold">
                      {s.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{s.name}</p>
                      <p className="text-xs text-white/50">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${ROLE_STYLES[s.role]}`}>
                    {s.role}
                  </span>
                </td>
                <td className="py-4 px-5">
                  {s.mfaEnabled ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Enrolled</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-300 text-xs"><ShieldAlert className="h-3.5 w-3.5" /> Missing</span>
                  )}
                </td>
                <td className="py-4 px-5 text-white/60">{s.lastActive}</td>
                <td className="py-4 px-5">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold ${
                    s.status === "active" ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" : "bg-white/5 text-white/60 border-white/10"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-4 px-5 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      className="h-8 w-8 rounded-full hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center"
                      title="Reset MFA"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeSuperAdmin(s.id)}
                      data-testid={`sa-remove-staff-${s.id}`}
                      disabled={s.role === "Owner"}
                      className="h-8 w-8 rounded-full hover:bg-red-400/10 text-red-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                      title={s.role === "Owner" ? "Cannot remove Owner" : "Remove staff"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add staff dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none">
          <div className="rounded-2xl bg-stone-900 border border-white/10 p-6 text-white">
            <DialogTitle className="font-display text-2xl">Invite platform staff</DialogTitle>
            <DialogDescription className="text-white/60 text-sm mt-1">
              A secure invite link will be sent. They&apos;ll be required to enroll MFA before first sign-in.
            </DialogDescription>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <input
                data-testid="sa-staff-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="w-full h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D95D39]"
              />
              <input
                data-testid="sa-staff-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@routeme.platform"
                className="w-full h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#D95D39]"
              />
              <select
                data-testid="sa-staff-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              >
                <option>Support</option>
                <option>Compliance</option>
                <option>Read-only</option>
                <option>Owner</option>
              </select>
              <button
                data-testid="sa-staff-submit"
                type="submit"
                className="w-full h-11 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white text-sm font-semibold"
              >
                Send invite
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
