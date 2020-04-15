const { resolve } = require;

const basicPreset = {
  presets: [[resolve("@babel/preset-env"), { modules: false }]],

  plugins: [
    [
      /**
       * By default, this plugin uses Babel's extends helper which polyfills
       * Object.assign. Enabling useBuiltIns option will use Object.assign
       * directly.
       */
      require.resolve("@babel/plugin-proposal-object-rest-spread"),
      {
        useBuiltIns: true,
      },
    ],

    /**
     * This plugin transforms static class properties as well as properties
     * declared with the property initializer syntax.
     */
    [
      require.resolve("@babel/plugin-proposal-class-properties"),
      { loose: true },
    ],

    /**
     * Currently, @babel/preset-env is unaware that using import().
     */
    require.resolve("@babel/plugin-syntax-dynamic-import"),

    [
      require.resolve("babel-plugin-transform-async-to-promises"),
      {
        inlineHelpers: true,
        hoist: true,
      },
    ],

    require.resolve("babel-plugin-macros"),
  ],
};

export default basicPreset;
