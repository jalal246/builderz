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
async function bundlePackage({
  plugins,
  alias,
  flags,
  BUILD_FORMAT,
  json,
  pkgInfo
}) {
  const { IS_PROD, IS_SILENT } = flags;
  const { peerDependencies = {}, dependencies = {} } = json;
  const { buildPath, srcPath, camelizedName } = pkgInfo;

  const input = await getInput({
    flags: { IS_SILENT, IS_PROD },
    json: { peerDependencies, dependencies },
    srcPath,
    BUILD_FORMAT,
    plugins,
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
    plugins: [],
    paths: [],
    packageNames: [],
    alias: []
  };

  Object.keys(options).forEach(option => {
    const value = opt1[option] || opt2[option] || options[option];

    options[option] = value;
  });

  return options;
}

async function start(params = {}) {
  let options = initOpts(params, globalArgs);

  try {
    const { buildName, paths, packageNames } = options;

    const { sorted, pkgInfo } = await initBuild(buildName, paths, packageNames);

    await sorted.reduce(async (sortedPromise, json) => {
      await sortedPromise;

      const { name, scripts: { build: buildArgs } = {} } = json;

      if (buildArgs) {
        const parsedBuildArgs = parse(buildArgs);

        if (parsedBuildArgs.length > 0) {
          const localArgs = resolveArgs(parsedBuildArgs);

          options = initOpts(localArgs, options);
        }
      }

      const { isSilent, formats, isMinify, plugins, alias } = options;

      const bundleOpt = getBundleOpt(formats, isMinify);

      await bundleOpt.reduce(
        async (bundleOptPromise, { IS_PROD, BUILD_FORMAT }) => {
          await bundleOptPromise;

          await bundlePackage({
            plugins,
            alias,
            flags: {
              IS_PROD,
              IS_SILENT: isSilent
            },
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
