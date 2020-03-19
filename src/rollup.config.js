import rollup from "rollup";

import { error, setIsSilent } from "@mytools/print";

import { initBuild, getInput, getOutput } from "./config/index";

import { getBundleOpt } from "./utils";
import resolveArgs from "./resolveArgs";

async function build(inputOptions, outputOptions, isWatch, onWatch) {
  try {
    if (isWatch) {
      const watcher = rollup.watch({
        ...inputOptions,
        output: [outputOptions]
      });
      onWatch(watcher);
    } else {
      /**
       * create a bundle
       */
      const bundle = await rollup.rollup(inputOptions);

      /**
       * write the bundle to disk
       */
      await bundle.write(outputOptions);
    }
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
  const { peerDependencies, dependencies, sourcePath } = json;

  const input = getInput({
    flags: { IS_SILENT, IS_PROD },
    json: { peerDependencies, dependencies },
    sourcePath,
    BUILD_FORMAT,
    plugins
  });

  const output = getOutput({
    flags: { IS_PROD },
    camelizedName,
    json: { peerDependencies },
    dist,
    BUILD_FORMAT
  });

  await build(input, output);
}

async function start(...params) {
  const {
    silent: isSilent,
    format,
    minify: isMinify,
    buildName,
    plugins,
    paths,
    args: packagesNames
  } = params || resolveArgs();

  setIsSilent(isSilent);

  const { sorted, pkgInfo } = initBuild(buildName, ...paths)(...packagesNames);

  const bundleOpt = getBundleOpt(format, isMinify);

  sorted.forEach(json => {
    const { name } = json;

    bundleOpt.forEach(({ IS_PROD, BUILD_FORMAT }) => {
      bundlePackage({
        plugins,
        flags: { IS_PROD, IS_SILENT: isSilent },
        BUILD_FORMAT,
        json,
        pkgInfo: pkgInfo[name]
      });
    });
  });
}

export default start;
