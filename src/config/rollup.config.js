import rollup from "rollup";
import { error } from "../utils";

async function build(isWatch, onWatch, inputOptions, outputOptions) {
  try {
    if (isWatch) {
      const watcher = rollup.watch({
        ...inputOptions,
        output: [outputOptions]
      });
      onWatch(watcher);
    } else {
      /**
       * create a bundle
       */
      const bundle = await rollup.rollup(inputOptions);

      /**
       * write the bundle to disk
       */
      await bundle.write(outputOptions);
    }
  } catch (e) {
    error(e);
  }
}
