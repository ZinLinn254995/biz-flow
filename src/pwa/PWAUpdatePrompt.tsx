import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Minimal, non-blocking PWA affordance.
 *
 * - When a newer deployed build is detected the service worker enters the
 *   `waiting` state and `needRefresh` becomes true; the user explicitly opts
 *   in to activate it, which reloads into the new version.
 * - `offlineReady` confirms the app shell has been precached for offline use.
 *
 * This component only manages the Cache Storage / service-worker lifecycle.
 * It never touches the IndexedDB layer, so persisted business data is untouched
 * by installs, updates, or activations.
 */
export function PWAUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) {
    return null;
  }

  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-4 shadow-lg"
    >
      <p className="text-sm font-medium text-slate-900">
        {needRefresh ? 'A new version of BizFlow is available.' : 'BizFlow is ready to work offline.'}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        {needRefresh && (
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Update
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {needRefresh ? 'Later' : 'Dismiss'}
        </button>
      </div>
    </div>
  );
}
