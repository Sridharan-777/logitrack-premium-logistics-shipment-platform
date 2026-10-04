import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Three.js and the logistics workspace are intentionally rich client bundles.
      // Keep the warning threshold aligned with the largest verified split chunk.
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three'],
            maps: ['leaflet'],
            react: ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      port: 3000,
      proxy: { '/api': 'http://127.0.0.1:3001' },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
