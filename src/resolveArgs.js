import {
  SILENT,
  FORMATS,
  MINIFY,
  SOURCE_MAP,
  CAMEL_CASE,
  CLEAN_BUILD,
  BUILD_NAME,
  OUTPUT,
  PKG_PATHS,
  PKG_NAMES,
  ALIAS,
  ENTRIES,
  BANNER,
  ES_MODEL,
  STRICT,
  BABEL,
  EXTERNAL,
  SORT_PACKAGES,
} from "./constants";

const yargs = require("yargs");

function resolveArgs(args) {
  yargs
    .option(SILENT, {
      alias: "s",
      describe: "Silent mode, mutes build massages",
      type: "boolean",
    })
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
    .option(CAMEL_CASE, {
      alias: "c",
      describe: "Add camel-cased output file",
      type: "boolean",
    })
    .option(CLEAN_BUILD, {
      alias: "l",
      describe: "Clean previous build folder",
      type: "boolean",
    })
    .option(STRICT, {
      alias: "t",
      describe: "Enable Strict Mode",
      type: "boolean",
    })
    .option(SORT_PACKAGES, {
      alias: "r",
      describe: "Enable sorting packages for monorepo",
      type: "boolean",
    })
    .option(ES_MODEL, {
      alias: "d",
      describe: "Define Property exports es_model",
      type: "boolean",
    })
    .option(FORMATS, {
      describe: "Specific build format",
      type: "array",
    })
    .option(BUILD_NAME, {
      describe: "Specific folder build name",
      type: "string",
    })
    .option(OUTPUT, {
      describe: "Custom output name",
      type: "string",
    })
    .option(PKG_PATHS, {
      describe: "Provide custom paths not in the root/src",
      type: "array",
    })
    .option(PKG_NAMES, {
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
