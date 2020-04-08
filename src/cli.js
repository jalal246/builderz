#!/usr/bin/env node

import error from "@mytools/print";
import builderz from "./builderz";
import resolveArgs from "./resolveArgs";

const globalArgs = resolveArgs();

function run() {
  try {
    builderz(globalArgs.opts(), { isInitOpts: false });
  } catch (err) {
    error(err);
  }
}

run();
