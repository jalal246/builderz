/* eslint-disable no-param-reassign */
import * as babel from "@babel/core";
import merge from "babel-merge";
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

function d0(type = "preset", getter = getPresets, isESM, options) {
  const presets = createConfigItems(type, [getter](isESM));

  const typPlural = `${type}s`;

  if (!isValidArr(options[typPlural])) {
    options[typPlural] = presets;

    return options;
  }

  options[typPlural].forEach((preset, i) => {
    const {
      file: { resolved },
    } = preset;

    const conflicted = presets.findIndex(
      ({ file: { resolved: id } }) => id === resolved
    );

    if (conflicted !== -1 && presets[conflicted].options) {
      options[typPlural][i].options = Object.assign(
        presets[conflicted].options,
        options[typPlural][i].options
      );
    }
  });

  return options;
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
    const presets = createConfigItems("preset", getPresets(isESM));

    if (!isValidArr(options.presets)) {
      options.presets = presets;
    } else {
      options.presets.forEach((preset, i) => {
        const {
          file: { resolved, request },
        } = preset;

        const conflicted = presets.findIndex(
          ({ file: { resolved: id } }) => id === resolved
        );

        if (conflicted !== -1 && presets[conflicted].options) {
          options.presets[i] = babel.createConfigItem(
            [
              require.resolve(presets[conflicted].file.resolved),
              Object.assign(
                presets[conflicted].options,
                options.presets[i].options
              ),
            ],
            { type: "preset" }
          );
        }
      });
    }
  }

  // if (enablePlugins) {
  //   const plugins = createConfigItems("plugin", getPlugins(isESM));

  //   if (isValidArr(options.plugins)) {
  //     options.overrides = [
  //       {
  //         plugins,
  //       },
  //     ];
  //   } else {
  //     options.plugins.push(...plugins);
  //   }
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
