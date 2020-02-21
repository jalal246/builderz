const rollup = require("rollup");
const args = require("commander");
const camelize = require("camelize");

const { msg, error, setIsSilent } = require("@mytools/print");

const { PROD, DEV, UMD, CJS, ES } = require("./constants");

const { initBuild, getInput, getOutput } = require("./config");

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
function getArgs() {
  return args
    .option("-s, --silent", "silent mode, mutes build massages")
    .option("-w, --watch", "watch mode")
    .option("-f --format [format]", "specific build format")
    .option("-b --buildName [format]", "specific build name")
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
  args: listOfPackages
} = getArgs();

setIsSilent(isSilent);

/**
 * @returns {Object[]} bundleOpt
 */
function getBundleOpt() {
  const defaultBundleOpt = [
    { format: UMD, isProd: false },
    { format: UMD, isProd: true },
    { format: CJS, isProd: false },
    { format: CJS, isProd: true },
    { format: ES, isProd: false },
    { format: ES, isProd: true }
  ];

  /**
   * TODO: validate argFormat.
   */
  return argFormat
    ? [{ format: argFormat, isProd: isMinify }]
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

async function bundlePackage({ isProd, format, camelizedName, pkg }) {
  const BUILD_FORMAT = format;
  const BABEL_ENV = `${isProd ? PROD : DEV}`;

  // babel presets according to env
  const presets = ["@babel/preset-env"];

  const flags = { BUILD_FORMAT, BABEL_ENV, IS_SILENT: isSilent };

  const { distPath, peerDependencies, dependencies, sourcePath } = pkg;

  const input = getInput({
    peerDependencies,
    dependencies,
    sourcePath,
    presets,
    flags
  });

  const output = getOutput({
    camelizedName,
    distPath,
    peerDependencies,
    flags
  });

  await build(input, output);
}

async function start() {
  const sortedPackages = initBuild(buildName, listOfPackages);

  const bundleOpt = getBundleOpt();

  sortedPackages.forEach(pkg => {
    const { name: packageName } = pkg;
    const camelizedName = camelizeOutputBuild(packageName);

    if (camelizedName !== packageName) {
      msg(`bundle ${packageName} as ${camelizedName}`);
    }

    bundleOpt.forEach(({ isProd, format }) => {
      bundlePackage({
        isProd,
        format,
        camelizedName,
        pkg
      });
    });
  });
}

start().catch(err => {
  error(err);
});
