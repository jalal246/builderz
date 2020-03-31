/* eslint-disable func-names */
import { resolve } from "path";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";
import del from "del";

import { msg, error } from "@mytools/print";

import { camelizeOutputBuild } from "../utils";

/**
 * initBuild packages for production:
 * gets path, json, ext.
 * clean previous build.
 * sort packages.
 *
 * @param {string} buildName
 * @param {Array} pkgNames - packages name to be built
 * @param {Array} pkgPaths - packages name to be built
 * @returns {Array} sortedJson
 */
async function initBuild(buildName, pkgPaths, pkgNames) {
  const { json, pkgInfo } =
    pkgNames.length > 0
      ? getJsonByName(...pkgNames)
      : getJsonByPath(...pkgPaths);

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

    const { path, ext } = pkgInfo[pkgName];

    const srcPath = resolve(path, "src", `index.${ext}`);

    const buildPath = resolve(path, buildName);

    await del(buildPath);

    const camelizedName = camelizeOutputBuild(pkgName);

    pkgInfo[pkgName].camelizedName = camelizedName;

    pkgInfo[pkgName].srcPath = srcPath;
    pkgInfo[pkgName].buildPath = buildPath;

    msg(
      camelizedName !== pkgName
        ? `bundle ${pkgName} as ${camelizedName}`
        : `bundle  ${camelizedName}`
    );
  }, Promise.resolve());

  return {
    sorted,
    pkgInfo
  };
}

export default initBuild;
