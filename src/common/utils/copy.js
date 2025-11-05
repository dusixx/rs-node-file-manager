import fs from 'fs';
import path from 'path';
import streamPromises from 'stream/promises';
import { checkPath, createDir, isFileExists, removeDir, resolvePath } from "./fs.js";
import { CustomError } from './misc.js';

/**
 * @param {string} srcFile 
 * @param {string} dstDir
 */
const validatePaths = async (srcFile, dstDir) => {
  let wasDstDirJustCreated = false;
  srcFile = resolvePath(srcFile);
  dstDir = resolvePath(dstDir);

  if (!await isFileExists(srcFile)) {
    throw new CustomError('no such file', srcFile);
  }
  const dstInfo = await checkPath(dstDir);
  if (dstInfo.isFile) {
    throw new CustomError('not a directory', dstDir);
  }
  // create if does not exists
  if (!dstInfo.exists) {
    await createDir(dstDir);
    wasDstDirJustCreated = true;
  }
  const srcFileName = path.basename(srcFile);
  const dstFile = resolvePath(dstDir, srcFileName);

  return { wasDstDirJustCreated, srcFile, dstFile, dstDir }
}

/**
 * @param {string} srcFile 
 * @param {string} dstDir 
 * @param {boolean} removeSrc 
 */
export const copyOrMoveFile = async (srcFilePath, dstDirPath, removeSrc = false) => {
  const { wasDstDirJustCreated, srcFile, dstFile, dstDir } = await validatePaths(srcFilePath, dstDirPath);

  if (await isFileExists(dstFile)) {
    throw new CustomError('file already exists', dstFile);
  }
  try {
    const readStream = fs.createReadStream(srcFile);
    const writeStream = fs.createWriteStream(dstFile);

    await streamPromises.pipeline(readStream, writeStream);
    // remove src file
    if (removeSrc) {
      await fs.promises.unlink(srcFile);
    }
  } catch (err) {
    // clean up if failed
    if (wasDstDirJustCreated) {
      await removeDir(dstDir);
    }
    throw err;
  }
}

/**
 * @param {string} src 
 * @param {string} dst 
 */
export const copyFile = async (src, dst) => {
  await copyOrMoveFile(src, dst);
}

/**
 * @param {string} src 
 * @param {string} dst 
 */
export const moveFile = async (src, dst) => {
  await copyOrMoveFile(src, dst, true);
}