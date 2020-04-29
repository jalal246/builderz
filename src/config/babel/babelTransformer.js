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

/**
 * Find if there's any conflict in preset or plugin and resolves it.
 *
 * @param {string} type - "preset" | "plugin"
 * @param {Array} injectedPresets injected presets or plugins
 * @param {Array} presets - presets or plugins got from babelrc
 */
function conflictResolver(type, injectedPresets, presets) {
  const indexes = {};

  const merged = presets.map((preset, i) => {
    const {
      file: { resolved },
    } = preset;

    const indx = injectedPresets.findIndex(
      ({ file: { resolved: id } }) => path.relative(id, resolved) === 0
    );

    /**
     * If there's a duplication and injectedPresets have options resolves this
     * duplication. Otherwise, just ignore it.
     */
    if (indx !== -1) {
      indexes[indx] = true;

      if (injectedPresets[indx].options) {
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

  if (indexes.length === injectedPresets.length) return merged;

  injectedPresets.forEach((injectedPreset, i) => {
    if (indexes[i]) {
      merged.push(injectedPreset);
    }
  });

  return merged;
}

/**
 *
 *
 * @param {*} type
 * @param {*} presets
 * @param {*} isESM
 * @returns
 */
function presetsHandler(type, presets, isESM) {
  const getter = type === "preset" ? getPlugins : getPresets;

  const injectedPresets = createConfigItems(type, getter.call(this, isESM));

  /**
   * If presets is empty, there's no need for resolving any conflict.
   */
  if (!isValidArr(presets)) {
    return injectedPresets;
  }

  return conflictResolver(type, injectedPresets, presets);
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

  // if (enablePlugins) {
  //   options.plugins = presetsHandler("plugin", options.plugins, isESM);
  // }

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
