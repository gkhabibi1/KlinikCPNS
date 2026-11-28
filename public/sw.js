// Minimal service worker untuk mengaktifkan fitur Install Aplikasi (PWA) di Android/Chrome
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Network pass-through agar data Try Out, soal, dan profil selalu real-time
});
