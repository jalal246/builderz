/* eslint-disable no-nested-ternary */
import { resolve } from "path";
import { validateAccess } from "validate-access";
import { CAMEL_CASE, OUTPUT, ENTRIES, ALIAS } from "../constants";

import { isValidArr, camelizeOutputBuild } from "../utils";
import State from "./State";

class StateHandler extends State {
  /**
   * Extracts name based on valid options if found. Otherwise, it takes name of
   * package.json. It checks also CamelCase, if true it does it.
   *
   * @returns {string} - output name
   * @memberof StateHandler
   */
  extractName() {
    const outputOpt = this.opts[OUTPUT];

    const chosen = outputOpt || this.pkgName;

    return this.opts[CAMEL_CASE] ? camelizeOutputBuild(chosen) : chosen;
  }

  /**
   * Revolves path taking into consideration current package path.
   *
   * @param {string} args
   * @returns {string}
   * @memberof StateHandler
   */
  resolvePath(...args) {
    return resolve(this.pkgPath, ...args);
  }

  /**
   * Extracts entries based on valid options if found. Otherwise, it returns
   * default path: src/index.extension.
   *
   * @returns {Array|string}
   * @memberof StateHandler
   */
  extractEntries() {
    const entriesOpt = this.opts[ENTRIES];

    const { isValid, isSrc, ext } = validateAccess({
      dir: this.pkgPath,
      isValidateEntry: true,
      entry: "index",
      srcName: "src",
    });

    this.isSrc = isSrc;

    if (isValidArr(entriesOpt)) {
      return entriesOpt.map((entry) => this.resolvePath(entry));
    }

    if (entriesOpt.length > 0) {
      return this.resolvePath(entriesOpt);
    }

    // eslint-disable-next-line no-nested-ternary
    return !isValid
      ? null
      : isSrc
      ? this.resolvePath("src", `index.${ext}`)
      : this.resolvePath(`index.${ext}`);
  }

  /**
   * Extracts alias based on valid options if found.
   *
   * @returns {Array}
   * @memberof StateHandler
   */
  extractAlias() {
    let alias = this.opts[ALIAS];

    // const alias = [
    //   { find: "utils", replacement: "localPkgPath/../../../utils" },
    //   { find: "batman-1.0.0", replacement: "localPkgPath/joker-1.5.0" },
    // ];

    /**
     * If there's local alias passed in package, let's resolve the pass.
     */
    alias = alias.map((str) => {
      let find;
      let replacement;

      if (typeof str === "string") {
        // eslint-disable-next-line prefer-const
        [find, replacement] = str.split("=");
      } else {
        ({ find, replacement } = str);
      }

      if (this.shouldPathResolved) {
        /**
         * Assuming we're working in `src` by default.
         */
        replacement = this.resolvePath(this.isSrc ? "src" : null, replacement);
      }

      return { find, replacement };
    });

    return alias;
  }
}

export default StateHandler;
