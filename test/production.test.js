import { resolve } from "path";
import builderz from "../src";

// import pure from "./samples/pure/src";
// jest.useFakeTimers();
beforeAll(async () => {
  await builderz({
    isSilent: true,
    paths: [resolve(__dirname, "./samples/pure")]
  }).catch(e => {
    console.log(e);
  });
});

describe("production", () => {
  it("test pure js", () => {
    expect(true).toEqual(true);
  });
});
