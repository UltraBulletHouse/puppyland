import { registerSW } from 'virtual:pwa-register';

import { toastPrimary, toastSuccess } from './toastUtils';

let pwaRegistered = false;

export const setupPWA = () => {
  if (pwaRegistered) return;
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  pwaRegistered = true;

  let refreshTriggered = false;
  let offlineNotified = false;

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      toastPrimary('New update ready. Refreshing…');
      updateSW(true).catch((error) => {
        console.error('Failed to update service worker', error);
      });
    },
    onOfflineReady() {
      if (offlineNotified) return;
      offlineNotified = true;
      toastSuccess('Offline support is ready. Cached content is available.');
    },
    onRegisterError(error) {
      console.error('Service worker registration failed', error);
    },
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshTriggered) return;
    refreshTriggered = true;
    window.location.reload();
  });
};
