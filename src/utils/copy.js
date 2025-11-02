import fs from 'fs';
import path from 'path';
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
  // create if does not exists
  dstDir = resolvePath(dstDir);
  const dstInfo = await checkPath(dstDir);
  if (!dstInfo.exists) {
    await createDir(dstDir);
    justCreated = true;
  }
  const fileName = path.basename(oldFilePath);
  const newFilePath = resolvePath(dstDir, fileName);

  try {
    const rs = fs.createReadStream(oldFilePath);
    const ws = fs.createWriteStream(newFilePath, { flags: 'wx' });
    await new Promise((resolve) => rs.on('end', async () => {
      if (removeSrc) {
        await fs.promises.unlink(oldFilePath);
      }
      resolve();
    }).pipe(ws));
  } catch (err) {
    // clean up if failed
    if (justCreated) {
      await fs.promises.rm(dstDir, { recursive: true, force: true });
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