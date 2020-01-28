import beep from "@rollup/plugin-beep";
import auto from "@rollup/plugin-auto-install";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";

import { UMD } from "../formats";

function getPlugins(BUILD_FORMAT) {
  const plugins = [
    /**
     * Beeps when a build ends with errors.
     */
    beep(),

    /**
     * Automatically installs dependencies that are imported by a bundle, even
     * if not yet in package.json.
     */
    auto(),

    /**
     * Convert CommonJS modules to ES6, so they can be included in a Rollup
     * bundle.
     */
    commonjs(),

    /**
     * Converts .json files to ES6 modules.
     */
    json(),

    /**
     * Replaces strings in files while bundling.
     */
    replace({ "process.env.NODE_ENV": JSON.stringify("BABEL_ENV") })
  ];

  if (BUILD_FORMAT === UMD) {
    plugins.push(
      /**
       * Locates modules using the Node resolution algorithm, for using third
       * party modules in node_modules.
       */
      resolve({ extensions: [".mjs", ".js", ".json", ".node"] })
    );
  }

  return plugins;
}

module.exports = getPlugins;
