import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Shuffle, ArrowRight, Check } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function ReassignDialog({ open, onOpenChange, fromNurseId }) {
  const { nurses, agencyClients, reassignClient } = useRouteMe();
  const fromNurse = nurses.find((n) => n.id === fromNurseId);
  const clientsForNurse = agencyClients.filter((c) => c.nurseId === fromNurseId);

  const [selectedClientId, setSelectedClientId] = useState(clientsForNurse[0]?.id ?? null);
  const [targetNurseId, setTargetNurseId] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setDone(false);
      setTargetNurseId("");
      setSelectedClientId(clientsForNurse[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fromNurseId]);

  const eligibleTargets = nurses.filter(
    (n) => n.status === "active" && n.id !== fromNurseId
  );
  const targetNurse = nurses.find((n) => n.id === targetNurseId);
  const selectedClient = clientsForNurse.find((c) => c.id === selectedClientId);

  const submit = () => {
    if (!selectedClientId || !targetNurseId) return;
    reassignClient(selectedClientId, targetNurseId);
    setDone(true);
    setTimeout(() => onOpenChange(false), 1400);
  };

  if (!fromNurse) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Reassign visit</DialogTitle>
          <DialogDescription>Move a client from one nurse&apos;s roster to another.</DialogDescription>
        </VisuallyHidden>
        <div className="bg-white rounded-2xl p-6 border border-stone-200">
          <div className="flex items-start gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-[#F7E5DD] border border-[#F0D2C4] text-[#D95D39] flex items-center justify-center">
              <Shuffle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Reassign visit
              </p>
              <h3 className="font-display text-2xl">
                Move a client off <span className="font-serif-i text-[#D95D39]">{fromNurse.name.split(",")[0]}</span>&apos;s day.
              </h3>
            </div>
          </div>

          {done ? (
            <div className="rounded-2xl bg-[#E3ECE5] border border-emerald-100 p-5 text-center">
              <div className="inline-flex h-10 w-10 rounded-full bg-emerald-100 items-center justify-center mb-3">
                <Check className="h-5 w-5 text-emerald-700" />
              </div>
              <p className="font-semibold text-emerald-900">
                {selectedClient?.name} reassigned to {targetNurse?.name.split(",")[0]}.
              </p>
              <p className="text-xs text-emerald-800/80 mt-1">
                Route will re-optimize on the next sync.
              </p>
            </div>
          ) : (
            <>
              {clientsForNurse.length === 0 ? (
                <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-5 text-center text-sm text-stone-500">
                  {fromNurse.name.split(",")[0]} has no assigned clients to reassign.
                </div>
              ) : (
                <>
                  {/* Client picker */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 tracking-wide block mb-2">
                      Which client?
                    </label>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {clientsForNurse.map((c) => {
                        const isSelected = c.id === selectedClientId;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setSelectedClientId(c.id)}
                            data-testid={`reassign-client-${c.id}`}
                            className={`w-full text-left flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                              isSelected
                                ? "bg-[#F7E5DD] border-[#F0D2C4]"
                                : "bg-white border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            <div className="h-8 w-8 rounded-lg bg-[#EFE9DF] border border-stone-200 text-stone-800 flex items-center justify-center text-[10px] font-semibold">
                              {c.name.split(" ").map((s) => s[0]).join(".")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate">{c.name}</p>
                              <p className="text-[11px] text-stone-500 truncate">{c.condition}</p>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-[#D95D39]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target nurse picker */}
                  <div className="mt-5">
                    <label className="text-xs font-semibold text-stone-700 tracking-wide block mb-2">
                      Reassign to
                    </label>
                    <select
                      data-testid="reassign-target"
                      value={targetNurseId}
                      onChange={(e) => setTargetNurseId(e.target.value)}
                      className="w-full h-11 rounded-xl border border-stone-200 bg-[#F9F8F6] px-3 text-sm outline-none focus:bg-white focus:border-stone-400"
                    >
                      <option value="">Select a nurse…</option>
                      {eligibleTargets.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} · {n.zone.split(" · ")[0]} · {n.visitsToday} visits today
                        </option>
                      ))}
                    </select>
                    {targetNurse && (
                      <p className="mt-2 text-xs text-stone-500">
                        <span className="font-semibold text-stone-700">{targetNurse.name.split(",")[0]}</span>
                        {" "}will pick up this visit on their next route re-optimization.
                      </p>
                    )}
                  </div>

                  <button
                    data-testid="reassign-confirm"
                    onClick={submit}
                    disabled={!selectedClientId || !targetNurseId}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white h-11 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirm reassignment
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
