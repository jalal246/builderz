import { resolve } from "path";

import perFile from "./utils";

describe.only.each`
  pkgName                     | desc
  ${"babel-basic"}            | ${"simple input"}
  ${"babel-exclusions"}       | ${"excluding files"}
  ${"babel-loose"}            | ${"loose property"}
  ${"babel-overrides-plugin"} | ${"overrides plugins & adds the rest of injected ones"}
  ${"babel-overrides-preset"} | ${"overrides presets only"}
  ${"babel-per-file"}         | ${"files has different config"}
  ${"babel-reads-presets"}    | ${"embedded presets"}
  ${"babel-reads-ts"}         | ${"ability to read external config and detect ts"}
`("tests $pkgName for testing: $desc", ({ pkgName }) => {
  it("passes", async () => {
    const pathPure = resolve(__dirname, "fixtures", pkgName);
    const distPath = resolve(pathPure, "dist");

    await perFile(pathPure, distPath);
  });
});
