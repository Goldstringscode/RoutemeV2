import React from "react";

/**
 * ErrorBoundary — catches React render errors and displays a fallback UI
 * instead of crashing the entire app. Logs errors to console for production
 * debugging (extendable to Sentry/DataDog).
 */
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
    // Future: send to Sentry/DataDog
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    const fallbackMessage = this.props.fallbackMessage || "Something went wrong";
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
          <div className="max-w-md text-center">
            <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L4.068 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-stone-800 mb-2">{fallbackMessage}</h2>
            <p className="text-sm text-stone-500 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}