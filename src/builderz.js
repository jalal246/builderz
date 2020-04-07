import { resolve } from "path";
import { rollup } from "rollup";
import { error } from "@mytools/print";
import { parse } from "shell-quote";
import del from "del";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";
import isEmptyObj from "lodash.isempty";

import { getInput, getOutput } from "./config/index";

import { NotEmptyArr } from "./utils";

import {
  setOpt,
  initOpts,
  getBooleanOpt,
  extractBundleOpt,
  extractAlias,
  extractEntries,
  extractName,
} from "./optionsHandler";

import resolveArgs from "./resolveArgs";

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

async function start(opts, { isInitOpts = true } = {}) {
  const generalOpts = isInitOpts ? initOpts(opts) : opts;

  const { buildName, pkgPaths, pkgNames } = generalOpts;

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

      const {
        name,
        peerDependencies = {},
        dependencies = {},
        scripts: { build: buildArgs } = {},
        entries: entriesJson = [],
      } = json;

      let localOpts = {};

      /**
       * Parsing empty object throws an error/
       */
      if (!isEmptyObj(buildArgs)) {
        const parsedBuildArgs = parse(buildArgs);

        if (NotEmptyArr(parsedBuildArgs)) {
          /**
           * For some unknown reason, resolveArgs doesn't work correctly when
           * passing args without string first. So, yeah, I did it this way.
           */
          parsedBuildArgs.unshift("builderz");

          localOpts = resolveArgs(parsedBuildArgs).opts();
        }
      }

      /**
       * Setting options allowing extracts functions to work properly.
       */
      setOpt(localOpts, generalOpts);

      const { isSilent } = generalOpts;

      /**
       * Give localOpts the priority first.
       */
      const bundleOpt = extractBundleOpt();

      const pkgInfo = allPkgInfo[name];

      const { path: pkgPath } = pkgInfo;

      const buildPath = resolve(pkgPath, buildName);

      if (getBooleanOpt("cleanBuild")) {
        await del(buildPath);
      }

      const entries = extractEntries(entriesJson, pkgPath);

      const alias = extractAlias(pkgPath);

      const outputName = extractName(name);

      await bundleOpt.reduce(
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

export default start;
