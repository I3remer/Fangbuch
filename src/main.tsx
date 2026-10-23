import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './styles.css';
import { FangbuchApp } from './FangbuchApp';
import { requestPersistentStorage } from './storage';

// Wie bisher: Ist eine neue Version geladen, zeigt die App „Jetzt laden“, statt mitten in der Eingabe neu zu starten.
let onNeed: ((fn: () => void) => void) | null = null;
let pending: (() => void) | null = null;
const update = registerSW({
  onNeedRefresh() { const fn = () => update(true); if (onNeed) onNeed(fn); else pending = fn; },
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') navigator.serviceWorker?.getRegistration().then((r) => r?.update()).catch(() => {});
});

// Den Cache der bisherigen App-Version aufräumen.
if ('caches' in window) caches.keys().then((keys) => keys.filter((k) => k.startsWith('fangbuch-app-v')).forEach((k) => caches.delete(k))).catch(() => {});
requestPersistentStorage();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FangbuchApp onUpdate={(register) => { onNeed = register; if (pending) { register(pending); pending = null; } }} />
  </React.StrictMode>,
);
