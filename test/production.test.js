/* eslint-disable no-console */
import { resolve } from "path";
import { readdirSync, readFileSync } from "fs";
// import del from "del";
import builderz from "../src";

jest.setTimeout(30000);

// ["basic-multi-entries-json", "pure", "alias"];
describe("builderz working for single package", () => {
  it.each([
    // "basic-multi-entries-json",
    // "pure",
    // "alias",
    // "basic-json",
    // "shebang",
    // "pretty",
    // "no-pkg-name",
    "basic-css",
  ])("%s", async (pkgName) => {
    const pathPure = resolve(__dirname, "samples", pkgName);
    const distPath = resolve(pathPure, "dist");

    try {
      await builderz({
        cleanBuild: true,
        pkgPaths: [resolve(__dirname, pathPure)],
      });

      const files = readdirSync(distPath);
      expect(files.length).toMatchSnapshot();

      files
        .filter((file) => !/\.map$/.test(file))
        .sort((file) => (/modern/.test(file) ? 1 : 0))
        .forEach((file) => {
          expect(
            readFileSync(resolve(distPath, file)).toString("utf8")
          ).toMatchSnapshot();
        });

      // await del(distPath);
    } catch (err) {
      console.error(err);
    }
  });
});
