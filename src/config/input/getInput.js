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
  flags,
  json: { peerDependencies, dependencies },
  outputBuild,
  pkgPath,
  babel,
  entries,
  alias,
  idx,
}) {
  const external = getExternal({
    peerDependencies,
    dependencies,
    buildFormat: outputBuild.buildFormat,
  });

  const plugins = getPlugins({
    flags,
    outputBuild,
    alias,
    idx,
    babel,
    pkgPath,
  });

  return {
    input: entries,
    external,
    plugins,
  };
}

export default genInput;
