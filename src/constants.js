export const UMD = "umd";
export const CJS = "cjs";
export const ES = "es";

export const DEV = "development";
export const PROD = "production";

export const SILENT = "silent";
export const FORMATS = "formats";
export const MINIFY = "minify";
export const SOURCE_MAP = "sourcemap";
export const CLEAN_BUILD = "cleanBuild";
export const CAMEL_CASE = "camelCase";
export const BUILD_NAME = "buildName";
export const OUTPUT = "output";
export const PKG_PATHS = "pkgPaths";
export const PKG_NAMES = "pkgNames";
export const ES_MODEL = "esModule";
export const STRICT = "strict";
export const ALIAS = "alias";
export const ENTRIES = "entries";
export const BABEL = "babel";
export const BANNER = "banner";

// export const optsTypes = {
//   [SILENT]: "boolean",
//   [FORMATS]: "array",
//   [MINIFY]: "boolean",
//   [CLEAN_BUILD]: "boolean",
//   [CAMEL_CASE]: "boolean",
//   [BUILD_NAME]: "string",
//   [OUTPUT]: "string",
//   [PKG_PATHS]: "array",
//   [PKG_NAMES]: "array",
//   [ALIAS]: "array",
//   [ENTRIES]: "array",
//   [BANNER]: "string",
// };

export const defaultOpts = {
  [SILENT]: true,
  [FORMATS]: [],
  [MINIFY]: undefined,
  [SOURCE_MAP]: true,
  [CLEAN_BUILD]: false,
  [CAMEL_CASE]: true,
  [BUILD_NAME]: "dist",
  [OUTPUT]: undefined,
  [PKG_PATHS]: [],
  [PKG_NAMES]: [],
  [ES_MODEL]: false,
  [STRICT]: false,
  [ALIAS]: [],
  [ENTRIES]: [],
  [BABEL]: {
    enablePreset: true,
    enablePlugins: true,
  },
  [BANNER]: undefined,
};
