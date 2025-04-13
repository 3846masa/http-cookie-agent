import { configs as sharedConfigs } from '@3846masa/configs/eslint';

/** @type {import('eslint').Linter.Config[]} */
const configs = [
  { ignores: ['dist/', 'http/index.js', 'undici/index.js', 'undici/v6/index.js'] },
  ...sharedConfigs,
  {
    files: ['examples/**/*'],
    rules: {
      'import/order': [
        'error',
        {
          pathGroups: [
            {
              group: 'external',
              pattern: 'http-cookie-agent/http',
            },
            {
              group: 'external',
              pattern: 'http-cookie-agent/undici',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/__tests__/**/*'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['off'],
    },
  },
];

export default configs;
