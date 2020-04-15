import error from "@mytools/print";
import builderz from "./builderz";
import resolveArgs from "./resolveArgs";

const globalArgs = resolveArgs();

function run() {
  try {
    builderz(globalArgs, { isInitOpts: false });
  } catch (err) {
    error(err);
  }
}

run();
