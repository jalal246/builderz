import builderz from "./src";

try {
  [
    { entries: ["src/cli.js"], output: "cli" },
    { entries: ["src/builderz.js"], output: "builderz" },
  ].forEach(({ entries, output }) => {
    builderz({
      isSilent: true,
      formats: ["cjs"],
      entries,
      output,
      minify: false,
    });
  });
} catch (err) {
  console.error(err);
}
