const { program } = require("commander");

/**
 * Converts string to Array.
 *
 * @param {string} value
 * @returns {Array}
 */
function string2Arr(value) {
  return value.split(",");
}

/**
 * Extracts string to suit plugins entries
 * {@link https://www.npmjs.com/package/@rollup/plugin-alias}
 *
 * @param {string[]} alias - batman=../../../batman
 * @returns {Object[]} - {find, replacement}
 */
function parseAlias(aliasStr) {
  const alias = string2Arr(aliasStr).map((str) => {
    const [key, value] = str.split("=");
    return { find: key, replacement: value };
  });

  return alias;
}

function resolveArgs(argv) {
  program
    .option("-s, --silent <boolean>", "Silent mode, mutes build massages", true)
    .option("-f, --formats <list>", "Specific build format", string2Arr, [])
    .option(
      "-m, --minify <boolean>",
      "Minify bundle works only if format is provided",
      false
    )
    .option("-c, --camel-case <boolean>", "Add camel-cased output file", true)
    .option("-l, --clean-build <boolean>", "Clean previous build folder", false)
    .option("-b, --build-name <string>", "Specific folder build name", "dist")
    .option("-o, --output <string>", "Custom output name")
    .option(
      "-w, --pkg-paths <list>",
      "Provide custom paths not in the root/src",
      string2Arr,
      []
    )
    .option(
      "-n, --pkg-names <list>",
      "Building specific package[s], in workspace",
      string2Arr,
      []
    )
    .option("-a, --alias <list>", "Package Alias", parseAlias, [])
    .option(
      "-e, --entries <list>",
      "Add multi entries instead of default src/index.",
      parseAlias,
      []
    )
    .option("-r, --banner <string>", "Add banner to output");

  if (argv) {
    program.allowUnknownOption();
  }

  return program.parse(argv || process.argv);
}

export default resolveArgs;
