/* eslint-disable no-console */
import updateNotifier from "update-notifier";
import builderz from "./builderz";
import resolveArgs from "./resolveArgs";
import pkg from "../package.json";

const globalArgs = resolveArgs();

function run() {
  try {
    builderz(globalArgs, { isInitOpts: false });
  } catch (err) {
    console.error(err);
  } finally {
    updateNotifier({ pkg }).notify();
  }
}

run();
