import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          exclude: ['**/undici/v6/__tests__/*.spec.ts'],
          include: ['**/__tests__/*.spec.ts'],
          name: 'default',
          root: './src',
          setupFiles: ['disposablestack/auto'],
        },
      },
      {
        resolve: {
          alias: [
            { find: /^undici$/, replacement: 'undici__v6' },
            { find: /^undici\/(.*)$/, replacement: 'undici__v6/$1' },
          ],
        },
        test: {
          include: ['**/undici/v6/__tests__/*.spec.ts'],
          name: 'undici@6',
          root: './src',
          setupFiles: ['disposablestack/auto'],
        },
      },
    ],
  },
});
