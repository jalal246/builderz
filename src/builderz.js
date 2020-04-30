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
  STRICT,
  ES_MODEL,
  BABEL,
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

async function builderz(opts) {
  const state = new StateHandler(opts);

  const { pkgPaths = [], pkgNames } = state.generalOpts;

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

      /**
       * As soon as we get local options we can extract bundle options.
       */
      state.extractBundleOpt();

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

      const {
        /**
         * banner is also used for adding shebang
         */
        [BANNER]: banner,

        [SOURCE_MAP]: isSourcemap,
        [SILENT]: isSilent,

        /**
         * strict & esModule are false by default to save some size for partial production.
         *
         * Instead of adding:
         * Object.defineProperty(exports, "__esModule", {value: true }) && "strict_mode"
         * for each package. We can produce bundled code without them and
         * enables it only when it is necessary.
         */
        [ES_MODEL]: esModule,
        [STRICT]: strict,
        [BABEL]: babel,
        isTypeScript,
      } = state.opts;

      await state.bundleOpt.reduce(
        async (bundleOptPromise, { isProd, buildFormat }, idx) => {
          await bundleOptPromise;

          const outputBuild = {
            buildPath,
            buildName,
            buildFormat,
          };

          const flags = {
            isSilent,
            isProd,
            isTypeScript,
            isMultiEntries: Array.isArray(entries),
          };

          const input = await getInput({
            flags,
            json: {
              peerDependencies,
              dependencies,
            },
            outputBuild,
            pkgPath,
            entries,
            alias,
            babel,
            idx,
          });

          const output = await getOutput({
            flags: {
              isProd,
            },
            json: {
              peerDependencies,
            },
            outputBuild,
            isSourcemap,
            banner,
            esModule,
            strict,
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
