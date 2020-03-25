import { rollup } from "rollup";

import { error } from "@mytools/print";

import { initBuild, getInput, getOutput } from "./config/index";
import { getBundleOpt } from "./utils";
import resolveArgs from "./resolveArgs";

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
  flags: { IS_PROD, IS_SILENT },
  BUILD_FORMAT,
  json,
  pkgInfo: { dist, camelizedName }
}) {
  const { peerDependencies = {}, dependencies = {}, sourcePath } = json;

  const input = await getInput({
    flags: { IS_SILENT, IS_PROD },
    json: { peerDependencies, dependencies },
    sourcePath,
    BUILD_FORMAT,
    plugins,
    alias
  });

  const output = await getOutput({
    flags: { IS_PROD },
    camelizedName,
    json: {},
    dist,
    BUILD_FORMAT
  });

  await build(input, output);
}

async function start(params = {}) {
  const args = resolveArgs;

  const isSilent = args.isSilent || params.isSilent;
  const isMinify = args.isMinify || params.isMinify;
  const buildName = args.buildName || params.buildName;

  const formats = args.format || params.format || [];
  const plugins = args.plugins || params.plugins || [];
  const paths = args.paths || params.paths || [];
  const packageNames = args.packageNames || params.packageNames || [];
  const alias = args.alias || params.alias || [];

  try {
    const { sorted, pkgInfo } = await initBuild(buildName, paths, packageNames);

    const bundleOpt = getBundleOpt(formats, isMinify);

    await sorted.reduce(async (sortedPromise, json) => {
      await sortedPromise;

      const { name } = json;

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
    error(err);
  }
}

export default start;
