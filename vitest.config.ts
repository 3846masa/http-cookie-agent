/* global process */
import semver from 'semver';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: ['**/utils/__tests__/*.spec.ts'],
          name: 'utils',
          pool: 'vmForks',
          root: './src',
          setupFiles: ['disposablestack/auto'],
        },
      },
      {
        test: {
          include: ['**/http/__tests__/*.spec.ts'],
          name: 'http',
          pool: 'vmForks',
          root: './src',
          setupFiles: ['disposablestack/auto'],
        },
      },
      {
        test: {
          exclude: semver.gte(process.versions.node, 'v26.0.0') ? [] : ['**/global_fetch.spec.ts'],
          include: ['**/undici/__tests__/*.spec.ts'],
          name: 'undici@8',
          pool: 'vmForks',
          root: './src',
          setupFiles: ['disposablestack/auto'],
        },
      },
      {
        resolve: {
          alias: [
            { find: /^undici$/, replacement: 'undici__v7' },
            { find: /^undici\/(.*)$/, replacement: 'undici__v7/$1' },
          ],
        },
        test: {
          exclude:
            semver.gte(process.versions.node, 'v24.0.0') && semver.lt(process.versions.node, 'v26.0.0')
              ? []
              : ['**/global_fetch.spec.ts'],
          include: ['**/undici/__tests__/*.spec.ts'],
          name: 'undici@7',
          pool: 'vmForks',
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
          exclude:
            semver.gte(process.versions.node, 'v18.2.0') && semver.lt(process.versions.node, 'v24.0.0')
              ? []
              : ['**/global_fetch.spec.ts'],
          include: ['**/undici/v6/__tests__/*.spec.ts'],
          name: 'undici@6',
          pool: 'vmForks',
          root: './src',
          setupFiles: ['disposablestack/auto'],
        },
      },
    ],
  },
});
