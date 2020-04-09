import isBoolean from "lodash.isboolean";
import { isValidArr } from "../utils";

/**
 * Shared state build options, provided by global arguments and local ones exist in each
 * build script.
 */
const State = {
  localOpts: {},

  generalOpts: {
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
  },

  initializer(inputOpts) {
    Object.keys(inputOpts).forEach((inOption) => {
      const input = inputOpts[inOption];

      if (input) {
        this.generalOpts[inOption] = inputOpts[inOption];
      }
    });

    return this.generalOpts;
  },

  set(localOpts, generalOpts) {
    this.localOpts = localOpts;
    this.generalOpts = generalOpts;
  },

  boolean(localOpts, generalOpts, argName) {
    return isBoolean(localOpts[argName])
      ? localOpts[argName]
      : generalOpts[argName];
  },

  array(localOpts, generalOpts, argName) {
    return isValidArr(localOpts[argName])
      ? localOpts[argName]
      : generalOpts[argName];
  },

  string(localOpts, generalOpts, argName) {
    return localOpts[argName] ? localOpts[argName] : generalOpts[argName];
  },

  get(type, argName) {
    return this[type](this.localOpts, this.generalOpts, argName);
  },
};

export default State;
