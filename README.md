# Builderz

> Zero Configuration JavaScript Bundler :bowtie:

`build/er/z` is built originally to bundle monorepos for one-step production.
And of course, it works for regular repo with a single package.

It does multiple things to save you some time and lets you focus on developing,
that includes:

1. Gets all validate packages path by looking into the workplace - for monorepo.

2. Extract `JSON` from each package found in the workplace. To get essential
   production information.

3. Cleans build folders if required.

4. Creates camelize name for your package if required or deal with custom output
   name.

5. If monorepo, sorts packages according to `core/dependency`, so core comes first
   and so on.

6. Validate entries and aut-detect if `src/entry` or `./entry`

7. Creates a distension path for each project found with ability to name folder.

8. If there's no targeted format, it generates default formats `(CJS, UMD, ES)`
   one cycle minified with a map and the second is not.

9. Highly customized. Reads local package build args first, resolves local paths. Prioritize
   local args to global ones.

10. Works as CLI and API.

## Install

```bash
npm install builderz
```

## Easy to use

In your `packages.json` to compile to a CommonJS module (cjs) and minify the
bundle just pass the required args.

```json
"build": "builderz --formats=cjs --minify=false"
```

## Options

```bash
  -s, --silent <boolean>       Silent mode, mutes build massages (default: true)
  -f, --formats <list>         Specific build format (default: [])
  -m, --minify <boolean>       Minify bundle works only if format is provided (default: false)
  -c, --camel-case <boolean>   Add camel-cased output file (default: true)
  -l, --clean-build <boolean>  Clean previous build folder (default: false)
  -b, --build-name <string>    Specific folder build name (default: "dist")
  -o, --output <string>        Custom output name
  -w, --pkg-paths <list>       Provide custom paths not in the root/src (default: [])
  -n, --pkg-names <list>       Building specific package[s], in workspace (default: [])
  -a, --alias <list>           Package Alias (default: [])
  -e, --entries <list>         Add multi entries instead of default src/index. (default: [])
  -r, --banner <string>        Add banner to output
  -h, --help                   display help for command
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

- [get-info](https://github.com/jalal246/get-info) - Utility functions for
  projects production.

- [validate-access](https://github.com/jalal246/validate-access) - Validate project accessibility files.

- [move-position](https://github.com/jalal246/move-position) - Moves element in
  an array from index to another.

- [textics](https://github.com/jalal246/textics) & [textics-stream](https://github.com/jalal246/textics-stream) - Counts lines, words, chars and spaces for a given string.

## License

This project is licensed under the [GPL-3.0 License](https://github.com/jalal246/builderz/blob/master/LICENSE)
