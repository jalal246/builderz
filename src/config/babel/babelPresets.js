/**
 * getPlugins
 *
 * @param {boolean} isESM
 * @returns {Array}
 */
function getPlugins(isESM) {
  return [
    /**
     * This plugin transforms static class properties as well as properties
     * declared with the property initializer syntax.
     */
    {
      name: "@babel/plugin-proposal-class-properties",
      options: { loose: true },
    },

    /**
     * Currently, @babel/preset-env is unaware that using import().
     */
    {
      name: "@babel/plugin-syntax-dynamic-import",
    },

    isESM
      ? null
      : {
          name: "babel-plugin-transform-async-to-promises",
          options: {
            inlineHelpers: true,
            hoist: true,
          },
        },

    isESM
      ? null
      : {
          name: "@babel/plugin-transform-regenerator",
          options: {
            async: false,
          },
        },

    {
      name: "babel-plugin-macros",
    },
  ].filter(Boolean);
}

/**
 * getPresets
 *
 * @param {boolean} isESM
 * @returns {Array}
 */
function getPresets(isESM) {
  return [
    isESM ? { name: "@babel/preset-modules" } : { name: "@babel/preset-env" },
  ];
}

export { getPlugins, getPresets };
