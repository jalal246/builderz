'use strict';

var path = require('path');
var rollup = require('rollup');
var print = require('@mytools/print');
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
var babel = require('rollup-plugin-babel');
var rollupPluginTerser = require('rollup-plugin-terser');
var analyze = require('rollup-plugin-analyzer');
var camelize = require('camelize');
var isBoolean = require('lodash.isboolean');
var validateAccess = require('validate-access');
var shellQuote = require('shell-quote');
var isEmptyObj = require('lodash.isempty');

const UMD = "umd";
const CJS = "cjs";
const ES = "es";
const IS_SILENT = "isSilent";
const FORMATS = "formats";
const MINIFY = "minify";
const CLEAN_BUILD = "cleanBuild";
const CAMEL_CASE = "camelCase";
const BUILD_NAME = "buildName";
const OUTPUT = "output";
const PKG_PATHS = "pkgPaths";
const PKG_NAMES = "pkgNames";
const ALIAS = "alias";
const ENTRIES = "entries";
const BANNER = "banner";
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
  [BANNER]: "string"
};
function getVarTypes(varName) {
  return types[varName];
}

/**
 * Returns plugins according to passed flags.
 *
 * @param {boolean} [IS_SILENT=true]
 * @param {boolean} [IS_PROD=true]
 * @param {string} BUILD_FORMAT
 * @returns {Array} plugins
 */

