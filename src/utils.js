import camelize from "camelize";
import { UMD, CJS, ES } from "./constants";

/**
 * Modify package name in package.json to name the output build correctly.
 * remove @
 * replace / with -
 * remove - and capitalize the first letter after it
 *
 * @param {string} name - package name in package.json
 * @returns {string} modified name for bundle
 */
function camelizeOutputBuild(name) {
  return camelize(name.replace("@", "").replace("/", "-"));
}

function genDefaultBundleOpt() {
  const FORMATS = [UMD, CJS, ES];

  const gen = [];

  FORMATS.forEach(format => {
    [true, false].forEach(bool => {
      gen.push({ BUILD_FORMAT: format, IS_PROD: bool });
    });
  });

  return gen;
}

/**
 * @returns {Object[]} bundle output options
 */
function getBundleOpt(BUILD_FORMAT, IS_PROD = false) {
  return BUILD_FORMAT ? [{ BUILD_FORMAT, IS_PROD }] : genDefaultBundleOpt();
}

export { camelizeOutputBuild, getBundleOpt };
