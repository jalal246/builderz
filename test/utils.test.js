import { camelizeOutputBuild, getBundleOpt } from "../src/utils";

describe("utils function", () => {
  it("camelizeOutputBuild", () => {
    const result = camelizeOutputBuild("@hello/darkness");
    expect(result).toEqual("helloDarkness");
  });

  it("Default: getBundleOpt", () => {
    const result = getBundleOpt();

    const expected = [
      { BUILD_FORMAT: "umd", IS_PROD: true },
      { BUILD_FORMAT: "umd", IS_PROD: false },
      { BUILD_FORMAT: "cjs", IS_PROD: true },
      { BUILD_FORMAT: "cjs", IS_PROD: false },
      { BUILD_FORMAT: "es", IS_PROD: true },
      { BUILD_FORMAT: "es", IS_PROD: false }
    ];

    expect(result).toEqual(expected);
  });

  it("getBundleOpt with param", () => {
    const result = getBundleOpt("es");

    const expected = [{ BUILD_FORMAT: "es", IS_PROD: false }];

    expect(result).toEqual(expected);
  });
});