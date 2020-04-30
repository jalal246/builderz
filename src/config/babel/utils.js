function escapeRegExpCharacters(str) {
  const regExpCharacters = /[\\^$.*+?()[\]{}|]/g;

  return str.replace(regExpCharacters, "\\$&");
}

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".es6", ".es", ".mjs"];

function extToRegExp(extensions = EXTENSIONS) {
  const extReplaced = extensions.map(escapeRegExpCharacters);

  const arrToStrExt = extReplaced.join("|");

  const extRegExp = new RegExp(`(${arrToStrExt})$`);

  return extRegExp;
}

export default extToRegExp;
