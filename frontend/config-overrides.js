const path = require('path');

module.exports = function override(config, env) {
  // Exclude .wasm files from the default file loader
  config.module.rules.forEach(rule => {
    (rule.oneOf || []).forEach(oneOf => {
      if (oneOf.loader && oneOf.loader.includes('file-loader')) {
        oneOf.exclude.push(/\.wasm$/);
      }
    });
  });

  // Add a rule to handle .wasm files
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'javascript/auto',
    use: {
      loader: 'file-loader',
      options: {
        outputPath: 'static/js',
        publicPath: 'static/js',
      },
    },
  });

  return config;
};
