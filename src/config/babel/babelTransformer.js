import * as babel from "@babel/core";
import { getPlugins, getPresets } from "./babelPresets";

/**
 * Creates config items for babel.
 * @see {@link https://babeljs.io/docs/en/babel-core#createconfigitem}
 *
 * @param {string} type - "preset" | "plugin"
 * @param {Array} items - array of plugins/preset
 * @returns {Array} of configured list
 */
function createConfigItems(type, items) {
  return items.map(({ name, options }) => {
    return babel.createConfigItem([require.resolve(name), options], { type });
  });
}

/**
 * Transforms the passed in code. Returning an promise for an object with the
 * generated code, and source map.
 *
 * @param {string} inputCode
 * @param {Object} babelOptions - options passed by user
 * @returns {Objects} { code, map}
 */
async function babelTransformer(inputCode, babelOptions) {
  const { isEnablePreset, isEnablePlugins, isESM, ...rest } = babelOptions;

  let plugins;
  let presets;

  if (isEnablePreset) {
    presets = getPresets(isESM);
  }

  if (isEnablePlugins) {
    plugins = getPlugins(isESM);
  }

  /**
   * To manipulate and validate a user's config. it resolves the plugins and
   * presets and proceeds no further.
   * Gets the full config including babel's.
   */
  const { options } = babel.loadPartialConfig(rest);

  if (plugins) {
    options.plugins.push(...createConfigItems("plugin", plugins));
  }

  if (presets) {
    options.presets.push(...createConfigItems("preset", presets));
  }

  /**
   * file is ignored by babel
   */
  if (!options) {
    return null;
  }

  const { code, map } = await babel.transformAsync(inputCode, options);

  return {
    code,
    map,
  };
}

export default babelTransformer;
