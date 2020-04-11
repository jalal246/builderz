import { resolve } from "path";
import { rollup } from "rollup";
import { error } from "@mytools/print";
import del from "del";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";

import { getInput, getOutput } from "./config/index";

import { NotEmptyArr } from "./utils";

import { CLEAN_BUILD, BANNER } from "./constants";

import StateHandler from "./store";

/**
 * Write bundle.
 *
 * @param {Object} inputOptions
 * @param {Object} outputOptions
 */
async function build(inputOptions, outputOptions) {
  try {
    /**
     * create a bundle
     */
    const bundle = await rollup(inputOptions);

    /**
     * write the bundle to disk
     */
    await bundle.write(outputOptions);
  } catch (err) {
    error(err);
  }
}

async function builderz(opts, { isInitOpts = true } = {}) {
  const state = new StateHandler(opts, isInitOpts);

  const { buildName, pkgPaths, pkgNames } = state.generalOpts;

  const { json: allPkgJson, pkgInfo: allPkgInfo } = NotEmptyArr(pkgNames)
    ? getJsonByName(...pkgNames)
    : getJsonByPath(...pkgPaths);

  /**
   * Sort packages before bump to production.
   */
  const { sorted, unSorted } = packageSorter(allPkgJson);

  if (NotEmptyArr(unSorted)) {
    error(`Unable to sort packages: ${unSorted}`);
  }

  try {
    await sorted.reduce(async (sortedPromise, json) => {
      await sortedPromise;

      state.setPkgJsonOpts(json);

      state.setPkgBuildOpts();

      const { name, peerDependencies = {}, dependencies = {} } = json;

      const { isSilent } = state.generalOpts;

      const pkgInfo = allPkgInfo[name];

      const { path: pkgPath } = pkgInfo;

      state.setPkgPath(pkgPath);

      const buildPath = resolve(pkgPath, buildName);

      console.log("builderz -> state.get(CLEAN_BUILD)", state.get(CLEAN_BUILD));
      if (state.get(CLEAN_BUILD)) {
        await del(buildPath);
      }
      return;
      const entries = state.extractEntries();

      const alias = state.extractAlias();

      const outputName = state.extractName();

      const banner = state.get(BANNER);

      await state.bundleOpt.reduce(
        async (bundleOptPromise, { IS_PROD, BUILD_FORMAT }) => {
          await bundleOptPromise;

          const input = await getInput({
            flags: {
              IS_SILENT: isSilent,
              IS_PROD,
            },
            json: {
              peerDependencies,
              dependencies,
            },
            entries,
            BUILD_FORMAT,
            alias,
          });

          const output = await getOutput({
            flags: {
              IS_PROD,
            },
            outputName,
            json: {
              peerDependencies,
            },
            buildPath,
            BUILD_FORMAT,
            banner,
          });

          await build(input, output);
        },
        Promise.resolve()
      );
    }, Promise.resolve());
  } catch (err) {
    console.error(err);
  }
}

export default builderz;
