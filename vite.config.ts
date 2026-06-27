import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Geometria/segurança/projeção vivem em libs puras (lib/*) testáveis sem DOM.
// Por isso o ambiente padrão de teste é 'node'; testes de componente, quando
// existirem, declaram `// @vitest-environment jsdom` no topo do arquivo.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Proxy p/ o Gotenberg local (resolve CORS). Em prod, troca-se por um BFF.
    proxy: {
      '/gotenberg': {
        target: process.env.GOTENBERG_URL ?? 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/gotenberg/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
