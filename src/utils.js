import camelize from "camelize";
import { resolve } from "path";
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

/**
 * Gent bundle format and minify options
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
    minifyingProcess.forEach((bool) => {
      gen.push({ BUILD_FORMAT: format, IS_PROD: bool });
    });
  });

  return gen;
}

const opts = {};

function setOpt(localOpts, globalOpts) {
  opts.localOpts = localOpts;
  opts.globalOpts = globalOpts;
}

function getBoolean(localOpts, globalOpts, argName) {
  return isBoolean(localOpts[argName])
    ? localOpts[argName]
    : globalOpts[argName];
}

function getBooleanOpt(argName) {
  return getBoolean(opts.localOpts, opts.globalOpts, argName);
}

function getArr(localOpts, globalOpts, argName) {
  return Array.isArray(localOpts[argName]) && NotEmptyArr(localOpts[argName])
    ? localOpts[argName]
    : globalOpts[argName];
}
function getArrOpt(argName) {
  return getArr(opts.localOpts, opts.globalOpts, argName);
}

function extractAlias(generalOpts, localOpts, localPkgPath) {
  let alias;

  const { alias: LocalAlias } = localOpts;

  /**
   * If there's local alias passed in package, let's resolve the pass.
   */
  if (LocalAlias && LocalAlias.length > 0) {
    LocalAlias.forEach(({ replacement }, i) => {
      /**
       * Assuming we're working in `src` by default.
       */
      LocalAlias[i].replacement = resolve(localPkgPath, "src", replacement);
    });

    alias = LocalAlias;
  } else {
    alias = generalOpts.alias;
  }

  return alias;
}

function extractEntries({ entries }, entriesJson, defaultSrcPath) {
  // eslint-disable-next-line no-nested-ternary
  return entries.length > 0
    ? entries
    : entriesJson.length > 0
    ? entriesJson
    : defaultSrcPath;
}

export {
  setOpt,
  NotEmptyArr,
  camelizeOutputBuild,
  getBundleOpt,
  getBooleanOpt,
  getArrOpt,
  extractAlias,
  extractEntries,
};
