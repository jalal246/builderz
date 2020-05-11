import getPlugins from "./getInputPlugins";
import getExternal from "./getInputExternal";
import { cache } from "../../utils";

/**
 * Generates output build
 *
 * @param {Object} { plugins, output, opts, pkg }
 * @param {Object} { idx, isProd, buildFormat }
 * @returns {Object} contains input option for the package.
 */
function genInput(
  { plugins, output, opts, pkg },
  { idx, isProd, buildFormat }
) {
  const cacheObj = { type: "input", key: buildFormat };
  let externalFunc = cache(cacheObj);

  if (!externalFunc) {
    externalFunc = getExternal({ opts, pkg }, buildFormat);

    cache(cacheObj, externalFunc);
  }

  const extractedPlugins = getPlugins(
    { plugins, output, pkg, opts },
    { idx, isProd, buildFormat }
  );

  return {
    input: plugins.entries,
    external: externalFunc,
    plugins: extractedPlugins,
  };
}

export default genInput;
