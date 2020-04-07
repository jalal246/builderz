import builderz from "./src";

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
