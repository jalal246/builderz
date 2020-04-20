import * as babel from "@babel/core";
import { createFilter } from "@rollup/pluginutils";

const unpackOptions = ({
  extensions = babel.DEFAULT_EXTENSIONS,
  // rollup uses sourcemap, babel uses sourceMaps
  // just normalize them here so people don't have to worry about it
  sourcemap = true,
  sourcemaps = true,
  sourceMap = true,
  sourceMaps = true,
  ...rest
} = {}) => ({
  extensions,
  plugins: [],
  sourceMaps: sourcemap && sourcemaps && sourceMap && sourceMaps,
  ...rest,
  caller: {
    name: "custom-plugin-babel",
    supportsStaticESM: true,
    supportsDynamicImport: true,
    ...rest.caller,
  },
});

/**
 * Transforms the passed in code. Returning an object with the generated code,
 * source map, and AST.
 *
 * @see {@link https://babeljs.io/docs/en/babel-core#transformsync}
 *
 * @param {string} code
 * @param {Object} options
 * @returns
 */
async function transformBabel(code, options) {
  const res = await babel.transformAsync(code, options);

  return res;
}

/**
 * @see {@link https://rollupjs.org/guide/en/#transformers}
 * @param {Object} options
 * @returns
 */
function rollupPluginBabel(options) {
  const { include, exclude, ...rest } = unpackOptions(options);

  const filter = createFilter(include, exclude);

  return {
    transform(code, filename) {
      if (!filter(filename)) {
        return null;
      }

      const babelOptions = { ...rest, filename };

      return (async () => {
        const res = await transformBabel(code, babelOptions);
        return res;
      })();
    },
  };
}

export default rollupPluginBabel;
