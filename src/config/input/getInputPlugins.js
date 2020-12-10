import { join } from "path";

import { resolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import aliasPlugin from "@rollup/plugin-alias";
import multiEntry from "@rollup/plugin-multi-entry";
import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

import babelPlugin from "../babel";

import { CJS, ES, BABEL } from "../../constants";

/**
 * Returns plugins according to passed flags.
 *
 * @param {Object} {
 *     plugins: { alias, isMultiEntries, isTypeScript },
 *     output: { buildPath, name },
 *     pkg: { cwd },
 *     opts: { [BABEL]: babelConfig },
 *   }
 * @param {Object} { idx, isProd, buildFormat }
 * @returns {Array} plugins
 */
function getPlugins(
  {
    plugins: { alias, isMultiEntries, isTypeScript },
    output: { buildPath, name },
    pkg: { cwd },
    opts: { [BABEL]: babelConfig },
  },
  { idx, isProd, buildFormat }
) {
  const essentialPlugins = [
    babelPlugin({ ...babelConfig, cwd }),

    isMultiEntries ? multiEntry() : null,

    alias.length > 0 ? aliasPlugin({ entries: alias }) : null,

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

    isTypeScript ? typescript() : null,

    /**
     * Converts .json files to ES6 modules.
     */
    json(),

    postcss({
      inject: false,
      extract: idx === 0 && join(buildPath, `${name}.css`),
    }),
  ].filter(Boolean);

  /**
   * Minify generated bundle.
   */
  if (isProd)
    essentialPlugins.push(
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
    );

  return essentialPlugins;
}

export default getPlugins;
