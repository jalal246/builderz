import {
  FORMATS,
  MINIFY,
  SOURCE_MAP,
  OUTPUT,
  ALIAS,
  ENTRIES,
  BANNER,
  STRICT,
  BABEL,
  EXTERNAL,
} from "./constants";

const yargs = require("yargs");

function resolveArgs(args) {
  yargs
    .option(MINIFY, {
      alias: "m",
      describe: "Minify bundle works only if format is provided",
      type: "boolean",
    })
    .option(SOURCE_MAP, {
      alias: "p",
      describe: "Enable sourcemap in output",
      type: "boolean",
    })
    .option("camel-case", {
      alias: "c",
      describe: "Add camel-cased output file",
      type: "boolean",
    })
    .option("clean-build", {
      alias: "l",
      describe: "Clean previous build folder",
      type: "boolean",
    })
    .option(STRICT, {
      alias: "t",
      describe: "Enable Strict Mode",
      type: "boolean",
    })
    .option("sort-pkg", {
      alias: "r",
      describe: "Enable sorting packages for monorepo",
      type: "boolean",
    })
    .option("es-module", {
      alias: "d",
      describe: "Define Property exports es_model",
      type: "boolean",
    })
    .option(FORMATS, {
      describe: "Specific build format",
      type: "array",
    })
    .option("build-name", {
      describe: "Specific folder build name",
      type: "string",
    })
    .option(OUTPUT, {
      describe: "Custom output name",
      type: "string",
    })
    .option("pkg-paths", {
      describe: "Provide custom paths not in the root/src",
      type: "array",
    })
    .option("pkg-names ", {
      describe: "Building specific package[s], in workspace",
      type: "array",
    })
    .option(ALIAS, {
      describe: "Provide custom paths not in the root/srcPackage Alias",
      type: "array",
    })
    .option(ENTRIES, {
      describe: "Add multi entries instead of default src/index",
    })
    .option(BANNER, {
      describe: "Add banner to output",
      type: "string",
    })
    .option(BABEL, {
      describe:
        "properties: enablePreset / enablePlugins / extensions / exclude",
    })
    .option(EXTERNAL, {
      describe: "Passing external libraries not to bundle",
      type: "array",
    });

  return args ? yargs.parse(args) : yargs.argv;
}

export default resolveArgs;
