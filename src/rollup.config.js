import { rollup } from "rollup";
import { error } from "@mytools/print";
import { parse } from "shell-quote";

import { initBuild, getInput, getOutput } from "./config/index";
import { getBundleOpt } from "./utils";
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

/**
 * build
 *
 * @param {Object} flags
 * @param {boolean} flags.IS_SILENT
 * @param {boolean} flags.IS_PROD
 *
 * @param {string} BUILD_FORMAT - type of build (cjs|umd|etc)
 * @param {string} camelizedName - camelized package name
 *
 * @param {Object} json
 */
async function bundlePackage({ alias, flags, BUILD_FORMAT, json, pkgInfo }) {
  const { IS_PROD, IS_SILENT } = flags;
  const { peerDependencies = {}, dependencies = {} } = json;
  const { buildPath, srcPath, camelizedName } = pkgInfo;

  const input = await getInput({
    flags: { IS_SILENT, IS_PROD },
    json: { peerDependencies, dependencies },
    srcPath,
    BUILD_FORMAT,
    alias
  });

  const output = await getOutput({
    flags: { IS_PROD },
    camelizedName,
    json: {},
    buildPath,
    BUILD_FORMAT
  });

  await build(input, output);
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

  try {
    const { buildName, pkgPaths, pkgNames } = generalOpts;

    const { sorted, pkgInfo } = await initBuild(buildName, pkgPaths, pkgNames);

    await sorted.reduce(async (sortedPromise, json) => {
      await sortedPromise;

      const { name, scripts: { build: buildArgs } = {} } = json;

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

      await bundleOpt.reduce(
        async (bundleOptPromise, { IS_PROD, BUILD_FORMAT }) => {
          await bundleOptPromise;

          const flags = {
            IS_PROD,
            IS_SILENT: isSilent
          };

          await bundlePackage({
            alias: localOpts.alias || alias,
            flags,
            BUILD_FORMAT,
            json,
            pkgInfo: pkgInfo[name]
          });
        },
        Promise.resolve()
      );
    }, Promise.resolve());
  } catch (err) {
    console.error(err);
  }
}

export default start;
