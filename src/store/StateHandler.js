/* eslint-disable no-nested-ternary */
import { resolve, basename } from "path";
import { validateAccess } from "validate-access";
import { CAMEL_CASE, OUTPUT, ENTRIES, ALIAS } from "../constants";

import { camelizeOutputBuild, bindFunc } from "../utils";
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

    const chosen = outputOpt || this.pkgName || basename(this.pkgPath);

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
    /**
     * Reset associated properties
     */
    ["entries", "isSrc", "isTypeScript"].forEach((prop) => {
      if (this.plugins[prop]) this.plugins[prop] = null;
    });

    const entriesOpt = this.opts[ENTRIES];

    const { length } = entriesOpt;

    const input = length >= 1 ? entriesOpt : "index";

    const { isJsonValid, isSrc, isEntryValid, ...rest } = validateAccess({
      dir: this.pkgPath,
      isValidateJson: false,
      entry: input,
    });

    this.resolvePathSrc = bindFunc(this.resolvePath, isSrc ? "src" : null);

    this.plugins.isSrc = isSrc;

    if (Array.isArray(isEntryValid)) {
      this.plugins.entries = isEntryValid
        .map(({ isValid, entry, entryExt }) => {
          if (isValid) {
            if (!this.isTypeScript && entryExt === "ts") {
              this.isTypeScript = true;
            }

            return this.resolvePathSrc(`${entry}.${entryExt}`);
          }

          console.warn(
            `It seems you've entered incorrect entry.`,
            `${entry} is invalid`
          );

          return null;
        })
        .filter(Boolean);
    } else if (isEntryValid) {
      const { entry, entryExt } = rest;

      this.plugins.isTypeScript = entryExt === "ts";

      this.plugins.entries = this.resolvePathSrc(`${entry}.${entryExt}`);
    }

    if (!this.plugins.entries || this.plugins.entries.length === 0) {
      throw new Error(`Cannot bundle invalid entry ${input}`);
    }

    return this.plugins.entries;
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
        replacement = this.resolvePathSrc(replacement);
      }

      return { find, replacement };
    });

    return alias;
  }
}

export default StateHandler;
