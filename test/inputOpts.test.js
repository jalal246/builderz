import { resolve } from "path";

import perFile from "./utils";

describe.only.each`
  pkgName                      | desc
  ${"input-opts-via-build"}    | ${"inputs from build script"}
  ${"input-opts-via-builderz"} | ${"inputs form builderz property"}
  ${"input-opts-mixed"}        | ${"inputs in build script & builderz property"}
`("tests $pkgName for testing: $desc", ({ pkgName }) => {
  it("passes", async () => {
    const pathPure = resolve(__dirname, "fixtures", pkgName);
    const distPath = resolve(pathPure, "dist");

    await perFile(pathPure, distPath);
  });
});
