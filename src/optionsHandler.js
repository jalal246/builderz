import isBoolean from "lodash.isboolean";
import { resolve } from "path";
import { NotEmptyArr } from "./utils";
import { UMD, CJS, ES } from "./constants";

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

/**
 * Inits options
 *
 * @param {Object} opts - input options
 * @returns {Object} - initialize options
 */
function initOpts(opts) {
  const options = {
    isSilent: true,
    formats: [],
    isMinify: undefined,
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

    options[option] = value;
  });

  return options;
}

function extractAlias(localPkgPath) {
  let alias;

  const { alias: LocalAlias } = opts.localOpts;

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
    alias = opts.globalOpts.alias;
  }

  return alias;
}

function extractEntries(entriesJson, defaultSrcPath) {
  // eslint-disable-next-line no-nested-ternary
  return opts.globalOpts.entries.length > 0
    ? opts.globalOpts.entries
    : entriesJson.length > 0
    ? entriesJson
    : defaultSrcPath;
}

export {
  setOpt,
  initOpts,
  getBooleanOpt,
  getArrOpt,
  extractAlias,
  extractEntries,
};
