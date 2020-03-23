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
    plugins
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

async function start(params) {
  const {
    silent: isSilent,
    format,
    minify: isMinify,
    buildName,
    plugins,
    paths
    // args: packagesNames
  } = params || resolveArgs();

  try {
    const { sorted, pkgInfo } = await initBuild(buildName, paths);

    const bundleOpt = getBundleOpt(format, isMinify);

    await sorted.forEach(async json => {
      const { name } = json;

      bundleOpt.forEach(async ({ IS_PROD, BUILD_FORMAT }) => {
        await bundlePackage({
          plugins,
          flags: {
            IS_PROD,
            IS_SILENT: isSilent
          },
          BUILD_FORMAT,
          json,
          pkgInfo: pkgInfo[name]
        });
      });
    });
  } catch (err) {
    error(err);
  }
}

export default start;
