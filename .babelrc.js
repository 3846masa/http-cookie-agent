module.exports = (api) => {
  const isTest = api.env('test');

  return {
    plugins: [
      '@babel/plugin-proposal-explicit-resource-management',
      ...(isTest ? [] : ['module:@reactioncommerce/babel-remove-es-create-require']),
    ],
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isTest ? false : 'commonjs',
          targets: { node: 18 },
        },
      ],
      ['@babel/preset-typescript'],
    ],
  };
};
