import { expect } from "chai";
import {
  getPackagesPath,
  extractPackagesInfo,
  cleanBuildDir,
  camelizeOutputBuild
} from "../src/utils";

describe("utils", () => {
  describe("getPackagesPath", () => {
    it("it returns array contains correct paths", () => {
      const packagesPath = getPackagesPath({ path: "./test/packages/*" });

      const expected = [
        "./test/packages/folo-forms",
        "./test/packages/folo-layout",
        "./test/packages/folo-utils",
        "./test/packages/folo-values",
        "./test/packages/folo-withcontext"
      ];

      expect(packagesPath).to.deep.equal(expected);
    });
  });

  describe("extractPackagesInfo", () => {
    it("it checks if monorepo or not and gets the json info ", () => {
      const packagesInfo = extractPackagesInfo();

      expect(packagesInfo).to.be.an("Array");
      expect(packagesInfo.length).to.be.equal(1);

      expect(packagesInfo[0]).to.have.own.property("name");
      expect(packagesInfo[0]).to.have.own.property("distPath");
      expect(packagesInfo[0]).to.have.own.property("sourcePath");
      expect(packagesInfo[0]).to.have.own.property("dependencies");
    });

    it("it reads all paths and sets dis and src ", () => {
      const packagesPath = getPackagesPath({
        path: "./test/packages/*"
      });

      const packagesInfo = extractPackagesInfo({
        packages: packagesPath
      });

      expect(packagesInfo.length).to.be.equal(5);

      expect(packagesInfo[4]).to.have.own.property("name");
      expect(packagesInfo[4]).to.have.own.property("distPath");
      expect(packagesInfo[4]).to.have.own.property("sourcePath");
      expect(packagesInfo[4]).to.have.own.property("dependencies");
    });
  });

  describe("cleanBuildDir", () => {
    it("not throws if there is no dist", () => {
      expect(cleanBuildDir).to.not.throw();
    });
  });

  describe("camelizeOutputBuild", () => {
    it("not throws if there is no dist", () => {
      const camelized = camelizeOutputBuild("@folo/test");
      expect(camelized).to.be.equal("foloTest");
    });
  });
});
