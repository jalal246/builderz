import isBoolean from "lodash.isboolean";
import { resolve } from "path";
import { validateAccess } from "validate-access";
import { isValidArr, getBundleOpt, camelizeOutputBuild } from "../utils";

/**
 *  State build options.
 *
 * @class State
 */
class State {
  /**
   * Gets boolean option exists in localOpts or generalOpts. localOpts have
   * always the priority.
   *
   * @static
   * @param {Object} localOpts
   * @param {Object} generalOpts
   * @param {string} argName
   * @returns {boolean|undefined}
   * @memberof State
   */
  static boolean(localOpts, generalOpts, argName) {
    return isBoolean(localOpts[argName])
      ? localOpts[argName]
      : generalOpts[argName];
  }

  /**
   * Gets array option exists in localOpts or generalOpts. localOpts have
   * always the priority.
   *
   * @static
   * @param {Object} localOpts
   * @param {Object} generalOpts
   * @param {string} argName
   * @returns {Array}
   * @memberof State
   */
  static array(localOpts, generalOpts, argName) {
    return isValidArr(localOpts[argName])
      ? localOpts[argName]
      : generalOpts[argName];
  }

  /**
   * Gets string option exists in localOpts or generalOpts. localOpts have
   * always the priority.
   *
   * @static
   * @param {Object} localOpts
   * @param {Object} generalOpts
   * @param {string} argName
   * @returns {string}
   * @memberof State
   */
  static string(localOpts, generalOpts, argName) {
    return localOpts[argName] ? localOpts[argName] : generalOpts[argName];
  }

  /**
   * Creates an instance of State.
   *
   * @param {Object} opts
   * @param {boolean} isInit
   * @memberof State
   */
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

  /**
   * Initialize generalOpts.
   *
   * @param {Object} inputOpts
   * @memberof State
   */
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
   * Extracts bundle options depending on localOpts and generalOpts that should be
   * already set.
   *
   * @returns {Array}
   * @memberof State
   */
  extractBundleOpt() {
    const format = this.get("array", "formats");
    const isMinify = this.get("boolean", "minify");

    this.bundleOpt = getBundleOpt(format, isMinify);
  }

  /**
   *
   *
   * @param {*} localOpts
   * @memberof State
   */
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
   * @memberof State
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
   * @memberof State
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
 * @returns {Array
 * @memberof State
 * 
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
