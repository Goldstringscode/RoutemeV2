import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function Cancel() {
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="font-display text-2xl text-stone-800 mb-2">Checkout canceled</h2>
        <p className="text-sm text-stone-500 mb-6">
          No charges were made. Feel free to come back when you're ready.
        </p>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors"
        >
          Back to Pricing
        </Link>
      </div>
    </div>
  );
}