import camelize from "camelize";
import isBoolean from "lodash.isboolean";

import { UMD, CJS, ES } from "./constants";

/**
 * Converts string to Array.
 *
 * @param {string} value
 * @returns {Array}
 */
function string2Arr(value) {
  return value.split(",");
}

/**
 * Extracts string to suit plugins entries
 * {@link https://www.npmjs.com/package/@rollup/plugin-alias}
 *
 * @param {string[]} alias - batman=../../../batman
 * @returns {Object[]} - {find, replacement}
 */
function parseAlias(aliasStr) {
  const alias = string2Arr(aliasStr).map((str) => {
    const [key, value] = str.split("=");
    return { find: key, replacement: value };
  });

  return alias;
}

function NotEmptyArr(arr) {
  return arr.length > 0;
}

/**
 * Checks if passed arr is type array and not empty
 *
 * @param {Array} arr
 * @returns {boolean}
 */
function isValidArr(arr) {
  return Array.isArray(arr) && NotEmptyArr(arr);
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

/**
 * Gen bundle format and minify options
 *
 * @param {Array} customFormats
 * @param {boolean} isMinify
 * @returns {Object[]} bundle output options
 */
function getBundleOpt(customFormats, isMinify) {
  const DEFAULT_FORMATS = [UMD, CJS, ES];

  const gen = [];

  const buildFormat = NotEmptyArr(customFormats)
    ? customFormats
    : DEFAULT_FORMATS;

  const minifyingProcess =
    NotEmptyArr(customFormats) && isBoolean(isMinify)
      ? [isMinify]
      : [true, false];

  buildFormat.forEach((format) => {
    minifyingProcess.forEach((bool, i) => {
      gen.push({ buildFormat: format, isProd: bool, order: i });
    });
  });

  return gen;
}

/**
 * binding primitive arg to a given function
 *
 * @param {function} func
 * @param {Any} argsBound
 * @returns {function}
 */
function bindFunc(func, ...argsBound) {
  // eslint-disable-next-line func-names
  return function (...args) {
    return func.call(this, ...argsBound, ...args);
  };
}

export {
  isValidArr,
  NotEmptyArr,
  camelizeOutputBuild,
  getBundleOpt,
  parseAlias,
  bindFunc,
};
