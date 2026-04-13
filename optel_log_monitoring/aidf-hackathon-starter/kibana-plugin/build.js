const fs = require('fs');
const path = require('path');

const srcPath  = path.join(__dirname, 'public', 'plugin.js');
const outDir   = path.join(__dirname, 'target', 'public');
const outPath  = path.join(outDir, 'otelLogMonitor.plugin.js');
const logoSrc  = path.join(__dirname, 'public', 'test.png');
const logoDest = path.join(outDir, 'test.png');

const pluginSrc = fs.readFileSync(srcPath, 'utf8')
  .replace(/^export\s+function\s+plugin/m, 'function plugin');

// Kibana 8.x bootstrap.js flow:
//   1. window.__kbnBundles__ = kbnBundlesLoader()
//      └─ kbnBundlesLoader creates an internal `modules` map
//      └─ __kbnBundles__.define(id, deps, factory) stores: modules[id] = factory()
//      └─ __kbnBundles__.get(id) calls:             modules[id].bundleRequire()
//
//   2. require([...plugin script URLs...], callback)  ← loads our file
//
//   3. callback → __kbnBundles__.get('entry/core/public').__kbnBootstrap__()
//      └─ plugin loader calls __kbnBundles__.get('plugin/otelLogMonitor/public')
//      └─ then calls .bundleRequire() on the result
//      └─ expects that to return { plugin: fn }
//
// So our factory must return: { bundleRequire: () => { plugin: plugin } }

const bundle = `(function () {
${pluginSrc}

  if (!window.__kbnBundles__) {
    console.error('[otelLogMonitor] window.__kbnBundles__ not available');
    return;
  }

  // define(key, bundleRequire, bundleModuleKey)
  // get(key) calls: modules[key].bundleRequire(modules[key].bundleModuleKey)
  // So bundleRequire must be the function itself, not wrapped in a factory.
  window.__kbnBundles__.define(
    'plugin/otelLogMonitor/public',
    function () { return { plugin: plugin }; },
    'plugin/otelLogMonitor/public'
  );

  console.log('[otelLogMonitor] registered via __kbnBundles__.define with bundleRequire wrapper');
})();
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, bundle, 'utf8');
fs.copyFileSync(logoSrc, logoDest);
console.log('Built: ' + outPath);
console.log('Copied logo: ' + logoDest);
