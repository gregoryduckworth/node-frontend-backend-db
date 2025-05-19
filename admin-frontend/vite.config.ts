import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config();

const apiBase = process.env.VITE_API_BASE || 'http://localhost';
const apiPort = process.env.VITE_API_PORT || '3001';
const apiUrl = process.env.VITE_API_URL || `${apiBase}:${apiPort}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@api': resolve(__dirname, 'src/api'),
      '@components': resolve(__dirname, 'src/components'),
      '@config': resolve(__dirname, 'src/config'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@i18n': resolve(__dirname, 'src/i18n'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@store': resolve(__dirname, 'src/store'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
  server: {
    host: process.env.VITE_HOST || '0.0.0.0',
    port: process.env.VITE_PORT ? Number(process.env.VITE_PORT) : 5174,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
});
