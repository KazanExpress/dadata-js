const vue = require('rollup-plugin-vue2');
const css = require('rollup-plugin-css-only');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');

module.exports = exports = function(
  compress = false,
  polyfills = {
    arrow: true,
    assign: true,
    async: true,
    promise: true
  },
  defineInWindow = false
) {
  const babelPlugins = ['transform-object-rest-spread'];

  if (polyfills.assign) {
    babelPlugins.push('transform-object-assign')
  }

  if (polyfills.async) {
    babelPlugins.push('transform-async-to-promises')
  }

  if (polyfills.promise) {
    babelPlugins.push('es6-promise')
  }

  const plugins = [
    vue(),
    css({ output: 'dist/styles.css' }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: false,
      presets: polyfills.arrows ? ['stage-3', 'es2015-rollup'] : [],
      plugins: babelPlugins
    }),
    nodeResolve({ browser: true, jsnext: true, main: true }),
    commonjs()
  ];

  if (compress) {
    plugins.push(uglify());
  }

  return {
    input: defineInWindow ? 'lib/window.js' : 'lib/index.js',
    plugins
  };
}
