import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, StickyNote, History, Plus, X, Calendar, Activity } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const VISIT_TYPES = [
  "Routine visit",
  "Wound care",
  "Medication review",
  "Vitals check",
  "Post-op check",
  "Chemo aftercare",
  "Memory care",
  "Other",
];
const NOTE_STATUSES = [
  "Completed",
  "Follow-up needed",
  "Escalated",
  "Information only",
];

export default function NoteModal() {
  const { voiceOpen, setVoiceOpen, voiceTarget, notes, addNote, clients, noteViewMode, setNoteViewMode } = useRouteMe();
  const client = useMemo(() => clients.find((c) => c.id === voiceTarget), [clients, voiceTarget]);
  const clientNotes = useMemo(() => (voiceTarget ? notes[voiceTarget] ?? [] : []), [notes, voiceTarget]);

  const [text, setText] = useState("");
  const [visitType, setVisitType] = useState("Routine visit");
  const [noteStatus, setNoteStatus] = useState("Completed");

  useEffect(() => {
    if (!voiceOpen) {
      setText("");
      setVisitType("Routine visit");
      setNoteStatus("Completed");
    }
  }, [voiceOpen]);

  const save = () => {
    const trimmed = text.trim();
    if (client && trimmed) {
      addNote(client.id, trimmed, visitType, noteStatus);
    }
    setVoiceOpen(false);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const statusBadge = (s) => {
    const styles = {
      Completed: "bg-[#E3ECE5] text-emerald-900 border-emerald-100",
      "Follow-up needed": "bg-amber-50 text-amber-800 border-amber-200",
      Escalated: "bg-[#F7E5DD] text-[#D95D39] border-[#F0D2C4]",
      "Information only": "bg-stone-100 text-stone-600 border-stone-200",
    };
    return styles[s] || styles["Completed"];
  };

  return (
    <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
      <DialogContent
        data-testid="note-modal"
        className="max-w-xl border-0 p-0 overflow-hidden bg-transparent shadow-none"
      >
        <div className="relative rounded-3xl border border-stone-200 bg-white/95 backdrop-blur-xl overflow-hidden">
          {/* Terracotta accent band */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#D95D39]/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-[#7FA08B]/15 blur-3xl" />

          <div className="relative p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">
                  {noteViewMode === "history" ? "Note history" : "Visit note"}
                </p>
                <h3 className="font-display text-2xl mt-1">
                  {client ? client.fullName : "Notes"}
                </h3>
                {client && (
                  <p className="text-sm text-stone-500 mt-1">{client.condition}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {clientNotes.length > 0 && (
                  <button
                    onClick={() => setNoteViewMode(noteViewMode === "compose" ? "history" : "compose")}
                    className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50"
                    title={noteViewMode === "compose" ? "View all notes" : "New note"}
                  >
                    {noteViewMode === "compose" ? (
                      <History className="h-4 w-4 text-stone-500" />
                    ) : (
                      <Plus className="h-4 w-4 text-stone-500" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {noteViewMode === "history" ? (
              /* === History View === */
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {clientNotes.length === 0 ? (
                  <p className="text-sm text-stone-500 italic py-8 text-center">No notes yet for this client.</p>
                ) : (
                  clientNotes.map((n) => (
                    <div key={n.id} className="rounded-2xl border border-stone-200 bg-[#F9F8F6] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" /> {formatDate(n.date)}
                        </span>
                        <div className="flex items-center gap-2">
                          {n.visitType && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-stone-200 bg-white text-stone-600">
                              {n.visitType}
                            </span>
                          )}
                          {n.status && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(n.status)}`}>
                              {n.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">{n.text}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* === Compose View === */
              <div className="space-y-4">
                {/* Notes textarea */}
                <div className="rounded-2xl border border-stone-200 bg-[#F9F8F6] p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 mb-2">
                    <StickyNote className="h-3 w-3" /> Visit notes
                  </div>
                  <textarea
                    data-testid="note-textarea"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your visit notes here, or use your phone's keyboard dictation..."
                    rows={5}
                    className="w-full bg-transparent border-0 p-0 text-sm text-stone-800 placeholder:text-stone-400 resize-none focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Visit type + Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-1.5 block">
                      <Activity className="h-3 w-3 inline mr-1" /> Visit type
                    </label>
                    <select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value)}
                      className="w-full h-10 rounded-xl border border-stone-200 bg-[#F9F8F6] px-3 text-sm focus:outline-none focus:border-stone-400"
                    >
                      {VISIT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-1.5 block">
                      Status
                    </label>
                    <select
                      value={noteStatus}
                      onChange={(e) => setNoteStatus(e.target.value)}
                      className="w-full h-10 rounded-xl border border-stone-200 bg-[#F9F8F6] px-3 text-sm focus:outline-none focus:border-stone-400"
                    >
                      {NOTE_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-stone-500 flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    PHI-safe · encrypted
                    {clientNotes.length > 0 && (
                      <button
                        onClick={() => setNoteViewMode("history")}
                        className="text-[#D95D39] hover:underline font-semibold"
                      >
                        {clientNotes.length} prior note{clientNotes.length === 1 ? "" : "s"}
                      </button>
                    )}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setVoiceOpen(false)}
                      variant="outline"
                      className="rounded-full h-11 px-5 border-stone-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      data-testid="note-save-btn"
                      onClick={save}
                      disabled={!text.trim()}
                      className="rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-11 px-5 gap-2"
                    >
                      <Save className="h-4 w-4" /> Save note
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
