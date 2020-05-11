import { rollup } from "rollup";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";

import { getInput, getOutput } from "./config/index";

import { isValidArr, bindFunc, cash } from "./utils";

import { SORT_PACKAGES, PKG_PATHS, PKG_NAMES } from "./constants";

import StateHandler from "./store";

/**
 * Write bundle.
 *
 * @param {function} inputFunc
 * @param {function} outputFunc
 * @param {Object} { isProd, buildFormat, order }
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

/**
 * Bundling for each package
 *
 * @param {Object} state
 * @param {Object} pkgInfo - contains path for each json
 * @param {Object|string} json - string when no json is found
 * @param {number} index - index to call path if invalid package.json
 */
async function bundlePkg(state, pkgInfo, json, index) {
  cash({ types: "babel", isDestroy: true });

  let pkgPath;

  state.setNewPkg();

  if (typeof json === "string") {
    pkgPath = json;
  } else {
    /**
     * When name isn't valid, get-info assign index-order instead of name.
     */
    ({ path: pkgPath } = pkgInfo[json.name || index]);

    state.assignJson(json);
  }

  state.initOpts();

  await state.setPkgPath(pkgPath);

  const bundleOpt = state.unpackBundleOpts();

  /**
   * related to plugins.
   */
  state.extractName();
  state.extractEntries();
  state.extractAlias();

  const inputFunc = bindFunc(getInput, state);
  const outputFunc = bindFunc(getOutput, state);

  const buildFunc = bindFunc(build, inputFunc, outputFunc);

  await Promise.all(bundleOpt.map(buildFunc));
}

/**
 * Only for sorting packages in monorepo
 *
 * @param {Object} pkgJson
 * @param {function} bundlePkgFunc
 */
async function sortAndBump(pkgJson, bundlePkgFunc) {
  const { sorted, unSorted } = packageSorter(pkgJson);

  if (isValidArr(unSorted)) {
    console.error(`Unable to sort packages: ${unSorted}`);
  }

  await sorted.reduce(async (sortedPromise, json) => {
    await sortedPromise;

    await bundlePkgFunc(json);
  }, Promise.resolve());
}

/**
 * Main function
 *
 * @param {Object} opts
 */
async function builderz(opts) {
  const state = new StateHandler(opts);

  const {
    [PKG_NAMES]: pkgNames = [],
    [PKG_PATHS]: pkgPaths = [],
    [SORT_PACKAGES]: sortPackages = true,
  } = state.generalOpts;

  const { json: pkgJsonArr, pkgInfo = {}, unfoundJson } = isValidArr(pkgNames)
    ? getJsonByName(...pkgNames)
    : getJsonByPath(...pkgPaths);

  const bundlePkgFunc = bindFunc(bundlePkg, state, pkgInfo);

  try {
    if (isValidArr(unfoundJson)) {
      await Promise.all(unfoundJson.map((path, i) => bundlePkgFunc(path, i)));
    } else if (isValidArr(pkgJsonArr)) {
      const isSequence =
        pkgJsonArr.length > 1 && !isValidArr(unfoundJson) && sortPackages;

      if (isSequence) {
        await sortAndBump(pkgJsonArr, bundlePkgFunc);
      } else {
        await Promise.all(pkgJsonArr.map(bundlePkgFunc));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    cash({ isDestroy: true });
  }
}

export default builderz;
