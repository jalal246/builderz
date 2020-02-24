const path = require("path");
const getGlobal = require("./getGlobalOutput");

const { UMD, CJS, ES, PROD } = require("../../constants");

/**
 * Gets full bundle name camelized with extension
 *
 * @param {*} { packageName, BUILD_FORMAT, BABEL_ENV }
 * @returns
 */
function getBundleName({ camelizedName, BUILD_FORMAT, BABEL_ENV }) {
  let ext;

  if (BUILD_FORMAT === UMD) {
    ext = "umd.js";
  } else if (BUILD_FORMAT === CJS) {
    ext = "cjs.js";
  } else if (BUILD_FORMAT === ES) {
    ext = "esm.js";
  }

  const fname = `${camelizedName}.${
    BABEL_ENV === PROD ? `min.${ext}` : `${ext}`
  }`;

  return fname;
}

function getOutput({ camelizedName, peerDependencies, distPath, flags }) {
  const { BABEL_ENV, BUILD_FORMAT } = flags;

  const name = getBundleName({ camelizedName, BUILD_FORMAT, BABEL_ENV });

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
