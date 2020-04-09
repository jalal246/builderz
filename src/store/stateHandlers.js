import isBoolean from "lodash.isboolean";
import { resolve } from "path";
import { validateAccess } from "validate-access";
import { msg } from "@mytools/print";
import { NotEmptyArr, isValidArr, camelizeOutputBuild } from "../utils";
import { UMD, CJS, ES } from "../constants";

// /**
//  * Extracts bundle options depending on localOpts and globalOpts that should be
//  * already set.
//  *
//  * @returns {Array}
//  */
// function extractBundleOpt() {
//   const format = state.get("array", "formats");
//   const isMinify = state.get("boolean", "minify");

//   return getBundleOpt(format, isMinify);
// }

// /**
//  * Extract name based on output option if found, else, it looks if isCamelCase
//  * then camelize. otherwise, return jsonPkgName.
//  *
//  * @param {string} jsonPkgName
//  * @returns {string} - output name
//  */
// function extractName(jsonPkgName) {
//   let output = jsonPkgName;

//   const givenName = state.get("string", "output");

//   if (givenName) {
//     output = givenName;
//   } else if (state.get("boolean", "camelCase")) {
//     output = camelizeOutputBuild(jsonPkgName);
//   }

//   msg(`bundle output as ${output}`);

//   return output;
// }

// /**
//  * Extracts alias. If there's local alias in package, then revolve path:
//  * by adding localPkgPath:
//      alias({
//       entries: [
//         { find: 'utils', replacement: 'localPkgPath/../../../utils' },
//         { find: 'batman-1.0.0', replacement: 'localPkgPath/joker-1.5.0' }
//       ]
//  *
//  * @param {string} localPkgPath
//  * @returns {Array}
//  */
// function extractAlias(pkgPath) {
//   const { alias: localAlias } = state.localOpts;

//   if (!isValidArr(localAlias)) return state.globalOpts.alias;

//   /**
//    * If there's local alias passed in package, let's resolve the pass.
//    */
//   localAlias.forEach(({ replacement }, i) => {
//     /**
//      * Assuming we're working in `src` by default.
//      */
//     localAlias[i].replacement = resolve(pkgPath, "src", replacement);
//   });

//   return localAlias;
// }

// /**
//  * Extracts entries by checking global entries, entries passed in Json as
//  * property. If no valid entries, it returns default path: src/index.extension
//  *
//  * @param {Array} entriesJson
//  * @param {string} pkgPath
//  * @returns {Array|string}
//  */
// function extractEntries(entriesJson, pkgPath) {
//   const entries = state.get("array", "entries");

//   if (isValidArr(entries)) {
//     return entries.map((entry) => resolve(pkgPath, entry));
//   }

//   if (isValidArr(entriesJson)) {
//     return entriesJson.map((entryJson) => resolve(pkgPath, entryJson));
//   }

//   const { isValid, isSrc, ext } = validateAccess({
//     dir: pkgPath,
//     isValidateEntry: true,
//     entry: "index",
//     srcName: "src",
//   });

//   // eslint-disable-next-line no-nested-ternary
//   return !isValid
//     ? null
//     : isSrc
//     ? resolve(pkgPath, "src", `index.${ext}`)
//     : resolve(pkgPath, `index.${ext}`);
// }

// export { extractAlias, extractEntries, extractName };
