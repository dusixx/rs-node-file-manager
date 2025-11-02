import fs from 'fs';
import path from 'path';
import streamPromises from 'stream/promises';
import zlib from 'zlib';
import { checkPath, createDir, isFileExists, removeDir, resolvePath } from './fs.js';

const MethodExtensionMap = {
  BrotliCompress: '.br',
  BrotliDecompress: '',
  ZstdCompress: '.zst',
  ZstdDecompress: '.zst',
  Gzip: '.gz',
  Gunzip: '',
}

/**
 * @param {string} srcFile 
 * @param {string} dstFile 
 */
const validatePaths = async (srcFile, dstFile) => {
  let wasDstDirJustCreated = false;
  srcFile = resolvePath(srcFile);
  dstFile = resolvePath(dstFile);

  if (!await isFileExists(srcFile)) {
    throw Error(`no such file: ${srcFile}`);
  }
  const dstDir = path.dirname(dstFile);
  const dstInfo = await checkPath(dstDir);
  if (dstInfo.isFile) {
    throw Error(`not a directory: ${dstDir}`);
  }
  // create if does not exists
  if (!dstInfo.exists) {
    await createDir(dstDir);
    wasDstDirJustCreated = true;
  }
  return { srcFile, dstFile, dstDir, wasDstDirJustCreated };
}

/**
 * @typedef {keyof typeof MethodExtensionMap} CompressionMethod
 * @typedef {{ method: CompressionMethod, deleteSource: boolean, appendExtension: boolean }} CompressionOptions
 * @param {string} srcFilePath
 * @param {string} dstFilePath
 * @param {CompressionOptions} options
 */
export const compressDecompressFile = async (srcFilePath, dstFilePath, {
  method,
  deleteSource = true,
  appendExtension = true
} = {}) => {
  if (!Object.hasOwn(MethodExtensionMap, method)) {
    throw Error(`unsupported method: ${method}`);
  }
  let { wasDstDirJustCreated, srcFile, dstFile, dstDir } = await validatePaths(srcFilePath, dstFilePath);

  // append ext for compressed file if needed
  if (appendExtension) {
    const ext = MethodExtensionMap[method];
    if (path.extname(dstFile) !== ext) {
      dstFile += ext ?? '';
    }
  }
  let writeStream;
  try {
    const zlibStream = zlib[`create${method}`]();
    const readStream = fs.createReadStream(srcFile);
    writeStream = fs.createWriteStream(dstFile, { flags: 'wx' });

    await streamPromises.pipeline(readStream, zlibStream, writeStream);
    // remove src file
    if (deleteSource) {
      await fs.promises.unlink(srcFile);
    }
  } catch (err) {
    // clean up if failed
    if (wasDstDirJustCreated) {
      await removeDir(dstDir);
    } else {
      writeStream?.on('error', async () => {
        if (dstFile !== srcFile) {
          await fs.promises.unlink(dstFile);
        }
      });
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
    method: 'BrotliCompress',
    deleteSource: true
  });
}

/**
 * @param {string} src 
 * @param {string} dst 
 */
export const decompressBrotli = async (src, dst) => {
  await compressDecompressFile(src, dst, {
    method: 'BrotliDecompress',
    deleteSource: true
  });
}