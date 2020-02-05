const glob = require("glob");
const { resolve } = require("path");
const camelize = require("camelize");
const rimraf = require("rimraf");
const args = require("commander");

const fs = require("fs");

const { setIsSilent, msg, success, warning, error } = require("./print");

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

  /**
   * If length is zero, not monorepo.
   */
  if (folders.length === 0) {
    try {
      fs.accessSync("./src", fs.constants.R_OK);
    } catch (e) {
      error(e);
    }

    folders.push(".");
  }

  success(`> Found ${folders.length} packages`);

  return folders;
}

/**
 * Gets package json for each directories. Returns packages that only contain
 * valid src.
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
  packages = getPackagesPath(),
  buildFileName = "dist",

  srcFileName = "src"
} = {}) {
  msg("Reading package.json and setting packages paths");

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
      error(`${e}`);
      return false;
    }
  });

  const filtered = packagesInfo.filter(Boolean);

  success(`> Done extracting ${filtered.length} packages`);

  return filtered;
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
} = {}) {
  msg("Clearing build if there is any...");

  if (packages.length === 0) {
    warning("packages array is empty try looking into src");

    try {
      fs.accessSync(buildFilesName[0], fs.constants.R_OK);
    } catch (e) {
      warning("nothing to be removed");
    }

    packages.push("./dist");
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

/**
 * Get args pass to build command
 * @return {Object} contains flags and array of packages name
 */
function getArgs() {
  return args
    .option("-s, --silent", "silent mode, mutes build massages")
    .option("-w, --watch", "watch mode")
    .option("--format [format]", "specific build format")
    .option("-m, --minify", "minify bundle works only if format is provided")
    .option("PACKAGE_NAME", "for building specific package[s]")
    .parse(process.argv);
}

module.exports = {
  getPackagesPath,
  extractPackagesInfo,
  cleanBuildDir,
  camelizeOutputBuild,

  setIsSilent,

  msg,
  success,
  warning,
  error,

  getArgs
};
