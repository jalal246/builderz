/* eslint-disable no-param-reassign */
import * as babel from "@babel/core";
import path from "path";
import { getPlugins, getPresets } from "./babelPresets";
import { isValidArr, cache } from "../../utils";

const PLUGIN = "plugin";
const PRESET = "preset";

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
 * Find if there's any conflict in preset or plugin and resolves it.
 *
 * @param {string} type - "preset" | "plugin"
 * @param {Array} injectedPresets injected presets or plugins
 * @param {Array} presets - presets or plugins got from babelrc
 * @returns {Array} resolved presets
 */
function conflictResolver(type, injectedPresets, presets) {
  /**
   * to store all injectedPresets indexes that's being handled.
   */
  const processedIndexes = {};

  const merged = presets.map((preset, i) => {
    const {
      file: { resolved },
    } = preset;

    const indx = injectedPresets.findIndex(
      ({ file: { resolved: id } }) => path.relative(id, resolved).length === 0
    );

    /**
     * If there's a duplication and injectedPresets have options resolves this
     * duplication. Otherwise, just ignore it.
     */
    if (indx !== -1) {
      processedIndexes[indx] = true;

      if (injectedPresets[indx].options) {
        /**
         * We can't assign freezed options, we need config a whole new preset.
         */
        return babel.createConfigItem(
          [
            require.resolve(injectedPresets[indx].file.resolved),
            Object.assign(injectedPresets[indx].options, presets[i].options),
          ],
          { type }
        );
      }
    }

    return preset;
  });

  if (processedIndexes.length === injectedPresets.length) return merged;

  injectedPresets.forEach((injectedPreset, i) => {
    if (!processedIndexes[i]) {
      merged.push(injectedPreset);
    }
  });

  return merged;
}

/**
 * handling presets.
 *
 * @param {string} type - "preset" | "plugin"
 * @param {Array} presets - presets or plugins got from babelrc
 * @param {boolean} isESM
 * @returns {Array} resolved presets
 */
function presetsHandler(type, presets, isESM) {
  const getter = type === PRESET ? getPresets : getPlugins;

  const injected = createConfigItems(type, getter.call(this, isESM));

  /**
   * If presets is empty, there's no need for resolving any conflict.
   */
  if (!isValidArr(presets)) {
    return injected;
  }

  return conflictResolver(type, injected, presets);
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
    const cacheObj = { type: "babel", key: `${PRESET}${+isESM}` };

    let result = cache(cacheObj);

    if (!result) {
      result = presetsHandler(PRESET, options.presets, isESM);

      cache(cacheObj, result);
    }

    options.presets = presetsHandler(PRESET, options.presets, isESM);
  }

  if (enablePlugins) {
    const cacheObj = { type: "babel", key: `${PLUGIN}${+isESM}` };

    let result = cache(cacheObj);

    if (!result) {
      result = presetsHandler(PLUGIN, options.plugins, isESM);

      cache(cacheObj, result);
    }

    options.plugins = presetsHandler(PLUGIN, options.plugins, isESM);
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
