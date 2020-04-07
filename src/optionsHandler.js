import isBoolean from "lodash.isboolean";
import { resolve } from "path";
import { validateAccess } from "validate-access";
import { NotEmptyArr, isValidArr } from "./utils";
import { UMD, CJS, ES } from "./constants";

/**
 * Build Options provided by global arguments and local ones exist in each
 * build script.
 */
const opts = {};

/**
 * Assign options
 *
 * @param {Object} localOpts
 * @param {Object} globalOpts
 */
function setOpt(localOpts, globalOpts) {
  opts.localOpts = localOpts;
  opts.globalOpts = globalOpts;
}

/**
 * Get valid Boolean value exists in localOpts or globalOpts. localOpts have
 * always the priority.
 *
 * @param {Object} localOpts
 * @param {Object} globalOpts
 * @param {string} argName
 * @returns {boolean}
 */
function getBoolean(localOpts, globalOpts, argName) {
  return isBoolean(localOpts[argName])
    ? localOpts[argName]
    : globalOpts[argName];
}

/**
 * Extracts boolean value depending on localOpts and globalOpts that should be
 * already set.
 *
 * @param {string} argName
 * @returns {boolean}
 */
function getBooleanOpt(argName) {
  return getBoolean(opts.localOpts, opts.globalOpts, argName);
}

/**
 * Get valid Array exists in localOpts or globalOpts. localOpts have
 * always the priority.
 *
 * @param {Object} localOpts
 * @param {Object} globalOpts
 * @param {string} argName
 * @returns {Array}
 */
function getArr(localOpts, globalOpts, argName) {
  return isValidArr(localOpts[argName])
    ? localOpts[argName]
    : globalOpts[argName];
}

/**
 * Extracts array depending on localOpts and globalOpts that should be
 * already set.
 *
 * @param {string} argName
 * @returns {Array}
 */
function getArrOpt(argName) {
  return getArr(opts.localOpts, opts.globalOpts, argName);
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
    minifyingProcess.forEach((bool) => {
      gen.push({ BUILD_FORMAT: format, IS_PROD: bool });
    });
  });

  return gen;
}

/**
 * Extracts bundle options depending on localOpts and globalOpts that should be
 * already set.
 *
 * @returns {Array}
 */
function extractBundleOpt() {
  const format = getArrOpt("formats");
  const isMinify = getBooleanOpt("minify");

  return getBundleOpt(format, isMinify);
}

/**
 * Inits options
 *
 * @param {Object} options - input options
 * @returns {Object} - initialize options
 */
function initOpts(options) {
  const defaultOptions = {
    isSilent: true,
    formats: [],
    isMinify: undefined,
    camelCase: true,
    buildName: "dist",
    pkgPaths: [],
    pkgNames: [],
    alias: [],
    entries: [],
  };

  Object.keys(options).forEach((option) => {
    // eslint-disable-next-line no-underscore-dangle
    const _default = options[option];

    const value = opts[option] || _default;

    defaultOptions[option] = value;
  });

  return defaultOptions;
}

/**
 * Extracts alias. If there's local alias in package, then revolve path:
 * by adding localPkgPath:
     alias({
      entries: [
        { find: 'utils', replacement: 'localPkgPath/../../../utils' },
        { find: 'batman-1.0.0', replacement: 'localPkgPath/joker-1.5.0' }
      ]
 *
 * @param {string} localPkgPath
 * @returns {Array}
 */
function extractAlias(localPkgPath) {
  const { alias: localAlias } = opts.localOpts;

  if (!isValidArr(localAlias)) return opts.globalOpts.alias;

  /**
   * If there's local alias passed in package, let's resolve the pass.
   */
  localAlias.forEach(({ replacement }, i) => {
    /**
     * Assuming we're working in `src` by default.
     */
    localAlias[i].replacement = resolve(localPkgPath, "src", replacement);
  });

  return localAlias;
}

/**
 * Extracts entries by checking global entries, entries passed in Json as
 * property. If no valid entries, it returns default path: src/index.extension
 *
 * @param {Array} entriesJson
 * @param {string} pkgPath
 * @returns {Array|string}
 */
function extractEntries(entriesJson, pkgPath) {
  const {
    globalOpts: { entries },
  } = opts;

  const { isValid, isSrc, ext } = validateAccess({
    dir: pkgPath,
    isValidateEntry: true,
    entry: "index",
    srcName: "src",
  });

  // eslint-disable-next-line no-nested-ternary
  const defaultSrcPath = !isValid
    ? null
    : isSrc
    ? resolve(pkgPath, "src", `index.${ext}`)
    : resolve(pkgPath, `index.${ext}`);

  // eslint-disable-next-line no-nested-ternary
  return NotEmptyArr(entries)
    ? entries
    : NotEmptyArr(entriesJson)
    ? entriesJson
    : defaultSrcPath;
}

export {
  setOpt,
  extractBundleOpt,
  initOpts,
  getBooleanOpt,
  getArrOpt,
  extractAlias,
  extractEntries,
};
