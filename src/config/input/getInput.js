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
function genInput({
  flags: { isSilent, isProd },
  json: { peerDependencies, dependencies },
  outputBuild: { pkgPath, buildPath, buildName, buildFormat },
  babel,
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
    isSilent,
    isProd,
    pkgPath,
    buildFormat,
    buildPath,
    buildName,
    isMultiEntries,
    babel,
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
