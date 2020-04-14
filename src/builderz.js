import { resolve } from "path";
import { rollup } from "rollup";
import { error } from "@mytools/print";
import del from "del";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";

import { getInput, getOutput } from "./config/index";

import { NotEmptyArr, isValidArr } from "./utils";

import {
  CLEAN_BUILD,
  BANNER,
  SILENT,
  BUILD_NAME,
  SOURCE_MAP,
} from "./constants";

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

  const { pkgPaths, pkgNames } = state.generalOpts;

  const { json: allPkgJson, pkgInfo: allPkgInfo } = isValidArr(pkgNames)
    ? getJsonByName(...pkgNames)
    : getJsonByPath(...pkgPaths);

  if (allPkgJson.length === 0) {
    error(`Builderz has not found any valid package.json`);
  }

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

      const { name, peerDependencies = {}, dependencies = {} } = json;

      const pkgInfo = allPkgInfo[name];

      const { path: pkgPath } = pkgInfo;

      state.setPkgPath(pkgPath);

      const buildPath = resolve(pkgPath, state.opts[BUILD_NAME]);

      if (state.opts[CLEAN_BUILD]) {
        await del(buildPath);
      }

      const entries = state.extractEntries();

      const alias = state.extractAlias();

      const buildName = state.extractName();

      const banner = state.opts[BANNER];
      const isSourcemap = state.opts[SOURCE_MAP];
      const isSilent = state.opts[SILENT];

      await state.bundleOpt.reduce(
        async (bundleOptPromise, { IS_PROD, BUILD_FORMAT }, idx) => {
          await bundleOptPromise;

          const outputBuild = {
            buildPath,
            buildName,
            buildFormat: BUILD_FORMAT,
          };

          const input = await getInput({
            flags: {
              IS_SILENT: isSilent,
              IS_PROD,
            },
            json: {
              peerDependencies,
              dependencies,
            },
            outputBuild,
            entries,
            alias,
            idx,
          });

          const output = await getOutput({
            flags: {
              IS_PROD,
            },
            json: {
              peerDependencies,
            },
            outputBuild,
            isSourcemap,
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
