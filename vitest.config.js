import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    threads: false,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    css: false,
    globals: false,
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      provider: 'v8',
      all: true,
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        'api/**/*.{js,jsx,ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'vite.config.js',
        'vitest.config.*',
        'tests/**',
        // Exclude non-runnable entrypoints and routing shells from coverage
        'src/main.jsx',
        'src/admin/main.jsx',
        'src/App.jsx',
      ],
      // Guardrails to prevent regressions; adjust as coverage improves
      statements: 60,
      branches: 50,
      functions: 80,
      lines: 60,
    },
  },
});


