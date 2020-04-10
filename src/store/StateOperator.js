import { resolve } from "path";
import { validateAccess } from "validate-access";
import { camelCase, output, entries } from "constants";

import { isValidArr, camelizeOutputBuild } from "../utils";
import State from "./State";

class StateOperator extends State {
  /**
   * Extract name based on output option if found, else, it looks if isCamelCase
   * then camelize. otherwise, return jsonPkgName.
   *
   * @returns {string} - output name
   * @memberof StateOperator
   */
  extractName() {
    const { name } = this.pkgJsonOpts;

    const outputOpt = this.get("string", output);

    const chosen = outputOpt || name;

    return this.get("boolean", camelCase)
      ? camelizeOutputBuild(chosen)
      : chosen;
  }

  resolvePath(...args) {
    return resolve(this.pkgPath, ...args);
  }

  /**
   * Extracts entries by checking global entries, entries passed in Json as
   * property. If no valid entries, it returns default path: src/index.extension
   *
   * @param {Array} entriesJson
   * @param {string} pkgPath
   * @returns {Array|string}
   * @memberof StateOperator
   */
  extractEntries() {
    const entriesOpt = this.get("array", entries);

    if (isValidArr(entriesOpt)) {
      return entriesOpt.map((entry) => this.resolvePath(entry));
    }

    const { isValid, isSrc, ext } = validateAccess({
      dir: this.pkgPath,
      isValidateEntry: true,
      entry: "index",
      srcName: "src",
    });

    // eslint-disable-next-line no-nested-ternary
    return !isValid
      ? null
      : isSrc
      ? this.resolvePath("src", `index.${ext}`)
      : this.resolvePath(`index.${ext}`);
  }

  /**
 * Extracts alias. If there's local alias in package, then revolve path:
 * by adding localPkgPath:
     alias({
      entries: [
        { find: 'utils', replacement: 'localPkgPath/../../../utils' },
        { find: 'batman-1.0.0', replacement: 'localPkgPath/joker-1.5.0' }
      ]
 *
 * @param {string} localPkgPath
 * @returns {Array
 * @memberof StateOperator
 * 
 */
  extractAlias() {
    const { alias: localAlias } = this.pkgBuildOpts;

    if (!isValidArr(localAlias)) return this.generalOpts.alias;

    /**
     * If there's local alias passed in package, let's resolve the pass.
     */
    localAlias.forEach(({ replacement }, i) => {
      /**
       * Assuming we're working in `src` by default.
       */
      localAlias[i].replacement = this.resolvePath("src", replacement);
    });

    return localAlias;
  }
}

export default StateOperator;
