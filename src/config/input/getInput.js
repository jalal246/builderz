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
  const externalFunc = getExternal({ opts, pkg }, buildFormat);

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
