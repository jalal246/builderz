/* eslint-disable no-console */
import { resolve } from "path";
import { readdirSync, readFileSync } from "fs";
import builderz from "../src";

jest.setTimeout(30000);

describe("builderz working for single package", () => {
  it.each([
    // "alias-pkg",
    // "basic-css",
    // "basic-json",
    // "basic-lorem",
    // "basic-pkg",
    // "basic-ts",
    "typescript",
    // "multi-entries",
    // "no-name",
    // "shebang",
    // "babel-helpers",
  ])("%s", async (pkgName) => {
    const pathPure = resolve(__dirname, "fixtures", pkgName);
    const distPath = resolve(pathPure, "dist");

    try {
      await builderz({
        cleanBuild: true,
        pkgPaths: [resolve(__dirname, pathPure)],
      });

      // const files = readdirSync(distPath);
      // expect(files.length).toMatchSnapshot();

      // files
      //   .filter((file) => !/\.map$/.test(file))
      //   .sort((file) => (/modern/.test(file) ? 1 : 0))
      //   .forEach((file) => {
      //     expect(
      //       readFileSync(resolve(distPath, file)).toString("utf8")
      //     ).toMatchSnapshot();
      //   });

      // await del(distPath);
    } catch (err) {
      console.error(err);
    }
  });
});
