/* eslint-disable no-console */
import { resolve } from "path";
import { rollup } from "rollup";
import del from "del";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";

import { getInput, getOutput } from "./config/index";

import { isValidArr } from "./utils";

import {
  CLEAN_BUILD,
  BANNER,
  SILENT,
  BUILD_NAME,
  SOURCE_MAP,
  SORT_PACKAGES,
  PKG_PATHS,
  PKG_NAMES,
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
    console.error(err);
  }
}

async function builderz(opts) {
  const state = new StateHandler(opts);

  const {
    [PKG_NAMES]: pkgNames,
    [PKG_PATHS]: pkgPaths,
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
    return;
  }

  if (isValidArr(unfoundJson)) {
    sorted.push(...unfoundJson);
  }

  try {
    await sorted.reduce(async (sortedPromise, json, i) => {
      await sortedPromise;

      state.setPkgJsonOpts(json);

      /**
       * As soon as we get local options we can extract bundle options.
       */
      state.extractBundleOpt();

      let pkgPath;
      let peerDependencies = {};
      let dependencies = {};

      if (typeof json !== "string") {
        ({ peerDependencies = {}, dependencies = {} } = json);

        /**
         * When name isn't valid, get-info assign index-order instead of name.
         */
        ({ path: pkgPath } = pkgInfo[json.name || i]);
      } else {
        pkgPath = json;
      }

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
