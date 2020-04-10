export const UMD = "umd";
export const CJS = "cjs";
export const ES = "es";

export const DEV = "development";
export const PROD = "production";

export const IS_SILENT = "isSilent";
export const FORMATS = "formats";
export const MINIFY = "minify";
export const CLEAN_BUILD = "cleanBuild";
export const CAMEL_CASE = "camelCase";
export const BUILD_NAME = "buildName";
export const OUTPUT = "output";
export const PKG_PATHS = "pkgPaths";
export const PKG_NAMES = "pkgNames";
export const ALIAS = "alias";
export const ENTRIES = "entries";
export const BANNER = "banner";

const types = {
  [IS_SILENT]: "boolean",
  [FORMATS]: "array",
  [MINIFY]: "boolean",
  [CLEAN_BUILD]: "boolean",
  [CAMEL_CASE]: "boolean",
  [BUILD_NAME]: "string",
  [OUTPUT]: "string",
  [PKG_PATHS]: "array",
  [PKG_NAMES]: "array",
  [ALIAS]: "array",
  [ENTRIES]: "array",
  [BANNER]: "string",
};

export function getVarTypes(varName) {
  return types[varName];
}
