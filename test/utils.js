/* eslint-disable no-console */
import { resolve } from "path";
import { readdirSync, readFileSync } from "fs";
import builderz from "../src";

jest.setTimeout(30000);

async function perFile(pathPure, distPath) {
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
}

export default perFile;
