import builderz from "./src";

[
  { entries: ["src/cli.js"], output: "cli", banner: `#!/usr/bin/env node` },
  { entries: "src/builderz.js", output: "builderz" },
].forEach(({ entries, output, banner }) => {
  builderz({
    isSilent: true,
    formats: ["cjs"],
    entries,
    output,
    banner,
    minify: false,
  });
});
