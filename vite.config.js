import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    // Proxy vetëm për dev
    proxy: {
      '/api': {
        target: 'http://localhost:3007', // backend lokal dev
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
