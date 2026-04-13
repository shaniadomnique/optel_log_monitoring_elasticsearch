const path = require('path');

module.exports = {
  mode: 'production',
  entry: './public/plugin.js',
  output: {
    path: path.resolve(__dirname, 'target/public'),
    filename: 'otelLogMonitor.plugin.js',
    // Named AMD module — generates:
    //   define("plugin/otelLogMonitor/public", [], factory)
    // Kibana sets up window.define before loading plugin bundles,
    // so this registers the module in its __kbnBundles__ registry.
    libraryTarget: 'amd',
    library: 'plugin/otelLogMonitor/public',
  },
  optimization: {
    minimize: false,
  },
};
