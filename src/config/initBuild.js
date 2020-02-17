const packageSorter = require("package-sorter");

const { msg } = require("@mytools/print");
const {
  getPackagesPath,
  extractPackagesInfo,
  cleanBuildDir
} = require("../utils");

function extractJson(packages, buildName = "dist", srcName = "src") {
  /**
   * get all packages.
   */
  const allPackages = getPackagesPath();

  /**
   * extract json form each package.
   */
  const packagesInfo = extractPackagesInfo({
    packages: allPackages,

    buildFileName: buildName,
    srcFileName: srcName
  });

  if (packages.length === 0) {
    return {
      isFiltered: false,
      filteredPackages: packages
    };
  }

  const filteredPackages = packagesInfo.filter(({ name }) => {
    return packages.includes(name);
  });

  const isFiltered = filteredPackages.length > 0;

  return {
    isFiltered,
    filteredPackages: isFiltered ? filteredPackages : packages
  };
}

/**
 * initBuild packages for production:
 *
 * 1- get path.
 * 2- validate and extract info.
 * 3- clean previous build.
 * 4- sort packages.
 *
 * @returns {Array} sorted packages
 */
function initBuild(targetedPackages) {
  const { packagesPath, packagesInfo } = extractJson(targetedPackages);
  /**
   * Clean build if any.
   */
  cleanBuildDir({
    packages: packagesPath,
    buildFilesName: ["dist"]
  });

  /**
   * Sort packages before bump to production.
   */
  const sorted = packageSorter(packagesInfo);

  msg("Done initiating build");

  return sorted;
}

module.exports = initBuild;
