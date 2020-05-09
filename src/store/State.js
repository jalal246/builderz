/* eslint-disable no-nested-ternary */
import { resolve, relative } from "path";

import del from "del";
import resolveArgs from "../resolveArgs";
import {
  FORMATS,
  MINIFY,
  defaultOpts,
  BUILD_NAME,
  CLEAN_BUILD,
} from "../constants";
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

    /**
     * active working options
     */
    this.opts = {};
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
  setNewPkg() {
    /**
     * reset old info
     */
    this.plugins = {};
    this.pkg = {};
    this.output = {};

    /**
     * Resets opts for each new package.
     */
    this.opts = { ...this.generalOpts };
  }

  checkOpts() {
    Object.keys(defaultOpts).forEach((key) => {
      if (this.opts[key] === undefined) {
        this.opts[key] = defaultOpts[key];
      }
    });
  }

  assignJson(pkgJson) {
    const { name, scripts, builderz, peerDependencies, dependencies } = pkgJson;

    this.pkg = {
      name,
      peerDependencies,
      dependencies,
    };

    /**
     * Extracting other options if there are any.
     */
    if (scripts) {
      const { build } = scripts;
      if (build && build.length > 0) {
        const parsedArgv = resolveArgs(build);

        this.mergeOpts(parsedArgv);
      }
    }

    if (builderz && Object.keys(builderz).length > 0) {
      this.mergeOpts(builderz);
    }
  }

  async setPkgPath(cwd) {
    const relativePath = relative(process.cwd(), cwd);

    /**
     * If working directory is the same as package path, don't resolve path.
     */
    this.shouldPathResolved = relativePath.length !== 0;

    this.pkg.cwd = cwd;

    this.output.buildPath = resolve(cwd, this.opts[BUILD_NAME]);

    if (this.opts[CLEAN_BUILD]) {
      await del(this.output.buildPath);
    }
  }

  unpackBundleOpts() {
    /**
     * Extracts bundle options depending on pkgBuildOpts and generalOpts that should be
     * already set.
     */
    const formats = this.opts[FORMATS];
    const isMinify = this.opts[MINIFY];

    return getBundleOpt(formats, isMinify);
  }
}

export default State;
