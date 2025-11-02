import fs from 'fs';
import path from 'path';
import streamPromises from 'stream/promises';
import { checkPath, createDir, resolvePath } from "./fs.js";

/**
 * @param {string} srcFile 
 * @param {string} dstDir 
 * @param {boolean} removeSrc 
 */
export const copyOrMoveFile = async (srcFile, dstDir, removeSrc = false) => {
  let justCreated = false;

  const oldFilePath = resolvePath(srcFile);
  const srcInfo = await checkPath(oldFilePath);
  if (!srcInfo.exists || !srcInfo.isFile) {
    throw Error(`no such file: ${oldFilePath}`);
  }
  dstDir = resolvePath(dstDir);
  const dstInfo = await checkPath(dstDir);
  if (dstInfo.isFile) {
    throw Error(`not a directory: ${dstDir}`);
  }
  // create if does not exists
  if (!dstInfo.exists) {
    await createDir(dstDir);
    justCreated = true;
  }
  const fileName = path.basename(oldFilePath);
  const newFilePath = resolvePath(dstDir, fileName);

  try {
    const readStream = fs.createReadStream(oldFilePath);
    const writeStream = fs.createWriteStream(newFilePath, { flags: 'wx' });

    await streamPromises.pipeline(readStream, writeStream);
    // remove src file
    if (removeSrc) {
      await fs.promises.unlink(oldFilePath);
    }
  } catch (err) {
    // clean up if failed
    if (justCreated) {
      await fs.promises.rmdir(dstDir);
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