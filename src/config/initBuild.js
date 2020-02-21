const { resolve } = require("path");
const packageSorter = require("package-sorter");
const { getPackagesInfo } = require("get-info");
const del = require("del");

const { msg } = require("@mytools/print");

/**
 * initBuild packages for production:
 * gets path, json, ext.
 * clean previous build.
 * sort packages.
 *
 * @param {string} [buildName="dist"]
 * @param {Array} targetedPackages - packages name to be built
 * @returns {Array} sortedJson
 */
function initBuild(buildName = "dist", ...targetedPackages) {
  const { json, path } = getPackagesInfo({ buildName })(targetedPackages);

  /**
   * Clean build if any.
   */
  const packagesPathDist = path.map(pkgPath => resolve(pkgPath, buildName));

  del.sync(packagesPathDist);

  /**
   * Sort packages before bump to production.
   */
  const sortedJson = packageSorter(json);

  msg("Done initiating build");

  return sortedJson;
}

module.exports = initBuild;
