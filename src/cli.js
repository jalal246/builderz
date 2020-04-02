#!/usr/bin/env node

import error from "@mytools/print";
import builderz from "./builderz";
import resolveArgs from "./resolveArgs";

const globalArgs = resolveArgs();

function start() {
  try {
    builderz(globalArgs, { isInitOpts: false });
  } catch (err) {
    error(err);
  }
}

start();
