'use strict';

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

module.exports = index;
