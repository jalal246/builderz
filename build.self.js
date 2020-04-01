import builderz from "./src";

try {
  builderz({
    isSilent: true,
    formats: ["cjs"],
    minify: false
  });
} catch (err) {
  console.error(err);
}
