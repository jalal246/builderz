# Builderz

> Build your project(s) with zero configuration :bowtie:

`build/er/z` is a smart bundler. Works for regular repo with a single package and monorepo.
It does multiple things to save you some time and lets you focus on developing,
that includes:

1. Gets all packages path by looking into the workplace, including monorepo.

2. Extract JSON from each package found in the root.

3. Cleans build folders if there is any.

4. Creates camelize name for your package if it's not camelized.

5. If monorepo, sorts packages according to core/decency, so core comes first
   and so on.

6. Creates a distension path for each project found.

7. If there's no targeted format, it generates default formats (CJS, UMD, ES)
   one cycle minified with a map and the second is not.

```bash
npm install builderz
```

## Using API

```js
const builderz = require("builderz");

/**
 * @param {boolean} [isSilent=true] - Silent mode, mutes build massages
 * @param {boolean} isMinify - Minify bundle, works only if format is provided
 * @param {string} format - Specific build format
 * @param {string} [buildName="dist"] - Specific build name
 * @param {Array} plugins - Custom plugins
 * @param {Array} paths - Provide custom paths not in the root/src
 */
builderz({
  isSilent,
  isMinify,
  format,
  buildName,
  plugins,
  paths
});
```

## Using CLI

```bash
  -s, --silent     silent mode, mutes build massages
  -w, --watch      watch mode
  -f --format      specific build format
  -p, --plugins    input custom plugins
  -b, --buildName  specific build name
  -m, --minify     minify bundle works only if format is provided
  PACKAGE_NAME     building specific package[s], in monorepo
  -h, --help       output usage information
```

In your `packages.json` to compile to a CommonJS module (cjs) and minify the
bundle just pass the required args.

```json
"build": "builderz --format=cjs --minify"
```

## Tests

```sh
npm test
```

> Disclaimer: I am aware of existence bugs but keep working to enhance the next
> versions that include adding more tests.

### Related projects

- [packageSorter](https://github.com/jalal246/packageSorter) - Sorting packages
  for monorepos production.

- [corename](https://github.com/jalal246/corename) - Extracts package name.

- [get-info](https://github.com/jalal246/get-info) - Utility functions for projects production.

- [move-position](https://github.com/jalal246/move-position) - Moves element in
  an array from index to another.

- [textics](https://github.com/jalal246/textics) & [textics-stream](https://github.com/jalal246/textics-stream) - Counts lines, words, chars and spaces for a given string.

## License

This project is licensed under the [GPL-3.0 License](https://github.com/jalal246/builderz/blob/master/LICENSE)
