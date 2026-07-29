import React from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#F7E5DD] flex items-center justify-center">
              <svg className="h-8 w-8 text-[#D95D39]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="mt-6 font-display text-3xl">Something went wrong</h1>
            <p className="mt-2 text-stone-600 text-sm">
              {this.props.fallbackMessage || "An unexpected error occurred. Our team has been notified."}
            </p>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-700">Error details</summary>
                <pre className="mt-2 text-xs text-red-700 bg-red-50 rounded-xl p-3 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold"
              >
                Reload page
              </button>
              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 hover:bg-stone-50 px-5 py-2.5 text-sm font-semibold text-stone-700"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}