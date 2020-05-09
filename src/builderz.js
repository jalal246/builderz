import { rollup } from "rollup";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";

import updateNotifier from "update-notifier";
import pkg from "../package.json";

import { getInput, getOutput } from "./config/index";

import { isValidArr, bindFunc } from "./utils";

import { SORT_PACKAGES, PKG_PATHS, PKG_NAMES } from "./constants";

import StateHandler from "./store";

/**
 * Write bundle.
 *
 * @param {Object} inputOptions
 * @param {Object} outputOptions
 */
async function build(inputFunc, outputFunc, { isProd, buildFormat, order }) {
  try {
    const input = await inputFunc({
      isProd,
      buildFormat,
      idx: order,
    });

    const output = await outputFunc({
      isProd,
      buildFormat,
    });

    /**
     * create a bundle
     */
    const bundle = await rollup(input);

    /**
     * write the bundle to disk
     */
    await bundle.write(output);
  } catch (err) {
    console.error(err);
  }
}

async function builderz(opts) {
  const state = new StateHandler(opts);

  const {
    [PKG_NAMES]: pkgNames = [],
    [PKG_PATHS]: pkgPaths = [],
    [SORT_PACKAGES]: sortPackages = true,
  } = state.generalOpts;

  const { json: pkgJson, pkgInfo = {}, unfoundJson } = isValidArr(pkgNames)
    ? getJsonByName(...pkgNames)
    : getJsonByPath(...pkgPaths);

  /**
   * Sort packages before bump to production.
   */
  const { sorted, unSorted } =
    isValidArr(pkgJson) && !isValidArr(unfoundJson) && sortPackages
      ? packageSorter(pkgJson)
      : { sorted: pkgJson };

  if (isValidArr(unSorted)) {
    console.error(`Unable to sort packages: ${unSorted}`);
  }

  if (isValidArr(unfoundJson)) {
    sorted.push(...unfoundJson);
  }

  try {
    await sorted.reduce(async (sortedPromise, json = {}, i) => {
      await sortedPromise;

      let pkgPath;

      if (typeof json !== "string") {
        /**
         * When name isn't valid, get-info assign index-order instead of name.
         */
        ({ path: pkgPath } = pkgInfo[json.name || i]);
      } else {
        pkgPath = json;
      }

      await state.setNewPkg(json).setPkgPath(pkgPath);

      state.extractName();
      state.extractEntries();
      state.extractAlias();

      const inputFunc = bindFunc(getInput, state);
      const outputFunc = bindFunc(getOutput, state);
      const buildFunc = bindFunc(build, inputFunc, outputFunc);

      await Promise.all(state.bundleOpt.map(buildFunc));
    }, Promise.resolve());
  } catch (err) {
    console.error(err);
  } finally {
    updateNotifier({ pkg }).notify();
  }
}

export default builderz;
