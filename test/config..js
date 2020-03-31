import { resolve } from "path";
import { setIsSilent } from "@mytools/print";
import { initBuild } from "../src/config";

setIsSilent(true);

describe("config function", () => {
  it("initBuild default", async () => {
    const { sorted, pkgInfo } = await initBuild("dist", [], []);

    // snapshot the name cause everything else is changeable.
    expect(sorted[0].name).toMatchSnapshot();
    expect(pkgInfo).toMatchSnapshot();
  });

  it("initBuild given path", async () => {
    const packagesPath = resolve(__dirname, "samples", "packages-valid");

    const foloForms = resolve(packagesPath, "folo-forms");
    const foloLayout = resolve(packagesPath, "folo-layout");
    const foloUtils = resolve(packagesPath, "folo-utils");
    const foloWithcontext = resolve(packagesPath, "folo-withcontext");

    const paths = [foloForms, foloLayout, foloUtils, foloWithcontext];

    const { sorted, pkgInfo } = await initBuild("dist", paths, []);

    expect(sorted).toMatchSnapshot();
    expect(pkgInfo).toMatchSnapshot();
  });
});
