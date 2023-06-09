module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      'babel-plugin-transform-typescript-metadata',
      ['@babel/plugin-proposal-decorators', {version: 'legacy'}],
      ['@babel/plugin-proposal-class-properties', {loose: true}],
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-reanimated/plugin',
    ],
  };
};
