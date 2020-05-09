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

let index = 0;

async function bundlePkg(state, pkgInfo, json = {}) {
  let pkgPath;

  if (typeof json !== "string") {
    /**
     * When name isn't valid, get-info assign index-order instead of name.
     */
    ({ path: pkgPath } = pkgInfo[json.name || index]);
  } else {
    pkgPath = json;
  }

  index += 1;

  await state.setNewPkg(json).setPkgPath(pkgPath);

  state.extractName();
  state.extractEntries();
  state.extractAlias();

  const inputFunc = bindFunc(getInput, state);
  const outputFunc = bindFunc(getOutput, state);
  const buildFunc = bindFunc(build, inputFunc, outputFunc);

  await Promise.all(state.bundleOpt.map(buildFunc));
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

  const isSequence =
    pkgJson.length > 1 && !isValidArr(unfoundJson) && sortPackages;

  /**
   * Sort packages before bump to production.
   */
  const { sorted, unSorted } = isSequence
    ? packageSorter(pkgJson)
    : { sorted: pkgJson };

  if (isValidArr(unSorted)) {
    console.error(`Unable to sort packages: ${unSorted}`);
  }

  if (isValidArr(unfoundJson)) {
    sorted.push(...unfoundJson);
  }

  const bundlePkgFunc = bindFunc(bundlePkg, state, pkgInfo);

  try {
    if (isSequence) {
      await sorted.reduce(async (sortedPromise, json) => {
        await sortedPromise;

        await bundlePkgFunc(json);
      }, Promise.resolve());
    } else {
      await Promise.all(sorted.map(bundlePkgFunc));
    }
  } catch (err) {
    console.error(err);
  } finally {
    updateNotifier({ pkg }).notify();
  }
}

export default builderz;
