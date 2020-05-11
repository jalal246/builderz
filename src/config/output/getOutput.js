import { join } from "path";
import getGlobal from "./getGlobalOutput";

import {
  UMD,
  CJS,
  ES,
  STRICT,
  ES_MODEL,
  BANNER,
  SOURCE_MAP,
} from "../../constants";
import { NotEmptyArr } from "../../utils";

/**
 * Gets full bundle name camelized with extension
 *
 * @param {Object} flags
 * @param {boolean} flags.isProd
 *
 * @param {string} camelizedName - camelized package name
 * @param {string} buildFormat - type of build (cjs|umd|etc)
 *
 * @returns {string} name with full extension
 */
function getBundleName({ name, buildFormat, isProd }) {
  let ext;

  if (buildFormat === UMD) {
    ext = "umd.js";
  } else if (buildFormat === CJS) {
    ext = "cjs.js";
  } else if (buildFormat === ES) {
    ext = "esm.js";
  }

  const fname = `${name}.${isProd ? `min.${ext}` : `${ext}`}`;

  return fname;
}

/**
 * Gets build
 *
 * @param {Object} flags
 * @param {boolean} flags.isProd
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
function getOutput(
  {
    output: { buildPath, name },
    opts: {
      [SOURCE_MAP]: isSourcemap,
      [BANNER]: banner,
      [ES_MODEL]: esModule,
      [STRICT]: strict,
    },
    pkg: { peerDependencies },
  },
  { isProd, buildFormat }
) {
  const bundleName = getBundleName({
    name,
    buildFormat,
    isProd,
  });

  const output = {
    file: join(buildPath, bundleName),
    format: buildFormat,
    esModule,
    strict,
    interop: false,
  };

  if (buildFormat === UMD) {
    output.name = name;
    output.globals = getGlobal(peerDependencies);
  }

  if ((isProd || buildFormat === UMD) && isSourcemap) {
    output.sourcemap = true;
  }

  if (banner && NotEmptyArr(banner)) {
    output.banner = banner;
  }

  return output;
}

export default getOutput;
