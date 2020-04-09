import isBoolean from "lodash.isboolean";
import { isValidArr } from "../utils";

/**
 * Shared state build options, provided by global arguments and local ones exist in each
 * build script.
 */
const State = {
  localOpts: {},
  globalOpts: {},

  set(localOpts, globalOpts) {
    this.localOpts = localOpts;
    this.globalOpts = globalOpts;
  },

  boolean(localOpts, globalOpts, argName) {
    return isBoolean(localOpts[argName])
      ? localOpts[argName]
      : globalOpts[argName];
  },

  array(localOpts, globalOpts, argName) {
    return isValidArr(localOpts[argName])
      ? localOpts[argName]
      : globalOpts[argName];
  },

  string(localOpts, globalOpts, argName) {
    return localOpts[argName] ? localOpts[argName] : globalOpts[argName];
  },

  get(type, argName) {
    return this[type](this.localOpts, this.globalOpts, argName);
  },
};

export default State;
