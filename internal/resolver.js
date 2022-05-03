/* eslint-disable */
const { resolve } = require('eslint-import-resolver-node');

exports.interfaceVersion = 2;

exports.resolve = function (source, file, config) {
  {
    const result = resolve(source, file, config);
    if (result.found) {
      return result;
    }
  }
  {
    const modifiedSource = source.replace(/\.(m?)js$/, '.$1ts');
    if (modifiedSource === source) {
      return { found: false };
    }

    const result = resolve(modifiedSource, file, config);
    return result;
  }
};
