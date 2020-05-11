# Builderz

> Zero Configuration JavaScript Bundler

`build/er/z` is built originally to bundle monorepos, expanded later to cover
more build cases with a wide variety of options. It implements rollup, taking
advantage of its simplicity and customization to build
one-step production bundler.

## Install

```bash
npm install builderz
```

## Easy to use

```json
"build": "builderz"
```

## Easy to customize

In your `packages.json` to compile to a CommonJS module (cjs) and minify the
bundle just pass the required arguments.

```json
"build": "builderz --formats=cjs --minify"
```

Or in a `package.json` file

```json
"name": "my-package",
"version": "0.0.1",
"builderz":{
   "formats": ["cjs"],
   "minify": true,
}
```

Of course you cane import it as build package somewhere in your project:

```js
const builderz = require("builderz");

// Multi-word options are camel-cased. Pass list as array.
const options = {};

builderz(options);
```

## Options

```bash
  -m, --minify <boolean>       Minify bundle works only if format is provided (default: false)
  -p, --sourcemap <boolean>    Enable sourcemap in output
  -c, --camel-case <boolean>   Add camel-cased output file (default: true)
  -l, --clean-build <boolean>  Clean previous build folder (default: false)
  -t, --strict <boolean>       Enable Strict Mode (default: false)
  -r, --sort-pkg <boolean>     Enable sorting packages for monorepo (default: true)
  -d, --es-module <boolean>    Define Property exports- es_model (default: false)
  --formats <list>             Specific build format (default: [])
  --build-name <string>        Specific folder build name (default: "dist")
  --output <string>            Custom output name
  --pkg-paths <list>           Provide custom paths not in the root/src (default: [])
  --pkg-names <list>           Building specific package[s], in workspace (default: [])
  --alias <list>               Package Alias (default: [])
  --entries <list>             Add multi entries instead of default src/index. (default: [])
  --banner <string>            Add banner to output
  --external <list>            Passing external libraries not to bundle
  -h, --help                   display help for command
```

### Test

```sh
npm test
```

## License

This project is licensed under the [GPL-3.0 License](https://github.com/jalal246/builderz/blob/master/LICENSE)
