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

  const cacheExt = { type: "babel", key: "extensions" };

  let extensionRegExp = cache(cacheExt);

  if (!extensionRegExp) {
    extensionRegExp = extRegExp(extensions);

    cache(cacheExt, extensionRegExp);
  }

  return {
    transform(code, filename) {
      if (!extensionRegExp.test(filename)) {
        return null;
      }

      if ((include || exclude) && !filter(filename)) {
        return null;
      }

      const cacheTransform = { type: "babel", key: filename };

      let res = cache(cacheTransform);

      if (res) {
        return res;
      }

      const babelOptions = {
        ...rest,
        filename,
      };

      res = babelTransformer(code, babelOptions);

      cache(cacheTransform, res);

      return res;
    },
  };
}

export default babelPlugin;
