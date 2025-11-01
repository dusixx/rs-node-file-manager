import { Dirent } from "fs";
import fs from "fs/promises";
import path from "path";

const checkAccess = async (path, mode) => {
  try {
    await fs.access(path, mode);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {string} path
 * @returns {Promise<{exists: boolean, readable: boolean, writeable: boolean, isFile: boolean}>}
 */
export const checkPath = async (path) => {
  const result = {};
  const flags = [fs.constants.F_OK, fs.constants.R_OK, fs.constants.W_OK];
  const keys = ["exists", "readable", "writeable"];

  for (let i = 0; i < keys.length; i += 1) {
    result[keys[i]] = await checkAccess(path, flags[i]);
    if (!result.exists) {
      return result;
    }
  }
  const stats = await fs.stat(path);
  result.isFile = stats.isFile();

  return result;
};

/**
 * @param {string[]} args 
 * @returns {string}
 */
export const resolvePath = (...args) => {
  return path.resolve(process.cwd(), ...args.map(v => path.normalize(v ?? '')));
}

/**
 * @param {string} dirPath 
 * @returns {Promise<Dirent<string>[] | null>}
 */
export const getDirents = async (dirPath) => {
  try {
    const dirents = await fs.readdir(dirPath, {
      withFileTypes: true
    });
    return dirents.length > 0 ? dirents : null;
  } catch {
    return null;
  }
};