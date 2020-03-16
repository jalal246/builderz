import { expect } from "chai";

import { initBuild } from "../src/config";

describe.only("config function", () => {
  it("initBuild", () => {
    const result = initBuild()();
    console.log("result", result);
    expect(result).to.be.equal("helloDarkness");
  });
});
