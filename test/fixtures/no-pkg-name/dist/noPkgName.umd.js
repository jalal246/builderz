(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, (global.noPkgName = global.noPkgName || {}, global.noPkgName.umd = global.noPkgName.umd || {}, global.noPkgName.umd.js = factory()));
}(this, (function () { 'use strict';

	function _async(f) {
	  return function () {
	    for (var args = [], i = 0; i < arguments.length; i++) {
	      args[i] = arguments[i];
	    }

	    try {
	      return Promise.resolve(f.apply(this, args));
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  };
	}

	const two = _async(function (...args) {
	  return args.reduce((total, value) => total + value, 0);
	});

	function _await(value, then, direct) {
	  if (direct) {
	    return then ? then(value) : value;
	  }

	  if (!value || !value.then) {
	    value = Promise.resolve(value);
	  }

	  return then ? value.then(then) : value;
	}

	function _async$1(f) {
	  return function () {
	    for (var args = [], i = 0; i < arguments.length; i++) {
	      args[i] = arguments[i];
	    }

	    try {
	      return Promise.resolve(f.apply(this, args));
	    } catch (e) {
	      return Promise.reject(e);
	    }
	  };
	}

	var index = _async$1(function (...args) {
	  return _await(two(...args), function (_two) {
	    return _await(two(...args), function (_two2) {
	      return [_two, _two2];
	    });
	  });
	});

	return index;

})));
//# sourceMappingURL=noPkgName.umd.js.map
