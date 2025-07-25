import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/observepoint-manager/',
  server: {
    // Serve the app at /observepoint-manager/ in development
    open: '/observepoint-manager/',
  }
})
