/* eslint-disable no-nested-ternary */
import { parse } from "shell-quote";
import isEmptyObj from "lodash.isempty";
import { relative } from "path";

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
    /**
     * package build options in build script.
     */
    this.pkgBuildOpts = {};

    /**
     * package Json options in packages.json as properties.
     */
    this.pkgJsonOpts = {};

    this.generalOpts = generalOpts;
  }

  /**
   * Assign global opts to current. This step is done for every cycle.
   *
   * @memberof State
   */
  initOpts() {
    this.opts = { ...this.generalOpts };
  }

  setOptsFrom(obj) {
    /**
     * Parsing empty object throws an error/
     */
    if (!isEmptyObj(obj)) {
      const parsedBuildArgs = parse(obj);

      if (isValidArr(parsedBuildArgs)) {
        const parsedArgv = resolveArgs(parsedBuildArgs);

        Object.assign(this.opts, parsedArgv);
      }
    }
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
   * Sets package local option
   *
   * @param {Object} pkgBuildOpts
   * @memberof State
   */
  setPkgJsonOpts(pkgJson) {
    const { name: pkgName, scripts: { build } = {}, builderz } = pkgJson;

    this.pkgName = pkgName;

    this.initOpts();

    /**
     * Extracting other options if there are any.
     */
    this.setOptsFrom(build);

    if (!isEmptyObj(builderz)) {
      Object.assign(this.opts, builderz);
    }

    Object.keys(defaultOpts).forEach((key) => {
      if (this.opts[key] === undefined) {
        this.opts[key] = defaultOpts[key];
      }
    });

    /**
     * As soon as we get local options we can extract bundle options.
     */
    this.extractBundleOpt();
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
