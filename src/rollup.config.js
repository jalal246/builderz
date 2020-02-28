import rollup from "rollup";
import { option } from "commander";
import camelize from "camelize";

import { msg, error, setIsSilent } from "@mytools/print";

import { UMD, CJS, ES } from "./constants";

import { initBuild, getInput, getOutput } from "./config/index";

/**
 * Modify package name in package.json to name the output build correctly.
 * remove @
 * replace / with -
 * remove - and capitalize the first letter after it
 *
 * @param {string} name - package name in package.json
 * @returns {string} modified name for bundle
 */
function camelizeOutputBuild(name) {
  return camelize(name.replace("@", "").replace("/", "-"));
}

/**
 * Get args pass to build command
 * @return {Object} contains flags and array of packages name
 */
function getArgs(params) {
  if (params) return params;

  return option("-s, --silent", "silent mode, mutes build massages")
    .option("-w, --watch", "watch mode:TODO")
    .option("-f, --format", "specific build format")
    .option("-p, --plugins", "input custom plugins")
    .option("-b, --buildName", "specific build name")
    .option("-m, --minify", "minify bundle works only if format is provided")
    .option("PACKAGE_NAME", "building specific package[s], in monorepo")
    .parse(process.argv);
}

const {
  silent: isSilent,
  // TODO: watch: isWatch,
  format: argFormat,
  minify: isMinify,
  buildName,
  plugins,
  args: listOfPackages
} = getArgs();

setIsSilent(isSilent);

/**
 * @returns {Object[]} bundleOpt
 */
function getBundleOpt() {
  const defaultBundleOpt = [
    { BUILD_FORMAT: UMD, IS_PROD: false },
    { BUILD_FORMAT: UMD, IS_PROD: true },
    { BUILD_FORMAT: CJS, IS_PROD: false },
    { BUILD_FORMAT: CJS, IS_PROD: true },
    { BUILD_FORMAT: ES, IS_PROD: false },
    { BUILD_FORMAT: ES, IS_PROD: true }
  ];

  /**
   * TODO: validate argFormat.
   */
  return argFormat
    ? [{ BUILD_FORMAT: argFormat, IS_PROD: isMinify || false }]
    : defaultBundleOpt;
}

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

async function start(params) {
  if (params) getArgs(params);

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
