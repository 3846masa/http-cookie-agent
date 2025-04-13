/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: 'default',
      extensionsToTreatAsEsm: ['.ts'],
      injectGlobals: false,
      roots: ['./src'],
      setupFiles: ['./jest/setup.ts'],
      testMatch: ['**/__tests__/*.spec.ts', '!**/undici/v6/__tests__/*.spec.ts'],
      transform: {
        '\\.+(ts)$': 'babel-jest',
      },
    },
    {
      displayName: 'undici@6',
      extensionsToTreatAsEsm: ['.ts'],
      injectGlobals: false,
      moduleNameMapper: {
        '^undici$': 'undici@v6',
        '^undici/(.*)$': 'undici@v6/$1',
      },
      roots: ['./src'],
      setupFiles: ['./jest/setup.ts'],
      testMatch: ['**/undici/v6/__tests__/*.spec.ts'],
      transform: {
        '\\.+(ts)$': 'babel-jest',
      },
    },
  ],
};

module.exports = config;
