/**
 * useToast — thin wrapper around Sonner toast library
 *
 * Provides a consistent API for the app: success, error, info, warning.
 * Swap the underlying library here without changing callers.
 *
 * Includes fallback: if Sonner fails to load, toasts degrade to console.log
 * so the app never crashes from a missing toast library.
 */

let sonnerToast;

try {
  sonnerToast = require("sonner").toast;
} catch {
  // Fallback: no-op toasts so the app doesn't crash at import
  sonnerToast = {
    success: (m, o) => console.log("✓", m),
    error:   (m, o) => console.error("✕", m),
    info:    (m, o) => console.log("ℹ", m),
    warning: (m, o) => console.warn("⚠", m),
    promise: (p, o) => p,
    dismiss: () => {},
  };
}

const DEFAULT_DURATION = 5000;

export function useToast() {
  return {
    success: (message, opts) => sonnerToast.success(message, { duration: DEFAULT_DURATION, ...opts }),
    error:   (message, opts) => sonnerToast.error(message,   { duration: DEFAULT_DURATION, ...opts }),
    info:    (message, opts) => sonnerToast.info(message,    { duration: DEFAULT_DURATION, ...opts }),
    warning: (message, opts) => sonnerToast.warning(message, { duration: DEFAULT_DURATION, ...opts }),
    promise: (promise, opts) => sonnerToast.promise(promise, opts),
    dismiss: (id) => sonnerToast.dismiss(id),
  };
}

/** Direct access to Sonner toast for contexts where hooks can't be used */
export const toast = {
  success: (msg, opts) => sonnerToast.success(msg, { duration: DEFAULT_DURATION, ...opts }),
  error:   (msg, opts) => sonnerToast.error(msg,   { duration: DEFAULT_DURATION, ...opts }),
  info:    (msg, opts) => sonnerToast.info(msg,    { duration: DEFAULT_DURATION, ...opts }),
  warning: (msg, opts) => sonnerToast.warning(msg, { duration: DEFAULT_DURATION, ...opts }),
  promise: (promise, opts) => sonnerToast.promise(promise, opts),
  dismiss: (id) => sonnerToast.dismiss(id),
};