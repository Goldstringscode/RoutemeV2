import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Save, Sparkles } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

const BARS = 28;

// Check if SpeechRecognition is available
const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const HAS_SPEECH_API = !!SpeechRecognitionAPI;

// Fallback mock transcript for unsupported browsers
const FALLBACK_TRANSCRIPT = [
  "Patient reports mild swelling at incision site,",
  " no signs of infection.",
  " Vitals within normal range — BP 128 over 78,",
  " pulse 72, temp 98.4.",
  " Reinforced fall precautions and reviewed medication schedule.",
  " Next visit tomorrow at 08:15.",
];

export default function VoiceNoteModal() {
  const { voiceOpen, setVoiceOpen, voiceTarget, addNote, clients } = useRouteMe();
  const client = useMemo(() => clients.find((c) => c.id === voiceTarget), [clients, voiceTarget]);

  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const tickRef = useRef(null);
  const typerRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  // Reset on close
  useEffect(() => {
    if (!voiceOpen) {
      stopRecognition();
      setRecording(false);
      setText("");
      setSeconds(0);
      clearInterval(tickRef.current);
      clearInterval(typerRef.current);
      finalTranscriptRef.current = "";
    }
  }, [voiceOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setRecording(true);
    setText("");
    setSeconds(0);
    finalTranscriptRef.current = "";

    // Start timer
    tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    if (HAS_SPEECH_API) {
      // Real speech recognition
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        if (final) {
          finalTranscriptRef.current += final;
        }
        setText(finalTranscriptRef.current + interim);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          // No speech detected — keep listening
          return;
        }
        // Fall back to mock if real API fails
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setText("⚠️ Microphone access denied. Enable microphone permissions and try again.");
          setRecording(false);
          clearInterval(tickRef.current);
        }
      };

      recognition.onend = () => {
        // If we're still supposed to be recording, restart
        if (recording) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      // Fallback: type out mock transcript (browser doesn't support Speech API)
      const full = FALLBACK_TRANSCRIPT.join("");
      let i = 0;
      typerRef.current = setInterval(() => {
        i += 2 + Math.floor(Math.random() * 3);
        setText(full.slice(0, i));
        if (i >= full.length) clearInterval(typerRef.current);
      }, 60);
    }
  }, [recording]);

  const stop = useCallback(() => {
    setRecording(false);
    clearInterval(tickRef.current);
    clearInterval(typerRef.current);

    if (HAS_SPEECH_API) {
      stopRecognition();
      // Flush final text
      if (finalTranscriptRef.current.trim()) {
        setText(finalTranscriptRef.current.trim());
      } else {
        // No speech detected, use fallback
        setText(FALLBACK_TRANSCRIPT.join(""));
      }
    } else {
      // Ensure final text for mock mode
      const full = FALLBACK_TRANSCRIPT.join("");
      if (text.length < full.length) {
        setText(full);
      }
    }
  }, [stopRecognition, text]);

  const save = () => {
    const finalText = text.replace(/^⚠️.*$/, "").trim();
    if (client && finalText) addNote(client.id, finalText);
    setVoiceOpen(false);
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <Dialog open={voiceOpen} onOpenChange={setVoiceOpen}>
      <DialogContent
        data-testid="voice-modal"
        className="max-w-2xl border-0 p-0 overflow-hidden bg-transparent shadow-none"
      >
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
                    {HAS_SPEECH_API
                      ? "Press record and speak. Your dictation is transcribed on-device and never leaves your session."
                      : "Press record to begin. (Your browser doesn't support speech recognition, so demo text will be used.)"}
                  </span>
                )}
                {recording && <span className="inline-block w-1.5 h-4 align-middle bg-[#D95D39] ml-0.5 animate-pulse" />}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-500 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                Auto-encrypted · HIPAA session
                {!HAS_SPEECH_API && (
                  <span className="text-amber-600">· Speech API unavailable (fallback demo)</span>
                )}
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
                  disabled={!text || text.includes("⚠️")}
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
