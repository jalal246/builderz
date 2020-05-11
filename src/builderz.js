import { rollup } from "rollup";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";

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

async function bundlePkg(state, pkgInfo, json, index) {
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

  state.checkOpts();

  await state.setPkgPath(pkgPath);
  const bundleOpt = state.unpackBundleOpts();

  state.extractName();
  state.extractEntries();
  state.extractAlias();

  const inputFunc = bindFunc(getInput, state);
  const outputFunc = bindFunc(getOutput, state);
  const buildFunc = bindFunc(build, inputFunc, outputFunc);

  await Promise.all(bundleOpt.map(buildFunc));
}

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

  const bundlePkgFunc = bindFunc(bundlePkg, state, pkgInfo);

  try {
    if (isValidArr(unfoundJson)) {
      await Promise.all(unfoundJson.map((path, i) => bundlePkgFunc(path, i)));
    } else if (isValidArr(pkgJson)) {
      const isSequence =
        pkgJson.length > 1 && !isValidArr(unfoundJson) && sortPackages;

      if (isSequence) {
        await sortAndBump(pkgJson, bundlePkgFunc);
      } else {
        await Promise.all(pkgJson.map(bundlePkgFunc));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export default builderz;
