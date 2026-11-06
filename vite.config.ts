import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages project sites live under /<repo>/ — the workflow sets BASE_PATH accordingly.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // Keep the heavy 3D stack out of the entry bundle; framer-motion is shared by the whole page.
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'motion';
        },
      },
    },
  },
});
