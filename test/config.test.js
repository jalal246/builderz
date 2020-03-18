import { expect } from "chai";
import { resolve } from "path";

import { initBuild } from "../src/config";

describe.only("config function", () => {
  it("initBuild default", () => {
    const { sorted, distPath } = initBuild()();

    expect(sorted.length).to.be.equal(1);
    expect(distPath.length).to.be.equal(1);
  });

  it.only("initBuild given path", () => {
    const packagesPath = resolve(__dirname, "packages-valid");

    const foloForms = resolve(packagesPath, "folo-forms");
    const foloLayout = resolve(packagesPath, "folo-layout");
    const foloUtils = resolve(packagesPath, "folo-utils");
    const foloWithcontext = resolve(packagesPath, "folo-withcontext");

    const { sorted, distPath } = initBuild(
      "dist",
      foloForms,
      foloLayout,
      foloUtils,
      foloWithcontext
    )();

    // console.log("distPath", distPath);
    // console.log("sorted", sorted);

    // expect(sorted).to.matchSnapshot();

    // expect(distPath.length).to.be.equal(1);
  });
});
