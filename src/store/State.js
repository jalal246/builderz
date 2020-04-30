/* eslint-disable no-nested-ternary */
import isEmptyObj from "lodash.isempty";
import { relative } from "path";

import yargs from "yargs";
import resolveArgs from "../resolveArgs";
import { FORMATS, MINIFY, defaultOpts } from "../constants";
import { isValidArr, getBundleOpt } from "../utils";

/**
 *  State build options.
 *
 * @class State
 */
class State {
  /**
   * Creates an instance of State.
   *
   * @param {Object} opts
   * @param {boolean} isInit
   * @memberof State
   */
  constructor(generalOpts) {
    this.generalOpts = generalOpts;
  }

  mergeOpts(newOpts) {
    Object.assign(this.opts, newOpts);
  }

  /**
   * Extracts bundle options depending on pkgBuildOpts and generalOpts that should be
   * already set.
   *
   * @returns {Array}
   * @memberof State
   */
  extractBundleOpt() {
    const formats = this.opts[FORMATS];
    const isMinify = this.opts[MINIFY];

    this.bundleOpt = getBundleOpt(formats, isMinify);
  }

  /**
   * Sets package local option according to its package.json
   *
   * @param {Object} pkgJson
   * @memberof State
   */
  setPkgJsonOpts(pkgJson) {
    const { name: pkgName, scripts: { build } = {}, builderz } = pkgJson;

    this.pkgName = pkgName;

    /**
     * Resets opts for each new package.
     */
    this.opts = { ...this.generalOpts };

    /**
     * Extracting other options if there are any.
     */
    if (!isEmptyObj(build)) {
      const parsedArgv = resolveArgs(build);

      this.mergeOpts(parsedArgv);
    }

    if (!isEmptyObj(builderz)) {
      this.mergeOpts(builderz);
    }

    Object.keys(defaultOpts).forEach((key) => {
      if (this.opts[key] === undefined) {
        this.opts[key] = defaultOpts[key];
      }
    });
  }

  setPkgPath(pkgPath) {
    const relativePath = relative(process.cwd(), pkgPath);

    /**
     * If working directory is the same as package path, don't resolve path.
     */
    this.shouldPathResolved = relativePath.length !== 0;
    this.pkgPath = pkgPath;
  }
}

export default State;
