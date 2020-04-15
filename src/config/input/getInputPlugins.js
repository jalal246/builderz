import { join } from "path";
import beep from "@rollup/plugin-beep";
import auto from "@rollup/plugin-auto-install";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import aliasPlugin from "@rollup/plugin-alias";
import multiEntry from "@rollup/plugin-multi-entry";
import postcss from "rollup-plugin-postcss";

import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import analyze from "rollup-plugin-analyzer";

import { CJS, ES } from "../../constants";

/**
 * Returns plugins according to passed flags.
 *
 * @param {boolean} [isSilent=true]
 * @param {boolean} [isProd=true]
 * @param {string} buildFormat
 * @returns {Array} plugins
 */
function getPlugins({
  isSilent,
  isProd,
  isMultiEntries,
  buildFormat,
  buildPath,
  buildName,
  alias,
  idx,
}) {
  const essentialPlugins = [
    /**
     * Beeps when a build ends with errors.
     */
    beep(),

    babel({
      runtimeHelpers: true,
      babelrc: true,
    }),

    isMultiEntries ? multiEntry() : null,

    alias.length > 0 ? aliasPlugin({ entries: alias }) : null,

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
    resolve({
      preferBuiltins: true,
      extensions: [".mjs", ".js", ".jsx", ".json", ".node"],
    }),

    /**
     * Converts .json files to ES6 modules.
     */
    json(),

    postcss({
      inject: false,
      extract: idx === 0 && join(buildPath, `${buildName}.css`),
    }),

    /**
     * Minify generated bundle.
     */
    isProd
      ? terser({
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
            keep_infinity: true,

            // default: 1
            // maximum number of times to run compress. In some cases more than
            // one pass leads to further compressed cod Keep in mind more passes
            // will take more time.
            passes: 10,
          },

          output: {
            // default: true
            // pass false if you do not want to wrap function expressions that are
            // passed as arguments, in parenthesis.
            // turning it to false in the sake of size.
            wrap_func_args: false,
          },

          // pass an empty object {} or a previously used nameCache object
          // if you wish to cache mangled variable
          // and property names across multiple invocations of minify
          nameCache: {},

          mangle: {
            properties: false,
          },

          // true if to enable top level variable
          // and function name mangling
          // and to drop unused variables and functions.
          toplevel: buildFormat === CJS || buildFormat === ES,
        })
      : null,
  ].filter(Boolean);

  if (!isSilent) {
    essentialPlugins.push(analyze({ summaryOnly: true }));
  }

  return essentialPlugins;
}

export default getPlugins;
