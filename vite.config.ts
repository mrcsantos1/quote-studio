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
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
