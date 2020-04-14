import { UMD } from "../../constants";

/**
 * Resolves external dependencies and peerDependencies for package input
 * according to build format.
 *
 * @param {Object} json.peerDependencies
 * @param {Object} json.dependencies
 * @param {string} buildFormat
 *
 * @returns {function} - function resolver
 */
function getExternal({ peerDependencies, dependencies, buildFormat }) {
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
  if (buildFormat !== UMD) {
    external.push(...Object.keys(dependencies));
  }

  return external.length === 0
    ? () => false
    : (id) => new RegExp(`^(${external.join("|")})($|/)`).test(id);
}

export default getExternal;
