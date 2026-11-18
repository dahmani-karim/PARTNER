import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = (env.VITE_API_URL || 'https://smart-cellar-api.onrender.com').replace(/\/+$/, '').replace(/\/api$/, '');
  return {
  define: {
    'import.meta.env.VITE_PWA_BUILD': JSON.stringify(new Date().toISOString()),
  },
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      devOptions: {
        enabled: false
      },
      manifest: {
        id: '/',
        launch_handler: { client_mode: 'navigate-existing' },
        name: 'Partner - La Caverne du Réfractaire',
        short_name: 'Partner',
        description: 'Programme Ambassadeur de La Caverne du Réfractaire',
        theme_color: '#D4AF37',
        background_color: '#FAFAF8',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        skipWaiting: false,
        clientsClaim: true,
        importScripts: ['push-sw.js'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: backend, changeOrigin: true, secure: true },
      '/uploads': { target: backend, changeOrigin: true, secure: true },
    },
  },
  };
})
