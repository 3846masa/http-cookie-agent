module.exports = {
  extends: [require.resolve('@3846masa/configs/eslint')],
  settings: {
    'import/external-module-folders': ['node_modules', './http', './undici'],
  },
};
