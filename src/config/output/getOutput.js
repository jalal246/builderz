import path from "path";
import camelize from "camelize";

import { UMD, CJS, ES } from "../../formats";
import { camelizeOutputBuild } from "../../utils";

/**
 * Don't include peerDependencies in a bundle.
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

  const fname = `${bundleName}.${
    BABEL_ENV === "production" ? `min.${ext}` : `${ext}`
  }`;

  return fname;
}

function getOutput({ packageName, distPath, BABEL_ENV, BUILD_FORMAT }) {
  const name = getBundleName({ packageName, BUILD_FORMAT, BABEL_ENV });

  const output = {
    file: path.join(distPath, name),
    format: BUILD_FORMAT,
    name,
    interop: false
  };

  if (BUILD_FORMAT === UMD) {
    output.globals = getGlobal();
  }

  if (BABEL_ENV === "production" || BUILD_FORMAT === UMD) {
    output.sourcemap = true;
  }

  return output;
}

module.exports = getOutput;