(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, (global.basicCss = global.basicCss || {}, global.basicCss.umd = global.basicCss.umd || {}, global.basicCss.umd.js = factory()));
}(this, (function () { 'use strict';

	function index () {
	  const el = document.createElement('div');
	  el.className = 'testing';
	  return el;
	}

	return index;

})));
//# sourceMappingURL=basicCss.umd.js.map
