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
   * Gets boolean option exists in pkgBuildOpts or generalOpts. pkgBuildOpts have
   * always the priority.
   *
   * @static
   * @param {Object} pkgBuildOpts
   * @param {Object} generalOpts
   * @param {string} argName
   * @returns {boolean|undefined}
   * @memberof State
   */
  static boolean(pkgBuildOpts, generalOpts, argName) {
    return isBoolean(pkgBuildOpts[argName])
      ? pkgBuildOpts[argName]
      : generalOpts[argName];
  }

  /**
   * Gets array option exists in pkgBuildOpts or generalOpts. pkgBuildOpts have
   * always the priority.
   *
   * @static
   * @param {Object} pkgBuildOpts
   * @param {Object} generalOpts
   * @param {string} argName
   * @returns {Array}
   * @memberof State
   */
  static array(pkgBuildOpts, generalOpts, argName) {
    return isValidArr(pkgBuildOpts[argName])
      ? pkgBuildOpts[argName]
      : generalOpts[argName];
  }

  /**
   * Gets string option exists in pkgBuildOpts or generalOpts. pkgBuildOpts have
   * always the priority.
   *
   * @static
   * @param {Object} pkgBuildOpts
   * @param {Object} generalOpts
   * @param {string} argName
   * @returns {string}
   * @memberof State
   */
  static string(pkgBuildOpts, generalOpts, argName) {
    return pkgBuildOpts[argName] ? pkgBuildOpts[argName] : generalOpts[argName];
  }

  /**
   * Creates an instance of State.
   *
   * @param {Object} opts
   * @param {boolean} isInit
   * @memberof State
   */
  constructor(generalOpts, isInit) {
    /**
     * package build options in build script.
     */
    this.pkgBuildOpts = {};

    /**
     * package Json options in packages.json as properties.
     */
    this.pkgJsonOpts = {};

    /**
     * general options passed when running builderz.
     */
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

    if (isInit) this.initializer(generalOpts);
    else this.generalOpts = generalOpts;
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
    return State[type](this.pkgBuildOpts, this.generalOpts, argName);
  }

  /**
   * Extracts bundle options depending on pkgBuildOpts and generalOpts that should be
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
   * Sets package local option
   *
   * @param {Object} pkgBuildOpts
   * @memberof State
   */
  setPkgBuildOpts(pkgBuildOpts) {
    this.pkgBuildOpts = pkgBuildOpts;

    /**
     * As soon as we get local options we can extract bundle option.
     */
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
    const { alias: localAlias } = this.pkgBuildOpts;

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
