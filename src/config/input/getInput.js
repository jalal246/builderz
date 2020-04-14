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
 * @param {string} buildFormat - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */
function genInput({
  flags: { IS_SILENT, IS_PROD },
  json: { peerDependencies, dependencies },
  outputBuild: { buildPath, buildName, buildFormat },
  entries,
  alias,
  idx,
}) {
  const external = getExternal({
    peerDependencies,
    dependencies,
    buildFormat,
  });

  const isMultiEntries = Array.isArray(entries);

  const plugins = getPlugins({
    IS_SILENT,
    IS_PROD,
    buildFormat,
    buildPath,
    buildName,
    isMultiEntries,
    alias,
    idx,
  });

  return {
    input: entries,
    external,
    plugins,
  };
}

export default genInput;
