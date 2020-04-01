# Builderz

> Zero Configuration JavaScript Bundler :bowtie:

`build/er/z` was built originally to bundle monorepos for one-step production. And of course, works for regular repo with a single package.

It does multiple things to save you some time and lets you focus on developing,
that includes:

1. Gets all validate packages path by looking into the workplace - including
   monorepo.

2. Extract JSON from each package found in the workplace. To get essential
   production information.

3. Cleans build folders if there is any.

4. Creates camelize name for your package if it's not camelized.

5. If monorepo, sorts packages according to core/dependency, so core comes first
   and so on.

6. Creates a distension path for each project found.

7. If there's no targeted format, it generates default formats (CJS, UMD, ES)
   one cycle minified with a map and the second is not.

8. Highly customized. Reads local package build args first, resolves local paths. Prioritize
   local args to global ones.

```bash
npm install builderz
```

## Easy to use

In your `packages.json` to compile to a CommonJS module (cjs) and minify the
bundle just pass the required args.

```json
"build": "builderz --formats=cjs --minify"
```

## Options

```bash
  -s, --silent <boolean>    Silent mode, mutes build massages
  -f, --formats <list>      Specific build format
  -m, --minify <boolean>    Minify bundle works only if format is provided
  -b, --build-name <string>  Specific build name
  -w, --pkg-paths <list>        Provide custom paths not in the root/src
  -n, --pkg-names <list>    Building specific package[s], in workspace
  -a, --alias <list>        Package Alias
  -h, --help                Output usage information
```

### Using Build Script

```js
const builderz = require("builderz");

// Multi-word options are camel-cased. Pass list as array.
const options = {};

builderz(options);
```

### Test

```sh
npm test
```

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
