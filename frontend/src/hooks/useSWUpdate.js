import { useState, useEffect, useCallback } from 'react';

/**
 * useSWUpdate — React hook for safe service worker updates.
 *
 * Returns:
 *   updateAvailable  — boolean, true when a new SW is waiting
 *   applyUpdate      — () => void, activates the new SW and reloads
 *   dismissUpdate    — () => void, hides the notification for this session
 *   checkSavedDraft  — () => object|null, retrieves any state saved before update
 */
export function useSWUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [skipWaitingFn, setSkipWaitingFn] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  // Register the onUpdate callback once on mount
  useEffect(() => {
    window.__ROUTEME_SW_CALLBACKS__ = {
      onUpdate: ({ skipWaiting }) => {
        setUpdateAvailable(true);
        setSkipWaitingFn(() => skipWaiting);
      },
    };

    return () => {
      delete window.__ROUTEME_SW_CALLBACKS__;
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (skipWaitingFn) {
      skipWaitingFn(); // This saves state + sends SKIP_WAITING
      setUpdateAvailable(false);
    }
  }, [skipWaitingFn]);

  const dismissUpdate = useCallback(() => {
    setDismissed(true);
    setUpdateAvailable(false);
  }, []);

  const checkSavedDraft = useCallback(() => {
    try {
      const drafts = {};
      const soapDraft = localStorage.getItem('routeme_sw_update_draft');
      if (soapDraft) {
        drafts.soapDraft = JSON.parse(soapDraft);
        localStorage.removeItem('routeme_sw_update_draft');
      }
      const formDraft = localStorage.getItem('routeme_sw_update_form');
      if (formDraft) {
        drafts.formDraft = JSON.parse(formDraft);
        localStorage.removeItem('routeme_sw_update_form');
      }
      localStorage.removeItem('routeme_sw_update_pending');
      return Object.keys(drafts).length > 0 ? drafts : null;
    } catch {
      return null;
    }
  }, []);

  return {
    updateAvailable: updateAvailable && !dismissed,
    applyUpdate,
    dismissUpdate,
    checkSavedDraft,
  };
}
