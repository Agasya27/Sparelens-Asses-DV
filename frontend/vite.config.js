import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // For GitHub Pages, pass --base=/Sparelens-Asses-DV/ to the build command via CI.
  // We avoid hardcoding base here to keep local dev simple.
  // Disable React Fast Refresh in dev to avoid eval/new Function, keeping CSP strict
  plugins: [react({ fastRefresh: false })],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      // Proxy API requests during development to avoid CORS issues
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
