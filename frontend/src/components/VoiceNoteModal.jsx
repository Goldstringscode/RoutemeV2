import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Mic, Square, Save, Sparkles } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import { MOCK_TRANSCRIPT } from "@/lib/mockData";

const BARS = 28;

export default function VoiceNoteModal() {
  const { voiceOpen, setVoiceOpen, voiceTarget, addNote, clients } = useRouteMe();
  const client = useMemo(() => clients.find((c) => c.id === voiceTarget), [clients, voiceTarget]);

  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const tickRef = useRef(null);
  const typerRef = useRef(null);

  useEffect(() => {
    if (!voiceOpen) {
      setRecording(false);
      setText("");
      setSeconds(0);
      clearInterval(tickRef.current);
      clearInterval(typerRef.current);
    }
  }, [voiceOpen]);

  const start = () => {
    setRecording(true);
    setText("");
    setSeconds(0);
    tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    // Mock streaming transcription
    const full = MOCK_TRANSCRIPT.join("");
    let i = 0;
    typerRef.current = setInterval(() => {
      i += 2 + Math.floor(Math.random() * 3);
      setText(full.slice(0, i));
      if (i >= full.length) clearInterval(typerRef.current);
    }, 60);
  };

  const stop = () => {
    setRecording(false);
    clearInterval(tickRef.current);
    clearInterval(typerRef.current);
    // Ensure final text
    if (text.length < MOCK_TRANSCRIPT.join("").length) {
      setText(MOCK_TRANSCRIPT.join(""));
    }
  };

  const save = () => {
    if (client && text.trim()) addNote(client.id, text.trim());
    setVoiceOpen(false);
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
      <DialogContent
        data-testid="voice-modal"
        className="max-w-2xl border-0 p-0 overflow-hidden bg-transparent shadow-none"
      >
        <VisuallyHidden>
          <DialogTitle>Voice note</DialogTitle>
          <DialogDescription>Record a HIPAA-safe visit note using voice-to-text.</DialogDescription>
        </VisuallyHidden>
        <div className="relative rounded-3xl border border-stone-200 bg-white/95 backdrop-blur-xl overflow-hidden">
          {/* Terracotta accent band */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#D95D39]/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-[#7FA08B]/15 blur-3xl" />

          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">
                  Voice-to-text · Visit note
                </p>
                <h3 className="font-display text-2xl mt-1">
                  {client ? client.fullName : "New visit note"}
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  {client ? client.condition : "PHI-safe · encrypted transcription"}
                </p>
              </div>
              <div className="text-right">
                <div className="font-display text-3xl tabular-nums">{mmss}</div>
                <div className="text-[10px] uppercase tracking-widest text-stone-400">
                  {recording ? "listening" : "ready"}
                </div>
              </div>
            </div>

            {/* Waveform */}
            <div className="flex items-end justify-center gap-1 h-24 mb-6">
              {Array.from({ length: BARS }).map((_, i) => (
                <span
                  key={i}
                  className={`rm-bar block w-1.5 rounded-full ${
                    recording ? "bg-[#D95D39]" : "bg-stone-200"
                  }`}
                  style={{
                    height: `${20 + ((i * 7) % 60)}%`,
                    animationDelay: `${(i % 8) * 0.09}s`,
                    animationPlayState: recording ? "running" : "paused",
                  }}
                />
              ))}
            </div>

            {/* Transcript */}
            <div className="rounded-2xl border border-stone-200 bg-[#F9F8F6] p-5 min-h-[120px] mb-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 mb-2">
                <Sparkles className="h-3 w-3" /> live transcript
              </div>
              <p
                data-testid="voice-transcript"
                className="text-[15px] leading-relaxed text-stone-800 min-h-[48px]"
              >
                {text || (
                  <span className="text-stone-400 italic">
                    Press record to begin. Your dictation is transcribed on-device and never leaves your session.
                  </span>
                )}
                {recording && <span className="inline-block w-1.5 h-4 align-middle bg-[#D95D39] ml-0.5 animate-pulse" />}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-500 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                Auto-encrypted · HIPAA session
              </p>

              <div className="flex items-center gap-3">
                {!recording ? (
                  <Button
                    data-testid="voice-record-btn"
                    onClick={start}
                    className="rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-11 px-5 gap-2"
                  >
                    <Mic className="h-4 w-4" /> Record
                  </Button>
                ) : (
                  <Button
                    data-testid="voice-stop-btn"
                    onClick={stop}
                    className="rounded-full bg-stone-900 hover:bg-stone-800 text-white h-11 px-5 gap-2"
                  >
                    <Square className="h-3.5 w-3.5" /> Stop
                  </Button>
                )}
                <Button
                  data-testid="voice-save-btn"
                  onClick={save}
                  disabled={!text}
                  variant="outline"
                  className="rounded-full h-11 px-5 gap-2 border-stone-300"
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
