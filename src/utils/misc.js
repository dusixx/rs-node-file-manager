import { styleText } from "util";

export const isStr = v => typeof v === 'string';
export const isNonEmptyStr = v => v && isStr(v);
export const isFunc = v => typeof v === 'function';

/**
 * @param {string[]} arr 
 * @returns {Record<string, string[]>}
 */
export const parseArgs = (arr = process.argv.slice(2)) => {
  const map = {};
  let cur;

  for (const arg of arr) {
    if (arg.startsWith("--")) {
      cur = arg.slice(2);
      continue;
    }
    (map[cur] = map[cur] ?? []).push(arg);
  }
  return map;
};

export const Log = {
  /** @param {Parameters<typeof styleText>} args */
  style(...args) {
    return styleText(...args);
  },
  success(...args) {
    console.log(styleText("bgGreen", args.join(' ')));
  },
  info(...args) {
    console.log(styleText("bgBlackBright", args.join(' ')));
  },
  error(...args) {
    console.log(styleText("bgRed", args.join(' ')));
  }
}