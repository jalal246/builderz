import { createFilter } from "@rollup/pluginutils";
import babelTransformer from "./babelTransformer";
import extRegExp from "./utils";
import { cache } from "../../utils";

const unpackOptions = ({
  // rollup uses sourcemap, babel uses sourceMaps
  // just normalize them here so people don't have to worry about it
  sourcemap = true,
  sourcemaps = true,
  sourceMap = true,
  sourceMaps = true,
  isESM,
  ...rest
} = {}) => ({
  plugins: [],
  sourceMaps: sourcemap && sourcemaps && sourceMap && sourceMaps,
  ...rest,
  caller: {
    name: "custom-plugin-babel",
    supportsStaticESM: !isESM,
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
  const { include, exclude, extensions, ...rest } = unpackOptions(options);

  const filter = createFilter(include, exclude);

  const extensionRegExp = extRegExp(extensions);

  return {
    transform(code, filename) {
      if (!extensionRegExp.test(filename)) {
        return null;
      }

      if (!filter(filename)) {
        return null;
      }

      const cacheObj = { type: "babel", key: filename };

      const result = cache(cacheObj);

      if (result) {
        return result;
      }

      const babelOptions = {
        ...rest,
        filename,
      };

      const res = babelTransformer(code, babelOptions);

      cache(cacheObj, res);

      return res;
    },
  };
}

export default babelPlugin;
