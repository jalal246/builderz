import { join } from "path";
import getGlobal from "./getGlobalOutput";

import { UMD, CJS, ES } from "../../constants";
import { NotEmptyArr } from "../../utils";

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
function getBundleName({ outputName, BUILD_FORMAT, flags: { IS_PROD } }) {
  let ext;

  if (BUILD_FORMAT === UMD) {
    ext = "umd.js";
  } else if (BUILD_FORMAT === CJS) {
    ext = "cjs.js";
  } else if (BUILD_FORMAT === ES) {
    ext = "esm.js";
  }

  const fname = `${outputName}.${IS_PROD ? `min.${ext}` : `${ext}`}`;

  return fname;
}

/**
 * Gets build
 *
 * @param {Object} flags
 * @param {boolean} flags.IS_PROD
 *
 * @param {string} outputName -  package output name
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
  outputName,
  json: { peerDependencies },
  buildPath,
  BUILD_FORMAT,
  banner,
}) {
  const { IS_PROD } = flags;

  const name = getBundleName({
    outputName,
    BUILD_FORMAT,
    flags: { IS_PROD },
  });

  const output = {
    file: join(buildPath, name),
    format: BUILD_FORMAT,
    name,
    interop: false,
  };

  if (BUILD_FORMAT === UMD) {
    output.globals = getGlobal(peerDependencies);
  }

  if (IS_PROD || BUILD_FORMAT === UMD) {
    output.sourcemap = true;
  }

  if (banner && NotEmptyArr(banner)) {
    output.banner = banner;
  }

  return output;
}

export default getOutput;
