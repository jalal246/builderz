export const UMD = "umd";
export const CJS = "cjs";
export const ES = "es";

export const DEV = "development";
export const PROD = "production";
export const FORMATS = "formats";
export const MINIFY = "minify";
export const SOURCE_MAP = "sourcemap";
export const CLEAN_BUILD = "cleanBuild";
export const CAMEL_CASE = "camelCase";
export const BUILD_NAME = "buildName";
export const SORT_PACKAGES = "sortPkg";
export const OUTPUT = "output";
export const PKG_PATHS = "pkgPaths";
export const PKG_NAMES = "pkgNames";
export const ES_MODEL = "esModule";
export const STRICT = "strict";
export const ALIAS = "alias";
export const ENTRIES = "entries";
export const EXTERNAL = "external";
export const BABEL = "babel";
export const BANNER = "banner";

export const defaultOpts = {
  [FORMATS]: [],
  [MINIFY]: undefined,
  [SOURCE_MAP]: true,
  [CLEAN_BUILD]: false,
  [SORT_PACKAGES]: true,
  [CAMEL_CASE]: true,
  [BUILD_NAME]: "dist",
  [OUTPUT]: undefined,
  [PKG_PATHS]: [],
  [PKG_NAMES]: [],
  [ES_MODEL]: false,
  [STRICT]: false,
  [ALIAS]: [],
  [ENTRIES]: [],
  [EXTERNAL]: [],
  [BABEL]: {
    enablePreset: true,
    enablePlugins: true,
  },
  [BANNER]: undefined,
};
