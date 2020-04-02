import { resolve } from "path";
import { rollup } from "rollup";
import { msg, error } from "@mytools/print";
import { parse } from "shell-quote";
import del from "del";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";
import isEmpty from "lodash.isempty";

import { getInput, getOutput } from "./config/index";
import { camelizeOutputBuild, getBundleOpt } from "./utils";
import resolveArgs from "./resolveArgs";

function extractAlias(globalOpts, localOpts, localPkgPath) {
  let alias;

  const { alias: LocalAlias } = localOpts;

  /**
   * If there's local alias passed in package, let's resolve the pass.
   */
  if (LocalAlias && LocalAlias.length > 0) {
    LocalAlias.forEach(({ replacement }, i) => {
      /**
       * Assuming we're working in `src` by default.
       */
      LocalAlias[i].replacement = resolve(localPkgPath, "src", replacement);
    });

    alias = LocalAlias;
  } else {
    alias = globalOpts.alias;
  }

  return alias;
}

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

/**
 * Inits options
 *
 * @param {Object} opts - input options
 * @returns {Object} - initialize options
 */
function initOpts(opts) {
  const options = {
    isSilent: true,
    formats: [],
    isMinify: undefined,
    buildName: "dist",
    pkgPaths: [],
    pkgNames: [],
    alias: []
  };

  Object.keys(options).forEach(option => {
    // eslint-disable-next-line no-underscore-dangle
    const _default = options[option];

    const value = opts[option] || _default;

    options[option] = value;
  });

  return options;
}

async function start(generalOpts, { isInitOpts = true }) {
  const { buildName, pkgPaths, pkgNames } = isInitOpts
    ? initOpts(generalOpts)
    : generalOpts;

  const { json: allPkgJson, pkgInfo: allPkgInfo } =
    pkgNames.length > 0
      ? getJsonByName(...pkgNames)
      : getJsonByPath(...pkgPaths);

  /**
   * Sort packages before bump to production.
   */
  const { sorted, unSorted } = packageSorter(allPkgJson);

  if (unSorted.length > 0) {
    error(`Unable to sort packages: ${unSorted}`);
  }

  try {
    await sorted.reduce(async (sortedPromise, json) => {
      await sortedPromise;

      const {
        name,
        peerDependencies = {},
        dependencies = {},
        scripts: { build: buildArgs } = {}
      } = json;

      let localOpts = {};

      /**
       * Parsing empty object throws an error/
       */
      if (!isEmpty(buildArgs)) {
        const parsedBuildArgs = parse(buildArgs);

        if (parsedBuildArgs.length > 0) {
          /**
           * For some unknown reason, resolveArgs doesn't work correctly when
           * passing args without string first. So, yeah, I did it this way.
           */
          parsedBuildArgs.unshift("builderz");

          localOpts = resolveArgs(parsedBuildArgs);
        }
      }

      const { isSilent, formats, minify, entries } = generalOpts;

      /**
       * Give localOpts the priority first.
       */
      const bundleOpt = getBundleOpt(
        localOpts.formats || formats,
        typeof localOpts.minify === "boolean" ? localOpts.minify : minify
      );

      const pkgInfo = allPkgInfo[name];

      const { path: pkgPath, ext: pkgExt } = pkgInfo;

      const buildPath = resolve(pkgPath, buildName);

      await del(buildPath);

      const defaultSrcPath = resolve(pkgPath, "src", `index.${pkgExt}`);

      const alias = extractAlias(generalOpts, localOpts, pkgPath);

      const camelizedName = camelizeOutputBuild(name);

      msg(
        camelizedName !== name
          ? `bundle ${name} as ${camelizedName}`
          : `bundle  ${camelizedName}`
      );

      await bundleOpt.reduce(
        async (bundleOptPromise, { IS_PROD, BUILD_FORMAT }) => {
          await bundleOptPromise;

          const input = await getInput({
            flags: { IS_SILENT: isSilent, IS_PROD },
            json: { peerDependencies, dependencies },
            entries: [],
            srcPath: defaultSrcPath,
            BUILD_FORMAT,
            alias
          });

          const output = await getOutput({
            flags: { IS_PROD },
            camelizedName,
            json: { peerDependencies },
            buildPath,
            BUILD_FORMAT
          });

          await build(input, output);
        },
        Promise.resolve()
      );
    }, Promise.resolve());
  } catch (err) {
    error(err);
  }
}

export default start;