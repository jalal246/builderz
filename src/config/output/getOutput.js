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
 * @param {string} buildFormat - type of build (cjs|umd|etc)
 *
 * @returns {string} name with full extension
 */
function getBundleName({ buildName, buildFormat, flags: { IS_PROD } }) {
  let ext;

  if (buildFormat === UMD) {
    ext = "umd.js";
  } else if (buildFormat === CJS) {
    ext = "cjs.js";
  } else if (buildFormat === ES) {
    ext = "esm.js";
  }

  const fname = `${buildName}.${IS_PROD ? `min.${ext}` : `${ext}`}`;

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
 * @param {string} buildFormat - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */
function getOutput({
  flags,
  outputBuild: { buildPath, buildName, buildFormat },
  json: { peerDependencies },
  isSourcemap,
  banner,
}) {
  const { IS_PROD } = flags;

  const name = getBundleName({
    buildName,
    buildFormat,
    flags: { IS_PROD },
  });

  const output = {
    file: join(buildPath, name),
    format: buildFormat,
    name,
    interop: false,
  };

  if (buildFormat === UMD) {
    output.globals = getGlobal(peerDependencies);
  }

  if ((IS_PROD || buildFormat === UMD) && isSourcemap) {
    output.sourcemap = true;
  }

  if (banner && NotEmptyArr(banner)) {
    output.banner = banner;
  }

  return output;
}

export default getOutput;
