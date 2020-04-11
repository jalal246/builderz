/* eslint-disable no-nested-ternary */
import isBoolean from "lodash.isboolean";
import { parse } from "shell-quote";
import isEmptyObj from "lodash.isempty";
import { relative } from "path";
import yargs from "yargs";

import {
  IS_SILENT,
  FORMATS,
  MINIFY,
  CLEAN_BUILD,
  CAMEL_CASE,
  BUILD_NAME,
  OUTPUT,
  PKG_PATHS,
  PKG_NAMES,
  ALIAS,
  ENTRIES,
  BANNER,
  getVarTypes,
} from "../constants";

import { isValidArr, getBundleOpt } from "../utils";
import resolveArgs from "../resolveArgs";

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
  static boolean(pkgBuildOpts, pkgJson, generalOpts, argName) {
    return isBoolean(pkgBuildOpts[argName])
      ? pkgBuildOpts[argName]
      : isBoolean(pkgJson[argName])
      ? pkgJson[argName]
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
  static array(pkgBuildOpts, pkgJson, generalOpts, argName) {
    return isValidArr(pkgBuildOpts[argName])
      ? pkgBuildOpts[argName]
      : isValidArr(pkgJson[argName])
      ? pkgJson[argName]
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
  static string(pkgBuildOpts, pkgJson, generalOpts, argName) {
    return pkgBuildOpts[argName]
      ? pkgBuildOpts[argName]
      : pkgJson[argName]
      ? pkgJson[argName]
      : generalOpts[argName];
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
      [IS_SILENT]: true,
      [FORMATS]: [],
      [MINIFY]: undefined,
      [CLEAN_BUILD]: false,
      [CAMEL_CASE]: true,
      [BUILD_NAME]: "dist",
      [OUTPUT]: undefined,
      [PKG_PATHS]: [],
      [PKG_NAMES]: [],
      [ALIAS]: [],
      [ENTRIES]: [],
      [BANNER]: undefined,
    };

    if (isInit) this.generalOpts = Object.assign(this.generalOpts, generalOpts);
    else this.generalOpts = generalOpts;
  }

  /**
   * Extracts bundle options depending on pkgBuildOpts and generalOpts that should be
   * already set.
   *
   * @returns {Array}
   * @memberof State
   */
  extractBundleOpt() {
    const format = this.get(FORMATS);
    const isMinify = this.get(MINIFY);

    this.bundleOpt = getBundleOpt(format, isMinify);
  }

  /**
   * Sets package local option
   *
   * @param {Object} pkgBuildOpts
   * @memberof State
   */
  setPkgBuildOpts() {
    const { scripts: { build: buildArgs } = {} } = this.pkgJsonOpts;

    /**
     * Parsing empty object throws an error/
     */
    if (!isEmptyObj(buildArgs)) {
      const parsedBuildArgs = parse(buildArgs);

      if (isValidArr(parsedBuildArgs)) {
        /**
         * For some unknown reason, resolveArgs doesn't work correctly when
         * passing args without string first. So, yeah, I did it this way.
         */
        // parsedBuildArgs.unshift("builderz");
        console.log(
          "State -> setPkgBuildOpts -> parsedBuildArgs",
          parsedBuildArgs
        );
        this.pkgBuildOpts = yargs.parse(parsedBuildArgs);
        console.log(
          "State -> setPkgBuildOpts -> pkgBuildOpts",
          this.pkgBuildOpts
        );
        // this.pkgBuildOpts = resolveArgs(parsedBuildArgs).opts();
      }
    }

    /**
     * As soon as we get local options we can extract bundle option.
     */
    this.extractBundleOpt();
  }

  /**
   * Sets package local option
   *
   * @param {Object} pkgBuildOpts
   * @memberof State
   */
  setPkgJsonOpts(pkgJson) {
    this.pkgJsonOpts = pkgJson;
  }

  setPkgPath(pkgPath) {
    const relativePath = relative(process.cwd(), pkgPath);

    /**
     * If working directory is the same as package path, don't resolve path.
     */
    this.shouldPathResolved = relativePath.length !== 0;
    this.pkgPath = pkgPath;
  }

  get(argName) {
    const type = getVarTypes(argName);

    return State[type](
      this.pkgBuildOpts,
      this.pkgJsonOpts,
      this.generalOpts,
      argName
    );
  }
}

export default State;
