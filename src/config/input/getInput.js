import getPlugins from "./getInputPlugins";
import getExternal from "./getInputExternal";

/**
 * Gets build input
 *
 * @param {Object} flags
 * @param {boolean} flags.IS_SILENT
 * @param {boolean} flags.IS_PROD
 *
 * @param {Object} json
 * @param {Object} json.peerDependencies
 * @param {Object} json.dependencies
 *
 * @param {string} sourcePath - where package is located
 * @param {string} BUILD_FORMAT - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */
function genInput({
  flags: { IS_SILENT, IS_PROD },
  json: { peerDependencies, dependencies },
  entries,
  BUILD_FORMAT,
  alias
}) {
  const external = getExternal({
    peerDependencies,
    dependencies,
    BUILD_FORMAT
  });

  const isMultiEntries = Array.isArray(entries);

  const plugins = getPlugins({
    IS_SILENT,
    IS_PROD,
    BUILD_FORMAT,
    isMultiEntries,
    alias
  });

  return {
    input: entries,
    external,
    plugins
  };
}

export default genInput;
