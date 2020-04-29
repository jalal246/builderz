/* eslint-disable no-param-reassign */
import * as babel from "@babel/core";
import path from "path";
import { getPlugins, getPresets } from "./babelPresets";
import { isValidArr } from "../../utils";

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

function findConflict(type, embeddedPresets, userPresets) {
  userPresets.forEach((preset, i) => {
    const {
      file: { resolved },
    } = preset;

    const indx = embeddedPresets.findIndex(
      ({ file: { resolved: id } }) => path.relative(id, resolved) === 0
    );

    if (indx !== -1 && embeddedPresets[indx].options) {
      const merged = babel.createConfigItem(
        [
          require.resolve(embeddedPresets[indx].file.resolved),
          Object.assign(embeddedPresets[indx].options, userPresets[i].options),
        ],
        { type }
      );

      return { indx, merged };
    }

    return null;
  });
}

function presetsHandler(type, presets, isESM) {
  const getter = type === "preset" ? getPlugins : getPresets;

  const embeddedPresets = createConfigItems(type, getter.call(this, isESM));

  if (!isValidArr(presets)) {
    return embeddedPresets;
  }

  const result = findConflict(type, embeddedPresets, presets);

  if (result) {
    presets[result.indx] = result.merged;
  }

  return presets;
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
  const { enablePreset, enablePlugins, isESM, ...rest } = babelOptions;

  /**
   * To manipulate and validate a user's config. it resolves the plugins and
   * presets and proceeds no further.
   * Gets the full config including babel's.
   */
  const { options } = babel.loadPartialConfig(rest);

  if (enablePreset) {
    options.presets = presetsHandler("preset", options.presets, isESM);
  }

  if (enablePlugins) {
    options.plugins = presetsHandler("plugin", options.plugins, isESM);
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
