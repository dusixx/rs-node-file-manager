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
 * @typedef {'sha256'|'sha512'|'sha3-256'|'sha3-512'|'md5'|'sha1'} Algorithm
 * @param {string} filePath 
 * @param {Algorithm} algorithm 
 */
export const getHash = async (filePath, algorithm = 'sha256') => {
  const src = resolvePath(filePath);
  const hash = crypto.createHash(algorithm);
  await streamPromises.pipeline(fs.createReadStream(src), hash);

  return hash.digest('hex');
}

/**
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
export const getSHA256 = async (filePath) => {
  return await getHash(filePath, "sha256");
}

export class CustomError extends Error {
  /**
   * @param {string} msg 
   * @param {string} details 
   */
  constructor(msg, details) {
    super(msg);
    this.details = details;
  }
}