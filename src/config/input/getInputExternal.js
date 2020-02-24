const { UMD } = require("../../constants");

/**
 * Resolves external dependencies and peerDependencies for package input
 * according to build format.
 *
 * @param {Object} json.peerDependencies
 * @param {Object} json.dependencies
 * @param {string} BUILD_FORMAT
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

module.exports = getExternal;
