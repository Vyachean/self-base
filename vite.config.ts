import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { sentryVitePlugin } from '@sentry/vite-plugin';

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
  ],
});
