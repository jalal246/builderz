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
function extractAlias(aliasStr) {
  const alias = string2Arr(aliasStr).map(str => {
    const [key, value] = str.split("=");
    return { find: key, replacement: value };
  });

  return alias;
}

program
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
  .option("-a, --alias <list>", "package alias", extractAlias)
  .parse(process.argv);

export default program;
