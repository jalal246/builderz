import packageSorter from "package-sorter";

import { getPackagesPath, extractPackagesInfo, cleanBuildDir } from "../utils";

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
function initBuild() {
  /**
   * get all packages.
   */
  const allPackages = getPackagesPath();

  /**
   * extract jso form each package.
   */
  const packagesInfo = extractPackagesInfo({
    packages: allPackages,

    buildFileName: "dist",
    srcFileName: "src"
  });

  /**
   * Clean build if any.
   */
  cleanBuildDir({
    packages: allPackages,
    buildFilesName: ["dist"]
  });

  /**
   * Sort packages before bump to production.
   */
  const sorted = packageSorter({ packages: packagesInfo });

  return sorted;
}

module.exports = initBuild;
