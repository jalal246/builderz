/* eslint-disable no-console */
import { resolve } from "path";

import perFile from "./utils";

describe("builderz working for single package", () => {
  it.each([
    "babel-basic",
    "babel-exclusions",
    "babel-loose",
    "babel-per-file",
    "babel-reads-presets",
    "babel-reads-ts",
  ])("%s", async (pkgName) => {
    const pathPure = resolve(__dirname, "fixtures", pkgName);
    const distPath = resolve(pathPure, "dist");

    await perFile(pathPure, distPath);
  });
});
