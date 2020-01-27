/* eslint-disable import/no-dynamic-require, no-console */
import chalk from "chalk";

const {
  bgBlue,
  red: { bold: red },
  yellow: { bold: yellow },
  green: { bold: green }
} = chalk;

export function msg(txt) {
  console.log(bgBlue(`\n${txt}`));
}

export function success(txt) {
  console.log(green(`\n${txt}`));
}

export function warning(txt) {
  console.log(yellow(`\nWarning: ${txt}`));
}

export function error(txt) {
  console.log(red(`\n${txt}\n\n`));
  process.exit(1);
}
