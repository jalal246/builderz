/* eslint-disable func-names */

import packageSorter from "package-sorter";
import { getJsonByName } from "get-info";
import del from "del";

import { msg, error } from "@mytools/print";

import { camelizeOutputBuild } from "../utils";

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
async function initBuild(buildName = "dist", paths, packagesNames) {
  const { json, pkgInfo } = getJsonByName(
    buildName,
    ...paths
  )(...packagesNames);

  /**
   * Sort packages before bump to production.
   */
  const { sorted, unSorted } = packageSorter(json);

  if (unSorted.length > 0) {
    error(`Unable to sort packages: ${unSorted}`);
  }

  /**
   * Async Loop.
   * Cleans build if any, then camelize the name for production.
   *
   * {@link  https://stackoverflow.com/a/49499491/6348157}
   */
  await Object.keys(pkgInfo).reduce(async (promise, pkgName) => {
    /**
     * initialValue is resolved Promise, which means starts immediately. But,
     * next value will await until the whole process is finished.
     */
    await promise;

    const { dist } = pkgInfo[pkgName];

    await del(dist);

    const camelizedName = camelizeOutputBuild(pkgName);

    pkgInfo[pkgName].camelizedName = camelizedName;

    msg(
      camelizedName !== pkgName
        ? `bundle ${pkgName} as ${camelizedName}`
        : `bundle  ${camelizedName}`
    );

    //
  }, Promise.resolve());

  return {
    sorted,
    pkgInfo
  };
}

export default initBuild;
