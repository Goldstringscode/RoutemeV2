import React from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * UpdateBanner — A toast/banner that appears when a new version of RouteMe is available.
 * Lets the user choose when to update, rather than force-reloading.
 */
export default function UpdateBanner({ onUpdate, onDismiss }) {
  const [show, setShow] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  if (!show) return null;

  const handleUpdate = () => {
    setUpdating(true);
    if (onUpdate) onUpdate();
  };

  const handleDismiss = () => {
    setShow(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-[#D95D39]/10 flex items-center justify-center shrink-0">
            <RefreshCw className="h-4 w-4 text-[#D95D39]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900">Update available</p>
            <p className="text-xs text-stone-500 mt-0.5">
              A new version of RouteMe is ready. Update now to get the latest features.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleUpdate}
                disabled={updating}
                data-testid="sw-update-btn"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#D95D39] hover:bg-[#C05030] disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-4 py-1.5 text-xs font-semibold transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${updating ? 'animate-spin' : ''}`} />
                {updating ? 'Updating...' : 'Update now'}
              </button>
              <button
                onClick={handleDismiss}
                data-testid="sw-dismiss-btn"
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors shrink-0"
            aria-label="Dismiss update notification"
          >
            <X className="h-3.5 w-3.5 text-stone-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
