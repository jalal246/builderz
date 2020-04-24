import * as babel from "@babel/core";

function createConfigItems(type, items) {
  return items.map(({ name, ...options }) => {
    return babel.createConfigItem([require.resolve(name), options], { type });
  });
}

async function babelTransformer(inputCode, babelOptions, presets, plugins) {
  /**
   * To manipulate and validate a user's config. it resolves the plugins and
   * presets and proceeds no further.
   * Gets the full config including babel's.
   */
  const { options } = babel.loadPartialConfig(babelOptions);

  if (plugins) {
    options.plugins.push(createConfigItems("plugin", plugins));
  }

  if (presets) {
    options.presets.push(createConfigItems("preset", presets));
  }

  /**
   * file is ignored by babel
   */
  if (!options) {
    return null;
  }

  const { code, map } = await babel.transformAsync(inputCode, babelOptions);

  return {
    code,
    map,
  };
}

export default babelTransformer;
