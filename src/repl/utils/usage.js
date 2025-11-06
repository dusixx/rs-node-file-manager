import { getValueByPath, isFunc, isNonEmptyStr, isObj } from "../../common/utils/index.js";
import { NESTED_CMD_PREFIX } from "../repl.constants.js";

const escapeDefaultArgument = v => {
  return /=/.test(v) ? `[${v.replace(/\s*=\s*/g, '=')}]` : v;
}

/**
 * @param {(...args: unknown[]) => unknown} cmdValue 
 */
const getCmdFuncArgs = (cmdFunc) => {
  return cmdFunc.toString()
    .match(/\((.*?)\)/)[1]?.split(/,\s*/)
    .map(escapeDefaultArgument);
}

/** 
 * @param {string} cmdName
 * @param {(...args: unknown[]) => unknown} cmdValue 
 * @param {string} namespace
 */
const getCmdFuncSignature = (cmdName, cmdFunc) => {
  // eg. os.hostname() -> wrappedFn(...args)
  const argNames = !/wrappedFn/i.test(cmdFunc.name) ? getCmdFuncArgs(cmdFunc) : [];
  return `${cmdName} ${argNames.join(' ')}`.trim();
}

const isValidCmd = (name, val) => {
  return isNonEmptyStr(name) && isFunc(val) || isObj(val);
}

const getCmdDesc = (cmdDescList, path) => {
  const desc = getValueByPath(cmdDescList, path);
  return isNonEmptyStr(desc) ? desc : '';
}

/** 
 * @param {Record<string, unknown>} cmdList 
 * @param {Record<string, string> | undefined} cmdDescList
 */
export const buildUsage = (cmdList, cmdDescList) => {
  const result = [];
  const wasDescSpecified = isObj(cmdDescList);

  walk(cmdList);

  function walk(cmdList, cmdStack = []) {
    for (const [cmdName, cmdValue] of Object.entries(cmdList)) {
      // special or invalid cmd
      if (cmdName.startsWith('.') || !isValidCmd(cmdName, cmdValue)) {
        continue;
      }
      cmdStack.push(cmdName);

      if (isObj(cmdValue)) {
        walk(cmdValue, cmdStack);
      } else {
        const nestedCmdName = cmdStack.join(` ${NESTED_CMD_PREFIX}`);
        const usage = { usage: getCmdFuncSignature(nestedCmdName, cmdValue) };
        if (wasDescSpecified) {
          usage.desc = getCmdDesc(cmdDescList, cmdStack);
        }
        result.push(usage);
      }
      cmdStack.pop();
    }
  }
  return result;
}