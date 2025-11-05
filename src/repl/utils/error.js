import { styleText as style } from 'util';
import { CustomError, isNonEmptyStr } from "../../common/utils/misc.js";

/**
 * @param {'input'|'operation'} type 
 * @param {string} msg 
 */
const showError = (type, msg) => {
  if (isNonEmptyStr(msg)) {
    let prefix = type === 'input' ? 'Invalid input' : 'Operation failed';
    console.log(`${style('red', `${prefix}: `)}${msg}`);
  }
}

// ERRCODE: message, <syscall> [details]
const splitNodeErrorMessage = (err) => {
  const RE_MSG_SPLITTER = RegExp(`,\\s+${err.syscall}\\s*`); // msg, <syscall> ...
  let [message, details] = err.message.split(RE_MSG_SPLITTER);
  message = message?.replace(/^[A-Z]+\:\s+/, ''); // eg. ENOENT: ...

  return { message, details };
}

const formatErrorMessage = (err) => {
  const { message, details } = err instanceof CustomError ? err : splitNodeErrorMessage(err);
  return details ? `${message}\n${style('gray', details)}` : message;
}

/** 
 * @param {Error} err 
 */
export const showOperationError = (err) => {
  showError('operation', formatErrorMessage(err));
}

/** 
 * @param {string} msg 
 */
export const showInputError = (msg) => {
  showError('input', msg);
}