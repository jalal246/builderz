import camelize from "camelize";
import isBoolean from "lodash.isboolean";
import { UMD, CJS, ES } from "./constants";

function NotEmptyArr(arr) {
  return arr.length > 0;
}

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

export { NotEmptyArr, camelizeOutputBuild };
