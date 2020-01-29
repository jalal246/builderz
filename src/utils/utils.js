import glob from "glob";
import { resolve } from "path";
import camelize from "camelize";
import rimraf from "rimraf";

import fs from "fs";

import { msg, success, warning, error } from "./print";

/**
 * @export
 * @param {Object} input
 * @param {string} input.path  packages path [path="./packages/*"]
 * @returns Array contains packages directory
 */
function getPackagesPath({ path = "./packages/*" } = {}) {
  msg("Getting packages path...");

  let folders = [];

  folders = glob.sync(path);

  if (folders.length === 0) {
    error(`unable to detect any package in ${path}`);
  } else {
    success(`> found ${folders.length} packages`);
  }

  return folders;
}

/**
 * Gets package json for each directories
 *
 * @export
 * @param {Object} input
 * @param {Array} input.packages
 * @param {string} input.buildFileName [buildFileName="dist"]
 * @param {string} input.srcFileName [srcFileName="src"]
 *
 * @returns {Object[]} packInfo
 * @returns {string} packInfo[].sourcePath
 * @returns {string} packInfo[].distPath
 * @returns {string} packInfo[].name
 * @returns {string} packInfo[].peerDependencies
 * @returns {string} packInfo[].dependencies
 */
function extractPackagesInfo({
  packages = [],
  buildFileName = "dist",

  srcFileName = "src"
}) {
  msg("Reading package.json and setting packages paths");

  if (packages.length === 0) {
    error("packages array is empty");
  }

  const packagesInfo = packages.map(pkg => {
    const path = resolve(pkg, "package.json");

    try {
      // check for package readability
      fs.accessSync(path, fs.constants.R_OK);

      const json = fs.readFileSync(path, "utf8");

      const { name, peerDependencies, dependencies } = JSON.parse(json);

      // check for src/index readability
      const sourcePath = resolve(pkg, srcFileName, "index.js");

      fs.accessSync(sourcePath, fs.constants.R_OK);

      const distPath = resolve(pkg, buildFileName);

      return {
        sourcePath,
        distPath,
        name,
        peerDependencies,
        dependencies
      };
    } catch (e) {
      warning(`${e}`);
      return false;
    }
  });

  return packagesInfo.filter(Boolean);
}

/**
 * Clean directories form previous build.
 *
 * @param {Object} input
 * @param  {Array}  input.packages=[] Array of packages path
 * @param  {Array}  input.buildFilesName=["dist"]  name of bundle folder
 */
function cleanBuildDir({
  packages = [],
  buildFilesName = ["dist" /* "coverage" */]
}) {
  msg("Clearing if there is any...");

  if (packages.length === 0) {
    error("packages array is empty");
  }

  // for each package
  packages.forEach(pkg => {
    // remove these files
    buildFilesName.forEach(file => {
      const path = resolve(pkg, file);

      const folders = glob.sync(path);
      if (folders.length > 0) {
        rimraf.sync(path);
        success(`> removing ${file} from ${pkg}`);
      }
    });
  });
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

module.exports = {
  getPackagesPath,
  extractPackagesInfo,
  cleanBuildDir,
  camelizeOutputBuild,

  msg,
  success,
  warning,
  error
};
