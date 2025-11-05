import { isArray, isFunc, isNonEmptyStr } from "../../common/utils/index.js";
import { NESTED_CMD_PREFIX } from '../repl.constants.js';
import { CommandList } from './cmdlist.js';
import { showInputError, showOperationError } from './error.js';

const RE_CMDLINE = /".*"|[^\s]+/g;

/**
 * @param {(...args: string[]) => Promise<unknown>} cmd 
 * @param {string[]} args
 * @param {string} cmdName
 */
const evalCommand = async (cmd, args, cmdName) => {
  if (args.length < cmd.length) {
    showInputError(`${cmdName}: expected ${cmd.length} arg(s), got ${args.length}`);
    return;
  }
  try {
    // extra ones will be ignored
    const output = await cmd(...args);
    if (output) {
      console[isArray(output) ? 'table' : 'log'](output);
    }
  } catch (err) {
    showOperationError(err);
  }
}

/**
 * @param {string} line 
 * @returns {string[]}
 */
const splitLine = (line) => {
  const unquote = v => v.replaceAll('"', '');
  return line.trim().match(RE_CMDLINE)?.map(unquote) ?? [];
}

/**
 * @param {string} line 
 */
export const evaluate = async (line) => {
  if (!isNonEmptyStr(line)) {
    return;
  }
  let [cmdName, ...args] = splitLine(line);
  let cmd = CommandList[cmdName];
  const cmdPath = [cmdName];

  for (let arg of args) {
    if (!arg.startsWith(NESTED_CMD_PREFIX)) {
      break;
    }
    arg = arg.slice(2);
    cmd = cmd?.[arg];
    cmdPath.push(arg);
    args = args.slice(1);
    if (!cmd) {
      break
    }
  }
  cmdName = cmdPath.join(': ');

  if (!isFunc(cmd)) {
    showInputError(`${cmdName}: not a command`);
    return;
  }
  await evalCommand(cmd, args, cmdName);
}