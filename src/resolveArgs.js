import { option } from "commander";

/**
 * Get args pass to build command
 * @return {Object} contains flags and array of packages name
 */
function resolveArgs() {
  return option("-s, --silent", "silent mode, mutes build massages")
    .option("-w, --watch", "watch mode:TODO")
    .option("-f, --format", "specific build format")
    .option("-p, --plugins", "input custom plugins")
    .option("-b, --buildName", "specific build name")
    .option("-m, --minify", "minify bundle works only if format is provided")
    .option("PACKAGE_NAME", "building specific package[s], in monorepo")
    .parse(process.argv);
}

export default resolveArgs;
