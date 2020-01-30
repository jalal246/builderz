/* eslint-disable import/no-dynamic-require, no-console */
import chalk from "chalk";

const {
  bgBlue,
  red: { bold: red },
  yellow: { bold: yellow },
  green: { bold: green }
} = chalk;

let isSilent = false;

export function setIsSilent(bool) {
  isSilent = bool;
}

export function log(clr, txt) {
  if (isSilent) return;

  console.log(clr(txt));
}
export function msg(txt) {
  log(bgBlue, `\n${txt}`);
}

export function success(txt) {
  log(green, `\n${txt}`);
}

export function warning(txt) {
  log(yellow, `\nWarning: ${txt}`);
}

export function error(txt) {
  log(red, `\n${txt}\n\n`);

  process.exit(1);
}
