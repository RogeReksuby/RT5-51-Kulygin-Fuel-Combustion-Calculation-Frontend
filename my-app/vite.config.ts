import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: { 
    port: 3000,
    host: '0.0.0.0',
    https: { // ← Добавьте эту секцию
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Включаем PWA в режиме разработки
      },/*
      manifest: {
        name: "Расчет энергии сгорания топлива",
        short_name: "FuelCalc",
        start_url: "/web_rip_front/",
        display: "standalone",
        background_color: "#203563",
        theme_color: "#203563",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/iconfuel192.png",
            type: "image/png",
            sizes: "192x192"
          },
          {
            src: "/iconfuel512.png", 
            type: "image/png",
            sizes: "512x512"
          }
        ]
      }*/
    })
  ],
  base: "/web_rip_front/",
})