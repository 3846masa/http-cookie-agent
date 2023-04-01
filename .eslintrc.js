module.exports = {
  extends: [require.resolve('@3846masa/configs/eslint')],
  overrides: [
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
  ],
};
