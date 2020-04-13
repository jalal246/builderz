const yargs = require("yargs");

function resolveArgs(args) {
  yargs
    .option("silent", {
      alias: "s",
      describe: "Silent mode, mutes build massages",
      type: "boolean",
      // default: true,
    })
    .option("formats", {
      alias: "f",
      describe: "Specific build format",
      type: "array",
      // default: [],
    })
    .option("minify", {
      alias: "m",
      describe: "Minify bundle works only if format is provided",
      type: "boolean",
      // default: false,
    })
    .option("sourcemap", {
      describe: "Enable sourcemap in output",
      type: "boolean",
      // default: true,
    })
    .option("camel-case", {
      alias: "c",
      describe: "Add camel-cased output file",
      type: "boolean",
      // default: true,
    })
    .option("clean-build", {
      alias: "l",
      describe: "Clean previous build folder",
      type: "boolean",
      // default: false,
    })
    .option("build-name", {
      alias: "b",
      describe: "Specific folder build name",
      type: "string",
      // default: "dist",
    })
    .option("output", {
      alias: "o",
      describe: "Custom output name",
      type: "string",
    })
    .option("pkg-paths", {
      alias: "w",
      describe: "Provide custom paths not in the root/src",
      type: "array",
      // default: [],
    })
    .option("pkg-names", {
      alias: "n",
      describe: "Building specific package[s], in workspace",
      type: "array",
      // default: [],
    })
    .option("alias", {
      alias: "a",
      describe: "Provide custom paths not in the root/srcPackage Alias",
      type: "array",
      // default: [],
    })
    .option("entries", {
      alias: "e",
      describe: "Add multi entries instead of default src/index",
      // default: [],
    })
    .option("banner", {
      alias: "r",
      describe: "Add banner to output",
      type: "string",
    });

  return args ? yargs.parse(args) : yargs.default().argv;
}

export default resolveArgs;
