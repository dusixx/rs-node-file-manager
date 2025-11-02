import { styleText as style } from 'util';
import { isArray, isFunc, isNonEmptyStr, isObj } from "../utils/index.js";
import { Commands } from './commands.js';

const HINT = style('blackBright',
  `If argument contains spaces, enclose it in double quotes (eg., cd "c:/program files")`
);

/**
 * @param {'input'|'operation'} type 
 * @param {string} msg 
 */
const showError = (type, msg) => {
  msg = isNonEmptyStr(msg) ? msg : '';
  let prefix = type === 'input' ? 'Invalid input' : 'Operation failed';
  if (msg) {
    prefix += ': ';
  }
  console.log(`${style('redBright', prefix)}${msg}`);
}

/**
 * @param {(...args: string[]) => Promise<unknown>} cmd 
 * @param {string[]} args
 */
const evalCommand = async (cmd, args) => {
  if (cmd.length !== args.length) {
    showError('input', `expected ${cmd.length} args, got ${args.length}`);
    // to many arguments
    if (cmd.length > 0 && cmd.length < args.length) {
      console.log(HINT);
    }
    return;
  }
  try {
    const output = await cmd(...args);
    if (output) {
      console[isArray(output) ? 'table' : 'log'](output);
    }
  } catch (err) {
    showError('operation', err.message);
  }
}

/**
 * @param {string} line 
 */
const splitLine = (line) => {
  return line.trim().match(/".*"|[^\s]+/g)?.map(v => v.replaceAll('"', '')) ?? [];
}

/**
 * @param {string} line 
 */
export const evaluate = async (line) => {
  if (!isNonEmptyStr(line)) {
    return;
  }
  let [cmdName, ...args] = splitLine(line);
  let cmd = Commands[cmdName];
  let nestedCmdName;

  if (isObj(cmd)) {
    nestedCmdName = args[0].slice(2);
    args = args.slice(1);
    cmd = cmd[nestedCmdName];
  }
  if (!isFunc(cmd)) {
    cmdName = nestedCmdName ? `${cmdName}: ${nestedCmdName}` : cmdName;
    showError('input', `${cmdName}: unknown command`);
    return;
  }
  await evalCommand(cmd, args);
}