import fs from 'fs';
import path from 'path';
import streamPromises from 'stream/promises';
import zlib from 'zlib';
import { checkPath, createDir, resolvePath } from './fs.js';

/**
 * @typedef {'Gzip'|'Gunzip'|'BrotliCompress'|'BrotliDecompress'|'ZstdCompress'|'ZstdDecompress'} ActionType
 * @param {string} src 
 * @param {string} dst 
 * @param {{ action: ActionType, deleteSource: boolean }} options
 */
export const compressDecompressFile = async (srcFile, dstFile, { action, deleteSource = true } = {}) => {
  let justCreated = false;

  srcFile = resolvePath(srcFile);
  const srcInfo = await checkPath(srcFile);
  if (!srcInfo.exists || !srcInfo.isFile) {
    throw Error(`no such file: ${srcFile}`);
  }
  dstFile = resolvePath(dstFile);
  const dstDir = path.dirname(dstFile);
  const dstInfo = await checkPath(dstDir);
  if (dstInfo.isFile) {
    throw Error(`not a directory: ${dstDir}`);
  }
  // create if does not exists
  if (!dstInfo.exists) {
    await createDir(dstDir);
    justCreated = true;
  }
  try {
    const readStream = fs.createReadStream(srcFile);
    const writeStream = fs.createWriteStream(dstFile, { flags: 'wx' });
    const zlibStream = zlib[`create${action}`]();

    await streamPromises.pipeline(readStream, zlibStream, writeStream);
    // remove src file
    if (deleteSource) {
      await fs.promises.unlink(srcFile);
    }
  } catch (err) {
    // clean up if failed
    if (justCreated) {
      await removeDir(dstDir);
    }
    throw err;
  }
};

/**
 * @param {string} src 
 * @param {string} dst 
 */
export const compressBrotli = async (src, dst) => {
  await compressDecompressFile(src, dst, {
    action: 'BrotliCompress',
    deleteSource: true
  });
}

/**
 * @param {string} src 
 * @param {string} dst 
 */
export const decompressBrotli = async (src, dst) => {
  await compressDecompressFile(src, dst, {
    action: 'BrotliDecompress',
    deleteSource: true
  });
}