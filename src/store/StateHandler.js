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
    const { name } = this.pkgJsonOpts;

    const outputOpt = this.get(OUTPUT);

    const chosen = outputOpt || name;

    return this.get(CAMEL_CASE) ? camelizeOutputBuild(chosen) : chosen;
  }

  /**
   * Revolves path taking into consideration current package path.
   *
   * @param {string} args
   * @returns {string}
   * @memberof StateHandler
   */
  resolvePath(...args) {
    return this.shouldPathResolved
      ? resolve(this.pkgPath, ...args)
      : resolve(this.pkgPath, ...args);
  }

  /**
   * Extracts entries based on valid options if found. Otherwise, it returns
   * default path: src/index.extension.
   *
   * @returns {Array|string}
   * @memberof StateHandler
   */
  extractEntries() {
    const entriesOpt = this.get(ENTRIES);

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
    const alias = this.get(ALIAS);

    // const alias = [
    //   { find: "utils", replacement: "localPkgPath/../../../utils" },
    //   { find: "batman-1.0.0", replacement: "localPkgPath/joker-1.5.0" },
    // ];

    /**
     * If there's local alias passed in package, let's resolve the pass.
     */
    alias.forEach(({ replacement }, i) => {
      /**
       * Assuming we're working in `src` by default.
       */
      alias[i].replacement = this.resolvePath(
        this.isSrc ? "src" : null,
        replacement
      );
    });

    return alias;
  }
}

export default StateHandler;
