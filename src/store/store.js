import isBoolean from "lodash.isboolean";
import { resolve } from "path";
import { validateAccess } from "validate-access";
import { isValidArr, getBundleOpt, camelizeOutputBuild } from "../utils";

/**
 * Shared state build options, provided by global arguments and local ones exist in each
 * build script.
 */
class State {
  static boolean(localOpts, generalOpts, argName) {
    return isBoolean(localOpts[argName])
      ? localOpts[argName]
      : generalOpts[argName];
  }

  static array(localOpts, generalOpts, argName) {
    return isValidArr(localOpts[argName])
      ? localOpts[argName]
      : generalOpts[argName];
  }

  static string(localOpts, generalOpts, argName) {
    return localOpts[argName] ? localOpts[argName] : generalOpts[argName];
  }

  constructor(opts, isInit) {
    this.localOpts = {};

    this.generalOpts = {
      isSilent: true,
      formats: [],
      isMinify: undefined,
      cleanBuild: false,
      camelCase: true,
      buildName: "dist",
      output: undefined,
      pkgPaths: [],
      pkgNames: [],
      alias: [],
      entries: [],
      banner: undefined,
    };

    if (isInit) this.initializer(opts);
    else this.generalOpts = opts;
  }

  initializer(inputOpts) {
    Object.keys(inputOpts).forEach((inOption) => {
      const input = inputOpts[inOption];

      if (input) {
        this.generalOpts[inOption] = inputOpts[inOption];
      }
    });
  }

  get(type, argName) {
    return State[type](this.localOpts, this.generalOpts, argName);
  }

  /**
   * Extracts bundle options depending on localOpts and globalOpts that should be
   * already set.
   *
   * @returns {Array}
   */
  extractBundleOpt() {
    const format = this.get("array", "formats");
    const isMinify = this.get("boolean", "minify");

    this.bundleOpt = getBundleOpt(format, isMinify);
  }

  setLocal(localOpts) {
    this.localOpts = localOpts;
    this.extractBundleOpt();
  }

  /**
   * Extract name based on output option if found, else, it looks if isCamelCase
   * then camelize. otherwise, return jsonPkgName.
   *
   * @param {string} jsonPkgName
   * @returns {string} - output name
   */
  extractName(jsonPkgName) {
    let output = jsonPkgName;

    const givenName = this.get("string", "output");

    if (givenName) {
      output = givenName;
    } else if (this.get("boolean", "camelCase")) {
      output = camelizeOutputBuild(jsonPkgName);
    }

    // msg(`bundle output as ${output}`);

    return output;
  }

  /**
   * Extracts entries by checking global entries, entries passed in Json as
   * property. If no valid entries, it returns default path: src/index.extension
   *
   * @param {Array} entriesJson
   * @param {string} pkgPath
   * @returns {Array|string}
   */
  extractEntries(entriesJson, pkgPath) {
    const entries = this.get("array", "entries");

    if (isValidArr(entries)) {
      return entries.map((entry) => resolve(pkgPath, entry));
    }

    if (isValidArr(entriesJson)) {
      return entriesJson.map((entryJson) => resolve(pkgPath, entryJson));
    }

    const { isValid, isSrc, ext } = validateAccess({
      dir: pkgPath,
      isValidateEntry: true,
      entry: "index",
      srcName: "src",
    });

    // eslint-disable-next-line no-nested-ternary
    return !isValid
      ? null
      : isSrc
      ? resolve(pkgPath, "src", `index.${ext}`)
      : resolve(pkgPath, `index.${ext}`);
  }

  /**
 * Extracts alias. If there's local alias in package, then revolve path:
 * by adding localPkgPath:
     alias({
      entries: [
        { find: 'utils', replacement: 'localPkgPath/../../../utils' },
        { find: 'batman-1.0.0', replacement: 'localPkgPath/joker-1.5.0' }
      ]
 *
 * @param {string} localPkgPath
 * @returns {Array}
 */
  extractAlias(pkgPath) {
    const { alias: localAlias } = this.localOpts;

    if (!isValidArr(localAlias)) return this.generalOpts.alias;

    /**
     * If there's local alias passed in package, let's resolve the pass.
     */
    localAlias.forEach(({ replacement }, i) => {
      /**
       * Assuming we're working in `src` by default.
       */
      localAlias[i].replacement = resolve(pkgPath, "src", replacement);
    });

    return localAlias;
  }
}

export default State;
