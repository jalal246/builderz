import getPlugins from "./getInputPlugins";
import getExternal from "./getInputExternal";

/**
 * Gets build input
 *
 * @param {Object} flags
 * @param {boolean} flags.isSilent
 * @param {boolean} flags.isProd
 *
 * @param {Object} json
 * @param {Object} json.peerDependencies
 * @param {Object} json.dependencies
 *
 * @param {string} sourcePath - where package is located
 * @param {string} buildFormat - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */
function genInput(
  { plugins, output, opts, pkg },
  { idx, isProd, buildFormat }
) {
  const externalFunc = getExternal({ opts, pkg }, buildFormat);

  const extractedPlugins = getPlugins(
    { plugins, output, pkg, opts },
    idx,
    isProd,
    buildFormat
  );

  return {
    input: plugins.entries,
    external: externalFunc,
    plugins: extractedPlugins,
  };
}

export default genInput;
