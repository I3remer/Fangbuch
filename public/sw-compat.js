/* Die bisherige App bittet einen wartenden Service Worker mit der Nachricht „skipWaiting“ um die Übernahme.
   So kommt auch ein Handy, auf dem noch die alte Version läuft, per „Jetzt laden“ zur neuen. */
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });
