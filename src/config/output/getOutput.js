import { join } from "path";

import {
  UMD,
  CJS,
  ES,
  STRICT,
  ES_MODEL,
  BANNER,
  SOURCE_MAP,
} from "../../constants";

import { NotEmptyArr, camelize } from "../../utils";

/**
 * Don't include peerDependencies in a bundle.
 * Called when umd.
 *
 * @param {Object} peerDependencies
 * @returns {Object} of external deps not included in bundle.
 */
function getGlobal(peerDependencies) {
  return peerDependencies
    ? Object.keys(peerDependencies).reduce((deps, dep) => {
        // eslint-disable-next-line
        deps[dep] = camelize(dep);
        return deps;
      }, {})
    : {};
}

/**
 * Gets full bundle name camelized with extension
 *
 * @param {boolean} isProd -
 * @param {string} name - camelized package name
 * @param {string} buildFormat - type of build (cjs|umd|etc)
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
 * Generates output build
 *
 * @param {Object}  {
 *     output: { buildPath, name },
 *     opts: {
 *       [SOURCE_MAP]: isSourcemap,
 *       [BANNER]: banner,
 *       [ES_MODEL]: esModule,
 *       [STRICT]: strict,
 *     },
 *     pkg: { peerDependencies },
 *   }
 * @param {Object} { isProd, buildFormat }

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
