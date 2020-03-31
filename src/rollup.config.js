import { resolve } from "path";
import { rollup } from "rollup";
import { msg, error } from "@mytools/print";
import { parse } from "shell-quote";
import del from "del";
import packageSorter from "package-sorter";
import { getJsonByName, getJsonByPath } from "get-info";

import { getInput, getOutput } from "./config/index";
import { camelizeOutputBuild, getBundleOpt } from "./utils";
import resolveArgs from "./resolveArgs";

const globalArgs = resolveArgs();

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
  } catch (e) {
    error(e);
  }
}

function initOpts(opt1, opt2) {
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

    const value = opt1[option] || opt2[option] || _default;

    options[option] = value;
  });

  return options;
}

async function start(params = {}) {
  const generalOpts = initOpts(params, globalArgs);

  const { buildName, pkgPaths, pkgNames } = generalOpts;

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

      if (buildArgs) {
        const parsedBuildArgs = parse(buildArgs);

        if (parsedBuildArgs.length > 0) {
          localOpts = resolveArgs(parsedBuildArgs);
        }
      }

      const { isSilent, formats, isMinify, alias } = generalOpts;

      const bundleOpt = getBundleOpt(
        localOpts.formats || formats,
        localOpts.isMinify || isMinify
      );

      const pkgInfo = allPkgInfo[name];

      const { path: pkgPath, ext: pkgExt } = pkgInfo;

      const buildPath = resolve(pkgPath, buildName);

      await del(buildPath);

      const defaultSrcPath = resolve(pkgPath, "src", `index.${pkgExt}`);

      await bundleOpt.reduce(
        async (bundleOptPromise, { IS_PROD, BUILD_FORMAT }) => {
          await bundleOptPromise;

          const input = await getInput({
            flags: { IS_SILENT: isSilent, IS_PROD },
            json: { peerDependencies, dependencies },
            srcPath: defaultSrcPath,
            BUILD_FORMAT,
            alias
          });

          const camelizedName = camelizeOutputBuild(name);

          msg(
            camelizedName !== name
              ? `bundle ${name} as ${camelizedName}`
              : `bundle  ${camelizedName}`
          );

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
    console.error(err);
  }
}

export default start;
