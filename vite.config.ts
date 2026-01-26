import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: 'public/manifest.json',
      additionalInputs: [
        'src/presentation/options/index.html',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@domain': resolve(__dirname, 'src/domain'),
      '@application': resolve(__dirname, 'src/application'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@presentation': resolve(__dirname, 'src/presentation'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@di': resolve(__dirname, 'src/di'),
      '@ui': resolve(__dirname, 'src/presentation/shared/ui'),
      '@lib': resolve(__dirname, 'src/presentation/shared/lib'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
