// vite.config.ts
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import { resolve } from 'path'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import checker from "vite-plugin-checker"
import tailwindcss from '@tailwindcss/vite'

const config: UserConfig = {
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    tailwindcss(),
    checker({
      typescript: true,
      overlay: false,
    }),
  ],
  
  resolve: {
    alias: {
      "@": resolve("src"),
    },
  },
  
  server: {
    host: true, // Allows external access (needed for Docker)
    port: 5173,
    strictPort: true,
    watch: {
      // Use polling for file watching in Docker; can be disabled for native development.
      // Set VITE_USE_POLLING=true in your environment to enable polling.
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
  },
}

export default defineConfig(config)