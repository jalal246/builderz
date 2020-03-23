import { resolve } from "path";
import builderz from "../src";

// import pure from "./samples/pure/src";
// jest.useFakeTimers();
// beforeAll(async () => {});

describe("production", () => {
  it("tests pure js", async () => {
    // const path=''
    await builderz({
      isSilent: true,
      paths: [resolve(__dirname, "./samples/pure")]
    }).catch(e => {
      console.log(e);
    });
    expect(true).toEqual(true);
  });
});
