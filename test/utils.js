/* eslint-disable no-console */
import { resolve } from "path";
import { readdirSync, readFileSync } from "fs";
import builderzSrc from "../src";
import builderzDist from "../dist/builderz.cjs";

const builderz = process.env.USE_BUILD === "DIST" ? builderzDist : builderzSrc;
console.log(
  "file: utils.js ~ line 8 ~ process.env.USE_BUILD",
  process.env.USE_BUILD
);

jest.setTimeout(30000);

async function perFile(pathPure, distPath) {
  await builderz({
    cleanBuild: true,
    pkgPaths: [resolve(__dirname, pathPure)],
  });

  const files = readdirSync(distPath);

  // if (!isCheckSnapshot) return;

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
