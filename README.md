# Builderz

> Helps you to build your project with zero config :bowtie:

`builderz` is smart. Works for regular repo with single package and monorepo. It
gets all packages path, extracts json from each package, cleans build folders if
there is any, sorts packages using [packageSorter](https://github.com/jalal246/packageSorter),
sets distention paths and pass them accordingly to rollup for production.

_There's is a huge room for enhancement but i keep it this way which satisfies
my build requirements. PRs welcome._

```bash
npm install builderz
```

## Options

```bash
  -s, --silent       silent mode, mutes build massages
  -w, --watch        watch mode
  --format [format]  specific build format
  -m, --minify       minify bundle works only if format is provided
  PACKAGE_NAME       building specific package[s], in monorepo
  -h, --help         output usage information
```

### Example/cli

In your `packages.json` to compile to a CommonJS module (cjs) and minify the
bundle just pass the required args.

### Example/API

```js
const builderz = require("builderz");

builderz({{
  silent,
  format,
  minify,
  buildName,
  plugins,
  ...listOfPackagesName
});
```

```json
"build": "builderz --format=cjs --minify"
```

## Tests

```sh
npm test
```

### Related projects

- [packageSorter](https://github.com/jalal246/packageSorter) - Sorting packages
  for monorepos production.

- [corename](https://github.com/jalal246/corename) - Extracts package name
  zero config.

- [get-info](https://github.com/jalal246/get-info) - Utility functions for projects production

## License

This project is licensed under the [GPL-3.0 License](https://github.com/jalal246/builderz/blob/master/LICENSE)
