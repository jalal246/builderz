import rollup from "rollup";
import { option } from "commander";

import { msg, error, setIsSilent } from "@mytools/print";

import { initBuild, getInput, getOutput } from "./config/index";

import { camelizeOutputBuild } from "./utils";
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
  flags: { IS_PROD, IS_SILENT },
  BUILD_FORMAT,
  camelizedName,
  json
}) {
  const { distPath, peerDependencies, dependencies, sourcePath } = json;

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
    distPath,
    BUILD_FORMAT
  });

  await build(input, output);
}

async function start(...params) {
  const {
    silent: isSilent,
    format: argFormat,
    minify: isMinify,
    buildName,
    plugins,
    paths,
    args: listOfPackages
  } = params || resolveArgs();

  setIsSilent(isSilent);

  const sortedPackages = initBuild(buildName)(...listOfPackages);

  const bundleOpt = getBundleOpt();

  sortedPackages.forEach(pkg => {
    const { name: packageName } = pkg;
    const camelizedName = camelizeOutputBuild(packageName);

    if (camelizedName !== packageName) {
      msg(`bundle ${packageName} as ${camelizedName}`);
    }

    bundleOpt.forEach(({ IS_PROD, BUILD_FORMAT }) => {
      bundlePackage({
        flags: { IS_PROD, IS_SILENT: isSilent },
        BUILD_FORMAT,
        camelizedName,
        json: pkg
      });
    });
  });
}

export default start;