function getPlugins({
  // TODO: why those are capital? with default values?
  IS_SILENT = true,
  IS_PROD = true,
  isMultiEntries,
  BUILD_FORMAT,
  alias
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
  json()].filter(Boolean);

  if (!IS_SILENT) {
    essentialPlugins.push(analyze({
      summaryOnly: true
    }));
  }

  if (IS_PROD) {
    essentialPlugins.push(
    /**
     * Minify generated es bundle.
     */
    rollupPluginTerser.terser({
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
        keep_infinity: true
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
      toplevel: BUILD_FORMAT === CJS || BUILD_FORMAT === ES
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
 * @param {string} BUILD_FORMAT
 *
 * @returns {function} - function resolver
 */

function getExternal({
  peerDependencies,
  dependencies,
  BUILD_FORMAT
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


  if (BUILD_FORMAT !== UMD) {
    external.push(...Object.keys(dependencies));
  }

  return external.length === 0 ? () => false : id => new RegExp(`^(${external.join("|")})($|/)`).test(id);
}

/**
 * Gets build input
 *
 * @param {Object} flags
 * @param {boolean} flags.IS_SILENT
 * @param {boolean} flags.IS_PROD
 *
 * @param {Object} json
 * @param {Object} json.peerDependencies
 * @param {Object} json.dependencies
 *
 * @param {string} sourcePath - where package is located
 * @param {string} BUILD_FORMAT - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */

function genInput({
  flags: {
    IS_SILENT,
    IS_PROD
  },
  json: {
    peerDependencies,
    dependencies
  },
  entries,
  BUILD_FORMAT,
  alias
}) {
  const external = getExternal({
    peerDependencies,
    dependencies,
    BUILD_FORMAT
  });
  const isMultiEntries = Array.isArray(entries);
  const plugins = getPlugins({
    IS_SILENT,
    IS_PROD,
    BUILD_FORMAT,
    isMultiEntries,
    alias
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
        BUILD_FORMAT: format,
        IS_PROD: bool
      });
    });
  });
  return gen;
}

/**
 * Gets full bundle name camelized with extension
 *
 * @param {Object} flags
 * @param {boolean} flags.IS_PROD
 *
 * @param {string} camelizedName - camelized package name
 * @param {string} BUILD_FORMAT - type of build (cjs|umd|etc)
 *
 * @returns {string} name with full extension
 */

function getBundleName({
  outputName,
  BUILD_FORMAT,
  flags: {
    IS_PROD
  }
}) {
  let ext;

  if (BUILD_FORMAT === UMD) {
    ext = "umd.js";
  } else if (BUILD_FORMAT === CJS) {
    ext = "cjs.js";
  } else if (BUILD_FORMAT === ES) {
    ext = "esm.js";
  }

  const fname = `${outputName}.${IS_PROD ? `min.${ext}` : `${ext}`}`;
  return fname;
}
/**
 * Gets build
 *
 * @param {Object} flags
 * @param {boolean} flags.IS_PROD
 *
 * @param {string} outputName -  package output name
 *
 * @param {Object} json
 * @param {Object} json.peerDependencies
 *
 * @param {string} distPath - where bundle will be located
 * @param {string} BUILD_FORMAT - type of build (cjs|umd|etc)
 *
 * @returns {Object} contains input option for the package.
 */


function getOutput({
  flags,
  outputName,
  json: {
    peerDependencies
  },
  buildPath,
  BUILD_FORMAT,
  banner
}) {
  const {
    IS_PROD
  } = flags;
  const name = getBundleName({
    outputName,
    BUILD_FORMAT,
    flags: {
      IS_PROD
    }
  });
  const output = {
    file: path.join(buildPath, name),
    format: BUILD_FORMAT,
    name,
    interop: false
  };

  if (BUILD_FORMAT === UMD) {
    output.globals = getGlobal(peerDependencies);
  }

  if (IS_PROD || BUILD_FORMAT === UMD) {
    output.sourcemap = true;
  }

  if (banner && NotEmptyArr(banner)) {
    output.banner = banner;
  }

  return output;
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

const {
  program
} = require("commander");
/**
 * Converts string to Array.
 *
 * @param {string} value
 * @returns {Array}
 */


function string2Arr(value) {
  return value.split(",");
}
/**
 * Extracts string to suit plugins entries
 * {@link https://www.npmjs.com/package/@rollup/plugin-alias}
 *
 * @param {string[]} alias - batman=../../../batman
 * @returns {Object[]} - {find, replacement}
 */


function parseAlias(aliasStr) {
  const alias = string2Arr(aliasStr).map(str => {
    const [key, value] = str.split("=");
    return {
      find: key,
      replacement: value
    };
  });
  return alias;
}

function resolveArgs(argv) {
  program.option("-s, --silent <boolean>", "Silent mode, mutes build massages", true).option("-f, --formats <list>", "Specific build format", string2Arr, []).option("-m, --minify <boolean>", "Minify bundle works only if format is provided", false).option("-c, --camel-case <boolean>", "Add camel-cased output file", true).option("-l, --clean-build <boolean>", "Clean previous build folder", false).option("-b, --build-name <string>", "Specific folder build name", "dist").option("-o, --output <string>", "Custom output name").option("-w, --pkg-paths <list>", "Provide custom paths not in the root/src", string2Arr, []).option("-n, --pkg-names <list>", "Building specific package[s], in workspace", string2Arr, []).option("-a, --alias <list>", "Package Alias", parseAlias, []).option("-e, --entries <list>", "Add multi entries instead of default src/index.", parseAlias, []).option("-r, --banner <string>", "Add banner to output");

  if (argv) {
    program.allowUnknownOption();
  }

  return program.parse(argv || process.argv);
}

/**
 *  State build options.
 *
 * @class State
 */

let State = /*#__PURE__*/function () {
  _createClass(State, null, [{
    key: "boolean",

    /**
     * Gets boolean option exists in pkgBuildOpts or generalOpts. pkgBuildOpts have
     * always the priority.
     *
     * @static
     * @param {Object} pkgBuildOpts
     * @param {Object} generalOpts
     * @param {string} argName
     * @returns {boolean|undefined}
     * @memberof State
     */
    value: function boolean(pkgBuildOpts, pkgJson, generalOpts, argName) {
      return isBoolean(pkgBuildOpts[argName]) ? pkgBuildOpts[argName] : isBoolean(pkgJson[argName]) ? pkgJson[argName] : generalOpts[argName];
    }
    /**
     * Gets array option exists in pkgBuildOpts or generalOpts. pkgBuildOpts have
     * always the priority.
     *
     * @static
     * @param {Object} pkgBuildOpts
     * @param {Object} generalOpts
     * @param {string} argName
     * @returns {Array}
     * @memberof State
     */

  }, {
    key: "array",
    value: function array(pkgBuildOpts, pkgJson, generalOpts, argName) {
      return isValidArr(pkgBuildOpts[argName]) ? pkgBuildOpts[argName] : isValidArr(pkgJson[argName]) ? pkgJson[argName] : generalOpts[argName];
    }
    /**
     * Gets string option exists in pkgBuildOpts or generalOpts. pkgBuildOpts have
     * always the priority.
     *
     * @static
     * @param {Object} pkgBuildOpts
     * @param {Object} generalOpts
     * @param {string} argName
     * @returns {string}
     * @memberof State
     */

  }, {
    key: "string",
    value: function string(pkgBuildOpts, pkgJson, generalOpts, argName) {
      return pkgBuildOpts[argName] ? pkgBuildOpts[argName] : pkgJson[argName] ? pkgJson[argName] : generalOpts[argName];
    }
    /**
     * Creates an instance of State.
     *
     * @param {Object} opts
     * @param {boolean} isInit
     * @memberof State
     */

  }]);

  function State(generalOpts, isInit) {
    _classCallCheck(this, State);

    /**
     * package build options in build script.
     */
    this.pkgBuildOpts = {};
    /**
     * package Json options in packages.json as properties.
     */

    this.pkgJsonOpts = {};
    /**
     * general options passed when running builderz.
     */

    this.generalOpts = {
      [IS_SILENT]: true,
      [FORMATS]: [],
      [MINIFY]: undefined,
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
    if (isInit) this.initializer(generalOpts);else this.generalOpts = generalOpts;
  }
  /**
   * Initialize generalOpts.
   *
   * @param {Object} inputOpts
   * @memberof State
   */


  _createClass(State, [{
    key: "initializer",
    value: function initializer(inputOpts) {
      Object.keys(inputOpts).forEach(inOption => {
        const input = inputOpts[inOption];

        if (input !== undefined) {
          this.generalOpts[inOption] = inputOpts[inOption];
        }
      });
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
      const format = this.get(FORMATS);
      const isMinify = this.get(MINIFY);
      this.bundleOpt = getBundleOpt(format, isMinify);
    }
    /**
     * Sets package local option
     *
     * @param {Object} pkgBuildOpts
     * @memberof State
     */

  }, {
    key: "setPkgBuildOpts",
    value: function setPkgBuildOpts() {
      const {
        scripts: {
          build: buildArgs
        } = {}
      } = this.pkgJsonOpts;
      /**
       * Parsing empty object throws an error/
       */

      if (!isEmptyObj(buildArgs)) {
        const parsedBuildArgs = shellQuote.parse(buildArgs);

        if (isValidArr(parsedBuildArgs)) {
          /**
           * For some unknown reason, resolveArgs doesn't work correctly when
           * passing args without string first. So, yeah, I did it this way.
           */
          parsedBuildArgs.unshift("builderz");
          this.pkgBuildOpts = resolveArgs(parsedBuildArgs).opts();
        }
      }
      /**
       * As soon as we get local options we can extract bundle option.
       */


      this.extractBundleOpt();
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
      this.pkgJsonOpts = pkgJson;
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
  }, {
    key: "get",
    value: function get(argName) {
      const type = getVarTypes(argName);
      return State[type](this.pkgBuildOpts, this.pkgJsonOpts, this.generalOpts, argName);
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
      const {
        name
      } = this.pkgJsonOpts;
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

  }, {
    key: "resolvePath",
    value: function resolvePath(...args) {
      return this.shouldPathResolved ? path.resolve(this.pkgPath, ...args) : path.resolve(this.pkgPath, ...args);
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
      const entriesOpt = this.get(ENTRIES);
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
      const alias = this.get(ALIAS); // const alias = [
      //   { find: "utils", replacement: "localPkgPath/../../../utils" },
      //   { find: "batman-1.0.0", replacement: "localPkgPath/joker-1.5.0" },
      // ];

      /**
       * If there's local alias passed in package, let's resolve the pass.
       */

      alias.forEach(({
        replacement
      }, i) => {
        /**
         * Assuming we're working in `src` by default.
         */
        alias[i].replacement = this.resolvePath(this.isSrc ? "src" : null, replacement);
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

async function build(inputOptions, outputOptions) {
  try {
    /**
     * create a bundle
     */
    const bundle = await rollup.rollup(inputOptions);
    /**
     * write the bundle to disk
     */

    await bundle.write(outputOptions);
  } catch (err) {
    print.error(err);
  }
}

async function builderz(opts, {
  isInitOpts = true
} = {}) {
  const state = new StateHandler(opts, isInitOpts);
  const {
    buildName,
    pkgPaths,
    pkgNames
  } = state.generalOpts;
  const {
    json: allPkgJson,
    pkgInfo: allPkgInfo
  } = NotEmptyArr(pkgNames) ? getInfo.getJsonByName(...pkgNames) : getInfo.getJsonByPath(...pkgPaths);
  /**
   * Sort packages before bump to production.
   */

  const {
    sorted,
    unSorted
  } = packageSorter(allPkgJson);

  if (NotEmptyArr(unSorted)) {
    print.error(`Unable to sort packages: ${unSorted}`);
  }

  try {
    await sorted.reduce(async (sortedPromise, json) => {
      await sortedPromise;
      state.setPkgJsonOpts(json);
      state.setPkgBuildOpts();
      const {
        name,
        peerDependencies = {},
        dependencies = {}
      } = json;
      const {
        isSilent
      } = state.generalOpts;
      const pkgInfo = allPkgInfo[name];
      const {
        path: pkgPath
      } = pkgInfo;
      state.setPkgPath(pkgPath);
      const buildPath = path.resolve(pkgPath, buildName);
      console.log("builderz -> state.get(CLEAN_BUILD)", state.get(CLEAN_BUILD));

      if (state.get(CLEAN_BUILD)) {
        await del(buildPath);
      }

      const entries = state.extractEntries();
      const alias = state.extractAlias();
      const outputName = state.extractName();
      const banner = state.get(BANNER);
      await state.bundleOpt.reduce(async (bundleOptPromise, {
        IS_PROD,
        BUILD_FORMAT
      }) => {
        await bundleOptPromise;
        const input = await genInput({
          flags: {
            IS_SILENT: isSilent,
            IS_PROD
          },
          json: {
            peerDependencies,
            dependencies
          },
          entries,
          BUILD_FORMAT,
          alias
        });
        const output = await getOutput({
          flags: {
            IS_PROD
          },
          outputName,
          json: {
            peerDependencies
          },
          buildPath,
          BUILD_FORMAT,
          banner
        });
        await build(input, output);
      }, Promise.resolve());
    }, Promise.resolve());
  } catch (err) {
    console.error(err);
  }
}

module.exports = builderz;
