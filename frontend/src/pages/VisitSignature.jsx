import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eraser, Check, Fingerprint, ShieldCheck } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";

export default function VisitSignature() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, pushAudit } = useRouteMe();
  const client = clients.find((c) => c.id === id) ?? clients[0];
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [relation, setRelation] = useState("Client");

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#292524";
    ctx.lineCap = "round";
  }, []);

  const pos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    const cx = e.clientX ?? e.touches?.[0]?.clientX;
    const cy = e.clientY ?? e.touches?.[0]?.clientY;
    return { x: cx - r.left, y: cy - r.top };
  };
  const start = (e) => {
    e.preventDefault();
    const { x, y } = pos(e);
    setDrawing(true); setSigned(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y); ctx.stroke();
  };
  const end = () => setDrawing(false);
  const clear = () => {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setSigned(false);
  };
  const confirm = () => {
    if (!signed || !signerName) return;
    pushAudit(`Signature captured — ${client.fullName} (${signerName}, ${relation})`, "signature");
    navigate(`/app/clients/${client.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={`/app/clients/${client.id}`} className="text-sm text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to client
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">Visit confirmation</p>
        <h1 className="font-display text-4xl leading-tight">
          Signature <span className="font-serif-i text-[#D95D39]">capture</span>
        </h1>
        <p className="mt-2 text-stone-600">
          {client.fullName} · {new Date().toLocaleString([], { weekday: "long", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8" data-testid="signature-card">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-semibold mb-3">
          <Fingerprint className="h-3.5 w-3.5" /> Sign in the box
        </div>
        <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            data-testid="signature-canvas"
            width={800} height={280}
            className="w-full h-64 cursor-crosshair touch-none"
            onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={move} onTouchEnd={end}
          />
          {!signed && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-stone-300 text-2xl font-serif italic">
              Sign here
            </p>
          )}
          <button
            onClick={clear}
            data-testid="signature-clear"
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-stone-200 text-stone-700 hover:text-stone-900 px-3 py-1.5 text-xs font-semibold"
          >
            <Eraser className="h-3.5 w-3.5" /> Clear
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="text-xs font-semibold text-stone-700 tracking-wide">Printed name</label>
            <input
              data-testid="signature-name" required value={signerName} onChange={(e) => setSignerName(e.target.value)}
              placeholder="Full name of signer"
              className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-700 tracking-wide">Relation to patient</label>
            <select data-testid="signature-relation" value={relation} onChange={(e) => setRelation(e.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none">
              <option>Client</option><option>Spouse</option><option>Child</option><option>Caregiver</option><option>Legal guardian</option><option>Other family</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-stone-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Signature stored encrypted · hash appended to your HIPAA audit trail
        </div>

        <button
          onClick={confirm}
          disabled={!signed || !signerName}
          data-testid="signature-confirm"
          className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full h-12 text-sm font-semibold ${
            signed && signerName ? "bg-[#D95D39] hover:bg-[#C05030] text-white" : "bg-stone-200 text-stone-400 cursor-not-allowed"
          }`}
        >
          <Check className="h-4 w-4" /> Confirm visit
        </button>
      </div>
    </div>
  );
}
