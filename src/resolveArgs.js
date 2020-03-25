const { program } = require("commander");

function string2Arr(value) {
  return value.split(",");
}

/**
 * Get args pass to build command
 * @return {Object} contains flags and array of packages name
 */
function resolveArgs() {
  return program
    .option("-s, --silent", "Silent mode, mutes build massages")
    .option("--formats <list>", "Specific build format", string2Arr)
    .option("-m, --minify", "Minify bundle works only if format is provided")
    .option("-b, --build-name <string>", "Specific build name")
    .option(
      "--plugins <list>",
      "Custom plugins works as additional ones",
      string2Arr
    )
    .option(
      "--paths <list>",
      "Provide custom paths not in the root/src",
      string2Arr
    )
    .option(
      "--package-names <list>",
      "Building specific package[s], in monorepo",
      string2Arr
    )
    .option("-a, --alias <list>", "package alias", string2Arr)
    .option("-h, --help", "output usage information")
    .parse(process.argv);
}

export default resolveArgs;
