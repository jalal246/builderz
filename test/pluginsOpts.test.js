/* eslint-disable no-console */
import { resolve } from "path";

import perFile from "./utils";

describe.only.each`
  pkgName                   | desc
  ${"plugin-alias"}         | ${"alias"}
  ${"plugin-multi-entries"} | ${"multi-entries"}
  ${"plugin-css-basic"}     | ${"bundling basic css"}
`("tests $pkgName for testing: $desc", ({ pkgName }) => {
  it("passes", async () => {
    const pathPure = resolve(__dirname, "fixtures", pkgName);
    const distPath = resolve(pathPure, "dist");

    await perFile(pathPure, distPath);
  });
});
