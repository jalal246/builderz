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

  const buildFormat =
    customFormats.length > 0 ? customFormats : DEFAULT_FORMATS;

  const minifyingProcess =
    customFormats.length > 0 && isMinify !== undefined
      ? [isMinify]
      : [true, false];

  buildFormat.forEach(format => {
    minifyingProcess.forEach(bool => {
      gen.push({ BUILD_FORMAT: format, IS_PROD: bool });
    });
  });

  return gen;
}

export { camelizeOutputBuild, getBundleOpt };
