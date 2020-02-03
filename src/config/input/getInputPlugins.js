const beep = require("@rollup/plugin-beep");
const auto = require("@rollup/plugin-auto-install");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const replace = require("@rollup/plugin-replace");

const babel = require("rollup-plugin-babel");
const { terser } = require("rollup-plugin-terser");
const analyze = require("rollup-plugin-analyzer");

const { UMD, CJS, ES, PROD } = require("../../constants");

/**
 * Returns plugins according to passed flags.
 *
 * @param {Array} presets
 * @param {boolean} IS_SILENT
 * @param {string} BUILD_FORMAT
 * @param {string} BABEL_ENV
 * @returns {Array} plugins
 */
function getPlugins(presets, IS_SILENT, BUILD_FORMAT, BABEL_ENV) {
  const plugins = [
    /**
     * Beeps when a build ends with errors.
     */
    beep(),

    babel({
      runtimeHelpers: true,
      presets,
      babelrc: false
    }),

    /**
     * Automatically installs dependencies that are imported by a bundle, even
     * if not yet in package.json.
     */
    auto(),

    /**
     * Convert CommonJS modules to ES6, so they can be included in a Rollup
     * bundle.
     */
    commonjs(),

    /**
     * Converts .json files to ES6 modules.
     */
    json(),

    /**
     * Replaces strings in files while bundling.
     */
    replace({ "process.env.NODE_ENV": JSON.stringify("BABEL_ENV") })
  ];

  if (!IS_SILENT) {
    plugins.push(analyze());
  }

  if (BUILD_FORMAT === UMD) {
    plugins.push(
      /**
       * Locates modules using the Node resolution algorithm, for using third
       * party modules in node_modules.
       */
      resolve({ extensions: [".mjs", ".js", ".json", ".node"] })
    );
  }

  if (BABEL_ENV === PROD) {
    plugins.push(
      /**
       * Minify generated es bundle.
       */
      terser({
        // default undefined
        ecma: 5,

        // default false
        sourcemap: true,

        // display warnings when dropping unreachable code or unused declarations etc
        warnings: true,

        compress: {
          // default: false
          // true to discard calls to console.* functions.
          drop_console: true,

          // default: false
          // true to prevent Infinity from being compressed into 1/0, which may cause performance issues on Chrome.
          keep_infinity: true
        },

        // pass an empty object {} or a previously used nameCache object
        // if you wish to cache mangled variable
        // and property names across multiple invocations of minify
        nameCache: {},

        mangle: {
          properties: false
        },

        // true if to enable top level variable
        // and function name mangling
        // and to drop unused variables and functions.
        toplevel: BUILD_FORMAT === CJS || BUILD_FORMAT === ES
      })
    );
  }

  return plugins;
}

module.exports = getPlugins;
