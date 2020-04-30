import { resolve } from "path";

import perFile from "./utils";

describe.only.each`
  pkgName                 | desc
  ${"name-empty"}         | ${"package.json without name"}
  ${"name-camelized"}     | ${"output name is camelized"}
  ${"name-not-camelized"} | ${"output isn't camelized"}
`("tests $pkgName for testing: $desc", ({ pkgName }) => {
  it("passes", async () => {
    const pathPure = resolve(__dirname, "fixtures", pkgName);
    const distPath = resolve(pathPure, "dist");

    await perFile(pathPure, distPath);
  });
});
