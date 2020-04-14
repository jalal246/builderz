(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory((global.pure = global.pure || {}, global.pure.umd = global.pure.umd || {}, global.pure.umd.js = {})));
}(this, (function (exports) { 'use strict';

  // this is currently broken because of a bug in terser
  // https://github.com/terser-js/terser/issues/353

  /** @__PURE__ */
  function foo() {
    return "hello world";
  }

  exports.foo = foo;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=pure.umd.js.map
