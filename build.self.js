import builderz from "./src";

try {
  builderz({
    isSilent: true,
    formats: ["cjs"],
    entries: ["src/cli.js", "src/builderz.js"],
    minify: false,
  });
} catch (err) {
  console.error(err);
}
