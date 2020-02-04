const path = require("path");
const camelize = require("camelize");

const { UMD, CJS, ES, PROD } = require("../../constants");
const { camelizeOutputBuild } = require("../../utils");

/**
 * Don't include peerDependencies in a bundle.
 *
 * @param {Object} peerDependencies
 * @returns Array of external deps not included in bundle.
 */
function getGlobal(peerDependencies = {}) {
  return Object.keys(peerDependencies).reduce((deps, dep) => {
    // eslint-disable-next-line
    deps[dep] = camelize(dep);
    return deps;
  }, {});
}

/**
 * Gets full bundle Name camelize with extension
 *
 * @param {*} { packageName, BUILD_FORMAT, BABEL_ENV }
 * @returns
 */
function getBundleName({ packageName, BUILD_FORMAT, BABEL_ENV }) {
  const bundleName = camelizeOutputBuild(packageName);

  let ext;

  if (BUILD_FORMAT === UMD) {
    ext = "umd.js";
  } else if (BUILD_FORMAT === CJS) {
    ext = "cjs.js";
  } else if (BUILD_FORMAT === ES) {
    ext = "esm.js";
  }

  const fname = `${bundleName}.${BABEL_ENV === PROD ? `min.${ext}` : `${ext}`}`;

  return fname;
}

function getOutput({ packageName, peerDependencies, distPath, flags }) {
  const { BABEL_ENV, BUILD_FORMAT } = flags;

  const name = getBundleName({ packageName, BUILD_FORMAT, BABEL_ENV });

  const output = {
    file: path.join(distPath, name),
    format: BUILD_FORMAT,
    name,
    interop: false
  };

  if (BUILD_FORMAT === UMD) {
    output.globals = getGlobal(peerDependencies);
  }

  if (BABEL_ENV === PROD || BUILD_FORMAT === UMD) {
    output.sourcemap = true;
  }

  return output;
}

module.exports = getOutput;
