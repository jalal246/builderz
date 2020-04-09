import isBoolean from "lodash.isboolean";
import { isValidArr } from "../utils";

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

  setLocal(localOpts) {
    this.localOpts = localOpts;
  }

  get(type, argName) {
    console.log("State -> get -> get", type, argName);
    return State[type](this.localOpts, this.generalOpts, argName);
  }
}

export default State;
