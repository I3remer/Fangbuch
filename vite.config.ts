import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Relative Pfade, damit die App unter https://<name>.github.io/Fangbuch/ genauso läuft wie lokal.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      filename: 'sw.js',
      includeAssets: ['icons/*.png', 'sw-compat.js'],
      manifest: {
        id: './',
        name: 'Fangbuch',
        short_name: 'Fangbuch',
        description: 'Ratgeber und Gedächtnis am Wasser: Sessions offline erfassen und ins Fangbuch übertragen.',
        lang: 'de',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1e3a32',
        theme_color: '#1e3a32',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,woff2}'],
        importScripts: ['sw-compat.js'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
