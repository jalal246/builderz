function getPlugins() {
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

    {
      name: "babel-plugin-transform-async-to-promises",
      options: {
        inlineHelpers: true,
        hoist: true,
      },
    },

    {
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

function getPresets() {
  return [{ name: "@babel/preset-env", options: { modules: false } }];
}

export { getPlugins, getPresets };
