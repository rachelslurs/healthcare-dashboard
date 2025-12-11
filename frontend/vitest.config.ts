// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import tsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vitest-specific config (separate from vite.config.ts to avoid requiring vitest for dev server)
export default defineConfig({
  plugins: [
    // Only include plugins needed for testing (exclude tanstackStart to avoid route scanning)
    tsConfigPaths(),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve("src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
