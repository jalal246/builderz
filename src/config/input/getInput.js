const getPlugins = require("./getInputPlugins");
const getExternal = require("./getInputExternal");

/**
 *
 *
 * @param {Object} input
 * @param {string} input.sourcePath - where package is located
 * @param {Array} input.presets - babel presets
 * @param {Object} input.flags - babel presets
 * @param {boolean} input.flags.IS_SILENT - babel presets
 * @param {string} input.flags.BUILD_FORMAT - babel presets
 * @param {string} input.flags.BABEL_ENV - babel presets
 *
 * @returns {Object} contains input option for the package.
 */
function genInput({
  flags: { IS_SILENT, BUILD_FORMAT, BABEL_ENV },
  peerDependencies,
  dependencies,
  sourcePath,
  advancedOpt
}) {
  const external = getExternal({
    peerDependencies,
    dependencies,
    BUILD_FORMAT
  });

  const plugins = getPlugins({
    IS_SILENT,
    BUILD_FORMAT,
    BABEL_ENV,
    advancedOpt
  });

  return {
    input: sourcePath,
    external,
    plugins
  };
}

module.exports = genInput;
