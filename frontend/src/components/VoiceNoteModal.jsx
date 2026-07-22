import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function VoiceNoteModal() {
  const { voiceOpen, setVoiceOpen, voiceTarget, addNote, clients } = useRouteMe();
  const client = clients.find((c) => c.id === voiceTarget) || null;
  const [text, setText] = useState("");

  const handleSave = () => {
    if (client && text.trim()) addNote(client.id, text.trim());
    setVoiceOpen(false);
    setText("");
  };

  const handleClose = () => {
    setVoiceOpen(false);
    setText("");
  };

  return (
    <Dialog open={voiceOpen} onOpenChange={handleClose}>
      <DialogContent
        data-testid="note-modal"
        className="max-w-2xl border-0 p-0 overflow-hidden bg-transparent shadow-none"
      >
        <VisuallyHidden>
          <DialogTitle>Visit note</DialogTitle>
          <DialogDescription>Write a visit note for this client.</DialogDescription>
        </VisuallyHidden>
        <div className="relative rounded-3xl border border-stone-200 bg-white/95 backdrop-blur-xl overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#D95D39]/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-[#7FA08B]/15 blur-3xl" />

          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">
                  Visit note
                </p>
                <h3 className="font-display text-2xl mt-1">
                  {client ? client.fullName : "New visit note"}
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  {client ? client.condition : "Write your observations below"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <FileText className="h-3.5 w-3.5" />
                {text ? `${text.length} chars` : "empty"}
              </div>
            </div>

            {/* Note text area */}
            <div className="rounded-2xl border border-stone-200 bg-[#F9F8F6] p-1 mb-6">
              <textarea
                data-testid="note-textarea"
                className="w-full min-h-[180px] p-4 text-[15px] leading-relaxed text-stone-800 bg-transparent border-none resize-y focus:outline-none placeholder:text-stone-400"
                placeholder="Type your visit notes here. Observations, vitals, care plan updates, or any follow-up items..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-500 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                Auto-encrypted · HIPAA session
              </p>

              <div className="flex items-center gap-3">
                <Button
                  data-testid="note-save-btn"
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-11 px-5 gap-2"
                >
                  <Save className="h-4 w-4" /> Save note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}