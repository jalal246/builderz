import { resolve } from "path";

import perFile from "./utils";

describe.only.each`
  pkgName          | desc
  ${"shebang"}     | ${"adding shebang to output file"}
  ${"pkg-no-json"} | ${"bundle package doesn't have valid package.json"}
`("tests $pkgName for testing: $desc", ({ pkgName }) => {
  it("passes", async () => {
    const pathPure = resolve(__dirname, "fixtures", pkgName);
    const distPath = resolve(pathPure, "dist");

    await perFile(pathPure, distPath);
  });
});
