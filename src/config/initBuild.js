/* eslint-disable func-names */

import packageSorter from "package-sorter";
import { getJsonByName } from "get-info";
import { sync as delSync } from "del";

import { msg } from "@mytools/print";

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
function initBuild(buildName = "dist") {
  return function(...targetedPackages) {
    const { json, distPath } = getJsonByName(buildName)(targetedPackages);

    /**
     * Clean build if any.
     */
    delSync(distPath);

    /**
     * Sort packages before bump to production.
     */
    const sortedJson = packageSorter(json);

    msg("Done initiating build");

    return sortedJson;
  };
}

export default initBuild;
