import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/favicon.png'],
      manifest: {
        name: 'Lysa Chain',
        short_name: 'LysaChain',
        description: 'Lysa Chain - Electronic & Techno Artist',
        theme_color: '#b026ff',
        background_color: '#000000',
        display: 'standalone',
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
          }
        ]
      }
    })
  ],
  build: {
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: 'index.html',
        cookie: 'cookie-policy.html',
        privacy: 'privacy-policy.html',
      },
      output: {
        // manualChunks removed to fix Rolldown compatibility
      }
    }
  }
});
