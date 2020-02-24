const { UMD } = require("../../constants");
const getPlugins = require("./getInputPlugins");

/**
 * Resolves external dependencies and peerDependencies for package input
 * according to build format.
 *
 * @param {Object} packageJson
 * @param {Object} packageJson.peerDependencies
 * @param {Object} packageJson.dependencies
 * @param {string} - BUILD_FORMAT
 *
 * @returns {function} - function resolver
 */
function getExternal({ peerDependencies, dependencies, BUILD_FORMAT }) {
  const external = [];

  /**
   * Always exclude peer deps.
   */
  if (peerDependencies) {
    external.push(...Object.keys(peerDependencies));
  }

  /**
   * Add dependencies to bundle when umd
   */
  if (BUILD_FORMAT !== UMD) {
    external.push(...Object.keys(dependencies));
  }

  return external.length === 0
    ? () => false
    : id => new RegExp(`^(${external.join("|")})($|/)`).test(id);
}

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
  presets,
  ...advancedOpt
}) {
  const external = getExternal({
    peerDependencies,
    dependencies,
    BUILD_FORMAT
  });

  const plugins = getPlugins({
    presets,
    IS_SILENT,
    BUILD_FORMAT,
    BABEL_ENV,
    ...advancedOpt
  });

  return {
    input: sourcePath,
    external,
    plugins
  };
}

module.exports = genInput;
