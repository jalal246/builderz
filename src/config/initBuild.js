/* eslint-disable func-names */

import packageSorter from "package-sorter";
import { move } from "move-position";
import { getJsonByName } from "get-info";
import { sync as delSync } from "del";

import { msg, error } from "@mytools/print";

/**
 * initBuild packages for production:
 * gets path, json, ext.
 * clean previous build.
 * sort packages.
 *
 * @param {string} [buildName="dist"]
 * @param {Array} packagesNames - packages name to be built
 * @returns {Array} sortedJson
 */
function initBuild(buildName = "dist", ...path) {
  return function(...packagesNames) {
    const { json, pkgInfo } = getJsonByName(
      buildName,
      ...path
    )(...packagesNames);

    /**
     * Clean build if any.
     */
    Object.keys(pkgInfo).forEach(pkgName => {
      const { dist } = pkgInfo[pkgName];

      delSync(dist);
    });

    /**
     * Sort packages before bump to production.
     */
    const { sorted, unSorted } = packageSorter(json);

    if (unSorted.length > 0) {
      error(`Unable to sort packages: ${unSorted}`);
    }

    msg("Done initiating build");

    return { sorted, pkgInfo };
  };
}

export default initBuild;
