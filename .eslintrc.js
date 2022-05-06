module.exports = {
  extends: [require.resolve('@3846masa/configs/eslint')],
  overrides: [
    {
      files: ['examples/**/*'],
      rules: {
        'import/no-unresolved': [
          'error',
          {
            ignore: ['http-cookie-agent'],
          },
        ],
      },
    },
  ],
};
