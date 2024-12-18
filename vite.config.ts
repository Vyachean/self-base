import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { dependencies, devDependencies } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    vue(),
    wasm(),
    topLevelAwait(),
    sentryVitePlugin({
      org: 'vb-ak',
      project: 'self-base',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    VitePWA({ registerType: 'autoUpdate' }),
  ],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@feature': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@entity': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@widget': fileURLToPath(new URL('./src/widgets', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Получаем все зависимости из package.json
          const allDependencies = { ...dependencies, ...devDependencies };
          // Перебираем зависимости
          for (const [name] of Object.entries(allDependencies)) {
            if (id.includes(`node_modules/${name}`)) {
              return `vendor/${name}`; // Создаем чанк по имени пакета
            }
          }
        },
      },
    },
  },
});
