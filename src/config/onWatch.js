const { msg, success, error } = require("@mytools/print");
const ms = require("ms");

/**
 * [onWatch function monitoring building prosses]
 * @param  {[]} watcher [rollup.watch]
 */
function onWatch(watcher) {
  watcher.on("event", ({ code, error: watchErr, duration, result, output }) => {
    // eslint-disable default-case
    switch (code) {
      case "START":
        msg("build watcher is (re)starting");
        break;

      case "BUNDLE_START": {
        msg(`building ${output}`);
        break;
      }

      case "FATAL":
        error(`encountered an unrecoverable: ${watchErr}`);
        break;

      case "ERROR":
        error(`encountered an error while bundling: ${watchErr}`);
        break;

      case "BUNDLE_END": {
        msg(
          `finished building a bundle in ${ms(duration)} watching: ${
            result.watchFiles.length
          } files`
        );
        break;
      }

      case "END":
        success(`finished building all bundles`);
        break;

      default:
        msg(`code ${code}`);
    }
  });
}

module.exports = { onWatch };
