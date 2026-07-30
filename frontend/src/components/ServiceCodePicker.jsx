import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { DEFAULT_SERVICE_CODES } from "@/lib/evvService";

export default function ServiceCodePicker({ value, onChange, disabled, recentCodes }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const codes = DEFAULT_SERVICE_CODES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  // Get recent codes that match the current search (if any)
  const recentMatches = search
    ? recentCodes?.filter((rc) => codes.some((c) => c.code === rc)) ?? []
    : recentCodes?.filter((rc) => codes.some((c) => c.code === rc)) ?? [];

  const selected = DEFAULT_SERVICE_CODES.find((c) => c.code === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
          disabled ? "bg-stone-50 border-stone-200 text-stone-400" : "bg-white border-stone-200 hover:border-stone-300 text-stone-800"
        }`}
      >
        <span className={selected ? "" : "text-stone-400"}>
          {selected ? `${selected.code} — ${selected.description}` : "Select service code..."}
        </span>
        <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-lg max-h-64 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-100">
            <Search className="h-4 w-4 text-stone-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search codes..."
              className="flex-1 text-sm outline-none bg-transparent"
              autoFocus
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-48">
            {codes.length === 0 ? (
              <p className="px-3 py-4 text-xs text-stone-400 text-center">No matching codes</p>
            ) : (
              <>
                {/* Recent codes section */}
                {recentMatches.length > 0 && !search && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-stone-400 tracking-wider">
                      Recently Used
                    </div>
                    {recentMatches.map((rc) => {
                      const c = codes.find((x) => x.code === rc);
                      if (!c) return null;
                      return (
                        <button
                          key={`recent-${c.code}`}
                          type="button"
                          onClick={() => {
                            onChange(c.code);
                            setOpen(false);
                            setSearch("");
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between gap-2 ${
                            c.code === value ? "bg-blue-50 text-blue-700" : "text-stone-700"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-mono font-semibold text-xs">{c.code}</span>
                            <p className="text-xs text-stone-500 truncate">{c.description}</p>
                          </div>
                          <span className="text-[10px] uppercase text-stone-400 shrink-0">{c.category}</span>
                        </button>
                      );
                    })}
                    <div className="border-t border-stone-100 my-1" />
                  </>
                )}
                {/* All matching codes */}
                {codes.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-stone-50 flex items-center justify-between gap-2 ${
                      c.code === value ? "bg-blue-50 text-blue-700" : "text-stone-700"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-mono font-semibold text-xs">{c.code}</span>
                      <p className="text-xs text-stone-500 truncate">{c.description}</p>
                    </div>
                    <span className="text-[10px] uppercase text-stone-400 shrink-0">{c.category}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}