import React, { useMemo, useState } from "react";
import { Plus, Search, Copy, Check, MoreHorizontal, X, Mail, MapPin } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const emptyForm = {
  name: "",
  email: "",
  zone: "Zone 3 · Austin Metro",
  role: "Registered Nurse",
};

const STATUS_STYLES = {
  active: "bg-[#E3ECE5] text-emerald-800 border-emerald-100",
  pending: "bg-[#F7E5DD] text-[#D95D39] border-[#F0D2C4]",
  inactive: "bg-stone-100 text-stone-500 border-stone-200",
};

export default function AgencyNurses() {
  const { nurses, inviteNurse, setNurseStatus, removeNurse } = useRouteMe();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [justCreated, setJustCreated] = useState(null);
  const [copied, setCopied] = useState(null);

  const filtered = useMemo(() => {
    return nurses.filter((n) => {
      if (filter !== "all" && n.status !== filter) return false;
      if (!q) return true;
      return (
        n.name.toLowerCase().includes(q.toLowerCase()) ||
        n.email.toLowerCase().includes(q.toLowerCase()) ||
        n.zone.toLowerCase().includes(q.toLowerCase())
      );
    });
  }, [nurses, q, filter]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    const nurse = inviteNurse(form);
    setJustCreated(nurse);
    setForm(emptyForm);
  };

  const inviteUrl = (nurse) => `https://routeme.app/invite/${nurse.inviteToken ?? nurse.id}`;

  const copyLink = (nurse) => {
    const url = inviteUrl(nurse);
    try {
      navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    setCopied(nurse.id);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Nurse roster
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Your <span className="font-serif-i text-[#D95D39]">field team</span>.
          </h1>
          <p className="mt-2 text-stone-600">
            Invite nurses, assign zones, and monitor licensing & activity — all in one place.
          </p>
        </div>
        <button
          data-testid="invite-nurse-btn"
          onClick={() => {
            setAddOpen(true);
            setJustCreated(null);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 text-sm font-semibold transition-colors self-start"
        >
          <Plus className="h-4 w-4" /> Invite nurse
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            data-testid="nurse-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, zone"
            className="w-full h-11 rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
          />
        </div>
        <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
          {["all", "active", "pending", "inactive"].map((f) => (
            <button
              key={f}
              data-testid={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {f}
              {f !== "all" && (
                <span className="ml-1 opacity-60">
                  · {nurses.filter((n) => n.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="hidden md:block rounded-3xl border border-stone-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 font-semibold bg-[#F9F8F6] border-b border-stone-200">
              <th className="py-3 px-5">Nurse</th>
              <th className="py-3 px-5">Zone</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Visits · today</th>
              <th className="py-3 px-5">Last active</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filtered.map((n) => (
              <tr key={n.id} data-testid={`nurse-row-${n.id}`} className="hover:bg-stone-50/50 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <NurseAvatar nurse={n} />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{n.name}</p>
                      <p className="text-xs text-stone-500 truncate">{n.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <div className="text-stone-700">{n.zone}</div>
                  <div className="text-xs text-stone-400">{n.role}</div>
                </td>
                <td className="py-4 px-5">
                  <Badge
                    variant="outline"
                    className={`capitalize font-semibold border ${STATUS_STYLES[n.status]}`}
                  >
                    {n.status}
                  </Badge>
                </td>
                <td className="py-4 px-5">
                  <div className="font-display text-lg tabular-nums">{n.visitsToday}</div>
                </td>
                <td className="py-4 px-5 text-stone-600">{n.lastActive}</td>
                <td className="py-4 px-5">
                  <div className="flex items-center justify-end gap-1">
                    {n.status === "pending" && (
                      <button
                        onClick={() => copyLink(n)}
                        data-testid={`copy-invite-${n.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200 hover:bg-stone-50 transition-colors"
                      >
                        {copied === n.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        {copied === n.id ? "Copied" : "Copy invite"}
                      </button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          data-testid={`nurse-menu-${n.id}`}
                          className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center"
                        >
                          <MoreHorizontal className="h-4 w-4 text-stone-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {n.status !== "active" && (
                          <DropdownMenuItem onClick={() => setNurseStatus(n.id, "active")}>
                            Activate
                          </DropdownMenuItem>
                        )}
                        {n.status === "active" && (
                          <DropdownMenuItem onClick={() => setNurseStatus(n.id, "inactive")}>
                            Deactivate
                          </DropdownMenuItem>
                        )}
                        {n.status === "pending" && (
                          <DropdownMenuItem onClick={() => copyLink(n)}>
                            Copy invite link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Send message</DropdownMenuItem>
                        <DropdownMenuItem>View visits</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          onClick={() => removeNurse(n.id)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="py-12 text-center text-stone-500">
                  No nurses match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((n) => (
          <div key={n.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <NurseAvatar nurse={n} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{n.name}</p>
                <p className="text-xs text-stone-500 truncate">{n.zone}</p>
              </div>
              <Badge variant="outline" className={`capitalize font-semibold border ${STATUS_STYLES[n.status]}`}>
                {n.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-stone-500">{n.visitsToday} visits today</span>
              <span className="text-stone-500">Last: {n.lastActive}</span>
            </div>
            {n.status === "pending" && (
              <button
                onClick={() => copyLink(n)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-full border border-stone-200"
              >
                {copied === n.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied === n.id ? "Copied" : "Copy invite link"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Invite dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md border-0 p-0 overflow-hidden">
          <div className="bg-white rounded-2xl p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                  Invite nurse
                </p>
                <h3 className="font-display text-2xl">Add someone to the team.</h3>
              </div>
              <button
                onClick={() => setAddOpen(false)}
                className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!justCreated ? (
              <form onSubmit={submit} className="space-y-3">
                <Field label="Full name">
                  <input
                    data-testid="invite-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rm-inp"
                    placeholder="e.g. Jordan Lee, RN"
                  />
                </Field>
                <Field label="Email">
                  <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-[#F9F8F6] px-3 h-11">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <input
                      data-testid="invite-email"
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="flex-1 bg-transparent text-sm outline-none"
                      placeholder="nurse@sunrisehh.demo"
                    />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Zone">
                    <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-[#F9F8F6] px-3 h-11">
                      <MapPin className="h-4 w-4 text-stone-400" />
                      <input
                        value={form.zone}
                        onChange={(e) => setForm({ ...form, zone: e.target.value })}
                        className="flex-1 bg-transparent text-sm outline-none"
                      />
                    </div>
                  </Field>
                  <Field label="Role">
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="rm-inp"
                    >
                      <option>Registered Nurse</option>
                      <option>Licensed Practical Nurse</option>
                      <option>Nurse Practitioner</option>
                    </select>
                  </Field>
                </div>

                <button
                  data-testid="invite-submit"
                  type="submit"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-11 text-sm font-semibold"
                >
                  <Mail className="h-4 w-4" /> Send invite
                </button>
                <p className="text-xs text-stone-500 text-center pt-1">
                  We&apos;ll create a pending seat and generate a secure invite link.
                </p>
              </form>
            ) : (
              <div>
                <div className="rounded-2xl bg-[#E3ECE5] border border-emerald-100 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 text-sm font-semibold">
                    <Check className="h-4 w-4" /> Invite sent to {justCreated.email}
                  </div>
                  <p className="text-xs text-emerald-900/80 mt-1">
                    Share this secure link with them. It expires in 7 days.
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-stone-200 bg-[#F9F8F6] p-3 flex items-center gap-2">
                  <code className="text-xs truncate flex-1 text-stone-700">
                    {inviteUrl(justCreated)}
                  </code>
                  <button
                    onClick={() => copyLink(justCreated)}
                    data-testid="invite-copy-link"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-900 text-white"
                  >
                    {copied === justCreated.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied === justCreated.id ? "Copied" : "Copy"}
                  </button>
                </div>

                <button
                  onClick={() => setAddOpen(false)}
                  className="mt-4 w-full inline-flex items-center justify-center rounded-full border border-stone-200 h-11 text-sm font-semibold hover:bg-stone-50"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`.rm-inp { width: 100%; height: 44px; border-radius: 12px; border: 1px solid #E7E5E4; background: #F9F8F6; padding: 0 14px; font-size: 14px; }
      .rm-inp:focus { outline: none; border-color: #78716C; background: white; }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-700 tracking-wide block mb-1">{label}</label>
      {children}
    </div>
  );
}

function NurseAvatar({ nurse }) {
  const initials = nurse.name
    .split(" ")
    .map((s) => s[0])
    .filter((c) => /[A-Z]/i.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (nurse.avatar) {
    return (
      <img
        src={nurse.avatar}
        alt=""
        className="h-9 w-9 rounded-full object-cover border border-stone-200 shrink-0"
      />
    );
  }
  return (
    <div className="h-9 w-9 rounded-full bg-[#EFE9DF] border border-stone-200 text-stone-800 flex items-center justify-center text-[11px] font-semibold shrink-0">
      {initials}
    </div>
  );
}
