import camelize from "camelize";

/**
 * Don't include peerDependencies in a bundle.
 * Called when umd.
 *
 * @param {Object} peerDependencies
 * @returns Array of external deps not included in bundle.
 */
function getGlobal(peerDependencies) {
  return Object.keys(peerDependencies).reduce((deps, dep) => {
    // eslint-disable-next-line
    deps[dep] = camelize(dep);
    return deps;
  }, {});
}

export default getGlobal;
