module.exports = {
  extends: [require.resolve('@3846masa/configs/eslint')],
  overrides: [
    {
      files: ['examples/**/*'],
      rules: {
        'import/no-unresolved': [
          'error',
          {
            ignore: ['ava', 'got', 'http-cookie-agent'],
          },
        ],
      },
    },
    {
      files: ['src/undici/**/*'],
      rules: {
        eqeqeq: ['error', 'always', { null: 'never' }],
        'no-undefined': ['error'],
      },
    },
  ],
  rules: {
    'import/no-unresolved': [
      'error',
      {
        ignore: ['ava', 'got'],
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
