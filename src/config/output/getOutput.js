import { join } from "path";
import getGlobal from "./getGlobalOutput";

import { UMD, CJS, ES } from "../../constants";

/**
 * Gets full bundle name camelized with extension
 *
 * @param {Object} flags
 * @param {boolean} flags.IS_PROD
 *
 * @param {string} camelizedName - camelized package name
 * @param {string} BUILD_FORMAT - type of build (cjs|umd|etc)
 *
 * @returns {string} name with full extension
 */
function getBundleName({ camelizedName, BUILD_FORMAT, flags: { IS_PROD } }) {
  let ext;

  if (BUILD_FORMAT === UMD) {
    ext = "umd.js";
  } else if (BUILD_FORMAT === CJS) {
    ext = "cjs.js";
  } else if (BUILD_FORMAT === ES) {
    ext = "esm.js";
  }

  const fname = `${camelizedName}.${IS_PROD ? `min.${ext}` : `${ext}`}`;

  return fname;
}

/**
 * Gets build
 *
 * @param {Object} flags
 * @param {boolean} flags.IS_PROD
 *
 * @param {string} camelizedName - camelized package name
 *
 * @param {Object} json
 * @param {Object} json.peerDependencies
 *
 * @param {string} distPath - where bundle will be located
 * @param {string} BUILD_FORMAT - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */
function getOutput({
  flags,
  camelizedName,
  json: { peerDependencies },
  dist,
  BUILD_FORMAT
}) {
  const { IS_PROD } = flags;

  const name = getBundleName({
    camelizedName,
    BUILD_FORMAT,
    flags: { IS_PROD }
  });

  const output = {
    file: join(dist, name),
    format: BUILD_FORMAT,
    name,
    interop: false
  };

  if (BUILD_FORMAT === UMD) {
    output.globals = getGlobal(peerDependencies);
  }

  if (IS_PROD || BUILD_FORMAT === UMD) {
    output.sourcemap = true;
  }

  return output;
}

export default getOutput;
