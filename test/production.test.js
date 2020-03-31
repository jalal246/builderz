/* eslint-disable no-console */
import { resolve } from "path";
import { readdirSync, readFileSync } from "fs";
import del from "del";
import builderz from "../src";

describe("production", () => {
  it.each(["alias"])("tests %s)", async pkgName => {
    const pathPure = resolve(__dirname, "samples", pkgName);
    const distPath = resolve(pathPure, "dist");

    try {
      await builderz({
        isSilent: true,
        paths: [resolve(__dirname, pathPure)]
      });

      const files = readdirSync(distPath);
      expect(files.length).toMatchSnapshot();

      files
        .filter(file => !/\.map$/.test(file))
        .sort(file => (/modern/.test(file) ? 1 : 0))
        .forEach(file => {
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
