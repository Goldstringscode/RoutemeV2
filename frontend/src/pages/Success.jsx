import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader, XCircle } from "lucide-react";

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setError("No session ID found");
      return;
    }
    const checkSession = async () => {
      try {
        const res = await fetch(`/api/check-session-status?session_id=${sessionId}`);
        const data = await res.json();
        if (data.status === "complete" || data.status === "open") {
          setStatus("success");
        } else {
          setStatus("error");
          setError(`Session status: ${data.status}`);
        }
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    };
    checkSession();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === "verifying" && (
          <div>
            <Loader className="h-12 w-12 mx-auto text-stone-400 animate-spin mb-4" />
            <h2 className="font-display text-2xl text-stone-800 mb-2">Verifying your payment...</h2>
            <p className="text-sm text-stone-500">Please wait a moment while we confirm your subscription.</p>
          </div>
        )}
        {status === "success" && (
          <div>
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="font-display text-2xl text-stone-800 mb-2">Welcome to RouteMe!</h2>
            <p className="text-sm text-stone-500 mb-6">
              Your subscription is active. You can now start managing your agency.
            </p>
            <button
              onClick={() => navigate("/agency/overview")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
        {status === "error" && (
          <div>
            <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="font-display text-2xl text-stone-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-stone-500 mb-2">{error || "We couldn't verify your payment."}</p>
            <p className="text-xs text-stone-400 mb-6">Please try again or contact support.</p>
            <button
              onClick={() => navigate("/pricing")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors"
            >
              Back to Pricing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}