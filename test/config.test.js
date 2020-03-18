import { resolve } from "path";
import { initBuild } from "../src/config";

describe("config function", () => {
  it("initBuild default", () => {
    const { sorted, pkgInfo } = initBuild()();

    expect(sorted).toMatchSnapshot();
    expect(pkgInfo).toMatchSnapshot();
  });

  it("initBuild given path", () => {
    const packagesPath = resolve(__dirname, "packages-valid");

    const foloForms = resolve(packagesPath, "folo-forms");
    const foloLayout = resolve(packagesPath, "folo-layout");
    const foloUtils = resolve(packagesPath, "folo-utils");
    const foloWithcontext = resolve(packagesPath, "folo-withcontext");

    const { sorted, pkgInfo } = initBuild(
      "dist",
      foloForms,
      foloLayout,
      foloUtils,
      foloWithcontext
    )();

    expect(sorted).toMatchSnapshot();
    expect(pkgInfo).toMatchSnapshot();
  });
});
