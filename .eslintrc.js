module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ["airbnb-base", "prettier"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
  globals: {
    describe: true,
    it: true,
    expect: true,
    jest: true,
  },
  ignorePatterns: ["dist"],
};
