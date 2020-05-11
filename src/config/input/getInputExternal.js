import { UMD, EXTERNAL } from "../../constants";

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
function getExternal(
  { opts: { [EXTERNAL]: external }, pkg: { peerDependencies, dependencies } },
  buildFormat
) {
  const externalArr =
    external && external.length > 0
      ? external
      : ["fs", "path", "events", "url", "util", "stream"];

  /**
   * Always exclude peer deps.
   */
  if (peerDependencies) {
    externalArr.push(...Object.keys(peerDependencies));
  }

  /**
   * Add dependencies to bundle when umd
   */
  if (buildFormat !== UMD && dependencies) {
    externalArr.push(...Object.keys(dependencies));
  }

  return externalArr.length === 0
    ? () => false
    : (id) => new RegExp(`^(${externalArr.join("|")})($|/)`).test(id);
}

export default getExternal;
