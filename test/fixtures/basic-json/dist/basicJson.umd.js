(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, (global.basicJson = global.basicJson || {}, global.basicJson.umd = global.basicJson.umd || {}, global.basicJson.umd.js = factory()));
}(this, (function () { 'use strict';

	var test = "true";
	var two = {
		test: test
	};

	function _await(value, then, direct) {
	  if (direct) {
	    return then ? then(value) : value;
	  }

	  if (!value || !value.then) {
	    value = Promise.resolve(value);
	  }

	  return then ? value.then(then) : value;
	}

	var index = (function (...args) {
	  return _await(two);
	});

	return index;

})));
//# sourceMappingURL=basicJson.umd.js.map
