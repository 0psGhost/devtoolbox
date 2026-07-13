import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: process.env.TAURI_ENV_PLATFORM
    ? {
        // Tauri 2 webviews support modern JS; avoid safari13 which breaks esbuild transpilation.
        target: 'es2020',
        minify: process.env.TAURI_ENV_DEBUG ? false : 'esbuild',
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
      }
    : undefined,
})
