/* eslint-disable no-console */
import builderz from "./builderz";
import resolveArgs from "./resolveArgs";

const globalArgs = resolveArgs();

function run() {
  try {
    builderz(globalArgs, { isInitOpts: false });
  } catch (err) {
    console.error(err);
  }
}

run();
