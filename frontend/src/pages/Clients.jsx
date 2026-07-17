import React, { useState } from "react";
import { Plus, Search, Phone, MapPin, Mic, X, StickyNote, Eye } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const emptyClient = {
  initials: "",
  fullName: "",
  dob: "",
  phone: "",
  address: "",
  window: "09:00 – 09:45",
  duration: 30,
  priority: "medium",
  flags: [],
  condition: "",
  lastVisit: "New client",
};

export default function Clients() {
  const { clients, addClient, notes, openVoice, setNoteViewMode, setVoiceOpen, setVoiceTarget } = useRouteMe();
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [flagInput, setFlagInput] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(q.toLowerCase()) ||
      c.address.toLowerCase().includes(q.toLowerCase())
  );

  const submit = (e) => {
    e.preventDefault();
    if (!form.fullName) return;
    const initials = form.fullName
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join(".")
      .toUpperCase() + ".";
    addClient({ ...form, initials });
    setForm(emptyClient);
    setAddOpen(false);
  };

  const addFlag = () => {
    if (!flagInput.trim()) return;
    setForm((f) => ({ ...f, flags: [...f.flags, flagInput.trim()] }));
    setFlagInput("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Client roster
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Every person, <span className="font-serif-i text-[#D95D39]">every context</span>.
          </h1>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          data-testid="add-client-btn"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 text-sm font-semibold transition-colors self-start"
        >
          <Plus className="h-4 w-4" /> Add client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          data-testid="client-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or address"
          className="w-full h-12 rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const noteCount = notes[c.id]?.length ?? 0;
          return (
            <article
              key={c.id}
              data-testid={`client-card-${c.id}`}
              className="rounded-3xl border border-stone-200 bg-white p-5 rm-lift"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#EFE9DF] border border-stone-200 text-stone-800 font-display font-semibold flex items-center justify-center">
                    {c.initials.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-display text-lg leading-tight">{c.fullName}</h3>
                    <p className="text-xs text-stone-500">{c.condition}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full border ${
                    c.priority === "high"
                      ? "bg-[#F7E5DD] text-[#D95D39] border-[#F0D2C4]"
                      : c.priority === "medium"
                        ? "bg-[#E3ECE5] text-emerald-900 border-emerald-100"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  {c.priority}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <p className="flex items-center gap-2 text-stone-700">
                  <Phone className="h-3.5 w-3.5 text-stone-400" /> {c.phone}
                </p>
                <p className="flex items-center gap-2 text-stone-700">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />{" "}
                  <span className="truncate">{c.address}</span>
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.flags.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F9F8F6] border border-stone-200 text-stone-600"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setVoiceTarget(c.id);
                                  setNoteViewMode("history");
                                  setVoiceOpen(true);
                                }}
                                className="text-xs text-stone-500 hover:text-[#D95D39] flex items-center gap-1 transition-colors"
                              >
                                <StickyNote className="h-3 w-3" /> {noteCount} note{noteCount === 1 ? "" : "s"}
                              </button>
                              <button
                                onClick={() => openVoice(c.id)}
                                data-testid={`client-voice-${c.id}`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                              >
                                <Mic className="h-3 w-3" /> New note
                              </button>
                            </div>

                            {noteCount > 0 && (
                              <div className="mt-3 rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                                    Latest note
                                  </p>
                                  <button
                                    onClick={() => {
                                      setVoiceTarget(c.id);
                                      setNoteViewMode("history");
                                      setVoiceOpen(true);
                                    }}
                                    className="text-[10px] font-semibold text-[#D95D39] hover:underline flex items-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" /> View all
                                  </button>
                                </div>
                                <p className="text-xs text-stone-700 line-clamp-2">
                                  {notes[c.id][0].text}
                                </p>
                              </div>
                            )}
            </article>
          );
        })}
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg border-0 p-0 overflow-hidden">
          <div className="bg-white rounded-2xl p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                  New client
                </p>
                <h3 className="font-display text-2xl">Add someone to your care.</h3>
              </div>
              <button onClick={() => setAddOpen(false)} className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <Field label="Full name">
                <input
                  data-testid="new-client-name"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="inp"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="inp" />
                </Field>
                <Field label="Time window">
                  <input value={form.window} onChange={(e) => setForm({ ...form, window: e.target.value })} className="inp" />
                </Field>
              </div>
              <Field label="Address">
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="inp" />
              </Field>
              <Field label="Condition / care focus">
                <input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="inp" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Duration (min)">
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: +e.target.value })}
                    className="inp"
                  />
                </Field>
                <Field label="Priority">
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="inp"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </Field>
              </div>

              <Field label="Care flags">
                <div className="flex gap-2">
                  <input
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    placeholder="e.g. Gate code #4821"
                    className="inp flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFlag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addFlag}
                    className="rounded-xl border border-stone-200 px-3 text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
                {form.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.flags.map((f) => (
                      <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-[#E3ECE5] text-emerald-900 border border-emerald-100">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              <button
                type="submit"
                data-testid="new-client-submit"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-12 text-sm font-semibold transition-colors"
              >
                Save client
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`.inp { width: 100%; height: 42px; border-radius: 12px; border: 1px solid #E7E5E4; background: #F9F8F6; padding: 0 14px; font-size: 14px; }
      .inp:focus { outline: none; border-color: #78716C; background: white; }`}</style>
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
