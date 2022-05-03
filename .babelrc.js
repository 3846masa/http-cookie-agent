module.exports = {
  overrides: [
    {
      include: ['**/*.mts'],
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: { node: 14 },
          },
        ],
      ],
    },
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'commonjs',
        targets: { node: 14 },
      },
    ],
    ['@babel/preset-typescript'],
  ],
};
