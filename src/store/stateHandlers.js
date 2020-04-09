import isBoolean from "lodash.isboolean";
import { resolve } from "path";
import { validateAccess } from "validate-access";
import { msg } from "@mytools/print";
import { NotEmptyArr, isValidArr, camelizeOutputBuild } from "../utils";
import { UMD, CJS, ES } from "../constants";
import state from "./store";

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
  const format = state.get("array", "formats");
  const isMinify = state.get("boolean", "minify");

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
    cleanBuild: false,
    camelCase: true,
    buildName: "dist",
    output: undefined,
    pkgPaths: [],
    pkgNames: [],
    alias: [],
    entries: [],
    banner: undefined,
  };

  Object.keys(options).forEach((option) => {
    // eslint-disable-next-line no-underscore-dangle
    const _default = options[option];

    const value = state[option] || _default;

    defaultOptions[option] = value;
  });

  return defaultOptions;
}

/**
 * Extract name based on output option if found, else, it looks if isCamelCase
 * then camelize. otherwise, return jsonPkgName.
 *
 * @param {string} jsonPkgName
 * @returns {string} - output name
 */
function extractName(jsonPkgName) {
  let output = jsonPkgName;

  const givenName = state.get("string", "output");

  if (givenName) {
    output = givenName;
  } else if (state.get("boolean", "camelCase")) {
    output = camelizeOutputBuild(jsonPkgName);
  }

  msg(`bundle output as ${output}`);

  return output;
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
function extractAlias(pkgPath) {
  const { alias: localAlias } = state.localOpts;

  if (!isValidArr(localAlias)) return state.globalOpts.alias;

  /**
   * If there's local alias passed in package, let's resolve the pass.
   */
  localAlias.forEach(({ replacement }, i) => {
    /**
     * Assuming we're working in `src` by default.
     */
    localAlias[i].replacement = resolve(pkgPath, "src", replacement);
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
  const entries = state.get("array", "entries");

  if (isValidArr(entries)) {
    return entries.map((entry) => resolve(pkgPath, entry));
  }

  if (isValidArr(entriesJson)) {
    return entriesJson.map((entryJson) => resolve(pkgPath, entryJson));
  }

  const { isValid, isSrc, ext } = validateAccess({
    dir: pkgPath,
    isValidateEntry: true,
    entry: "index",
    srcName: "src",
  });

  // eslint-disable-next-line no-nested-ternary
  return !isValid
    ? null
    : isSrc
    ? resolve(pkgPath, "src", `index.${ext}`)
    : resolve(pkgPath, `index.${ext}`);
}

export {
  extractBundleOpt,
  initOpts,
  extractAlias,
  extractEntries,
  extractName,
};
