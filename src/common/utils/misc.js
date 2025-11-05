import crypto from 'crypto';
import fs from 'fs';
import streamPromises from 'stream/promises';
import { resolvePath } from './fs.js';

export const typeName = v => {
  return Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
}
export const isStr = v => typeof v === 'string';
export const isNonEmptyStr = v => v && isStr(v);
export const isFunc = v => typeof v === 'function';
export const isArray = v => Array.isArray(v);
export const isObj = v => typeName(v) === 'object';

/**
 * @param {string} filePath 
 * @param {'sha256'|'sha512'|'sha3-256'|'sha3-512'|'md5'|'sha1'} alg
 */
export const getHash = async (filePath, alg = 'sha256') => {
  const src = resolvePath(filePath);
  const hash = crypto.createHash(alg);
  await streamPromises.pipeline(fs.createReadStream(src), hash);

  return hash.digest('hex');
}

/** 
 * @param {Record<string, unknown>} obj 
 * @param {string[]} path - array of prop names
 * @returns {unknown}
 */
export const getValueByPath = (obj, path) => {
  let res = obj;
  for (let i = 0; i < path.length; i += 1) {
    res = res[path[i]];
    if (!isObj(res) && i !== path.length - 1) {
      return;
    }
  }
  return res;
}

export class CustomError extends Error {
  /** @param {string} message @param {string} details */
  constructor(message, details) {
    super(message);
    this.details = details;
  }
}