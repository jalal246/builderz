import rollup from "rollup";

import { PROD, DEV, UMD, CJS, ES } from "../constants";

import initBuild from "./initBuild";

import { error } from "../utils";

import getInput from "./input";
import getOutput from "./output";

const defaultBundleOpt = [
  { format: UMD, isProd: false },
  { format: UMD, isProd: true },
  { format: CJS, isProd: false },
  { format: CJS, isProd: true },
  { format: ES, isProd: false },
  { format: ES, isProd: true }
];

async function build(isWatch, onWatch, inputOptions, outputOptions) {
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

async function bundlePackage({
  isProd,
  format,
  packageName,
  sourcePath,
  distPath
}) {
  const BUILD_FORMAT = format;
  const BABEL_ENV = `${isProd ? PROD : DEV}`;

  // babel presets according to env
  const presets = [];
  const flags = { BUILD_FORMAT, BABEL_ENV, IS_SILENT: false };

  const input = getInput({
    sourcePath,
    presets,
    flags
  });

  const output = getOutput({
    packageName,
    distPath,
    flags
  });

  await build(input, output);
}

async function start() {
  const sortedPackages = initBuild();

  sortedPackages.forEach(pkg => {
    const { name: packageName, sourcePath, distPath } = pkg;

    defaultBundleOpt.forEach(({ isProd, format }) => {
      bundlePackage({
        isProd,
        format,
        packageName,
        sourcePath,
        distPath
      });
    });
  });
}

start().catch(err => {
  error(err);
});
