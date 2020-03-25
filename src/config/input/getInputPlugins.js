import beep from "@rollup/plugin-beep";
import auto from "@rollup/plugin-auto-install";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import aliasPlugin from "@rollup/plugin-alias";

import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import analyze from "rollup-plugin-analyzer";

import { CJS, ES } from "../../constants";

// function isInExternalPlugins(extraPlugins, plugins) {
//   const found = false;

//   if (extraPlugins.length > 0) {
//     extraPlugins.find(extraPlugin => extraPlugin.match(plugins));
//   }

//   return found;
// }

/**
 * Returns plugins according to passed flags.
 *
 * @param {boolean} [IS_SILENT=true]
 * @param {boolean} [IS_PROD=true]
 * @param {string} BUILD_FORMAT
 * @returns {Array} plugins
 */
function getPlugins({
  IS_SILENT = true,
  IS_PROD = true,
  BUILD_FORMAT,
  plugins: extraPlugins,
  alias
}) {
  const essentialPlugins = [
    /**
     * Beeps when a build ends with errors.
     */
    beep(),

    babel({
      runtimeHelpers: true,
      babelrc: true
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
     * Locates modules using the Node resolution algorithm, for using third
     * party modules in node_modules.
     */
    resolve({ extensions: [".mjs", ".js", ".jsx", ".json", ".node"] }),

    /**
     * Converts .json files to ES6 modules.
     */
    json()
  ];

  // if (alias.length > 0) {
  //   console.log("alias", alias);
  //   const extractedAlias = extractAlias(alias);

  //   essentialPlugins.push(aliasPlugin({ entries: extractedAlias }));
  // }

  if (extraPlugins.length > 0) {
    extraPlugins.forEach(plg => {
      essentialPlugins.push(plg);
    });
  }

  if (!IS_SILENT) {
    essentialPlugins.push(analyze({ summaryOnly: true }));
  }

  if (IS_PROD) {
    essentialPlugins.push(
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

  return essentialPlugins;
}

export default getPlugins;
