// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import checker from "vite-plugin-checker"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
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
})