/* eslint-disable no-nested-ternary */
import { relative } from "path";

import resolveArgs from "../resolveArgs";
import { FORMATS, MINIFY, defaultOpts } from "../constants";
import { getBundleOpt } from "../utils";

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
    if (build && build.length > 0) {
      const parsedArgv = resolveArgs(build);

      this.mergeOpts(parsedArgv);
    }

    if (builderz && Object.keys(builderz).length > 0) {
      this.mergeOpts(builderz);
    }

    Object.keys(defaultOpts).forEach((key) => {
      if (this.opts[key] === undefined) {
        this.opts[key] = defaultOpts[key];
      }
    });
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
