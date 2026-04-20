import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
          react(),
          VitePWA({
                  registerType: 'autoUpdate',
                  includeAssets: ['favicon.svg'],
                  manifest: {
                            name: 'OrderFlow - Restaurant Order Management',
                            short_name: 'OrderFlow',
                            description: 'Real-time restaurant order management system for fast food shops',
                            theme_color: '#6366F1',
                            background_color: '#0B0F1A',
                            display: 'standalone',
                            start_url: '/',
                            scope: '/',
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
                                            src: 'pwa-512x512.png',
                                            sizes: '512x512',
                                            type: 'image/png',
                                            purpose: 'any maskable'
                              }
                                      ]
                  },
                  workbox: {
                            globPatterns: ['**/*.{js,css,html,ico,png,svg}']
                  }
          })
        ],
})
