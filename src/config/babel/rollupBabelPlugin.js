import { createFilter } from "@rollup/pluginutils";
import babelTransformer from "./babelTransformer";

const unpackOptions = ({
  // rollup uses sourcemap, babel uses sourceMaps
  // just normalize them here so people don't have to worry about it
  sourcemap = true,
  sourcemaps = true,
  sourceMap = true,
  sourceMaps = true,
  ...rest
} = {}) => ({
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
 *
 * @see {@link https://rollupjs.org/guide/en/#transformers}
 * @param {Object} options - babel options passed by user
 * @param {Array} plugins - essential plugins
 * @param {Array} presets - essential presets
 * @returns {Objects} { code, map}
 */
function babelPlugin(options) {
  const { include, exclude, ...rest } = unpackOptions(options);

  const filter = createFilter(include, exclude);

  return {
    transform(code, filename) {
      if (!filter(filename)) {
        return null;
      }

      const babelOptions = {
        ...rest,
        filename,
      };

      return babelTransformer(code, babelOptions);
    },
  };
}

export default babelPlugin;
