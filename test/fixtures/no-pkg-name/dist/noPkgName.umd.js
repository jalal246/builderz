(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, (global.noPkgName = global.noPkgName || {}, global.noPkgName.umd = global.noPkgName.umd || {}, global.noPkgName.umd.js = factory()));
}(this, (function () { 'use strict';

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

  function two() {
    return _two.apply(this, arguments);
  }

  function _two() {
    _two = _asyncToGenerator(function* (...args) {
      return args.reduce((total, value) => total + value, 0);
    });
    return _two.apply(this, arguments);
  }

  function index () {
    return _ref.apply(this, arguments);
  }

  function _ref() {
    _ref = _asyncToGenerator(function* (...args) {
      return [yield two(...args), yield two(...args)];
    });
    return _ref.apply(this, arguments);
  }

  return index;

})));
//# sourceMappingURL=noPkgName.umd.js.map
