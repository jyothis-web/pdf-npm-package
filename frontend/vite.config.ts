import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  },
  resolve: {
    alias: {
      // Map pdfjs-dist to the build file
      'pdfjs-dist': path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.js')
    }
  },
  // Configure worker handling for pdfjs-dist
  worker: {
    format: 'es'
  }
})

