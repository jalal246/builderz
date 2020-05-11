import { UMD, CJS, ES } from "./constants";

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
 * Transforms key strings to camel-case
 *
 * @param {string} str
 * @returns {string}
 */
function camelize(str) {
  return str.replace(/[_.-](\w|$)/g, (ignore, x) => x.toUpperCase());
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
    NotEmptyArr(customFormats) && typeof isMinify === "boolean"
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
  camelize,
  camelizeOutputBuild,
  getBundleOpt,
  bindFunc,
};
