#!/usr/bin/env node
'use strict';

var error = require('@mytools/print');
var path = require('path');
var rollup = require('rollup');
var del = require('del');
var packageSorter = require('package-sorter');
var getInfo = require('get-info');
var beep = require('@rollup/plugin-beep');
var auto = require('@rollup/plugin-auto-install');
var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var json = require('@rollup/plugin-json');
var aliasPlugin = require('@rollup/plugin-alias');
var multiEntry = require('@rollup/plugin-multi-entry');
var postcss = require('rollup-plugin-postcss');
var babel = require('rollup-plugin-babel');
var rollupPluginTerser = require('rollup-plugin-terser');
var analyze = require('rollup-plugin-analyzer');
var camelize = require('camelize');
var isBoolean = require('lodash.isboolean');
var validateAccess = require('validate-access');
var shellQuote = require('shell-quote');
var isEmptyObj = require('lodash.isempty');

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  return function () {
    var Super = _getPrototypeOf(Derived),
        result;

    if (_isNativeReflectConstruct()) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

const UMD = "umd";
const CJS = "cjs";
const ES = "es";
const SILENT = "silent";
const FORMATS = "formats";
const MINIFY = "minify";
const SOURCE_MAP = "sourcemap";
const CLEAN_BUILD = "cleanBuild";
const CAMEL_CASE = "camelCase";
const BUILD_NAME = "buildName";
const OUTPUT = "output";
const PKG_PATHS = "pkgPaths";
const PKG_NAMES = "pkgNames";
const ALIAS = "alias";
const ENTRIES = "entries";
const BANNER = "banner"; // export const optsTypes = {
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

const defaultOpts = {
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
  [ALIAS]: [],
  [ENTRIES]: [],
  [BANNER]: undefined
};

/**
 * Returns plugins according to passed flags.
 *
 * @param {boolean} [isSilent=true]
 * @param {boolean} [isProd=true]
 * @param {string} buildFormat
 * @returns {Array} plugins
 */

function getPlugins({
  isSilent,
  isProd,
  isMultiEntries,
  buildFormat,
  buildPath,
  buildName,
  alias,
  idx
}) {
  const essentialPlugins = [
  /**
   * Beeps when a build ends with errors.
   */
  beep(), babel({
    runtimeHelpers: true,
    babelrc: true
  }), isMultiEntries ? multiEntry() : null, alias.length > 0 ? aliasPlugin({
    entries: alias
  }) : null,
  /**
   * Automatically installs dependencies that are imported by a bundle, even
   * if not yet in package.json.
   */
  auto(),
  /**
   * Convert CommonJS modules to ES6, so they can be included in a Rollup
   * bundle.
   */
  commonjs(),
  /**
   * Locates modules using the Node resolution algorithm, for using third
   * party modules in node_modules.
   */
  resolve({
    preferBuiltins: true,
    extensions: [".mjs", ".js", ".jsx", ".json", ".node"]
  }),
  /**
   * Converts .json files to ES6 modules.
   */
  json(), postcss({
    inject: false,
    extract: idx === 0 && path.join(buildPath, `${buildName}.css`)
  }),
  /**
   * Minify generated bundle.
   */
  isProd ? rollupPluginTerser.terser({
    // default undefined
    ecma: 5,
    // default false
    sourcemap: true,
    // display warnings when dropping unreachable code or unused declarations etc
    warnings: true,
    compress: {
      // default: false
      // true to discard calls to console.* functions.
      drop_console: true,
      // default: false
      // true to prevent Infinity from being compressed into 1/0, which may cause performance issues on Chrome.
      keep_infinity: true,
      // default: 1
      // maximum number of times to run compress. In some cases more than
      // one pass leads to further compressed cod Keep in mind more passes
      // will take more time.
      passes: 10
    },
    output: {
      // default: true
      // pass false if you do not want to wrap function expressions that are
      // passed as arguments, in parenthesis.
      // turning it to false in the sake of size.
      wrap_func_args: false
    },
    // pass an empty object {} or a previously used nameCache object
    // if you wish to cache mangled variable
    // and property names across multiple invocations of minify
    nameCache: {},
    mangle: {
      properties: false
    },
    // true if to enable top level variable
    // and function name mangling
    // and to drop unused variables and functions.
    toplevel: buildFormat === CJS || buildFormat === ES
  }) : null].filter(Boolean);

  if (!isSilent) {
    essentialPlugins.push(analyze({
      summaryOnly: true
    }));
  }

  return essentialPlugins;
}

/**
 * Resolves external dependencies and peerDependencies for package input
 * according to build format.
 *
 * @param {Object} json.peerDependencies
 * @param {Object} json.dependencies
 * @param {string} buildFormat
 *
 * @returns {function} - function resolver
 */

function getExternal({
  peerDependencies,
  dependencies,
  buildFormat
}) {
  const external = [];
  /**
   * Always exclude peer deps.
   */

  if (peerDependencies) {
    external.push(...Object.keys(peerDependencies));
  }
  /**
   * Add dependencies to bundle when umd
   */


  if (buildFormat !== UMD) {
    external.push(...Object.keys(dependencies));
  }

  return external.length === 0 ? () => false : id => new RegExp(`^(${external.join("|")})($|/)`).test(id);
}

/**
 * Gets build input
 *
 * @param {Object} flags
 * @param {boolean} flags.isSilent
 * @param {boolean} flags.isProd
 *
 * @param {Object} json
 * @param {Object} json.peerDependencies
 * @param {Object} json.dependencies
 *
 * @param {string} sourcePath - where package is located
 * @param {string} buildFormat - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */

function genInput({
  flags: {
    isSilent,
    isProd
  },
  json: {
    peerDependencies,
    dependencies
  },
  outputBuild: {
    buildPath,
    buildName,
    buildFormat
  },
  entries,
  alias,
  idx
}) {
  const external = getExternal({
    peerDependencies,
    dependencies,
    buildFormat
  });
  const isMultiEntries = Array.isArray(entries);
  const plugins = getPlugins({
    isSilent,
    isProd,
    buildFormat,
    buildPath,
    buildName,
    isMultiEntries,
    alias,
    idx
  });
  return {
    input: entries,
    external,
    plugins
  };
}

/**
 * Don't include peerDependencies in a bundle.
 * Called when umd.
 *
 * @param {Object} peerDependencies
 * @returns Array of external deps not included in bundle.
 */

function getGlobal(peerDependencies = {}) {
  return Object.keys(peerDependencies).reduce((deps, dep) => {
    // eslint-disable-next-line
    deps[dep] = camelize(dep);
    return deps;
  }, {});
}

function NotEmptyArr(arr) {
  return arr.length > 0;
}
/**
 * Checks if passed arr is type array and not empty
 *
 * @param {Array} arr
 * @returns {boolean}
 */


function isValidArr(arr) {
  return Array.isArray(arr) && NotEmptyArr(arr);
}
/**
 * Modify package name in package.json to name the output build correctly.
 * remove @
 * replace / with -
 * remove - and capitalize the first letter after it
 *
 * @param {string} name - package name in package.json
 * @returns {string} modified name for bundle
 */


function camelizeOutputBuild(name) {
  return camelize(name.replace("@", "").replace("/", "-"));
}
/**
 * Gen bundle format and minify options
 *
 * @param {Array} customFormats
 * @param {boolean} isMinify
 * @returns {Object[]} bundle output options
 */


function getBundleOpt(customFormats, isMinify) {
  const DEFAULT_FORMATS = [UMD, CJS, ES];
  const gen = [];
  const buildFormat = NotEmptyArr(customFormats) ? customFormats : DEFAULT_FORMATS;
  const minifyingProcess = NotEmptyArr(customFormats) && isBoolean(isMinify) ? [isMinify] : [true, false];
  buildFormat.forEach(format => {
    minifyingProcess.forEach(bool => {
      gen.push({
        buildFormat: format,
        isProd: bool
      });
    });
  });
  return gen;
}

/**
 * Gets full bundle name camelized with extension
 *
 * @param {Object} flags
 * @param {boolean} flags.isProd
 *
 * @param {string} camelizedName - camelized package name
 * @param {string} buildFormat - type of build (cjs|umd|etc)
 *
 * @returns {string} name with full extension
 */

function getBundleName({
  buildName,
  buildFormat,
  flags: {
    isProd
  }
}) {
  let ext;

  if (buildFormat === UMD) {
    ext = "umd.js";
  } else if (buildFormat === CJS) {
    ext = "cjs.js";
  } else if (buildFormat === ES) {
    ext = "esm.js";
  }

  const fname = `${buildName}.${isProd ? `min.${ext}` : `${ext}`}`;
  return fname;
}
/**
 * Gets build
 *
 * @param {Object} flags
 * @param {boolean} flags.isProd
 *
 * @param {string} outputName -  package output name
 *
 * @param {Object} json
 * @param {Object} json.peerDependencies
 *
 * @param {string} distPath - where bundle will be located
 * @param {string} buildFormat - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */


function getOutput({
  flags,
  outputBuild: {
    buildPath,
    buildName,
    buildFormat
  },
  json: {
    peerDependencies
  },
  isSourcemap,
  banner
}) {
  const {
    isProd
  } = flags;
  const name = getBundleName({
    buildName,
    buildFormat,
    flags: {
      isProd
    }
  });
  const output = {
    file: path.join(buildPath, name),
    format: buildFormat,
    name,
    interop: false
  };

  if (buildFormat === UMD) {
    output.globals = getGlobal(peerDependencies);
  }

  if ((isProd || buildFormat === UMD) && isSourcemap) {
    output.sourcemap = true;
  }

  if (banner && NotEmptyArr(banner)) {
    output.banner = banner;
  }

  return output;
}

const yargs = require("yargs");

function resolveArgs(args) {
  yargs.option("silent", {
    alias: "s",
    describe: "Silent mode, mutes build massages",
    type: "boolean" // default: true,

  }).option("formats", {
    alias: "f",
    describe: "Specific build format",
    type: "array" // default: [],

  }).option("minify", {
    alias: "m",
    describe: "Minify bundle works only if format is provided",
    type: "boolean" // default: false,

  }).option("sourcemap", {
    describe: "Enable sourcemap in output",
    type: "boolean" // default: true,

  }).option("camel-case", {
    alias: "c",
    describe: "Add camel-cased output file",
    type: "boolean" // default: true,

  }).option("clean-build", {
    alias: "l",
    describe: "Clean previous build folder",
    type: "boolean" // default: false,

  }).option("build-name", {
    alias: "b",
    describe: "Specific folder build name",
    type: "string" // default: "dist",

  }).option("output", {
    alias: "o",
    describe: "Custom output name",
    type: "string"
  }).option("pkg-paths", {
    alias: "w",
    describe: "Provide custom paths not in the root/src",
    type: "array" // default: [],

  }).option("pkg-names", {
    alias: "n",
    describe: "Building specific package[s], in workspace",
    type: "array" // default: [],

  }).option("alias", {
    alias: "a",
    describe: "Provide custom paths not in the root/srcPackage Alias",
    type: "array" // default: [],

  }).option("entries", {
    alias: "e",
    describe: "Add multi entries instead of default src/index" // default: [],

  }).option("banner", {
    alias: "r",
    describe: "Add banner to output",
    type: "string"
  });
  return args ? yargs.parse(args) : yargs.default().argv;
}

/**
 *  State build options.
 *
 * @class State
 */

let State = /*#__PURE__*/function () {
  /**
   * Creates an instance of State.
   *
   * @param {Object} opts
   * @param {boolean} isInit
   * @memberof State
   */
  function State(generalOpts) {
    _classCallCheck(this, State);

    /**
     * package build options in build script.
     */
    this.pkgBuildOpts = {};
    /**
     * package Json options in packages.json as properties.
     */

    this.pkgJsonOpts = {};
    this.generalOpts = generalOpts;
  }
  /**
   * Assign global opts to current. This step is done for every cycle.
   *
   * @memberof State
   */


  _createClass(State, [{
    key: "initOpts",
    value: function initOpts() {
      this.opts = { ...this.generalOpts
      };
    }
  }, {
    key: "setOptsFrom",
    value: function setOptsFrom(obj) {
      /**
       * Parsing empty object throws an error/
       */
      if (!isEmptyObj(obj)) {
        const parsedBuildArgs = shellQuote.parse(obj);

        if (isValidArr(parsedBuildArgs)) {
          const parsedArgv = resolveArgs(parsedBuildArgs);
          Object.assign(this.opts, parsedArgv);
        }
      }
    }
    /**
     * Extracts bundle options depending on pkgBuildOpts and generalOpts that should be
     * already set.
     *
     * @returns {Array}
     * @memberof State
     */

  }, {
    key: "extractBundleOpt",
    value: function extractBundleOpt() {
      const formats = this.opts[FORMATS];
      const isMinify = this.opts[MINIFY];
      this.bundleOpt = getBundleOpt(formats, isMinify);
    }
    /**
     * Sets package local option
     *
     * @param {Object} pkgBuildOpts
     * @memberof State
     */

  }, {
    key: "setPkgJsonOpts",
    value: function setPkgJsonOpts(pkgJson) {
      const {
        name: pkgName,
        scripts: {
          build
        } = {},
        builderz
      } = pkgJson;
      this.pkgName = pkgName;
      this.initOpts();
      /**
       * Extracting other options if there are any.
       */

      this.setOptsFrom(build);

      if (!isEmptyObj(builderz)) {
        Object.assign(this.opts, builderz);
      }

      Object.keys(defaultOpts).forEach(key => {
        if (this.opts[key] === undefined) {
          this.opts[key] = defaultOpts[key];
        }
      });
      /**
       * As soon as we get local options we can extract bundle options.
       */

      this.extractBundleOpt();
    }
  }, {
    key: "setPkgPath",
    value: function setPkgPath(pkgPath) {
      const relativePath = path.relative(process.cwd(), pkgPath);
      /**
       * If working directory is the same as package path, don't resolve path.
       */

      this.shouldPathResolved = relativePath.length !== 0;
      this.pkgPath = pkgPath;
    }
  }]);

  return State;
}();

let StateHandler = /*#__PURE__*/function (_State) {
  _inherits(StateHandler, _State);

  var _super = _createSuper(StateHandler);

  function StateHandler() {
    _classCallCheck(this, StateHandler);

    return _super.apply(this, arguments);
  }

  _createClass(StateHandler, [{
    key: "extractName",

    /**
     * Extracts name based on valid options if found. Otherwise, it takes name of
     * package.json. It checks also CamelCase, if true it does it.
     *
     * @returns {string} - output name
     * @memberof StateHandler
     */
    value: function extractName() {
      const outputOpt = this.opts[OUTPUT];
      const chosen = outputOpt || this.pkgName || path.basename(this.pkgPath);
      return this.opts[CAMEL_CASE] ? camelizeOutputBuild(chosen) : chosen;
    }
    /**
     * Revolves path taking into consideration current package path.
     *
     * @param {string} args
     * @returns {string}
     * @memberof StateHandler
     */

  }, {
    key: "resolvePath",
    value: function resolvePath(...args) {
      return path.resolve(this.pkgPath, ...args);
    }
    /**
     * Extracts entries based on valid options if found. Otherwise, it returns
     * default path: src/index.extension.
     *
     * @returns {Array|string}
     * @memberof StateHandler
     */

  }, {
    key: "extractEntries",
    value: function extractEntries() {
      const entriesOpt = this.opts[ENTRIES];
      const {
        isValid,
        isSrc,
        ext
      } = validateAccess.validateAccess({
        dir: this.pkgPath,
        isValidateEntry: true,
        entry: "index",
        srcName: "src"
      });
      this.isSrc = isSrc;

      if (isValidArr(entriesOpt)) {
        return entriesOpt.map(entry => this.resolvePath(entry));
      }

      if (entriesOpt.length > 0) {
        return this.resolvePath(entriesOpt);
      } // eslint-disable-next-line no-nested-ternary


      return !isValid ? null : isSrc ? this.resolvePath("src", `index.${ext}`) : this.resolvePath(`index.${ext}`);
    }
    /**
     * Extracts alias based on valid options if found.
     *
     * @returns {Array}
     * @memberof StateHandler
     */

  }, {
    key: "extractAlias",
    value: function extractAlias() {
      let alias = this.opts[ALIAS]; // const alias = [
      //   { find: "utils", replacement: "localPkgPath/../../../utils" },
      //   { find: "batman-1.0.0", replacement: "localPkgPath/joker-1.5.0" },
      // ];

      /**
       * If there's local alias passed in package, let's resolve the pass.
       */

      alias = alias.map(str => {
        let find;
        let replacement;

        if (typeof str === "string") {
          // eslint-disable-next-line prefer-const
          [find, replacement] = str.split("=");
        } else {
          ({
            find,
            replacement
          } = str);
        }

        if (this.shouldPathResolved) {
          /**
           * Assuming we're working in `src` by default.
           */
          replacement = this.resolvePath(this.isSrc ? "src" : null, replacement);
        }

        return {
          find,
          replacement
        };
      });
      return alias;
    }
  }]);

  return StateHandler;
}(State);

/**
 * Write bundle.
 *
 * @param {Object} inputOptions
 * @param {Object} outputOptions
 */

function build(_x, _x2) {
  return _build.apply(this, arguments);
}

function _build() {
  _build = _asyncToGenerator(function* (inputOptions, outputOptions) {
    try {
      /**
       * create a bundle
       */
      const bundle = yield rollup.rollup(inputOptions);
      /**
       * write the bundle to disk
       */

      yield bundle.write(outputOptions);
    } catch (err) {
      error.error(err);
    }
  });
  return _build.apply(this, arguments);
}

function builderz(_x3) {
  return _builderz.apply(this, arguments);
}

function _builderz() {
  _builderz = _asyncToGenerator(function* (opts, {
    isInitOpts = true
  } = {}) {
    const state = new StateHandler(opts, isInitOpts);
    const {
      pkgPaths = [],
      pkgNames
    } = state.generalOpts;
    const {
      json: allPkgJson,
      pkgInfo: allPkgInfo
    } = isValidArr(pkgNames) ? getInfo.getJsonByName(...pkgNames) : getInfo.getJsonByPath(...pkgPaths);

    if (allPkgJson.length === 0) {
      error.error(`Builderz has not found any valid package.json`);
    }
    /**
     * Sort packages before bump to production.
     */


    const {
      sorted,
      unSorted
    } = packageSorter(allPkgJson);

    if (NotEmptyArr(unSorted)) {
      error.error(`Unable to sort packages: ${unSorted}`);
    }

    try {
      yield sorted.reduce( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(function* (sortedPromise, json) {
          yield sortedPromise;
          state.setPkgJsonOpts(json);
          const {
            name,
            peerDependencies = {},
            dependencies = {}
          } = json;
          const pkgInfo = allPkgInfo[name];
          const {
            path: pkgPath
          } = pkgInfo;
          state.setPkgPath(pkgPath);
          const buildPath = path.resolve(pkgPath, state.opts[BUILD_NAME]);

          if (state.opts[CLEAN_BUILD]) {
            yield del(buildPath);
          }

          const entries = state.extractEntries();
          const alias = state.extractAlias();
          const buildName = state.extractName();
          const banner = state.opts[BANNER];
          const isSourcemap = state.opts[SOURCE_MAP];
          const isSilent = state.opts[SILENT];
          yield state.bundleOpt.reduce( /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(function* (bundleOptPromise, {
              isProd,
              buildFormat
            }, idx) {
              yield bundleOptPromise;
              const outputBuild = {
                buildPath,
                buildName,
                buildFormat
              };
              const input = yield genInput({
                flags: {
                  isSilent,
                  isProd
                },
                json: {
                  peerDependencies,
                  dependencies
                },
                outputBuild,
                entries,
                alias,
                idx
              });
              const output = yield getOutput({
                flags: {
                  isProd
                },
                json: {
                  peerDependencies
                },
                outputBuild,
                isSourcemap,
                banner
              });
              yield build(input, output);
            });

            return function (_x6, _x7, _x8) {
              return _ref2.apply(this, arguments);
            };
          }(), Promise.resolve());
        });

        return function (_x4, _x5) {
          return _ref.apply(this, arguments);
        };
      }(), Promise.resolve());
    } catch (err) {
      console.error(err);
    }
  });
  return _builderz.apply(this, arguments);
}

const globalArgs = resolveArgs();

function run() {
  try {
    builderz(globalArgs.opts(), {
      isInitOpts: false
    });
  } catch (err) {
    error(err);
  }
}

run();
