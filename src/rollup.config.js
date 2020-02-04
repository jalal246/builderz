const rollup = require("rollup");

const { PROD, DEV, UMD, CJS, ES } = require("./constants");

const { error } = require("./utils");

const { initBuild, getInput, getOutput } = require("./config");

const defaultBundleOpt = [
  { format: UMD, isProd: false },
  { format: UMD, isProd: true },
  { format: CJS, isProd: false },
  { format: CJS, isProd: true },
  { format: ES, isProd: false },
  { format: ES, isProd: true }
];

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

async function bundlePackage({ isProd, format, pkg }) {
  const BUILD_FORMAT = format;
  const BABEL_ENV = `${isProd ? PROD : DEV}`;

  // babel presets according to env
  const presets = ["@babel/preset-env"];

  const flags = { BUILD_FORMAT, BABEL_ENV, IS_SILENT: false };

  const {
    name: packageName,
    distPath,
    peerDependencies,
    dependencies,
    sourcePath
  } = pkg;

  const input = getInput({
    peerDependencies,
    dependencies,
    sourcePath,
    presets,
    flags
  });

  const output = getOutput({
    packageName,
    distPath,
    peerDependencies,
    flags
  });

  await build(input, output);
}

async function start() {
  const sortedPackages = initBuild();

  sortedPackages.forEach(pkg => {
    defaultBundleOpt.forEach(({ isProd, format }) => {
      console.log(isProd, format);
      bundlePackage({
        isProd,
        format,
        pkg
      });
    });
  });
}

start().catch(err => {
  error(err);
});
